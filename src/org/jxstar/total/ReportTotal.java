package org.jxstar.total;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;

/**
 * 统计报表的接口。
 *
 * @author TonyTan
 * @version 1.0, 2011-11-30
 */
public interface ReportTotal {

	/**
	 * 初始化统计报表参数
	 * @param request -- 前台请求参数值
	 * @throws ReportException
	 */
	public void initTotal(Map<String, Object> request) throws ReportException;
	
	/**
	 * 输出统计结果
	 * @return
	 * @throws ReportException
	 */
	public List<Map<String,String>> outputTotal() throws ReportException;
}
