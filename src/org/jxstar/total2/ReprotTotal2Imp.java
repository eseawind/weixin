package org.jxstar.total2;

import java.util.List;
import java.util.Map;

import org.jxstar.report.ReportException;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 动态二维统计的报表的实现类。
 * 不支持多级分类统计，支持一个统计结果动态纵向分配与动态横向分配数据。
 *
 * @author TonyTan
 * @version 1.0, 2011-11-30
 */
public class ReprotTotal2Imp extends AbstractTotal2 {
	
	/**
	 * 输出统计数据
	 */
	public List<Map<String,String>> outputTotal() throws ReportException {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		//返回纵向分类数据
		List<Map<String,String>> lsYTypeData = getAssortData(_reportId);
		_log.showDebug("---------yType_data=\n\r" + DealUtil.listToStr(lsYTypeData));
		
		//返回横向分类数据
		List<Map<String,String>> lsXTypeData = getCrossData(_reportId); 
		_log.showDebug("---------xType_data=\n\r" + DealUtil.listToStr(lsXTypeData));
		
		//获取各区域统计数据
		lsRet = getTotalData(_reportId, lsYTypeData, lsXTypeData);
		_log.showDebug("---------yType_data=\n\r" + DealUtil.listToStr(lsYTypeData));
		_log.showDebug("---------xType_data=\n\r" + DealUtil.listToStr(lsXTypeData));
		
		
		//处理各区域中的表达式字段数据
		lsRet = calcTotalData(_reportId, lsRet, lsXTypeData); 
		
		//处理横向分类的合计区域数据 
		if (DealUtil.hasCrossSum(_reportId)) {
			lsRet = addCrossSum(_reportId, lsRet, lsYTypeData);
			//添加横向合计标题
			Map<String,String> mpTitle = FactoryUtil.newMap();
			String field = DealUtil.getTypeField(_reportId, "cross");
			mpTitle.put(field, DealUtil.SUM_FLAG);
			lsXTypeData.add(mpTitle);
		}

		//处理纵向各区域中的合计字段数据
		if (lsXTypeData.isEmpty()) {
			lsRet = calcSumItem(_reportId, lsRet);
		} else {
			lsRet = calcSumBottom(_reportId, lsRet, lsXTypeData);
		}
		_log.showDebug("---------total_data=\n\r" + DealUtil.listToStr(lsRet));
		
		return lsRet;
	}

}
