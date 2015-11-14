/*
 * TaskInstanceDao.java 2011-1-28
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
 * 任务实例查询类，负责任务实例数据查询的工具类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class TaskInstanceDao {
	private Log _log = Log.getInstance();
	private BaseDao _dao = BaseDao.getInstance();
	private static TaskInstanceDao _instance = new TaskInstanceDao();
	//任务实例表的所有字段
	private String _field_sql = DmDaoUtil.getFieldSql("wf_task");
	
	private TaskInstanceDao(){}
	/**
	 * 构建单例对象。
	 * @return
	 */
	public static TaskInstanceDao getInstance() {
		return _instance;
	}
	
	/**
	 * 根据任务实例ID查询实例数据。
	 * @param taskId -- 任务ID
	 * @return
	 */
	public Map<String,String> queryTask(String taskId) {
		String sql = "select "+ _field_sql +" from wf_task where task_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(taskId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 查询不同任务状态的任务实例数据。
	 * @param runstate -- 任务实例状态
	 * @return
	 */
	public List<Map<String,String>> queryTaskByState(String runstate) {
		String sql = "select "+ _field_sql +" from wf_task where run_state = ? ";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(runstate);
		
		return _dao.query(param);
	}
	
	/**
	 * 查询已执行的实例数据，只查询需要异步执行的过程实例
	 * @return
	 */
	public List<Map<String,String>> queryDoneTask() {
		String sql = "select "+ _field_sql +" from wf_task where run_state = ? " +
				"and process_id in (select process_id from wf_process where exe_delay = '1')";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(StatusCode.TASK_EXECUTED);
		
		return _dao.query(param);
	}
	
	/**
	 * 根据任务分配信息查询初始化的任务实例数据，
	 * 由于一条数据可能存在多个子任务，所以要根据任务分配信息查询对应的任务，
	 * 如果同一个用户在多个子任务中都有分配，则一个一个执行。
	 * @param funId -- 功能ID
	 * @param dataId -- 数据ID
	 * @param userId -- 分配用户ID
	 * @return
	 */
	public Map<String,String> queryTaskByAssign(String funId, String dataId, String userId) {
		String sql = "select "+ _field_sql +" from wf_task where task_id in " +
				"(select task_id from wf_assign where run_state = '0' and " +
				"assign_userid = ? and fun_id = ? and data_id = ?)";
		DaoParam param = _dao.createParam(sql);
		//param.addStringValue(StatusCode.TASK_CREATED); 多人审批节点任务会执行多次
		param.addStringValue(userId);
		param.addStringValue(funId);
		param.addStringValue(dataId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 根据功能ID与记录ID查询对应的任务实例数据，如果有分支路径则可能存在多个子任务。
	 * 没有加状态过滤条件，是方便查询到异步执行的任务实例。
	 * @param funId -- 功能ID
	 * @param dataId -- 数据ID
	 * @return
	 */
	public List<Map<String,String>> queryTaskByDataId(String funId, String dataId) {
		String sql = "select "+ _field_sql +" from wf_task where fun_id = ? and data_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(dataId);
		
		return _dao.query(param);
	}
	
	/**
	 * 查询最近一条历史审批任务信息；
	 * 指定节点值必须为空，否则重复取回时会进入其它节点；
	 * @param funId -- 功能ID
	 * @param dataId -- 数据ID
	 * @return
	 */
	public Map<String,String> queryHisTask(String funId, String dataId) {
		String sql = "select "+ _field_sql +" from wf_taskhis where fun_id = ? and data_id = ? " +
				"and next_nodeid is null order by check_date desc";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(dataId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 根据用户ID查询各种状态的实例数据。
	 * @param userId
	 * @param runstate
	 * @return
	 */
	public List<Map<String,String>> queryTaskByUserId(String userId, String runstate) {
		String sql = "select "+ _field_sql +" from wf_task where user_id = ? and run_state = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		param.addStringValue(runstate);
		
		return _dao.query(param);
	}
	
	/**
	 * 取任务分配消息的状态，用于判断当前分配消息是否执行完成。
	 * @param taskId -- 任务实例ID
	 * @param userId -- 当前用户ID
	 * @return
	 */
	public String queryAssignState(String taskId, String userId) {
		String sql = "select run_state from wf_assign where task_id = ? and assign_userid = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(taskId);
		param.addStringValue(userId);
		
		Map<String,String> mpData = _dao.queryMap(param);
		
		return MapUtil.getValue(mpData, "run_state", "1");
	}
	
	/**
	 * 批量更新选择的已执行任务的状态为“完成”，避免重复查询任务实例。
	 * @param lsData -- 已执行任务数据
	 * @return boolean
	 */
	public boolean updateState(List<Map<String,String>> lsData) {
		if (lsData == null || lsData.isEmpty()) return true;
		
		//构建in子句
		StringBuilder sbWhere = new StringBuilder("('");
		for (int i = 0; i < lsData.size(); i++) {
			sbWhere.append(lsData.get(i).get("task_id") + "','");
		}
		String insql = sbWhere.substring(0, sbWhere.length()-2) + ")";
		
		//修改状态为”已完成“
		String sql = "update wf_task set run_state = ? where task_id in " + insql;
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(StatusCode.TASK_COMPLETED);
		return _dao.update(param);
	}
	
	/**
	 * 新增任务实例数据。
	 * @param task -- 任务实例
	 * @return
	 */
	public boolean insertTask(TaskInstance task) {
		//保存任务基础信息
		Map<String,String> mpTask = FactoryUtil.newMap();
		mpTask.put("process_id", task.getProcessId());
		mpTask.put("node_id", task.getNodeId());
		mpTask.put("node_title", task.getNodeTitle());
		mpTask.put("fun_id", task.getFunId());
		mpTask.put("data_id", task.getDataId());
		mpTask.put("instance_id", task.getInstanceId());
		mpTask.put("run_state", task.getRunState());
		mpTask.put("start_date", task.getStartDate());
		mpTask.put("limit_date", task.getLimitDate());	//受限时间在给值的时候计算
		mpTask.put("task_desc", task.getTaskDesc());	//任务描述解析在给值的时候计算
		mpTask.put("agree_num", task.getAgreeNum());
		mpTask.put("has_email", task.getHasEmail());
		mpTask.put("note_type", task.getNoteType());
		
		mpTask.put("add_date", DateUtil.getTodaySec());
		
		String taskId = DmDao.insert("wf_task", mpTask);
		if (taskId.length() == 0) return false;
		
		//设置新的任务ID
		task.setTaskId(taskId);
		return true;
	}
	
	/**
	 * 新增任务分配数据。
	 * @param task -- 任务实例
	 * @param lsUser -- 有效的分配用户信息
	 * @return
	 */
	public boolean insertAssign(TaskInstance task, List<Map<String,String>> lsUser) {
		//保存任务分配信息
		Map<String,String> mpAssign = FactoryUtil.newMap();
		mpAssign.put("task_id", task.getTaskId());
		mpAssign.put("instance_id", task.getInstanceId());
		mpAssign.put("fun_id", task.getFunId());
		mpAssign.put("data_id", task.getDataId());
		mpAssign.put("run_state", "0");
		mpAssign.put("start_date", task.getStartDate());
		mpAssign.put("limit_date", task.getLimitDate());
		mpAssign.put("task_desc", task.getTaskDesc());
		mpAssign.put("add_date", DateUtil.getTodaySec());
		
		//替换任务分配中的用户信息
		for (int i = 0, n = lsUser.size(); i < n; i++) {
			Map<String,String> mpUser = lsUser.get(i);
			
			mpAssign.put("assign_userid", mpUser.get("user_id"));
			mpAssign.put("assign_user", mpUser.get("user_name"));
			
			String assignId = DmDao.insert("wf_assign", mpAssign);
			if (assignId.length() == 0) return false;
		}

		return true;
	}
	
	/**
	 * 更新任务实例执行后的信息，主要保存任务执行时用户填写的信息。
	 * @param task -- 任务实例
	 * @return
	 */
	public boolean executeTask(TaskInstance task) {
		Map<String,String> mpTask = FactoryUtil.newMap();
		
		//设置任务执行信息
		mpTask.put("check_userid", task.getCheckUserId());
		mpTask.put("check_user", task.getCheckUserName());
		mpTask.put("check_date", task.getCheckDate());
		mpTask.put("check_type", task.getCheckType());
		mpTask.put("check_desc", task.getCheckDesc());
		mpTask.put("next_nodeid", task.getNextNodeId());
		mpTask.put("next_userid", task.getNextUserId());
		mpTask.put("next_user", task.getNextUser());
		mpTask.put("deal_desc", task.getDealDesc());
		mpTask.put("run_state", task.getRunState());
		//保存执行信息
		String taskId = task.getTaskId();
		return DmDao.update("wf_task", taskId, mpTask);
	}
	
	/**
	 * 更新分配消息状态，当前处理人的消息状态为完成；
	 * 同时更新当前审批人、审批时间、审批意见等信息，实现同节点多人审批需求；
	 * 
	 * 分配消息状态：0 新、1 已完成、4 已注销
	 * 
	 * @param task -- 任务实例
	 * @return
	 */
	public boolean executeAssign(TaskInstance task) {
		StringBuilder sql = new StringBuilder("update wf_assign set ");
			sql.append("run_state = ?,");
			sql.append("check_userid = ?,");
			sql.append("check_user = ?,");
			sql.append("check_date = ?,");
			sql.append("check_type = ?,");
			sql.append("check_desc = ? ");
			sql.append("where task_id = ? and assign_userid = ?");
		
		DaoParam param = _dao.createParam(sql.toString());
		param.addStringValue("1");
		param.addStringValue(task.getCheckUserId());
		param.addStringValue(task.getCheckUserName());
		param.addDateValue(task.getCheckDate());
		param.addStringValue(task.getCheckType());
		param.addStringValue(task.getCheckDesc());
		
		param.addStringValue(task.getTaskId());
		param.addStringValue(task.getCheckUserId());
		
		return _dao.update(param);
	}
	
	/**
	 * 注销非当前人的分配消息
	 * @param task
	 * @return
	 */
	public boolean cancelAssign(TaskInstance task) {
		String sql = "update wf_assign set run_state = ? where task_id = ? and assign_userid <> ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue("4");
		param.addStringValue(task.getTaskId());
		param.addStringValue(task.getCheckUserId());
		
		return _dao.update(param);
	}
	
	/**
	 * 更新任务实例完成状态的信息，把任务实例转移到历史表中。
	 * @param task -- 任务实例
	 * @return
	 */
	public boolean completeTask(TaskInstance task) {
		String taskId = task.getTaskId();
		
		//修改任务状态与完成时间
		String sql = "update wf_task set run_state = ?, end_date = ?, modify_date = ? where task_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(StatusCode.TASK_COMPLETED);
		param.addDateValue(DateUtil.getTodaySec());
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(taskId);
		if (!_dao.update(param)) return false;
		
		//把任务实例转移到历史表中
		sql = "insert into wf_taskhis("+ _field_sql +") select "+ _field_sql +" from wf_task where task_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(taskId);
		if (!_dao.update(param)) return false;
		//"【{0}】任务实例转已移到历史表中..."
		_log.showDebug(JsMessage.getValue("taskdao.tohis"), taskId);
		
		//删除执行表中的任务实例
		sql = "delete from wf_task where task_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(taskId);
		if (!_dao.update(param)) return false;
		//"【{0}】执行表中的任务实例被删除..."
		_log.showDebug(JsMessage.getValue("taskdao.deltask"), taskId);
		
		//把任务分配信息转移到历史表中
		String fields = DmDaoUtil.getFieldSql("wf_assign");
		sql = "insert into wf_assignhis("+ fields +") select "+ fields +" from wf_assign where task_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(taskId);
		if (!_dao.update(param)) return false;
		//"【{0}】任务分配消息已转移到历史表中..."
		_log.showDebug(JsMessage.getValue("taskdao.assignhis"), taskId);
		
		//删除执行表中的任务分配记录
		sql = "delete from wf_assign where task_id = ?";
		param = _dao.createParam(sql);
		param.addStringValue(taskId);
		if (!_dao.update(param)) return false;
		//"【{0}】执行表中的任务分配消息被删除..."
		_log.showDebug(JsMessage.getValue("taskdao.delassign"), taskId);
		
		return true;
	}

	/**
	 * 当并发节点中有一个分支退回、否决、完成时，清理其它分支的任务与分配信息；
	 * @param task
	 * @return
	 */
	public boolean delOtherTask(TaskInstance task) {
		if (task == null) return true;
		
		String taskId = task.getTaskId();
		String instanceId = task.getInstanceId();
		if (taskId == null || taskId.length() == 0) return true;
		if (instanceId == null || instanceId.length() == 0) return true;
		
		String sql = "delete from wf_assign where instance_id = ? and task_id <> ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		param.addStringValue(taskId);
		if (!_dao.update(param)) return false;
		
		sql = "delete from wf_task where instance_id = ? and task_id <> ?";
		param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		param.addStringValue(taskId);
		if (!_dao.update(param)) return false;
		
		return true;
	}
}
