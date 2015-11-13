/*
 * ReportInfoBO.java 2010-11-18
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BoException;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.define.FunDefineDao;
import org.jxstar.service.define.FunctionDefine;
import org.jxstar.service.define.FunctionDefineManger;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringUtil;
import org.jxstar.util.key.CodeCreator;
import org.jxstar.util.key.KeyCreator;
import org.jxstar.util.resource.JsMessage;

/**
 * 报表定义信息生成BO。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-18
 */
public class ReportInfoBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	//主键生成器
	private KeyCreator _key = KeyCreator.getInstance();
	//编码生成器
	private CodeCreator _code = CodeCreator.getInstance();
	//功能定义对象
	private FunctionDefine _funMain = null;
	private FunctionDefineManger _funManger = FunctionDefineManger.getInstance();
	
	/**
	 * 查询报表定义信息
	 * @param funId -- 当前功能ID
	 * @return
	 */
	public String queryReport(String funId) {
		return queryCheckReport(funId, "", "");
	}
	
	/**
	 * 查询指定报表类型的报表定义
	 * @param funId -- 当前功能ID
	 * @param reportType -- 报表类型:form,grid,formgrid,label
	 * @return
	 */
	public String queryCheckReport(String funId, String reportType, String whereSql) {
		String sql = "select report_id, report_name from rpt_list where " +
				"(status = '0' or status is null) and (fun_id like ? or fun_id = ?) ";
		if (reportType != null && reportType.length() > 0) {
			sql += " and report_type = '"+ reportType +"' ";
		}
		if (whereSql != null && whereSql.length() > 0) {
			sql += " and " + whereSql;
		}
		sql += " order by report_index";
		_log.showDebug("查询指定报表定义SQL=" + sql);
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue("%," + funId + ",%");
		param.addStringValue(funId);
		
		List<Map<String, String>> lsRept = _dao.query(param);
		if (lsRept.isEmpty()) {
			_log.showDebug("报表定义信息为空...");
			setReturnData("[]");
			return _returnSuccess;
		}
		
		StringBuilder sbJson = new StringBuilder();
		for (int i = 0, n = lsRept.size(); i < n; i++) {
			Map<String, String> mpRept = lsRept.get(i);
			
			String report_id = mpRept.get("report_id");
			String report_name = mpRept.get("report_name");
			
			String item = "{'report_id':'"+ report_id +"', 'report_name':'"+ report_name +"'},";
			sbJson.append(item);
		}
		String json = sbJson.substring(0, sbJson.length()-1);
		json = "[" + json + "]";
		_log.showDebug("报表定义信息：" + json);
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 根据功能定义信息自动生成报表定义信息。
	 * 
	 * @param funId -- 功能ID
	 * @param reportType -- 报表类型[grid|form|formgrid]
	 * @return
	 */
	public String createReport(String funId, String reportType, String userId) {
		_funMain = _funManger.getDefine(funId);
		
		try {
			if (checkReptList(funId, reportType)) {
				//"该功能的【{0}】类型报表已经定义，需要先删除再生成！"
				setMessage(JsMessage.getValue("reportinfobo.hasdefine"), reportType);
				return _returnFaild;
			}
			
			//生成一条报表定义信息
			String reportId = createReptList(funId, reportType, userId);
			
			//生成报表的数据区域信息
			createReptArea(reportId, funId, reportType, userId);
		} catch (BoException e) {
			e.printStackTrace();
			
			setMessage(e.getMessage());
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 检查是否这种类型报表定义。
	 * 
	 * @param funId -- 功能ID
	 * @param reportType -- 报表类型
	 * @return
	 */
	private boolean checkReptList(String funId, String reportType) {
		String sql = "select count(*) as cnt from rpt_list where fun_id = ? and report_type = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(reportType);
		
		Map<String, String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
	
	/**
	 * 创建报表区域定义信息，如果有子功能，则需要创建子区域
	 * @param reportId -- 报表ID
	 * @param funId -- 功能ID
	 * @param reportType -- 报表类型
	 * @param userId -- 用户ID
	 * @return
	 * @throws BoException
	 */
	private boolean createReptArea(String reportId, String funId, String 
							reportType, String userId) throws BoException {
		String areaId = "";
		
		//先创建主区域
		if (reportType.equals("grid")) {
			areaId = createArea(reportId, _funMain, "1", "grid", userId);
		} else if (reportType.equals("form")) {
			areaId = createArea(reportId, _funMain, "1", "form", userId);
		} else if (reportType.equals("formgrid")) {
			areaId = createArea(reportId, _funMain, "1", "form", userId);
		}
		//创建主区域的字段明细
		createDetail(areaId, funId, userId);
		
		//只有主从报表才需要创建子区域
		if (!reportType.equals("formgrid")) return true;
		
		//取子功能定义，创建子区域
		String subid = _funMain.getElement("subfun_id");
		if (subid != null && subid.length() > 0) {
			subid = subid.trim();
			String[] subids = subid.split(",");
			
			for (int i = 0, n = subids.length; i < n; i++) {
				String sid = subids[i].trim();
				if (sid.length() == 0) continue;
				
				FunctionDefine fo = _funManger.getDefine(sid);
				//创建子区域
				String said = createArea(reportId, fo, "0", "grid", userId);
				//创建子区域字段
				createDetail(said, sid, userId);
			}
		}
		
		return true;
	}
	
	/**
	 * 新增报表字段明细
	 * @param areaId -- 区域ID
	 * @param funId -- 功能ID
	 * @param userId -- 用户ID
	 * @return
	 */
	private boolean createDetail(String areaId, String funId, String userId) throws BoException {
		//取字段列表
		List<Map<String, String>> lscol = FunDefineDao.queryCol(funId);
		
		//新增SQL语句
		StringBuilder sbInsert = new StringBuilder();
		sbInsert.append("insert into rpt_detail (");
		sbInsert.append("det_id, area_id, col_code, display, col_index,");
		sbInsert.append("format, combo_code, is_stat, is_show, is_outzero, add_userid, add_date)");
		sbInsert.append("values(?, ?, ?, ?, ?, ");
		sbInsert.append("?, ?, 0, 1, 1, ?, ?)");
		
		for (int i = 0, n = lscol.size(); i < n; i++) {
			Map<String, String> mpcol = lscol.get(i);
			
			String det_id = _key.createKey("rpt_detail");
			String col_code = StringUtil.getNoTableCol(mpcol.get("col_code"));			
			String display = mpcol.get("col_name");
			String col_index = mpcol.get("col_index");
			//序号为10000的字段不需要输出
			if (Integer.parseInt(col_index) >= 10000) continue;
			
			String format = mpcol.get("format_id");
			
			String combo_code = "";
			String col_control = mpcol.get("col_control");
			if (col_control.equals("combo")) {
				combo_code = mpcol.get("control_name");
			}
			String add_date = DateUtil.getTodaySec();
			
			//参数赋值
			DaoParam param = _dao.createParam(sbInsert.toString());
			param.addStringValue(det_id);
			param.addStringValue(areaId);
			param.addStringValue(col_code);
			param.addStringValue(display);
			param.addIntValue(col_index);
			param.addStringValue(format);
			param.addStringValue(combo_code);
			param.addStringValue(userId);
			param.addDateValue(add_date);
			
			if (!_dao.update(param)) {//"创建报表明细记录失败！"
				throw new BoException(JsMessage.getValue("reportinfobo.error01"));
			}
		}
		
		return true;
	}
	
	/**
	 * 新增一个报表区域
	 * @param reportId -- 报表ID
	 * @param funObject -- 功能定义对象
	 * @param isMain -- 是否主区域
	 * @param areaType -- 区域类型
	 * @param userId -- 用户ID
	 * @return
	 */
	private String createArea(String reportId, FunctionDefine funObject, 
					String isMain, String areaType, String userId) throws BoException {
		//新增SQL语句
		StringBuilder sbInsert = new StringBuilder();
		sbInsert.append("insert into rpt_area (");
		sbInsert.append("area_id, report_id, area_index, area_name, page_size, area_pos, area_type, ");
		sbInsert.append("ds_name, main_table, pk_col, is_main, data_sql, data_where, data_group, data_order, ");
		sbInsert.append("is_stat, sub_fkcol, add_userid, add_date)");
		sbInsert.append("values(?, ?, 1, ?, ?, ?, ?, ");
		sbInsert.append("?, ?, ?, ?, ?, ?, ?, ?, ");
		sbInsert.append("0, ?, ?, ?)");
		
		//构建新增的参数
		String area_id = _key.createKey("rpt_area");
		String area_name = funObject.getElement("fun_name");
		String page_size = areaType.equals("grid") ? "20" : "1";
		String area_pos = "";
		String ds_name = funObject.getElement("ds_name");
		String main_table = funObject.getElement("table_name");
		String pk_col = funObject.getElement("pk_col");
		String data_sql = funObject.getSelectSQL();
		String data_where = funObject.getWhereSQL();
		String data_group = funObject.getElement("group_sql").trim();
		String data_order = funObject.getElement("order_sql").trim();
		String sub_fkcol = funObject.getElement("fk_col");
		String add_date = DateUtil.getTodaySec();
		
		DaoParam param = _dao.createParam(sbInsert.toString());
		param.addStringValue(area_id);
		param.addStringValue(reportId);
		param.addStringValue(area_name);
		param.addIntValue(page_size);
		param.addStringValue(area_pos);
		param.addStringValue(areaType);
		
		param.addStringValue(ds_name);
		param.addStringValue(main_table);
		param.addStringValue(pk_col);
		param.addStringValue(isMain);
		param.addStringValue(data_sql);
		param.addStringValue(data_where);
		param.addStringValue(data_group);
		param.addStringValue(data_order);
		param.addStringValue(sub_fkcol);
		param.addStringValue(userId);
		param.addDateValue(add_date);
		
		if (!_dao.update(param)) {//"创建报表区域记录失败！"
			throw new BoException(JsMessage.getValue("reportinfobo.error02"));
		}
		
		return area_id;
	}
	
	/**
	 * 创建一条报表定义记录
	 * 
	 * @param funId -- 功能ID
	 * @param reportType -- 报表类型
	 * @param userId -- 用户ID
	 * @return
	 */
	private String createReptList(String funId, String reportType, String userId) throws BoException {	
		//报表名称后缀
		String postfix = "表单";
		if (reportType.equals("grid")) postfix = "表格";
		
		//新增SQL语句
		StringBuilder sbInsert = new StringBuilder();
		sbInsert.append("insert into rpt_list(");
		sbInsert.append("report_id, report_index, report_name, report_file, fun_id, module_id, report_type, ");
		sbInsert.append("print_type, is_default, add_userid, add_date");
		sbInsert.append(") values(?, ?, ?, ?, ?, ?, ?, 'excel,', '0', ?, ?)");
		
		//构建新增的参数值
		String reportId = _key.createKey("rpt_list");
		String reportIndex = _code.createTableCode("rpt_list", "", "", "");
		String reportName = _funMain.getElement("fun_name") + postfix;
		String reportFile = createFileName(reportType, _funMain);
		String moduleId = _funMain.getElement("module_id");
		String add_date = DateUtil.getTodaySec();
		
		DaoParam param = _dao.createParam(sbInsert.toString());
		param.addStringValue(reportId);
		param.addIntValue(reportIndex);
		param.addStringValue(reportName);
		param.addStringValue(reportFile);
		param.addStringValue(funId);
		param.addStringValue(moduleId);
		param.addStringValue(reportType);
		param.addStringValue(userId);
		param.addDateValue(add_date);
		
		if (!_dao.update(param)) {//"创建报表定义记录失败！"
			throw new BoException(JsMessage.getValue("reportinfobo.error03"));
		}
		
		return reportId;
	}
	
	/**
	 * 取报表模板文件的缺省值
	 * 
	 * @param reportType -- 报表类型
	 * @param funObject -- 功能定义对象
	 * @return
	 */
	private String createFileName(String reportType, FunctionDefine funObject) {
		String fileName = "";
		//先取功能定义页面文件
		if (reportType.equals("grid")) {
			fileName = funObject.getElement("grid_page");
		} else {
			fileName = funObject.getElement("form_page");
		}
		
		String funId = funObject.getFunID();
		if (fileName.length() == 0) {
			String fix = reportType.equals("grid") ? "grid" : "form";
			fileName = "/" + funId + "/" + fix + "_" + funId + ".xls";
		} else {
			int si = fileName.indexOf('/', 2);
			int ei = fileName.indexOf('.');
			if (si > 0 && ei > 0) {
				fileName = fileName.substring(si, ei) + ".xls";
			}
		}
		
		return fileName;
	}
}
