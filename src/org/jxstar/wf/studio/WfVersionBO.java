/*
 * WfVersionBO.java 2011-1-26
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DmDao;
import org.jxstar.dao.util.BigFieldUtil;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.DateUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;

/**
 * 构建新版流程定义与复制流程定义处理类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-26
 */
public class WfVersionBO extends BusinessObject {
	private static final long serialVersionUID = -7305409999932933975L;

	/**
	 * 创建新版本流程
	 * @param processId -- 过程定义ID
	 * @param mpUser -- 用户信息
	 * @return
	 */
	public String newVersion(String processId, Map<String,String> mpUser) {
		String userId = mpUser.get("user_id");
		
		String newProcessId = newVersionProcess(processId, mpUser);
		if (newProcessId.length() == 0) {//"创建新版过程记录失败！"
			setMessage(JsMessage.getValue("wfversionbo.error01"));
			return _returnFaild;
		}
		
		return copyAllSub(processId, newProcessId, userId);
	}
	
	/**
	 * 创建复制过程定义
	 * @param processId -- 过程定义ID
	 * @param mpUser -- 用户信息
	 * @return
	 */
	public String copyProcess(String processId, Map<String,String> mpUser) {
		String userId = mpUser.get("user_id");
		
		Map<String,String> repData = FactoryUtil.newMap();
		//过程状态为定义
		repData.put("process_state", "1");
		//原版过程ID清空
		repData.put("old_processid", "");
		//变更人与变更日期
		repData.put("chg_user", mpUser.get("user_name"));
		repData.put("chg_date", DateUtil.getTodaySec());
		repData.put("add_userid", mpUser.get("user_id"));
		repData.put("add_date", DateUtil.getTodaySec());
		
		//添加过程编码复制标志
		Map<String,String> mpData = DmDao.queryMap("wf_process", processId);
		String processCode = mpData.get("process_code");
		repData.put("process_code", processCode+"-");
		
		String newProcessId = DmDao.copy("wf_process", processId, repData);
		if (newProcessId.length() == 0) {//"复制过程记录失败！"
			setMessage(JsMessage.getValue("wfversionbo.error02"));
			return _returnFaild;
		}
		
		return copyAllSub(processId, newProcessId, userId);
	}
	
