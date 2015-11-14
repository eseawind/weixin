/*
 * ProcessRunner.java 2011-1-28
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
import org.jxstar.wf.engine.ProcessInstanceManager;

/**
 * 过程实例处理机，主要用途是启动已经初始化的过程实例。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class ProcessRunner extends SystemTask {

	public void execute() throws TaskException {
		String isDelay = SystemVar.getValue("wf.instance.delay");
		if (isDelay.equals("0")) {//"系统属性【{0}】设置过程实例创建后直接启动，处理机不需要执行！"
			_log.showDebug(JsMessage.getValue("processrunner.nostart", "wf.instance.delay"));
			return;
		}
		
		ProcessInstanceManager manager = ProcessInstanceManager.getInstance();
		
		List<ProcessContext> lsContext;
		try {
			lsContext = manager.queryInitProcess();
			if (lsContext.isEmpty()) {//"没有找到初始化的过程实例！"
				_log.showDebug("--------"+ JsMessage.getValue("processrunner.noinstance"));
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
		
		ProcessInstance instance = context.getProcessInstance();
		try {
			instance.startup(context);
			
			_tranMng.commitTran();
		} catch (Exception e) {
			_log.showError(e);
			
			try {
				_tranMng.rollbackTran();
			} catch (TransactionException e2) {
				e2.printStackTrace();
			}
			
			instance.setInstanceDesc(e.getMessage());
			try {
				instance.suspend(context);
			} catch (WfException e1) {
				_log.showError(e1);
			}
		}
	}
}
