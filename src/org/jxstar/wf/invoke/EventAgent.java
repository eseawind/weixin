/*
 * EventAgent.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.invoke;

import java.util.Map;


import org.jxstar.control.action.RequestContext;
import org.jxstar.service.control.ServiceController;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.factory.SystemFactory;
import org.jxstar.util.log.Log;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.engine.ProcessContext;
import org.jxstar.wf.engine.ProcessInstance;
import org.jxstar.wf.engine.TaskInstance;

/**
 * 事件触发代理类，负责工作流事件执行的代理类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class EventAgent {
	private Log _log = Log.getInstance();
	private static EventAgent instance = new EventAgent();

	private EventAgent(){}
	/**
	 * 构建单例对象。
	 * @return
	 */
	public static EventAgent getInstance() {
		return instance;
	}
	
	/**
	 * 把过程运行上下文转换为服务层的请求对象；创建服务请求控制器执行事件请求。
	 * @param eventCode -- 事件代码
	 * @param processContext -- 过程上下文对象
	 * @throws WfException
	 */
	public void fireEvent(String eventCode, ProcessContext processContext) throws WfException {
		if (processContext == null || eventCode == null || eventCode.length() == 0) {
			//"过程上下文与事件代码参数不正确！"
			throw new WfException(JsMessage.getValue("eventagent.codeerror"));
		}
		
		//过滤部分事件不处理
		String retCode = filtEventCode(eventCode);
		if (retCode.length() == 0) {//"工作流【{0}】事件被过滤，暂不执行该事件！"
			_log.showDebug(JsMessage.getValue("eventagent.dontevent"), eventCode);
			return;
		}

		//过程上下文转换为服务上下文
		RequestContext requestContext = toRequestContext(retCode, processContext);
		
		//创建服务控制器对象
		ServiceController serviceController = (ServiceController) SystemFactory
										.createSystemObject("ServiceController");
		if (serviceController == null) {
			throw new WfException(JsMessage.getValue("commonaction.createenginefaild"));
		}
		
		//执行失败时，把内部的消息抛给前台
		if (!serviceController.execute(requestContext)) {
			String message = requestContext.getMessage();
			if (message == null || message.length() == 0) {
				message = JsMessage.getValue("commonaction.faild");
			}//"工作流【{0}】事件执行结果："
			_log.showDebug(JsMessage.getValue("eventagent.doend") + message, eventCode);
		} else {//"工作流【{0}】事件执行成功！"
			_log.showDebug(JsMessage.getValue("eventagent.dook"), eventCode);
		}
	}
	
	/**
	 * 把过程运行上下文转换为服务层的请求对象。
	 * @param eventCode -- 事件代码
	 * @param processContext -- 过程上下文对象
	 * @return
	 */
	public RequestContext toRequestContext(String eventCode, ProcessContext processContext) {
		Map<String,Object> mpRequest = FactoryUtil.newMap();
		
		//请求参数对象
		RequestContext requestContext = new RequestContext(mpRequest);
		
		//过程实例
		ProcessInstance instance = processContext.getProcessInstance();
		
		//取页面类型
		String pageType = "chkgrid";
		//设置头信息
		requestContext.setFunID("sysevent");//设置功能ID为sysevent，用于检索流程定义事件
		requestContext.setPageType(pageType);
		requestContext.setEventCode(eventCode);
		
		mpRequest.put("funid", "sysevent");
		mpRequest.put("pagetype", pageType);
		mpRequest.put("eventcode", eventCode);
		mpRequest.put("keyid", instance.getDataId());//方便某些方法需要主键数组的值
		
		//工作流调用事件不处理事务，由ProcessRunner、TaskRunner处理事务
		mpRequest.put("support_tran", "0");
		
		//任务实例
		TaskInstance task = processContext.getTaskInstance();
		//如果为空，则不给任务信息
		if (task != null) {
			mpRequest.put("task_id", task.getTaskId());
			mpRequest.put("node_id", task.getNodeId());
			mpRequest.put("task_desc", task.getTaskDesc());
			mpRequest.put("check_type", task.getCheckType());
			mpRequest.put("check_desc", task.getCheckDesc());
			mpRequest.put("next_userid", task.getNextUserId());
			mpRequest.put("next_user", task.getNextUser());
		}
		
		//过程实例信息
		mpRequest.put("check_funid", instance.getFunId());
		mpRequest.put("data_id", instance.getDataId());
		mpRequest.put("process_id", instance.getProcessId());
		mpRequest.put("process_name", instance.getProcessName());
		mpRequest.put("app_data", instance.getAppData());//add by mark report
		mpRequest.put("instance_id", instance.getInstanceId());//add by mark report
		mpRequest.put("instance_desc", instance.getInstanceDesc());
		mpRequest.put("instance_state", instance.getRunState());
		
		//设置用户信息
		Map<String,String> mpUser = FactoryUtil.newMap();
		if (task != null) {
			mpUser.put("user_id", task.getCheckUserId());
			mpUser.put("user_name", task.getCheckUserName());
		} else {
			mpUser.put("user_id", instance.getStartUserId());
			mpUser.put("user_name", instance.getStartUserName());
		}
		requestContext.setUserInfo(mpUser);

		return requestContext;
	}
	
	/**
	 * 考虑性能问题，暂时过滤部分事件。
	 * @param eventCode -- 事件代码
	 * @return
	 */
	private String filtEventCode(String eventCode) {
		if (eventCode.equals(EventCode.PROCESS_RUNNING) || 
			eventCode.equals(EventCode.PROCESS_COMPLETED) || 
			eventCode.equals(EventCode.PROCESS_TERMINATED) ||
			eventCode.equals(EventCode.TASK_CREATED) || 
			eventCode.equals(EventCode.TASK_COMPLETED)) {
			return eventCode;
		}
		
		return "";
	}
}
