/*
 * LicenseKey.java 2011-4-2
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */

package org.jxstar.security;


/**
 * 许可服务序列号生成器。
 *
 * @author TonyTan
 * @version 1.0, 2011-4-2
 */
public class LicenseKey {
	
	/**
	 * 获取本地服务器的序列号
	 * @return
	 */
	public static String getLocalKey() {
		String mac = null;
		String os = System.getProperty("os.name").toLowerCase();
		if(os.startsWith("windows")){
			mac = SafeUtil.getWindowsAddr();
		} else {
			mac = SafeUtil.getLinuxAddr();
		}
		
		return Password.encrypt(mac);
	}
}
