package org.jxstar.total2;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.dao.pool.DataSourceConfig;
import org.jxstar.report.ReportException;
import org.jxstar.total.AbstractTotal;
import org.jxstar.total.util.Expression;
import org.jxstar.total.util.TotalDao;
import org.jxstar.total.util.TotalUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringValidator;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 统计报表实现的抽象类。
 *
 * @author TonyTan
 * @version 1.0, 2011-11-30
 */
public abstract class AbstractTotal2 extends AbstractTotal {
	
	/**
	 * 获取横向分类区域结果集
	 * @param reportId -- 报表定义ID
	 * @return List
	 * @throws ReportException
	 */
	public List<Map<String,String>> getCrossData(String reportId) throws ReportException {
		List<Map<String,String>> lsData = FactoryUtil.newList();
		List<Map<String,String>> lsArea =  TotalDao.queryTotalArea(reportId, "cross");

		for (int i = 0, n = lsArea.size(); i < n; i++) {
			Map<String,String> mpArea = lsArea.get(i);
			
			lsData = queryAssort(lsData, mpArea);
		}

		return lsData;
	}

	/**
	 * 先根据统计SQL获取统计数据，然后再根据横向分类与纵向分类重新组织数据到新的Map中
	 * 统计SQL定义一般需要Group By：纵向分类ID、横向分类ID，如：
	 * select dept_id, product_id, sum(num) as sum_num, sum(money) as sum_money from ...
	 * @param reportId -- 报表定义ID
	 * @param lsYTypeData -- 统计分类数据
	 * @param lsXTypeData -- 横向分类数据
	 * @return List
	 * @throws ReportException
	 */
	protected List<Map<String,String>> getTotalData(String reportId, 
			List<Map<String,String>> lsYTypeData, 
			List<Map<String,String>> lsXTypeData) throws ReportException {
		List<Map<String,String>> lsRet = null;
		
		List<Map<String,String>> lsArea =  TotalDao.queryTotalArea(reportId, "query");
		if (lsArea.isEmpty() || lsArea.size() > 1) {
			throw new ReportException("二维动态统计报表暂时只支持一个统计区域！");
		}
		
		//取统计区域ID
		Map<String,String> mpArea = lsArea.get(0);
		String areaId = mpArea.get("area_id");
		
		//取横向分类ID字段
		String xTypeField = DealUtil.getTypeField(reportId, "cross");
		//取纵向分类ID字段
		String yTypeField = DealUtil.getTypeField(reportId, "assort");
		//取横向分类数据是否不输出空行
		boolean isNotOutX = DealUtil.isNotOut(reportId, "cross");
		//取纵向分类数据是否不输出空行
		boolean isNotOutY = DealUtil.isNotOut(reportId, "assort");
		
		//统计数据
		List<Map<String,String>> lsTotalData = totalArea(mpArea);
		
		//重新组合统计数据
		if (!lsYTypeData.isEmpty() && !lsXTypeData.isEmpty()) {
			if (xTypeField.length() == 0) {
				throw new ReportException("二维动态统计报表的横向分类区域中的【分类标示字段】不能为空！");
			}
			if (yTypeField.length() == 0) {
				throw new ReportException("二维动态统计报表的纵向分类区域中的【分类标示字段】不能为空！");
			}
			
			if (isNotOutX) {
				lsXTypeData = DealUtil.removeEmpty(xTypeField, lsTotalData, lsXTypeData);
			}
			if (isNotOutY) {
				lsYTypeData = DealUtil.removeEmpty(yTypeField, lsTotalData, lsYTypeData);
			}
			
			DealDataXY dealXY = new DealDataXY(
					areaId, 
					xTypeField, 
					yTypeField, 
					lsTotalData, 
					lsXTypeData, 
					lsYTypeData);
			
			lsRet = dealXY.returnTotalData();
		} else if (!lsYTypeData.isEmpty()) {
			if (yTypeField.length() == 0) {
				throw new ReportException("二维动态统计报表的纵向分类区域中的【分类标示字段】不能为空！");
			}
			if (isNotOutY) {
				lsYTypeData = DealUtil.removeEmpty(yTypeField, lsTotalData, lsYTypeData);
			}
			
			DealDataY dealY = new DealDataY(
					areaId, 
					yTypeField, 
					lsTotalData, 
					lsYTypeData);
			
			lsRet = dealY.returnTotalData();
		} else {
			lsRet = lsTotalData;
		}
		

		return lsRet;
	}
	
