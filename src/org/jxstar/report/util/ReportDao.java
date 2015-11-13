/*
 * ReportDao.java 2010-11-11
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.util;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.DmDaoUtil;
import org.jxstar.report.ReportException;
import org.jxstar.service.BoException;
import org.jxstar.service.util.WhereUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.log.Log;
import org.jxstar.util.resource.JsMessage;

/**
 * 报表定义信息查询工具类。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-11
 */
public class ReportDao {
	private static BaseDao _dao = BaseDao.getInstance();
	private static Log _log = Log.getInstance();
	
	//取报表定义相关表的所有字段
	private static String _field_head = DmDaoUtil.getFieldSql("rpt_head");
	private static String _field_list = DmDaoUtil.getFieldSql("rpt_list");
	private static String _field_area = DmDaoUtil.getFieldSql("rpt_area");
	private static String _field_detail = DmDaoUtil.getFieldSql("rpt_detail");
	
	/**
	 * 获取表头信息
	 * @param reportId -- 报表定义ID
	 * @return
	 */
	public static List<Map<String,String>> getHeadInfo(String reportId) {
		DaoParam param = _dao.createParam();
		param.setSql("select "+ _field_head +" from rpt_head where report_id = ? and col_pos > ' '");
		param.addStringValue(reportId);
		
		return _dao.query(param);
	}
	
	/**
	 * 构建主数据区域的完整sql
	 * @param funid -- 功能id
	 * @param reportId -- 报表id
	 * @param pageWhere --前台页面where
	 * @param userid -- 当前用户id
	 * @param querytype -- 高级查询 1、普通查询 0
	 * @return
	 */
	public static String getMainAreaSql(String funid, String reportId, 
							String pageWhere, String userid, String queryType) throws ReportException{
		StringBuilder ret = new StringBuilder();

		Map<String,String> mpMain = getMainArea(reportId);
		if (mpMain.isEmpty()) {//"没有定义报表主数据区域！"
			throw new ReportException(JsMessage.getValue("reportdao.hint01"));
		}
		
		//select部分
		ret.append(mpMain.get("data_sql"));

		//where部分
		String areaWhere = mpMain.get("data_where");
		String mainWhere = getWhereClause(areaWhere, pageWhere, funid, userid, queryType);
		if (mainWhere.length() > 0) {
			ret.append(" where " + mainWhere);
		}

		//group部分
		String areaGroup = mpMain.get("data_group").trim();
		if (areaGroup.length() > 0) {
			areaGroup = " group by " + areaGroup;
		}
		ret.append(areaGroup);

		//order部分
		String areaOrder = mpMain.get("data_order").trim();
		if (areaOrder.length() > 0) {
			areaOrder = " order by " + areaOrder;
		}
		ret.append(areaOrder);
		
		_log.showDebug("main area sql=" + ret.toString());

		return ret.toString();
	}
	
	/**
	 * 构建审批表单的SQL
	 * @param reportId -- 报表ID
	 * @param pageWhere -- 页面传递的SQL
	 * @return
	 */
	public static String getCheckMainSql(String reportId, String pageWhere) throws ReportException {
		StringBuilder ret = new StringBuilder();

		Map<String,String> mpMain = getMainArea(reportId);
		if (mpMain.isEmpty()) {//"没有定义报表主数据区域！"
			throw new ReportException(JsMessage.getValue("reportdao.hint01"));
		}
		//select部分
		ret.append(mpMain.get("data_sql"));

		//where部分
		String areaWhere = mpMain.get("data_where");
		if (areaWhere.length() > 0) {
			if (pageWhere.length() > 0) {
				areaWhere = "(" + areaWhere + ") and (" + pageWhere + ")";
			} 
		} else {
			if (pageWhere.length() > 0) {
				areaWhere = "(" + pageWhere + ")";
			}
		}
		if (areaWhere.length() > 0) {
			ret.append(" where " + areaWhere);
		}

		//group部分
		String areaGroup = mpMain.get("data_group").trim();
		if (areaGroup.length() > 0) {
			areaGroup = " group by " + areaGroup;
		}
		ret.append(areaGroup);

		//order部分
		String areaOrder = mpMain.get("data_order").trim();
		if (areaOrder.length() > 0) {
			areaOrder = " order by " + areaOrder;
		}
		ret.append(areaOrder);
		
		_log.showDebug("check main area sql=" + ret.toString());

		return ret.toString();
	}

	/**
	 * 构建主数据区域的where子句
	 * @param areaWhere -- 区域定义where
	 * @param pageWhere -- 前台页面where
	 * @param funid -- 功能id
	 * @param userid -- 当前用户id
	 * @param querytype -- 高级查询 1、普通查询 0
	 * @return
	 */
	private static String getWhereClause(String areaWhere, String pageWhere, 
			String funid, String userid, String queryType) {
		String baseWhere = areaWhere;
		
		if (areaWhere.length() > 0) {
			if (pageWhere.length() > 0) {
				baseWhere = "(" + baseWhere + ") and (" + pageWhere + ")";
			} 
		} else {
			if (pageWhere.length() > 0) {
				baseWhere = "(" + pageWhere + ")";
			}
		}
		
		//添加归档处理、数据权限、外部where
		String where = "";
		try {
			where = WhereUtil.systemWhere(funid, userid, baseWhere, queryType);
		} catch (BoException e) {
			_log.showError(e);
		}
		return where;
	}
	
