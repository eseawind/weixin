/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.wf.limit;

import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.wf.client.ProcessClientBO;

/**
 * 限时任务到时默认审批通过。处理方法：
 * 1、根据任务分配信息构建请求上下文对象；
 * 2、调用ProcessClientBO.executeProcess方法，模拟前台同意按钮。
 *
 * @author TonyTan
 * @version 1.0, 2012-4-11
 */
public class LimitTaskAgree {
	
	/**
	 * 默认审批通过
	 * @param mpAssign -- 任务分配信息
	 * @return
	 */
	public static boolean limitAgree(Map<String,String> mpAssign) {
		if (mpAssign == null || mpAssign.isEmpty()) return true;
		
		RequestContext request = assignToRequest(mpAssign);
		ProcessClientBO process = new ProcessClientBO();
		String ret = process.executeProcess(request);
		
		return ret.equals("true");
	}
	
	
	/**
	 * 根据任务分配信息构建请求上下文对象
	 * @param mpAssign -- 任务分配信息
	 * @return
	 */
	public static RequestContext assignToRequest(Map<String,String> mpAssign) {
		Map<String,Object> mpRequest = FactoryUtil.newMap();
		Map<String,String> userInfo = FactoryUtil.newMap();
		RequestContext request = new RequestContext(mpRequest);
		
		//设置当前用户信息
		userInfo.put("user_id", mpAssign.get("assign_userid"));
		userInfo.put("user_name", mpAssign.get("assign_user"));
		request.setUserInfo(userInfo);
		
		//设置请求信息
		mpRequest.put("check_funid", mpAssign.get("fun_id"));
		mpRequest.put("taskid", mpAssign.get("task_id"));
		mpRequest.put("keyid", mpAssign.get("data_id"));
		mpRequest.put("check_type", "Y");
		mpRequest.put("check_desc", "系统自动审批通过。");
		
		return request;
	}
}
