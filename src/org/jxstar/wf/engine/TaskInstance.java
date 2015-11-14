/*
 * TaskInstance.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.engine;

import java.util.List;
import java.util.Map;

import org.jxstar.util.log.Log;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.define.Node;
import org.jxstar.wf.invoke.EventAgent;
import org.jxstar.wf.invoke.EventCode;
import org.jxstar.wf.invoke.StatusCode;

/**
 * 任务实例对象：
 * 是过程运行过程产生的任务实例，每个任务只有一个实例。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class TaskInstance {
	private Log _log = Log.getInstance();
	//任务实例DAO
	private TaskInstanceDao _taskDao = TaskInstanceDao.getInstance();
	//事件触发执行类
	private EventAgent eventAgent = EventAgent.getInstance();
	
	/**
	 * 创建任务实例，状态为“初始化”；由任务节点调用创建新任务。
	 * @param processInstance -- 过程实例
	 * @throws WfException
	 */
	public void create(ProcessInstance processInstance) throws WfException {
		//取有效分配用户的参数
		Map<String,String> appData = processInstance.getAppData();
		
		//取当前任务的有效用户
		List<Map<String,String>> lsUser = AssignTaskUtil.queryAssignUser(this, appData);
		if (lsUser.isEmpty()) {//"【{0}】过程的【{1}】节点没有找到符合条件的分配用户！"
			String processName = processInstance.getProcessName();
			throw new WfException(JsMessage.getValue("task.nouser"), processName, nodeTitle);
		}
		
		//设置任务为创建状态
		setRunState(StatusCode.TASK_CREATED);
		
		if (!_taskDao.insertTask(this)) {//"新增任务实例到数据库中失败！"
			throw new WfException(JsMessage.getValue("task.newerror"));
		}
		if (!_taskDao.insertAssign(this, lsUser)) {//"新增任务分配消息到数据库中失败！"
			throw new WfException(JsMessage.getValue("tasknode.assignerror"));
		}
		
		//创建过程上下文
		ProcessContext context = new ProcessContext();
		context.setTaskInstance(this);
		context.setProcessInstance(processInstance);
		
		//触发任务创建事件
		eventAgent.fireEvent(EventCode.TASK_CREATED, context);
	}

	/**
	 * 执行任务实例，状态为“活动”；由过程实例执行调用，完善任务执行信息，改变任务状态。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void execute(ProcessContext context) throws WfException {
		//"执行任务【{0}】"
		_log.showDebug(JsMessage.getValue("task.do"), getTaskId());
		
		//如果是任务取回，则把原任务分配消息都注销，再创建一条取回分配消息
		if (getCheckType().equals("K")) {
			AssignTaskUtil.createBackAssign(this);
		}
		
		//设置任务为执行状态
		setRunState(StatusCode.TASK_EXECUTED);
		
		if (!_taskDao.executeTask(this)) {//"保存任务执行信息到数据表中出错！"
			throw new WfException(JsMessage.getValue("task.doerror"));
		}
		if (!_taskDao.executeAssign(this)) {
			throw new WfException(JsMessage.getValue("task.doerror"));
		}
		
		//如果不是多人审批，则注销其他人的分配消息
		if (getMustAgreeNum() == 0) {
			_taskDao.cancelAssign(this);
		}
		
		//触发任务执行事件
		eventAgent.fireEvent(EventCode.TASK_EXECUTED, context);
	}

	/**
	 * 完成任务实例，状态为“完成”；由任务实例处理机调用。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void complete(ProcessContext context) throws WfException {
		//"完成任务【{0}】"
		_log.showDebug(JsMessage.getValue("task.end"), getTaskId());
		
		//如果是多人审批节点，且没有执行完所有分配，则退出等待
		if (!AssignTaskUtil.assignComplete(this)) return;
		
		//如果是多人审批节点，且达到通过条件，则修改checkType为Y，否则为E
		//由于completeTask把assign转移到历史表中，所以在转移之前处理，而不放在TaskNode.leave
		AssignTaskUtil.taskCheckType(this);
		
		//设置任务为完成状态
		setRunState(StatusCode.TASK_COMPLETED);
		
		if (!_taskDao.completeTask(this)) {//"保存任务完成信息到数据表中出错！"
			throw new WfException(JsMessage.getValue("task.enderror"));
		}
		
		//触发任务完成事件，如果在node.leave后触发，会影响context中的值
		eventAgent.fireEvent(EventCode.TASK_COMPLETED, context);

		//取当前节点，离开
		Node node = context.getToken().getNode();		
		node.leave(context);
	}
	
	/**
	 * 当并发节点任务实例退回、否决、完成时，需要清理其它分支的待执行的任务。
	 */
	public void clearOther() {
		_taskDao.delOtherTask(this);
	}
	
	/*****************  任务实例参数信息 ******************/
	private String 	processId;		//过程ID
	private String 	nodeId;			//节点ID
	private String 	nodeTitle;		//节点名称
	private String 	funId;			//功能ID
	private String 	dataId;			//数据ID
	private String 	instanceId;		//过程实例ID
	private String 	taskId;			//任务实例ID
	private String 	runState;		//任务状态
	private String 	startDate;		//开始时间
	private String 	limitDate;		//受限时间
	private String 	endDate;		//结束时间
	private String 	taskDesc;		//任务描述
	private String 	agreeNum;		//必须审批同意人数
	private String 	hasEmail;		//是否发生邮件
	private String 	noteType;		//短信发送类型
	private String 	isTimeout;		//是否超时
	private String 	checkUserName;	//处理人
	private String 	checkUserId;	//处理人ID
	private String 	checkDate;		//处理时间
	private String 	checkType;		//处理类型
	private String 	checkDesc;		//处理意见
	private String 	nextNodeId;		//指定下个节点，暂时不使用
	private String 	nextUserId;		//指定下个人ID，是重新分配的人
	private String 	nextUser;		//指定下个人
	private String 	dealDesc;		//处理过程信息
	
	public String getAgreeNum() {
		return agreeNum;
	}
	public void setAgreeNum(String agreeNum) {
		this.agreeNum = agreeNum;
	}
	public int getMustAgreeNum() {
		if (agreeNum == null) return 0;
		int num = Integer.parseInt(agreeNum);
		if (num < 0) num = 0;
		if (num > 9) num = 9;
		return num;
	}
	
	public String getCheckDate() {
		return checkDate;
	}
	public void setCheckDate(String checkDate) {
		this.checkDate = checkDate;
	}
	public String getCheckDesc() {
		return checkDesc;
	}
	public void setCheckDesc(String checkDesc) {
		this.checkDesc = checkDesc;
	}
	public String getCheckType() {
		return checkType;
	}
	public void setCheckType(String checkType) {
		this.checkType = checkType;
	}
	public String getCheckUserId() {
		return checkUserId;
	}
	public void setCheckUserId(String checkUserId) {
		this.checkUserId = checkUserId;
	}
	public String getCheckUserName() {
		return checkUserName;
	}
	public void setCheckUserName(String checkUserName) {
		this.checkUserName = checkUserName;
	}
	public String getDataId() {
		return dataId;
	}
	public void setDataId(String dataId) {
		this.dataId = dataId;
	}
	public String getDealDesc() {
		return dealDesc;
	}
	public void setDealDesc(String dealDesc) {
		this.dealDesc = dealDesc;
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
	public String getHasEmail() {
		return hasEmail;
	}
	public void setHasEmail(String hasEmail) {
		this.hasEmail = hasEmail;
	}
	public String getInstanceId() {
		return instanceId;
	}
	public void setInstanceId(String instanceId) {
		this.instanceId = instanceId;
	}
	public String getIsTimeout() {
		return isTimeout;
	}
	public void setIsTimeout(String isTimeout) {
		this.isTimeout = isTimeout;
	}
	public String getLimitDate() {
		return limitDate;
	}
	public void setLimitDate(String limitDate) {
		this.limitDate = limitDate;
	}
	public String getNextNodeId() {
		return nextNodeId;
	}
	public void setNextNodeId(String nextNodeId) {
		this.nextNodeId = nextNodeId;
	}
	public String getNextUser() {
		return nextUser;
	}
	public void setNextUser(String nextUser) {
		this.nextUser = nextUser;
	}
	public String getNextUserId() {
		return nextUserId;
	}
	public void setNextUserId(String nextUserId) {
		this.nextUserId = nextUserId;
	}
	public String getNodeId() {
		return nodeId;
	}
	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}
	public String getNodeTitle() {
		return nodeTitle;
	}
	public void setNodeTitle(String nodeTitle) {
		this.nodeTitle = nodeTitle;
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
	public String getTaskDesc() {
		return taskDesc;
	}
	public void setTaskDesc(String taskDesc) {
		this.taskDesc = taskDesc;
	}
	public String getTaskId() {
		return taskId;
	}
	public void setTaskId(String taskId) {
		this.taskId = taskId;
	}
	public String getNoteType() {
		return noteType;
	}
	public void setNoteType(String noteType) {
		this.noteType = noteType;
	}

}
