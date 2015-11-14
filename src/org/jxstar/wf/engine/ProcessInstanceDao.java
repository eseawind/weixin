/*
 * ProcessInstanceDao.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.engine;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.DmDao;
import org.jxstar.dao.DmDaoUtil;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.log.Log;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.invoke.StatusCode;

/**
 * 过程实例查询类，负责过程实例数据查询的工具类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class ProcessInstanceDao {
	private Log _log = Log.getInstance();
	private BaseDao _dao = BaseDao.getInstance();
	private static ProcessInstanceDao _instance = new ProcessInstanceDao();
	//过程实例表的所有字段
	private String _field_sql = DmDaoUtil.getFieldSql("wf_instance");
	
	private ProcessInstanceDao(){}
	/**
	 * 构建单例对象。
	 * @return
	 */
	public static ProcessInstanceDao getInstance() {
		return _instance;
	}
	
	/**
	 * 查询所有初始化状态的过程实例，只查询需要异步执行的过程实例。
	 * @return
	 */
	public List<Map<String,String>> queryInitProcess() {
		String sql = "select "+ _field_sql +" from wf_instance where run_state = ? " +
				"and process_id in (select process_id from wf_process where exe_delay = '1')";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(StatusCode.PROCESS_INITIATED);
		
		return _dao.query(param);
	}
	
	/**
	 * 查询过程实例数据。
	 * @param instanceId -- 过程实例ID
	 * @return
	 */
	public Map<String,String> queryProcess(String instanceId) {
		String sql = "select "+ _field_sql +" from wf_instance where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 是否执行过的历史实例，在查看流程图时用。
	 * @param processId -- 过程定义ID
	 * @param dataId -- 业务数据ID
	 * @return
	 */
	public boolean hasHisInstance(String processId, String dataId) {
		String sql = "select count(*) as cnt from wf_instancehis where process_id = ? and data_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(dataId);
		
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
	
	/**
	 * 保存新的过程实例数据记录。
	 * @param processInstance -- 过程实例对象
	 * @return
	 */
	public boolean insertProcess(ProcessInstance processInstance) {
		Map<String,String> mpData = FactoryUtil.newMap();
		//保存实例基础信息
		mpData.put("process_id", processInstance.getProcessId());
		mpData.put("process_name", processInstance.getProcessName());
		mpData.put("fun_id", processInstance.getFunId());
		mpData.put("data_id", processInstance.getDataId());
		mpData.put("start_date", processInstance.getStartDate());
		mpData.put("start_userid", processInstance.getStartUserId());
		mpData.put("start_user", processInstance.getStartUserName());
		mpData.put("start_nodeid", processInstance.getStartNodeId());
		mpData.put("run_state", processInstance.getRunState());
		
		//保存父过程实例信息
		mpData.put("parent_nid", processInstance.getParentNodeId());
		mpData.put("parent_pid", processInstance.getParentProcessId());
		mpData.put("parent_sid", processInstance.getParentInstanceId());
		
		mpData.put("add_date", DateUtil.getTodaySec());
		mpData.put("add_userid", processInstance.getStartUserId());
		
		String instanceId = DmDao.insert("wf_instance", mpData);
		if (instanceId.length() == 0) return false;
		
		//设置新的过程实例ID
		processInstance.setInstanceId(instanceId);
		return true;
	}
	
	/**
	 * 结束过程，可能是执行完成或终止流程，处理有保存过程实例数据到历史表中，
	 * 并删除过程执行过程中产生的状态数据。
	 * @param processInstance -- 过程实例对象
	 * @return
	 */
	public boolean completeProcess(ProcessInstance processInstance) {
		String instanceId = processInstance.getInstanceId();
		
		//修改过程实例的状态与完成时间
		String sql = "update wf_instance set run_state = ?, end_date = ?, " +
				"modify_date = ?, instance_desc = ? where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processInstance.getRunState());
		param.addDateValue(DateUtil.getTodaySec());
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(processInstance.getInstanceDesc());
		param.addStringValue(instanceId);
		if (!_dao.update(param)) return false;
		
		//把过程实例转移到历史表中
		sql = "insert into wf_instancehis("+ _field_sql +") select "+ _field_sql +" from wf_instance where instance_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		if (!_dao.update(param)) return false;
		//"【{0}】过程实例已转移到历史表中..."
		_log.showDebug(JsMessage.getValue("processdao.tohis"), instanceId);
		
		//删除原过程实例
		sql = "delete from wf_instance where instance_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		if (!_dao.update(param)) return false;
		//"【{0}】执行表中的过程实例被删除..."
		_log.showDebug(JsMessage.getValue("processdao.delprocess"), instanceId);
		
		//删除过程实例的标记对象
		sql = "delete from wf_token where instance_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		if (!_dao.update(param)) return false;
		//"【{0}】过程实例的标记对象被删除..."
		_log.showDebug(JsMessage.getValue("processdao.deltoken"), instanceId);
		
		return true;
	}
	
	/**
	 * 修改过程实例的状态与执行过程中的信息。
	 * @param instanceId -- 实例ID
	 * @param state -- 运行状态
	 * @param desc -- 运行描述
	 * @return
	 */
	public boolean executeProcess(String instanceId, String state, String desc) {
		String sql = "update wf_instance set run_state = ?, instance_desc = ?, " +
				"modify_date = ? where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(state);
		param.addStringValue(desc);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(instanceId);
		
		return _dao.update(param);
	}
	
	/**
	 * 批量更新选择的初始化过程实例的状态为“运行”，避免重复查询初始化过程实例。
	 * @param lsData -- 初始化的过程实例数据
	 * @return boolean
	 */
	public boolean updateRun(List<Map<String,String>> lsData) {
		if (lsData == null || lsData.isEmpty()) return true;
		
		//构建过程ID为in子句的值
		StringBuilder sbWhere = new StringBuilder("('");
		for (int i = 0; i < lsData.size(); i++) {
			sbWhere.append(lsData.get(i).get("instance_id") + "','");
		}
		String insql = sbWhere.substring(0, sbWhere.length()-2) + ")";
		
		//修改查询的初始过程为已运行
		String sql = "update wf_instance set run_state = ? where instance_id in " + insql;
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(StatusCode.PROCESS_RUNNING);
		return _dao.update(param);
	}

}
