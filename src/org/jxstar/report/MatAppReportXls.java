/*
 * Copyright(c) 2013 DongHong Inc.
 */
package org.jxstar.report;

import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.report.util.ReportXlsUtil;
import org.jxstar.report.xls.ReportXls;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringFormat;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;

/**
 * 调样申请可以在表头输出记录信息
 *
 * @author TonyTan
 * @version 1.0, 2013-11-12
 */
public class MatAppReportXls extends ReportXls {

	public Object output() throws ReportException {
		_log.showDebug("excel grid report output ...");

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
		Map<String, String> mpData = null;
		if (_lsMainRecord.isEmpty()) {
			mpData = FactoryUtil.newMap();
		} else {
			mpData = _lsMainRecord.get(0);
		}

		//输出所有报表页
		for (int i = 0; i < pageNum; i++) {
			pos = i * pageSize;

			if (i == 0) {
				sheet = ReportXlsUtil.fillGrid(sheet, _lsMainRecord, _lsMainCol, _mpUser, pageSize, pos, i + 1, pageNum);
				sheet = fillHead(sheet, _lsHeadInfo, _mpUser, mpData);
			} else {
				tmpsheet = ReportXlsUtil.fillGrid(tmpsheet, _lsMainRecord, _lsMainCol, _mpUser, pageSize, pos, i + 1, pageNum);
				tmpsheet = fillHead(tmpsheet, _lsHeadInfo, _mpUser, mpData);

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
	
    protected static int[] getPosition(String position) {
        int [] ret = new int[0];
        if (position == null || position.length() == 0) {
            return ret;
        }
        String[] strRet = position.split(",");
        if (strRet.length != 2) return ret;

        ret = new int[2];
        ret[0] = Integer.parseInt(strRet[0]);   //行
        ret[1] = Integer.parseInt(strRet[1]);   //列

        return ret;
    }
    protected static String convertValue(String value, String style) {
        return StringFormat.getDataValue(value, style);
    }

	//自定义表头数据输出方法
	private static HSSFSheet fillHead(
			HSSFSheet sheet, 
			List<Map<String,String>> lsHeadInfo,
			Map<String, String> mpUser,
			Map<String, String> mpData) {
		if (lsHeadInfo == null || lsHeadInfo.isEmpty()) 
			return sheet;

		Map<String,String> mpHeadInfo = null;
		String strColName = null, strColValue = null, strColPostion = null, strStyle = null;

		HSSFRow row = null;
		HSSFCell cell = null;
		String strValue = "";
		int posi[] = null;

		for (int i = 0, n = lsHeadInfo.size(); i < n; i++) {
			mpHeadInfo = lsHeadInfo.get(i);
			if (mpHeadInfo.isEmpty()) continue;

			strStyle = mpHeadInfo.get("format");
			strColName = mpHeadInfo.get("display");
			strColValue = mpHeadInfo.get("col_code");
			strColPostion = mpHeadInfo.get("col_pos");

			posi = getPosition(strColPostion);
			
			if (posi.length != 2) {
				_log.showWarn(strColName + " ["+strColPostion+"] position is error!");
				continue;
			}

			//获取指定的单元格
			row = sheet.getRow(posi[0]);
			if (row == null) row = sheet.createRow(posi[0]);
			cell = row.getCell(posi[1]);
			if (cell == null) cell = row.createCell(posi[1]);
			
			if (strColValue.equalsIgnoreCase("{CURUSERNAME}")) {
			//当前用户
				strValue = MapUtil.getValue(mpUser, "user_name");
			} else if (strColValue.equalsIgnoreCase("{CURDATE}")) {
			//当前日期
				strValue = convertValue(DateUtil.getTodaySec(), strStyle);
			} else if (strColValue.equalsIgnoreCase("{CURDEPTNAME}")) {
			//当前部门
				strValue = MapUtil.getValue(mpUser, "dept_name");
			} else if (mpData != null && mpData.containsKey(strColValue)) {
			//添加自定义数据输出到表头
				strValue = MapUtil.getValue(mpData, strColValue);
			} else {
			//设置cell的显示值
				strValue = strColValue;
				strValue = (strValue.equalsIgnoreCase("null"))?"":strValue;
			}

			cell.setCellType(HSSFCell.CELL_TYPE_STRING);
			cell.setCellValue(strValue.trim());
		}
		
		return sheet;
	}
}
