/*
 * ProcessInstance.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.engine;

import java.util.Map;

import org.jxstar.util.log.Log;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.define.Node;
import org.jxstar.wf.define.WfDefineManager;
import org.jxstar.wf.invoke.EventAgent;
import org.jxstar.wf.invoke.EventCode;
import org.jxstar.wf.invoke.StatusCode;

/**
 * 过程实例对象：是过程运行时的对象。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class ProcessInstance {
	private Log _log = Log.getInstance();
	//负责维护过程实例数据信息
	private ProcessInstanceDao instanceDao = ProcessInstanceDao.getInstance();
	//业务记录数据，MAP对象，用于解析任务描述中的字段参数。
	private Map<String,String> appData = null;
	//事件触发执行类
	private EventAgent eventAgent = EventAgent.getInstance();
	
	/**
	 * 创建过程实例，状态为“初始化”；由过程客户端程序调用。
	 * @throws WfException
	 */
	public void create() throws WfException {
		//初始化的过程实例信息保存到数据库中
		if (!instanceDao.insertProcess(this)) {
			//"新增初始化的过程实例到数据库中失败！"
			throw new WfException(JsMessage.getValue("process.newerror"));
		}
		
		//创建过程上下文
		ProcessContext context = new ProcessContext();
		context.setProcessInstance(this);
		
		//触发初始化事件
		if (!isSubProcess()) {
			eventAgent.fireEvent(EventCode.PROCESS_INITIATED, context);
		}
	}
		
	/**
	 * 启动过程实例，状态为“运行”；由过程实例处理机调用。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void startup(ProcessContext context) throws WfException {
		//保存新的标记对象
		if (!TokenDao.getInstance().insertToken(context)) {
			//"保存标记对象到数据库中失败！"
			throw new WfException(JsMessage.getValue("process.tokenerror"));
		}
		
		//执行开始节点
		Token token = context.getToken();
		token.getNode().enter(context);
		
		//如果是从开始节点没有经过审批节点，直接到了结束节点，则会出现这种情况
		if (this.runState.equals(StatusCode.PROCESS_COMPLETED)) {
			return;
		}
		
		//修改过程状态为启动
		if (!instanceDao.executeProcess(instanceId, StatusCode.PROCESS_RUNNING, "")) {
			//"修改过程状态为“启动”失败！"
			throw new WfException(JsMessage.getValue("process.errorqd"));
		}
		
		//修改实例状态
		setRunState(StatusCode.PROCESS_RUNNING);
		
		//触发启动事件
		if (!isSubProcess()) {
			eventAgent.fireEvent(EventCode.PROCESS_RUNNING, context);
		}
	}
	
	/**
	 * 执行过程实例，状态为“活动”；由过程客户端程序调用，完善任务执行信息，改变任务执行状态。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void execute(ProcessContext context) throws WfException {
		//"执行【{0}】过程实例【{1}】"
		_log.showDebug(JsMessage.getValue("process.do"), processName, instanceId);
		
		//执行任务实例
		TaskInstance taskInstance = context.getTaskInstance();
		taskInstance.execute(context);
		
		//过程实例第一次执行时触发激活事件
		if (!runState.equals(StatusCode.PROCESS_ACTIVE)) {
			if (!instanceDao.executeProcess(instanceId, StatusCode.PROCESS_ACTIVE, "")) {
				//"修改过程状态为“激活”失败！"
				throw new WfException(JsMessage.getValue("process.errorjh"));
			}
			
			//修改实例状态
			setRunState(StatusCode.PROCESS_ACTIVE);
			
			//触发激活事件
			if (!isSubProcess()) {
				eventAgent.fireEvent(EventCode.PROCESS_ACTIVE, context);
			}
		}
	}
	
	/**
	 * 完成过程实例，状态为“完成”，
	 * 如果是子过程实例，则需要回到父过程实例中继续执行；由结束节点调用。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void complete(ProcessContext context) throws WfException {
		//修改实例状态
		setRunState(StatusCode.PROCESS_COMPLETED);
		
		//实例信息保存到数据库中
		if (!instanceDao.completeProcess(this)) {//"修改过程状态为“完成”失败！"
			throw new WfException(JsMessage.getValue("process.errorok"));
		}
		
		//清理不再需要处理的任务
		TaskInstance task = context.getTaskInstance();
		if (task != null) task.clearOther();
		
		//触发完成事件
		if (!isSubProcess()) {
			eventAgent.fireEvent(EventCode.PROCESS_COMPLETED, context);
		}
		
		//如果是子过程，则进入父过程实例
		if (isSubProcess())	{
			intoParentProcess(context);
		}
	}
	
	/**
	 * 终止过程实例，状态为“终止”；由任务节点调用，在任务执行异常时调用。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void terminate(ProcessContext context) throws WfException {
		//修改实例状态
		setRunState(StatusCode.PROCESS_TERMINATED);
		
		//实例信息保存到数据库中
		if (!instanceDao.completeProcess(this)) {//"修改过程状态为“终止”失败！"
			throw new WfException(JsMessage.getValue("process.errorzz"));
		}
		
		//清理不再需要处理的任务
		TaskInstance task = context.getTaskInstance();
		if (task != null) task.clearOther();
		
		if (!isSubProcess()) {
			//触发终止事件
			eventAgent.fireEvent(EventCode.PROCESS_TERMINATED, context);
		} else {
			//触发父过程终止
			if (parentInstanceId == null || parentInstanceId.length() == 0) {
				//"当前过程实例不是子过程，找不到父实例ID！"
				throw new WfException(JsMessage.getValue("process.noparent"));
			}
			
			//构建父过程上下文对象
			ProcessContext parentContext = new ProcessContext();
			
			//恢复父过程实例
			ProcessInstance parentInstance = 
				ProcessInstanceManager.getInstance().restoreInstance(parentInstanceId);
			//把子过程实例的备注带入父实例
			String subDesc = getInstanceDesc();
			if (subDesc != null && subDesc.length() > 0) {//"子过程消息："
				parentInstance.setInstanceDesc(JsMessage.getValue("process.sub") + subDesc);
			}
			
			parentContext.setProcessInstance(parentInstance);
			//保留子过程终止时的任务，获取审批意见，如退回编辑人
			TaskInstance subTask = context.getTaskInstance();
			parentContext.setTaskInstance(subTask);
			
			//父过程实例终止
			parentInstance.terminate(parentContext);
		}
	}
	
	/**
	 * 挂起过程实例，状态为“挂起”；由等待节点调用，过程处于等待某事件的状态时挂起。
	 * 如果是挂起子过程，不需要考虑父过程，因为子过程没执行完父过程不会执行完的。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void suspend(ProcessContext context) throws WfException {
		//修改过程状态为挂起
		if (!instanceDao.executeProcess(instanceId, StatusCode.PROCESS_SUSPENDED, getInstanceDesc())) {
			//"修改过程状态为“挂起”失败！"
			throw new WfException(JsMessage.getValue("process.errorgq"));
		}
		
		//修改实例状态
		setRunState(StatusCode.PROCESS_SUSPENDED);
		
		if (!isSubProcess()) {
			//触发挂起事件
			eventAgent.fireEvent(EventCode.PROCESS_SUSPENDED, context);
		}
	}
	
	/**
	 * 恢复挂起的过程实例，状态为“活动”；由后台任务检查等待条件是否满足条件，如果满足后恢复执行。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void resume(ProcessContext context) throws WfException {
		//修改过程状态为活动
		if (!instanceDao.executeProcess(instanceId, StatusCode.PROCESS_ACTIVE, "")) {
			//"修改过程状态为“活动”失败！"
			throw new WfException(JsMessage.getValue("process.errorhd"));
		}
		
		//修改实例状态
		setRunState(StatusCode.PROCESS_ACTIVE);
		
		//不触发激活事件，因为不是第一次执行
	}
	
	/**
	 * 进入父过程实例，父节点是子过程节点，在leave方法中需要恢复父过程实例的上下文对象。
	 * @param context -- 过程上下文对象
	 */
	public void intoParentProcess(ProcessContext context) throws WfException {
		if (!isSubProcess() || parentNodeId == null || parentNodeId.length() == 0) {
			//"当前过程实例不是子过程，找不到父节点！"
			throw new WfException(JsMessage.getValue("process.nopnode"));
		}
		
		//创建父节点
		WfDefineManager manager = WfDefineManager.getInstance();
		Node parentNode = manager.createNode(parentProcessId, parentNodeId);
		
		//并继续向下流转
		parentNode.leave(context);
	}
	
	/**
	 * 获取开始节点对象。
	 * @return
	 */
	public Node getStartNode() {
		WfDefineManager manager = WfDefineManager.getInstance();
		return manager.createNode(processId, startNodeId);
	}
	
	/**
	 * 判断是否子过程实例。
	 * @return
	 */
	public boolean isSubProcess() {
		return (parentProcessId != null && parentProcessId.length() > 0);
	}

	/*****************  过程实例参数信息 ******************/
	private String 	processId;			//过程ID
	private String 	processName;		//过程名称
	private String 	funId;				//功能ID
	private String 	instanceId;			//实例ID
	private String 	dataId;				//数据ID
	private String 	startDate;			//开始时间
	private String 	startUserId;		//发起人ID
	private String 	startUserName;		//发起人
	private String 	startNodeId;		//开始节点
	private String 	parentNodeId;		//父节点
	private String 	parentProcessId;	//父过程ID
	private String 	parentInstanceId;	//父实例ID
	private String 	runState;			//实例状态
	private String 	endDate;			//结束时间
	private String 	instanceDesc;		//实例消息
	public String getDataId() {
		return dataId;
	}
	public void setDataId(String dataId) {
		this.dataId = dataId;
	}
	public String getEndDate() {
		return endDate;
	}
	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}
	public String getFunId() {
		return funId;
	}
	public void setFunId(String funId) {
		this.funId = funId;
	}
	public String getInstanceDesc() {
		return instanceDesc;
	}
	public void setInstanceDesc(String instanceDesc) {
		this.instanceDesc = instanceDesc;
	}
	public String getInstanceId() {
		return instanceId;
	}
	public void setInstanceId(String instanceId) {
		this.instanceId = instanceId;
	}
	public String getParentInstanceId() {
		return parentInstanceId;
	}
	public void setParentInstanceId(String parentInstanceId) {
		this.parentInstanceId = parentInstanceId;
	}
	public String getParentProcessId() {
		return parentProcessId;
	}
	public void setParentProcessId(String parentProcessId) {
		this.parentProcessId = parentProcessId;
	}
	public String getProcessId() {
		return processId;
	}
	public void setProcessId(String processId) {
		this.processId = processId;
	}
	public String getRunState() {
		return runState;
	}
	public void setRunState(String runState) {
		this.runState = runState;
	}
	public String getStartDate() {
		return startDate;
	}
	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}
	public String getStartNodeId() {
		return startNodeId;
	}
	public void setStartNodeId(String startNodeId) {
		this.startNodeId = startNodeId;
	}
	public String getStartUserId() {
		return startUserId;
	}
	public void setStartUserId(String startUserId) {
		this.startUserId = startUserId;
	}
	public String getStartUserName() {
		return startUserName;
	}
	public void setStartUserName(String startUserName) {
		this.startUserName = startUserName;
	}
	
	public Map<String, String> getAppData() {
		return appData;
	}
	public void setAppData(Map<String, String> appData) {
		this.appData = appData;
	}
	public String getParentNodeId() {
		return parentNodeId;
	}
	public void setParentNodeId(String parentNodeId) {
		this.parentNodeId = parentNodeId;
	}
	public String getProcessName() {
		return processName;
	}
	public void setProcessName(String processName) {
		this.processName = processName;
	}

}
