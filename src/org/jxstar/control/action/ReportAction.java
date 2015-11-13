/*
 * ReportAction.java 2010-11-11
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.control.action;

import java.util.List;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.report.Report;
import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportDao;
import org.jxstar.report.util.ReportFactory;
import org.jxstar.service.util.SysHideField;
import org.jxstar.service.util.SysLogUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.util.resource.JsParam;

/**
 * 输出报表的控制器：负责组织前台参数，调用报表处理类，输出报表。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-11
 */
public class ReportAction extends Action {
	
	/**
	 * 报表数据输出没有启用平台事务管理。
	 */
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		//判断前台参数是否有效，并初始化参数
		ReportContext context = initAction(request);
		if (!context.isSucceed()) {
			responseWrite(response, context.getMessage());
			return;
		}
		Map<String, Object> initParam = context.getInitParam();
		if (initParam == null || initParam.isEmpty()) {
			responseWrite(response, "报表初始化参数为空！");
			return;
		}
		
		//记录操作日志
		writeLog(initParam);
		
		//报表输出类型
		String printType = (String) initParam.get("printType");
		
		//捕获所有异常，提高服务的稳定性
		try {
			//输出excel报表
			if (printType.equals("xls")) {
				HSSFWorkbook xlswb = (HSSFWorkbook) outputXls(context);
				if (xlswb == null) {
					responseWrite(response, context.getMessage());
					return;
				}
				
				String reportName = (String) initParam.get("reportName");
				responseXls(xlswb, reportName, request, response);
			} else if (printType.equals("html")) {
			//输出html报表
				outputHtml(initParam, request, response);
			} else {
			//当前报表类型不支持
				_log.showWarn("print type ["+ printType +"] is not valid!!");
			}
		} catch (Exception e) {
			_log.showError(e);
			return;
		}
	}
	
	@SuppressWarnings("unchecked")
	private void writeLog(Map<String, Object> param) {
		String funId = MapUtil.getValue(param, "funid");
		String eventCode = "print";
		String pageType = "";
		Map<String,String> mpUser = (Map<String,String>) param.get("user");
		String userId = MapUtil.getValue(mpUser, "user_id");
		String userName = MapUtil.getValue(mpUser, "user_name");
		String reportName = MapUtil.getValue(param, "reportName");
		String printType = MapUtil.getValue(param, "reportName");
		String message = "报表类型：" + printType + "；报表名称：" + reportName;
		
		SysLogUtil.writeLog(funId, eventCode, pageType, userId, userName, message, "");
	}

	/**
	 * 输出excel类型报表
	 * @param mpParam
	 * @return
	 * @throws ReportException
	 */
	@SuppressWarnings("unchecked")
	private Object outputXls(ReportContext context) {
		Map<String, Object> mpParam = context.getInitParam();
		
		Object ret = null;
		//取报表定义对象
		Map<String,String> mpReport = (Map<String,String>) mpParam.get("report");
		//报表类型
		String reportType = mpReport.get("report_type");
		//报表自定义处理类
		String className = mpReport.get("custom_class");
		
		if (className.length() == 0) {
		    className = ReportFactory.getReportXls(reportType);
		}
		
		//创建报表处理实例
		Report report = ReportFactory.newInstance(className);
		
		//初始化报表对象
		try {
			report.initReport(mpParam);
			
			//构建报表输出对象
			ret = report.output();
		} catch (Exception e) {
			_log.showError(e);
			context.setMessage(e.getMessage(), false);
			return null;
		}
		
		return ret;
	}
	
	/**
	 * 输出html类型的报表
	 * @param mpParam -- 所有前台参数
	 */
	@SuppressWarnings("unchecked")
	private void outputHtml(Map<String, Object> mpParam, 
	        HttpServletRequest request, HttpServletResponse response) {
		//取报表定义对象
		Map<String,String> mpReport = (Map<String,String>) mpParam.get("report");
		
		//取报表模板文件名
		String modelFile = mpReport.get("report_file");

		modelFile = modelFile.substring(0, modelFile.lastIndexOf(".")) + ".htm";
		String url = request.getContextPath() + "/report/html" + modelFile.replaceAll("\\\\", "/");
		_log.showDebug("output html report file=" + url);
		
		//把报表参数信息返回前台
        HttpSession session = request.getSession();

        //将当前报表打印的信息存放到session
        session.setAttribute("reportParam", mpParam);
        
		//重定向到报表目标文件
        try {
            response.sendRedirect(url);
        } catch (Exception e) {
        	_log.showError(e);
        }
	}
	
	/**
	 * 输出报表文件流。
	 * @param xlswb -- 报表文件对象
	 * @param reportName -- 报表文件名称
	 * @param request -- http请求对象
	 * @param response -- http响应对象
	 * @throws ReportException
	 */
	private void responseXls(HSSFWorkbook xlswb, String reportName, HttpServletRequest request, 
						HttpServletResponse response) {
		//设置响应头信息
		response.setHeader("Content-Type", "application/vnd.ms-excel");
		String userAgent = request.getHeader("User-Agent");
		
		try {
			reportName = ActionHelper.getAttachName(userAgent, reportName+".xls") ;
			response.setHeader("Content-Disposition", "attachment;filename=" + reportName);
			ServletOutputStream out = response.getOutputStream();
	
			xlswb.write(out);
			out.flush();
			out.close();
			_log.showDebug("---------file output end!");
		} catch (Exception e) {
			_log.showError(e);
		}
	}
	
	/**
	 * 初始化报表参数，并判断参数的有效性。
	 * @param request -- http请求对象
	 * @return
	 * @throws ReportException
	 */
	@SuppressWarnings("unchecked")
	private ReportContext initAction(HttpServletRequest request) {
		ReportContext context = new ReportContext(request);
		
	    Map<String, Object> mpRet = FactoryUtil.newMap();
	    //保存所有请求参数，特殊报表中用（暂时用于统计报表模板输出）
	    //如果不转存一下，在html action中会取不到map的值
	    Map<String, Object> mpp = FactoryUtil.newMap();
	    mpp.putAll(request.getParameterMap());
	    mpRet.put("all_params", mpp);
	    
		//判断用户信息-----------------------
		String userid = "";
		Map<String,String> mpUser = (Map<String,String>) request.getSession().
										getAttribute(JsParam.CURRUSER);
		if (mpUser == null || mpUser.isEmpty()) {
			context.setMessage(JsMessage.getValue("commonaction.nologin"), false);
			return context;
		} else {
			//判断当前用户是否有效
			userid = mpUser.get("user_id");
			String reqUserId = getRequestValue(request, "user_id");
			if (!reqUserId.equals(userid)) {
				context.setMessage(JsMessage.getValue("commonaction.nouser"), false);
				return context;
			}
		}
		mpRet.put("user", mpUser);
		
		//取页面参数-----------------------
		String funid = getRequestValue(request, JsParam.FUNID);
		//"初始化出错：功能ID不能为空！"
		if (funid.length() == 0) {
			context.setMessage(JsMessage.getValue("reportaction.error02"), false);
			return context;
		}
		mpRet.put(JsParam.FUNID, funid);
		
		String printType = getRequestValue(request, "printType");
		//"初始化出错：报表输出类型不能为空！"
		if (printType.length() == 0) {
			context.setMessage(JsMessage.getValue("reportaction.error03"), false);
			return context;
		}
		mpRet.put("printType", printType);
		
		//打印方式：0 预览 1 直接打印
		String printMode = getRequestValue(request, "printMode");
		mpRet.put("printMode", printMode);
		
		String reportId = getRequestValue(request, "reportId");
		//"初始化出错：报表定义ID不能为空！"
		if (reportId.length() == 0) {
			//是否打印缺省报表：0 否 1 是
			String isDefault = getRequestValue(request, "isDefault");
			if (isDefault.equals("1")) {
				reportId = ReportDao.getDefReportId(funid);
			}
			if (reportId.length() == 0) {
				context.setMessage(JsMessage.getValue("reportaction.error04"), false);
				return context;
			}
		}
		mpRet.put("reportId", reportId);
		
		String orderSql = getRequestValue(request, "orderSql");
		mpRet.put("orderSql", orderSql);
		
		String whereSql = getRequestValue(request, "whereSql");
		mpRet.put("whereSql", whereSql);
		
		String whereType = getRequestValue(request, "whereType");
		mpRet.put("whereType", whereType);
		
		String whereValue = getRequestValue(request, "whereValue");
		mpRet.put("whereValue", whereValue);
		
		String queryType = getRequestValue(request, "queryType");
		mpRet.put("queryType", queryType);
		//取页面参数 end-----------------------
		
		//取报表定义信息
		Map<String,String> mpReport = ReportDao.getReport(reportId);
		mpRet.put("report", mpReport);
		
		//扩展可以修改打印报表的名称
		String reportName = getRequestValue(request, "reportName");
		if (reportName.length() == 0) {
			mpRet.put("reportName", mpReport.get("report_name"));
		} else {
			mpRet.put("reportName", reportName);
		}
		
		//取报表主区域SQL
		String mainSql = "";
		
		//是否审批表单，如果是，则根据记录ID查询值
		String isCheck = getRequestValue(request, "isCheck");
		try {
			if (isCheck.equals("true")) {
				mainSql = ReportDao.getCheckMainSql(reportId, whereSql);
			} else {
				mainSql = ReportDao.getMainAreaSql(funid, reportId, whereSql, userid, queryType);
			}
		} catch (Exception e) {
			_log.showError(e);
			
			context.setMessage(e.getMessage(), false);
			return context;
		}
		mpRet.put("mainSql", mainSql);
		
		//查询是否有隐藏字段设置
		List<String> hideCols = SysHideField.getHideCols(userid, funid);
		mpRet.put("hideCols", hideCols);
		
		//设置当前程序的实际路径
		String realPath = request.getSession().getServletContext().getRealPath("/");
		if (realPath == null || realPath.equals("null")) {
			//"初始化出错：程序事件路径为空！"
			context.setMessage(JsMessage.getValue("reportaction.error05"), false);
			return context;
		}
		realPath = realPath.replace('\\', '/');
		if (realPath.charAt(realPath.length()-1) == '/') {
			realPath = realPath.substring(0, realPath.length()-1);
		}
		mpRet.put("realPath", realPath);
		
		_log.showDebug("-----------ReportAction initAction param: funid={0} printType={1} " +
				"whereSql={2} whereValue={3} whereType={4} realPath={5} queryType={6}", 
				funid, printType, whereSql, whereValue, whereType, realPath, queryType);
		
		context.setInitParam(mpRet);
		return context;
	}
	
	/**
	 * 取请求对象中的参数。
	 * @param req
	 * @param name
	 * @return
	 */
	private String getRequestValue(ServletRequest request, String name) {
		String val = request.getParameter(name);
		if (val == null) {
			val = (String) request.getAttribute(name);
			if (val == null) val = "";
		}
		
		return val;
	}
	
	/**
	 * 输出消息到前台
	 * @param response
	 * @param msg
	 */
	private void responseWrite(HttpServletResponse response, String msg) {
		try {
			if (msg == null || msg.length() == 0) {
				msg = "输出报表文件出错！";
			}
			response.getWriter().write(msg);
		} catch (Exception e) {
			_log.showError(e);
		}
	}
}
