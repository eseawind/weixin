/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.total2;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jxstar.util.factory.FactoryUtil;

/**
 * 给表达式与字段名添加分类值，
 * 有多少个动态分类值，就重新构建多少个表达式，需要修改表达值中的字段名。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-28
 */
public class DealExpress {

	public static List<Map<String,String>> dealExpress(
			String xTypeField,
			List<Map<String,String>> lsExpress,
			List<Map<String,String>> lsXTypeData) {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		
		for (Map<String,String> mpType : lsXTypeData) {
			String typeId = mpType.get(xTypeField);
			
			//express, col_code
			for (Map<String,String> mpExp : lsExpress) {
				//构建一个新的字段列
				Map<String,String> mpCol = FactoryUtil.newMap();
				mpCol.putAll(mpExp);
				
				String col_code = mpCol.get("col_code");
				mpCol.put("col_code", DealUtil.fieldFlag(col_code, typeId));
				
				String express = mpCol.get("express");
				//把[field_name]类型的字段名都添加__typeId
				mpCol.put("express", pareseExpress(express, typeId));
				
				lsRet.add(mpCol);
			}
		}
		
		return lsRet;
	}
	
	//解析表达式：[field1]/[field2] --> [field1__typeId]/[field2__typeId]
	public static String pareseExpress(String express, String typeId) {
		Pattern p = Pattern.compile("\\[[^]]+\\]");
		Matcher m = p.matcher(express);
		StringBuffer sb = new StringBuffer();
		while (m.find()) {
			String name = m.group();
			name = name.substring(1, name.length()-1);
			name = "[" + name + "__" + typeId + "]";

			m.appendReplacement(sb, name);
		}
		m.appendTail(sb);
		
		return sb.toString();
	}
}
