/*
 * WfCheckBO.java 2011-1-26
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.MapUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.define.WfDefineDao;

/**
 * 过程定义合法性验证类，验证内容有：
 * 1、是否保存了设计文件；
 * 2、所有任务节点的属性是否定义；
 * 3、节点属性的分配用户是否定义；
 * 4、判断节点与并发节点的流出线是否定义了判断条件；
 * 5、子过程是否定义了属性；
 *
 * @author TonyTan
 * @version 1.0, 2011-1-26
 */
public class WfCheckBO extends BusinessObject {
	private static final long serialVersionUID = -5512154286150010545L;

	/**
	 * 后台验证过程定义的合法性
	 * @param processId -- 过程定义ID
	 * @return
	 * @throws WfException
	 */
	public String checkProcess(String processId) {
		if (!hasSaveDesign(processId)) {//"当前过程没有设计文件！"
			setMessage(JsMessage.getValue("wfcheckbo.nofile"));
			return _returnFaild;
		}
		
		if (hasNoNodeAttr(processId)) {//"存在没有定义属性的任务节点！"
			setMessage(JsMessage.getValue("wfcheckbo.nonode"));
			return _returnFaild;
		}
		
		if (hasNoNodeUser(processId)) {//"存在没有分配用户的节点任务属性！"
			setMessage(JsMessage.getValue("wfcheckbo.noattr"));
			return _returnFaild;
		}
		
		if (hasNoCustom(processId)) {//"存在没有自定义类的节点任务属性！"
			setMessage(JsMessage.getValue("wfcheckbo.noclass"));
			return _returnFaild;
		}
		
		if (hasNoSubProcess(processId)) {//"存在没有定义属性的子过程节点！"
			setMessage(JsMessage.getValue("wfcheckbo.nosub"));
			return _returnFaild;
		}
		
		if (hasSameSubId(processId)) {//"存在子过程节点属性中的子过程ID与所属过程ID相同的问题！"
			setMessage(JsMessage.getValue("wfcheckbo.idequal"));
			return _returnFaild;
		}
		
		if (hasNoCondition(processId)) {//"存在判断节点的流出线没有定义判断条件！"
			setMessage(JsMessage.getValue("wfcheckbo.nocond"));
			return _returnFaild;
		}
		
		String userName = notRightUser(processId);
		if (userName.length() > 0) {//"下列分配用户没有功能操作权限：{0}！"
			setMessage(JsMessage.getValue("wfcheckbo.noright"), userName);
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 取没有功能操作权限的用户名。
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private String notRightUser(String processId) {
		WfDefineDao define = WfDefineDao.getInstance();
		Map<String,String> mpProcess = define.queryProcess(processId);
		String funId = mpProcess.get("fun_id");
		if (funId == null || funId.length() == 0) return "";
		
		//查询没有功能审批操作权限的用户
		String sql = "select user_id, user_name from wf_user where process_id = ? and " +
				"not exists (select * from sys_user_role, sys_role_fun where " +
				"sys_user_role.role_id = sys_role_fun.role_id and " +
				"sys_role_fun.is_audit = '1' and sys_role_fun.fun_id = ? and " +
				"sys_user_role.user_id = wf_user.user_id)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(funId);
		
		List<Map<String,String>> lsUser = _dao.query(param);
		if (lsUser.isEmpty()) return "";
		
		StringBuilder sbUser = new StringBuilder();
		for (int i = 0, n = lsUser.size(); i < n; i++) {
			Map<String,String> mpUser = lsUser.get(i);
			
			String userName = mpUser.get("user_name");
			sbUser.append(userName).append("; ");
		}
		
		return sbUser.toString();
	}
	
	/**
	 * 是否存在判断节点的流出线没有定义判断条件，返回true表示存在，否则不存在。
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private boolean hasNoCondition(String processId) {
		String sql = "select count(*) as cnt from wf_line where process_id = ? " +
				"and source_id in (select node_id from wf_node where node_type = 'select' and process_id = ?) " +
				"and line_id not in (select line_id from wf_condition where process_id = ?)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(processId);
		param.addStringValue(processId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
	
	/**
	 * 是否存在没有定义属性的子过程节点，返回true表示存在，否则不存在。
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private boolean hasNoSubProcess(String processId) {
		String sql = "select count(*) as cnt from wf_node where node_type = 'subprocess' and " +
				"process_id = ? and node_id not in (select node_id from wf_subprocess where process_id = ?)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(processId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
	
	/**
	 * 是否存在子过程节点的子过程ID与过程ID相同的问题，返回true表示存在，否则不存在。
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private boolean hasSameSubId(String processId) {
		String sql = "select count(*) as cnt from wf_subprocess where process_id = sub_processid and process_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
	
	/**
	 * 是否存在没有分配用户的节点任务属性，返回true表示存在，否则不存在。
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private boolean hasNoNodeUser(String processId) {
		String sql = "select count(*) as cnt from wf_nodeattr where assign_rule = 'user' and process_id = ? and " +
				"nodeattr_id not in (select nodeattr_id from wf_user where process_id = ?)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(processId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
	
	/**
	 * 判断是否存在没有自定义类的节点任务属性
	 * @param processId
	 * @return
	 */
	private boolean hasNoCustom(String processId) {
		String sql = "select custom_class from wf_nodeattr where assign_rule in ('class', 'sql') and process_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		List<Map<String,String>> lsData = _dao.query(param);
		
		if (lsData.isEmpty()) return false;
		
		for (int i = 0, n = lsData.size(); i < n; i++) {
			String customCls = MapUtil.getValue(lsData.get(i), "custom_class");
			if (customCls.length() == 0) return true;
		}
		
		return false;
	}
	
	/**
	 * 是否存在没有定义属性的任务节点，如果返回true表示存在，否则不存在。
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private boolean hasNoNodeAttr(String processId) {
		String sql = "select count(*) as cnt from wf_node where node_type = 'task' and " +
				"process_id = ? and node_id not in (select node_id from wf_nodeattr where process_id = ?)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(processId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
	
	/**
	 * 是否保存了设计文件，如果返回true表示已经保存，否则没保存。
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private boolean hasSaveDesign(String processId) {
		String sql = "select count(*) as cnt from wf_design where process_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
}
