/*
 * EventDefine.java 2008-4-6
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.service.define;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.log.Log;

/**
 * 读取组件配置信息的工具对象.
 * 
 * @author TonyTan
 * @version 1.0, 2008-4-6
 */
public class EventDefine {
	private static Log _log = Log.getInstance();
	//数据库访问对象
	private static BaseDao _dao = BaseDao.getInstance();
	//系统事件功能ID
	private static final String SYSEVENT = "sysevent";
	
	/**
	 * 取功能事件的调用类信息，如果没有自定义类则到系统事件类中查找。
	 * @param funID -- 功能ID
	 * @param eventCode -- 事件代码
	 * @return
	 */
	public static List<Map<String, String>> getEventModule(
			String funID, String eventCode) {
		List<Map<String, String>> lsRet = FactoryUtil.newList();
		//事件定义信息
		Map<String,String> mpEvent = FunDefineDao.queryEventMap(funID, eventCode);
		if (mpEvent.isEmpty()) return lsRet;
		//事件功能ID，如果是采用事件域，则是sysevent，否则是funID
		String eventFunId = mpEvent.get("fun_id");
		
		//取当前事件的扩展类
		List<Map<String, String>> lsCutom;
		if (eventFunId.equals(SYSEVENT)) {
			lsCutom = getExtModule(funID, eventCode, "");
		} else {
			lsCutom = getCustomModule(funID, eventCode, "");
		}
		//取当前事件的系统调用类
		List<Map<String, String>> lsCommon = getCustomModule(SYSEVENT, eventCode, "");
		
		//如果有事件替代类，则不取原来的类与扩展类
		lsRet.addAll(getModule(lsCutom, "2"));
		if (lsRet.isEmpty()) {
			//取自定义事件“之前”的扩展类
			lsRet.addAll(getModule(lsCutom, "0"));
			//系统事件调用的类
			lsRet.addAll(lsCommon);
			//自定义事件“之后”的扩展类
			lsRet.addAll(getModule(lsCutom, "1"));
		}
		_log.showDebug("query event module is " + lsRet.toString());

		return lsRet;
	}
	
	/**
	 * 取签字事件[audit]或过程完成事件[process_3]的调用类。
	 * 如果功能定义中的有效值是3，表示有审批流程，签字后的调用类都要在审批通过后才执行。
	 * @param funID -- 功能ID，如果是process_3，值为sysevent
	 * @param eventCode -- 事件代码
	 * @param checkFunId -- 审批目标功能ID，如果是process_3，才有值
	 * @return
	 */
	public static List<Map<String, String>> getAuditModule(
			String funID, String eventCode, String checkFunId) {
		List<Map<String, String>> lsRet = FactoryUtil.newList();
		//取当前签字、审批的功能
		String auditFunId = eventCode.equals("process_3") ? checkFunId : funID;
		
		//取功能定义信息
		DefineDataManger manger = DefineDataManger.getInstance();
		Map<String,String> mpFun = manger.getFunData(auditFunId);
		//如果有效值是3，表示有审批流程，签字后的调用类都要在审批通过后才执行
		String validValue = MapUtil.getValue(mpFun, "valid_flag", "1");
		
		//事件定义信息
		Map<String,String> mpEvent = FunDefineDao.queryEventMap(funID, eventCode);
		if (mpEvent.isEmpty()) return lsRet;
		//事件功能ID，如果是采用事件域，则是sysevent，否则是funID
		String eventFunId = mpEvent.get("fun_id");

		//取当前事件的扩展类
		List<Map<String, String>> lsCutom;
		if (eventFunId.equals(SYSEVENT)) {
			lsCutom = getExtModule(funID, eventCode, "");
		} else {
			lsCutom = getCustomModule(funID, eventCode, "");
		}
		//取当前事件的系统调用类
		List<Map<String, String>> lsCommon = getCustomModule(SYSEVENT, eventCode, "");

		//如果有自定义的事件替代类，则不取系统事件的类与扩展类
		lsRet.addAll(getModule(lsCutom, "2"));
		if (!lsRet.isEmpty()) return lsRet;
		
		//取自定义事件“之前”的扩展类
		lsRet.addAll(getModule(lsCutom, "0"));
		//取系统事件“之前”的扩展类
		lsRet.addAll(getModule(lsCommon, "0"));
		
		//取系统事件“替代”类
		lsRet.addAll(getModule(lsCommon, "2"));
		
		//如果是签字事件，则必须没有定义审批流程，才调用签字“之后”的扩展类
		if (eventCode.equals("audit")) {
			if (validValue.equals("1")) {
				//签字系统事件“之后”的扩展类
				lsRet.addAll(getModule(lsCommon, "1"));
				//签字自定义事件“之后”的扩展类
				lsRet.addAll(getModule(lsCutom, "1"));
			}
		} else {
			//如果是过程完成事件，则还要调用“audit之后”的扩展
			if (validValue.equals("3") && eventCode.equals("process_3")) {
				//签字系统事件“之后”的扩展类
				lsRet.addAll(getCustomModule(SYSEVENT, "audit", "1"));
				//签字自定义事件“之后”的扩展类
				lsRet.addAll(getExtModule(checkFunId, "audit", "1"));
			}
		}
		_log.showDebug("query audit event module is " + lsRet.toString());

		return lsRet;
	}
	
