/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.wf.limit;

import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.DmDao;
import org.jxstar.util.DateUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.log.Log;

/**
 * 限时任务到时给上级发送消息。处理方法：
 * 1、根据分配人定义信息找到其升级用户；
 * 2、给升级用户发送系统消息；
 * 3、如果已经存在该任务分配记录的消息后则不再发送提醒。
 *
 * @author TonyTan
 * @version 1.0, 2012-4-11
 */
public class LimitTaskMsg {
	private static Log _log = Log.getInstance();
	private static BaseDao _dao = BaseDao.getInstance();
	
	/**
	 * 构建限时任务提醒信息
	 * @param mpAssign
	 * @return
	 */
	public static boolean limitMsg(Map<String,String> mpAssign) {
		if (mpAssign == null || mpAssign.isEmpty()) return true;
		
		String assignId = mpAssign.get("assign_id");
		//如果已经有消息了则不发送
		if (hasLimitMsg(assignId)) {
			_log.showDebug("已经存在限时任务提醒消息！");
			return true;
		}
		
		String taskId = mpAssign.get("task_id");
		String userId = mpAssign.get("assign_userid");
		String userName = mpAssign.get("assign_user");
		Map<String,String> mpUp = getUpUser(taskId, userId);
		
		if (mpUp.isEmpty()) {
			_log.showDebug("限时任务处理：没有找分配用户信息！");
			return true;
		}
		
		//取上级用户信息
		String upUserId = mpUp.get("up_userid");
		String upUserName = mpUp.get("up_user");
		if (upUserId.length() == 0 || upUserName.length() == 0) {
			_log.showDebug("限时任务处理：【"+ userName +"】分配用户的上级用户信息为空！");
			return true;
		}
		_log.showDebug("上级用户为：" + upUserName + ";" + upUserId);
		
		//构建提醒消息
		String upMsg = getHintMsg(mpAssign);
		
		//发送流程限时提醒消息
		sendLimitMsg(upUserId, upUserName, upMsg, mpAssign);
		
		return true;
	}
	
	/**
	 * 构建提醒消息
	 * @param mpAssign
	 * @return
	 */
	public static String getHintMsg(Map<String,String> mpAssign) {
		String taskId = mpAssign.get("task_id");
		String limitDate = mpAssign.get("limit_date");
		String assignUser = mpAssign.get("assign_user");
		String processName = getProcessName(taskId);
		
		StringBuilder sbMsg = new StringBuilder();
		sbMsg.append("系统提示：【");
		sbMsg.append(assignUser);
		sbMsg.append("】有一个【");
		sbMsg.append(processName);
		sbMsg.append("】审批任务已经超过【");
		sbMsg.append(limitDate);
		sbMsg.append("】限定时间！");
		
		return sbMsg.toString();
	}
	
	/**
	 * 根据任务实例ID与分配用户ID，找到其升级用户信息
	 * @param taskId -- 任务实例ID
	 * @param userId -- 分配用户ID
	 * @return
	 */
	public static Map<String,String> getUpUser(String taskId, String userId) {
		String sql = "select up_userid, up_user from wf_user, wf_task where " +
				"wf_user.process_id = wf_task.process_id and wf_user.node_id = wf_task.node_id " +
				"and wf_user.user_id = ? and wf_task.task_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		param.addStringValue(taskId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 根据任务ID取过程名称
	 * @param taskId
	 * @return
	 */
	public static String getProcessName(String taskId) {
		String sql = "select wf_process.process_name from wf_task, wf_process where " +
				"wf_task.process_id = wf_process.process_id and wf_task.task_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(taskId);
		
		Map<String,String> mp = _dao.queryMap(param);
		if (mp.isEmpty()) return "";
		
		return mp.get("process_name");
	}
	
	/**
	 * 是否已经发送过限时提醒消息
	 * @param assignId -- 分配消息ID
	 * @return
	 */
	public static boolean hasLimitMsg(String assignId) {
		String sql = "select count(*) as cnt from plet_msg where from_userid = 'wf_limit' and instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(assignId);
		
		Map<String,String> mp = _dao.queryMap(param);
		if (mp.isEmpty()) return false;
		
		return !(mp.get("cnt").equals("0"));
	}
	
	/**
	 * 发送流程限时提醒消息
	 * @param userId
	 * @param userName
	 * @param msg
	 * @param mpAssign
	 * @return
	 */
	public static boolean sendLimitMsg(String userId, String userName, String msg, 
			Map<String,String> mpAssign) {
		//发送消息
		Map<String,String> mpMsg = FactoryUtil.newMap();
		mpMsg.put("content", msg);
		mpMsg.put("from_userid", "wf_limit");
		mpMsg.put("from_user", "流程限时提醒");
		mpMsg.put("to_userid", userId);
		mpMsg.put("to_user", userName);
		mpMsg.put("send_date", DateUtil.getTodaySec());
		mpMsg.put("isto", "1");
		mpMsg.put("msg_state", "1");
		mpMsg.put("msg_type", "sys");
		mpMsg.put("fun_id", mpAssign.get("fun_id"));
		mpMsg.put("data_id", mpAssign.get("data_id"));
		mpMsg.put("instance_id", mpAssign.get("assign_id"));//保存分配消息ID
		mpMsg.put("add_userid", "wf_limit");
		mpMsg.put("add_date", DateUtil.getTodaySec());
		//新增消息记录
		DmDao.insert("plet_msg", mpMsg);
		
		return true;
	}
}
