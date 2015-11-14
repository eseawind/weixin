/*
 * Node.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import java.util.List;


import org.jxstar.util.log.Log;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.engine.ProcessContext;
import org.jxstar.wf.engine.Token;
import org.jxstar.wf.engine.TokenDao;

/**
 * 所有过程节点的基类：
 * 是控制节点流转与执行的基础，不同类型节点的执行内容与流转方法在具体类中实现。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public abstract class Node {
	protected Log _log = Log.getInstance();
	protected WfDefineManager _defineManager = WfDefineManager.getInstance();
	
	/**
	 * 进入当前节点，修改标记对象的状态为当前节点；到达该节点后将触发节点执行方法。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void enter(ProcessContext context) throws WfException {
		//"进入节点【{0}】"
		_log.showDebug(JsMessage.getValue("node.innode"), nodeTitle);

		Token token = context.getToken();
		//设置标记对象当前节点
		token.setNode(this);
		
		//保存标记对象的节点ID
		TokenDao tokenDao = TokenDao.getInstance();
		String tokenId = token.getTokenId();
		if (!tokenDao.updateToken(tokenId, nodeId)) {
			//"保存【{0}】标记对象的【{1}】节点信息失败！"
			throw new WfException(JsMessage.getValue("node.savenode"), tokenId, nodeTitle);
		}
		
		execute(context);
	}
	
	/**
	 * 执行当前节点任务，各类节点重点扩展本方法，实现具体的执行任务。
	 * 基类的执行方法中保存节点执行信息，用于记录过程执行历史。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public abstract void execute(ProcessContext context) throws WfException;

	/**
	 * 离开当前节点，流转并进入下一个节点；根据上下文对象找到当前节点的流出流转，
	 * 基础类实现只有一条流出线的情况，如果有其它查找流出流转的规则，则在具体类中扩展。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void leave(ProcessContext context) throws WfException {
		//取当前节点的流出路径
		List<Line> lsLine = _defineManager.queryOutLine(processId, nodeId);
		if (lsLine.isEmpty()) {//"【{0}】节点没有定义流出路径！"
			throw new WfException(JsMessage.getValue("node.noout"), nodeTitle);
		}
		
		//原则上是不会出现多条流出路径，只有在判断节点与并发节点才会有多条流出路径，会具体类中扩展本方法
		//如果有多个流转，则只取第一条执行
		Line line = lsLine.get(0);
		
		//离开当前节点
		leave(context, line);
	}

	/**
	 * 离开当前节点，进入指定流转的下一个节点。
	 * @param context -- 过程上下文对象
	 * @param outLine -- 指定流出路径
	 * @throws WfException
	 */
	public void leave(ProcessContext context, Line outLine) throws WfException {
		if (context == null || outLine == null) {
			//"参数错误：过程上下文对象与流转对象不能为空！"
			throw new WfException(JsMessage.getValue("node.linenull"));
		}
		
	    leave(context, outLine.getTargetNode());
	}

	/**
	 * 离开当前节点，进入指定的节点。
	 * @param context -- 过程上下文对象
	 * @param nextNode -- 指定下一个进入的节点
	 * @throws WfException
	 */
	public void leave(ProcessContext context, Node nextNode) throws WfException {
		if (context == null || nextNode == null) {
			//"参数错误：过程上下文对象与流转对象不能为空！"
			throw new WfException(JsMessage.getValue("node.linenull"));
		}
		//"离开节点【{0}】"
		_log.showDebug(JsMessage.getValue("node.outnode"), nodeTitle);
		
	    Token token = context.getToken();
	    token.setNode(null);
	    
	    nextNode.enter(context);
	}
	
	/**
	 * 查找当前节点流出路径。
	 * @return List<Line>
	 */
	public List<Line> queryOutLine() {
		return _defineManager.queryOutLine(processId, nodeId);
	}
	
	/**
	 * 查找当前节点流如路径。
	 * @return List<Line>
	 */
	public List<Line> queryInLine() {
		return _defineManager.queryInLine(processId, nodeId);
	}
	
	/*****************  节点定义参数信息 ******************/
	private String 	wfnodeId;		//主键
	private String 	processId;		//过程ID
	private String 	nodeId;			//节点ID
	private String 	nodeTitle;		//节点名称
	private String 	nodeType;		//节点类型

	public String getNodeId() {
		return nodeId;
	}
	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}
	public String getNodeTitle() {
		return nodeTitle;
	}
	public void setNodeTitle(String nodeTitle) {
		this.nodeTitle = nodeTitle;
	}
	public String getNodeType() {
		return nodeType;
	}
	public void setNodeType(String nodeType) {
		this.nodeType = nodeType;
	}
	public String getProcessId() {
		return processId;
	}
	public void setProcessId(String processId) {
		this.processId = processId;
	}
	public String getWfnodeId() {
		return wfnodeId;
	}
	public void setWfnodeId(String wfnodeId) {
		this.wfnodeId = wfnodeId;
	}

}
