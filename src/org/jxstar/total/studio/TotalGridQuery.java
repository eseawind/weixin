package org.jxstar.total.studio;

import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.service.BusinessObject;
import org.jxstar.total.page.AbstractTotalPage;
import org.jxstar.total.page.Total2Page;
import org.jxstar.total.page.TotalPage;
import org.jxstar.total.util.TotalDao;

/**
 * 统计结果集表格定义的JSON
 *
 * @author TonyTan
 * @version 1.0, 2011-12-1
 */
public class TotalGridQuery extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 统计结果集表格定义
	 * @param funId -- 功能ID
	 * @return
	 */
	public String totalControl(String funId) {
		Map<String,String> mpReport = TotalDao.queryReport(funId);
		if (mpReport.isEmpty()) {
			setMessage("没有找到报表定义信息！");
			return _returnFaild;
		}
		//取报表定义ID
		String reportId = mpReport.get("report_id");
		//报表类型
		String reportType = mpReport.get("report_type");
		AbstractTotalPage totalPage = null;
		if (reportType.equals("total")) {
			totalPage = new TotalPage();
		} else {
			totalPage = new Total2Page();
		}
		
		try {
			//取统计条件的JSON
			String toolJs = totalPage.toolJson(reportId);
			
			//取输出表格列信息的JSON
			String colJs = totalPage.columnJson(reportId);
			
			//取表格分组标题的JSON
			String groupJs = totalPage.groupTitle(reportId);
			
			StringBuilder sbjs = new StringBuilder();
			sbjs.append("{toolfn:"+ toolJs +", cols:"+ colJs +", groups:"+ groupJs +", reportId:'"+ reportId +"'}");
			_log.showDebug("...............control toolJs=" + sbjs.toString());
			
			setReturnData(sbjs.toString());
		} catch (ReportException e) {
			_log.showError(e);
			setMessage(e.getMessage());
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
}
