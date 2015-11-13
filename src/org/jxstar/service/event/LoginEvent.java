/*
 * LoginEvent.java 2009-5-29
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.service.event;

import java.util.Date;
import java.util.Iterator;
import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.DaoParam;
import org.jxstar.security.LicenseInfo;
import org.jxstar.security.Password;
import org.jxstar.security.SafeManager;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.util.SysUserUtil;
import org.jxstar.util.DateUtil;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.util.resource.JsParam;

/**
 * 用户登录事件。
 * 
 * @author TonyTan
 * @version 1.0, 2009-5-28
 */
public class LoginEvent extends BusinessObject {
	private static final long serialVersionUID = 4418303228808369943L;
	
	/**
	 * 用户登陆系统的方法.
	 * 
	 * @return boolean
	 */
	public String login(RequestContext requestContext) {
		//---------------------------东宏许可-------------------------------
		//控制运行环境不能使用，在FunUserBO中赋值的
		String notrun = SystemVar.getValue("sys.jxstar.notrun", "0");
		if (notrun.equals("1")) {
			setMessage(JsMessage.getValue("license.notvalid"), 999);
			return _returnFaild;
		}
		SafeManager safe = SafeManager.getInstance();
		//学习版与企业版不判断合法性，项目版判断
		String verName = safe.getVerName();
		if (verName.equals("PE") || verName.equals("RE")) {
			int code = safe.checkCode();
			if (code > 0) {
				setMessage(JsMessage.getValue("license.notvalid"), code);
				return _returnFaild;
			}
		}
		int logNum = loginNum();
		//企业版不控制用户数，其它版本都控制
		if (!verName.equals("EE")) {
			int userNum = safe.getNum(3);//注册用户数
			if (logNum > userNum) {
				setMessage(JsMessage.getValue("loginbm.limituser", userNum));
				return _returnFaild;
			}
		}
		//------------------------------用户许可------------------------------
		if (userCheck(logNum) == false) return _returnFaild;
		//--------------------------------------------------------------------
		
		String sUserCode = requestContext.getRequestValue("user_code");
		String sUserPass = requestContext.getRequestValue("user_pass");
		_log.showDebug("login user code = " + sUserCode);
		
		//检查用户名与密码
		if (sUserCode.length() == 0 || sUserPass.length() == 0) {
			setMessage(JsMessage.getValue("loginbm.usercodenull"));
			return _returnFaild;
		}
		//从数据库中去用户信息
		Map<String,String> mpUser = SysUserUtil.getUserByCode(sUserCode);
		//_log.showDebug("user info = " + mpUser);
		if (mpUser == null || mpUser.isEmpty()) {
			setMessage(JsMessage.getValue("loginbm.nouserinfo", sUserCode));
			return _returnFaild;
		}
		
		//比较密码
		String sPass = (String) mpUser.get("user_pwd");
		//加密后的密码
		String userPass = Password.md5(sUserPass);
		if (! sPass.equals(userPass)) {
			setMessage(JsMessage.getValue("loginbm.userpwderror"));
			return _returnFaild;
		}
		
		//取当前用户的角色
		String sUserID = (String) mpUser.get("user_id");
		String sRoleID = SysUserUtil.getRoleID(sUserID);
		if (sRoleID == null || sRoleID.length() == 0) {
			setMessage(JsMessage.getValue("loginbm.nouserrole", sUserCode));
			return _returnFaild;
		}
		
		//保存用户信息
		mpUser.put("role_id", sRoleID);
		mpUser.remove("user_pwd");
		
		//取项目路径，系统登录时的项目路径为当前系统路径，在选择项目后可以修改项目路径
		String sysPath = requestContext.getRequestValue(JsParam.REALPATH);
		
		//保存用户信息到会话中
		mpUser.put("project_path", sysPath);
		_log.showDebug("-------session user info: " + mpUser.toString());
		requestContext.setUserInfo(mpUser);
		
		//把用户信息保存为脚本，返回给前台
		setReturnData(getScript(mpUser, sysPath));
		
		return _returnSuccess;
	}
	
