/*
 * Copyright(c) 2013 Donghong Inc.
 */
package org.jxstar.control.action;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

/**
 * 报表上下文对象，方便处理报表执行错误信息。
 *
 * @author TonyTan
 * @version 1.0, 2013-8-3
 */
public class ReportContext {
	//返回提示信息
	private String _message = "";
	//执行成功与失败
	private boolean _succeed = true;
	//请求对象
	private HttpServletRequest _request = null;
	//初始化参数对象
	private Map<String, Object> _initParam = null;
	
	public ReportContext(HttpServletRequest request) {
		_request = request;
	}
	
	public HttpServletRequest getRequest() {
		return _request;
	}

	public void setRequest(HttpServletRequest _request) {
		this._request = _request;
	}

	public Map<String, Object> getInitParam() {
		return _initParam;
	}

	public void setInitParam(Map<String, Object> _initParam) {
		this._initParam = _initParam;
	}

	public String getMessage() {
		return _message;
	}

	public void setMessage(String _message) {
		this._message = _message;
	}
	
	public void setMessage(String _message, boolean _succeed) {
		this._message = _message;
		this._succeed = _succeed;
	}

	public boolean isSucceed() {
		return _succeed;
	}

	public void setIsSucceed(boolean _succeed) {
		this._succeed = _succeed;
	}
}
