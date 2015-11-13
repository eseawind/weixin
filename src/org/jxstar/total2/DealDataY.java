/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.total2;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.service.BusinessObject;
import org.jxstar.total.util.TotalDao;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 没有横向分类数据，根据纵向分类数据重新组织数据。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-28
 */
public class DealDataY extends BusinessObject {
	private static final long serialVersionUID = 1L;

	//当前统计区域的ID
	private String _areaId = "";
	//纵向分类ID字段名
	private String _yTypeField = "";
	//当前统计区域的统计数据
	//统计SQL格式为：select dept_id, sum(num) as sum_num, sum(money) as sum_money from ...
	List<Map<String,String>> _lsTotalData = null;
	List<Map<String,String>> _lsYTypeData = null;
	
	public DealDataY(String areaId, 
			String yTypeField, 
			List<Map<String,String>> lsTotalData, 
			List<Map<String,String>> lsYTypeData) {
		_areaId = areaId;
		_yTypeField = yTypeField;
		_lsTotalData = lsTotalData;
		_lsYTypeData = lsYTypeData;
	}
	
	public List<Map<String,String>> returnTotalData() throws ReportException {
		List<Map<String,String>> lsRet = FactoryUtil.newList(); 
		if (_lsTotalData.isEmpty()) return lsRet;
		
		for (Map<String,String> mpType : _lsYTypeData) {
			//构建一行数据
			Map<String,String> mpRow = FactoryUtil.newMap();
			mpRow.putAll(mpType);
			
			//根据纵向分类的统计字段查找符合条件的值
			String typeId = mpType.get(_yTypeField);
			Map<String,String> mpData = getTotalData(typeId);
			
			mpRow.putAll(mpData);
			
			lsRet.add(mpRow);
		}
		
		return lsRet;
	}
	
	//找到纵向分类ID值相等的统计数据
	private Map<String,String> getTotalData(String typeId) {
		for (Map<String,String> mpData : _lsTotalData) {
			String data = mpData.get(_yTypeField);
			
			if (typeId.equals(data)) {
				return mpData;
			}
		}
		
		//如果没有找到，构建一个空值对象
		Map<String,String> mpData = FactoryUtil.newMap();
		List<Map<String,String>> lsField = TotalDao.queryTotalField(_areaId);
		for (Map<String,String> mpField : lsField) {
			String col_code = mpField.get("col_code");
			String is_outzero = mpField.get("is_outzero");
			
			if (is_outzero.equals("1")) {
				mpData.put(col_code, "0");
			} else {
				mpData.put(col_code, "");
			}
		}
		
		return mpData;
	}
}
