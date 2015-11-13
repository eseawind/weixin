/*
 * Copyright(c) 2014 DongHong Inc.
 */
package org.jxstar.service.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.key.CodeCreator;

/**
 * 消息日志处理类，用于业务单据日志回复，只能在业务单据form内看到。
 *
 * @author TonyTan
 * @version 1.0, 2014-2-17
 */
public class SysMsgLogBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 删除业务记录相关的日志
	 * @param tableName
	 * @param dataId
	 * @return
	 */
	public String deleteLog(String tableName, String dataId) {
		//查询消息记录ID
		String newsId = queryNewsId(tableName, dataId);
		if (newsId.length() == 0) return _returnSuccess;
		
		//先删除回复消息记录与附件
		SysNewsBO newsbo = new SysNewsBO();
		List<Map<String,String>> lsrep = newsbo.queryReply(newsId);
		for (Map<String,String> mprep : lsrep) {
			String repid = MapUtil.getValue(mprep, "reply_id");
			
			String ret = newsbo.deleteReply(repid);
			if (ret.equals(_returnFaild)) {
				setMessage("删除回复消息失败！");
				return _returnFaild;
			}
		}
		
		//删除发布消息记录与附件
		String sql = "delete from sys_news where news_id = ?";
		DaoParam param = _dao.createParam(sql);
		
		param.addStringValue(newsId);
		if (!_dao.update(param)) {
			setMessage("删除消息记录失败！");
			return _returnFaild;
		}
		
		if (!newsbo.deleteAttach("sys_news", newsId)) {
			setMessage("删除消息附件失败！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 根据表名与业务记录ID查找日志
	 * @param tableName
	 * @param dataId
	 * @return
	 */
	public String queryLog(String tableName, String dataId) {
		String json = "";
		String newsId = queryNewsId(tableName, dataId);
		if (newsId.length() > 0) {
			SysNewsBO news = new SysNewsBO();
			news.queryContAndReply(newsId);
			json = news.getReturnData();
		} else {
			json = "{newsid:'', cont:'', reply:[]}";
		}
		setReturnData(json);
		
		return _returnSuccess;
	}

	/**
	 * 如果没有消息，则创建一条，如果有则直接回复；同时需要修改消息接收人员的外键；
	 * @param keyid -- 如果有消息ID，则根据表名与记录ID找到消息ID
	 * @param html -- 消息内容
	 * @param mpUser -- 当前用户信息
	 * @return
	 */
	public String send(String keyid, String html, String tableName, String dataId, Map<String,String> mpUser) {
		if (keyid == null || keyid.length() == 0) {
			setMessage("没有找到消息主键！");
			return _returnFaild;
		}
		if (html == null || html.length() == 0) {
			setMessage("没有找到消息内容！");
			return _returnFaild;
		}
		
		//如果有消息ID，则创建回复记录，没有则创建消息记录
		String newsId = queryNewsId(tableName, dataId);
		if (newsId.length() > 0) {
			if (!saveReply(keyid, newsId, html, mpUser)) {
				setMessage("回复记录失败！");
				return _returnFaild;
			}
		} else {
			if (!save(keyid, html, tableName, dataId, mpUser)) {
				setMessage("发送消息失败！");
				return _returnFaild;
			}
		}
		
		return _returnSuccess;
	}
	
	//保存发送消息
	private boolean save(String keyid, String html, String table, String dataid, Map<String,String> mpUser) {
		String sql = "insert into sys_news(news_id, news_code, state, cont_type, news_cont, " +
				"edit_date, edit_user, edit_userid, add_userid, add_date, table_name, data_id) " +
			"values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		DaoParam param = _dao.createParam(sql);
		
		String news_code = CodeCreator.getInstance().createCode("sys_news");
		String user_id = MapUtil.getValue(mpUser, "user_id");
		String user_name = MapUtil.getValue(mpUser, "user_name");
		
		param.addStringValue(keyid);
		param.addStringValue(news_code);
		param.addStringValue("1");//状态：已发送
		param.addStringValue("3");//消息类型：日志
		param.addStringValue(html);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(user_name);
		param.addStringValue(user_id);
		param.addStringValue(user_id);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(table);
		param.addStringValue(dataid);
		return _dao.update(param);
	}
	
	//保存回复消息
	private boolean saveReply(String keyid, String newsid, String html, Map<String,String> mpuser) {
		String user_id = MapUtil.getValue(mpuser, "user_id");
		String user_name = MapUtil.getValue(mpuser, "user_name");
		
		String sql = "insert into sys_news_reply (reply_id, news_id, reply_cont, edit_date, " +
				"edit_user, edit_userid) values (?, ?, ?, ?, ?, ?)";
		DaoParam param = _dao.createParam(sql);
		
		param.addStringValue(keyid);
		param.addStringValue(newsid);
		param.addStringValue(html);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(user_name);
		param.addStringValue(user_id);
		return _dao.update(param);
	}
	
	//根据业务数据取消息ID
	private String queryNewsId(String tableName, String dataId) {
		String sql = "select news_id from sys_news where table_name = ? and data_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tableName);
		param.addStringValue(dataId);
		
		Map<String,String> mp = _dao.queryMap(param);
		return MapUtil.getValue(mp, "news_id");
	}
}
