/*
 * ForkNode.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import java.util.List;


import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.engine.ProcessContext;
import org.jxstar.wf.engine.ProcessInstance;
import org.jxstar.wf.engine.Token;
import org.jxstar.wf.engine.TokenDao;

/**
 * 并发节点，过程实例执行到该节点后，
 * 将针对每条流出路径创建一个子标记对象与子上下文对象。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class ForkNode extends Node {

	/**
	 * 执行并发节点。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void execute(ProcessContext context) throws WfException {
		_log.showDebug(JsMessage.getValue("node.donode"), getNodeTitle());
		
		List<Line> lsLine = queryOutLine();
		if (lsLine.isEmpty()) {//"【{0}】节点没有定义流出路径！"
			throw new WfException(JsMessage.getValue("node.noout"), getNodeTitle());
		}
		
		List<Line> lsValid = FactoryUtil.newList();
		
		//支持并发路径也设置判断条件，判断条件可以为空，
		//因为存在同一项工作不同单位的审批人数不同的情况
		for (int i = 0; i < lsLine.size(); i++) {
			Line line = lsLine.get(i);
			
			if (!line.isValid(context)) {//"【{0}】流转不满足判断条件！"
				_log.showDebug(JsMessage.getValue("forknode.nocond"), line.getLineId());
				continue;
			}
			
			lsValid.add(line);
		}
		
		if (lsValid.size() < 2) {//"【{0}】节点符合条件的并发流出路径不足2条！"
			throw new WfException(JsMessage.getValue("forknode.notwoline"), getNodeTitle());
		}
		
		//取父标记对象
		Token parentToken = context.getToken();
		//取过程实例
		ProcessInstance instance = context.getProcessInstance();
		
		//每条并发路径创建一个子标记与子上下文对象
		for (int i = 0; i < lsValid.size(); i++) {
			Line line = lsValid.get(i);
			
			//取分支路径的节点
			Node nextNode = line.getTargetNode();
			
			//创建子标记对象
			Token subToken = new Token(parentToken, nextNode);
			
			//创建分支运行的上下文环境，不恢复任务实例
			ProcessContext subContext = new ProcessContext();
			subContext.setToken(subToken);
			subContext.setProcessInstance(instance);
			
			//保存新的子标记对象
			TokenDao tokenDao = TokenDao.getInstance();
			if (!tokenDao.insertToken(subContext)) {
				//"【{0}】并发节点创建子标记失败！"
				throw new WfException(JsMessage.getValue("forknode.tokenerror"));
			}
			
			//进入分支节点
			nextNode.enter(subContext);
		}
	}
}
