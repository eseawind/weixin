/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.total.page;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.service.BusinessObject;
import org.jxstar.total.util.ConditionJson;
import org.jxstar.total.util.TotalDao;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 构建统计报表显示数据的页面对象需要的JSON数据。 
 *
 * @author TonyTan
 * @version 1.0, 2012-7-30
 */
public abstract class AbstractTotalPage extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 构建统计报表工具栏中的统计参数
	 * @param reportId
	 * @return
	 * @throws ReportException
	 */
	public String toolJson(String reportId) throws ReportException {
		List<Map<String,String>> lsParam = TotalDao.queryRequestParam(reportId);
		lsParam = getDesign(lsParam);
		
		ConditionJson parser = new ConditionJson();
		return parser.parse(reportId, lsParam);
	}
	
	/**
	 * 构建统计报表的列信息
	 * @param reportId
	 * @return
	 * @throws ReportException
	 */
	public abstract String columnJson(String reportId) throws ReportException;
	
	/**
	 * 构建统计报表的一级分组标题信息
	 * @param reportId
	 * @return
	 * @throws ReportException
	 */
	public abstract String groupTitle(String reportId) throws ReportException;
	
	/**
	 * 处理控件参数
	 * @param lsParam
	 * @return
	 */
	protected List<Map<String,String>> getDesign(List<Map<String,String>> lsParam) {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		
		for (int i = 0, n = lsParam.size(); i < n; i++) {
			lsRet.add(getDesignItem(lsParam.get(i)));
		}
		
		return lsRet;
	}
	
	/**
	 * 保存统计条件参数信息为输出页面需要的格式
	 * @param mpItem -- 统计条件参数
	 * @return
	 */
	protected Map<String,String> getDesignItem(Map<String,String> mpItem) {
		Map<String,String> mpDesign = FactoryUtil.newMap();
		
		String ctltype = mpItem.get("ctl_type");
		if (ctltype.length() == 0) {
			ctltype = "text";
		}
		
		String isshow = mpItem.get("is_show");
		if (!isshow.equals("1")) {
			ctltype = "hidden";
		}
		
		mpDesign.put("col_code", mpItem.get("param_code"));
		mpDesign.put("col_name", mpItem.get("param_name"));
		mpDesign.put("col_control", ctltype);
		mpDesign.put("control_name", mpItem.get("ctl_code"));
		mpDesign.put("anchor", "100");
		mpDesign.put("is_edit", "1");
		mpDesign.put("is_show", isshow);
		mpDesign.put("default_value", mpItem.get("def_val"));
		mpDesign.put("format_id", mpItem.get("format"));
		mpDesign.put("is_notnull", mpItem.get("is_must"));
		mpDesign.put("source_cols", mpItem.get("ctl_srccol"));
		mpDesign.put("target_cols", mpItem.get("ctl_descol"));
		
		return mpDesign;
	}
	
	/**
	 * 根据字段信息输出JSON
	 * @param lsCol
	 * @return
	 */
	protected String columnToJson(List<Map<String,String>> lsCol) {
		if (lsCol == null || lsCol.isEmpty()) {
			return "[]";
		}
		
		StringBuilder sbJson = new StringBuilder();
		for (int i = 0, n = lsCol.size(); i < n; i++) {
			Map<String,String> mpcol = lsCol.get(i);
			String is_show = MapUtil.getValue(mpcol, "is_show", "0");
			//if (is_show.equals("0")) continue;
			
			String width = MapUtil.getValue(mpcol, "col_width", "100");
			if (Integer.parseInt(width) <= 0) width = "100";
			
			//添加数据钻取参数信息
			String drillparam = "";
			if (mpcol.containsKey("drillparam")) {
				drillparam = mpcol.get("drillparam");
				if (drillparam != null && drillparam.length() > 0) {
					drillparam = "drillparam:" + drillparam + ",";
				}
			}
			
			//添加隐藏域
			String hidden = "";
			if (is_show.equals("0")) {
				hidden = "hidden:true,ishidden:true,";
			}
			
			sbJson.append("{col_code:'" + mpcol.get("col_code") + "',");
			sbJson.append(drillparam);
			sbJson.append(hidden);
			sbJson.append("display:'" + mpcol.get("display") + "',");
			sbJson.append("format:'" + MapUtil.getValue(mpcol, "format", "text") + "',");
			sbJson.append("combo_code:'" + mpcol.get("combo_code") + "',");
			sbJson.append("col_width:" + width + "},");
		}
		
		String json = "";
		if (sbJson.length() > 1) {
			json = "[" + sbJson.substring(0, sbJson.length()-1) + "]";
		}
		
		return json;
	}
}
