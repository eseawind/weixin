/*
 * FileAction.java 2010-11-16
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.control.action;

import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.service.control.ServiceController;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.factory.SystemFactory;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.util.resource.JsParam;

/**
 * 从后台读取文件返回到前台的控制器。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-16
 */
public class FileAction extends Action {
	
	public void execute(HttpServletRequest request,
			HttpServletResponse response) {
		ResponseContext responseContext = null;
		try {//捕获所有异常，提高服务的稳定性
			responseContext = processAction(request, response);
		} catch (Exception e) {
			_log.showError(e);
			return;
		}
		
		if (responseContext != null) {
			String reponseText = responseContext.reponseText();
			response.setContentType("text/html");
			
			//反馈响应信息
			try {
				response.getWriter().write(reponseText);
			} catch (Exception e) {
				_log.showError(e);
			}
		}
	}
	
	@SuppressWarnings("unchecked")
	private ResponseContext processAction(HttpServletRequest request,
			HttpServletResponse response) {
		//创建返回对象
		ResponseContext responseContext = new ResponseContext(false);		
		//创建RequestContext
		RequestContext requestContext;
		try {
			requestContext = ActionHelper.getRequestContext(request);
		} catch (ActionException e) {
			_log.showError(e);
			responseContext.setMessage(e.getMessage());
			return responseContext;
		}
		
		//是否判断用户会话生效的标志
		String nousercheck = requestContext.getRequestValue("nousercheck", "0");
		if (nousercheck.equals("0")) {
			Map<String,String> mpUser = (Map<String,String>) request.getSession().
					getAttribute(JsParam.CURRUSER);
			if (mpUser == null || mpUser.isEmpty()) {
				responseContext.setMessage(JsMessage.getValue("commonaction.nologin"));
				return responseContext;
			} else {
				//判断当前用户是否有效
				String reqUserId = requestContext.getRequestValue("user_id");
				String userId = mpUser.get("user_id");
				if (!reqUserId.equals(userId)) {
					responseContext.setMessage(JsMessage.getValue("commonaction.nouser"));
					return responseContext;
				}
				
				//把当前用户信息存到上下文中
				requestContext.setUserInfo(mpUser);
			}
		} else {
			Map<String,String> mpUser = FactoryUtil.newMap();
			requestContext.setUserInfo(mpUser);
		}
		
		//当前功能ID
		String sFunID = requestContext.getFunID();
		//当前事件代码
		String sEventCode = requestContext.getEventCode();
		_log.showDebug("query action funid = " + sFunID + " eventcode = " + sEventCode);
		if (sFunID == null || sFunID.length() == 0) {
			responseContext.setMessage(JsMessage.getValue("commonaction.funidnull"));
			return responseContext;
		}
		if (sEventCode == null || sEventCode.length() == 0) {
			responseContext.setMessage(JsMessage.getValue("commonaction.eventcodenull"));
			return responseContext;
		}
		
		//创建服务控制器对象
		ServiceController serviceController = (ServiceController) SystemFactory
										.createSystemObject("ServiceController");
		if (serviceController == null) {
			responseContext.setMessage(JsMessage.getValue("commonaction.createenginefaild"));
			return responseContext;
		}
		
		//执行失败时，把内部的消息抛给前台
		if (!serviceController.execute(requestContext)) {
			String message = requestContext.getMessage();
			if (message == null || message.length() == 0) {
				message = JsMessage.getValue("commonaction.faild");
			}
			responseContext.setMessage(message);
			return responseContext;
		}
		
		//数据格式字节，说明是需要返回文件
		String dataType = request.getParameter("dataType");
		if (dataType != null && (dataType.equals("byte") || dataType.equals("xls"))) {
			String type = requestContext.getRequestValue("ContentType");
			String fileName = requestContext.getRequestValue("Attachment");
			
			if (type != null && type.length() > 0) {
				response.setHeader("Content-Type", type);
			}
			if (fileName != null && fileName.length() > 0) {
				//对附件文件名编码
				String userAgent = request.getHeader("User-Agent");
				fileName = ActionHelper.getAttachName(userAgent, fileName);
				response.setHeader("Content-Disposition", "attachment;filename=" + fileName);
			}
			
			try {
				ServletOutputStream out = response.getOutputStream();
				
				//如果是xls文件操作，则从xlsfile中取返回的xls文件对象
				if (dataType.equals("xls")) {
					HSSFWorkbook wb = (HSSFWorkbook) requestContext.getReturnObject();
					wb.write(out);
				} else {
					byte[] rets = requestContext.getReturnBytes();
					if (rets == null || rets.length == 0) {
						responseContext.setMessage(JsMessage.getValue("commonaction.bytesnull"));
						return responseContext;
					}
					out.write(requestContext.getReturnBytes());
				}
				
				out.flush();
				out.close();
				_log.showDebug("---------file output end!");
			} catch (Exception e) {
				_log.showError(e);
			}
			return null;
		} else {
			//把请求对象中的响应结果反馈到响应对象中
			ActionHelper.contextToResponse(requestContext, responseContext);
			responseContext.setSuccessed(true);
			return responseContext;	
		}
	}
}
