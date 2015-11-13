/*
 * ControlParserUtil.java 2010-10-15
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.total.util;

import java.util.List;
import java.util.Map;

import org.jxstar.fun.design.templet.ElementTemplet;
import org.jxstar.util.MapUtil;

/**
 * 统计报表的统计条件控件解析工具类，参照FORM页面解析控件实现。
 *
 * @author TonyTan
 * @version 1.0, 2010-10-15
 */
public class ConditionJson {
	
	//取元素模板文件
	private Map<String,String> _elementTpl = null;
	//当前功能ID
	private String _funId = "";
	//用于保存当前FORM的选项数据
	private StringBuilder _comboData = new StringBuilder();
	
	/**
	 * 解析指定控件字段信息
	 * @param funid -- 功能ID
	 * @param lsDesign -- 控件字段信息
	 * @return
	 */
	public String parse(String funid, List<Map<String,String>> lsDesign) {
		_funId = funid;
		
		//取元素模板文件
		_elementTpl = ElementTemplet.getInstance().getElementMap("form");
		//统计条件JSON
		String condJs = parserField(lsDesign);
		if (condJs.length() == 0) {
			condJs = "{text:' '}";
		}
		
		//工具栏构建JSON
		String toolId = funid + "_tool_qv";
		String toolJs = "var tbar = new Ext.Toolbar({name:'"+ toolId +"', deferHeight:true, items:["+ condJs +"]});";
		
		//返回工具栏JSON
		StringBuilder sbjs = new StringBuilder("function(){");
		sbjs.append(_comboData);
		sbjs.append(toolJs);
		sbjs.append("\r\nreturn tbar;}");
		
		return sbjs.toString();
	}
	
	/**
	 * 解析统计参数控件
	 * @param lsDesign -- 统计参数信息
	 * @return
	 */
	private String parserField(List<Map<String,String>> lsDesign) {
		if (lsDesign.isEmpty()) return "";
		//本列字段信息
		StringBuilder sbColumn = new StringBuilder();
		sbColumn.append("\r\n");
		
		//解析fielditem元素
		String fieldJs = "";
		for (int i = 0, n = lsDesign.size(); i < n; i++) {
			Map<String,String> mpColumn = lsDesign.get(i);
			
			//解析字段控件
			fieldJs = fieldJs(mpColumn);
			
			//取字段控件信息
			String ctlType = mpColumn.get("col_control");
			String ctlName = mpColumn.get("control_name");
			
			//添加选项数据
			if (ctlType.equals("combo")) {
				if (_comboData.length() > 0) _comboData.append("\t");
				_comboData.append("var Data"+ctlName+" = Jxstar.findComboData('"+ctlName+"');\r\n");
			}
			//拼接条件标题
			String isshow = mpColumn.get("is_show");
			String title = mpColumn.get("col_name");
			if (isshow.equals("1") && title.length() > 0) {
				sbColumn.append("{text:'"+ title +":', xtype:'tbtext'},");
			}
			
			//拼接字符串
			sbColumn.append(fieldJs + ",\r\n");
		}
		//最后去掉三个结尾字符
		String sret = sbColumn.substring(0, sbColumn.length()-3);
		
		return sret;
	}
	
