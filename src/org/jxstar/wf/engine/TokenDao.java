/*
 * TokenDao.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.engine;

import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.DmDao;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.define.Node;
import org.jxstar.wf.define.WfDefineManager;

/**
 * 过程标记查询类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class TokenDao {
	private BaseDao _dao = BaseDao.getInstance();
	private static TokenDao _instance = new TokenDao();

	private TokenDao(){}
	/**
	 * 构建单例对象。
	 * @return
	 */
	public static TokenDao getInstance() {
		return _instance;
	}
	
	/**
	 * 检查指定的标记对象是否存在。
	 * @param tokenId -- 标记ID
	 * @return boolean
	 */
	public boolean existToken(String tokenId) {
		String sql = "select count(*) as cnt from wf_token where token_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tokenId);
		
		Map<String,String> mpToken = _dao.queryMap(param);
		return MapUtil.hasRecord(mpToken);
	}

	/**
	 * 检查是否存在没有到达指定节点的子标记，聚合节点流转的判断条件。
	 * @param parentId -- 父标记ID
	 * @param nodeId -- 节点ID
	 * @return boolean
	 */
	public boolean noArriveNode(String parentId, String nodeId) {
		String sql = "select count(*) as cnt from wf_token where parent_id = ? and node_id <> ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(parentId);
		param.addStringValue(nodeId);
		
		Map<String,String> mpToken = _dao.queryMap(param);
		return MapUtil.hasRecord(mpToken);
	}
	
	/**
	 * 根据过程实例ID与节点ID创建标记对象。
	 * @param instanceId -- 实例ID
	 * @param nodeId -- 节点ID
	 * @return Token
	 */
	public Token restoreToken(String instanceId, String nodeId) throws WfException {
		String sql = "select instance_id, process_id, node_id, parent_id, token_id from wf_token where instance_id = ? and node_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		param.addStringValue(nodeId);
		
		Map<String,String> mpToken = _dao.queryMap(param);
		if (mpToken.isEmpty()) {//"没有找到【{0}】实例与【{1}】节点的标记数据！"
			throw new WfException(JsMessage.getValue("tokendao.nonode"), instanceId, nodeId);
		}
		
		String processId = mpToken.get("process_id");
		
		Token token = new Token();
		token.setTokenId(mpToken.get("token_id"));
		token.setParentId(mpToken.get("parent_id"));
		token.setNodeId(mpToken.get("node_id"));
		token.setProcessId(processId);
		token.setInstanceId(mpToken.get("instance_id"));
		
		//构建节点对象
		WfDefineManager manager = WfDefineManager.getInstance();
		Node node = manager.createNode(processId, nodeId);
		token.setNode(node);
		
		return token;
	}
	
	/**
	 * 新增保存过程标记对象，在过程实例启动时新增，在过程实例完成时删除。
	 * @param processContext -- 过程上下文对象
	 * @return boolean
	 */
	public boolean insertToken(ProcessContext context) throws WfException {
		Map<String,String> mpData = FactoryUtil.newMap();
		
		ProcessInstance instance = context.getProcessInstance();
		mpData.put("process_id", instance.getProcessId());
		mpData.put("instance_id", instance.getInstanceId());
		
		Token token = context.getToken();
		mpData.put("node_id", token.getNodeId());
		mpData.put("parent_id", token.getParentId());
		
		mpData.put("add_date", DateUtil.getTodaySec());
		
		String tokenId = DmDao.insert("wf_token", mpData);
		if (tokenId.length() == 0) return false;
		
		//设置新的标记ID
		token.setTokenId(tokenId);
		return true;
	}
	
	/**
	 * 修改过程标记当前指向的节点ID。
	 * @param tokenId -- 标记ID
	 * @param nodeId -- 节点ID
	 * return boolean
	 */
	public boolean updateToken(String tokenId, String nodeId) throws WfException {
		String sql = "update wf_token set node_id = ? where token_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(nodeId);
		param.addStringValue(tokenId);
		
		return _dao.update(param);
	}
	
	/**
	 * 删除指定的过程标记ID。
	 * @param tokenId -- 标记ID
	 * @return boolean
	 */
	public boolean deleteToken(String tokenId) throws WfException {
		String sql = "delete from wf_token where token_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tokenId);
		
		return _dao.update(param);
	}
	
	/**
	 * 删除指定父标记的所有子标记节点。
	 * @param parentId -- 父标记ID
	 * @return boolean
	 */
	public boolean deleteSubToken(String parentId) throws WfException {
		String sql = "delete from wf_token where parent_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(parentId);
		
		return _dao.update(param);
	}
}
