/*
 * License.java 2011-4-2
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */

package org.jxstar.security;

import java.io.Serializable;

/**
 * 许可信息文件。
 *
 * @author TonyTan
 * @version 1.0, 2011-4-2
 */
public class License implements Serializable {
	private static final long serialVersionUID = -9054394433259732244L;
	
	//许可基本信息
	public int[] developer;		//开发商，如：广州市东宏软件科技有限公司
	public int[] website;		//开发商网址，如：www.dhsdp.com
	public int[] productName;	//产品名称，如：东宏软件开发平台
	public int[] versionNo;		//版本号，如：V1.0
	public int[] versionType;	//版本类型，如：EE|RE|SE
	public int[] customer;		//客户名称，如：中国石油公司
	public int[] serialNum;		//许可数量，如：5
	
	//试用许可信息
	public int[] tmpStart;		//有效开始时间，初始写入，如：2010-11-30 12:10:10
	public int[] tmpEnd;		//有效结束时间，初始写入，如：2011-02-30 12:10:10
	public int[] tmpValid;		//合法标志，如：1, 0为非法
	
	//正式许可信息
	public int[] serialNo;		//序列号
	public int[] serialValid;	//合法标志，如：1, 0为非法

	//控制范围
	public int[] funNum;		//控制注册功能数量
	public int[] flowNum;		//控制注册流程数量
	public int[] userNum;		//控制在线用户数量
}
