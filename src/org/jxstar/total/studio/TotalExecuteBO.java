package org.jxstar.total.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.report.ReportException;
import org.jxstar.service.BusinessObject;
import org.jxstar.total.ReportTotal;
import org.jxstar.total.ReprotTotalImp;
import org.jxstar.total.util.TotalDao;
import org.jxstar.total.util.TotalUtil;
import org.jxstar.total2.DealUtil;
import org.jxstar.total2.ReprotTotal2Imp;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 执行统计，并输出数据：
 * 1、创建报表统计对象；
 * 2、执行统计输出统计结果；
 * 3、把统计结果转换为JSON对象，输出到前台；
 *
 * @author TonyTan
 * @version 1.0, 2011-12-1
 */
public class TotalExecuteBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 执行统计，请求参数有被统计的功能ID、统计条件参数
	 * @param request -- 请求对象
	 * @return
	 */
	public String exeTotal(RequestContext request) {
		//被统计的功能ID
		String funId = request.getRequestValue("rpt_funid");
		//取报表ID
		Map<String,String> mpReport = TotalDao.queryReport(funId);
		if (mpReport.isEmpty()) {
			setMessage("没有找到报表定义信息！");
			return _returnFaild;
		}
		//取报表定义ID
		String reportId = mpReport.get("report_id");
		//报表类型
		String reportType = mpReport.get("report_type");
		
		//取前台请求参数
		Map<String,Object> mpRequest = request.getRequestMap();
		mpRequest.put("report_id", reportId);
		
		//取统计数据
		List<Map<String, String>> lsRet = FactoryUtil.newList();
		ReportTotal total = null;
		if (reportType.equals("total2")) {
			total = new ReprotTotal2Imp();
		} else {
			total = new ReprotTotalImp();
		}
		try {
			total.initTotal(mpRequest);
			lsRet = total.outputTotal();
		} catch (ReportException e) {
			_log.showError(e);
			setMessage(e.getMessage());
			return _returnFaild;
		}
		
		//把统计数据中没有的动态分类列都删除掉，返回json对象[field1, field2...]
		String delcols = "";
		if (!lsRet.isEmpty()) {
			delcols = DealUtil.retRemoveColumn(reportId, lsRet.get(0));
			if (delcols.length() > 0) {
				delcols = ",delcols:" + delcols;
			}
		}
		
		//转换统计数据为JSON
		String data = TotalUtil.listToJson(lsRet);
		String json = "{total:"+lsRet.size()+",root:"+ data + delcols +"}";
		//_log.showDebug("...................total json=" + json);
		setReturnData(json);
		
		return _returnSuccess;
	}
}
