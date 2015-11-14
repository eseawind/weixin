/*
 * Line.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import java.util.Map;

import org.jxstar.service.util.ConditionUtil;
import org.jxstar.wf.engine.ProcessContext;

/**
 * 流转实例类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class Line {
	//来源节点实例
	private Node sourceNode;
	//目标节点实例
	private Node targetNode;

	public Node getSourceNode() {
		return sourceNode;
	}
	public void setSourceNode(Node sourceNode) {
		this.sourceNode = sourceNode;
	}
	public Node getTargetNode() {
		return targetNode;
	}
	public void setTargetNode(Node targetNode) {
		this.targetNode = targetNode;
	}
	
	/**
	 * 判断当前流转是否有效，需要解析判断条件的业务表字段。
	 * @param context -- 过程上下文
	 * @return boolean
	 */
	public boolean isValid(ProcessContext context) {
		Map<String,String> appData = context.getProcessInstance().getAppData();
		
		return ConditionUtil.parseCondition(processId, lineId, appData); 
	}
	
	/*****************  流转定义参数信息 ******************/
	private String 	wflineId;		//主键
	private String 	processId;		//过程ID
	private String 	lineId;			//流转ID
	private String 	lineTitle;		//流转标题
	private String 	lineType;		//流转类型
	private String 	sourceId;		//来源节点ID
	private String 	targetId;		//目标节点ID

	public String getLineId() {
		return lineId;
	}
	public void setLineId(String lineId) {
		this.lineId = lineId;
	}
	public String getLineTitle() {
		return lineTitle;
	}
	public void setLineTitle(String lineTitle) {
		this.lineTitle = lineTitle;
	}
	public String getLineType() {
		return lineType;
	}
	public void setLineType(String lineType) {
		this.lineType = lineType;
	}
	public String getProcessId() {
		return processId;
	}
	public void setProcessId(String processId) {
		this.processId = processId;
	}
	public String getSourceId() {
		return sourceId;
	}
	public void setSourceId(String sourceId) {
		this.sourceId = sourceId;
	}
	public String getTargetId() {
		return targetId;
	}
	public void setTargetId(String targetId) {
		this.targetId = targetId;
	}
	public String getWflineId() {
		return wflineId;
	}
	public void setWflineId(String wflineId) {
		this.wflineId = wflineId;
	}
}
