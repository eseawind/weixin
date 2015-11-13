/*
 * PageParser.java 2009-9-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.fun.design.parser;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jxstar.util.factory.FactoryUtil;


/**
 * GRID页面解析类
 *
 * @author TonyTan
 * @version 1.0, 2009-9-27
 */
public class GridPageParser extends PageParser {
	private static final long serialVersionUID = 1L;
	
	public GridPageParser(String funId, String pageType, String path,
			boolean isrun) {
		super(funId, pageType, path, isrun);
	}
	
	/**
	 * 解析控件的值
	 * @param name
	 * @return
	 */
	protected String elementValue(String name) {
		String ret = "";
		
		if (name.equals("columnModel")) {
			GridParserUtil colParser = new GridParserUtil();

			//取设计信息
			List<Map<String,String>> designData = parseDesignData(_designPage);
			
			String tableName = _funDefine.get("table_name");
			ret = colParser.parse(_funId, tableName, designData);
		} else if (name.equals("incPage")) {
			//表格设计时不添加INC文件
			if (_isrun) {
				ret = "";
			} else {
				ExtPageParser extParser = new ExtPageParser();
	
				ret = extParser.parse(_funId, "grid", _realPath);
				
				if (ret.length() > 0) {//去掉换行符，不然前台取不到文件
					ret = ret.trim();
				}
			}
		} else if (name.equals("funAttr")) {
			ret = FunAttrParser.parseAttr(_funId, "grid");
		} else {
			ret = _elementTpl.get(name);
		}
		
		return ret;
	}
	
	/**
	 * 解析参数的值
	 * @param name
	 * @return
	 */
	protected String paramValue(String name) {
		return _funDefine.get(name);
	}
	
	/**
	 * 解析设计数据，格式：{n:colname,w:width,h:hidden}-{}-...
	 * 以前用-分割，现在用{}匹配，防止某些字段名或表名中含-
	 * @return
	 */
	private List<Map<String,String>> parseDesignData(String data) {
		List<Map<String,String>> lsData = FactoryUtil.newList();
		
		if (data == null || data.length() == 0) {
			return lsData;
		}
		
		Pattern p = Pattern.compile("\\{[^}]+\\}");
		Matcher m = p.matcher(data);
		while (m.find()) {
			String param = m.group();
			param = param.substring(1, param.length()-1);
			
			String[] params = param.split(",");
			
			Map<String,String> mp = FactoryUtil.newMap();
			for (int j = 0; j < params.length; j++) {
				String[] ps = params[j].split(":");
				if (ps.length < 2) continue;
				mp.put(ps[0], ps[1]);
			}
			
			lsData.add(mp);
		}
		
		return lsData;
	}
}
