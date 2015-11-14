/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.wf.note;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.note.SenderUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 合计同一节点的审批消息发送短信。
 * 用于定时任务：
 *
 * @author TonyTan
 * @version 1.0, 2012-5-21
 */
public class NoteMergeSender extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 汇总合计分配消息发送短信。
	 * @return
	 */
	public boolean setMergeNote() {
		List<Map<String,String>> lsCheck = queryCheckMsg();
		_log.showDebug("...........待发合并短信的数量=" + lsCheck.size());
		if (lsCheck.isEmpty()) return true;
		
		//修改分配消息的状态
		if (!updateAssignState()) {
			_log.showError("修改合计分配消息的状态为已发送短信失败！");
			return false;
		}
		
		for (Map<String,String> mpCheck : lsCheck) {
			Map<String,String> mpData = FactoryUtil.newMap();
			mpData.put("send_src", "wf");
			mpData.put("send_user", "sys");
			
			String cnt = mpCheck.get("cnt");
			String userId = mpCheck.get("assign_userid");
			String sendCode = getMobileCode(userId);
			if (sendCode.length() == 0) {
				_log.showDebug("...........用户的手机号为空：" + userId);
				continue;
			}
			
			String sendMsg = "您有 "+ cnt +" 条审批任务需要处理！";
			_log.showDebug("...........发送手机号码=" + sendCode);
			_log.showDebug("...........发送短信内容=" + sendMsg);
			
			mpData.put("user_id", userId);
			mpData.put("user_name", mpCheck.get("assign_user"));
			mpData.put("mob_code", sendCode);
			mpData.put("send_msg", sendMsg);
			
			//发送短信
			boolean bret = SenderUtil.massSend(sendCode, sendMsg);
			if (bret) {
				mpData.put("send_status", SenderUtil.SEND_SUCCESS);
			} else {
				mpData.put("send_status", SenderUtil.SEND_FAILD);
			}
			
			//记录短信发送记录
			SenderUtil.saveSend(mpData);
		}
		
		return true;
	}
	
	//取所有需要合并审批消息的记录，根据节点汇总
	/*private List<Map<String,String>> queryTaskMsg() {
		StringBuilder sql = new StringBuilder("select wf_assign.assign_user, wf_assign.assign_userid, ");
		sql.append("wf_task.node_title, count(*) as cnt from wf_assign, wf_task ");
		sql.append("where wf_assign.task_id = wf_task.task_id ");
		sql.append("and wf_task.note_type = '2' and wf_assign.has_note = '0' ");
		sql.append("group by wf_assign.assign_user, wf_assign.assign_userid, ");
		sql.append("wf_task.node_id, wf_task.node_title");
		
		DaoParam param = _dao.createParam(sql.toString());
		return _dao.query(param);
	}*/
	
	//统计所有审批消息，减少短信数量
	private List<Map<String,String>> queryCheckMsg() {
		StringBuilder sql = new StringBuilder("select wf_assign.assign_user, wf_assign.assign_userid, ");
		sql.append("count(*) as cnt from wf_assign, sys_user, wf_task ");
		sql.append("where wf_assign.assign_userid = sys_user.user_id and wf_assign.task_id = wf_task.task_id ");
		sql.append("and wf_task.note_type = '2' and sys_user.mob_code > ' ' and wf_assign.has_note = '0' ");
		sql.append("group by wf_assign.assign_user, wf_assign.assign_userid ");
		
		DaoParam param = _dao.createParam(sql.toString());
		return _dao.query(param);
	}
	
	//修改分配消息的状态
	private boolean updateAssignState() {
		StringBuilder sql = new StringBuilder("");
		sql.append("update wf_assign set has_note = '1' ");
		sql.append("where assign_id in (select wf_assign.assign_id from wf_assign, sys_user, wf_task ");
		sql.append("where wf_assign.assign_userid = sys_user.user_id and wf_assign.task_id = wf_task.task_id ");
		sql.append("and wf_task.note_type = '2' and sys_user.mob_code > ' ' and wf_assign.has_note = '0')");
		
		DaoParam param = _dao.createParam(sql.toString());
		return _dao.update(param);
	}
	
	//根据用户ID取手机号码
	private String getMobileCode(String userId) {
		String sql = "select mob_code from sys_user where user_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		Map<String,String> mpData = _dao.queryMap(param);
		if (mpData.isEmpty()) return "";
		
		String mobCode = mpData.get("mob_code");
		return mobCode;
	}
}
