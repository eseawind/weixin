/*
 * Copyright(c) 2013 DongHong Inc.
 */
package org.jxstar.service.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.util.ServiceUtil;
import org.jxstar.util.ArrayUtil;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.key.CodeCreator;

/**
 * 新消息发送处理类。
 *
 * @author TonyTan
 * @version 1.0, 2013-12-24
 */
public class SysMsgBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 查询当前用户的消息，如果用户标记不再查看后，此消息就不显示
	 * @param userId
	 * @return
	 */
	public String queryCont(String userId) {
		//f_ismsgs函数处理公告的数据权限
		String sql = "select news_id, news_cont, edit_date, edit_user, edit_userid " +
				"from sys_news where ({DBO}f_ismsgs(news_id, ?) = '1' or edit_userid = ?) and " +
				"cont_type = '0' and state = '1' " +
				"order by edit_date desc";
		DaoParam param = _dao.createParam(sql);
		param.setUseParse(true);
		param.addStringValue(userId);
		param.addStringValue(userId);
		List<Map<String,String>> lsData = _dao.query(param);
		
		String json = "[]";
		if (!lsData.isEmpty()) {
			json = ArrayUtil.listToJson(lsData);
		}
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 标记此消息不再关注，如果是发布则标记为注销
	 * @param newsId
	 * @param userId
	 * @return
	 */
	public String onCancel(String newsId, String userId) {
		boolean ret = false;
		if (isSender(newsId, userId)) {
			ret = cancel(newsId);
		} else {
			ret = notshow(newsId, userId);
		}
		if (!ret) {
			setMessage("注销此消息失败！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	//是否为消息发布者
	private boolean isSender(String newsId, String userId) {
		String sql = "select count(*) as cnt from sys_news where news_id = ? and edit_userid = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(newsId);
		param.addStringValue(userId);
		
		Map<String,String> mp = _dao.queryMap(param);
		return MapUtil.hasRecord(mp);
	}
	//注销消息
	private boolean cancel(String newsId) {
		String sql = "update sys_news set state = ? where news_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue("7");
		param.addStringValue(newsId);
		return _dao.update(param);
	}
	//标记消息不显示
	private boolean notshow(String newsId, String userId) {
		String sql = "update sys_news_obj set not_show = '1' where obj_type = '1' and news_id = ? and obj_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(newsId);
		param.addStringValue(userId);
		return _dao.update(param);
	}
	
	/**
	 * 保存消息
	 * @param keyid
	 * @param html
	 * @param mpUser
	 * @return
	 */
	public String save(String keyid, String html, Map<String,String> mpUser) {
		if (keyid == null || keyid.length() == 0) {
			setMessage("没有找到消息主键！");
			return _returnFaild;
		}
		if (html == null || html.length() == 0) {
			setMessage("没有找到消息内容！");
			return _returnFaild;
		}
		if (!save(keyid, html, "0", mpUser)) {
			setMessage("保存消息失败！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 弹出窗口保存并发送消息
	 * @param keyid
	 * @param html
	 * @param mpUser
	 * @return
	 */
	public String send(String keyid, String html, Map<String,String> mpUser) {
		if (keyid == null || keyid.length() == 0) {
			setMessage("没有找到消息主键！");
			return _returnFaild;
		}
		if (html == null || html.length() == 0) {
			setMessage("没有找到消息内容！");
			return _returnFaild;
		}
		if (!hasUser(keyid)) {
			setMessage("没有添加接收消息的人！");
			return _returnFaild;
		}
		
		if (!save(keyid, html, "1", mpUser)) {
			setMessage("发送消息失败！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 表单保存并发送消息
	 * @param keyid
	 * @param html
	 * @param mpUser
	 * @return
	 */
	public String formSend(String keyid, String html, Map<String,String> mpUser) {
		if (keyid == null || keyid.length() == 0) {
			setMessage("没有找到消息主键！");
			return _returnFaild;
		}
		if (html == null || html.length() == 0) {
			setMessage("没有找到消息内容！");
			return _returnFaild;
		}
		if (!hasUser(keyid)) {
			setMessage("没有添加接收消息的人！");
			return _returnFaild;
		}
		
		if (!update(keyid, html, "1", mpUser)) {
			setMessage("发送消息失败！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 表格发送消息时判断
	 * @param keyids
	 * @return
	 */
	public String preSend(String[] keyids) {
		for (String keyid : keyids) {
			if (!hasUser(keyid)) {
				setMessage("没有添加接收消息的人！");
				return _returnFaild;
			}
		}
		
		return _returnSuccess;
	}

	/**
	 * 删除临时数据，包括发送对象与附件
	 * @param keyid
	 * @return
	 */
	public String delTmp(String keyid) {
		 
		if (!delObj(keyid)) {
			setMessage("删除临时用户对象失败！");
			return _returnFaild;
		}
		
		ServiceUtil.deleteAttach("sys_news", keyid);
		
		return _returnSuccess;
	}
	
	//是否有发送对象
	private boolean hasUser(String keyid) {
		String sql = "select count(*) as cnt from sys_news_obj where news_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(keyid);
		Map<String,String> mp = _dao.queryMap(param);
		
		return MapUtil.hasRecord(mp);
	}
	
	//保存并发送消息
	private boolean update(String keyid, String html, String state, Map<String,String> mpUser) {
		String sql = "update sys_news set state = ?, news_cont = ?, " +
				"edit_date = ?, edit_user = ?, edit_userid = ? where news_id = ?";
		DaoParam param = _dao.createParam(sql);
		
		String user_id = MapUtil.getValue(mpUser, "user_id");
		String user_name = MapUtil.getValue(mpUser, "user_name");
		
		param.addStringValue(state);
		param.addStringValue(html);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(user_name);
		param.addStringValue(user_id);
		param.addStringValue(keyid);
		
		return _dao.update(param);
	}
	
	//保存发送消息
	private boolean save(String keyid, String html, String state, Map<String,String> mpUser) {
		String sql = "insert into sys_news(news_id, news_code, state, cont_type, news_cont, " +
				"edit_date, edit_user, edit_userid, add_userid, add_date) " +
			"values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		DaoParam param = _dao.createParam(sql);
		
		String news_code = CodeCreator.getInstance().createCode("sys_news");
		String user_id = MapUtil.getValue(mpUser, "user_id");
		String user_name = MapUtil.getValue(mpUser, "user_name");
		
		param.addStringValue(keyid);
		param.addStringValue(news_code);
		param.addStringValue(state);
		param.addStringValue("0");
		param.addStringValue(html);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(user_name);
		param.addStringValue(user_id);
		param.addStringValue(user_id);
		param.addDateValue(DateUtil.getTodaySec());
		return _dao.update(param);
	}
	
	//删除临时用户对象
	private boolean delObj(String keyid) {
		String sql = "delete from sys_news_obj where news_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(keyid);
		return _dao.update(param);
	}
}
