/*
 * Copyright(c) 2013 DongHong Inc.
 */
package org.jxstar.service.portlet;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.key.KeyCreator;

/**
 * 常用功能设置与读取类。
 *
 * @author TonyTan
 * @version 1.0, 2013-11-6
 */
public class PortletFunSetBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 添加常用功能，可以在portlet模板中设置、角色目录中设置、首页常用功能portlet中设置；
	 * @param funIds -- 选择的要添加的功能
	 * @param srcFunId -- 来源功能Id有：plet_portlet, sys_role, sys_user
	 * @param srcDataId -- 来源数据ID
	 * @return
	 */
	public String addFun(String[] funIds, String srcFunId, String srcDataId) {
		if (funIds.length == 0 || srcFunId.length() == 0 || srcDataId.length() == 0) {
			setMessage("添加常用功能的参数为空！");
			return _returnFaild;
		}
		
		for (String funId : funIds) {
			if (!insertFun(funId, srcFunId, srcDataId)) {
				setMessage("添加常用 功能数据失败！");
				return _returnFaild;
			}
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 个人用户设置常用功能时，可以先添加拥有角色设置的功能，不要的可以删除
	 * @param userId
	 * @return
	 */
	public String getCommFun(String userId) {
		String sql = "select distinct fun_id from plet_fun where role_id in (" +
				"select role_id from sys_user_role where user_id = ?) and " +
				"fun_id not in (select fun_id from plet_fun where set_type = '2' and owner_user_id = ?)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		param.addStringValue(userId);
		List<Map<String,String>> ls = _dao.query(param);
		if (ls.isEmpty()) {
			setMessage("没有找到当前用户所属角色的常用功能设置！");
			return _returnFaild;
		}
		
		for (Map<String,String> mp : ls) {
			String funId = mp.get("fun_id");
			if (!insertFun(funId, "sys_user", userId)) {
				setMessage("添加常用 功能数据失败！");
				return _returnFaild;
			}
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 首页获取常用功能数据
	 * @param userId -- 当前用户ID
	 * @param pletId -- 模板ID
	 * @return
	 */
	public String queryCommFun(String userId, String pletId) {
		List<Map<String,String>> lsFun = queryUserFun(userId);
		_log.showDebug("........queryUserFun size=" + lsFun.size());
		if (lsFun.isEmpty()) {
			lsFun = queryRoleFun(userId);
			_log.showDebug("........queryRoleFun size=" + lsFun.size());
			if (lsFun.isEmpty()) {
				lsFun = queryPletFun(pletId);
				_log.showDebug("........queryPletFun size=" + lsFun.size());
			}
		}
		
		if (lsFun.isEmpty()) {
			setReturnData("[]");
			return _returnSuccess;
		}
		
		//构建功能列表的JSON
		StringBuilder sbfuns = new StringBuilder();
		for (int i = 0, n = lsFun.size(); i < n; i++) {
			Map<String,String> mpFun = lsFun.get(i);
			String funId = mpFun.get("fun_id");
			String funIcon = funId;
			boolean hasIcon = hasIcon(funId);
			if (!hasIcon) funIcon = "default_icon";
			
			sbfuns.append("{funid:'"+ funId +"',");
			sbfuns.append("funname:'"+ mpFun.get("fun_name") +"',");
			sbfuns.append("funicon:'"+ funIcon +"'}");
			sbfuns.append((i < n - 1) ? ",\n" : "\n");
		}
		
		String funJson = "["+ sbfuns.toString() +"]";
		_log.showDebug("---------funJson=" + funJson);
		setReturnData(funJson);
		
		return _returnSuccess;
	}
	
	//判断功能图标文件是否存在
	private boolean hasIcon(String funId) {
		String fn = SystemVar.REALPATH + "/resources/images/fun/"+ funId +".png";
		File file = new File(fn);
		return file.exists();
	}
	
	//新增一条常用功能记录。
	private boolean insertFun(String funId, String srcFunId, String srcDataId) {
		Map<String,String> mpFun = queryFun(funId);
		String funName = MapUtil.getValue(mpFun, "fun_name");
		
		String portlet_id = "";
		String role_id = "";
		String owner_user_id = "";
		String set_type = "0";
		if (srcFunId.equals("plet_portlet")) {
			portlet_id = srcDataId;
		}
		if (srcFunId.equals("sys_role")) {
			set_type = "1";
			role_id = srcDataId;
		}
		if (srcFunId.equals("sys_user")) {
			set_type = "2";
			owner_user_id = srcDataId;
		}
		
		String sql = "insert into plet_fun (det_id, fun_id, fun_name, fun_no, " +
				"portlet_id, role_id, owner_user_id, set_type, add_date) values(?,?,?, 10, ?,?,?,?,?)";
		DaoParam param = _dao.createParam(sql);
		
		String det_id = KeyCreator.getInstance().createKey("plet_fun");
		param.addStringValue(det_id);
		param.addStringValue(funId);
		param.addStringValue(funName);
		param.addStringValue(portlet_id);
		param.addStringValue(role_id);
		param.addStringValue(owner_user_id);
		param.addStringValue(set_type);
		param.addDateValue(DateUtil.getTodaySec());
		
		return _dao.update(param);
	}
	
	//取功能名称信息
	private Map<String,String> queryFun(String funId) {
		String sql = "select fun_id, fun_name from fun_base where fun_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		
		return _dao.queryMap(param);
	}
	
	//取当前用户的常用功能
	private List<Map<String,String>> queryUserFun(String userId) {
		String sql = "select fun_id, fun_name from plet_fun where set_type = '2' and " +
				"owner_user_id = ? order by fun_no";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		
		return _dao.query(param);
	}
	
	//取当前用户的角色配置的常用功能
	private List<Map<String,String>> queryRoleFun(String userId) {
		String sql = "select distinct fun_id, fun_name, fun_no from plet_fun where set_type = '1' and role_id in " +
				"(select role_id from sys_user_role where user_id = ?) order by fun_no";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		
		List<Map<String,String>> lsData = _dao.query(param);
		//处理重复的功能ID
		List<String> lsFun = FactoryUtil.newList();
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		for (Map<String,String> mpData : lsData) {
			String funid = mpData.get("fun_id");
			if (!lsFun.contains(funid)) {
				lsRet.add(mpData);
				lsFun.add(funid);
			}
		}
		
		return lsRet;
	}
	
	//取当前模板配置的常用功能
	private List<Map<String,String>> queryPletFun(String pletId) {
		String sql = "select fun_id, fun_name from plet_fun where set_type = '0' and " +
				"portlet_id = ? order by fun_no";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(pletId);
		
		return _dao.query(param);
	}
}
