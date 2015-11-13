/*
 * SafeUtil.java 2011-4-2
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */

package org.jxstar.security;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.Calendar;

/**
 * 安全许可相关的工具方法。
 *
 * @author TonyTan
 * @version 1.0, 2011-4-2
 */
public class SafeUtil {
	/**
	* 获取Linux网卡的mac地址.
	* 非windows的系统默认调用本方法获取.如果有特殊系统请继续扩充新的取mac地址方法.
	* @return mac地址
	*/
	public static String getLinuxAddr() {
		String mac = null;
		BufferedReader bufferedReader = null;
		Process process = null;
		try {
			process = Runtime.getRuntime().exec("ifconfig eth0");// linux下的命令，一般取eth0作为本地主网卡 显示信息中包含有mac地址信息
			bufferedReader = new BufferedReader(new InputStreamReader(process
					.getInputStream()));
			String line = null;
			int index = -1;
			while ((line = bufferedReader.readLine()) != null) {
				index = line.toLowerCase().indexOf("hwaddr");// 寻找标示字符串[hwaddr]
				if (index >= 0) {// 找到了
					mac = line.substring(index +"hwaddr".length()+ 1).trim();//  取出mac地址并去除2边空格
					break;
				}
			}
		} catch (IOException e) {
			//e.printStackTrace();
		} finally {
			try {
				if (bufferedReader != null) {
					bufferedReader.close();
				}
			} catch (IOException e1) {
				//e1.printStackTrace();
			}
			bufferedReader = null;
			process = null;
		}

		return mac;
	}

	/**
	* 获取widnows网卡的mac地址.
	* nbtstat -a 192.168.1.105 取局域网电脑mac地址
	* MAC 地址 = F0-DE-F1-85-72-41
	* 物理地址. . . . . . . . . . . . . : 5C-AC-4C-B9-5A-79
	* @return mac地址
	*/
	public static String getWindowsAddr() {
		String mac = null;
		BufferedReader bufferedReader = null;
		Process process = null;
		try {
			process = Runtime.getRuntime().exec("ipconfig /all");// windows下的命令，显示信息中包含有mac地址信息
			bufferedReader = new BufferedReader(new InputStreamReader(process
					.getInputStream(), "gbk"));
			String line = null;
			int index = -1;
			while ((line = bufferedReader.readLine()) != null) {
				index = line.toLowerCase().indexOf("physical address");// 寻找标示字符串[physical address]
				if (index < 0) {
					index = line.indexOf("物理地址");
				}
				if (index >= 0) {// 找到了
					index = line.indexOf(":");// 寻找":"的位置
					if (index>=0) {
						mac = line.substring(index + 1).trim();//  取出mac地址并去除2边空格
					}
					break;
				}
			}
		} catch (IOException e) {
			//e.printStackTrace();
		} finally {
			try {
				if (bufferedReader != null) {
					bufferedReader.close();
				}
			} catch (IOException e1) {
				//e1.printStackTrace();
			}
			bufferedReader = null;
			process = null;
		}

		return mac;
	}
	
	/**
	 * 字符串解密
	 * @param bytes
	 * @return
	 */
	public static String encode(int[] bytes) {
		if (bytes == null || bytes.length == 0) return "";
		
		byte[] retbytes = new byte[bytes.length];
		for (int i = 0, n = bytes.length; i < n; i++) {
			retbytes[i] = (byte) (bytes[i]-3);
		}
		
		String str = "";
		try {
			str = new String(retbytes, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return str;
	}
	
	/**
	 * 字符串加密
	 * @param text
	 * @return
	 */
	public static int[] decode(String text) {
		if (text == null || text.length() == 0) return null;
		
		byte[] bytes = new byte[0];
		try {
			bytes = text.getBytes("UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		int[] retbytes = new int[bytes.length];
		for (int i = 0, n = bytes.length; i < n; i++) {
			retbytes[i] = bytes[i]+3;
		}
		
		return retbytes;
	}
	
	/**
	 * yyyy-mm-dd 字符串转换日历对象
	 * @param strDate
	 * @return
	 */
	public static Calendar strToCalendar(String strDate) {
		Calendar calendar = Calendar.getInstance();
		if (strDate == null || strDate.length() == 0) return calendar;
		//只取日期部分，不要时间
		String[] ss = strDate.split(" ");
		if (ss.length > 1) {
			strDate = ss[0];
		}
		
		//年、月、日
		int year = 0, month = 0, day = 0;
		String[] sd = strDate.split("-");
		if (sd.length > 0) year = Integer.parseInt(sd[0]);
		if (sd.length > 1) month = Integer.parseInt(sd[1]) - 1;
		if (sd.length > 2) day = Integer.parseInt(sd[2]);
		
		//设置时间值
		calendar.set(year, month, day);
	
		return calendar;
	}
}