	/**
	 * 工作流相关事件：process_  task_ 不包括process_3
	 * @param checkFunId -- 审批目标功能ID
	 * @param eventCode -- 事件代码
	 * @return
	 */
	public static List<Map<String, String>> getWfModule(String checkFunId, String eventCode) {
		List<Map<String, String>> lsRet = FactoryUtil.newList();
		//事件定义信息
		Map<String,String> mpEvent = FunDefineDao.queryEventMap(checkFunId, eventCode);
		if (mpEvent.isEmpty()) {
			mpEvent = FunDefineDao.queryEventMap(SYSEVENT, eventCode);
			if (mpEvent.isEmpty()) return lsRet;
		}
		//事件功能ID，如果是采用事件域，则是sysevent，否则是funID
		String eventFunId = mpEvent.get("fun_id");
		
		//取当前事件的扩展类
		List<Map<String, String>> lsCutom;
		if (eventFunId.equals(SYSEVENT)) {
			lsCutom = getExtModule(checkFunId, eventCode, "");
		} else {
			lsCutom = getCustomModule(checkFunId, eventCode, "");
		}
		//取当前事件的系统调用类
		List<Map<String, String>> lsCommon = getCustomModule(SYSEVENT, eventCode, "");
		
		//如果有事件替代类，则不取原来的类与扩展类
		lsRet.addAll(getModule(lsCutom, "2"));
		if (lsRet.isEmpty()) {
			//取自定义事件“之前”的扩展类
			lsRet.addAll(getModule(lsCutom, "0"));
			//系统事件调用的类
			lsRet.addAll(lsCommon);
			//自定义事件“之后”的扩展类
			lsRet.addAll(getModule(lsCutom, "1"));
		}
		_log.showDebug("query event module is " + lsRet.toString());

		return lsRet;
	}

	/**
	 * 获取组件执行方法的参数信息.
	 * 
	 * @param invokeID - 调用对象ID
	 * @return List 保存方法的参数信息
	 */
	public static List<Map<String, String>> getModuleParam(String invokeID) {
		StringBuilder sbsql = new StringBuilder("select param_name, param_type, param_value ");
			sbsql.append("from fun_event_param where ");
			sbsql.append("invoke_id = ? order by param_index");
		
		DaoParam param = _dao.createParam(sbsql.toString()).addStringValue(invokeID);
		return _dao.query(param);
	}
	
	/**
	 * 查询自定义事件前后调用的组件：功能定义--事件注册--扩展类定义。
	 * 
	 * @param funID - 功能ID
	 * @param eventCode - 事件代码
	 * @param position - 事件位置：0事件之前, 1事件之后
	 * @return List
	 */
	private static List<Map<String, String>> getCustomModule(
			String funID, String eventCode, String position) {
		//是否系统事件注册类
		String issys = funID.equals(SYSEVENT) ? "1" : "0";
		
		StringBuilder sbsql = new StringBuilder();
			sbsql.append("select invoke_id, module_name, method_name, position, '"+ issys +"' as issys ");
			sbsql.append("from fun_event_invoke where (status = '0' or status is null) and ");
			sbsql.append("exists (select * from fun_event where ");
			sbsql.append("fun_event.event_id = fun_event_invoke.event_id ");
			sbsql.append("and fun_id = ? and event_code = ?) ");
			
			String param0 = funID + ";" + eventCode;
			String param1 = "string;string";
			
			//取之前之后的类
			if (position != null && position.length() > 0) {
				sbsql.append(" and position = ? ");
				param0 += ";" + position;
				param1 += ";string";
			}
			
			sbsql.append(" order by invoke_index ");
		
		DaoParam param = _dao.createParam(sbsql.toString());
		param.setValue(param0).setType(param1);
		return _dao.query(param);
	}
	
	/**
	 * 查询系统事件前后调用的组件：功能定义--事件注册--事件域的扩展类定义。
	 * 
	 * @param funID - 功能ID
	 * @param eventCode - 系统事件代码，只有系统事件才有用
	 * @param position - 事件位置：0系统事件之前, 1系统事件之后
	 * @return List
	 */
	private static List<Map<String, String>> getExtModule(
			String funID, String eventCode, String position) {
		StringBuilder sbsql = new StringBuilder();
			sbsql.append("select invoke_id, module_name, method_name, position, '0' as issys ");
			sbsql.append("from fun_event_invoke where (status = '0' or status is null) and ");
			sbsql.append("exists (select * from fun_event where ");
			sbsql.append("fun_event.event_id = fun_event_invoke.event_id and fun_id = ?) ");
			
			String param0 = funID;
			String param1 = "string";
			
			//取系统事件自定义的扩展类
			if (eventCode != null && eventCode.length() > 0) {
				sbsql.append(" and event_code = ? ");
				param0 += ";" + eventCode;
				param1 += ";string";
			}
			
			//取之前之后的类
			if (position != null && position.length() > 0) {
				sbsql.append(" and position = ? ");
				param0 += ";" + position;
				param1 += ";string";
			}
			
			sbsql.append(" order by invoke_index ");
		
		DaoParam param = _dao.createParam(sbsql.toString());
		param.setValue(param0).setType(param1);
		return _dao.query(param);
	}
	
	/**
	 * 从调用类列表中根据扩展位置查找相关记录，为了减少查询数据库的次数。
	 * @param lsInvoke -- 调用类列表
	 * @param position -- 扩展位置：0之前、1之后、2替代
	 * @return
	 */
	private static List<Map<String, String>> getModule(
			List<Map<String, String>> lsInvoke, String position) {
		List<Map<String, String>> lsRet = FactoryUtil.newList();
		
		for (int i = 0, n = lsInvoke.size(); i < n; i++) {
			Map<String, String> mpData = lsInvoke.get(i);
			
			String pos = mpData.get("position");
			if (pos.equals(position)) {
				lsRet.add(mpData);
			}
		}
		
		return lsRet;
	}
}
