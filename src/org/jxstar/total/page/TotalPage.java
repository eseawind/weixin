/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.total.page;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.total.util.TotalDao;
import org.jxstar.total2.DealUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 构建普通统计报表显示数据的页面对象需要的JSON数据。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-30
 */
public class TotalPage extends AbstractTotalPage {
	private static final long serialVersionUID = 1L;

	/* (non-Javadoc)
	 * @see org.jxstar.total.page.AbstractTotalPage#columnJson(java.lang.String)
	 */
	@Override
	public String columnJson(String reportId) throws ReportException {
		List<Map<String,String>> lsCol = FactoryUtil.newList();
		List<Map<String,String>> lsArea = TotalDao.queryArea(reportId);
		
		for (int i = 0, n = lsArea.size(); i < n; i++) {
			Map<String,String> mpArea = lsArea.get(i);
			
			String areaId = mpArea.get("area_id");
			String areaType = mpArea.get("area_type");
			List<Map<String, String>> lsDet = TotalDao.queryDetail(areaId);
			
			//如果统计区域，且定义了数据钻取参数，则需要添加到字段定义信息
			if (areaType.equals("query") && lsDet.size() > 0) {
				String drillParam = DealUtil.getDrillParam(areaId, reportId);
				if (drillParam.length() > 0) {
					lsDet.get(0).put("drillparam", drillParam);
				}
			}
			
			lsCol.addAll(lsDet);
		}
		if (lsCol.isEmpty()) {
			throw new ReportException("没有定义统计报表的列信息！");
		}
		
		return columnToJson(lsCol);
	}

	/* (non-Javadoc)
	 * @see org.jxstar.total.page.AbstractTotalPage#groupTitle(java.lang.String)
	 */
	@Override
	public String groupTitle(String reportId) throws ReportException {
		List<Map<String,String>> lsArea = TotalDao.queryArea(reportId);
		if (lsArea.isEmpty()) {
			throw new ReportException("没有定义统计报表的统计数据区域！");
		}
		
		StringBuilder sbTitle = new StringBuilder();
		for (int i = 0, n = lsArea.size(); i < n; i++) {
			Map<String,String> mpArea = lsArea.get(i);
			String is_head = mpArea.get("is_head");
			if (!is_head.equals("1")) continue;
			
			//标题
			String title = mpArea.get("area_name");
			//列数
			//String areaId = mpArea.get("area_id");
			//String colspan = TotalDao.queryShowNum(areaId);
			String colspan = MapUtil.getValue(mpArea, "head_colnum", "0");
			if (colspan.equals("0")) continue;
			
			sbTitle.append("{header:'" + title + "', colspan:" + colspan + ", align:'center'},");
		}
		
		String json = "[]";
		if (sbTitle.length() > 1) {
			json = "[" + sbTitle.substring(0, sbTitle.length()-1) + "]";
		}
		
		return json;
	}
}
