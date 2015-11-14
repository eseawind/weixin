/*
 * WfProcessBO.java 2011-1-26
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.studio;

import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.dao.DmDao;
import org.jxstar.security.SafeManager;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.define.DefineDataManger;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.define.WfDefineDao;
import org.jxstar.wf.util.ProcessUtil;

/**
 * 过程定义处理类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-26
 */
public class WfProcessBO extends BusinessObject {
	private static final long serialVersionUID = 6302910111501891823L;

	/**
	 * 删除所有过程定义信息
	 * @param processId -- 过程定义ID
	 * @return
	 */
	public String deleteWf(String processId) {
		WfDefineDao define = WfDefineDao.getInstance();
		Map<String,String> mpProcess = define.queryProcess(processId);
		String state = mpProcess.get("process_state");
		if (!state.equals("1")) {//"当前过程定义不是“定义”，不能删除！"
			setMessage(JsMessage.getValue("wfprocessbo.hint01"));
			return _returnFaild;
		}
		
		String fkWhere = "process_id = '"+ processId +"'";
		if (!DmDao.deleteByWhere("wf_design", fkWhere) || 
			!DmDao.deleteByWhere("wf_user", fkWhere) || 
			!DmDao.deleteByWhere("wf_nodeattr", fkWhere) || 
			!DmDao.deleteByWhere("wf_node", fkWhere) || 
			!DmDao.deleteByWhere("wf_line", fkWhere) || 
			!DmDao.deleteByWhere("wf_subprocess", fkWhere) || 
			!DmDao.deleteByWhere("wf_condition", fkWhere) || 
			!DmDao.deleteByWhere("wf_process", fkWhere)) {
			//"删除过程定义及所有相关信息出错！"
			setMessage(JsMessage.getValue("wfprocessbo.error01"));
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 启用流程：
	 * 先检查流程的合法性；然后修改流程状态为生效；
	 * @param processId -- 过程定义ID
	 * @param userId -- 用户ID
	 * @param userName -- 用户名
	 * @param oldProcessId -- 原版过程，如果新版启用原版需要注销
	 * @return
	 */
	public String enableWf(String processId, String userId, String userName, String oldProcessId) {
		//先检查过程定义的状态，如果已经生效，则不需要修改，
		WfDefineDao define = WfDefineDao.getInstance();
		Map<String,String> mpProcess = define.queryProcess(processId);
		String state = mpProcess.get("process_state");
		if (state.equals("2")) {//"当前过程不需要启用，已经是“生效”状态！"
			setMessage(JsMessage.getValue("wfprocessbo.hint02"));
			return _returnFaild;
		}
		if (state.equals("3")) {
			if (hasOldProcess(processId)) {//"当前过程是历史版本，不能启用为“生效”状态！"
				setMessage(JsMessage.getValue("wfprocessbo.hint04"));
				return _returnFaild;
			}
		}
		
		//----------------------------许可检测-----------------------------
		SafeManager safe = SafeManager.getInstance();
		String verName = safe.getVerName();
		//学习版不检测合法性，其它版本都检测
		if (!verName.equals("SE")) {
			int code = safe.checkCode();
			if (code > 0) {
				setMessage(JsMessage.getValue("license.notvalid"), code);
				return _returnFaild;
			}
		}
		//企业版不控制注册数，其它版本都控制
		if (!verName.equals("EE")) {
			int flowNum = safe.getNum(2);//注册流程数
			int regNum = ProcessUtil.getFlowNum();
			if (flowNum < regNum) {
				setMessage(JsMessage.getValue("license.flownum", flowNum));
				return _returnFaild;
			}
		}
		//-----------------------------------------------------------------
		
		//先验证流程的合法性
		WfCheckBO check  = new WfCheckBO();
		if (check.checkProcess(processId).equals(_returnFaild)) {
			setMessage(check.getMessage());
			return _returnFaild;
		}
		
		//修改流程状态
		String sql = "update wf_process set process_state = '2', modify_userid = ?, modify_date = ?, " +
				"chg_user = ?, chg_date = ? where process_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(userName);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(processId);
		if (!_dao.update(param)) {//"启用过程定义失败！"
			setMessage(JsMessage.getValue("wfprocessbo.error02"));
			return _returnFaild;
		}
		
		if (oldProcessId != null && oldProcessId.length() > 0) {
			disableWf(oldProcessId, userId, userName);
		}
		
		//修改功能定义的记录有效值为“3”，表示审批通过
		updateFunValid(mpProcess.get("fun_id"), "3");
		
		return _returnSuccess;
	}
	
	/**
	 * 禁用过程定义
	 * @param processId -- 过程定义ID
	 * @param userId -- 用户ID
	 * @param userName -- 用户名
	 * @return
	 */
	public String disableWf(String processId, String userId, String userName) {
		if (hasInstance(processId)) {//当前过程有正在运行的实例，不能禁用！
			setMessage(JsMessage.getValue("wfprocessbo.hint05"));
			return _returnFaild;
		}
		
		//修改流程状态
		String sql = "update wf_process set process_state = '3', modify_userid = ?, modify_date = ?, " +
				"chg_user = ?, chg_date = ? where process_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(userName);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(processId);
		if (!_dao.update(param)) {//"禁用过程定义失败！"
			setMessage(JsMessage.getValue("wfprocessbo.error03"));
			return _returnFaild;
		}
		
		WfDefineDao define = WfDefineDao.getInstance();
		Map<String,String> mpProcess = define.queryProcess(processId);
		String funId = mpProcess.get("fun_id");
		//修改功能定义的记录有效值为“1”，表示已复核
		updateFunValid(funId, "1");
		
		return _returnSuccess;
	}
	
	/**
	 * 修改功能的记录有效值，同时清除缓存
	 * @param funId -- 功能定义对象
	 * @param flag -- 有效值：1|3，1表示已复核，3表示审批通过
	 * @return
	 */
	private boolean updateFunValid(String funId, String flag) {
		//清除缓存
		DefineDataManger mgr = DefineDataManger.getInstance();
		mgr.clearFunData(funId);
		
		//修改状态
		String usql = "update fun_base set valid_flag = ?, modify_date = ?, modify_userid = 'wf_process' where fun_id = ?";
		DaoParam uparam = _dao.createParam(usql);
		uparam.addStringValue(flag);
		uparam.addDateValue(DateUtil.getTodaySec());
		uparam.addStringValue(funId);
		
		return _dao.update(uparam);
	}
	
	/**
	 * 查询指定过程是否为历史版本
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private boolean hasOldProcess(String processId) {
		String sql = "select count(*) as cnt from wf_process where old_processid = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
	
	/**
	 * 检查过程定义是否产生了实例
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private boolean hasInstance(String processId) {
		String sql = "select count(*) as cnt from wf_instance where process_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mpCnt);
	}
}
