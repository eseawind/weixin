package org.jxstar.report.util;

import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.util.DateUtil;
import org.jxstar.util.FileUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.log.Log;

/**
 * 处理个人签名与部门印制的工具类。
 * 印章版本处理：
 * 取过程实例开始时间之前，最近的印章版本记录，如果没有则取原来的印章记录。
 *
 * @author TonyTan
 * @version 1.0, 2011-11-28
 */
public class SignPicUtil {
	private static Log _log = Log.getInstance();
	private static BaseDao _dao = BaseDao.getInstance();
	
	/**
	 * 从标记表中取当时过程实例创建的时间
	 * @param funId -- 功能ID
	 * @param dataId -- 数据ID
	 * @return
	 */
	public static String getMarkDate(String funId, String dataId) {
		String sql = "select mark_date from wf_sheet_mark " +
				"where fun_id = ? and data_id = ? order by mark_date desc";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(dataId);
		
		Map<String, String> mpData = _dao.queryMap(param);
		String markDate = MapUtil.getValue(mpData, "mark_date");
		
		if (markDate.length() == 0) {
			markDate = queryInstanceDate(funId, dataId);
			if (markDate.length() == 0) {
				markDate = DateUtil.getTodaySec();
			}
		}
		return markDate;
	}
	
    /**
     * 取当前用户的个人签名的html
     * @param userId -- 输出用户ID
     * @param curUserId -- 当前用户ID
     * @param markDate -- 过程实例开始时间
     * @return
     */
	public static String getUserSign(String userId, String curUserId, String markDate) {
		String url = "";
		//是否有指定版本的个人签名
		String signetId = querySignetId("1", userId, markDate, false);
		if (signetId.length() == 0) {
			signetId = querySignetId("1", userId, markDate, true);
		}
		if (signetId.length() > 0) {
			if (existsAttach(signetId, "wf_signet", "img_file")) {
				url = signURL(signetId, "wf_signet", "img_file", "sys_sign_user", curUserId);
			}
		}
		
		//如果没有找到指定版本的个人签名，还是取原来的设置
		if (url.length() == 0 && existsAttach(userId, "sys_user", "sign_pic")) {
			url = signURL(userId, "sys_user", "sign_pic", "sys_user", curUserId);
		}
		
		if (url.length() > 0) {
			return "<img src='"+ url +"' width='150' />";
		} else {
			return "";
		}
	}
	
    /**
     * 取当前用户所在部门的印章的html
     * @param userId -- 输出用户ID
     * @param curUserId -- 当前用户ID
     * @param markDate -- 过程实例开始时间
     * @return
     */
	public static String getDeptSign(String userId, String curUserId, String markDate) {
		String url = "";
		//检查用户是否有历史所在部门，防止因部门调整后造成历史审批单中的部门印章都变了。
		String deptId = queryHisDept(userId, markDate);
		if (deptId.length() == 0) {
			deptId = ReportDao.getDeptId(userId);
		}
    	
    	//是否有指定版本的部门印章
    	String signetId = querySignetId("0", deptId, markDate, false);
		if (signetId.length() == 0) {
			signetId = querySignetId("0", deptId, markDate, true);
		}
		if (signetId.length() > 0) {
			if (existsAttach(signetId, "wf_signet", "img_file")) {
				url = signURL(signetId, "wf_signet", "img_file", "sys_sign_dept", curUserId);
			}
		}
		
		//如果没有找到指定版本的部门印章，还是取原来的设置
    	if (url.length() == 0 && existsAttach(deptId, "sys_dept", "sign_pic")) {
			url = signURL(deptId, "sys_dept", "sign_pic", "sys_dept", curUserId);
		}
    	
    	if (url.length() > 0) {
    		return "<img src='"+ url +"' />";
		} else {
			return "";
		}
	}
	
	//取图片附件的URL
	public static String signURL(String dataId, String tableName, String fieldName, 
			String funId, String curUserId) {
		if (dataId == null) dataId = "";
		if (tableName == null) tableName = "";
		if (fieldName == null) fieldName = "";
		if (funId == null) funId = "";
		if (curUserId == null) curUserId = "";
		
		String uploadType = SystemVar.getValue("upload.server.type", "0");
		String uploadUrl = SystemVar.getValue("upload.server.url");
		String path = ".";
		//支持集中管理附件
		if (uploadType.equals("1")) {
			path = uploadUrl;
		}
		
		StringBuilder sburl = new StringBuilder();
		sburl.append(path + "/fileAction.do?funid=sys_attach&pagetype=editgrid&eventcode=fdown&dataType=byte");
		sburl.append("&attach_field="+ fieldName +"&dataid="+ dataId +"&table_name="+ tableName);
		sburl.append("&datafunid="+ funId +"&user_id="+ curUserId);
		
		return sburl.toString();
	}
	
	//检查是否存在印章图片
	private static boolean existsAttach(String dataId, String tableName, String attachField) {
		String sql = "select attach_path from sys_attach where attach_field = ? " +
				"and table_name = ? and data_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(attachField);
		param.addStringValue(tableName);
		param.addStringValue(dataId);
		
		Map<String,String> mpAttach = _dao.queryMap(param);
		if (mpAttach.isEmpty()) return false;
		
		String attachPath = mpAttach.get("attach_path");
		if (attachPath.length() == 0) return false;
		
		//可能附件保存路径改变了，所以要重新构建路径
		String systemPath = SystemVar.getValue("upload.file.path", "D:/ATTACHDOC");
		String fileName = FileUtil.getFileName(attachPath);
		attachPath = systemPath + "/" + tableName + "/" + fileName;
		
		return FileUtil.exists(attachPath);
	}
	
	//在历史审批表中找记录
	private static String queryInstanceDate(String funId, String dataId) {
		String sql = "select start_date from wf_instancehis where " +
				"fun_id = ? and data_id = ? order by start_date desc";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(dataId);
		
		Map<String, String> mpData = _dao.queryMap(param);
		return MapUtil.getValue(mpData, "start_date");
	}
	
	//取标记时间最近的印章版本记录
	private static String querySignetId(String dataDiff, String dataId, String markDate, boolean isAll) {
		String sql = "select signet_id from wf_signet where state in ('1', '7') and " +
				"data_diff = ? and data_id = ? ";
		if (!isAll) {
			sql += " and version_date < ? ";
		}
		sql += " order by version_date desc";
		_log.showDebug(".......query sign sql=" + sql + "; isall=" + isAll + "; markdate=" + markDate);
		_log.showDebug(".......query sign param dataDiff={0}, dataId={1}, markDate={2}", dataDiff, dataId, markDate);
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(dataDiff);
		param.addStringValue(dataId);
		if (!isAll) {
			param.addDateValue(markDate);
		}
		
		Map<String, String> mpData = _dao.queryMap(param);
		return MapUtil.getValue(mpData, "signet_id");
	}
	
	//取当前用户是否有历史所在部门
	private static String queryHisDept(String userId, String markDate) {
		String sql = "select data_id from wf_signet where state in ('1', '7') and " +
				"data_diff = '2' and up_userid = ? and version_date < ? ";
		sql += " order by version_date desc";
		_log.showDebug(".......query sign sql=" + sql + "; markdate=" + markDate);
		_log.showDebug(".......query sign param userId={0}, markDate={1}", userId, markDate);
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		param.addDateValue(markDate);
		
		Map<String, String> mpData = _dao.queryMap(param);
		return MapUtil.getValue(mpData, "data_id");
	}
}
