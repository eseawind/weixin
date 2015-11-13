/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.fun.design.parser;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.util.MapUtil;
import org.jxstar.util.log.Log;

/**
 * 设计扩展属性解析。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-13
 */
public class FunAttrParser {
	private static BaseDao _dao = BaseDao.getInstance();
	private static Log _log = Log.getInstance();
	
	/**
	 * 解析功能中某类扩展属性
	 * @param funId
	 * @param attrType
	 * @return
	 */
	public static String parseAttr(String funId, String attrType) {
		StringBuilder sbRet = new StringBuilder();
		if (funId == null || funId.length() == 0 ||
			attrType == null || attrType.length() == 0) {
			return sbRet.toString();
		}
		
		List<Map<String,String>> lsAttr = queryAttr(funId, attrType);
		if (lsAttr.isEmpty()) return sbRet.toString();
		
		int cnt = 0;
		for (Map<String,String> mpAttr : lsAttr) {
			String attrNo = mpAttr.get("attr_no");
			String attrName = mpAttr.get("attr_name");
			String attrValue = mpAttr.get("attr_value");
			
			String attrTpl = queryAttrTpl(attrNo, attrName, attrType);
			if (attrTpl.length() == 0) continue;
			
			cnt++;
			//替换模板中的值
			attrTpl = attrTpl.replace("{attrvalue}", attrValue);
			if (cnt > 1) {
				sbRet.append("\t");
			}
			sbRet.append(attrTpl).append("\r\n");
		}
		_log.showDebug("........parse funAttr=" + sbRet.toString());
		
		return sbRet.toString();
	}
	
	/**
	 * 查询当前功能定义的扩展属性
	 * @param funId
	 * @param attrType
	 * @return
	 */
	private static List<Map<String,String>> queryAttr(String funId, String attrType) {
		String sql = "select attr_no, attr_name, attr_value from fun_attr where fun_id = ? and attr_type = ? order by attr_no";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(attrType);
		
		return _dao.query(param);
	}
	
	/**
	 * 取扩展属性解析后的模板
	 * @param attrNo -- 避免属性名称相同的问题
	 * @param attrName
	 * @param attrType
	 * @return
	 */
	private static String queryAttrTpl(String attrNo, String attrName, String attrType) {
		String sql = "select attr_tpl from fun_attr where fun_id = 'basestatic' and attr_no = ? and attr_name = ? and attr_type = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(attrNo);
		param.addStringValue(attrName);
		param.addStringValue(attrType);
		
		Map<String,String> mp = _dao.queryMap(param);
		return MapUtil.getValue(mp, "attr_tpl");
	}
}