	/**
	 * 获取一个区域中的一条统计数据，修改为：
	 * 不需要内部统计参数，采用Group By typeId的方式定义统计SQL
	 * 
	 * @param mpArea -- 区域定义信息
	 * @return Map
	 * @throws ReportException
	 */
	private List<Map<String,String>> totalArea(Map<String,String> mpArea)
		throws ReportException {
		List<Map<String,String>> lsRet = null;
		//暂时改为不需要内部统计参数，提高统计效率
		Map<String,String> mpParam = FactoryUtil.newMap();
		
		//获取区域SQL语句
		String areaName = mpArea.get("area_name");
		String strSQL[] = getAreaSQL(mpArea, mpParam);
		_log.showDebug("[" + areaName + "] area sql[0] = " + strSQL[0]);
		_log.showDebug("[" + areaName + "] area sql[1] = " + strSQL[1]);
		_log.showDebug("[" + areaName + "] area sql[2] = " + strSQL[2]);

		//取数据源名称
		String dsName = MapUtil.getValue(mpArea, "ds_name", 
							DataSourceConfig.getDefaultName());

		DaoParam param = _dao.createParam(strSQL[0]);
		param.setDsName(dsName);
		param.setValue(strSQL[1]);
		param.setType(strSQL[2]);
		
		lsRet = _dao.query(param);
		
		//处理统计结果中的0，根据统计字段设置是保留还是去掉
		String areaId = mpArea.get("area_id");
		lsRet = TotalUtil.writeZero(lsRet, areaId);
		
		return lsRet;
	}
	
	/**
	 * 处理各区域中的表达式字段数据:
	 * 增加横向分类动态报表的计算字段处理：
	 * 有多少个动态分类值，就重新构建多少个表达式，需要修改表达值中的字段名
	 * @param reportId -- 报表ID
	 * @param lsData -- 统计数据
	 * @param lsXTypeData -- 横向分类数据
	 * @return
	 */
	protected List<Map<String,String>> calcTotalData(String reportId, 
			List<Map<String,String>> lsData, 
			List<Map<String,String>> lsXTypeData) {
		Map<String,String> mpData = null, mpItem = null;
		String express = null, colcode = null, value = null;
		
		List<Map<String,String>> lsExpress = TotalDao.queryExpress(reportId);
		
		//给表达式与字段名添加分类值：express, col_code
		if (!lsXTypeData.isEmpty()) {
			String xTypeField = DealUtil.getTypeField(reportId, "cross");
			if (xTypeField.length() > 0) {
				lsExpress = DealExpress.dealExpress(xTypeField, lsExpress, lsXTypeData);
			}
		}
		
		for (int i = 0, n = lsData.size(); i < n; i++) {
			mpData = lsData.get(i);

			for (int j = 0, m = lsExpress.size(); j < m; j++) {
				mpItem = lsExpress.get(j);
				express = mpItem.get("express");
				colcode = mpItem.get("col_code");
				
				//计算表达式的值
				value = Expression.calc(mpData, express);
				mpData.put(colcode, value);
			}
		}

		return lsData;
	}
	
	/**
	 * 计算纵向最后一行的合计值
	 * @param reportId
	 * @param lsData
	 * @param lsXTypeData
	 * @return
	 */
	protected List<Map<String,String>> calcSumBottom(String reportId, 
			List<Map<String,String>> lsData,
			List<Map<String,String>> lsXTypeData) {
		//添加横向分类区域中的合计值，如果lsXTypeData为空，则不执行此方法
		Map<String,String> mpTotal = FactoryUtil.newMap();
		String field = DealUtil.getTypeField(_reportId, "cross");
		for (Map<String,String> mpXType : lsXTypeData) {
			String typeId = mpXType.get(field);
			mpTotal = calcSumXType(_reportId, typeId, mpTotal, lsData);
		}
		
		String sumTitle = "", isstat, isshow, colcode;
		//添加合计行标题
		if (!mpTotal.isEmpty()) {
			List<Map<String,String>> lsDetail = TotalUtil.queryColumn(reportId);
			for (Map<String,String> mpDetail : lsDetail) {
				//如果是统计字段，则计算合计值了
				isstat = MapUtil.getValue(mpDetail, "is_stat", "0");
				if (isstat.equals("1")) continue;
				
				isshow = MapUtil.getValue(mpDetail, "is_show", "0");
				colcode = MapUtil.getValue(mpDetail, "col_code");
				
				if (isshow.equals("1") && sumTitle.length() == 0) {
					sumTitle = "合计";
					mpTotal.put(colcode, sumTitle);
				} else {
					mpTotal.put(colcode, "");
				}
			}
		}
		
		if (!mpTotal.isEmpty()) {
			lsData.add(mpTotal);
		}
		
		return lsData;
	}

