/*
 * ReportXlsFormGrid.java 2010-11-11
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.xls;

import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.dao.DaoParam;
import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportXlsUtil;
import org.jxstar.util.StringUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 输出主从报表。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-11
 */
public class ReportXlsFormGrid extends ReportXls {

	/**
	 * 输出报表内容
	 */
	public Object output() throws ReportException {
		_log.showDebug("excel form-grid report output ...");
		//取报表所属功能ID，用于报表图片输出时取功能表名、主键信息用
		String funId = _mpReptInfo.get("fun_id");
		//每输出一页构建一个临时报表对象
		HSSFWorkbook tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
		HSSFSheet tmpsheet = tmpwb.getSheetAt(0);

		HSSFSheet sheet = _hssfWB.getSheetAt(0);
		
		int tempRow = -1;
		if (_lsSubArea.size() > 0) {
			String not_page = _lsSubArea.get(_lsSubArea.size()-1).get("not_page");
			if (not_page.equals("1")) {
				tempRow = getAreaTempRow();
				_log.showDebug(".............sub area is not page, template clone row:" + tempRow);
			}
		}

		Map<String, String> mpValue = null;
		for (int i = 0; i < _lsMainRecord.size(); i++) {
			mpValue = _lsMainRecord.get(i);
			
			//填写一条记录
			if (i == 0) {
				sheet = ReportXlsUtil.fillForm(funId, sheet, mpValue, _lsMainCol, _mpUser, i + 1, _lsMainRecord.size());
				sheet = ReportXlsUtil.fillHead(sheet, _lsHeadInfo, _mpUser);

				//填写从表信息
				sheet = fillSubArea(sheet, mpValue);
			} else {
				tmpsheet = ReportXlsUtil.fillForm(funId, tmpsheet, mpValue, _lsMainCol, _mpUser, i + 1, _lsMainRecord.size());
				tmpsheet = ReportXlsUtil.fillHead(tmpsheet, _lsHeadInfo, _mpUser);
				
				//填写明细数据，如果明细数据有多页，则多页数据都生成合并到tmpsheet中，最后再合并到原表中。
				tmpsheet = fillSubArea(tmpsheet, mpValue);
				sheet = ReportXlsUtil.appendSheet(sheet, tmpsheet, tempRow);
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

	/**
	 * 填写子表内容，返回的子表内容报表可能存在多页。
	 * 
	 * @param sheet -- 表格对象
	 * @param mpData -- 主表记录值
	 * @return
	 * @throws ReportException
	 */
	protected HSSFSheet fillSubArea(HSSFSheet sheet, Map<String, String> mpData) throws ReportException {
		String strPKCol = _mpMainArea.get("pk_col");

		//判断主键名是否为空
		if (strPKCol == null || strPKCol.length() == 0)
			throw new ReportException("主从报表的主区域中的主键名不能为空！");
		
		//取主键字段名
		strPKCol = StringUtil.getNoTableCol(strPKCol);
		
		String pkval = mpData.get(strPKCol.toLowerCase());
		Map<String, List<Map<String,String>>> mpSubRecord = 
			getSubRecord(pkval, strPKCol, _lsSubArea);
		int maxPage = getMaxPageBySubRecord(mpSubRecord, _lsSubArea);

		Map<String,String> mpField = null;
		List<Map<String,String>> lsRecord = null, lsCollist = null;
		String strAreaID = null, strPageNum = null, isStatArea = null;

		//取报表所属功能ID，用于报表图片输出时取功能表名、主键信息用
		String funId = _mpReptInfo.get("fun_id");
		
		//每输出一页构建一个临时报表对象
		HSSFWorkbook tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
		HSSFSheet tmpsheet = tmpwb.getSheetAt(0);

		//输出每个明细表的数据到表格中，每输满一页后添加到源表单中
		int curNum = 0;
		for (int i = 0; i < maxPage; i++) {
			//区域
			for (int j = 0, n = _lsSubArea.size(); j < n; j++) {
				mpField = _lsSubArea.get(j);
				strAreaID = mpField.get("area_id");
				strPageNum = mpField.get("page_size");
				isStatArea = mpField.get("is_stat");
				if (isStatArea == null) isStatArea = "";
				
				//当前显示数
				int pageSize = Integer.parseInt(strPageNum);
				curNum = i * pageSize;

				lsCollist = _mpSubCol.get(strAreaID);
				lsRecord = mpSubRecord.get(strAreaID);
				
				if (isStatArea.equals("1")) {
					curNum = 0;
				}
				
				//===================SubGrid不分页处理=========================
				String not_page = mpField.get("not_page");
				if (not_page.equals("1")) {
					if (insertSheetRow(sheet, strAreaID, lsRecord.size(), pageSize)) {
					//修改为只输出1页，而且每页的行数为当前记录 数
						maxPage = 1;
						pageSize = lsRecord.size();
					}
				}
				//==========================================================

				//i=0时的明细内容填充到sheet中，后面每页的内容填充到tmpsheet
				if (i > 0) {
					tmpsheet = ReportXlsUtil.fillGrid(tmpsheet, lsRecord, lsCollist, _mpUser, pageSize, curNum, i + 1, maxPage);

					if ((j + 1) == n) {
						if (!ReportXlsUtil.isAllowOut(sheet)) break;
						sheet = ReportXlsUtil.appendSheet(sheet, tmpsheet);
					} 
				} else {
					sheet = ReportXlsUtil.fillGrid(sheet, lsRecord, lsCollist, _mpUser, pageSize, curNum, i + 1, maxPage);
				}
			}

			//如果小于maxPage
			if ((i + 1) < maxPage) {
				//向新的form填写
				tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
				tmpsheet = tmpwb.getSheetAt(0);
				//如果子记录有多页，则下一页从2开始
				tmpsheet = ReportXlsUtil.fillForm(funId, tmpsheet, mpData, _lsMainCol, _mpUser, i + 2, maxPage);
				//如果子记录有多页，则第一页的总页数需要修改
				if (i == 0) updateMaxPage(sheet, maxPage);
			}
		}

		return sheet;
	}
	
	//修改第一页中的总页码
	protected void updateMaxPage(HSSFSheet sheet, int maxPage) {
		for (int i = 0, n = _lsMainCol.size(); i < n; i++ ) {
			Map<String,String> mpField = _lsMainCol.get(i);
			
			String colcode = (mpField.get("col_code")).toLowerCase();
			if (colcode.equalsIgnoreCase("{CURSUMPAGE}")) {
				String[] colpos = mpField.get("col_pos").split(",");
				if (colpos.length != 2) continue;
				
				HSSFRow row = sheet.getRow(Integer.parseInt(colpos[0]));
				if (row == null) row = sheet.createRow(Integer.parseInt(colpos[0]));
				HSSFCell cell = row.getCell(Integer.parseInt(colpos[1]));
				if (cell == null) cell = row.createCell(Integer.parseInt(colpos[1]));
				
				cell.setCellValue(maxPage);
			}
		}
	}
	
	/**
	 * 返回明细记录的页数，以页数最多的哪个明细为准。
	 * 
	 * @param mpSubRecord -- 明细表数据
	 * @param lsSubArea -- 明细区域定义信息
	 * @return
	 * @throws ReportException
	 */
	public int getMaxPageBySubRecord(
			Map<String, List<Map<String,String>>> mpSubRecord, 
			List<Map<String,String>> lsSubArea) throws ReportException {
		int ret = 0;
		if (lsSubArea == null || lsSubArea.isEmpty()) return ret;
		if (mpSubRecord == null || mpSubRecord.isEmpty()) return ret;

		for (int i = 0, n = lsSubArea.size();i < n; i++) {
			Map<String,String> mpValue = lsSubArea.get(i);
			String rowNum = mpValue.get("page_size");
			String areaName = mpValue.get("area_name");
			if (rowNum == null || rowNum.length() == 0)
				throw new ReportException("[" + areaName + "]区域中定义的每页明细记录数无效！");

			List<Map<String,String>>  lsData = mpSubRecord.get(mpValue.get("area_id"));
			int itmp = lsData.size() / Integer.parseInt(rowNum);
			int ipage = (lsData.size()%Integer.parseInt(rowNum) == 0)?itmp:itmp + 1;

			if (ret < ipage) ret = ipage;
		}
		
		return ret;
	}

	/**
	 * 查询明细表数据
	 * @param keyID -- 主表记录值
	 * @param pkcol -- 主键名
	 * @param lsSubArea -- 明细区域定义信息
	 * @return
	 * @throws ReportException
	 */
	public Map<String, List<Map<String,String>>> getSubRecord(String keyID, 
									String pkcol, 
									List<Map<String,String>> lsSubArea) throws ReportException {
		Map<String, List<Map<String,String>>> ret = FactoryUtil.newMap();

		if (lsSubArea == null || lsSubArea.isEmpty()) return ret;
		if (keyID == null || pkcol == null) return ret;

		for (int i = 0, n = lsSubArea.size(); i < n; i++) {
			Map<String,String> mpField = lsSubArea.get(i);
		
			String sql = mpField.get("data_sql");
			String areaName = mpField.get("area_name");
			String subFkcol = mpField.get("sub_fkcol");
			//如果没有定义子区域外键字段，则取主区域的主键字段
			if (subFkcol == null || subFkcol.length() == 0) {
				subFkcol = pkcol;
			}
			if (subFkcol == null || subFkcol.length() == 0) {
				throw new ReportException("主从报表的子区域的外键字段名不能为空！");
			}
		
			String strWhere = mpField.get("data_where");
			String strOrder = mpField.get("data_order");
			String strGroup = mpField.get("data_group");
		
			String dsName = mpField.get("ds_name");

			sql += " where (" + subFkcol + " = '"+keyID+"')";
			if(strWhere.length() > 0) {
				sql += " and (" + strWhere + ")";
			}
		
			if (strGroup.length() > 0) {
				sql += " group by " + strGroup;
			}
		
			if (strOrder.length() > 0) {
				sql += " order by " + strOrder;
			}
			_log.showDebug(areaName + "[" + keyID + "] " + "sub sql = " + sql);
		
			DaoParam param = _dao.createParam(sql);
			param.setDsName(dsName);
			List<Map<String,String>> lsTmpRs = _dao.query(param);
		
			_log.showDebug(areaName + "[" + keyID + "] " + "data size = " + lsTmpRs.size());
			ret.put(mpField.get("area_id"), lsTmpRs);
		}

		return ret;
	}

	//修改报表输出模板
	protected boolean insertSheetRow(HSSFSheet sheet, String areaId, 
			int dataSize, int pageSize) throws ReportException {
		//检查表格需要增加多少行，如果总行数超过了一页，则需要在表格中增加相应的行数
		if (dataSize > 0) {
			//需要插入的行数
			int rows = dataSize - pageSize;
			
			if (rows > 0) {
				//取数据输出的第一行位置
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
	
	//取子表不分页时，超过每页记录数的数据显示行的样式参照行
	protected int getAreaTempRow() {
		if (_lsSubArea == null || _lsSubArea.isEmpty()) return -1;
		Map<String,String> mpArea = _lsSubArea.get(_lsSubArea.size()-1);
		
		String areaId = mpArea.get("area_id");
		String pageSize = mpArea.get("page_size");
		int firstRow = ReportXlsUtil.getFirstRows(areaId);
		if (firstRow < 0) return -1;
		//取最后一行的上一行，有时最后一行是合计行
		return firstRow + Integer.parseInt(pageSize) - 1;
	}
}
