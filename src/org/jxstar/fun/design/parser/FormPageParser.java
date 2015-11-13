/*
 * FormPageParser.java 2009-10-31
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.fun.design.parser;


/**
 * FORM页面解析类。
 *
 * @author TonyTan
 * @version 1.0, 2009-10-31
 */
public class FormPageParser extends PageParser {
	private static final long serialVersionUID = 1L;
	
	public FormPageParser(String funId, String pageType, String path,
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
		
		if (_designPage == null || _designPage.length() == 0) {
			_log.showWarn("designPage is null!");
			return "";
		}
		
		if (name.equals("items")) {
			FormParserUtil fieldParser = new FormParserUtil();
			
			String tableName = _funDefine.get("table_name");
			ret = fieldParser.parse(_funId, tableName, _designPage);
		} else if (name.equals("incPage")) {
			ExtPageParser extParser = new ExtPageParser();

			ret = extParser.parse(_funId, "form", _realPath);
			
			if (ret.length() > 0) {//去掉换行符，不然前台取不到文件
				ret = ret.trim();
			}
		} else if (name.equals("funAttr")) {
			ret = FunAttrParser.parseAttr(_funId, "form");
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
}
