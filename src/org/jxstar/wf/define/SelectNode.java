/*
 * SelectNode.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import java.util.List;

import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.engine.ProcessContext;

/**
 * 判断节点，扩展执行方法，找到一条符合条件的路径继续流转。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class SelectNode extends Node {

	/**
	 * 执行当前节点任务，各类节点重点扩展本方法，实现具体的执行任务；执行任务后触发节点离开方法。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void execute(ProcessContext context) throws WfException {
		_log.showDebug(JsMessage.getValue("node.donode"), getNodeTitle());
		
		List<Line> lsLine = queryOutLine();
		if (lsLine.isEmpty()) {//"【{0}】节点没有定义流出路径！"
			throw new WfException(JsMessage.getValue("node.noout"), getNodeTitle());
		}
		
		//查询符合判断条件的路径
		Line validLine = null;
		for (int i = 0; i < lsLine.size(); i++) {
			Line line = lsLine.get(i);

			if (line.isValid(context)) {//"【{0}】流转满足判断条件！"
				_log.showDebug(JsMessage.getValue("selectnode.okcond"), line.getLineId());
				validLine = line;
				break;
			}
		}
		
		if (validLine == null) {//"【{0}】节点没有符合条件的流出路径！"
			throw new WfException(JsMessage.getValue("selectnode.noout"), getNodeTitle());
		}
		
		leave(context, validLine);
	}
}
