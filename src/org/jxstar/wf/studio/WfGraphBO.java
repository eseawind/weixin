/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.wf.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.util.BigFieldUtil;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.define.DefineDataManger;
import org.jxstar.service.util.TaskUtil;
import org.jxstar.util.ArrayUtil;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.key.KeyCreator;
import org.jxstar.util.resource.JsMessage;

/**
 * 导航流程图设计器处理类。
 *
 * @author TonyTan
 * @version 1.0, 2012-11-8
 */
public class WfGraphBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 读取设计文件
	 * @param graphId
	 * @return
	 */
	public String readDesign(String graphId) {
		String sql = "select design_file from wfnav_design where graph_id = '"+ graphId +"'";
		String fieldName = "design_file";
		String dsName = "default";
		
		String xmlfile = BigFieldUtil.readStream(sql, fieldName, dsName);
		//_log.showDebug("---------xmlfile:" + xmlfile);
		
		if (xmlfile != null && xmlfile.length() > 0) {
			xmlfile = "<?xml version='1.0' encoding='utf-8'?>" + xmlfile;
			setReturnData(xmlfile);
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 保存设计文件
	 * @param graphId
	 * @return
	 */
	public String saveDesign(RequestContext request) {
		String userId = request.getUserInfo().get("user_id");
		String graphId = request.getRequestValue("graph_id");
		
		String xmlfile = request.getRequestValue("xmlfile");
		_log.showDebug("xmlfile=" + xmlfile);
		if (!saveDesignFile(graphId, userId, xmlfile)) {//"保存流转设计文件失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error06"));
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	private boolean saveDesignFile(String graphId, String userId, String xmlfile) {
		String csql = "select count(*) as cnt from wfnav_design where graph_id = ?";
		DaoParam param = _dao.createParam(csql);
		param.addStringValue(graphId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		//如果没有设计文件，则新增设计记录
		if (!MapUtil.hasRecord(mpCnt)) {
			if (!insertDesignFile(graphId, userId)) return false;
		} else {
			String usql = "update wfnav_graph set modify_date = ?, modify_userid = ? where graph_id = ?";
			DaoParam uparam = _dao.createParam(usql);
			uparam.addDateValue(DateUtil.getTodaySec());
			uparam.addStringValue(userId);
			uparam.addStringValue(graphId);
			
			if (!_dao.update(uparam)) return false;
		}
		
		//保存设计文件
		String usql = "update wfnav_design set design_file = ? where graph_id = '"+ graphId +"'";
		BigFieldUtil.updateStream(usql, xmlfile, "default");
		
		return true;
	}
	
	private boolean insertDesignFile(String graphId, String userId) {
		String isql = "insert into wfnav_design(design_id, graph_id, add_userid, add_date) " +
					  "values(?, ?, ?, ?)";
		DaoParam param = _dao.createParam(isql);
		String keyId = KeyCreator.getInstance().createKey("wfnav_graph");
		param.addStringValue(keyId);
		param.addStringValue(graphId);
		param.addStringValue(userId);
		param.addDateValue(DateUtil.getTodaySec());
		
		return _dao.update(param);
	}

	/**
	 * 删除设计文件
	 * @param graphId
	 * @return
	 */
	public String deleteDesign(String graphId) {
		deleteDefine(graphId, "wfnav_node");
		deleteDefine(graphId, "wfnav_design");
		
		return _returnSuccess;
	}
	
	private boolean deleteDefine(String graphId, String tableName) {
		String sql = "delete from "+ tableName +" where graph_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(graphId);
		return _dao.update(param);
	}
	
	/**
	 * 根据节点ID取功能ID与扩展where
	 * @param graphId
	 * @param nodeId
	 * @return
	 */
	public String queryNode(String graphId, String nodeId) {
		String sql = "select fun_id, where_sql, where_value, where_type from wfnav_node where node_id = ? and graph_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(nodeId);
		param.addStringValue(graphId);
		
		Map<String,String> mpNode = _dao.queryMap(param);
		
		if (!mpNode.isEmpty()) {
			StringBuilder sbJson = new StringBuilder();
			sbJson.append("{fun_id:'"+ mpNode.get("fun_id") +"',");
			sbJson.append("where_sql:'"+ StringUtil.strForJson(mpNode.get("where_sql")) +"',");
			sbJson.append("where_value:'"+ StringUtil.strForJson(mpNode.get("where_value")) +"',");
			sbJson.append("where_type:'"+ mpNode.get("where_type") +"'}");
		
			setReturnData(sbJson.toString());
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 查询当前导航图中的所有功能节点的功能ID与节点ID
	 * @param graphId
	 * @return
	 */
	public String queryGraphFun(String graphId) {
		String sql = "select fun_id, node_id from wfnav_node where graph_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(graphId);
		
		List<Map<String,String>> ls = _dao.query(param);
		String json = ArrayUtil.listToJson(ls);
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 查询当前导航图各节点是否有数据
	 * @param graphId
	 * @param dataValue
	 * @return
	 */
	public String queryDataFlag(String graphId, String dataValue) {
		String sql = "select fun_id, fun_name, where_sql, where_value, where_type, node_id from wfnav_node where graph_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(graphId);
		List<Map<String,String>> lsNode = _dao.query(param);
		
		StringBuilder sbjson = new StringBuilder("[");
		for (Map<String,String> mpNode : lsNode) {
			String fun_id = mpNode.get("fun_id");
			String node_id = mpNode.get("node_id");
			int cnt = queryFunData(mpNode, dataValue);
			
			sbjson.append("{node_id:'"+ node_id +"', fun_id:'"+ fun_id +"', cnt:"+ cnt +"},");
		}
		
		if (sbjson.length() > 5) {
			String json = sbjson.substring(0, sbjson.length()-1) + "]";
			setReturnData(json);
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 查询某个功能是否有数据，支持带扩展where
	 * @param mpNode
	 * @param dataValue -- 值的格式为：name1=value1&name2=value2...
	 * @return
	 */
	private int queryFunData(Map<String,String> mpNode, String dataValue) {
		//导航节点中的设置属性
		String fun_id = mpNode.get("fun_id");
		String fun_name = mpNode.get("fun_name");
		_log.showDebug("-------------queryfundata fun_id=" + fun_id + "; fun_name=" + fun_name);
		
		String where_sql = mpNode.get("where_sql").trim();
		String where_value = mpNode.get("where_value").trim();//格式为：[name1];[name2]
		String where_type = mpNode.get("where_type").trim();
		
		DefineDataManger manger = DefineDataManger.getInstance();
		Map<String,String> mpFun = manger.getFunData(fun_id);
		
		String from_sql = mpFun.get("from_sql");
		String fun_where = mpFun.get("where_sql").trim();
		
		if (from_sql.length() == 0) {
			_log.showDebug("from_sql or where_sql is null!");
			return 0;
		}
		
		StringBuilder sql = new StringBuilder("select count(*) as cnt ");
		sql.append(from_sql);
		if (fun_where.length() > 0) {
			sql.append(" where ").append(fun_where);
			if (where_sql.length() > 0) {
				sql.append(" and ").append(where_sql);
			}
		} else {
			if (where_sql.length() > 0) {
				sql.append(" where ").append(where_sql);
			}
		}
		
		DaoParam param = _dao.createParam(sql.toString());
		if (where_type.length() > 0) {
			param.setType(where_type);
		}
		if (where_value.length() > 0) {
			//解析页面传递的where_value
			Map<String,String> mpValue = parseValue(dataValue);
			
			_log.showDebug("-------------queryfundata value=" + where_value + "; mp=" + mpValue);
			
			where_value = TaskUtil.parseAppField(where_value, mpValue, false);
			param.setValue(where_value);
		}
		_log.showDebug("-------------queryfundata where_sql=" + sql.toString());
		_log.showDebug("-------------queryfundata where_value=" + where_value);
		_log.showDebug("-------------queryfundata where_type=" + where_type);
		
		Map<String,String> mpCnt = _dao.queryMap(param);
		return Integer.parseInt(mpCnt.get("cnt"));
	}
	
	/**
	 * 解析前台请求参数中的值，格式为：name1=value1&name2=value2...
	 * @param dataValue
	 * @return
	 */
	private Map<String,String> parseValue(String dataValue) {
		Map<String,String> mp = FactoryUtil.newMap();
		
		if (dataValue == null || dataValue.length() == 0) {
			return mp;
		}
		
		String[] values = dataValue.split("&");
		for(String value : values) {
			String[] items = value.split("=");
			mp.put(items[0], items[1]);
		}
		
		return mp;
	}
}
