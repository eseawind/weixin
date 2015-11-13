package org.jxstar.total.util;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.DmDaoUtil;

/**
 * 处理统计报表相关的DAO
 *
 * @author TonyTan
 * @version 1.0, 2011-11-30
 */
public class TotalDao {
	private static BaseDao _dao = BaseDao.getInstance();
	
	//取报表定义相关表的所有字段
	private static String _field_list = DmDaoUtil.getFieldSql("rpt_list");
	private static String _field_area = DmDaoUtil.getFieldSql("rpt_area");
	private static String _field_param = DmDaoUtil.getFieldSql("rpt_param");
	private static String _field_detail = DmDaoUtil.getFieldSql("rpt_detail");

	/**
	 * 取统计报表定义信息
	 * @param funId -- 功能ID
	 * @return
	 */
	public static Map<String,String> queryReport(String funId) {
		String sql = "select "+ _field_list +" from rpt_list where (fun_id like ? or fun_id = ?)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue("%," + funId + ",%");
		param.addStringValue(funId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 查询统计区域定义信息
	 * @param reportId -- 报表定义ID
	 * @param type -- 区域分类[assort|query|cross]
	 * @return
	 */
	public static List<Map<String,String>> queryTotalArea(String reportId, String type) {
		String sql = "select "+ _field_area +" from rpt_area where report_id = ? and area_type = ? order by area_index";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(reportId);
		param.addStringValue(type);
		
		return _dao.query(param);
	}
	
	/**
	 * 查询统计区域定义信息
	 * @param reportId -- 报表定义ID
	 * @return
	 */
	public static List<Map<String,String>> queryArea(String reportId) {
		String sql = "select "+ _field_area +" from rpt_area where report_id = ? order by area_index";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(reportId);
		
		return _dao.query(param);
	}
	
	/**
	 * 取查询统计区域参数
	 * @param areaId -- 区域定义ID
	 * @return
	 */
	public static Map<String,String> queryOneArea(String areaId) {
		String sql = "select "+ _field_area +" from rpt_area where area_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(areaId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 查询统计字段定义信息
	 * @param areaId -- 区域定义ID
	 * @return
	 */
	public static List<Map<String,String>> queryDetail(String areaId) {
		String sql = "select "+ _field_detail +" from rpt_detail where area_id = ? order by col_index";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(areaId);
		
		return _dao.query(param);
	}
	
	/**
	 * 获取统计参数
	 * @param areaId
	 * @return
	 */
	public static List<Map<String,String>> queryTotalParam(String areaId) {
		String sql = "select "+ _field_param +" from rpt_param where area_id = ? order by param_index";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(areaId);
		
		return _dao.query(param);
	}
	
	/**
	 * 取得区域的统计字段
	 * @param areaId
	 * @return
	 */
	public static List<Map<String,String>> queryTotalField(String areaId) {
		String sql = "select "+ _field_detail +" from rpt_detail where (format = 'int' or  format like 'number%') " +
				"and area_id = ? order by col_index";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(areaId);
		
		return _dao.query(param);
	}
	
	/**
	 * 获取数据钻取定义信息
	 * @param areaId
	 * @return
	 */
	public static Map<String,String> queryDrill(String areaId) {
		String sql = "select where_sql, where_type, where_value, fun_id from rpt_drill where area_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(areaId);
		
		return _dao.queryMap(param);
	}
	
	/**
	 * 获取该区域需要显示的列数据
	 * @param areaId
	 * @return
	 */
	public static String queryShowNum(String areaId) {
		String sql = "select count(*) as cnt from rpt_detail where is_show = '1' and area_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(areaId);
		
		Map<String,String> mpCnt = _dao.queryMap(param);
		return mpCnt.get("cnt");
	}
	
	/**
	 * 获取所有表达式字段
	 * @param reportId
	 * @return
	 */
	public static List<Map<String,String>> queryExpress(String reportId) {
		String sql = "select express, col_code, format from rpt_detail where area_id in " +
				"(select area_id from rpt_area where report_id = ?) and express > ' '";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(reportId);
		
		return _dao.query(param);
	}
	
	/**
	 * 获取统计条件页面参数
	 * 改为去掉：and area_type = 'assort'，只要是主区域就可以，动态统计可能没有分类区域 
	 * @param reportId
	 * @return
	 */
	public static List<Map<String,String>> queryRequestParam(String reportId) {
		String sql = "select "+ _field_param +" from rpt_param where data_src = 'request' and " +
				"area_id in (select area_id from rpt_area where is_main = '1' and report_id = ?) " +
				"order by param_index";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(reportId);
		
		return _dao.query(param);
	}
	
	/**
	 * 取选择控件定义信息
	 * @param ctlcode
	 * @return
	 */
	public static Map<String,String> selectWinCtl(String ctlcode) {
		String sql = "select fun_id, layout_page from funall_control where control_code = ?";
		DaoParam paramCtl = _dao.createParam(sql);
		paramCtl.addStringValue(ctlcode);
		
		return _dao.queryMap(paramCtl);
	}
}
