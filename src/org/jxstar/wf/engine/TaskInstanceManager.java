/*
 * TaskInstanceManager.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.engine;

import java.util.List;
import java.util.Map;

import org.jxstar.service.util.TaskUtil;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.define.WfDefineDao;
import org.jxstar.wf.invoke.StatusCode;

/**
 * 任务实例管理类，负责任务实例创建、任务查询；负责任务分配；
 * 负责构建过程运行上下文对象，是单例对象。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class TaskInstanceManager {
	//任务实例DAO
	private TaskInstanceDao _taskDao = TaskInstanceDao.getInstance();
	private static TaskInstanceManager _instance = new TaskInstanceManager();

	private TaskInstanceManager(){}
	/**
	 * 构建单例对象。
	 * @return
	 */
	public static TaskInstanceManager getInstance() {
		return _instance;
	}
	
	/**
	 * 创建任务实例，并解析受限时间与任务描述。
	 * @param processInstance -- 过程实例
	 * @param mpNodeAttr -- 任务属性
	 * @return
	 */
	public TaskInstance createTask(ProcessInstance processInstance, 
			Map<String,String> mpNodeAttr) {
		TaskInstance task = new TaskInstance();
		
		//取当前任务对应的功能ID，如果任务属性中没有设置则取过程定义的功能ID
		String funId = mpNodeAttr.get("fun_id");
		if (funId == null || funId.length() == 0) {
			funId = processInstance.getFunId();
		}
		
		//计算受限时间值
		String limitValue = mpNodeAttr.get("limit_value");
		String limitDate = TaskUtil.parseLimitDate(limitValue);
		
		//解析任务描述
		String taskDesc = parseTaskDesc(processInstance, mpNodeAttr);
		
		//取节点名称
		String nodeTitle = getNodeTitle(mpNodeAttr);
		
		//取必须同意人数
		String agreeNum = MapUtil.getValue(mpNodeAttr, "agree_num", "0");
		
		//设置任务基础信息
		task.setProcessId(processInstance.getProcessId());
		task.setNodeId(mpNodeAttr.get("node_id"));
		task.setNodeTitle(nodeTitle);
		task.setFunId(funId);
		task.setDataId(processInstance.getDataId());
		task.setInstanceId(processInstance.getInstanceId());
		task.setRunState(StatusCode.TASK_CREATED);
		task.setStartDate(DateUtil.getTodaySec());
		task.setLimitDate(limitDate);
		task.setTaskDesc(taskDesc);
		task.setAgreeNum(agreeNum);
		task.setHasEmail(mpNodeAttr.get("send_email"));
		task.setNoteType(mpNodeAttr.get("note_type"));
		
		return task;
	}
	
	/**
	 * 根据过程实例数据创建过程上下文对象，
	 * 包括过程实例、标记对象、任务实例。
	 * @param mpTask -- 任务实例数据
	 * @return ProcessContext
	 * @throws WfException
	 */
	public ProcessContext createExecutedContext(Map<String,String> mpTask) throws WfException {
		//恢复任务实例对象
		TaskInstance task = restoreTask(mpTask);
		
		//恢复过程实例对象
		ProcessInstanceManager manager = ProcessInstanceManager.getInstance();
		String instanceId = task.getInstanceId();
		ProcessInstance instance = manager.restoreInstance(instanceId);
		
		//恢复过程标记对象
		TokenDao tokenDao = TokenDao.getInstance();
		String nodeId = task.getNodeId();
		Token token = tokenDao.restoreToken(instanceId, nodeId);
		
		//创建过程实例上下文对象
		ProcessContext context = new ProcessContext();
		context.setToken(token);
		context.setTaskInstance(task);
		context.setProcessInstance(instance);
		
		return context;
	}
	
	/**
	 * 查询所有已执行的任务实例，并立即修改状态为完成，避免重复查询；
	 * 创建的对象是过程上下文，包含过程实例、标记对象、任务实例。
	 * @return List<ProcessContext>
	 * @throws WfException
	 */
	public List<ProcessContext> queryDoneTask() throws WfException {
		List<ProcessContext> lsContext = FactoryUtil.newList();
		
		List<Map<String,String>> lsData;
		//采用类锁，保证查询与更新是同时完成
		synchronized(TaskInstanceManager.class) {
			//查询已执行的实例数据，只查询需要异步执行的过程实例
			lsData = _taskDao.queryDoneTask();
			if (lsData.isEmpty()) {
				return lsContext;
			}
			
			//修改已执行任务的状态为“完成”，避免重复查询
			if (!_taskDao.updateState(lsData)) {
				//"更新已执行任务的状态为“完成”失败！"
				throw new WfException(JsMessage.getValue("taskmng.uperror"));
			}
		}
		
		//根据任务实例数据创建上下文对象
		for (int i = 0, n = lsData.size(); i < n; i++) {
			Map<String,String> mpData = lsData.get(i);
			
			lsContext.add(createExecutedContext(mpData));
		}
		
		return lsContext;
	}

	/**
	 * 根据任务实例数据恢复实例对象。
	 * @param mpTask -- 任务实例数据
	 * @return
	 */
	private TaskInstance restoreTask(Map<String,String> mpTask) throws WfException {
		TaskInstance task = new TaskInstance();
		//恢复任务实例的基础信息
		task.setProcessId(mpTask.get("process_id"));
		task.setNodeId(mpTask.get("node_id"));
		task.setNodeTitle(mpTask.get("node_title"));
		task.setFunId(mpTask.get("fun_id"));
		task.setDataId(mpTask.get("data_id"));
		task.setInstanceId(mpTask.get("instance_id"));
		task.setTaskId(mpTask.get("task_id"));
		task.setRunState(mpTask.get("run_state"));
		task.setStartDate(mpTask.get("start_date"));
		task.setLimitDate(mpTask.get("limit_date"));
		task.setEndDate(mpTask.get("end_date"));
		task.setTaskDesc(mpTask.get("task_desc"));
		task.setHasEmail(mpTask.get("has_email"));
		task.setNoteType(mpTask.get("note_type"));
		task.setIsTimeout(mpTask.get("is_timeout"));
		task.setAgreeNum(mpTask.get("agree_num"));
		//设置任务执行信息
		task.setCheckUserId(mpTask.get("check_userid"));
		task.setCheckUserName(mpTask.get("check_name"));
		task.setCheckDate(mpTask.get("check_date"));
		task.setCheckType(mpTask.get("check_type"));
		task.setCheckDesc(mpTask.get("check_desc"));
		task.setNextNodeId(mpTask.get("next_nodeid"));
		task.setNextUserId(mpTask.get("next_userid"));
		task.setNextUser(mpTask.get("next_user"));
		task.setDealDesc(mpTask.get("deal_desc"));

		return task;
	}
	
	/**
	 * 取节点名称
	 * @param mpNodeAttr
	 * @return
	 */
	private String getNodeTitle(Map<String,String> mpNodeAttr) {
		String nodeId = mpNodeAttr.get("node_id");
		String processId = mpNodeAttr.get("process_id");
		
		WfDefineDao define = WfDefineDao.getInstance();
		Map<String,String> mpNode = define.queryNode(processId, nodeId);
		
		return MapUtil.getValue(mpNode, "node_title");
	}
	
	/**
	 * 解析任务消息，任务消息中的参数可以是应用记录中的数据，
	 * 参数格式为：{field_name}
	 * @param instance -- 过程实例
	 * @param mpNodeAttr -- 任务属性定义
	 * @return
	 */
	private String parseTaskDesc(ProcessInstance instance, 
			Map<String,String> mpNodeAttr) {
		String taskDesc = mpNodeAttr.get("task_desc");
		
		//设置任务描述的缺省值
		if (taskDesc == null || taskDesc.length() == 0) {
			//"您有一项新的【{0}】任务！";
			taskDesc = JsMessage.getValue("taskutil.newtask", instance.getProcessName());
			return taskDesc;
		}
		
		//取应用数据
		Map<String,String> appData = instance.getAppData();
		
		return TaskUtil.parseAppField(taskDesc, appData, false);
	}
}
