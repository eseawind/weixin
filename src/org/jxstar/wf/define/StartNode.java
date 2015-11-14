/*
 * StartNode.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.engine.ProcessContext;

/**
 * 开始节点，不需要扩展。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class StartNode extends Node {

	/**
	 * 执行开始节点。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void execute(ProcessContext context) throws WfException {
		_log.showDebug(JsMessage.getValue("node.donode"), getNodeTitle());
		
		leave(context);
	}
}
