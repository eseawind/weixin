/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.security;

import java.util.HashMap;
import java.util.Map;

/**
 * 保存许可设置信息对象。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-4
 */
public class LicenseVar {
	private static Map<String,String> _mpVar = new HashMap<String,String>();
	//许可文件真实路径
	public static final String REAL_PATH = "license.real.path";
	//许可文件生成路径
	public static final String CREATE_PATH = "license.create.path";
	//许可版本类型
	public static final String VERSION_TYPE = "license.version.type";
	//许可无效标志
	public static final String INVALID = "license.invalid";
	//安全管理类有效标志
	public static final String FLAG_VALID = "license.flag.valid";
	//安全管理类数量是否有效标志
	public static final String NUM_VALID = "license.num.valid";
		
	public static String getValue(String keyName) {
		return getValue(keyName, "");
	}
	
	public static void setValue(String keyName, String keyValue) {
		if (keyName == null || keyName.length() == 0) return;
		
		if (keyValue == null) keyValue = "";
		
		_mpVar.put(keyName, keyValue);
	}
	
	public static String getValue(String keyName, String defaultValue) {
		if (keyName == null || keyName.length() == 0) return "";
		
		String value = _mpVar.get(keyName.toLowerCase());
		
		if (value == null || value.length() == 0) {
			value = defaultValue;
		}
		
		return value;
	}
}
