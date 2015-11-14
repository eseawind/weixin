/*
 * TaskNode.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import java.util.List;
import java.util.Map;

import org.jxstar.service.util.TaskUtil;
import org.jxstar.util.DateUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.engine.ProcessContext;
import org.jxstar.wf.engine.ProcessInstance;
import org.jxstar.wf.engine.TaskInstance;
import org.jxstar.wf.engine.TaskInstanceDao;
import org.jxstar.wf.engine.TaskInstanceManager;
import org.jxstar.wf.invoke.EventAgent;
import org.jxstar.wf.invoke.EventCode;
import org.jxstar.wf.invoke.StatusCode;

/**
 * 任务节点：
 * 创建任务实例，并给符合条件的用户分配任务消息；
 * 任务执行完成后，将根据用户的处理结果继续流转。
 * 
 * 用户处理方式有：
 * 同意：按照正常路径继续向下流转；
 * 退回：如果流转图中绘制了退回路径，则退回到指定的节点，否则退回到上一个任务节点，如果流程中有分支或子过程节点，则直接退回到编辑人；
 * 退回编辑人：退回到编辑人，将终止过程实例，给编辑人发送系统消息；
 * 否决：任务属性中设置了可以否决，才会出现该选项，将终止过程实例；
 * 完成：任务属性中设置了可以完成，才会出现该选项，将完成过程实例；
 * 重新分配：如果指定了重新分配人，将生成新任务，并将任务分配给指定的人；
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class TaskNode extends Node {
	//用户审批意见，可以考虑采用路径定义的方式
	public static final String AGREE = "Y";			//同意
	public static final String DISAGREE = "N";		//不同意、否决终止
	public static final String RETURN = "R";		//退回
	public static final String RETURNEDIT = "E";	//退回编辑人
	public static final String COMPLETE = "C";		//完成
	public static final String GETBACK = "K";		//取回
	public static final String NAGREE = "M";		//不同意、用于多人审批
	
	/**
	 * 执行任务节点，创建任务实例。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void execute(ProcessContext context) throws WfException {
		_log.showDebug(JsMessage.getValue("node.donode"), getNodeTitle());
		
		ProcessInstance processInstance = context.getProcessInstance();
		//取过程ID与节点ID
		String nodeId = getNodeId();
		String processId = processInstance.getProcessId();
		
		//取任务属性定义信息
		WfDefineDao defineDao = WfDefineDao.getInstance();
		Map<String,String> mpNodeAttr = defineDao.queryNodeAttr(processId, nodeId);
		if (mpNodeAttr.isEmpty()) {//"【{0}】任务节点没有定义任务属性！"
			throw new WfException(JsMessage.getValue("tasknode.noattr"), getNodeTitle());
		}
		
		//创建任务实例
		TaskInstanceManager manager = TaskInstanceManager.getInstance();
		TaskInstance task = manager.createTask(processInstance, mpNodeAttr);
		
		//执行任务新增方法
		task.create(processInstance);
	}
	
	/**
	 * 审批完成后，根据审批意见执行流转。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void leave(ProcessContext context) throws WfException {
		TaskInstance task = context.getTaskInstance();
		ProcessInstance process = context.getProcessInstance();
		
		//取审批意见类型
		String checkType = task.getCheckType();
		
		//根据审批意见类型，查找流转路径
		if (checkType.equals(AGREE) || checkType.equals(GETBACK)) {
			//同意-- 走正常路径离开当前节点
			//取回-- 进入指定的退回路径
			
			//如果指定了节点，则直接进入该节点。应用于取回功能中。
			//注意，暂时只能指定到简单节点中，会签节点与子过程节点没处理
			String nextNodeId = task.getNextNodeId();
			if (nextNodeId != null && nextNodeId.length() > 0) {
				String processId = task.getProcessId();
				WfDefineManager mng = WfDefineManager.getInstance();
				leave(context, mng.createNode(processId, nextNodeId));
				return;
			}

			//如果当前任务指定了重新分配人员，则不马上流转到下一个节点，而是继续产生新任务，分配给指定人员
			String nextUserId = task.getNextUserId();
			if (nextUserId != null && nextUserId.length() > 0) {
				reAssign(context);
				return;
			}
			
			//查找任务节点的流出路径
			List<Line> lsLine = queryOutLine();
			if (lsLine.isEmpty()) {//"【{0}】节点没有定义流出路径！"
				throw new WfException(JsMessage.getValue("node.noout"), getNodeTitle());
			}
			
			leave(context, lsLine.get(0));
		} else if (checkType.equals(DISAGREE)) {//否决 -- 过程终止
			//"审批否决，过程终止！"
			String message = JsMessage.getValue("tasknode.checknot");
			process.setInstanceDesc(message);
			process.terminate(context);
		} else if (checkType.equals(RETURNEDIT)) {//退回编辑人 -- 过程终止
			returnEditor(context);
		} else if (checkType.equals(RETURN)) {//退回
			executeBack(context);
		} else if (checkType.equals(COMPLETE)) {//完成 -- 流程执行完成
			//"审批过程中指定任务完成！"
			String message = JsMessage.getValue("tasknode.taskend");
			process.setInstanceDesc(message);
			process.complete(context);
		}
	}
	
	/**
	 * 节点退回操作，退回到那个节点有三种判断方法：
	 * 如果流转图中绘制了退回路径，则退回到指定的节点；
	 * 没有没有退回路径，则退回到上一个任务节点；
	 * 如果流程中有分支或子过程节点，则直接退回到编辑人；
	 * 在流程图保存时判断了退回路径的目标与来源节点必须是任务节点，且不能在并发分支路径上。
	 * @param context -- 过程上下文对象
	 * @return
	 */
	private void executeBack(ProcessContext context) throws WfException {
		WfDefineManager manager = WfDefineManager.getInstance();
		//取当前节点退回流转
		String nodeId = getNodeId();
		String processId = getProcessId();
		Line backLine = manager.queryBackLine(processId, nodeId);
		
		Node backNode = null;
		//根据退回路径取退回的节点
		if (backLine != null) {
			backNode = backLine.getTargetNode();
		} else {
			WfDefineDao defile = WfDefineDao.getInstance();
			//如果有分支或子过程节点，则退回编辑人
			if (defile.hasForkNode(processId)) {
				returnEditor(context);
				return;
			} else {
			//查找上一个任务节点
				backNode = findPreTaskNode(processId, nodeId);
				if (backNode == null) {
					returnEditor(context);
					return;
				}
			}
		}
		
		String nodeType = backNode.getNodeType();
		//如果是开始节点，则表示退回编辑人
		if (nodeType.equals(NodeType.NODE_START)) {
			returnEditor(context);
		} else {
		//进入新的任务节点中
			backNode.enter(context);
		}
	}
	
	/**
	 * 查找上一个任务节点。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	private Node findPreTaskNode(String processId, String nodeId) {
		WfDefineManager manager = WfDefineManager.getInstance();
		
		List<Line> lsInLine = manager.queryInLine(processId, nodeId);
		if (lsInLine.isEmpty()) return null;
		
		if (lsInLine.size() > 1) {//"该节点【{0}】的来源路径有多个，只能退回编辑人！"
			_log.showDebug(JsMessage.getValue("tasknode.srcline"), nodeId);
			return null;
		}
		
		Line inLine = lsInLine.get(0);
		Node srcNode = inLine.getSourceNode();
		
		String nodeType = srcNode.getNodeType();
		if (!nodeType.equals(NodeType.NODE_TASK)) {
			return findPreTaskNode(processId, srcNode.getNodeId());
		} else {
			return srcNode;
		}
	}
	
	/**
	 * 退回编辑人。
	 * @param context
	 */
	private void returnEditor(ProcessContext context) throws WfException {
		//修改意见类型为退回编辑人
		TaskInstance task = context.getTaskInstance();
		task.setCheckType(RETURNEDIT);
		
		ProcessInstance process = context.getProcessInstance();
		//"退回编辑人，过程终止！"
		String message = JsMessage.getValue("tasknode.back");
		process.setInstanceDesc(message);
		process.terminate(context);
	}
	
	/**
	 * 重新分配任务，创建新的任务与分配记录，
	 * context对象中的属性都不需要修改，token还是指向当前节点，只需要修改task的相关属性。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	private void reAssign(ProcessContext context) throws WfException {
		TaskInstance task = context.getTaskInstance();
		WfDefineDao defineDao = WfDefineDao.getInstance();
		TaskInstanceDao taskDao = TaskInstanceDao.getInstance();
		
		Map<String,String> mpNodeAttr = defineDao.queryNodeAttr(task.getProcessId(), task.getNodeId());
		//计算受限时间值
		String limitValue = mpNodeAttr.get("limit_value");
		String limitDate = TaskUtil.parseLimitDate(limitValue);
		
		//初始任务实例的时间，其它审批信息在下次恢复时会重新加载最新信息
		task.setStartDate(DateUtil.getTodaySec());
		task.setLimitDate(limitDate);
		
		//取重新分配的人员信息
		List<Map<String,String>> lsUser = FactoryUtil.newList();
		Map<String,String> mpUser = FactoryUtil.newMap();
		mpUser.put("user_id", task.getNextUserId());
		mpUser.put("user_name", task.getNextUser());
		lsUser.add(mpUser);
		
		//设置任务创建状态
		task.setRunState(StatusCode.TASK_CREATED);
		
		if (!taskDao.insertTask(task)) {//"新增任务实例到数据库中失败！"
			throw new WfException(JsMessage.getValue("tasknode.newerror"));
		}
		if (!taskDao.insertAssign(task, lsUser)) {//"新增任务分配消息到数据库中失败！"
			throw new WfException(JsMessage.getValue("tasknode.assignerror"));
		}
		
		//触发任务创建事件
		EventAgent.getInstance().fireEvent(EventCode.TASK_CREATED, context);
	}
}
