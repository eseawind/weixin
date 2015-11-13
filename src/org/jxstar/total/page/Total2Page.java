/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.total.page;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.total.util.TotalDao;
import org.jxstar.total2.DealUtil;
import org.jxstar.total2.ReprotTotal2Imp;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 构建动态统计报表显示数据的页面对象需要的JSON数据。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-30
 */
public class Total2Page extends AbstractTotalPage {
	private static final long serialVersionUID = 1L;

	/**
	 * 构建动态统计报表的列标题信息：
	 * 1、先找到纵向分类的显示字段；
	 * 2、再找到横向分类的显示字段，根据横向分类数据的个数，添加相应个数的显示字段；
	 *    如果是输出合计，还需要多添加一个；
	 * 3、如果只有一个统计字段，且有横向分类，则不显示统计字段，直接显示横向分类的标题值。   
	 */
	public String columnJson(String reportId) throws ReportException {
		List<Map<String,String>> lsCol = FactoryUtil.newList();
		
		//添加纵向分类的显示字段
		List<Map<String,String>> lsArea =  TotalDao.queryTotalArea(reportId, "assort");
		if (!lsArea.isEmpty()) {
			String areaId = lsArea.get(0).get("area_id");
			lsCol.addAll(TotalDao.queryDetail(areaId));
		}
		
		//数据钻取参数
		String drillParam = "";
		
		//找统计区域的显示字段
		List<Map<String,String>> lsTotalField = null;
		List<Map<String,String>> lsTotalArea =  TotalDao.queryTotalArea(reportId, "query");
		if (!lsTotalArea.isEmpty()) {
			String areaId = lsTotalArea.get(0).get("area_id");
			//只添加数字字段，需要根据横向分类复制多个字段的
			lsTotalField = TotalDao.queryTotalField(areaId);
			
			//如果没有定义纵向分类，则统计区域可能存在分类字段，需要添加到字段列表中
			addTextField(areaId, lsCol);
			
			drillParam = DealUtil.getDrillParam(areaId, reportId);
		}
		if (lsTotalField == null || lsTotalField.isEmpty()) {
			throw new ReportException("统计数据区域中没有找到显示数字类型的字段！");
		}
		
		//找到横向分类的显示字段
		List<Map<String,String>> lsAreaX =  TotalDao.queryTotalArea(reportId, "cross");
		//找到横向分类数据，用于构建多个统计字段名称
		if (!lsAreaX.isEmpty()) {
			Map<String,String> mpAreaX = lsAreaX.get(0);
			//横向分类的标示字段
			String typeField = mpAreaX.get("type_field");
			//横向分类显示的标题字段
			String titleField = mpAreaX.get("type_field_title");
			//横向分类显示合计
			String hasSum = mpAreaX.get("has_sum");
			
			ReprotTotal2Imp total2 = new ReprotTotal2Imp();
			List<Map<String,String>> lsXTypeData = total2.getCrossData(reportId);
			
			//添加横向合计标题
			if (hasSum.equals("1")) {
				Map<String,String> mpTitle = FactoryUtil.newMap();
				mpTitle.put(typeField, DealUtil.SUM_FLAG);
				mpTitle.put(titleField, DealUtil.SUM_TITLE);
				lsXTypeData.add(mpTitle);
			}
			
			//下面根据每个横向分类数据构建一个标题块
			for (Map<String,String> mpType : lsXTypeData) {
				String typeId = mpType.get(typeField);
				String typeTitle = mpType.get(titleField);
				
				boolean drilled = false;
				for (Map<String,String> mpField : lsTotalField) {
					//构建一个新的字段列
					Map<String,String> mpCol = FactoryUtil.newMap();
					mpCol.putAll(mpField);
					
					String col_code = mpCol.get("col_code");
					//给字段名称中添加后缀“__[typeId]”
					mpCol.put("col_code", DealUtil.fieldFlag(col_code, typeId));
					
					//如果统计字段只有一个，则直接采用横向分类值作为标题
					if (lsTotalField.size() == 1) {
						mpCol.put("display", typeTitle);
					}
					
					//如果有数据钻取参数，则添加；每个区域只第一个字段添加
					if (drillParam != null && drillParam.length() > 0 && !drilled) {
						mpCol.put("drillparam", drillParam);
						drilled = true;
					}
					
					//添加总列表中
					lsCol.add(mpCol);
				}
			}
		} else {//如果没有横向分类，则直接填写统计数据字段列
			lsCol.addAll(lsTotalField);
		}
		
		return columnToJson(lsCol);
	}

