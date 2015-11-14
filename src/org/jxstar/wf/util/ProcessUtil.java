/*
 * ProcessUtil.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.util;

import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.service.define.FunDefineDao;
import org.jxstar.service.define.FunctionDefine;
import org.jxstar.service.define.FunctionDefineManger;
import org.jxstar.service.util.FunStatus;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringUtil;

/**
 * 工作流中的工具类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class ProcessUtil {
	private static BaseDao _dao = BaseDao.getInstance();
	
	/**
	 * 取消新发起的审批流程；只有提交人才能取消审批，删除所有实例数据，退回到未提交状态
	 * @param instanceId -- 过程实例id
	 * @return
	 */
	public static boolean deleteInstance(String instanceId) {
		String sql = "delete wf_instance where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		if (!_dao.update(param)) return false;
		
		sql = "delete wf_task where instance_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		if (!_dao.update(param)) return false;
		
		sql = "delete wf_assign where instance_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		if (!_dao.update(param)) return false;
		
		sql = "delete wf_token where instance_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		if (!_dao.update(param)) return false;
		
		return true;
	}
	
	/**
	 * 修改某个实例对应的业务记录状态为0
	 * @param instanceId
	 * @return
	 */
	public static boolean updateAudit(String instanceId) {
		Map<String,String> data = queryInstance(instanceId);
		
		String funId = MapUtil.getValue(data, "fun_id");
		String dataId = MapUtil.getValue(data, "data_id");
		//取设置的业务状态值
		String audit0 = FunStatus.getValue(funId, "audit0", "0");
		//修改功能记录状态
		return ProcessUtil.updateFunAudit(funId, dataId, audit0);
	}
	
	/**
	 * 判断过程是否已经有人审批通过了。
	 * @param instanceId
	 * @return
	 */
	public static boolean isStarted(String instanceId) {
		String sql = "select count(*) as cnt from wf_assignhis where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		Map<String,String> mp = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mp);
	}
	
	/**
	 * 判断当前人是否是提交人
	 * @param instanceId
	 * @param userId
	 * @return
	 */
	public static boolean equalStartUser(String instanceId, String userId) {
		Map<String,String> mp = queryInstance(instanceId);
		
		String sid = MapUtil.getValue(mp, "start_userid");
		return userId.equals(sid);
	}
	
	/**
	 * 取过程实例信息
	 * @param instanceId
	 * @return
	 */
	public static Map<String,String> queryInstance(String instanceId) {
		String sql = "select * from wf_instance where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		return _dao.queryMap(param);
	}
	
	/**
	 * 根据任务实例ID取过程实例ID
	 * @param taskId
	 * @return
	 */
	public static String getInstanceId(String taskId) {
		String sql = "select instance_id from wf_task where task_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(taskId);
		Map<String,String> mp = _dao.queryMap(param);
		
		return MapUtil.getValue(mp, "instance_id");
	}
	
	/**
	 * 判断当前功能是否需要执行审批流程，根据功能定义中的“有效记录值”判断，
	 * 如果是“审批通过”，表示需要检查流程定义，否则不检查是否有流程定义。
	 * @param funId -- 功能
	 * @return
	 */
	public static boolean isNeedWf(String funId) {
		//取功能定义信息
		Map<String,String> mpDefine = FunDefineDao.queryFun(funId);
		//取有效记录值，如果为3则表示需要检查
		String validFlag = mpDefine.get("valid_flag");
		
		return validFlag.equals("3");
	}
	
	/**
	 * 取指定功能的一条数据。直接根据表名取记录不能取到关联表中的值。
	 * @param funId -- 功能ID
	 * @param dataId -- 主键值
	 * @return
	 */
	/*public static Map<String,String> queryFunData(String funId, String dataId) {
		//取功能定义信息
		Map<String,String> mpDefine = FunDefineDao.queryFun(funId);
		//取主键字段名
		String keyField = mpDefine.get("pk_col");
		//取表名
		String tableName = mpDefine.get("table_name");
		//构建SQL
		StringBuilder sbsql = new StringBuilder();
		sbsql.append("select * from ").append(tableName).append(" where ");
		sbsql.append(keyField).append(" = ?");
		
		//查询数据
		DaoParam param = _dao.createParam(sbsql.toString());
		param.addStringValue(dataId);
		return _dao.queryMap(param);
	}*/
	//需要开启系统变量：fun.define.usepool，提高查询性能
	public static Map<String,String> queryFunData(String funId, String dataId) {
		//取功能定义对象
		FunctionDefine funObj = FunctionDefineManger.getInstance().getDefine(funId);
		//取select语句
		String select = funObj.getSelectSQL();
		//取where语句
		String where = funObj.getElement("where_sql");
		//取主键字段
		String keyField = funObj.getElement("pk_col");
		//数据源名
		String dsName = funObj.getElement("ds_name");
		
		//构建SQL
		StringBuilder sbsql = new StringBuilder();
		sbsql.append(select).append(" where ");
		if (where.length() > 0) {
			sbsql.append(StringUtil.addkf(where)).append(" and ");
		}
		sbsql.append(keyField).append(" = ?");
		
		//查询数据
		DaoParam param = _dao.createParam(sbsql.toString());
		param.setDsName(dsName);
		param.addStringValue(dataId);
		return _dao.queryMap(param);
	}
	
	/**
	 * 修改业务记录状态值。
	 * @param funId -- 功能ID
	 * @param dataId -- 数据ID
	 * @param audit -- 记录状态值
	 * @return
	 */
	public static boolean updateFunAudit(String funId, String dataId, String audit) {
		//取功能定义信息
		Map<String,String> mpDefine = FunDefineDao.queryFun(funId);
		//取主键字段名
		String keyField = mpDefine.get("pk_col");
		//取表名
		String tableName = mpDefine.get("table_name");
		//取记录状态字段
		String auditField = mpDefine.get("audit_col");
		//数据源名
		String dsName = mpDefine.get("ds_name");
		
		//构建SQL
		StringBuilder sbsql = new StringBuilder();
		sbsql.append("update ").append(tableName).append(" set ").append(auditField);
		sbsql.append(" = ? where ").append(keyField).append(" = ?");
		
		DaoParam param = _dao.createParam(sbsql.toString());
		param.setDsName(dsName);
		param.addStringValue(audit);
		param.addStringValue(dataId);
		return _dao.update(param);
	}
	
	/**
	 * 取流程注册数
	 * @return
	 */
	public static int getFlowNum() {
		String sql = "select count(*) as cnt from wf_process";
		DaoParam param = _dao.createParam(sql);
		Map<String,String> mp = _dao.queryMap(param);
		
		return Integer.parseInt(mp.get("cnt"));
	}
}
