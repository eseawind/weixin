/*
 * SafeManager.java 2011-4-2
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */

package org.jxstar.security;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectInputStream;
import java.io.ObjectOutput;
import java.io.ObjectOutputStream;
import java.math.BigDecimal;
import java.util.Calendar;
import java.util.Date;


/**
 * 安全管理工具类。
 *
 * @author TonyTan
 * @version 1.0, 2011-4-2
 */
public class SafeManager {
	private static SafeManager _instance = new SafeManager();
	//单例，私有构造函数
	private SafeManager(){}
	
	public static SafeManager getInstance() {
		return _instance;
	}
	
	/**
	 * 检测系统是否合法，检测方法：
	 * 先检测许可文件为合法的，则系统合法；
	 * 否则再检测软件狗是否合法，判断系统是否合法；
	 * @return
	 */
	public int validCode() {
		Date curDate = Calendar.getInstance().getTime();
		return validCode(curDate);
	}
	
	/**
	 * 根据指定时间检验许可是否合法
	 * @param curDate -- 指定时间
	 * @return
	 */
	public int validCode(Date curDate) {
		return getCode(curDate);
	}
	
	/**
	 * 避免替换类方法
	 * @return
	 */
	public int checkCode() {
		Date curDate = Calendar.getInstance().getTime();
		return getCode(curDate);
	}
	
	/**
	 * 获取版本号
	 * @return
	 */
	public String getVerName() {
		flagValid();
		
		License lic = readLicense("");
		if (lic == null) return "SE";
		
		String verName = SafeUtil.encode(lic.versionType);
		if (verName == null || verName.length() == 0) {
			return "SE";
		}
		return verName;
	}
	
	/**
	 * 修改平台版本类型
	 * @return
	 */
	public void updateEE() {
		LicenseVar.setValue(LicenseVar.VERSION_TYPE, getVerName());
	}
	
	/**
	 * 读取控制范围数量，如果没有设置，则缺省值为1
	 * @param type 1 功能数 2 流程数 3 用户数
	 * @return
	 */
	public int getNum(int type) {
		License lic = readLicense("");
		if (lic != null) {
			int[] bs = null;
			if (type == 1) {
				bs = lic.funNum;
			} else if (type == 2) {
				bs = lic.flowNum;
			} else {
				bs = lic.userNum;
			}
			numValid();
			
			String num = SafeUtil.encode(bs);
			if (num == null || num.length() == 0) 
				return 1;
			return Integer.parseInt(num);
		}
		return 1;
	}

	/**
	 * 创建新的许可文件
	 * @param lic -- 许可对象
	 */
	public boolean writeLicense(License lic) {
		//取输出文件的路径
		String path = LicenseVar.getValue(LicenseVar.CREATE_PATH, "d:/");
		
		path += "license.dat";
		
		return writeLicense(lic, path);
	}
	
	/**
	 * 先检查合法标志，再检查序列号是否相等
	 * @param lic -- 许可对象
	 * @return
	 */
	private int validSerial(License lic) {
		if (lic == null) {
			return 200;
		}
		//序列号
		String serial = SafeUtil.encode(lic.serialNo);
		//序列合法标志
		String val = SafeUtil.encode(lic.serialValid);
		
		if (val.length() == 0) {
			return 201;
		}
		if (val.equals("0")) {
			return 202;
		}
		if (serial.length() == 0) {
			return 203;
		}
		
		//序列号无效
		String key = LicenseKey.getLocalKey();
		if (!serial.equals(key)) {
			return 204;
		}
		
		return 0;
	}
	
	/**
	 * 先检查合法标志，再检查当前时间是否超过结束时间。
	 * 为防止用户修改服务器的时间，则定时通过后台任务比较网络时间与许可结束时间，如果超过，则修改合法标志为0。
	 * 
	 * @param lic -- 许可对象
	 * @param curDate -- 当前时间
	 * @return
	 */
	private int validTmp(License lic, Date curDate) {
		if (lic == null) {
			return 100;
		}
		if (SafeUtil.encode(lic.tmpValid).length() == 0) {
			return 101;
		}
		if (SafeUtil.encode(lic.tmpValid).equals("0")) {
			return 102;
		}
		if (SafeUtil.encode(lic.tmpEnd).length() == 0) {
			return 103;
		}
		
		Calendar end = SafeUtil.strToCalendar(SafeUtil.encode(lic.tmpEnd));
		//如果当前时间超过了结束时间，则算无效
		if (curDate.compareTo(end.getTime()) > 0) {
			return 104;
		}
		
		return 0;
	}
	
