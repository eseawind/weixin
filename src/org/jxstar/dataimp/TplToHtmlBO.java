/*
 * TplToHtmlBO.java 2010-11-16
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.dataimp;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.report.ReportException;
import org.jxstar.report.util.XlsToHtml;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.resource.JsParam;

/**
 * 数据导入模板显示到设计器中。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-16
 */
public class TplToHtmlBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	public String onLoadHtml(RequestContext request) {	
		String impId = request.getRequestValue("reportId");
		String realPath = request.getRequestValue(JsParam.REALPATH);
		_log.showDebug("参数信息 impId=" + impId + "; realPath=" + realPath);
		if (impId == null || impId.length() == 0) {
			setMessage("数据导入模板为空！");
			return _returnFaild;
		}
		
		byte[] datas = loadHtml(impId, realPath);
		if (datas == null) return _returnFaild;
		
		try {
			request.setReturnBytes(datas);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return _returnSuccess;
	}

	/**
	 * 根据定义ID取数据导入模板文件
	 * @return
	 */
	public byte[] loadHtml(String impId, String realPath) {
		Map<String,String> mpImp = DataImpUtil.queryImpById(impId);
		String rptFile = mpImp.get("tpl_file");
		if (rptFile == null || rptFile.length() == 0) {
			setMessage("数据导入模板文件没有设置，定义ID【{0}】！", impId);
			return null;
		}
		
		rptFile = realPath + "/report/dataimp/" + rptFile;
		_log.showDebug("数据导入模板文件完整路径=" + rptFile);
		
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

		//添加字段设置位置信息
		sbHtml.append("<script>\n");
		sbHtml.append("var impFieldPos = [];\n");
		
		//取表头字段位置信息
		List<Map<String,String>> lsField = DataImpUtil.queryTplField(impId);
		if (lsField.isEmpty()) {
			_log.showDebug("数据字段定义信息为空！");
		} else {
			StringBuilder sbHead = new StringBuilder();
			for (int i = 0; i < lsField.size(); i++) {
				Map<String,String> mpHead = lsField.get(i);
				
				String display = mpHead.get("field_title");
				String colpos = mpHead.get("field_pos");
				
				if (display.length() > 0 && colpos.length() > 0) {
					sbHead.append("['"+ colpos +"', '"+ display +"'],");
				}
			}
			//去掉最后一个,
			String shead = "";
			if (sbHead.length() > 0) {
				shead = sbHead.substring(0, sbHead.length()-1);
			}
			sbHtml.append("impFieldPos = ["+ shead +"];\n");
		}
		
		//显示字段位置信息
		sbHtml.append("for(var i = 0, n = impFieldPos.length; i < n; i++) {\n");
		sbHtml.append("	document.getElementById(impFieldPos[i][0]).innerHTML = impFieldPos[i][1];\n");
		sbHtml.append("}\n");
		sbHtml.append("</script>\n");
		//_log.showDebug(sbHtml.toString());
		
		try {
			return sbHtml.toString().getBytes("utf-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		
		return null;
	}
}
