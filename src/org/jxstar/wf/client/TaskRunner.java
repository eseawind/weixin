/*
 * TaskRunner.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.client;

import java.util.List;

import org.jxstar.dao.transaction.TransactionException;
import org.jxstar.task.SystemTask;
import org.jxstar.task.TaskException;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.engine.ProcessContext;
import org.jxstar.wf.engine.ProcessInstance;
import org.jxstar.wf.engine.TaskInstance;
import org.jxstar.wf.engine.TaskInstanceManager;

/**
 * 任务实例处理机，主要用途是完成已经执行的任务实例。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class TaskRunner extends SystemTask {
	
	public void execute() throws TaskException {
		String isDelay = SystemVar.getValue("wf.instance.delay");
		if (isDelay.equals("0")) {//"系统属性【{0}】设置任务实例执行后直接完成，处理机不需要执行！"
			_log.showDebug(JsMessage.getValue("taskrunner.nostart", "wf.instance.delay"));
			return;
		}
		
		TaskInstanceManager manager = TaskInstanceManager.getInstance();
		List<ProcessContext> lsContext;
		try {
			lsContext = manager.queryDoneTask();
			if (lsContext.isEmpty()) {//没有找到已执行的任务实例！
				_log.showDebug("--------"+JsMessage.getValue("taskrunner.notask"));
				return;
			}
		} catch (WfException e) {
			_log.showError(e);
			throw new TaskException(e.getMessage());
		}
			
		for (int i = 0, n = lsContext.size(); i < n; i++) {
			runTask(lsContext.get(i));
		}
	}
	
	/**
	 * 单个处理任务实例，如果出现异常，则直接挂起过程实例，可以恢复过程实例；
	 * 这样不会影响到其它过程实例的执行，如果执行出错则事务回滚；
	 * @param context
	 */
	private void runTask(ProcessContext context) {
		_tranMng.startTran();
		
		TaskInstance task = context.getTaskInstance();
		try {
			task.complete(context);
			
			_tranMng.commitTran();
		} catch (Exception e) {
			_log.showError(e);
			
			try {
				_tranMng.rollbackTran();
			} catch (TransactionException e2) {
				e2.printStackTrace();
			}
			
			ProcessInstance instance = context.getProcessInstance();
			instance.setInstanceDesc(e.getMessage());
			try {
				instance.suspend(context);
			} catch (WfException e1) {
				_log.showError(e1);
			}
		}
	}

}
