/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.wf.limit;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.DmDaoUtil;
import org.jxstar.util.DateUtil;

/**
 * 限时任务处理工具类。
 *
 * @author TonyTan
 * @version 1.0, 2012-4-11
 */
public class LimitTaskUtil {
	private static BaseDao _dao = BaseDao.getInstance();
	private static String _field_assign = DmDaoUtil.getFieldSql("wf_assign");
	
	/**
	 * 查找需要限时处理的分配任务
	 * @return
	 */
	public static List<Map<String,String>> queryLimitAssign() {
		String sql = "select "+ _field_assign +" from wf_assign where run_state = '0' " +
				"and limit_date > start_date and limit_date < ?";
		DaoParam param = _dao.createParam(sql);
		param.addDateValue(DateUtil.getTodaySec());
		
		return _dao.query(param);
	}
	
	/**
	 * 取超时处理规则：0 表示不处理，1 表示审批通过，2 表示提醒上级
	 * @param taskId -- 任务实例ID
	 * @return
	 */
	public static String getLimitRule(String taskId) {
		String sql = "select wf_nodeattr.limit_rule from wf_nodeattr, wf_task " +
				"where wf_nodeattr.process_id = wf_task.process_id " +
				"and wf_nodeattr.node_id = wf_task.node_id and wf_task.task_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(taskId);
		
		Map<String,String> mp = _dao.queryMap(param);
		if (mp.isEmpty()) return "";
		
		return mp.get("limit_rule");
	}
	
	
}
