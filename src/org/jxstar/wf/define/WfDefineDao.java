/*
 * WfDefineDao.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import java.util.List;
import java.util.Map;


import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.DmDaoUtil;
import org.jxstar.util.MapUtil;

/**
 * 读取过程定义信息的DAO对象。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class WfDefineDao {
	private BaseDao _dao = BaseDao.getInstance();
	private static WfDefineDao instance = new WfDefineDao();
	
	//取过程定义相关表的所有字段
	private String _field_process = DmDaoUtil.getFieldSql("wf_process");
	private String _field_node = DmDaoUtil.getFieldSql("wf_node");
	private String _field_nodeattr = DmDaoUtil.getFieldSql("wf_nodeattr");
	private String _field_line = DmDaoUtil.getFieldSql("wf_line");
	private String _field_user = DmDaoUtil.getFieldSql("wf_user");

	private WfDefineDao(){}
	/**
	 * 构建单例对象。
	 * @return
	 */
	public static WfDefineDao getInstance() {
		return instance;
	}
	
	/**
	 * 根据过程ID取有效过程定义信息。
	 * @param processId -- 过程ID
	 * @return
	 */
	public Map<String,String> queryProcess(String processId) {
		String sql = "select "+ _field_process +" from wf_process where process_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 根据功能ID取有效审批过程定义信息，且必须没有应用于子过程节点。
	 * @param funId -- 功能ID
	 * @return
	 */
	public Map<String,String> queryProcessByFunId(String funId) {
		String sql = "select "+ _field_process +" from wf_process where process_state = '2' and process_type = '1' and fun_id = ?" +
				" and process_id not in (select sub_processid from wf_subprocess)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 取子过程ID。
	 * @param processId -- 过程定义ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public String querySubProcessId(String processId, String nodeId) {
		String sql = "select sub_processid from wf_subprocess where process_id = ? and node_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(nodeId);
		
		Map<String,String> mpData = _dao.queryMap(param);
		if (mpData.isEmpty()) return "";
		
		return mpData.get("sub_processid");
		
	}
	
	/**
	 * 取过程定义的开始节点
	 * @param processId -- 过程ID
	 * @return
	 */
	public String queryStartNodeId(String processId) {
		String sql = "select node_id from wf_node where node_type = 'start' and process_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		
		Map<String,String> mpNode = _dao.queryMap(param);
		return mpNode.get("node_id");
	}
	
	/**
	 * 取节点定义信息。
	 * @param processId -- 过程定义ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public Map<String,String> queryNode(String processId, String nodeId) {
		String sql = "select "+ _field_node +" from wf_node where process_id = ? and node_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(nodeId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 取结束节点定义信息。
	 * @param processId -- 过程定义ID
	 * @return
	 */
	public String queryEndNodeId(String processId) {
		String sql = "select node_id from wf_node where process_id = ? and node_type = 'end'";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		
		Map<String,String> mpNode = _dao.queryMap(param);
		if (mpNode.isEmpty()) {
			return "";
		}
		
		return mpNode.get("node_id");
	}
	
	/**
	 * 检查过程定义中是否有分支、聚合、子过程节点
	 * @param processId
	 * @return
	 */
	public boolean hasForkNode(String processId) {
		String sql = "select count(*) as cnt from wf_node where process_id = ? " +
					 "and node_type in ('fork', 'join', 'subprocess')";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		
		return MapUtil.hasRecord(_dao.queryMap(param));
	}
	
	/**
	 * 取任务属性定义信息。
	 * @param processId -- 过程定义ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public Map<String,String> queryNodeAttr(String processId, String nodeId) {
		String sql = "select "+ _field_nodeattr +" from wf_nodeattr where process_id = ? and node_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(nodeId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 取所有分配用户信息。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public List<Map<String,String>> queryAssignUser(String processId, String nodeId) {
		String sql = "select "+ _field_user +" from wf_user where process_id = ? and node_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(nodeId);
		
		return _dao.query(param);
	}
	
	/**
	 * 取节点的退回流转。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public List<Map<String,String>> queryBackLine(String processId, String nodeId) {
		String sql = "select "+ _field_line +" from wf_line where line_type = '1' and process_id = ? and source_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(nodeId);
		
		return _dao.query(param);
	}
	
	/**
	 * 取节点的流出流转。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public List<Map<String,String>> queryOutLine(String processId, String nodeId) {
		String sql = "select "+ _field_line +" from wf_line where line_type = '0' and process_id = ? and source_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(nodeId);
		
		return _dao.query(param);
	}
	
	/**
	 * 取节点的流入流转。
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public List<Map<String,String>> queryInLine(String processId, String nodeId) {
		String sql = "select "+ _field_line +" from wf_line where line_type = '0' and process_id = ? and target_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(nodeId);
		
		return _dao.query(param);
	}
}
