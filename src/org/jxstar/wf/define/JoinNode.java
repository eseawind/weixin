/*
 * JoinNode.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.engine.ProcessContext;
import org.jxstar.wf.engine.Token;
import org.jxstar.wf.engine.TokenDao;

/**
 * 聚合节点，过程实例执行到该节点后，将等待所有流入路径都到达当前节点，才继续向下流转,
 * 根据子标记的当前节点可以判断是否到达，满足条件后将删除子标记节点。
 * 
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class JoinNode extends Node {
	/**
	 * 将等待所有流入路径都到达当前节点，才继续向下流转。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void execute(ProcessContext context) throws WfException {
		_log.showDebug(JsMessage.getValue("node.donode"), getNodeTitle());
		
		Token subToken = context.getToken();
		//父标记ID
		String parentId = subToken.getParentId();
		if (parentId == null || parentId.length() == 0) {
			//"没有找到【{0}】节点的父标记！"
			throw new WfException(JsMessage.getValue("joinnode.noparent"), getNodeTitle());
		}
		
		//判断是否存在没有到达当前节点的子标记，如果存在则继续等待。
		TokenDao tokenDao = TokenDao.getInstance();
		if (tokenDao.noArriveNode(parentId, getNodeId())) {
			//"还有子标记没有到达【{0}】节点！"
			_log.showDebug(JsMessage.getValue("joinnode.hasnotend"), getNodeTitle());
			return;
		}//"所有子标记都已到达【{0}】节点！"
		_log.showDebug(JsMessage.getValue("joinnode.allend"), getNodeTitle());
		
		//所有子标记都达到本节点，清除所有子标记
		if (!tokenDao.deleteSubToken(parentId)) {//"清除【{0}】节点的子标记失败！"
			throw new WfException(JsMessage.getValue("joinnode.clearerror"), getNodeTitle());
		}
		
		//设置父标记为上下文中的标记
		Token parent = subToken.getParentToken();
		//如果父标记为空，则创建
		if (parent == null) {
			//创建一个新的标记对象
			parent = new Token();
			parent.setTokenId(parentId);
			parent.setNodeId(getNodeId());
			context.setToken(parent);
			
			//如果数据库中没有该标记，则保存到数据库中，在退回时存在这种情况
			if (!tokenDao.existToken(parentId)) {
				tokenDao.insertToken(context);
			}
		} else {
			context.setToken(parent);
		}
		
		//继续执行下一个节点
		leave(context);
	}
}
