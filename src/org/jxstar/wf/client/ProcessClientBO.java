/*
 * ProcessClientBO.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.client;

import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.util.resource.JsParam;
import org.jxstar.wf.WfException;
import org.jxstar.wf.define.WfDefineDao;
import org.jxstar.wf.engine.ProcessContext;
import org.jxstar.wf.engine.ProcessInstance;
import org.jxstar.wf.engine.ProcessInstanceManager;
import org.jxstar.wf.engine.TaskInstance;
import org.jxstar.wf.engine.TaskInstanceDao;
import org.jxstar.wf.engine.Token;
import org.jxstar.wf.engine.TokenDao;
import org.jxstar.wf.util.ProcessUtil;

/**
 * 过程实例客户端，是应用程序与工作组件交互对象。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class ProcessClientBO extends BusinessObject {
	private static final long serialVersionUID = -6406373057929422076L;
	
	/**
	 * 创建过程实例，在签字后事件中调用。
	 * @param request -- 服务请求对象
	 * @return
	 */
	public String createProcess(RequestContext request) {
		String funId = request.getFunID();
		if (!ProcessUtil.isNeedWf(funId)) {
			_log.showDebug("【{0}】功能定义中的“有效记录值”不是“审批通过”，不会执行流程启动检查！", funId);
			return _returnSuccess;
		}
		
		String[] dataIds = request.getRequestValues(JsParam.KEYID);
		if (dataIds == null || dataIds.length == 0 ) {
			//"没有找到审批记录ID！"
			setMessage(JsMessage.getValue("processclientbo.noid"));
			return _returnFaild;
		}
		
		//取当前用户信息
		Map<String,String> mpUser = request.getUserInfo();
		if (mpUser == null || mpUser.isEmpty()) {//"没有找到审批用户信息！"
			setMessage(JsMessage.getValue("processclientbo.nouser"));
			return _returnFaild;
		}
		
		return createProcess(funId, dataIds, mpUser);
	}

	/**
	 * 创建过程实例，在签字后事件中调用，处理内容有：
	 * 1、先检查当前功能是否定义有效审批流程，并取过程定义信息；
	 * 2、创建过程实例对象；
	 * 3、调用过程实例的创建方法；
	 * 
	 * @param funId -- 功能ID
	 * @param dataIds -- 记录主键值数组，支持多条记录签字
	 * @param mpUser -- 当前用户
	 * @return
	 */
	private String createProcess(String funId, String[] dataIds, Map<String,String> mpUser) {
		//先检查当前功能是否定义有效审批流程，并取过程定义信息
		Map<String,String> mpDefine = queryWfDefine(funId);
		if (mpDefine.isEmpty()) {//"功能【{0}】没有定义审批流程！"
			_log.showDebug(JsMessage.getValue("processclientbo.noprocess"), funId);
			return _returnSuccess;
		}
		
		//取过程定义中是否延时启动，缺省是直接启动
		String exeDelay = MapUtil.getValue(mpDefine, "exe_delay", "0");
		//是否过程实例创建后延时启动，缺省是直接启动
		String isDelay = SystemVar.getValue("wf.instance.delay");
		
		for (int i = 0, n = dataIds.length; i < n; i++) {
			String dataId = dataIds[i];
			//取应用数据
			Map<String,String> mpData = ProcessUtil.queryFunData(funId, dataId);
			if (mpData.isEmpty()) {//"没有找到应用数据！"
				setMessage(JsMessage.getValue("processclientbo.nodata"));
				return _returnFaild;
			}
			
			//创建过程实例对象
			ProcessInstanceManager manager = ProcessInstanceManager.getInstance();
			ProcessInstance instance = manager.createProcess(dataId, mpUser, mpData, mpDefine);
			
			//调用过程实例的创建方法
			try {
				instance.create();
				
				if (isDelay.equals("0") || exeDelay.equals("0")) {
					ProcessContext context = manager.createInitContext(instance);
					instance.startup(context);
				}
			} catch (WfException e) {
				_log.showError(e);
				setMessage(e.getMessage());
				return _returnFaild;
			}
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 执行过程实例，在用户收到分配消息后，对任务操作后执行，处理内容有：
	 * 1、先创建过程实例上下文对象，包括：过程实例、标记对象、任务实例；
	 * 2、然后执行过程实例；
	 * 
	 * 支持同时审批多条件记录，都采用相同的审批意见。
	 * 
	 * @param request -- 服务请求对象
	 * @return
	 */
	public String executeProcess(RequestContext request) {
		try {
			ProcessContext[] contexts = toProcessContext(request);
			
			//取过程定义中是否延时启动，缺省是直接启动
			String funId = request.getRequestValue("check_funid");
			String exeDelay = MapUtil.getValue(queryWfDefine(funId), "exe_delay", "0");
			//是否任务实例执行后延时完成，缺省是直接完成
			String isDelay = SystemVar.getValue("wf.instance.delay");
			_log.showDebug("..........exe_delay=" + exeDelay + ";wf.instance.delay=" + isDelay);
			
			for (int i = 0, n = contexts.length; i < n; i++) {
				ProcessInstance instance = contexts[i].getProcessInstance();
				instance.execute(contexts[i]);
				
				if (isDelay.equals("0") || exeDelay.equals("0")) {
					TaskInstance task = contexts[i].getTaskInstance();
					task.complete(contexts[i]);
				}
			}
		} catch (WfException e) {
			_log.showError(e);
			setMessage(e.getMessage());
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 审批取回功能，实现方法是进入最近一个已处理的任务节点，处理步骤：
	 * 1、先判断过程实例中最近一条历史任务的处理人必须是当前人；
	 * 2、给新任务信息注释为被取回，保存到任务处理历史中；
	 * 3、进入指定的任务节点中；
	 * @param request
	 * @return
	 */
	public String returnProcess(RequestContext request) {
		String[] taskIds = request.getRequestValues("taskid");
		if (taskIds == null || taskIds.length == 0) {
			setMessage("没有找到取回审批的任务实例！");
			return _returnFaild;
		}
		
		String instanceId = ProcessUtil.getInstanceId(taskIds[0]);
		String userId = MapUtil.getValue(request.getUserInfo(), "user_id");
		try {
			//如果是发起人取回审批，则删除所有数据，记录状态改为未提交
			if (!ProcessUtil.isStarted(instanceId)) {
				if (!ProcessUtil.equalStartUser(instanceId, userId)) {
					setMessage("当前操作员不是审批提交人，不能撤回审批！");
					return _returnFaild;
				}
				
				if (!ProcessUtil.updateAudit(instanceId)) {
					setMessage("修改业务记录状态为“未提交”出错！");
					return _returnFaild;
				}
				
				if (!ProcessUtil.deleteInstance(instanceId)) {
					setMessage("删除过程实例相关数据出错！");
					return _returnFaild;
				}
				
				return _returnSuccess;
			}
			
			String retNodeId = checkReturnTask(request);
			if (retNodeId == null || retNodeId.length() == 0) {
				setMessage("没有找到取回的任务节点，不能取回！");
				return _returnFaild;
			}
			
			//进入指定的任务节点
			request.setRequestValue("next_nodeid", retNodeId);
			ProcessContext[] contexts = toProcessContext(request);
			
			//不做异步处理，直接执行，方便检验效果
			for (int i = 0, n = contexts.length; i < n; i++) {
				ProcessInstance instance = contexts[i].getProcessInstance();
				instance.execute(contexts[i]);
				
				TaskInstance task = contexts[i].getTaskInstance();
				task.complete(contexts[i]);
			}
		} catch (WfException e) {
			_log.showError(e);
			setMessage(e.getMessage());
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 检查取回人是否合法，并返回退回节点ID。
	 * 注意：如果是选择多条记录，且退回节点不同，这种情况没有处理。由于这种情况极少，暂不处理。
	 * @param request
	 * @return
	 * @throws WfException
	 */
	private String checkReturnTask(RequestContext request) throws WfException {
		String retNodeId = "";
		//取当前用户信息
		String userId = request.getUserInfo().get("user_id");
		//取审批功能ID与数据ID
		String funId = request.getRequestValue("check_funid");
		String[] dataIds = request.getRequestValues(JsParam.KEYID);
		if (dataIds == null || dataIds.length == 0 ) {//"没有找到审批记录ID！"
			throw new WfException(JsMessage.getValue("processclientbo.noid"));
		}
		
		TaskInstanceDao taskDao = TaskInstanceDao.getInstance();
		
		for (int i = 0, n = dataIds.length; i < n; i++) {
			//查询最近一条历史审批任务信息
			Map<String,String> mpTask = taskDao.queryHisTask(funId, dataIds[i]);
			if (mpTask.isEmpty()) {//没有找到已办任务实例！
				throw new WfException(JsMessage.getValue("processclientbo.nohistask"));
			}
			
			String checkUserId = mpTask.get("check_userid");
			if (!userId.equals(checkUserId)) {
				String checkUser = mpTask.get("check_user");
				//【{0}】记录的上次审批人【{1}】不是当前用户，不能取回！
				throw new WfException(JsMessage.getValue("processclientbo.notcuruser"), dataIds[i], checkUser);
			}
			
			//取将要退回的节点
			retNodeId = mpTask.get("node_id");
		}
		
		return retNodeId;
	}
	
	/**
	 * 服务请求对象转换为过程实例上下文对象，创建：过程实例、标记对象、任务实例。
	 * @param request -- 服务请求对象
	 * @return
	 */
	private ProcessContext[] toProcessContext(RequestContext request) throws WfException {
		//恢复任务实例对象
		TaskInstance[] tasks = restoreTask(request);
		
		TokenDao tokenDao = TokenDao.getInstance();
		TaskInstanceDao taskDao = TaskInstanceDao.getInstance();
		ProcessInstanceManager manager = ProcessInstanceManager.getInstance();
		
		//取当前用户ID
		String userId = request.getUserInfo().get("user_id");
		
		//创建多个上下文对象
		ProcessContext[] retContexts = new ProcessContext[tasks.length];
		for (int i = 0, n = tasks.length; i < n; i++) {
			//检验任务状态是否为初始化
			String taskState = tasks[i].getRunState();
			//if (!runState.equals(StatusCode.TASK_CREATED)) {
			//由于多人审批节点的任务实例会执行多次，所以采用分配消息的状态来判断
			String taskId = tasks[i].getTaskId();
			String runState = taskDao.queryAssignState(taskId, userId);
			//添加taskState判断，是支持“退回”操作，因为退回时当前人是没有分配消息
			if (!runState.equals("0") && !taskState.equals("0")) {
				//"分配任务【{0}】已执行完成，不需要处理！"
				throw new WfException(JsMessage.getValue("processclientbo.donot"), 
						tasks[i].getTaskId());
			}
			
			//恢复过程实例对象
			String instanceId = tasks[i].getInstanceId();
			ProcessInstance instance = manager.restoreInstance(instanceId);
			
			//恢复过程标记对象
			String nodeId = tasks[i].getNodeId();
			Token token = tokenDao.restoreToken(instanceId, nodeId);
			
			//创建过程实例上下文对象
			ProcessContext context = new ProcessContext();
			context.setToken(token);
			context.setTaskInstance(tasks[i]);
			context.setProcessInstance(instance);
			
			retContexts[i] = context;
		}
		
		return retContexts;
	}
	
	/**
	 * 根据服务请求对象恢复任务实例对象。
	 * @param request -- 服务请求对象
	 * @return
	 */
	private TaskInstance[] restoreTask(RequestContext request) throws WfException {
		//取当前用户信息
		Map<String,String> mpUser = request.getUserInfo();
		if (mpUser == null || mpUser.isEmpty()) {//"没有找到审批用户信息！"
			throw new WfException(JsMessage.getValue("processclientbo.nouser"));
		}
		String userId = mpUser.get("user_id");
		
		//取审批执行信息
		Map<String,String> mpCheck = request.getUserInfo();
		mpCheck.put("check_type", request.getRequestValue("check_type"));
		mpCheck.put("check_desc", request.getRequestValue("check_desc"));
		mpCheck.put("next_nodeid", request.getRequestValue("next_nodeid"));
		mpCheck.put("next_userid", request.getRequestValue("next_userid"));
		mpCheck.put("next_user", request.getRequestValue("next_user"));
		mpCheck.put("deal_desc", request.getRequestValue("deal_desc"));
		
		TaskInstanceDao taskDao = TaskInstanceDao.getInstance();
		
		//取任务ID，如果指定了任务ID，则说明是审批一条记录，如果是审批任务取回，则可能是多条
		String[] taskIds = request.getRequestValues("taskid");
		if (taskIds != null && taskIds.length > 0) {
			TaskInstance[] retTasks = new TaskInstance[taskIds.length];
			for (int i = 0, n = retTasks.length; i < n; i++) {
				Map<String,String> mpTask = taskDao.queryTask(taskIds[i]);
				if (mpTask.isEmpty()) {//"没有找到【{0}】任务实例数据！"
					throw new WfException(JsMessage.getValue("processclientbo.notask"), taskIds[i]);
				}
				
				retTasks[i] = restoreTask(mpTask, mpCheck, mpUser);
			}
			return retTasks;
		}
		
		//取审批功能ID与数据ID
		String funId = request.getRequestValue("check_funid");
		String[] dataIds = request.getRequestValues(JsParam.KEYID);
		if (dataIds == null || dataIds.length == 0 ) {//"没有找到审批记录ID！"
			throw new WfException(JsMessage.getValue("processclientbo.noid"));
		}
		
		//创建多个任务实例对象
		TaskInstance[] retTasks = new TaskInstance[dataIds.length];
		for (int i = 0, n = dataIds.length; i < n; i++) {
			//根据功能ID与数据ID查询任务实例数据
			Map<String,String> mpTask = taskDao.queryTaskByAssign(funId, dataIds[i], userId);
			if (mpTask.isEmpty()) {//"分配任务已执行完成，不需要处理！"
				throw new WfException(JsMessage.getValue("processclientbo.taskend"));
			}
			
			retTasks[i] = restoreTask(mpTask, mpCheck, mpUser);
		}

		return retTasks;
	}
	
	/**
	 * 根据任务信息创建实例对象。
	 * @param mpTask -- 初始化的任务信息
	 * @param request -- 取任务完成信息
	 * @return
	 * @throws WfException
	 */
	private TaskInstance restoreTask(Map<String,String> mpTask, 
			Map<String,String> mpCheck,
			Map<String,String> mpUser) throws WfException {
		TaskInstance task = new TaskInstance();
		//恢复任务实例的基础信息
		task.setProcessId(MapUtil.getValue(mpTask, "process_id"));
		task.setNodeId(MapUtil.getValue(mpTask, "node_id"));
		task.setNodeTitle(MapUtil.getValue(mpTask, "node_title"));
		task.setFunId(MapUtil.getValue(mpTask, "fun_id"));
		task.setDataId(MapUtil.getValue(mpTask, "data_id"));
		task.setInstanceId(MapUtil.getValue(mpTask, "instance_id"));
		task.setTaskId(MapUtil.getValue(mpTask, "task_id"));
		task.setRunState(MapUtil.getValue(mpTask, "run_state"));
		task.setStartDate(MapUtil.getValue(mpTask, "start_date"));
		task.setLimitDate(MapUtil.getValue(mpTask, "limit_date"));
		task.setEndDate(MapUtil.getValue(mpTask, "end_date"));
		task.setTaskDesc(MapUtil.getValue(mpTask, "task_desc"));
		task.setAgreeNum(MapUtil.getValue(mpTask, "agree_num"));
		task.setHasEmail(MapUtil.getValue(mpTask, "has_email"));
		task.setNoteType(MapUtil.getValue(mpTask, "note_type"));
		task.setIsTimeout(MapUtil.getValue(mpTask, "is_timeout"));
		//设置任务执行信息
		task.setCheckUserId(MapUtil.getValue(mpUser, "user_id"));
		task.setCheckUserName(MapUtil.getValue(mpUser, "user_name"));
		task.setCheckDate(DateUtil.getTodaySec());
		task.setCheckType(MapUtil.getValue(mpCheck, "check_type"));
		task.setCheckDesc(MapUtil.getValue(mpCheck, "check_desc"));
		task.setNextNodeId(MapUtil.getValue(mpCheck, "next_nodeid"));
		task.setNextUserId(MapUtil.getValue(mpCheck, "next_userid"));
		task.setNextUser(MapUtil.getValue(mpCheck, "next_user"));
		task.setDealDesc(MapUtil.getValue(mpCheck, "deal_desc"));
		
		return task;
	}
	
	/**
	 * 根据功能ID取有效的过程定义信息
	 * @param funId -- 功能ID
	 * @return
	 */
	private Map<String,String> queryWfDefine(String funId) {
		WfDefineDao defineDao = WfDefineDao.getInstance();
		return defineDao.queryProcessByFunId(funId);
	}
}
