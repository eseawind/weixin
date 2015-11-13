/*
 * Copyright(c) 2014 DongHong Inc.
 */
package org.jxstar.service.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 导出系统菜单。
 *
 * @author TonyTan
 * @version 1.0, 2014-3-3
 */
public class ExpMenuBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 构建csv格式的数据
	 * @return
	 */
	public String buildMenuTxt() {
		int cnt1 = 0, cnt2 = 0;
		List<String[]> lsMenu = FactoryUtil.newList();
		List<Map<String,String>> lsOne = queryModule("");
		for (Map<String,String> mpOne : lsOne) {
			String one_id = mpOne.get("module_id");
			
			List<Map<String,String>> lsTwo = queryTwoModule("module_id like '"+ one_id +"%'");
			for (Map<String,String> mpTwo : lsTwo) {
				String two_id = mpTwo.get("module_id");
				
				List<Map<String,String>> lsFun = queryFun(two_id);
				
				for (Map<String,String> mpFun : lsFun) {
					//新建一条菜单记录
					String[] menus = new String[3];
					if (cnt1 == 0) {
						menus[0] = mpOne.get("module_name");
					} else {
						menus[0] = "";
					}
					cnt1++;
					
					if (cnt2 == 0) {
						menus[1] = mpTwo.get("module_name");
					} else {
						menus[1] = "";
					}
					cnt2++;
					
					menus[2] = mpFun.get("fun_name");
					
					lsMenu.add(menus);
				}
				cnt2 = 0;
			}
			cnt1 = 0;
		}
		
		StringBuilder sbstr = new StringBuilder();
		for (String[] strs : lsMenu) {
			sbstr.append(strs[0]+","+strs[1]+","+strs[2]+"\r\n");
		}
		
		return sbstr.toString();
	}
	
	/**
	 * 取二级模块对应的功能ID
	 * @param moduleId -- 二级模块ID
	 * @return List
	 */
	private List<Map<String,String>> queryFun(String moduleId) {
		StringBuilder sbsql = new StringBuilder();
		sbsql.append("select fun_id, fun_name from fun_base where module_id = ? and reg_type in ('main', 'treemain') order by fun_index");
		
		DaoParam param = _dao.createParam(sbsql.toString());
		param.addStringValue(moduleId);
		return _dao.query(param);
	}
	
	/**
	 * 取二级模块信息
	 * @param twoWhere -- 二级模块ID过滤语句
	 * @return List
	 */
	private List<Map<String,String>> queryTwoModule(String twoWhere) {
		StringBuilder sbsql = new StringBuilder();
		sbsql.append("select module_id, module_name, is_expanded from funall_module ");
		sbsql.append("where module_level = 2 and is_show = '1' ");
		if (twoWhere != null && twoWhere.length() > 0) {
			sbsql.append(" and " + twoWhere);
		}
		sbsql.append(" order by module_index");
		
		DaoParam param = _dao.createParam(sbsql.toString());
		return _dao.query(param);
	}
	
	/**
	 * 取一级模块信息
	 * @param oneWhere -- 一级模块ID过滤语句
	 * @return List
	 */
	private List<Map<String,String>> queryModule(String oneWhere) {
		StringBuilder sbsql = new StringBuilder();
		sbsql.append("select module_id, module_name, is_expanded from funall_module ");
		sbsql.append("where module_level = 1 and is_show = '1' ");
		if (oneWhere != null && oneWhere.length() > 0) {
			sbsql.append(" and " + oneWhere);
		}
		sbsql.append(" order by module_index");
		
		DaoParam param = _dao.createParam(sbsql.toString());
		return _dao.query(param);
	}
}
