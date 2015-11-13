/*
 * ReportFactory.java 2010-11-12
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.util;


import org.jxstar.report.Report;
import org.jxstar.util.log.Log;

/**
 * 报表输出对象工厂。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-12
 */
public class ReportFactory {
	private static Log _log = Log.getInstance();	
	//报表实现类的基础包名
	private static String _packageName = "org.jxstar.report.";

	/**
	 * 创建报表实现类
	 * @param className -- 类名
	 * @return
	 */
	public static Report newInstance(String className) {
		Report obj = null;
		className = _packageName + className;
		
		try {
			obj = (Report) Class.forName(className).newInstance();
		} catch (Exception e) {
			_log.showError(e);
			return obj;
		}

		return obj;
	}
	
	/**
	 * 取xls报表实现类名
	 * @param reportType -- 报表类型
	 * @return
	 */
	public static String getReportXls(String reportType) {
		String ret = "";

		if (reportType.equals("form")) {
			ret = "xls.ReportXlsForm";
		} else if (reportType.equals("grid")) {
			ret = "xls.ReportXlsGrid";
		} else if (reportType.equals("formgrid")) {
			ret = "xls.ReportXlsFormGrid";
		} else if (reportType.equals("label")) {
			ret = "xls.ReportXlsLabel";
		} else if (reportType.equals("total")){
			ret = "xls.ReportXlsTotal";
		} else {
			ret = "xls.ReportXlsForm";
		}

		return ret;
	}
	
	/**
	 * 取html报表实现类名
	 * @param reportType -- 报表类型
	 * @return
	 */
	public static String getReportHtml(String reportType) {
		String ret = "";

		if (reportType.equals("form")) {
			ret = "html.ReportHtmlForm";
		} else if (reportType.equals("grid")) {
			ret = "html.ReportHtmlGrid";
		} else if (reportType.equals("formgrid")) {
			ret = "html.ReportHtmlFormGrid";
		} else if (reportType.equals("label")) {
			ret = "html.ReportHtmlLabel";
		} else if (reportType.equals("total")){
			ret = "html.ReportHtmlTotal";
		} else {
			ret = "html.ReportHtmlForm";
		}

		return ret;
	}
}
