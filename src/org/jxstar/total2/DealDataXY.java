/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.total2;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.service.BusinessObject;
import org.jxstar.total.util.TotalDao;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 把统计数据根据横向分类与纵向分类值重新排列，示例：
 * 统计数据格式如：
 * dept_id, product_id, sum_num, sum_money
 * 1001, jx1001, 2, 40
 * 1002, jx1001, 2, 40
 * 1001, jx1002, 4, 120
 * 1002, jx1002, 2, 60
 * 转换后格式如：
 * dept_id, sum_num__jx1001, sum_num__jx1002, sum_money__jx1001, sum_money__jx1002
 * 1001, 2, 40, 4, 120
 * 1002, 2, 40, 2, 60
 *
 * @author TonyTan
 * @version 1.0, 2012-7-28
 */
public class DealDataXY extends BusinessObject {
	private static final long serialVersionUID = 1L;

	//当前统计区域的ID
	private String _areaId = "";
	//横向分类ID字段名
	private String _xTypeField = "";
	//纵向分类ID字段名
	private String _yTypeField = "";
	//当前统计区域的统计数据
	//统计SQL格式为：select dept_id, product_id, sum(num) as sum_num, sum(money) as sum_money from ...
	List<Map<String,String>> _lsTotalData = null;
	List<Map<String,String>> _lsXTypeData = null;
	List<Map<String,String>> _lsYTypeData = null;
	
	public DealDataXY(String areaId, 
			String xTypeField, 
			String yTypeField, 
			List<Map<String,String>> lsTotalData, 
			List<Map<String,String>> lsXTypeData, 
			List<Map<String,String>> lsYTypeData) {
		_areaId = areaId;
		_xTypeField = xTypeField;
		_yTypeField = yTypeField;
		_lsTotalData = lsTotalData;
		_lsXTypeData = lsXTypeData;
		_lsYTypeData = lsYTypeData;
	}
	
	public List<Map<String,String>> returnTotalData() throws ReportException {
		List<Map<String,String>> lsRetData = FactoryUtil.newList(); 
		if (_lsTotalData.isEmpty()) return lsRetData;
		
		//先把统计数据根据纵向分类ID，分组到每个分类List中，方便后面处理每行数据
		Map<String, List<Map<String,String>>> mpAllData = putRowData();
		
		//构建每一行数据
		lsRetData = buildRowData(mpAllData);
		
		return lsRetData;
	}
	
	//根据纵向分类ID把统计数据分类存放
	private Map<String, List<Map<String,String>>> putRowData() throws ReportException {
		Map<String, List<Map<String,String>>> mpRet = FactoryUtil.newMap();
		
		for (Map<String,String> mpTypeData : _lsYTypeData) {
			String typeId = mpTypeData.get(_yTypeField);
			
			List<Map<String,String>> lsRow = FactoryUtil.newList();
			
			mpRet.put(typeId, lsRow);
		}
		
		for (Map<String,String> mpData : _lsTotalData) {
			String typeId = mpData.get(_yTypeField);
			if (typeId == null) {
				throw new ReportException("统计数据中没有纵向分类ID数据，不能重新做横向动态分配！");
			}
			
			if (typeId.length() > 0) {
				mpRet.get(typeId).add(mpData);
			}
		}
		
		return mpRet;
	}
	
	//构建每一行数据
	private List<Map<String,String>> buildRowData(
			Map<String, List<Map<String,String>>> mpAllData) throws ReportException {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		
		for (Map<String,String> mpYType : _lsYTypeData) {
			String typeId = mpYType.get(_yTypeField);
			
			//构建行对象
			Map<String,String> mpRow = FactoryUtil.newMap();
			mpRow.putAll(mpYType);
			
			List<Map<String,String>> lsData = mpAllData.get(typeId);
			
			mpRow = dealRowData(lsData, mpRow);
			lsRet.add(mpRow);
		}
	
		return lsRet;
	}
	
	//构建每一行数据，根据横向分类ID，增加新的字段存储数据
	private Map<String,String> dealRowData(
			List<Map<String,String>> lsRow, 
			Map<String,String> mpRow) throws ReportException {
		List<Map<String,String>> lsField = TotalDao.queryTotalField(_areaId);
		if (lsField.isEmpty()) {
			throw new ReportException("没有找统计区域的统计字段定义！");
		}
		
		List<String> lsXT = FactoryUtil.newList();
		for (Map<String,String> mpTmpRow : lsRow) {
			//用来区分不同统计列字段
			String xTypeId = MapUtil.getValue(mpTmpRow, _xTypeField);
			lsXT.add(xTypeId);
			
			for (Map<String,String> mpField : lsField) {
				String col_code = mpField.get("col_code");
				String newKey = DealUtil.fieldFlag(col_code, xTypeId);
				
				String value = MapUtil.getValue(mpTmpRow, col_code, "0");
				mpRow.put(newKey, value);
			}
		}
		
		//把没有横向分类值的列补零
		for (Map<String,String> xTypeData : _lsXTypeData) {
			String xTypeId = xTypeData.get(_xTypeField);
			if (!lsXT.contains(xTypeId)) {
				for (Map<String,String> mpField : lsField) {
					String col_code = mpField.get("col_code");
					String is_outzero = mpField.get("is_outzero");
					
					String col_new = DealUtil.fieldFlag(col_code, xTypeId);
					if (is_outzero.equals("1")) {
						mpRow.put(col_new, "0");
					} else {
						mpRow.put(col_new, "");
					}
				}
			}
		}
		
		return mpRow;
	}
}
