/*
 * Report.java 2010-11-11
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report;

import java.util.Map;

/**
 * 报表输出对象接口。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-11
 */
public interface Report {
	
	/**
	 * 初始化报表处理参数。
	 * 
	 * @param mpParam -- 报表请求参数
	 * @throws ReportException
	 */
	public void initReport(Map<String, Object> mpParam) throws ReportException;
	
	/**
	 * 输出报表内容对象。
	 * 
	 * @return
	 * @throws ReportException
	 */
	public Object output() throws ReportException;
}
