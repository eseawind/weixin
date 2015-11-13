package org.jxstar.total.util;

import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.service.util.TaskUtil;
import org.jxstar.util.MapUtil;

/**
 * 运算表达式计算处理类，表达式格式如：[field1]+[field2]-[field3]，
 * 支持加减乘除等运算符号，字段名必须用[]括住。
 * 处理原理：把字段用具体的值替代，必须是数字，然后写一条SQL运算取值。
 *
 * @author TonyTan
 * @version 1.0, 2011-12-1
 */
public class Expression {
	/**
	 * 计算表达式的结果
	 * @param mpData -- 用于运算值
	 * @param express -- 表达式
	 * @return
	 */
	public static String calc(Map<String,String> mpData, String express) {
		if (mpData == null || mpData.isEmpty()) return "0";
		if (express == null || express.length() == 0) return "0";
		
		//解析表达式中的字段名
		express = TaskUtil.parseAppField(express, mpData, false);
		
		return getValue(express);
	}
	
	//取表达式的值
	private static String getValue(String express) {
		BaseDao _dao = BaseDao.getInstance();
		String sql = "select ("+ express +") as val from fun_base where fun_id = 'rpt_list'";
		
		DaoParam param = _dao.createParam(sql);
		Map<String,String> mp = _dao.queryMap(param);
		
		return MapUtil.getValue(mp, "val", "0");
	}
}
