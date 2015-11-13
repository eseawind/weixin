package org.jxstar.total.util;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.jxstar.service.util.TaskUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 统计报表工具类。
 *
 * @author TonyTan
 * @version 1.0, 2011-12-3
 */
public class TotalUtil {

	/**
	 * 把list对象转换为json对象，所有数据都认为是文本型数据
	 * @param lsData
	 * @return
	 */
	public static String listToJson(List<Map<String, String>> lsData) {
		if (lsData == null || lsData.isEmpty()) return "[]"; 
		
		StringBuilder sbJson = new StringBuilder();
		for (int i = 0, n = lsData.size(); i < n; i++) {
			Map<String,String> mpData = lsData.get(i);
			
			StringBuilder sbrow = new StringBuilder();
			Iterator<String> itr = mpData.keySet().iterator();
			while(itr.hasNext()) {
				String key = itr.next();
				String value = MapUtil.getValue(mpData, key);
				
				sbrow.append("'"+ key +"':'" + StringUtil.strForJson(value) + "',");
			}
			if (sbrow.length() > 0) {
				sbJson.append("{"+ sbrow.substring(0, sbrow.length()-1) +"},");
			}
		}
		String json = "";
		if (sbJson.length() > 0) {
			json = "["+ sbJson.substring(0, sbJson.length()-1) + "]";
		}
		
		return json;
	}
	
	/**
	 * 根据报表字段定义，处理数据中如果数值为空，则填写零；或者不输出零
	 * @param mpData -- 数据
	 * @param areaId -- 区域ID
	 */
	public static List<Map<String, String>> writeZero(
			List<Map<String, String>> lsData, String areaId) {
		List<Map<String,String>> lsField = TotalDao.queryTotalField(areaId);
		if (lsField.isEmpty()) return lsData;
		
		for (Map<String,String> mpData : lsData) {
			writeZero(mpData, lsField);
		}
		return lsData;
	}
	public static Map<String, String> writeZero(Map<String, String> mpData, String areaId) {
		List<Map<String,String>> lsField = TotalDao.queryTotalField(areaId);
		if (lsField.isEmpty()) return mpData;
		
		return writeZero(mpData, lsField);
	}
	private static Map<String, String> writeZero(Map<String, String> mpData, 
			List<Map<String,String>> lsField) {
		for (Map<String,String> mpField : lsField) {
			String col_code = mpField.get("col_code");
			String is_outzero = mpField.get("is_outzero");
			
			String value = MapUtil.getValue(mpData, col_code, "0");
			if (value.equals("0")) {
				if (is_outzero.equals("1")) {
					mpData.put(col_code, "0");
				} else {
					mpData.put(col_code, "");
				}
			} else {
				mpData.put(col_code, value);
			}
		}
		return mpData;
	}
	
	/**
	 * 取统计报表输出数据的所有列信息，需要按区域与字段次序排序
	 * @param reportId -- 报表ID
	 * @return
	 */
	public static List<Map<String,String>> queryColumn(String reportId) {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		List<Map<String,String>> lsArea = TotalDao.queryArea(reportId);
		
		for (int i = 0, n = lsArea.size(); i < n; i++) {
			Map<String,String> mpArea = lsArea.get(i);
			
			String areaId = mpArea.get("area_id");
			lsRet.addAll(TotalDao.queryDetail(areaId));
		}
		
		return lsRet;
	}
	
	/**
	 * 解析统计区域中的扩展参数值
	 * @param whereValue -- 扩展参数设置
	 * @param requestData -- 请求对象中的值
	 * @param paramData -- 内部参数值
	 * @return
	 */
	public static String parseWhereValue(String whereValue, 
		Map<String,Object> requestData, Map<String,String> paramData) {
		if (whereValue == null || whereValue.length() == 0) return "";
		
		Map<String,String> mpData = FactoryUtil.newMap();
		if (paramData != null && !paramData.isEmpty()) {
			mpData.putAll(paramData);
		}
		
		if (requestData != null && !requestData.isEmpty()) {
			Iterator<String> itr = requestData.keySet().iterator();
			while(itr.hasNext()) {
				String key = itr.next();
				Object value = requestData.get(key);
				if (value != null && value instanceof String) {
					mpData.put(key, (String) value);
				}
			}
		}
		
		//解析表达式中的字段名
		return TaskUtil.parseAppField(whereValue, mpData, false);
	}
}