	/**
	 * 解析字段控件的脚本
	 * 
	 * @param mpColumn
	 * @return
	 */
	private String fieldJs(Map<String,String> mpColumn) {
		String ctlType = mpColumn.get("col_control");
		String ctlName = mpColumn.get("control_name");
		String colCode = mpColumn.get("col_code");
		
		//取模板中的控件定义
		String retJs = _elementTpl.get(ctlType).trim();
		
		//处理字段控件显示宽度
		String anchor = MapUtil.getValue(mpColumn, "anchor", "100");
		if (Integer.parseInt(anchor) <= 0) anchor = "100";
		retJs = retJs.replace("anchor:'{anchor}'", "width:"+ anchor);
		
		//处理字段名
		String colName = mpColumn.get("col_name");
		retJs = retJs.replace("{col_name}", colName);
		
		//处理字段代码
		retJs = retJs.replace("{col_code}", colCode.replace(".", "__"));
		
		//处理是否必填
		String isnotnull = MapUtil.getValue(mpColumn, "is_notnull", "0");
		if (isnotnull.equals("1")) {
			retJs = retJs.replace("allowBlank:true", 
				"allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*'");
		} else {
			//去掉缺省属性的JS代码
			retJs = retJs.replace(", allowBlank:true", "");
		}
		
		//处理是否编辑
		String isedit = MapUtil.getValue(mpColumn, "is_edit", "1");
		if (isedit.equals("0")) {
			retJs = retJs.replace("readOnly:false", "readOnly:true");
			retJs = retJs.replace("disabled:false", "disabled:true");
		} else {
		//选择窗口输入栏只能选择，不能输入
			if (ctlType.equals("combowin") || ctlType.equals("selectwin")) {
				retJs = retJs.replace("editable:true", "editable:false");
			} 
			//去掉缺省属性的JS代码
			retJs = retJs.replace(", readOnly:false", "");
		}
		
		//处理缺省值
		String defdata = mpColumn.get("default_value").trim();
		if (defdata.length() > 0) {
			retJs = retJs.replace("defaultval:''", "defaultval:'"+defdata+"'");
		} else {
			if (ctlType.equals("checkbox")) {
				retJs = retJs.replace("defaultval:''", "defaultval:'0'");
			} else {
				//去掉缺省属性的JS代码
				retJs = retJs.replace(", defaultval:''", "");
			}
		}
		
		//处理数据样式
		String format = mpColumn.get("format_id");
		//处理数字控件样式
		if (ctlType.equals("number")) {
			//处理数据校验
			retJs = retJs.replace("xtype:'numberfield'", "xtype:'numberfield'" + numberFormat(format));
		}
		//处理日期控件样式
		if (ctlType.equals("date")) {
			retJs = dateRender(retJs, format);
		}
		
		//处理选项值
		if (ctlType.equals("combo")) {
			retJs = retJs.replaceAll("\\{name\\}", ctlName);
		}
		
		//处理选择控件的参数对象
		if (ctlType.equals("combowin") || ctlType.equals("selectwin")) {
			retJs = retJs.replaceAll("\\{funid\\}", _funId);
			String config = winConfig(mpColumn);
			retJs = retJs.replaceAll("\\{config\\}", config);
		}
		
		return retJs;
	}
	
	/**
	 * 处理数字类型的格式
	 * @param format -- 数组格式：int, number2, number3...
	 * @return
	 */
	private String numberFormat(String format) {
		String retJs = "";
		
		if (format.equals("int")) {
			retJs = ", decimalPrecision:0";
		} else if (format.indexOf("number") >= 0) {
			char n = '2';
			if (format.length() > 6) n = format.charAt(6);
			if (n != '2') {
				retJs = ", decimalPrecision:" + n;
			}
		}
		
		return retJs;
	}
	
	/**
	 * 处理日期类型的格式
	 * @param retJs -- 原控件JS
	 * @param format -- 日期格式：date, datetime, datemonth
	 * @return
	 */
	private String dateRender(String retJs, String format) {
		
		if (format.equals("datetime")) {
			retJs = retJs.replace("format:'Y-m-d'", "format:'Y-m-d H:i:s'");
		} else if (format.equals("datemin")) {
			retJs = retJs.replace("format:'Y-m-d'", "format:'Y-m-d H:i'");
		} else if (format.equals("datemonth")) {
			retJs = retJs.replace("format:'Y-m-d'", "format:'Y-m'");
		} else if (format.equals("dateyear")) {
			retJs = retJs.replace("format:'Y-m-d'", "format:'Y'");
		}
		
		return retJs;
	}
	
	/**
	 * 取选择控件配置信息
	 * @param mpColumn
	 * @return
	 */
	private String winConfig(Map<String,String> mpColumn) {
		String ctlCode = mpColumn.get("control_name");
		Map<String,String> mpCtl = TotalDao.selectWinCtl(ctlCode);
		
		//构建JSON对象
		StringBuilder sbJson = new StringBuilder();
		sbJson.append("{");
		sbJson.append("pageType:'combogrid', ");
		sbJson.append("nodeId:'"+ MapUtil.getValue(mpCtl, "fun_id") +"', ");
		sbJson.append("layoutPage:'"+ MapUtil.getValue(mpCtl, "layout_page") +"', ");
		sbJson.append("sourceField:'"+ MapUtil.getValue(mpColumn, "source_cols") +"', ");
		sbJson.append("targetField:'"+ MapUtil.getValue(mpColumn, "target_cols") +"', ");
		sbJson.append("whereSql:'', ");
		sbJson.append("whereValue:'', ");
		sbJson.append("whereType:'', ");
		sbJson.append("isSame:'0', ");
		sbJson.append("isShowData:'1', ");
		sbJson.append("isMoreSelect:'0',");
		sbJson.append("isReadonly:'1',");
		sbJson.append("fieldName:'"+ MapUtil.getValue(mpColumn, "col_code") +"'");
		sbJson.append("}");
		
		return sbJson.toString();
	}
}