	/**
	 * 取报表定义信息。
	 * @param reportId -- 报表定义ID
	 * @return
	 */
	public static Map<String,String> getReport(String reportId) {
		String sql = "select "+ _field_list +" from rpt_list where report_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(reportId);

		return _dao.queryMap(param);
	}
	
	/**
	 * 取当前功能的缺省报表
	 * @param funId
	 * @return
	 */
	public static String getDefReportId(String funId) {
		String sql = "select report_id from rpt_list where is_default = '1' and (fun_id like ? or fun_id = ?)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue("%," + funId + ",%");
		param.addStringValue(funId);

		Map<String,String> mp = _dao.queryMap(param);
		if (mp.isEmpty()) return "";
		
		return mp.get("report_id");
	}

	/**
	 * 获取报表主区域信息
	 * 
	 * @param reportId -- 报表定义ID
	 * @return 
	 */
	public static Map<String,String> getMainArea(String reportId) {
		String sql = "select "+ _field_area +" from rpt_area where report_id = ? and is_main = '1'";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(reportId);

		return _dao.queryMap(param);
	}

	/**
	 * 获取当前报表功能的所有子区域 
	 * 
	 * @param reportId -- 报表定义ID
	 * @return List
	 */
	public static List<Map<String,String>> getSubAreas(String reportId) {
		String sql = "select "+ _field_area +" from rpt_area where report_id = ? and is_main = '0'";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(reportId);

		return _dao.query(param);
	}
	
	/**
	 * 取子区域字段列表
	 * @param lsSubArea -- 所有子区域的定义信息
	 * @return
	 */
	public static Map<String, List<Map<String,String>>> getSubAreaCol(List<Map<String,String>> lsSubArea) {
		Map<String, List<Map<String,String>>> mpRet = FactoryUtil.newMap();

		for (int i = 0, n = lsSubArea.size(); i < n; i++) {
			String areaId = lsSubArea.get(i).get("area_id");

			mpRet.put(areaId, ReportDao.getAreaCol(areaId));
		}
		
		return mpRet;
	}
	
	/**
	 * 获取报表区域字段信息
	 * 
	 * @param areaId -- 区域ID
	 * @return List
	 */
	public static List<Map<String,String>> getAreaCol(String areaId) {
		String sql = "select "+ _field_detail +" from rpt_detail where area_id = ? and col_pos > ' '";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(areaId);

		return _dao.query(param);
	}
	
	/**
	 * 取审批信息报表输出定义
	 * @param areaId -- 区域ID
	 * @return List
	 */
	public static List<Map<String,String>> getAreaWfCol(String areaId) {
        String sql = "select process_id, node_id, col_code, col_pos, view_pos, format from rpt_detail_wf " +
        		"where area_id = ? and col_pos > ' ' order by process_id, node_id";
        DaoParam param = _dao.createParam(sql);
        param.addStringValue(areaId);

        return _dao.query(param);
    }
	
	/**
	 * 取图片定义字段
	 * @param areaId -- 区域ID
	 * @return List
	 */
	public static List<Map<String,String>> getImageCol(String areaId) {
        String sql = "select col_code, col_pos from rpt_detail where format = 'image' and " +
        		"is_show = '1' and area_id = ? order by col_index";
        DaoParam param = _dao.createParam(sql);
        param.addStringValue(areaId);

        return _dao.query(param);
    }			
	
	/**
	 * 取当前输出记录的审批信息
     * @param funId -- 功能ID
     * @param dataId -- 数据ID
     * @param processId -- 过程ID
     * @param nodeId -- 节点ID
     * @return Map
	 */
	public static List<Map<String,String>> getCheckInfo(String funId, String dataId, String processId, String nodeId) {
		List<Map<String,String>> lsData;
		//取子流程中的所有审批意见合并显示
		String subid = subProcessId(processId, nodeId);
		if (subid.length() > 0) {
			lsData = checkInfo(funId, dataId, subid, null, false);
	        lsData.addAll(checkInfo(funId, dataId, subid, null, true));
		} else {
			//取多人审批节点中的当前审批消息
			lsData = checkInfo(funId, dataId, processId, nodeId, false);
			//取审批历史消息
			lsData.addAll(checkInfo(funId, dataId, processId, nodeId, true));
		}
        
        return lsData;
	}
	private static List<Map<String,String>> checkInfo(String funId, String dataId, String processId, String nodeId, boolean isHis) {
	    String t1 = "wf_assign", t2 = "wf_task";
		if (isHis) {
			t1 = "wf_assignhis"; t2 = "wf_taskhis";
		}
		
		StringBuilder sbsql = new StringBuilder();
		sbsql.append("select ").append(t1).append(".check_userid, ").append(t1).append(".check_user, ").append(t1).append(".check_date, ").append(t1).append(".check_desc "); 
		sbsql.append("from ").append(t1).append(", ").append(t2).append(" where ").append(t1).append(".task_id = ").append(t2).append(".task_id and ").append(t1).append(".run_state = '1' and "); 
		sbsql.append(t1).append(".fun_id = ? and ").append(t1).append(".data_id = ? and ").append(t2).append(".process_id = ? ");
		//如果nodeId=null，则说明是取子流程所有节点的审批意见
		if (nodeId != null) {
			sbsql.append(" and ").append(t2).append(".node_id = ? ");
		}
		sbsql.append("order by ").append(t1).append(".check_date");
		
        DaoParam param = _dao.createParam(sbsql.toString());
        param.addStringValue(funId);
        param.addStringValue(dataId);
        param.addStringValue(processId);
        if (nodeId != null) {
        	param.addStringValue(nodeId);
        }
        
        return _dao.query(param);
	}
	
