/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.security;


/**
 * 与许可相关的业务处理类。
 *
 * @author TonyTan
 * @version 1.0, 2012-5-15
 */
public class LicenseInfo {

	/**
	 * 读取机器序列号
	 * @return
	 */
	public static String readKey() {
		return LicenseKey.getLocalKey();
	}
	
	/**
	 * 读取许可信息
	 * @return
	 */
	public static String readInfo() {
		SafeManager mng = SafeManager.getInstance();
		License lic = mng.readLicense("");
		
		String str = "";
		str += "<p>用户信息：" + str(lic.customer);
		str += "<p>序列代号：" + str(lic.serialNo);
		str += "<p>平台厂家：" + str(lic.developer);
		str += "<p>平台网站：" + str(lic.website);
		str += "<p>平台名称：" + str(lic.productName);
		str += "<p>版本类型：" + str(lic.versionType);
		str += "<p>版本代号：" + str(lic.versionNo);
		str += "<p>参考日期：" + str(lic.tmpEnd);
		
		return str;
	}
	
	private static String str(int[] s) {
		return SafeUtil.encode(s) + "</p>";
	}
}