	/**
	 * 复制过程定义子表记录
	 * @param processId -- 过程定义ID
	 * @param newProcessId -- 新过程定义ID
	 * @param userId -- 用户ID
	 * @return
	 */
	private String copyAllSub(String processId, String newProcessId, String userId) {
		if (!copySubData(processId, newProcessId, userId, "wf_node", "wfnode_id")) {
			setMessage(JsMessage.getValue("wfversionbo.error03"));//"复制节点信息失败！"
			return _returnFaild;
		}
		
		if (!copySubData(processId, newProcessId, userId, "wf_nodeattr", "nodeattr_id")) {
			setMessage(JsMessage.getValue("wfversionbo.error04"));//"复制节点属性信息失败！"
			return _returnFaild;
		}
		
		if (!copySubData(processId, newProcessId, userId, "wf_line", "wfline_id")) {
			setMessage(JsMessage.getValue("wfversionbo.error05"));//"复制流转信息失败！"
			return _returnFaild;
		}
		
		if (!copySubData(processId, newProcessId, userId, "wf_condition", "condition_id")) {
			setMessage(JsMessage.getValue("wfversionbo.error06"));//"复制流转判断条件信息失败！"
			return _returnFaild;
		}
		
		if (!copySubData(processId, newProcessId, userId, "wf_subprocess", "wfsub_id")) {
			setMessage(JsMessage.getValue("wfversionbo.error07"));//"复制子过程属性信息失败！"
			return _returnFaild;
		}
		
		if (!copyDesign(processId, newProcessId, userId)) {
			setMessage(JsMessage.getValue("wfversionbo.error08"));//"复制过程设计文件失败！"
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 复制过程设计文件
	 * @param processId -- 原过程ID
	 * @param newProcessId -- 新过程ID
	 * @param userId -- 用户ID
	 * @return
	 */
	private boolean copyDesign(String processId, String newProcessId, String userId) {
		//替换复制记录中的过程ID
		Map<String,String> repData = FactoryUtil.newMap();
		repData.put("process_id", newProcessId);
		repData.put("add_userid", userId);
		repData.put("add_date", DateUtil.getTodaySec());
		
		String newId = DmDao.copy("wf_design", processId, repData);
		if (newId.length() == 0) return false;
		
		//取原过程设计文件
		String sql = "select process_file from wf_design where process_id = '"+ processId +"'";
		String xmlfile = BigFieldUtil.readStream(sql, "process_file", "default");
		
		//保存到新的过程设计文件中
		String usql = "update wf_design set process_file = ? where process_id = '"+ newProcessId +"'";
		return BigFieldUtil.updateStream(usql, xmlfile, "default");
	}
	
	/**
	 * 复制过程定义子表记录
	 * @param processId -- 过程定义ID
	 * @param newProcessId -- 新过程定义ID
	 * @param userId -- 用户ID
	 * @return
	 */
	private boolean copySubData(String processId, String newProcessId, String userId,
			String tableName, String keyField) {
		//替换复制记录中的过程ID
		Map<String,String> repData = FactoryUtil.newMap();
		repData.put("process_id", newProcessId);
		repData.put("add_userid", userId);
		repData.put("add_date", DateUtil.getTodaySec());
		
		//取指定过程指定子表的记录
		List<Map<String,String>> lsData = DmDao.query(tableName, "process_id = '"+ processId +"'");
		
		//复制每条记录
		for (int i = 0, n = lsData.size(); i < n; i++) {
			Map<String,String> mpData = lsData.get(i);
			
			String dataId = mpData.get(keyField);
			
			String newDataId = DmDao.copy(tableName, dataId, repData);
			if (newDataId.length() == 0) {
				_log.showDebug("---------tableName=" + tableName + "; dataId=" + dataId);
				return false;
			}
			
			//复制任务分配信息
			if (tableName.equals("wf_nodeattr")) {
				if (!copyUser(dataId, newDataId, newProcessId, userId)) {
					return false;
				}
			}
		}
		
		return true;
	}
	
	/**
	 * 复制用户分配信息
	 * @param nodeattrId -- 原任务属性ID
	 * @param newNodeattrId -- 新任务属性ID
	 * @param newProcessId -- 新过程ID
	 * @param userId -- 用户ID
	 * @return
	 */
	private boolean copyUser(String nodeattrId, String newNodeattrId, String newProcessId, String userId) {
		//替换复制记录中的过程ID
		Map<String,String> repData = FactoryUtil.newMap();
		repData.put("process_id", newProcessId);
		repData.put("nodeattr_id", newNodeattrId);
		repData.put("add_userid", userId);
		repData.put("add_date", DateUtil.getTodaySec());
		
		//取指定分配用户记录
		List<Map<String,String>> lsUser = DmDao.query("wf_user", "nodeattr_id = '"+ nodeattrId +"'");
		
		//复制每条记录
		for (int i = 0, n = lsUser.size(); i < n; i++) {
			Map<String,String> mpUser = lsUser.get(i);
			
			String wfuserId = mpUser.get("wfuser_id");
			
			String newId = DmDao.copy("wf_user", wfuserId, repData);
			if (newId.length() == 0) {
				return false;
			}
		}
		
		return true;
	}
	
	/**
	 * 复制新版本的过程定义信息
	 * @param processId -- 过程定义ID
	 * @param mpUser -- 用户信息
	 * @return
	 */
	private String newVersionProcess(String processId, Map<String,String> mpUser) {
		Map<String,String> repData = FactoryUtil.newMap();
		//取新版本号
		repData.put("version_no", newVersionNo(processId));
		//过程状态为定义
		repData.put("process_state", "1");
		//记录原版过程ID
		repData.put("old_processid", processId);
		//变更人与变更日期
		repData.put("chg_user", mpUser.get("user_name"));
		repData.put("chg_date", DateUtil.getTodaySec());
		repData.put("add_userid", mpUser.get("user_id"));
		repData.put("add_date", DateUtil.getTodaySec());
		
		return DmDao.copy("wf_process", processId, repData);
	}
	
	/**
	 * 取新版本号，累加 1
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private String newVersionNo(String processId) {
		Map<String,String> mpData = DmDao.queryMap("wf_process", processId);
		
		String versionNo = mpData.get("version_no");
		int newNo = Integer.parseInt(versionNo) + 1;
		return Integer.toString(newNo);
	}
}