	//取子流程节点对应的子流程ID
	private static String subProcessId(String processId, String nodeId) {
		String sql = "select sub_processid from wf_subprocess where process_id = ? and node_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(processId);
		param.addStringValue(nodeId);
		
		Map<String,String> mpData = _dao.queryMap(param);
		if (mpData.isEmpty()) return "";
		
		return MapUtil.getValue(mpData, "sub_processid");
	}
	
	/**
	 * 取流程节点设置：是否显示个人签名、是否显示部门印章
	 * @param processId -- 过程ID
	 * @param nodeId -- 节点ID
	 * @return
	 */
	public static Map<String,String> getNodeAttr(String processId, String nodeId) {
		String sql = "select user_sign, dept_sign from wf_nodeattr where process_id = ? and node_id = ?";
        DaoParam param = _dao.createParam(sql);
        param.addStringValue(processId);
        param.addStringValue(nodeId);

        return _dao.queryMap(param);
	}
	
	/**
	 * 根据用户ID取部门ID
	 * @param userId -- 用户ID
	 * @return
	 */
	public static String getDeptId(String userId) {
		String sql = "select dept_id from sys_user where user_id = ?";
   	 	DaoParam param = _dao.createParam(sql);
        param.addStringValue(userId);
        
        Map<String,String> data = _dao.queryMap(param);
        if (data.isEmpty()) {
        	return "";
        }
        return data.get("dept_id");
	}
	
	/**
	 * 根据用户ID取用户编码
	 * @param userId -- 用户ID
	 * @return
	 */
	public static String getUserCode(String userId) {
		String sql = "select user_code from sys_user where user_id = ?";
   	 	DaoParam param = _dao.createParam(sql);
        param.addStringValue(userId);
        
        Map<String,String> data = _dao.queryMap(param);
        if (data.isEmpty()) {
        	return "";
        }
        return data.get("user_code");
	}
	
	/**
	 * 获取报表所有区域字段信息
	 * 
	 * @param reportId -- 报表定义ID
	 * @return List
	 */
	public static List<Map<String,String>> getReportCol(String reportId) {
		String sql = "select "+ _field_detail +" from rpt_detail where col_pos > ' ' and " +
					 "area_id in (select area_id from rpt_area where report_id = ?) ";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(reportId);

		return _dao.query(param);
	}
	
	/**
	 * 获取报表所有区域审批字段信息
	 * 
	 * @param reportId -- 报表定义ID
	 * @return List
	 */
	public static List<Map<String,String>> getReportWfCol(String reportId) {
		String sql = "select * from rpt_detail_wf where col_pos > ' ' and " +
					 "area_id in (select area_id from rpt_area where report_id = ?) ";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(reportId);

		return _dao.query(param);
	}
	
	/**
	 * 取数据区域第一行的数据位置
	 * @param areaId -- 区域ID
	 * @return
	 */
	public static String getColRows(String areaId) {
		String sql = "select col_pos from rpt_detail where col_pos > ' ' and area_id = ? ";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(areaId);

		Map<String,String> mp = _dao.queryMap(param);
		return MapUtil.getValue(mp, "col_pos");
	}

	/**
	 * 获取报表区域统计字段信息
	 * 
	 * @param areaId
	 * @return List
	 */
	public static List<Map<String,String>> getAreaTotalCol(String areaId) {
		String sql = "select "+ _field_detail +" from rpt_detail where area_id = ? and is_stat = '1'";
		_log.showDebug("get area total col sql = " + sql);

		DaoParam param = _dao.createParam(sql);
		param.addStringValue(areaId);

		return _dao.query(param);
	}
	
	/**
	 * 是否为领导
	 * @param userId
	 * @return
	 */
	public static boolean isLeader(String userId) {
    	String sql = "select is_leader from sys_user where user_id = ?";
    	DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);

		Map<String,String> mp = _dao.queryMap(param);
		String isleader = MapUtil.getValue(mp, "is_leader", "0");
		
		return isleader.equals("1");
    }
}
