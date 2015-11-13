/*
 * Copyright(c) 2013 DongHong Inc.
 */
package org.jxstar.service.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.ArrayUtil;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.key.CodeCreator;
import org.jxstar.util.key.KeyCreator;

/**
 * 新闻公告处理类。
 *
 * @author TonyTan
 * @version 1.0, 2013-11-29
 */
public class SysNewsBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 标记公告是否置顶
	 * @param keyids
	 * @param istop -- 是否置顶：1 置顶、0 不置顶
	 * @return
	 */
	public String istop(String[] keyids, String istop) {
		if (keyids == null || keyids.length == 0) {
			setMessage("没有选择记录！");
			return _returnFaild;
		}
		if (istop == null || istop.length() == 0) {
			istop = "0";
		}
		for (String keyid : keyids) {
			if (!istop(keyid, istop)) {
				setMessage("置顶更新失败！");
				return _returnFaild;
			}
		}
		
		return _returnSuccess;
	}
	//更新是否置顶
	private boolean istop(String keyid, String istop) {
		String sql = "update sys_news set is_top = ? where news_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(istop);
		param.addStringValue(keyid);
		return _dao.update(param);
	}

	/**
	 * 新增的时候自动创建一条记录，方便保存附件、添加明细记录
	 * @param mpUser
	 * @param type -- 信息类型：0 消息、1 公告
	 * @return
	 */
	public String createNews(Map<String,String> mpUser, String type) {
		if (type == null || type.length() == 0) type = "1";
		
		String sql = "insert into sys_news(news_id, news_code, state, cont_type, " +
				"edit_date, edit_user, edit_userid, add_userid, add_date) " +
			"values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
		DaoParam param = _dao.createParam(sql);
		
		String news_id = KeyCreator.getInstance().createKey("sys_news");
		String news_code = CodeCreator.getInstance().createCode("sys_news");
		String user_id = MapUtil.getValue(mpUser, "user_id");
		String user_name = MapUtil.getValue(mpUser, "user_name");
		
		param.addStringValue(news_id);
		param.addStringValue(news_code);
		param.addStringValue("0");
		param.addStringValue(type);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(user_name);
		param.addStringValue(user_id);
		param.addStringValue(user_id);
		param.addDateValue(DateUtil.getTodaySec());
		if (!_dao.update(param)) {
			setMessage("新增记录失败！");
			return _returnFaild;
		}
		//返回主键到前台
		setReturnData("{keyid:'"+ news_id +"'}");
		
		return _returnSuccess;
	}
	
	/**
	 * 结合用户设置，取新闻公告记录
	 * @param userId -- 新闻ID
	 * @param shownum -- 显示几条新闻
	 * @param contType -- 信息分类
	 * @return
	 */
	public String queryCont(String userId, String shownum, String contType) {
		//int imonth = 1;
		//if (preMonth != null && preMonth.length() > 0) {
		//	imonth = Integer.parseInt(preMonth);
		//}
		
		//f_isnews函数处理公告的数据权限
		String sql = "select news_id, news_code, news_title, edit_date, edit_user, edit_userid, is_top " +
				"from sys_news where {DBO}f_isnews(news_id, ?) = '1' and state = '1' ";
				//" and (edit_date >= ? or is_top = '1') ";
		if (contType != null && contType.length() > 0) {
			String where = "'"+ contType.replace(",", "','") +"'";
			sql += " and cont_type in ("+ where +")";
		} else {
			sql += " and cont_type in ('1', '2')";
		}
		sql += " order by is_top desc, edit_date desc";
		
		DaoParam param = _dao.createParam(sql);
		param.setUseParse(true);
		param.addStringValue(userId);
		//String d = DateUtil.dateAddMonth(DateUtil.getToday(), -imonth);
		//_log.showDebug("........query cont date:" + d + "; userid:" + userId);
		//param.addDateValue(d);
		List<Map<String,String>> lsData = _dao.query(param);
		
		//只显示指定的条数
		int inum = Integer.parseInt(shownum);
		if (lsData.size() > inum) {
			lsData = lsData.subList(0, inum);
		}
		
		String json = "[]";
		if (!lsData.isEmpty()) {
			json = ArrayUtil.listToJson(lsData);
		}
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 保存回复记录
	 * @param request
	 * @return
	 */
	public String saveReply(RequestContext request) {
		String keyid = request.getRequestValue("keyid");			//回复ID
		String news_id = request.getRequestValue("news_id");		//新闻ID
		String reply_cont = request.getRequestValue("reply_cont");	//回复内容
		
		Map<String,String> mpuser = request.getUserInfo();
		String user_id = MapUtil.getValue(mpuser, "user_id");
		String user_name = MapUtil.getValue(mpuser, "user_name");
		
		String sql = "insert into sys_news_reply (reply_id, news_id, reply_cont, edit_date, " +
				"edit_user, edit_userid) values (?, ?, ?, ?, ?, ?)";
		DaoParam param = _dao.createParam(sql);
		
		param.addStringValue(keyid);
		param.addStringValue(news_id);
		param.addStringValue(reply_cont);
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(user_name);
		param.addStringValue(user_id);
		if (!_dao.update(param)) {
			setMessage("保存回复记录失败！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 删除回复记录
	 * @param replyId
	 * @return
	 */
	public String deleteReply(String replyId) {
		String sql = "delete from sys_news_reply where reply_id = ?";
		DaoParam param = _dao.createParam(sql);
		
		param.addStringValue(replyId);
		if (!_dao.update(param)) {
			setMessage("删除回复记录失败！");
			return _returnFaild;
		}
		
		if (!deleteAttach("sys_news_reply", replyId)) {
			setMessage("删除回复记录相关附件失败！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 查看公告内容与回复内容
	 * @param newsId
	 * @return
	 */
	public String queryContAndReply(String newsId) {
		String json = "{newsid:'" + newsId + "', ";
		
		Map<String,String> mpCont = queryCont(newsId);
		if (!mpCont.isEmpty()) {
			json += "cont:" + MapUtil.toJson(mpCont);
		} else {
			json += "cont:''";
		}
		
		List<Map<String,String>> lsReply = queryReply(newsId);
		if (!lsReply.isEmpty()) {
			json += ", reply:" + ArrayUtil.listToJson(lsReply) + "}";
		} else {
			json += ", reply:[]}"; 
		}
		_log.showDebug(".............json=" + json);
		
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	//删除相关附件记录
	public boolean deleteAttach(String tableName, String dataId) {
		String sql = "select attach_id from sys_attach where table_name = ? and data_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tableName);
		param.addStringValue(dataId);
		
		List<Map<String, String>> lsData = _dao.query(param);
		if (lsData.isEmpty()) return true;
		
		String[] attachIds = new String[lsData.size()];
		for (int i = 0; i < lsData.size(); i++) {
			attachIds[i] = lsData.get(i).get("attach_id");
		}
		
		//删除相关附件，不处理删除异常
		AttachBO attach = new AttachBO();
		attach.deleteAttach(attachIds);
		
		return true;
	}
	
	//查询公告内容
	private Map<String,String> queryCont(String newsId) {
		String sql = "select * from sys_news where news_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(newsId);
		return _dao.queryMap(param);
	}
	
	//查询公告回复
	public List<Map<String,String>> queryReply(String newsId) {
		String sql = "select * from sys_news_reply where news_id = ? order by edit_date";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(newsId);
		return _dao.query(param);
	}
}
