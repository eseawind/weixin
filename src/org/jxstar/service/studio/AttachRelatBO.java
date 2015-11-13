/*
 * Copyright(c) 2013 DongHong Inc.
 */
package org.jxstar.service.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.factory.SystemFactory;

/**
 * 查询关联附件处理类：
 * 采用关联SQL或自定义类的方式取关联附件，容易定义与理解，而且关联附件更灵活。
 *
 * @author TonyTan
 * @version 1.0, 2013-10-21
 */
public class AttachRelatBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 查询关联附件。
	 * @param funId
	 * @param dataId
	 * @return
	 */
	public String onRelatAttach(String funId, String dataId) {
		//取表名
		Map<String,String> mpFun = queryFun(funId);
		String tableName = MapUtil.getValue(mpFun, "table_name");
		List<Map<String,String>> lsRet = queryRelatAttach(tableName, dataId);
		
		StringBuilder sbJson = new StringBuilder();
		for (int i = 0, n = lsRet.size(); i < n; i++) {
			Map<String,String> mpData = lsRet.get(i);
			
			String dataid = mpData.get("data_id");
			String json = "{data_id:'"+ dataid +"', " +
					"attach_id:'"+ mpData.get("attach_id") +"', " +
					"attach_name:'"+ mpData.get("attach_name") +"', " +
					"fun_id:'"+ mpData.get("fun_id") +"', " +
					"content_type:'"+ mpData.get("content_type") +"'},";
			
			sbJson.append(json);
		}
		String jsdata = "[]";
		if (sbJson.length() > 0) {
			jsdata = "[" + sbJson.substring(0, sbJson.length()-1) + "]";
		}
		_log.showDebug("query relat attach json=" + jsdata);
		
		//返回查询数据
		setReturnData(jsdata);
		
		return _returnSuccess;
	}
	
	/**
	 * 取多条件记录的关联附件
	 * @param tableName -- 数据表名
	 * @param dataIds -- 多个记录ID，用,分隔
	 * @return
	 */
	public List<Map<String,String>> queryRelatMore(String tableName, String dataIds) {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		if (tableName == null || tableName.length() == 0 || 
				dataIds == null || dataIds.length() == 0) {
			return lsRet;
		}
		
		String[] keyIds = dataIds.split(",");
		for (String keyId : keyIds) {
			List<Map<String,String>> ls = queryRelatAttach(tableName, keyId);
			//关联附件对应关系处理
			for (Map<String,String> mp : ls) {
				String data_id = MapUtil.getValue(mp, "data_id");
				mp.put("data_id", keyId);		//识别此附件显示在哪行数据中
				mp.put("is_relat", "1");		//标记是关联附件
				mp.put("src_data_id", data_id);	//记录关联来源的数据ID
			}
			
			lsRet.addAll(ls);
		}
		
		return lsRet;
	}

	/**
	 * 查询关联附件，附件列标志中可以调用。
	 * @param tableName
	 * @param dataId
	 * @return
	 */
	public List<Map<String,String>> queryRelatAttach(String tableName, String dataId) {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		_log.showDebug("...........det relat in dataid:" + dataId);
		
		List<Map<String,String>> lsSet = queryRelatSet(tableName);
		for (Map<String,String> mpSet : lsSet) {
			String tagTable = mpSet.get("target_table");
			if (tagTable.length() == 0) continue;
			
			String[] tagIds = queryTargetIds(dataId, mpSet);
			
			for (String tagId : tagIds) {
				lsRet.addAll(queryAttach(tagTable, tagId));
			}
		}
		_log.showDebug("...........all relat size:" + lsRet.size());
		
		return lsRet;
	}
	
	//取附件记录
	private List<Map<String,String>> queryAttach(String tableName, String dataId) {
		String sql = "select data_id, attach_id, attach_name, content_type, fun_id, attach_type from sys_attach " +
				"where table_name = ? and data_id = ? order by data_id";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tableName);
		param.addStringValue(dataId);
		return _dao.query(param);
	}
	
	//根据表名查询当前功能的附件关联定义
	private List<Map<String,String>> queryRelatSet(String tableName) {
		String sql = "select table_name, target_table, use_class, relat_sql from sys_attach_relat where is_valid = '1' and table_name = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tableName);
		
		return  _dao.query(param);
	}
	
	//根据关联附件定义取目标表的附件
	private String[] queryTargetIds(String dataId, Map<String,String> mpSet) {
		String[] ret = new String[0];
		String target_table = mpSet.get("target_table");
		String use_class = MapUtil.getValue(mpSet, "use_class", "0");
		String relat_sql = mpSet.get("relat_sql");
		_log.showDebug("...........use_class=" + use_class + ";relat_sql=" + relat_sql + ";target_table=" + target_table);
		
		if (use_class.equals("0")) {
			ret = queryTargetIds(relat_sql, dataId);
		} else {
			Object object = SystemFactory.createObject(relat_sql);
			if (object != null) {
				AttachRelatI custom = (AttachRelatI) object;
				ret = custom.queryDataId(dataId);
				if (ret == null) ret = new String[0];
			}
		}
		
		return ret;
	}
	
	/**
	 * 根据关联SQL查询目标表的主键值，SQL示列如：
	 * select mat_id from base_mat_code where mat_id in 
	 * (select mat_id from dev_task_mat where task_matid = ?)
	 * 
	 */
	private String[] queryTargetIds(String sql, String dataId) {
		String[] ret = new String[0];
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(dataId);
		
		List<Map<String,String>> ls = _dao.query(param);
		if (ls.isEmpty()) {
			return ret;
		}
		
		ret = new String[ls.size()];
		for (int i = 0, n = ls.size(); i < n; i++) {
			Map<String,String> mp = ls.get(i);
			
			ret[i] = mp.values().iterator().next();
		}
		return ret;
	}
	
	//取功能定义信息
	private Map<String,String> queryFun(String funId) {
		String sql = "select table_name, pk_col from fun_base where fun_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		
		return  _dao.queryMap(param);
	}
}