	/**
	 * 处理各区域中的合计字段数据
	 * @param reportId -- 报表ID
	 * @param typeId -- 横向分类ID值
	 * @param mpTotal -- 最后一行统计数据
	 * @param lsData -- 统计数据
	 * @return
	 */
	protected Map<String,String> calcSumXType(String reportId, 
			String typeId, 
			Map<String,String> mpTotal,
			List<Map<String,String>> lsData) {
		Map<String,String> mpItem = null, mpRet = null;
		String isstat = null, colcode = null, value = null, express = null;
		BigDecimal bdResult = null;
		//标记有统计字段，为true才添加合计行
		boolean isTotal = false;

		String areaId = DealUtil.getTotalAreaId(reportId);
		List<Map<String,String>> lsDetail = TotalDao.queryTotalField(areaId);
		for (int i = 0, n = lsDetail.size(); i < n; i++) {
			mpItem = lsDetail.get(i);
			isstat = MapUtil.getValue(mpItem, "is_stat", "0");
			colcode = mpItem.get("col_code");
			
			//添加横向分类ID值，因为横向动态列的字段名不同
			if (isstat.equals("1") && typeId != null && typeId.length() > 0) {
				colcode = DealUtil.fieldFlag(colcode, typeId);
			}
			
			//带除法的表达式不能直接求和			
			express = mpItem.get("express");
			if(express.indexOf("/") > 0) continue;

			bdResult = new BigDecimal(0);
			for (int j = 0, m = lsData.size(); j < m; j++) {
				mpRet = lsData.get(j);
				value = mpRet.get(colcode);
				
				if (value == null || value.length() == 0) continue;

				if (!StringValidator
					.validValue(value, StringValidator.DOUBLE_TYPE))
					continue;

				bdResult = bdResult.add(new BigDecimal(value));
				isTotal = true;
			}
			mpTotal.put(colcode, bdResult.toString());
		}
		
		//带除法的表达式要等其他值都计算后再执行除法求值		
		if (isTotal == true) {
			for (int i = 0, n = lsDetail.size(); i < n; i++) {
				mpItem = lsDetail.get(i);
				express = mpItem.get("express");
				if(express.length() == 0 || express.indexOf("/") <= 0) continue;
				colcode = mpItem.get("col_code");
				
				//给表达式中的字段添加“__类别ID”
				if (typeId != null && typeId.length() > 0) {
					express = DealExpress.pareseExpress(express, typeId);
					colcode = DealUtil.fieldFlag(colcode, typeId);
					_log.showDebug("...........deal express=" + express);
				}
				
				//计算表达式的值
				value = Expression.calc(mpTotal, express);
				mpTotal.put(colcode, value);
			}
		}
		
		return mpTotal;
	}
	
	/**
	 * 添加横向分类的合计值
	 * @param reportId
	 * @param lsData
	 * @param lsYTypeData
	 * @return
	 */
	protected List<Map<String,String>> addCrossSum(String reportId, 
			List<Map<String,String>> lsData,
			List<Map<String,String>> lsYTypeData) {
		//取统计区域ID
		List<Map<String,String>> lsArea =  TotalDao.queryTotalArea(reportId, "query");
		Map<String,String> mpArea = lsArea.get(0);
		String areaId = mpArea.get("area_id");
		
		List<Map<String,String>> lsField =  TotalDao.queryTotalField(areaId);
		
		//处理每一行数据，把同一个字段的值累计和，作为合计值
		for (Map<String,String> mpData : lsData) {
			
			for (Map<String,String> mpField : lsField) {
				String col_code = mpField.get("col_code");
				
				String sum_value = sumCrossValue(col_code, mpData);
				
				mpData.put(DealUtil.sumFieldFlag(col_code), sum_value);
			}
		}
		
		return lsData;
	}
	
	//求横向合计值
	private String sumCrossValue(String colcode, Map<String,String> mpData) {
		BigDecimal bdResult = new BigDecimal(0);
		for (String key : mpData.keySet()) {
			if (key.indexOf(colcode + DealUtil.FIELD_FLAG) == 0) {
				String value = mpData.get(key);
				
				if (value == null || value.length() == 0) continue;

				if (!StringValidator
					.validValue(value, StringValidator.DOUBLE_TYPE))
					continue;

				bdResult = bdResult.add(new BigDecimal(value));
			}
		}
		
		return bdResult.toString();
	}
}
