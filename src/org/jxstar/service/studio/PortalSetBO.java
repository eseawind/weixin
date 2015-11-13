/*
 * Copyright(c) 2014 DongHong Inc.
 */
package org.jxstar.service.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.query.PortalQuery;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.key.KeyCreator;
import org.jxstar.util.resource.JsMessage;

/**
 * 自定义模板排版设置。
 *
 * @author TonyTan
 * @version 1.0, 2014-3-8
 */
public class PortalSetBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	private KeyCreator _key = KeyCreator.getInstance();
	
	private PortalQuery _portal = new PortalQuery();
	
	/**
	 * 首页演示：读取指定的模板设置数据
	 * @param userid
	 * @return
	 */
	public String readOneTpl(String templetId) {
		Map<String,String> mpTemp = _portal.queryOneTemplet(templetId);
		if (mpTemp.isEmpty()) {
			setMessage("没有找到模板设置！");
			return _returnFaild;
		}
		
		String templetName = mpTemp.get("templet_name");
		String config = readTemp(templetId, "0", "");
		
		String json = "{templet_id:'"+ templetId +"', templet_name:'" + 
			templetName + "', items:"+ config +"}";
		
		_log.showDebug("---------portalJson=" + json);
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 首页调用：读取模板设置数据
	 * @param userid
	 * @return
	 */
	public String mainRead(String userid) {
		//取用户所属角色的模板信息
		List<Map<String,String>> lsTemp = _portal.queryTemplet(userid);
		if (lsTemp.isEmpty()) {
			//"构建首页失败，因为用户所属角色没有定义PORTAL模板！"
			setMessage(JsMessage.getValue("portalquery.notemp"));
			return _returnFaild;
		}
		
		//构建PORTAL的JSON
		StringBuilder sbtemps = new StringBuilder();
		for (int i = 0, n = lsTemp.size(); i < n; i++) {
			Map<String,String> mpTemp = lsTemp.get(i);
			String templetId = mpTemp.get("templet_id");
			String templetName = mpTemp.get("templet_name");
			String config = read(templetId, "1", userid);
			
			String tempJson = "{templet_id:'"+ templetId +"', templet_name:'" + 
				templetName + "', items:"+ config +"}";
			
			sbtemps.append(tempJson);
			
			if (i < n - 1) {
				sbtemps.append(",");
			}
		}
		
		String portalJson = "{portalnum:"+ lsTemp.size() +", portals:["+ sbtemps.toString() +"]}";
		_log.showDebug("---------portalJson=" + portalJson);
		setReturnData(portalJson);
		
		return _returnSuccess;
	}
	
	/**
	 * 自定义设置模板
	 * @param templetId
	 * @param userid
	 * @return
	 */
	public String custRead(String templetId, String userid) {
		String config = read(templetId, "1", userid);
		setReturnData(config);
		
		return _returnSuccess;
	}
	
	private String read(String templetId, String settype, String userid) {
		String config = "";
		//如果是读取自定义设置
		if (settype.equals("1")) {
			config = readTemp(templetId, settype, userid);
		}
		//如果没有自定义，则读取缺省值
		if (config.length() == 0) {
			config = readTemp(templetId, "0", userid);
		}
		
		return config;
	}
	
	/**
	 * 首页调用：先删除自定义排版，再取缺省排版设置
	 * @param templetId
	 * @param userid
	 * @return
	 */
	public String defTemp(String templetId, String userid) {
		if (!deleteTemp(templetId, "1", userid)) {
			setMessage("删除自定义模板失败！");
			return _returnFaild;
		}
		
		String config = read(templetId, "0", userid);
		setReturnData(config);
		
		return _returnSuccess;
	}
	
	/**
	 * 模板调用：先删除，再创建缺省排版
	 * @param templetId
	 * @param userid
	 * @return
	 */
	public String redoTemp(String templetId, String userid) {
		if (!deleteTemp(templetId, "0", userid)) {
			setMessage("删除模板失败！");
			return _returnFaild;
		}
		
		return createTemp(templetId);
	}
	
	/**
	 * 读取缺省模板设置数据
	 * @param templetId
	 * @return
	 */
	public String defaultTemp(String templetId) {
		String config = readTemp(templetId, "0", "");
		if (config.length() == 0) {
			return createTemp(templetId);
		} else {
			setReturnData(config);
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 创建模板缺省设置
	 * @param templetId
	 * @return
	 */
	public String createTemp(String templetId) {
		//取模板栏目
		List<Map<String,String>> lsPort = _portal.queryPortlet(templetId);
		if (lsPort.isEmpty()) {
			setMessage("模板明细为空！");
			return _returnFaild;
		}
		
		StringBuilder sbitems = new StringBuilder();
		for (int i = 0, n = lsPort.size(); i < n; i++) {
			Map<String,String> mpPort = lsPort.get(i);

			sbitems.append("{id:'"+ mpPort.get("portlet_id") +"', ");
			sbitems.append("title:'"+ mpPort.get("portlet_title") +"', ");
			sbitems.append("colno:'"+ mpPort.get("col_no") +"', ");
			sbitems.append("iconCls:'"+ mpPort.get("iconcls") +"', ");
			sbitems.append("height:'"+ mpPort.get("height") +"', ");
			sbitems.append("collapse:'"+ mpPort.get("collapse") +"', ");
			sbitems.append("typecode:'"+ mpPort.get("type_code") +"', ");
			sbitems.append("objectid:'"+ mpPort.get("object_id") +"'}");
			sbitems.append((i < n - 1) ? "," : "");
		}
		
		setReturnData("["+sbitems.toString()+"]");
		
		return _returnSuccess;
	}

	/**
	 * 保存模板设置
	 * @param templetId
	 * @param settype -- 设置类型：0 缺省设置、1 自定义设置
	 * @param userid
	 * @param config
	 * @return
	 */
	public String save(String templetId, String settype, String userid, String config) {
		boolean ret = false;
		if (!hasTemp(templetId, settype, userid)) {
			ret = insertTemp(templetId, settype, userid, config);
			if (!ret) {
				setMessage("保存模板设置记录失败！");
				return _returnFaild;
			}
		} else {
			ret = updateTemp(templetId, settype, userid, config);
			if (!ret) {
				setMessage("保存模板设置记录失败！");
				return _returnFaild;
			}
		}
		
		return _returnSuccess;
	}
	
	//保存一条记录
	private boolean insertTemp(String templetId, String settype, String userid, String config) {
		String sql = "insert into plet_temp_set(set_id, templet_id, set_type, edit_userid, set_config, " +
				"add_userid, add_date) values(?, ?, ?, ?, ?, ?, ?)";
		DaoParam param = _dao.createParam(sql);
		_log.showDebug("...........insert config sql=" + sql);
		
		String keyid = _key.createKey("plet_temp_set");
		param.addStringValue(keyid);
		param.addStringValue(templetId);
		param.addStringValue(settype);
		param.addStringValue(userid);
		param.addStringValue(config);
		param.addStringValue(userid);
		param.addDateValue(DateUtil.getTodaySec());
		
		return _dao.update(param);
	}
	
	private boolean hasTemp(String templetId, String settype, String userid) {
		String sql = "select count(*) as cnt from plet_temp_set where set_type = ? and templet_id = ?";
		if (settype.equals("1")) {
			sql += " and edit_userid = ?";
		}
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(settype);
		param.addStringValue(templetId);
		if (settype.equals("1")) {
			param.addStringValue(userid);
		}
		Map<String,String> mp = _dao.queryMap(param);
		return MapUtil.hasRecord(mp);
	}
	
	/**
	 * 保存模板设置数据
	 * @param templetId
	 * @param settype -- 设置类型：0 缺省设置、1 自定义设置
	 * @param userid
	 * @param config
	 * @return
	 */
	private boolean updateTemp(String templetId, String settype, String userid, String config) {
		String sql = "update plet_temp_set set set_config = ? where templet_id = '"+ templetId 
			+"' and set_type = '"+ settype +"'";
		if (settype.equals("1")) {
			sql += " and edit_userid = '"+ userid +"'";
		}
		_log.showDebug("...........save config sql=" + sql);
		
		//return BigFieldUtil.updateStream(sql, config, "");
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(config);
		return _dao.update(param);
	}
	
	/**
	 * 读取模板设置数据
	 * @param templetId
	 * @param settype
	 * @param userid
	 * @return
	 */
	private String readTemp(String templetId, String settype, String userid) {
		String sql = "select set_config from plet_temp_set where templet_id = '"+ templetId 
			+"' and set_type = '"+ settype +"'";
		if (settype.equals("1")) {
			sql += " and edit_userid = '"+ userid +"'";
		}
	
		//return BigFieldUtil.readStream(sql, "set_config", "");
		
		DaoParam param = _dao.createParam(sql);
		Map<String, String> mp = _dao.queryMap(param);
		
		return MapUtil.getValue(mp, "set_config");
	}
	
	//删除自定义排版
	private boolean deleteTemp(String templetId, String settype, String userid) {
		String sql = "delete from plet_temp_set where set_type = ? and templet_id = ?";
		if (settype.equals("1")) {
			sql += " and edit_userid = ?";
		}
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(settype);
		param.addStringValue(templetId);
		if (settype.equals("1")) {
			param.addStringValue(userid);
		}
		return _dao.update(param);
	}
}
