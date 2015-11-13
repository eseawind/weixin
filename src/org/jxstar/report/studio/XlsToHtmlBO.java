/*
 * XlsToHtmlBO.java 2010-11-16
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.studio;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportDao;
import org.jxstar.report.util.XlsToHtml;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.util.resource.JsParam;

/**
 * 根据当前的报表记录构建报表模板文件。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-16
 */
public class XlsToHtmlBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	public String loadHtml(RequestContext request) {	
		String reportId = request.getRequestValue("reportId");
		String realPath = request.getRequestValue(JsParam.REALPATH);
		_log.showDebug("参数信息 reportId=" + reportId + "; realPath=" + realPath);
		if (reportId == null || reportId.length() == 0) {
			//"报表定义ID为空！"
			setMessage(JsMessage.getValue("xlstohtmlbo.error01"));
			return _returnFaild;
		}
		
		byte[] datas = loadHtml(reportId, realPath);
		if (datas == null) return _returnFaild;
		
		try {
			request.setReturnBytes(datas);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return _returnSuccess;
	}
	
	/**
	 * 根据报表ID取报表模板文件
	 * @param reportId -- 报表ID
	 * @return
	 */
	public byte[] loadHtml(String reportId, String realPath) {	
		//取报表定义信息
		Map<String,String> mpReport = ReportDao.getReport(reportId);
		if (mpReport.isEmpty()) {//"报表定义信息为空，报表ID为【{0}】！"
			setMessage(JsMessage.getValue("xlstohtmlbo.error02"), reportId);
			return null;
		}
		String rptFile = mpReport.get("report_file");
		if (rptFile == null || rptFile.length() == 0) {
			//"报表模板文件没有设置，报表ID为【{0}】！"
			setMessage(JsMessage.getValue("xlstohtmlbo.error03"), reportId);
			return null;
		}
		
		rptFile = realPath + "/report/xls" + rptFile;
		_log.showDebug("报表模板文件完整路径=" + rptFile);
		
		//把xls文件转换为html文件
		XlsToHtml xlsTo = new XlsToHtml();
		StringBuilder sbHtml = new StringBuilder();
		try {
			String html = xlsTo.parserXls(rptFile);
			sbHtml.append(html);
		} catch (ReportException e) {
			e.printStackTrace();
			setMessage(e.getMessage());
			return null;
		}
		
		//添加表头字段位置信息
		List<Map<String,String>> lsHead = ReportDao.getHeadInfo(reportId);
		sbHtml.append(queryFieldPos("headPos", "display", "col_pos", lsHead));
		
		//添加报表字段位置信息
		List<Map<String,String>> lsDetail = ReportDao.getReportCol(reportId);
		sbHtml.append(queryFieldPos("detailPos", "display", "col_pos", lsDetail));
		
		//添加审批字段位置信息
		List<Map<String,String>> lsCheck = ReportDao.getReportWfCol(reportId);
		sbHtml.append(queryFieldPos("checkPos", "col_code", "col_pos", lsCheck));
		//_log.showDebug(sbHtml.toString());
		
		try {
			return sbHtml.toString().getBytes("utf-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		
		return null;
	}
	
	//取设置字段位置信息
	private String queryFieldPos(
			String varName, String titleField, String posField, 
			List<Map<String,String>> lsField) {
		StringBuilder sbHtml = new StringBuilder();
		sbHtml.append("<script  language=\"javascript\">\n");
		sbHtml.append("var "+ varName +" = [];\n");
		
		if (lsField.isEmpty()) {
			_log.showDebug(varName + "位置定义信息为空！");
			return "";
		} else {
			StringBuilder sbHead = new StringBuilder();
			for (int i = 0; i < lsField.size(); i++) {
				Map<String,String> mpHead = lsField.get(i);
				
				String display = mpHead.get(titleField);
				String colpos = mpHead.get(posField);
				
				if (display.length() > 0 && colpos.length() > 0) {
					sbHead.append("['"+ colpos +"', '"+ display +"'],");
				}
			}
			//去掉最后一个,
			String shead = "";
			if (sbHead.length() > 0) {
				shead = sbHead.substring(0, sbHead.length()-1);
			}
			sbHtml.append(varName + " = ["+ shead +"];\n");
		}
		//显示字段位置信息
		sbHtml.append("for(var i = 0, n = "+ varName +".length; i < n; i++) {\n");
		sbHtml.append("	document.getElementById("+ varName +"[i][0]).innerHTML = "+ varName +"[i][1];\n");
		sbHtml.append("}\n");
		sbHtml.append("</script>\n");
		
		return sbHtml.toString();
	}
}
