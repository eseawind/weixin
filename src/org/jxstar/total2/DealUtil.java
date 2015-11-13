/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.total2;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.total.util.TotalDao;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 处理数据的工具类。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-28
 */
public class DealUtil {
	//分隔动态字段的标志
	public static final String FIELD_FLAG = "__";
	//合计字段标志
	public static final String SUM_FLAG = "sum";
	//合计字段标题
	public static final String SUM_TITLE = "合计";
	
	/**
	 * 添加字段动态标志
	 * @param field -- 原字段名
	 * @param typeId -- 动态分类ID
	 * @return
	 */
	public static String fieldFlag(String field, String typeId) {
		StringBuilder sb = new StringBuilder(field);
		sb.append(FIELD_FLAG);
		sb.append(typeId);
		return sb.toString();
	}
	
	/**
	 * 添加合计字段名
	 * @param field
	 * @return
	 */
	public static String sumFieldFlag(String field) {
		StringBuilder sb = new StringBuilder(field);
		sb.append(FIELD_FLAG);
		sb.append("sum");
		return sb.toString();
	}
	
	/**
	 * 取横向|纵向分类ID字段
	 * @param reportId
	 * @param type
	 * @return
	 */
	public static String getTypeField(String reportId, String type) {
		String field = "";
		List<Map<String,String>> lsType =  TotalDao.queryTotalArea(reportId, type);
		if (!lsType.isEmpty()) {
			field = MapUtil.getValue(lsType.get(0), "type_field");
		}
		
		return field;
	}
	
	/**
	 * 取是否输出横向合计
	 * @param reportId
	 * @return
	 */
	public static boolean hasCrossSum(String reportId) {
		boolean hasSum = false;
		List<Map<String,String>> lsType =  TotalDao.queryTotalArea(reportId, "cross");
		if (!lsType.isEmpty()) {
			String has_sum = MapUtil.getValue(lsType.get(0), "has_sum");
			hasSum = has_sum.equals("1");
		}
		return hasSum;
	}
	
	/**
	 * 是否不输出没有统计数据的行或者列
	 * @param reportId
	 * @param type
	 * @return
	 */
	public static boolean isNotOut(String reportId, String type) {
		boolean isNotOut = false;
		List<Map<String,String>> lsType =  TotalDao.queryTotalArea(reportId, type);
		if (!lsType.isEmpty()) {
			String is_notout = MapUtil.getValue(lsType.get(0), "is_notout");
			isNotOut = is_notout.equals("1");
		}
		
		return isNotOut;
	}
	
	/**
	 * 把没有分类值的统计数据行对应的分类值删除掉
	 * @param typeField
	 * @param lsTotalData
	 * @param lsTypeData
	 * @return
	 */
	public static List<Map<String,String>> removeEmpty(
			String typeField,
			List<Map<String,String>> lsTotalData,
			List<Map<String,String>> lsTypeData) {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		
		for (Map<String,String> mpType : lsTypeData) {
			String typeId = MapUtil.getValue(mpType, typeField);
			if (typeId.length() > 0) {
				for (Map<String,String> mpTotal : lsTotalData) {
					String value = MapUtil.getValue(mpTotal, typeField);
					//只要存在该类别的统计数据就可以了
					if (typeId.equals(value)) {
						lsRet.add(mpType);
						break;
					}
				}
			}
		}
		//修改类别数据
		lsTypeData.clear();
		lsTypeData.addAll(lsRet);
		
		return lsRet;
	}
	
	/**
	 * 把统计数据中没有的动态分类列都删除掉，返回json对象：
	 * [field1, field2, ...]
	 * @param reportId
	 * @param mpTotal
	 * @return
	 */
	public static String retRemoveColumn(String reportId, Map<String,String> mpTotal) {
		StringBuilder retJson = new StringBuilder();
		//取横向分类数据是否不输出空行
		boolean isNotOutX = DealUtil.isNotOut(reportId, "cross");
		if (!isNotOutX) return retJson.toString();
		
		//先取到当前报表的横向分类数据
		ReprotTotal2Imp total2 = new ReprotTotal2Imp();
		try {
			List<Map<String,String>> lsXTypeData = total2.getCrossData(reportId);
			if (!lsXTypeData.isEmpty()) {
				//取横向分类ID字段
				String xTypeField = DealUtil.getTypeField(reportId, "cross");
				//取统计字段
				String areaId = getTotalAreaId(reportId);
				List<Map<String,String>> lsField = TotalDao.queryTotalField(areaId);
				
				for (Map<String,String> mpTypeData : lsXTypeData) {
					String typeId = mpTypeData.get(xTypeField);
					
					for (Map<String,String> mpField : lsField) {
						String colcode = mpField.get("col_code");
						//如果在统计数据中没有此字段，则记录字段名，返回到前台，删除相应的列
						String newkey = fieldFlag(colcode, typeId);
						if (!mpTotal.containsKey(newkey)) {
							retJson.append("'" + newkey + "',");
						}
					}
				}
			}
			
		} catch (ReportException e) {
			e.printStackTrace();
		}
		String json = "";
		if (retJson.length() > 0) {
			json = "[" + retJson.substring(0, retJson.length()-1) + "]";
		}
		
		return json;
	}
	
	/**
	 * 构建数据钻取的查询参数条件，参数有：
	 * where_sql:显示where
	 * where_type:string;string...
	 * where_value:[param_name1];[param_name2]...
	 * xfield:
	 * yfield:
	 * @param areaId
	 * @return
	 */
	public static String getDrillParam(String areaId, String reportId) {
		Map<String,String> mpDrill = TotalDao.queryDrill(areaId);
		if (mpDrill.isEmpty()) return "";
		
		String xfield = getTypeField(reportId, "cross");
		String yfield = getTypeField(reportId, "assort");
		//where子句中会有''特殊符号，在JSON中会报错
		String where_sql = StringUtil.strForJson(mpDrill.get("where_sql"));
		
		StringBuilder sbRet = new StringBuilder();
		sbRet.append("{fun_id:'" + mpDrill.get("fun_id") + "',");
		sbRet.append("where_sql:'" + where_sql + "',");
		sbRet.append("where_type:'" + mpDrill.get("where_type") + "',");
		sbRet.append("where_value:'" + mpDrill.get("where_value") + "',");
		sbRet.append("xfield:'" + xfield + "',");
		sbRet.append("yfield:'" + yfield + "'}");
		
		return sbRet.toString();
	}
	
	/**
	 * 取得动态统计数据区域ID
	 * @param reportId
	 * @return
	 */
	public static String getTotalAreaId(String reportId) {
		String area_id = "";
		List<Map<String,String>> lsArea =  TotalDao.queryTotalArea(reportId, "query");
		if (!lsArea.isEmpty()) {
			area_id = MapUtil.getValue(lsArea.get(0), "area_id");
		}
		
		return area_id;
	}
	
	/**
	 * 输出List对象，用于测试统计数据构造过程
	 * @param ls
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public static String listToStr(List ls) {
		if (ls == null || ls.isEmpty()) return "list is empty...";
		
		StringBuilder sb = new StringBuilder();
		for (Object obj : ls) {
			if (obj instanceof String) {
				sb.append(obj + ",\r\n");
			} else if (obj instanceof Map) {
				sb.append(MapUtil.toString((Map) obj));
			} else {
				sb.append(obj + ",\r\n");
			}
		}
		
		return sb.toString();
	}
}
