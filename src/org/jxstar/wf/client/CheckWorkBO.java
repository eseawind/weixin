/*
 * CheckWorkBO.java 2011-2-11
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.client;

import java.util.List;
import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.MapUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.define.WfDefineDao;
import org.jxstar.wf.engine.ProcessInstanceDao;
import org.jxstar.wf.engine.TaskInstanceDao;

/**
 * 审批工作界面中需要处理的内容。
 *
 * @author TonyTan
 * @version 1.0, 2011-2-11
 */
public class CheckWorkBO extends BusinessObject {
	private static final long serialVersionUID = -5253180697404078242L;

	/**
	 * check_work.js中打开完成分配任务界面时需要调用：
	 * 1、检查任务是否已执行，如果已执行，则返回提示信息；
	 * 2、取节点设置信息：可否决、可完成；
	 * @param request
	 * @return
	 */
	public String checkTask(RequestContext request) {
		TaskInstanceDao taskDao = TaskInstanceDao.getInstance();
		
		//取任务信息
		Map<String,String> mpTask = null;
		String taskId = request.getRequestValue("taskid");
		if (taskId.length() > 0) {
			mpTask = taskDao.queryTask(taskId);
		} else {
			String userId = getUserId(request);
			String funId = request.getRequestValue("check_funid");
			String dataId = request.getRequestValue("keyid");
			mpTask = taskDao.queryTaskByAssign(funId, dataId, userId);
		}
		
		if (mpTask.isEmpty()) {//"分配任务已执行完成，不需要处理！"
			setMessage(JsMessage.getValue("checkworkbo.notask"));
			return _returnFaild;
		}
		
		//String runState = mpTask.get("run_state");
		//if (!runState.equals(StatusCode.TASK_CREATED)) {
		taskId = mpTask.get("task_id");
		//由于多人审批节点的任务实例会执行多次，所以采用分配消息的状态来判断
		String runState = taskDao.queryAssignState(taskId, getUserId(request));
		if (!runState.equals("0")) {
			setMessage(JsMessage.getValue("checkworkbo.notask"));
			return _returnFaild;
		}
		
		//取任务节点属性
		String nodeId = mpTask.get("node_id");
		String processId = mpTask.get("process_id");
		
		WfDefineDao defineDao = WfDefineDao.getInstance();
		Map<String,String> mpNodeAttr = defineDao.queryNodeAttr(processId, nodeId);
		if (mpNodeAttr.isEmpty()) {//"没有找到当前任务的节点属性信息，不能完成任务！"
			setMessage(JsMessage.getValue("checkworkbo.nonode"));
			return _returnFaild;
		}
		
		//是否可以否决
		String hasNo = mpNodeAttr.get("has_no");
		//是否可以完成
		String hasComplete = mpNodeAttr.get("has_complete");
		//是否多人审批节点
		String mustAgreeNum = mpNodeAttr.get("agree_num");
		
		//取任务ID与过程实例ID
		taskId = mpTask.get("task_id");
		String instanceId = mpTask.get("instance_id");
		
		//返回信息到前台
		String json = "{hasNo:'"+ hasNo +"', hasComplete:'"+ hasComplete +"', " +
						"mustAgreeNum:'"+ mustAgreeNum +"', " +
						"taskId:'"+ taskId +"', instanceId:'"+ instanceId +"'}";
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * check_assign.js中打开查看任务分配界面时需要调用：
	 * 查询当前数据的任务记录。
	 * @param request
	 * @return
	 */
	public String queryTask(RequestContext request) {
		TaskInstanceDao taskDao = TaskInstanceDao.getInstance();
		
		//取任务信息
		String funId = request.getRequestValue("check_funid");
		String dataId = request.getRequestValue("keyid");
		List<Map<String,String>> lsTask = taskDao.queryTaskByDataId(funId, dataId);

		String taskIds = "";
		if (!lsTask.isEmpty()) {
			//取任务ID数组
			StringBuilder sbTaskId = new StringBuilder();
			for (int i = 0, n = lsTask.size(); i < n; i++) {
				Map<String,String> mpTask = lsTask.get(i);
				
				String taskId = mpTask.get("task_id");
				sbTaskId.append(taskId).append(",");
			}
			taskIds = sbTaskId.substring(0, sbTaskId.length()-1);
		} else {//"任务执行完成，没有【{0}】功能，记录【{1}】的待办任务！"
			_log.showDebug(JsMessage.getValue("checkworkbo.taskend"), funId, dataId);
		}

		//返回信息到前台
		String json = "{taskIds:'"+ taskIds +"'}";
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 取当前节点的可以编辑字段信息
	 * @param funId -- 功能ID
	 * @param dataId -- 数据ID
	 * @return
	 */
	public String queryCheckEdit(String funId, String dataId) {
		String editFields = "";
		TaskInstanceDao taskDao = TaskInstanceDao.getInstance();
		List<Map<String,String>> lsTask = taskDao.queryTaskByDataId(funId, dataId);
		if (!lsTask.isEmpty()) {
			//取节点ID与过程ID
			String nodeId = lsTask.get(0).get("node_id");
			String processId = lsTask.get(0).get("process_id");
			
			//取当前节点是否定义了可编辑字段
			WfDefineDao defineDao = WfDefineDao.getInstance();
			Map<String,String> mpNodeAttr = defineDao.queryNodeAttr(processId, nodeId);
			editFields = mpNodeAttr.get("edit_field");
		}
		
		//返回信息到前台
		String json = "{editFields:'"+ editFields +"'}";
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * check_map.js中打开查看流程图界面时需要调用：
	 * 查询当前过程的节点ID与过程名称。
	 * @param request
	 * @return
	 */
	public String queryNode(RequestContext request) {
		TaskInstanceDao taskDao = TaskInstanceDao.getInstance();
		
		//取任务信息
		String funId = request.getRequestValue("check_funid");
		String dataId = request.getRequestValue("keyid");
		List<Map<String,String>> lsTask = taskDao.queryTaskByDataId(funId, dataId);

		Map<String,String> mpDefine = null;
		WfDefineDao defineDao = WfDefineDao.getInstance();
		
		String nodeIds = "", processId = "", processName = "";
		if (!lsTask.isEmpty()) {
			//取节点ID值
			StringBuilder sbNodeId = new StringBuilder();
			for (int i = 0, n = lsTask.size(); i < n; i++) {
				Map<String,String> mpTask = lsTask.get(i);
				
				String nodeId = mpTask.get("node_id");
				sbNodeId.append(nodeId).append(",");
			}
			nodeIds = sbNodeId.substring(0, sbNodeId.length()-1);
			
			processId = lsTask.get(0).get("process_id");
			mpDefine = defineDao.queryProcess(processId);
			processName = MapUtil.getValue(mpDefine, "process_name");
		} else {//"任务执行完成，没有【{0}】功能，记录【{1}】的待办任务！"
			_log.showDebug(JsMessage.getValue("checkworkbo.taskend"), funId, dataId);
			
			mpDefine = defineDao.queryProcessByFunId(funId);
			processId = MapUtil.getValue(mpDefine, "process_id");
			processName = MapUtil.getValue(mpDefine, "process_name");
			
			ProcessInstanceDao insdao = ProcessInstanceDao.getInstance();
			if (insdao.hasHisInstance(processId, dataId)) {
				//取结束节点信息
				nodeIds = defineDao.queryEndNodeId(processId);
			} else {
				//取开始节点信息
				nodeIds = defineDao.queryStartNodeId(processId);
			}
		}
		
		if (mpDefine.isEmpty()) {//"功能【{0}】没有有效的过程定义！"
			setMessage(JsMessage.getValue("checkworkbo.noprocess"), funId);
			return _returnFaild;
		}

		//返回信息到前台
		String json = "{nodeIds:'"+ nodeIds +"', processId:'"+ processId +"', processName:'"+ processName +"'}";
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 从请求对象中取用户ID
	 * @param request
	 * @return
	 */
	private String getUserId(RequestContext request) {
		Map<String,String> mpUser = request.getUserInfo();
		
		return MapUtil.getValue(mpUser, "user_id");
	}
}
