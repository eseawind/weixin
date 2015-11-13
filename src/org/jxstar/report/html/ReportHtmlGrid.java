/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.report.html;

import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportHtmlUtil;
import org.jxstar.report.util.ReportUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.resource.JsMessage;

/**
 * 输出html表格报表。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-9
 */
public class ReportHtmlGrid extends ReportHtml {

	public Object output() throws ReportException {
		_log.showDebug("excel grid report output ...");

		String area_num = MapUtil.getValue(_mpMainArea, "page_size", "0");
		if (area_num.length() == 0 || area_num.equals("0")) {
			throw new ReportException(JsMessage.getValue("reportxlsgrid.hint01"));
		}
		
        StringBuilder sbRet = new StringBuilder();
        //获取javascript变量声明
        sbRet.append(ReportHtmlUtil.defineHead());

		//报表输出开始行
		int pos = 0;
		//报表每页行数
		int pageSize = Integer.parseInt(area_num);
		//报表页数
		int pageNum = ReportUtil.calPageNum(_lsMainRecord.size(), pageSize);
		
		//===================Grid不分页处理=========================
		String not_page = _mpMainArea.get("not_page");
		if (not_page.equals("1")) {
			if (insertTableRow(sbRet, pageSize)) {
			//修改为只输出1页，而且每页的行数为当前记录 数
				pageNum = 1;
				pageSize = _lsMainRecord.size();
			}
		}
		//==========================================================

		for (int i = 0; i < pageNum; i++) {
			pos = i * pageSize;

			if (i == 0) {
				sbRet.append(ReportHtmlUtil.fillGrid(_lsMainRecord, _lsMainCol, _mpUser, "tblobj", pageSize, pos, i + 1, pageNum));
				sbRet.append(ReportHtmlUtil.fillHead("tblobj" ,_lsHeadInfo, _mpUser));
			} else {
				//插入新table
                sbRet.append("newTblObj = f_insertTable(tblValue, tblobj);\r\n");

                sbRet.append(ReportHtmlUtil.fillGrid(_lsMainRecord, _lsMainCol, _mpUser, "newTblObj", pageSize, pos, i + 1, pageNum));
                sbRet.append(ReportHtmlUtil.fillHead("newTblObj" ,_lsHeadInfo, _mpUser));
			}
		}

		return sbRet.toString();
	}
	
	//修改报表输出模板
	private boolean insertTableRow(StringBuilder sbRet, int pageSize) {
		//检查表格需要增加多少行，如果总行数超过了一页，则需要在表格中增加相应的行数
		if (!_lsMainRecord.isEmpty()) {
			//需要插入的行数
			int rows = _lsMainRecord.size() - pageSize;
			
			if (rows > 0) {
				//取数据输出的第一行位置
				String areaId = MapUtil.getValue(_mpMainArea, "area_id");
				int firstRow = ReportUtil.getFirstRows(areaId);
				if (firstRow < 0) return false;
				
				//取插入行位置
				int startRow = firstRow + pageSize;
				sbRet.append("f_insertRow(tblobj, "+ startRow +", "+ rows +");\r\n");
				return true;
			}
		}
		
		return false;
	}

}
