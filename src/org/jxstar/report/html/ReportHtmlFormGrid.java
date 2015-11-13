/*
 * ReportXlsForm.java 2010-11-11
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.html;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportHtmlUtil;
import org.jxstar.report.util.ReportUtil;
import org.jxstar.report.xls.ReportXlsFormGrid;
import org.jxstar.util.StringUtil;

/**
 * 输出Html主从报表。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-12
 */
public class ReportHtmlFormGrid extends ReportHtml {

	/**
	 * 输出报表内容
	 */
	public Object output() throws ReportException {
		_log.showDebug("html form-grid report output ...");
        //取报表所属功能ID，用于报表图片输出时取功能表名、主键信息用，取功能审批信息用
        String funId = _mpReptInfo.get("fun_id");
        //报表区域ID
        String areaId = _mpMainArea.get("area_id");
        
        StringBuilder sbRet = new StringBuilder();
        //获取javascript变量声明
        sbRet.append(ReportHtmlUtil.defineHead());

        Map<String, String> mpValue = null;
        for (int i = 0 ,n = (_lsMainRecord.size() >= _imaxPage)?_imaxPage:_lsMainRecord.size() ;i < n ;i++) {
            mpValue = _lsMainRecord.get(i);

            if (i == 0) {
                sbRet.append(ReportHtmlUtil.fillForm(funId, mpValue, _lsMainCol, _mpUser, "tblobj", i + 1, _lsMainRecord.size()));
                sbRet.append(ReportHtmlUtil.fillCheckInfo(funId, areaId, "tblobj", mpValue, _mpUser));
                sbRet.append(ReportHtmlUtil.fillHead("tblobj", _lsHeadInfo, _mpUser));
                
                //填写从表信息
                sbRet.append(fillSubArea(funId, "tblobj", mpValue));
            } else {
                //插入新table
                sbRet.append("newTblObj = f_insertTable(tblValue, tblobj);\r\n");

                sbRet.append(ReportHtmlUtil.fillForm(funId, mpValue, _lsMainCol, _mpUser, "newTblObj", i + 1, _lsMainRecord.size()));
                sbRet.append(ReportHtmlUtil.fillCheckInfo(funId, areaId, "newTblObj", mpValue, _mpUser));
                sbRet.append(ReportHtmlUtil.fillHead("newTblObj", _lsHeadInfo, _mpUser));
                
                //填写从表信息
                sbRet.append(fillSubArea(funId, "newTblObj", mpValue));
            }
        }
        
        return sbRet.toString();
	}

	/**
	 * 填写子表内容，返回的子表内容报表可能存在多页。
	 * 
	 * @param funId -- 功能ID
	 * @param jsTblObj -- 表格对象
	 * @param mpData -- 主表记录值
	 * @return
	 */
	protected String fillSubArea(String funId, String jsTblObj, Map<String, String> mpData) throws ReportException {
		StringBuilder sbRet = new StringBuilder();
		String strPKCol = _mpMainArea.get("pk_col");
		
		//判断主键名是否为空
		if (strPKCol == null || strPKCol.length() == 0)
			throw new ReportException("主从报表的主区域中的主键名不能为空！");
		
		//取主键字段名
		strPKCol = StringUtil.getNoTableCol(strPKCol);
		
		String pkval = mpData.get(strPKCol.toLowerCase());
		
		ReportXlsFormGrid xfg = new ReportXlsFormGrid();
		Map<String, List<Map<String,String>>> mpSubRecord = 
			xfg.getSubRecord(pkval, strPKCol, _lsSubArea);
		int maxPage = xfg.getMaxPageBySubRecord(mpSubRecord, _lsSubArea);

		Map<String,String> mpField = null;
		List<Map<String,String>> lsRecord = null, lsCollist = null;
		String strAreaID = null, strPageNum = null, isStatArea = null;

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
					if (insertTableRow(sbRet, jsTblObj, strAreaID, lsRecord.size(), pageSize)) {
					//修改为只输出1页，而且每页的行数为当前记录 数
						maxPage = 1;
						pageSize = lsRecord.size();
					}
				}
				//==========================================================

				//i=0时的明细内容填充到sheet中，后面每页的内容填充到tmpsheet
				if (i > 0) {
					sbRet.append(ReportHtmlUtil.fillGrid(lsRecord, lsCollist, _mpUser, jsTblObj, pageSize, curNum, i + 1, maxPage)); 
				} else {
					sbRet.append(ReportHtmlUtil.fillGrid(lsRecord, lsCollist, _mpUser, jsTblObj, pageSize, curNum, i + 1, maxPage));
				}
			}

			//如果还有新页，则创建新的表格对象
			if ((i + 1) < maxPage) {
				sbRet.append("newTblObj = f_insertTable(tblValue, tblobj);\r\n");
				sbRet.append(ReportHtmlUtil.fillForm(funId, mpData, _lsMainCol, _mpUser, "newTblObj", 0, 0));
				jsTblObj = "newTblObj";
			}
		}

		return sbRet.toString();
	}
	
	//修改报表输出模板
	protected boolean insertTableRow(StringBuilder sbRet, 
			String jsTblObj, String strAreaID, 
			int recodeNum, int pageSize) {
		//需要插入的行数
		int rows = recodeNum - pageSize;
		
		if (rows > 0) {
			//取数据输出的第一行位置
			int firstRow = ReportUtil.getFirstRows(strAreaID);
			if (firstRow < 0) return false;
			
			//取插入行位置
			int startRow = firstRow + pageSize;
			sbRet.append("f_insertRow("+ jsTblObj +", "+ startRow +", "+ rows +");\r\n");
			return true;
		}
		
		return false;
	}
}
