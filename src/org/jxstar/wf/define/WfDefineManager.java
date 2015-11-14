/*
 * WfDefineManager.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import java.util.List;
import java.util.Map;

import org.jxstar.service.util.ConditionUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;

/**
 * 构建过程定义对象的管理类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class WfDefineManager {
	private WfDefineDao _defineDao = WfDefineDao.getInstance();
	private static WfDefineManager instance = new WfDefineManager();

	private WfDefineManager(){}
	/**
	 * 构建单例对象。
	 * @return
	 */
	public static WfDefineManager getInstance() {
		return instance;
	}
	
	/**
	 * 取节点定义对象。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public Node createNode(String processId, String nodeId) {
		Map<String,String> mpData = _defineDao.queryNode(processId, nodeId);
		
		String nodeType = mpData.get("node_type");
		Node node = createNode(nodeType);
		if (node == null) {//"暂不支持【{0}】节点类型，节点对象创建失败！"
			WfException e = new WfException(JsMessage.getValue("wfdefine.newerror"), nodeType);
			e.printStackTrace();
			return null;
		}
		
		node.setNodeId(mpData.get("node_id"));
		node.setWfnodeId(mpData.get("wfnode_id"));
		node.setNodeTitle(mpData.get("node_title"));
		node.setNodeType(nodeType);
		node.setProcessId(mpData.get("process_id"));
		
		return node;
	}
	
	/**
	 * 取当前节点的有效分配用户信息。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @param appData -- 应用数据，用于解析判断条件
	 * @return
	 */
	public List<Map<String,String>> queryAssignUser(
			String processId, String nodeId, Map<String,String> appData) {
		List<Map<String,String>> lsUser = FactoryUtil.newList();
		
		List<Map<String,String>> lsData = _defineDao.queryAssignUser(processId, nodeId);
		if (lsData.isEmpty())  return lsUser;
		
		for (int i = 0, n = lsData.size(); i < n; i++) {
			Map<String,String> mpData = lsData.get(i);
			
			//解析判断条件，取符号条件的用户
			if (ConditionUtil.parseCondition(mpData, appData)) {
				lsUser.add(mpData);
			}
		}
		
		return lsUser;
	}
	
	/**
	 * 取节点的退回流转。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public Line queryBackLine(String processId, String nodeId) {
		List<Map<String,String>> lsData = _defineDao.queryBackLine(processId, nodeId);
		if (lsData.isEmpty())  return null;
		
		Map<String,String> mpData = lsData.get(0);
			
		return createLine(mpData);
	}
	
	/**
	 * 取节点的流出流转。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public List<Line> queryOutLine(String processId, String nodeId) {
		List<Line> lsLine = FactoryUtil.newList();
		
		List<Map<String,String>> lsData = _defineDao.queryOutLine(processId, nodeId);
		if (lsData.isEmpty())  return lsLine;
		
		for (int i = 0, n = lsData.size(); i < n; i++) {
			Map<String,String> mpData = lsData.get(i);
			
			Line line = createLine(mpData);
			lsLine.add(line);
		}
		
		return lsLine;
	}
	
	/**
	 * 取节点的流入流转。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public List<Line> queryInLine(String processId, String nodeId) {
		List<Line> lsLine = FactoryUtil.newList();
		
		List<Map<String,String>> lsData = _defineDao.queryInLine(processId, nodeId);
		if (lsData.isEmpty())  return lsLine;
		
		for (int i = 0, n = lsData.size(); i < n; i++) {
			Map<String,String> mpData = lsData.get(i);
			
			Line line = createLine(mpData);
			lsLine.add(line);
		}
		
		return lsLine;
	}
	
	/**
	 * 根据数据对象构建流转对象。
	 * @param mpData -- 数据值
	 * @return
	 */
	public Line createLine(Map<String,String> mpData) {
		Line line = new Line();
		line.setWflineId(mpData.get("wfline_id"));
		
		//添加过程ID
		String processId = mpData.get("process_id");
		line.setProcessId(processId);
		
		line.setLineId(mpData.get("line_id"));
		line.setLineTitle(mpData.get("line_title"));
		line.setLineType(mpData.get("line_type"));
		
		//添加来源节点ID与目标节点ID
		String sourceId = mpData.get("source_id");
		line.setSourceId(sourceId);
		String targetId = mpData.get("target_id");
		line.setTargetId(targetId);
		
		//添加来源节点对象与目标节点对象
		Node sourceNode = createNode(processId, sourceId);
		line.setSourceNode(sourceNode);
		Node targetNode = createNode(processId, targetId);
		line.setTargetNode(targetNode);
		
		return line;
	}
	
	/**
	 * 根据节点类型创建具体的节点对象。
	 * @param nodeType -- 节点类型
	 * @return
	 */
	private Node createNode(String nodeType) {
		if (nodeType.equals(NodeType.NODE_START)) {
			return new StartNode();
		} else if (nodeType.equals(NodeType.NODE_END)) {
			return new EndNode();
		} else if (nodeType.equals(NodeType.NODE_TASK)) {
			return new TaskNode();
		} else if (nodeType.equals(NodeType.NODE_SELECT)) {
			return new SelectNode();
		} else if (nodeType.equals(NodeType.NODE_FORK)) {
			return new ForkNode();
		} else if (nodeType.equals(NodeType.NODE_JOIN)) {
			return new JoinNode();
		} else if (nodeType.equals(NodeType.NODE_SUBPROCESS)) {
			return new SubProcessNode();
		} 
		
		return null;
	}
}
