/*
 * WfDesignBO.java 2011-1-23
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.studio;

import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.util.BigFieldUtil;
import org.jxstar.security.SafeManager;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringUtil;
import org.jxstar.util.key.KeyCreator;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.util.ProcessUtil;

/**
 * 工作流定义业务处理类。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-23
 */
public class WfDesignBO extends BusinessObject {
	private static final long serialVersionUID = 6302910111501891823L;

	/**
	 * 读取工作流设计文件
	 * @param processId -- 工作流定义ID
	 * @return
	 */
	public String readDesign(String processId) {
		String sql = "select process_file from wf_design where process_id = '"+ processId +"'";
		String fieldName = "process_file";
		String dsName = "default";
		
		String xmlfile = BigFieldUtil.readStream(sql, fieldName, dsName);
		//_log.showDebug("---------xmlfile:" + xmlfile);
		
		if (xmlfile != null && xmlfile.length() > 0) {
			xmlfile = "<?xml version='1.0' encoding='utf-8'?>" + xmlfile;
			setReturnData(xmlfile);
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 保存工作流设计信息：
	 * 需要保存节点设计信息；流转设计信息；设计文件信息；
	 * @param -- 前台请求信息
	 */
	public String saveDesign(RequestContext request) {
		String userId = request.getUserInfo().get("user_id");
		String processId = request.getRequestValue("process_id");
		
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

		String[] nodeIds = getValues(request, "nodeIds");
		String[] nodeTypes = getValues(request, "nodeTypes");
		String[] nodeTitles = getValues(request, "nodeTitles");
		
		//先删除原来的节点信息，再新增所有节点信息
		if (!deleteDefine(processId, "wf_node")) {//"保存前删除原节点信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error01"));
			return _returnFaild;
		}
		
		if (!insertNodes(processId, userId, nodeIds, nodeTypes, nodeTitles)) {
			setMessage(JsMessage.getValue("wfdesignbo.error02"));//"保存新节点信息失败！"
			return _returnFaild;
		}
		
		String[] lineIds = getValues(request, "lineIds");
		String[] lineTypes = getValues(request, "lineTypes");
		String[] lineTitles = getValues(request, "lineTitles");
		String[] lineSources = getValues(request, "lineSources");
		String[] lineTargets = getValues(request, "lineTargets");

		//先删除原来的流转信息，再新增所有流转点信息
		if (!deleteDefine(processId, "wf_line")) {//"保存前删除原流转信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error03"));
			return _returnFaild;
		}
		
		if (!insertLines(processId, userId, lineIds, lineTypes, lineTitles, 
						 lineSources, lineTargets)) {//"保存新流转信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error04"));
			return _returnFaild;
		}
		
		//整理wf_nodeattr, wf_user, wf_condition中没有图形元素的信息
		if (!deleteOther(processId)) {//"删除没有对应图形元素的设置信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error05"));
			return _returnFaild;
		}
		
		String xmlfile = request.getRequestValue("xmlfile");
		_log.showDebug("xmlfile=" + xmlfile);
		if (!saveDesignFile(processId, userId, xmlfile)) {//"保存流转设计文件失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error06"));
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 删除所有设计信息与定义信息
	 * @param processId -- 过程定义ID
	 * @return
	 */
	public String deleteDesign(String processId) {
		if (!deleteDefine(processId, "wf_condition")) {//"删除条件判断信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error07"));
			return _returnFaild;
		}
		
		if (!deleteDefine(processId, "wf_user")) {//"删除任务分配信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error08"));
			return _returnFaild;
		}
		
		if (!deleteDefine(processId, "wf_nodeattr")) {//"删除任务属性信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error09"));
			return _returnFaild;
		}
		
		if (!deleteDefine(processId, "wf_subprocess")) {//"删除子过程信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error10"));
			return _returnFaild;
		}
		
		if (!deleteDefine(processId, "wf_node")) {//"删除节点元素信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error11"));
			return _returnFaild;
		}
		
		if (!deleteDefine(processId, "wf_line")) {//"删除流转元素信息失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error12"));
			return _returnFaild;
		}
		
		if (!deleteDefine(processId, "wf_design")) {//"删除图形设计文件失败！"
			setMessage(JsMessage.getValue("wfdesignbo.error13"));
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 保存工作流设计文件
	 * @param processId -- 工作流定义ID
	 * @param userId -- 当前用户ID
	 * @param xmlfile -- 工作流文件
	 * @return
	 */
	private boolean saveDesignFile(String processId, String userId, String xmlfile) {
		String csql = "select count(*) as cnt from wf_design where process_id = ?";
		DaoParam param = _dao.createParam(csql);
		param.addStringValue(processId);
		Map<String,String> mpCnt = _dao.queryMap(param);
		
		//如果没有设计文件，则新增设计记录
		if (!MapUtil.hasRecord(mpCnt)) {
			if (!insertDesignFile(processId, userId)) return false;
		} else {
			String usql = "update wf_design set modify_date = ?, modify_userid = ? where process_id = ?";
			DaoParam uparam = _dao.createParam(usql);
			uparam.addDateValue(DateUtil.getTodaySec());
			uparam.addStringValue(userId);
			uparam.addStringValue(processId);
			
			if (!_dao.update(uparam)) return false;
		}
		
		//保存设计文件
		String usql = "update wf_design set process_file = ? where process_id = '"+ processId +"'";
		BigFieldUtil.updateStream(usql, xmlfile, "default");
		
		return true;
	}
	
	/**
	 * 新增设计文件
	 * @param processId -- 过程ID
	 * @param userId -- 新增用户ID
	 * @return
	 */
	private boolean insertDesignFile(String processId, String userId) {
		String isql = "insert into wf_design(design_id, process_id, add_userid, add_date) " +
					  "values(?, ?, ?, ?)";
		DaoParam param = _dao.createParam(isql);
		String keyId = KeyCreator.getInstance().createKey("wf_design");
		param.addStringValue(keyId);
		param.addStringValue(processId);
		param.addStringValue(userId);
		param.addDateValue(DateUtil.getTodaySec());
		
		return _dao.update(param);
	}
	
	/**
	 * 删除指定流程的指定表的定义信息
	 * @param processId -- 过程定义ID
	 * @param tableName -- 指定定义表
	 * @return
	 */
	private boolean deleteDefine(String processId, String tableName) {
		String sql = "delete from "+ tableName +" where process_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		return _dao.update(param);
	}
	
	/**
	 * 删除没有对应图形元素的设置信息
	 * @param processId -- 过程定义ID
	 * @return
	 */
	private boolean deleteOther(String processId) {
		//删除任务属性信息
		String sql1 = "delete from wf_nodeattr where process_id = ? and node_id not in " +
					  "(select node_id from wf_node where process_id = ?)";
		DaoParam param1 = _dao.createParam(sql1);
		param1.addStringValue(processId);
		param1.addStringValue(processId);
		if (!_dao.update(param1)) return false;
		
		//删除任务分配信息
		String sql = "delete from wf_user where process_id = ? and nodeattr_id not in " +
					 "(select nodeattr_id from wf_nodeattr where process_id = ?)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(processId);
		if (!_dao.update(param)) return false;
		
		//删除条件判断信息
		String sql2 = "delete from wf_condition where process_id = ? and line_id not in " +
					  "(select line_id from wf_line where process_id = ?)";
		DaoParam param2 = _dao.createParam(sql2);
		param2.addStringValue(processId);
		param2.addStringValue(processId);
		if (!_dao.update(param2)) return false;
		
		//删除子过程设置信息
		String sql3 = "delete from wf_subprocess where process_id = ? and node_id not in " +
					  "(select node_id from wf_node where process_id = ?)";
		DaoParam param3 = _dao.createParam(sql3);
		param3.addStringValue(processId);
		param3.addStringValue(processId);
		if (!_dao.update(param3)) return false;
		
		return true;
	}
	
	/**
	 * 新增节点元素信息
	 * @param processId -- 过程定义ID
	 * @param userId -- 新增用户ID
	 * @param nodeIds -- 节点ID数组
	 * @param nodeTypes -- 节点类型数组
	 * @param nodeTitles -- 节点标题数组
	 * @return
	 */
	private boolean insertNodes(String processId, String userId, 
			String[] nodeIds, String[] nodeTypes, String[] nodeTitles) {
		KeyCreator key = KeyCreator.getInstance();
		String sql = "insert into wf_node(wfnode_id, process_id, node_id, node_type, node_title, " +
					 "add_userid, add_date) values(?, ?, ?, ?, ?, ?, ?)";
		
		DaoParam param = _dao.createParam(sql);
		for (int i = 0, n = nodeIds.length; i < n; i++) {
			param.clearParam();
			
			String keyValue = key.createKey("wf_node");
			param.addStringValue(keyValue);
			param.addStringValue(processId);
			param.addStringValue(nodeIds[i]);
			param.addStringValue(nodeTypes[i]);
			param.addStringValue(nodeTitles[i]);
			param.addStringValue(userId);
			param.addDateValue(DateUtil.getTodaySec());
			
			if (!_dao.update(param)) return false;
		}
		
		return true;
	}
	
	/**
	 * 新增流转元素信息
	 * @param processId -- 过程定义ID
	 * @param userId -- 新增用户ID
	 * @param lineIds -- 流转ID数组
	 * @param lineTypes -- 流转类型数组
	 * @param lineTitles -- 流转标题数组
	 * @param lineSources -- 来源节点数组
	 * @param lineTargets -- 目标节点数组
	 * @return
	 */
	private boolean insertLines(String processId, String userId, 
			String[] lineIds, String[] lineTypes, String[] lineTitles, 
			String[] lineSources, String[] lineTargets) {
		KeyCreator key = KeyCreator.getInstance();
		String sql = "insert into wf_line(wfline_id, process_id, line_id, line_type, line_title, " +
					 "source_id, target_id, add_userid, add_date) values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
		
		DaoParam param = _dao.createParam(sql);
		for (int i = 0, n = lineIds.length; i < n; i++) {
			param.clearParam();
			
			String keyValue = key.createKey("wf_line");
			param.addStringValue(keyValue);
			param.addStringValue(processId);
			param.addStringValue(lineIds[i]);
			param.addStringValue(lineTypes[i]);
			param.addStringValue(lineTitles[i]);
			param.addStringValue(lineSources[i]);
			param.addStringValue(lineTargets[i]);
			param.addStringValue(userId);
			param.addDateValue(DateUtil.getTodaySec());
			
			if (!_dao.update(param)) return false;
		}
		
		return true;
	}
	
	/**
	 * 取图形元素参数值
	 * @param request
	 * @param paramName
	 * @return
	 */
	private String[] getValues(RequestContext request, String paramName) {
		String value = request.getRequestValue(paramName);
		String[] values = StringUtil.split(value, ",");
		return values;
	}
}
