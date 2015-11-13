/*
 * GridQuery.java 2011-10-26
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.service.query;

import java.util.List;
import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.studio.AttachRelatBO;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 查询当前表格中显示记录的相关附件信息。
 *
 * @author TonyTan
 * @version 1.0, 2011-10-26
 */
public class AttachQuery extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 支持查询关联附件
	 * @param requestContext
	 * @return
	 */
	public String query(String tableName, String keyIds) {
		return query(tableName, keyIds, "0", "");
	}
	public String query(String tableName, String keyIds, String qryRelat) {
		return query(tableName, keyIds, qryRelat, "");
	}
	public String query(RequestContext request) {
		String tableName = request.getRequestValue("tablename");
		String keyIds = request.getRequestValue("keyids");
		String qryRelat = request.getRequestValue("is_queryrelat");
		String attachType = request.getRequestValue("attach_type");
		query(tableName, keyIds, qryRelat, attachType);
		
		return _returnSuccess;
	}
	
	/**
	 * 取某个表是附件标志
	 * @param tableName -- 当前表
	 * @param keyIds -- 当前显示的记录ID，格式如：key1,key2,key3...
	 * @param qryRelat -- 是否支持关联查询
	 * @return
	 */
	public String query(String tableName, String keyIds, String qryRelat, String attachType) {
		//_log.showDebug("------------query attach, tablename=" + tableName + ";keyids=" + keyIds);
		
		if (tableName == null || tableName.length() == 0) return _returnSuccess;
		if (keyIds == null || keyIds.length() == 0) return _returnSuccess;
		
		//取附件记录
		String sql = "select data_id, attach_id, attach_name, content_type, fun_id, attach_type from sys_attach " +
				"where table_name = ? and data_id in " + keyIns(keyIds) + " order by data_id";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tableName);
		List<Map<String,String>> lsData = _dao.query(param);
		
		//取关联附件
		if (qryRelat.equals("1")) {
			AttachRelatBO relatbo = new AttachRelatBO();
			List<Map<String,String>> lsRelat = relatbo.queryRelatMore(tableName, keyIds);
			//要根据原数据ID顺序插入相关附件记录，方便前台数据处理
			lsData = insertRelat(lsData, lsRelat);
		}
		
		if (lsData.isEmpty()) return _returnSuccess;
		
		Map<String,String> keyIndex = getMap(keyIds);
		StringBuilder sbJson = new StringBuilder();
		for (int i = 0, n = lsData.size(); i < n; i++) {
			Map<String,String> mpData = lsData.get(i);
			//如果设置了附件类型过滤，不同类型的附件不显示
			String attach_type = MapUtil.getValue(mpData, "attach_type");
			if (attachType != null && attachType.length() > 0) {
				if (!attachType.equals(attach_type)) {
					continue;
				}
			}
			
			//关联附件标记
			String is_relat = MapUtil.getValue(mpData, "is_relat", "0");
			String dataid = mpData.get("data_id");
			String json = "{row_num:"+ keyIndex.get(dataid) +", " +
					"data_id:'"+ dataid +"', " +
					"attach_id:'"+ mpData.get("attach_id") +"', " +
					"attach_name:'"+ mpData.get("attach_name") +"', " +
					"fun_id:'"+ mpData.get("fun_id") +"', " +
					"is_relat:'"+ is_relat +"', " +
					"attach_type:'"+ attach_type +"', " +
					"content_type:'"+ mpData.get("content_type") +"'},";
			
			sbJson.append(json);
		}
		String jsdata = "[]";
		if (sbJson.length() > 0) {
			jsdata = "[" + sbJson.substring(0, sbJson.length()-1) + "]";
		}
		//_log.showDebug("query attach json=" + jsdata);
		
		//返回查询数据
		setReturnData(jsdata);
		
		return _returnSuccess;
	}
	
	//保存主键值的序号
	private Map<String,String> getMap(String keyIds) {
		Map<String,String> mpkeys = FactoryUtil.newMap();
		String[] keys = keyIds.split(",");
		for (int i = 0; i < keys.length; i++) {
			mpkeys.put(keys[i], Integer.toString(i));
		}
		return mpkeys;
	}
	
	private String keyIns(String keyIds) {
		String keyIns = keyIds.replaceAll(",", "','");
		
		return "('" + keyIns + "')";
	}
	
	//按顺序添加关联附件
	private List<Map<String,String>> insertRelat(
			List<Map<String,String>> lsData, List<Map<String,String>> lsRelat) {
		if (lsRelat.isEmpty()) return lsData;
		if (lsData.isEmpty()) return lsRelat;
		
		for (Map<String,String> mp : lsRelat) {
			String data_id = mp.get("data_id");
			boolean has = false;//是否找到了相同的记录ID
			
			for (int n = lsData.size(), i = n-1; i >= 0; i--) {
				Map<String,String> tomp = lsData.get(i);
				//如果找到相同记录ID，则在旁边添加关联附件
				if (data_id.equals(tomp.get("data_id"))) {
					lsData.add(i, mp);
					has = true;
				}
			}
			//没有找到相同的记录ID，则直接添加
			if (!has) {
				lsData.add(mp);
			}
		}
		
		return lsData;
	}
}