	/**
	 * 供项目中扩展，可以保存其它信息到session中
	 * @param mpUser -- 当前登录用户信息
	 * @return
	 */
	protected Map<String,String> returnData(final Map<String,String> mpUser) {
		return null;
	}
	
	/**
	 * 把用户信息保存为脚本
	 * @param mpUser
	 * @return
	 */
	private String getScript(Map<String,String> mpUser, String sysPath) {
		String userId = mpUser.get("user_id");
		
		StringBuilder sbUser = new StringBuilder("{");
		sbUser.append("user_id:'" + userId + "',");
		sbUser.append("user_code:'" + mpUser.get("user_code") + "',");
		sbUser.append("user_name:'" + mpUser.get("user_name") + "',");
		sbUser.append("dept_id:'" + mpUser.get("dept_id") + "',");
		sbUser.append("dept_code:'" + mpUser.get("dept_code") + "',");
		sbUser.append("dept_name:'" + mpUser.get("dept_name") + "',");
		
		//如果有扩展信息需要输出到session中
		Map<String,String> retData = returnData(mpUser);
		if (retData != null && !retData.isEmpty()) {
			Iterator<String> itr = retData.keySet().iterator();
			while(itr.hasNext()) {
				String key = itr.next();
				if (key == null || key.length() == 0) continue;
				
				sbUser.append(key + ":'" + retData.get(key) + "',");
			}
		}
		
		sbUser.append("project_path:'" + sysPath + "',");
		sbUser.append("role_id:'" + mpUser.get("role_id") + "'}");
		
		return sbUser.toString();
	}
	
	/**
	 * 取当前在线用户数
	 * @return
	 */
	private int loginNum() {
		String sql = "select count(*) as cnt from sys_user_login";
		DaoParam param = _dao.createParam(sql);
		Map<String,String> mp = _dao.queryMap(param);
		
		//不含当前用户，多支持一个用户
		return Integer.parseInt(mp.get("cnt"));
	}
	
	/**
	 * 序号号是机器序列号的加密值；试用期日期是yyyy-mm-dd的加密值
	 * @param logNum
	 * @return
	 */
	private boolean userCheck(int logNum) {
		String sysNum = "0";
		try {
			//判断在线用户数，值加密
			sysNum = SystemVar.getValue("license.user.num");
			if (sysNum.length() > 0) {
				sysNum = Password.decodeNum(sysNum);
			}
			if (sysNum.length() == 0) sysNum = "1";
			//_log.showDebug(".............user.num=" + sysNum);
		
			if (logNum > Integer.parseInt(sysNum)) {
				setMessage(JsMessage.getValue("loginbm.limituser", sysNum));
				return false;
			}
		} catch(Exception e) {
			//_log.showError(e);
			setMessage(JsMessage.getValue("loginbm.limiterror", sysNum));
			return false;
		}
		
		String endTime = DateUtil.getToday();
		try {
			//判断试用期，值加密
			Date curDate = new Date();
			endTime = SystemVar.getValue("license.user.endtime");
			if (endTime.length() == 0) {
				endTime = DateUtil.getToday();
			} else {
				//值解密
				endTime = Password.decrypt(endTime);
			}
			//_log.showDebug(".............end.time=" + endTime);
			
			Date endDate = DateUtil.strToCalendar(endTime).getTime();
			if (curDate.compareTo(endDate) > 0) {
				//判断序列号是否合法
				if (!checkSerial()) {
					setMessage(JsMessage.getValue("loginbm.limittime", endTime));
					return false;
				}
			}
		} catch(Exception e) {
			//_log.showError(e);
			setMessage(JsMessage.getValue("loginbm.limittime", endTime));
			return false;
		}
		
		return true;
	}
	
	//判断序列号是否合法
	private boolean checkSerial() {
		String serialNo = SystemVar.getValue("license.user.serial");
		if (serialNo.length() > 0) {
			//取到机器序列号
			String key = LicenseInfo.readKey();
			//值加密
			key = Password.encrypt(key);
			//_log.showDebug(".............serial.key=" + key);
			if (serialNo.equals(key)) {
				return true;
			}
		}
		
		return false;
	}
}
