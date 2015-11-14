/*
 * Copyright(c) 2013 Donghong Inc.
 */
package org.jxstar.wf.client;

import java.util.List;
import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.util.ConditionUtil;
import org.jxstar.service.util.TaskUtil;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.key.KeyCreator;
import org.jxstar.wf.define.WfDefineDao;
import org.jxstar.wf.util.ProcessUtil;

/**
 * 查找审批单定义信息。
 *
 * @author TonyTan
 * @version 1.0, 2013-3-12
 */
public class CheckSheetBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 标记审批过程实例采用的审批单ID；
	 * process_1过程实例启动事件调用；
	 * @param request -- 过程实例请求对象
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public String markReport(RequestContext request) {
		String processId = request.getRequestValue("process_id");
		String instanceId = request.getRequestValue("instance_id");
		Map<String, String> appData = (Map<String, String>) request.getRequestObject("app_data");
		//找到审批单版本定义，后就填写标记数据
		String reportId = getReportIdBySheet(processId, appData);
		if (reportId.length() > 0) {
			boolean ret = writeSheetMark(instanceId, reportId);
			if (!ret) return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 查看审批单时找审批单的规则：
	 * 1、在审批单标记表中取“发起审批流程”时标记的审批单报表ID；
	 * 2、如果没有找到审批单标记记录，则从审批单版本设置中取版本日期小于“发起审批流程”时间的版本设置；
                           如果没有就取最新版本的审批单设置；
	 * 3、如果没有找到审批单版本记录，则根据功能ID到报表定义表找当前功能的序号最小的审批表单定义；
	 * 
	 * ReportInfoBO.queryCheckReport -- 原来用这个方法找审批表单
	 * @param funId -- 功能ID
	 * @param dataId -- 数据ID
	 * @return
	 */
	public String checkReport(String funId, String dataId) {
		_log.showDebug(".........find report id, funId={0}, dataId={1}.", funId, dataId);
		
		//1、在审批单标记表中取“发起审批流程”时标记的审批单报表ID；
		String reportId = getReportIdByMark(funId, dataId);
		_log.showDebug(".........find mark reportid={0}.", reportId);
		
		//2、如果没有找到审批单标记记录，则从审批单版本设置中取版本日期小于“发起审批流程”时间的版本设置；
		//   如果没有就取最新版本的审批单设置；
		if (reportId.length() == 0) {
			reportId = getReportIdBySheet(funId, dataId, false);
			if (reportId.length() == 0) {
				reportId = getReportIdBySheet(funId, dataId, true);
			}
			_log.showDebug(".........find sheet reportid={0}.", reportId);
		}
		
		//3、如果没有找到报表ID，则直接根据功能ID找报表ID
		if (reportId.length() == 0) {
			reportId = queryReportId(funId);
			_log.showDebug(".........find define reportid={0}.", reportId);
		}
		
		//返回报表ID到前台
		if (reportId.length() > 0) {
			setReturnData("[{report_id:'"+reportId+"'}]");
		}
		
		return _returnSuccess;
	}

	/**
	 * 先根据过程定义找到有效的审批单；
	 * 如果没有找到，则再根据功能ID到报表定义表中审批单；
	 * @param processId -- 过程定义ID
	 * @param appData -- 当前过程实例的应用数据
	 * @return
	 */
	private String getReportIdBySheet(String processId, Map<String, String> appData) {
		String sql = "select report_id, where_sql from wf_sheet where state = '1' " +
				"and process_id = ? order by version_code desc";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		
		List<Map<String,String>> lsData = _dao.query(param);
		if (lsData.isEmpty()) return ""; 
		
		//解析过滤条件，找出过滤条件为真的审批单，支持定义各分厂的审批单
		for (Map<String,String> mpData : lsData) {
			String whereSql = mpData.get("where_sql");
			String reportId = mpData.get("report_id");
			
			if (whereSql.length() == 0) return reportId;
			
			whereSql = TaskUtil.parseAppField(whereSql, appData, true);
			_log.showDebug("----------检查符合条件的审批单=" + whereSql);
			
			if (ConditionUtil.validCondition(whereSql)) return reportId;
		}
		
		return "";
	}
	
	/**
	 * 根据功能ID找审批单
	 * @param funId -- 功能ID
	 * @return
	 */
	private String queryReportId(String funId) {
		String sql = "select report_id, report_name from rpt_list where (fun_id like ? or fun_id = ?) "
			   	   + " and report_type = 'form' order by report_index ";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue("%," + funId + ",%");
		param.addStringValue(funId);
		
		Map<String, String> mpData = _dao.queryMap(param);
		return MapUtil.getValue(mpData, "report_id");
	}
	
	/**
	 * 记录当前过程实例采用的报表ID
	 * @param instanceId -- 实例ID
	 * @param reportId -- 报表ID
	 * @return
	 */
	private boolean writeSheetMark(String instanceId, String reportId) {
		String sql = "insert into wf_sheet_mark(mark_id, instance_id, fun_id, data_id, report_id, mark_date) "
			+ "select ?, instance_id, fun_id, data_id, ?, ? from wf_instance where instance_id = ?";
		
		String markId = KeyCreator.getInstance().createKey("wf_sheet_mark");
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(markId);
		param.addStringValue(reportId);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(instanceId);
		
		return _dao.update(param);
	}
	
	//从标记数据表中取报表ID
	private String getReportIdByMark(String funId, String dataId) {
		String sql = "select instance_id, report_id from wf_sheet_mark " +
				"where fun_id = ? and data_id = ? order by mark_date desc";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(dataId);
		
		Map<String, String> mpData = _dao.queryMap(param);
		return MapUtil.getValue(mpData, "report_id");
	}
	
	//取审批发起时间最近的版本设置
	private String getReportIdBySheet(String funId, String dataId, boolean isAll) {
		Map<String,String> mpDefine = WfDefineDao.getInstance().queryProcessByFunId(funId);
		String processId = mpDefine.get("process_id");
		String markDate = queryMarkDate(funId, dataId);
		Map<String,String> appData = null;
		
		String sql = "select report_id, where_sql from wf_sheet where state in ('1', '7') " +
			"and process_id = ? ";
		if (!isAll) {
			sql += " and version_date < ? ";
		}
		sql += " order by version_code desc";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		if (!isAll) {
			param.addDateValue(markDate);
		}
		
		List<Map<String,String>> lsData = _dao.query(param);
		if (lsData.isEmpty()) return ""; 
		
		//解析过滤条件，找出过滤条件为真的审批单，支持定义各分厂的审批单
		for (Map<String,String> mpData : lsData) {
			String whereSql = mpData.get("where_sql");
			String reportId = mpData.get("report_id");
			
			if (whereSql.length() > 0) {
				if (appData == null) {
					appData = ProcessUtil.queryFunData(funId, dataId);
				}
				
				whereSql = TaskUtil.parseAppField(whereSql, appData, true);
				if (ConditionUtil.validCondition(whereSql)) return reportId;
			} else {
				return reportId;
			}
		}
		
		return "";
	}
	
	//取流程发起时间
	private String queryMarkDate(String funId, String dataId) {
		String sql = "select start_date from wf_instancehis where fun_id = ? and data_id = ? order by start_date desc";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(dataId);
		
		Map<String, String> mpData = _dao.queryMap(param);
		return MapUtil.getValue(mpData, "start_date");
	}
}
