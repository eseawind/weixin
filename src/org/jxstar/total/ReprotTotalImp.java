package org.jxstar.total;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 简单统计的报表的实现类。
 *
 * @author TonyTan
 * @version 1.0, 2011-11-30
 */
public class ReprotTotalImp extends AbstractTotal {

	/**
	 * 输出统计数据
	 */
	public List<Map<String,String>> outputTotal() throws ReportException {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		//返回分类区域结果集
		List<Map<String,String>> lsAssort = getAssortData(_reportId);

		//获取各区域统计数据
		lsRet = getTotalData(_reportId, lsAssort);

		//处理各区域中的表达式字段数据
		lsRet = calcTotalData(_reportId, lsRet);

		//处理各区域中的合计字段数据
		lsRet = calcSumItem(_reportId, lsRet);

		return lsRet;
	}

}
