/*
 * ReportXlsGrid.java 2010-11-11
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.xls;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportXlsUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.resource.JsMessage;

/**
 * 输出Excel表格报表。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-11
 */
public class ReportXlsGrid extends ReportXls {

	public Object output() throws ReportException {
		_log.showDebug("excel grid report output ...");
		//取报表所属功能ID，用于报表图片输出时取功能表名、主键信息用
		String funId = _mpReptInfo.get("fun_id");
		
		String area_num = MapUtil.getValue(_mpMainArea, "page_size", "0");
		if (area_num.length() == 0 || area_num.equals("0")) {//"报表输出错误：报表区域每页行数不能为空！"
			throw new ReportException(JsMessage.getValue("reportxlsgrid.hint01"));
		}

		//报表输出开始行
		int pos = 0;
		//报表每页行数
		int pageSize = Integer.parseInt(area_num);
		//报表页数
		int pageNum = ReportXlsUtil.calPageNum(_lsMainRecord.size(), pageSize);

		//每输出一页构建一个临时报表对象
		HSSFWorkbook tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
		HSSFSheet tmpsheet = tmpwb.getSheetAt(0);

		HSSFSheet sheet = _hssfWB.getSheetAt(0);
		
		//===================Grid不分页处理=========================
		String not_page = _mpMainArea.get("not_page");
		if (not_page.equals("1")) {
			if (insertSheetRow(sheet, pageSize)) {
			//修改为只输出1页，而且每页的行数为当前记录 数
				pageNum = 1;
				pageSize = _lsMainRecord.size();
			}
		}
		//==========================================================

		//输出所有报表页
		for (int i = 0; i < pageNum; i++) {
			pos = i * pageSize;

			if (i == 0) {
				sheet = ReportXlsUtil.fillGrid(funId, sheet, _lsMainRecord, _lsMainCol, _mpUser, pageSize, pos, i + 1, pageNum);
				sheet = ReportXlsUtil.fillHead(sheet, _lsHeadInfo, _mpUser);
			} else {
				tmpsheet = ReportXlsUtil.fillGrid(funId, tmpsheet, _lsMainRecord, _lsMainCol, _mpUser, pageSize, pos, i + 1, pageNum);
				tmpsheet = ReportXlsUtil.fillHead(tmpsheet, _lsHeadInfo, _mpUser);

				//每输出一页临时报表，就添加到原报表中
				sheet = ReportXlsUtil.appendSheet(sheet, tmpsheet);
				tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
				tmpsheet = tmpwb.getSheetAt(0);
			}
			//强制执行SHEET中的计算公式，由于目标位置原因，只有第一页有效
			if (i == 0) sheet.setForceFormulaRecalculation(true);
			
			//判断报表是否允许输出
			if (!ReportXlsUtil.isAllowOut(sheet)) break;
		}

		return _hssfWB;
	}

	//修改报表输出模板
	private boolean insertSheetRow(HSSFSheet sheet, int pageSize) throws ReportException {
		//检查表格需要增加多少行，如果总行数超过了一页，则需要在表格中增加相应的行数
		if (!_lsMainRecord.isEmpty()) {
			//需要插入的行数
			int rows = _lsMainRecord.size() - pageSize;
			
			if (rows > 0) {
				//取数据输出的第一行位置
				String areaId = MapUtil.getValue(_mpMainArea, "area_id");
				int firstRow = ReportXlsUtil.getFirstRows(areaId);
				if (firstRow < 0) return false;
				
				//取插入行位置
				int startRow = firstRow + pageSize;
				ReportXlsUtil.insertSheetRow(sheet, startRow, rows);
				return true;
			}
		}
		
		return false;
	}
}
