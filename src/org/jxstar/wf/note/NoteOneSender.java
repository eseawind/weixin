/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.wf.note;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.note.SenderUtil;

/**
 * 单个审批任务分配消息短信发送类。
 * 主要用于：任务实例创建事件中，task_0
 *
 * @author TonyTan
 * @version 1.0, 2012-5-21
 */
public class NoteOneSender extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 找到当前任务实例的分配消息，每人发一条短信。
	 * @param taskId
	 * @return
	 */
	public String sendOneNote(String taskId) {
		if (taskId == null || taskId.length() == 0) {
			setMessage("审批任务ID为空，不能发送短信！");
			return _returnFaild;
		}
		_log.showDebug("...........发送短信的任务ID=" + taskId);
		
		List<Map<String,String>> lsTask = queryNoteTask(taskId);
		_log.showDebug("...........待发送短信的数量=" + lsTask.size());
		if (lsTask.isEmpty()) {
			return _returnSuccess;
		}
		
		for (Map<String,String> mpAss : lsTask) {
			mpAss.put("send_src", "wf");
			mpAss.put("send_user", "sys");
			
			String sendMsg = mpAss.get("send_msg");
			String sendCode = mpAss.get("mob_code");
			_log.showDebug("...........发送手机号码=" + sendCode);
			_log.showDebug("...........发送短信内容=" + sendMsg);
			
			//发送短信
			boolean bret = SenderUtil.massSend(sendCode, sendMsg);
			if (bret) {
				mpAss.put("send_status", SenderUtil.SEND_SUCCESS);
			} else {
				mpAss.put("send_status", SenderUtil.SEND_FAILD);
			}
			
			//记录短信发送记录
			SenderUtil.saveSend(mpAss);
		}
		
		return _returnSuccess;
	}
	
	//取有手机号、单个短信的分配消息
	private List<Map<String,String>> queryNoteTask(String taskId) {
		StringBuilder sql = new StringBuilder();
		sql.append("select wf_assign.assign_user as user_name, ");
		sql.append("wf_assign.assign_userid as user_id, ");
		sql.append("wf_assign.task_desc as send_msg, ");
		sql.append("sys_user.mob_code, ");
		sql.append("wf_assign.fun_id, ");
		sql.append("wf_assign.data_id, ");
		sql.append("wf_assign.assign_id as send_srcid ");
		sql.append("from wf_assign, sys_user, wf_task ");
		sql.append("where wf_assign.assign_userid = sys_user.user_id and wf_assign.task_id = wf_task.task_id ");
		sql.append("and wf_task.note_type = '1' and sys_user.mob_code > ' ' and wf_assign.task_id = ?");
		
		DaoParam param = _dao.createParam(sql.toString());
		param.addStringValue(taskId);
		return _dao.query(param);
	}
}
