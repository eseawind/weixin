/*
 * ReportXlsLabel.java 2010-11-11
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.xls;

import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportXlsUtil;

/**
 * 输出标签式报表。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-11
 */
public class ReportXlsLabel extends ReportXls {

	/**
	 * 每页输出多个标签表单，如果一页需要输出5个标签，则需要定义一个主区域，4个明细区域。
	 */
	public Object output() throws ReportException {
		_log.showDebug("excel label report output ...");
		//取报表所属功能ID，用于报表图片输出时取功能表名、主键信息用
		String funId = _mpReptInfo.get("fun_id");
		//每输出一页构建一个临时报表对象
		HSSFWorkbook tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
		HSSFSheet tmpsheet = tmpwb.getSheetAt(0);

		HSSFSheet sheet = _hssfWB.getSheetAt(0);
		int maxPage = ReportXlsUtil.calPageNum(_lsMainRecord.size(), _lsSubArea.size() + 1);

		Map<String,String> mpData = null, mpSub = null;
		int index = 0;
		List<Map<String,String>> lsCol = null;

		for (int i = 0; i < maxPage; i++) {
			for (int j = 0, n = _lsSubArea.size() + 1; j < n; j++) {
				index = (i * n) + j;
				if (_lsMainRecord.size() <= index) break;

				mpData = _lsMainRecord.get(index);
				
				if (j == 0) {
					lsCol = _lsMainCol;
				} else {
					mpSub = _lsSubArea.get(j - 1);
					lsCol = _mpSubCol.get(mpSub.get("area_id"));
				}

				//填写一条记录
				if (i == 0) {
					sheet = ReportXlsUtil.fillForm(funId, sheet, mpData, lsCol, _mpUser, i + 1, maxPage);
					sheet = ReportXlsUtil.fillHead(sheet, _lsHeadInfo, _mpUser);
				} else {
					tmpsheet = ReportXlsUtil.fillForm(funId, tmpsheet, mpData, lsCol, _mpUser, i + 1, maxPage);
					tmpsheet = ReportXlsUtil.fillHead(tmpsheet, _lsHeadInfo, _mpUser);
				}
			}

			if (i > 0) {
				sheet = ReportXlsUtil.appendSheet(sheet, tmpsheet);
				tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
				tmpsheet = tmpwb.getSheetAt(0);
			}

			//判断报表是否允许输出
			if (!ReportXlsUtil.isAllowOut(sheet)) break;
		}

		return _hssfWB;
	}

}
