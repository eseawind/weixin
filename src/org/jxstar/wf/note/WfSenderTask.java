/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.wf.note;

import org.jxstar.task.SystemTask;
import org.jxstar.task.TaskException;

/**
 * 工作流短信发送任务。
 *
 * @author TonyTan
 * @version 1.0, 2012-5-21
 */
public class WfSenderTask extends SystemTask {

	/* (non-Javadoc)
	 * @see org.jxstar.task.SystemTask#execute()
	 */
	@Override
	public void execute() throws TaskException {
		NoteMergeSender sender = new NoteMergeSender();
		sender.setMergeNote();
	}

}
