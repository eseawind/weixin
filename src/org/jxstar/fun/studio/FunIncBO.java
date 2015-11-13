/*
 * FunIncBO.java 2014-1-19
 * 
 * Copyright 2014 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.com
 */
package org.jxstar.fun.studio;

import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringUtil;
import org.jxstar.util.key.KeyCreator;

/**
 * 读取保持页面扩展文件的类：文件类型有grid, form, layout
 *
 * @author Tony Tan
 * @version 1.0 2014-1-19
 */
public class FunIncBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 取扩展文件内容
	 * @param funid
	 * @param type
	 * @return
	 */
	public String queryInc(String funid, String type) {
		String value = queryJs(funid, type);
		
		setReturnData("{'value':'"+ StringUtil.strForJson(value) +"'}");
		return _returnSuccess;
	}
	
	/**
	 * 保存扩展文件
	 * @param funid
	 * @param type
	 * @param value
	 * @return
	 */
	public String saveInc(String funid, String type, String value) {
		if (!hasInc(funid, type)) {
			if (!insertInc(funid, type, value)) return _returnFaild;
		} else {
			if (!updateInc(funid, type, value)) return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 删除扩展文件
	 * @param funid
	 * @param type
	 * @return
	 */
	public String deleteInc(String funid, String type) {
		String sql = "delete from fun_inc where fun_id = ? and page_type = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funid);
		param.addStringValue(type);
		
		if (!_dao.update(param)) return _returnFaild;
		
		return _returnSuccess;
	}
	
	/**
	 * 查询扩展INC文件
	 * @param funid
	 * @param type
	 * @return
	 */
	public String queryJs(String funid, String type) {
		String sql = "select fun_inc from fun_inc where fun_id = ? and page_type = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funid);
		param.addStringValue(type);
		
		Map<String,String> mp = _dao.queryMap(param);
		return MapUtil.getValue(mp, "fun_inc");
	}
	
	//是否有INC记录
	private boolean hasInc(String funid, String type) {
		String sql = "select count(*) as cnt from fun_inc where fun_id = ? and page_type = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funid);
		param.addStringValue(type);
		
		Map<String,String> mp = _dao.queryMap(param);
		return MapUtil.hasRecord(mp);
	}
	
	//新增一条INC记录
	private boolean insertInc(String funid, String type, String value) {
		String sql = "insert into fun_inc(inc_id, fun_id, page_type, fun_inc, add_date) values(?, ?, ?, ?, ?)";
		DaoParam param = _dao.createParam(sql);
		
		String incid = KeyCreator.getInstance().createKey("fun_inc");
		param.addStringValue(incid);
		param.addStringValue(funid);
		param.addStringValue(type);
		param.addStringValue(value);
		param.addDateValue(DateUtil.getTodaySec());
		
		return _dao.update(param);
	}
	
	//保存INC文件内容
	private boolean updateInc(String funid, String type, String value) {
		String sql = "update fun_inc set fun_inc = ? where fun_id = ? and page_type = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(value);
		param.addStringValue(funid);
		param.addStringValue(type);
		
		return _dao.update(param);
	}
	
}
