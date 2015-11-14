/*
 * Token.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.engine;

import org.jxstar.wf.define.Node;

/**
 * 过程标记对象：
 * 用于跟踪过程实例当前执行到那个节点了，用于过程流转控制的关键对象。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class Token {
	private String tokenId;		//标记ID
	private String parentId;	//其父标记ID
	private String nodeId;		//节点ID
	private String processId;	//过程定义ID
	private String instanceId;	//过程实例ID
	private Node node;			//标记指向的节点ID
	private Token parentToken;	//其父标记对象
	
	public Token() {}
	
	/**
	 * 创建子标记对象。
	 * @param parentToken -- 父标记对象
	 * @param node -- 当前执行的节点
	 */
	public Token(Token parentToken, Node node) {
		this.node = node;
		this.parentToken = parentToken;
		
		this.nodeId = node.getNodeId();
		this.parentId = parentToken.getTokenId();
	}

	public Node getNode() {
		return node;
	}

	public void setNode(Node node) {
		this.node = node;
	}

	public String getParentId() {
		return parentId;
	}

	public void setParentId(String parentId) {
		this.parentId = parentId;
	}

	public Token getParentToken() {
		return parentToken;
	}

	public void setParentToken(Token parentToken) {
		this.parentToken = parentToken;
	}

	public String getTokenId() {
		return tokenId;
	}

	public void setTokenId(String tokenId) {
		this.tokenId = tokenId;
	}

	public String getInstanceId() {
		return instanceId;
	}

	public void setInstanceId(String instanceId) {
		this.instanceId = instanceId;
	}

	public String getNodeId() {
		return nodeId;
	}

	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}

	public String getProcessId() {
		return processId;
	}

	public void setProcessId(String processId) {
		this.processId = processId;
	}

}