	/**
	 * 修改系统许可文件中的serialValid值
	 * @param valid -- 1表示合法，0表示非法
	 */
	public void setDogValid(String valid) {
		License lic = readLicense("");
		if (lic != null) {
			lic.serialValid = SafeUtil.decode(valid);
			writeLicense(lic, "");
		}
	}
	
	/**
	 * 获取许可有效结束时间
	 * @return
	 */
	public String getEndTime() {
		License lic = readLicense("");
		if (lic != null) {
			return SafeUtil.encode(lic.tmpEnd);
		}
		return "";
	}
	
	/**
	 * 修改系统许可文件中的tmpValid值
	 * @param valid -- 1表示合法，0表示非法
	 */
	public void setTmpValid(String valid) {
		License lic = readLicense("");
		if (lic != null) {
			lic.tmpValid = SafeUtil.decode(valid);
			writeLicense(lic, "");
		}
	}
	
	//取许可校验代码
	private int getCode(Date curDate) {
		License lic = readLicense("");
		if (lic == null) return 999;
		
		int code = validTmp(lic, curDate);
		//检测试用期是否合法
		if (code > 0) {
			setTmpValid("0");	//修改临时许可为非法标志
		} else {
			return 0;
		}
		
		//学习版不检测序列号
		String verName = SafeUtil.encode(lic.versionType);
		if (verName.equals("SE")) return code;
		
		//检测序列号是否合法
		code = validSerial(lic);
		if (code > 0) {
			setDogValid("0");	//修改软件狗为非法标志
			return code;
		}
		
		return 0;
	}
	
	/**
	 * 取出系统许可文件，生成License对象
	 * @return
	 */
	public License readLicense(String path) {
		if (path == null || path.length() == 0) {
			path = LicenseVar.getValue(LicenseVar.REAL_PATH) + "/WEB-INF/classes/license.dat";
		}
		
		ObjectInput in = null;
		try {
			in = new ObjectInputStream(new FileInputStream(path));
			
			return (License) in.readObject();
		} catch (Exception e) {
			//e.printStackTrace();
			System.out.println(e.getMessage());
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (IOException e) {
					//e.printStackTrace();
					System.out.println(e.getMessage());
				}
			}
		}
		
		return null;
	}
	
	/**
	 * 写许可文件
	 * @param lic -- 许可对象
	 * @param path -- 文件路径
	 */
	private boolean writeLicense(License lic, String path) {
		if (path == null || path.length() == 0) {
			path = LicenseVar.getValue(LicenseVar.REAL_PATH) + "/WEB-INF/classes/license.dat";
		}
		
		ObjectOutput out = null;
		try {
			out = new ObjectOutputStream(new FileOutputStream(path));
			
			out.writeObject(lic);
			return true;
		} catch (Exception e) {
			//e.printStackTrace();
			System.out.println(e.getMessage());
		} finally {
			if (out != null) {
				try {
					out.close();
				} catch (IOException e) {
					//e.printStackTrace();
					System.out.println(e.getMessage());
				}
			}
		}
		
		return false;
	}
	
	/**
	 * 用于标记安全管理类是否有效，防止用户替换管理类
	 * 1表示有效，0表示无效
	 */
	private void flagValid() {
		String name = LicenseVar.FLAG_VALID;
		String val = LicenseVar.getValue(name);
		if (val.length() == 0) {
			BigDecimal db = new BigDecimal("32");
			val = db.subtract(new BigDecimal("31")).toString();
			
			LicenseVar.setValue(name, val);
		}
	}
	
	/**
	 * 用于标记安全管理类是否有效，防止用户替换管理类
	 * 1表示有效，0表示无效
	 */
	private void numValid() {
		String name = LicenseVar.NUM_VALID;
		String val = LicenseVar.getValue(name);
		if (val.length() == 0) {
			BigDecimal db = new BigDecimal("32");
			val = db.subtract(new BigDecimal("31")).toString();
			
			LicenseVar.setValue(name, val);
		}
	}
}
