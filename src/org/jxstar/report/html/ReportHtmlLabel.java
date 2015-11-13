/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.report.html;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportHtmlUtil;
import org.jxstar.report.util.ReportXlsUtil;

/**
 * 输出html标签报表。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-9
 */
public class ReportHtmlLabel extends ReportHtml {

	public Object output() throws ReportException {
		_log.showDebug("html label report output ...");
		String funId = _mpReptInfo.get("fun_id");
		
        StringBuilder sbRet = new StringBuilder();
        //获取javascript变量声明
        sbRet.append(ReportHtmlUtil.defineHead());
		int maxPage = ReportXlsUtil.calPageNum(_lsMainRecord.size(), _lsSubArea.size() + 1);

		Map<String,String> mpData = null, mpSub = null;
		int index = 0;
		List<Map<String,String>> lsCol = null;

		for (int i = 0; i < maxPage; i++) {
			if (i > 0) {//插入新table
	            sbRet.append("newTblObj = f_insertTable(tblValue, tblobj);\r\n");
			}
			
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
					sbRet.append(ReportHtmlUtil.fillForm(funId, mpData, lsCol, _mpUser, "tblobj", i + 1, maxPage));
					sbRet.append(ReportHtmlUtil.fillHead("tblobj" ,_lsHeadInfo, _mpUser));
				} else {
					sbRet.append(ReportHtmlUtil.fillForm(funId, mpData, lsCol, _mpUser, "newTblObj", i + 1, maxPage));
					sbRet.append(ReportHtmlUtil.fillHead("newTblObj" ,_lsHeadInfo, _mpUser));
				}
			}
		}

		return sbRet.toString();
	}
}
