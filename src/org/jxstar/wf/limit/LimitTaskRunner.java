/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.wf.limit;

import java.util.List;
import java.util.Map;

import org.jxstar.task.SystemTask;
import org.jxstar.task.TaskException;

/**
 * 限时任务处理线程。处理方法：
 * 1、查找所有分配消息记录，查找有限时值，且大于开始时间，且大于当前时间的记录；
 * 2、再根据分配消息中的任务属性找到限时处理规则；
 * 3、根据处理规则，调用相应处理类。
 *
 * @author TonyTan
 * @version 1.0, 2012-4-11
 */
public class LimitTaskRunner extends SystemTask {

	public void execute() throws TaskException {
		List<Map<String, String>> lsAssign = LimitTaskUtil.queryLimitAssign();
		if (lsAssign.isEmpty()) return;
		
		if (!lsAssign.isEmpty()) {
			_log.showDebug("需要限时处理的分配消息条数：" + lsAssign.size());
		}

		for(Map<String, String> mpAssign : lsAssign) {
			String taskId = mpAssign.get("task_id");
			String rule = LimitTaskUtil.getLimitRule(taskId);
			
			if (rule.equals("1")) {
				LimitTaskAgree.limitAgree(mpAssign);
			} else if (rule.equals("2")) {
				LimitTaskMsg.limitMsg(mpAssign);
			}
		}
	}

}