	/**
	 * 如果没有横向分类就不处理分组标题；
	 * 如果统计字段只有一个，也不需要输出分组标题；
	 * 先添加纵向分类的分组标题；
	 * 再添加横向分类的分组标题；
	 * 最后添加横向分类的合计标题；
	 */
	public String groupTitle(String reportId) throws ReportException {
		//找到横向分类的显示字段
		List<Map<String,String>> lsAreaX =  TotalDao.queryTotalArea(reportId, "cross");
		if (lsAreaX.isEmpty()) {
			return "[]";
		}
		//取数据统计区域
		List<Map<String,String>> lsTotalArea =  TotalDao.queryTotalArea(reportId, "query");
		if (lsTotalArea.isEmpty()) {
			throw new ReportException("没有定义统计区域！");
		}
		Map<String,String> mpTotalArea = lsTotalArea.get(0);
		
		//如果统计字段只有一个，也不需要输出分组标题
		String areaId = mpTotalArea.get("area_id");
		List<Map<String,String>> lsTotalField = TotalDao.queryTotalField(areaId);
		if (lsTotalField.size() == 1) {
			return "[]";
		}
		
		StringBuilder sbTitle = new StringBuilder();
		
		//添加纵向分类的GroupTitle
		List<Map<String,String>> lsAreaY =  TotalDao.queryTotalArea(reportId, "assort");
		if (!lsAreaY.isEmpty()) {
			Map<String,String> mpArea = lsAreaY.get(0);
			addGroupTitle(sbTitle, mpArea);
		}
		
		//横向分类显示的标题字段
		String titleField = lsAreaX.get(0).get("type_field_title");
		
		//添加横向分类的GroupTitle
		ReprotTotal2Imp total2 = new ReprotTotal2Imp();
		List<Map<String,String>> lsXTypeData = total2.getCrossData(reportId);
		for (Map<String,String> mpType : lsXTypeData) {
			String title = mpType.get(titleField);
			mpTotalArea.put("area_name", title);
			addGroupTitle(sbTitle, mpTotalArea);
		}
		
		//添加横向分类合计的标题
		String has_sum = lsAreaX.get(0).get("has_sum");
		if (has_sum.equals("1") && lsXTypeData.size() > 0) {
			mpTotalArea.put("area_name", DealUtil.SUM_TITLE);
			addGroupTitle(sbTitle, mpTotalArea);
		}
		
		String json = "[]";
		if (sbTitle.length() > 1) {
			json = "[" + sbTitle.substring(0, sbTitle.length()-1) + "]";
		}
		
		return json;
	}

	/**
	 * 把统计区域中的分类字段添加到字段列表中
	 * @param areaId
	 * @param lsCol
	 */
	private void addTextField(String areaId, List<Map<String,String>> lsCol) {
		List<Map<String,String>> lsField = TotalDao.queryDetail(areaId);
		
		for (Map<String,String> mpField : lsField) {
			String format = mpField.get("format");
			String is_show = mpField.get("is_show");
			if (format.equals("text") && is_show.equals("1")) {
				lsCol.add(mpField);
			}
		}
	}
	
	/**
	 * 添加分组标题
	 * @param sbTitle
	 * @param mpArea
	 */
	private void addGroupTitle(StringBuilder sbTitle, Map<String,String> mpArea) {
		String is_head = mpArea.get("is_head");
		if (!is_head.equals("1")) return;
		
		//标题
		String title = mpArea.get("area_name");
		//列数
		String colspan = MapUtil.getValue(mpArea, "head_colnum", "0");
		if (colspan.equals("0")) return;
		
		sbTitle.append("{header:'" + title + "', colspan:" + colspan + ", align:'center'},");
	}
}
