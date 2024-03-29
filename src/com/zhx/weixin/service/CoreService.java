package com.zhx.weixin.service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;

import com.zhx.weixin.bean.Stocks;
import com.zhx.weixin.message.resp.TextMessage;
import com.zhx.weixin.util.MessageUtil;

/**
 * 核心服务类
 * 
 * @author liufeng
 * @date 2013-05-20
 */
public class CoreService {
	static DBServiceBO dbService = new DBServiceBO();
	static String baseURL = "http://hq.sinajs.cn/";
	static Monitor monitor = new Monitor();
	static Random r = new Random();
	public final static Map<String, String> messageMap = new HashMap<String, String>();
	static {
		messageMap.put("ErrorStock", "股票代码错误!");
		messageMap.put("Manual","回复“股票代码“查股价\n回复#查询自选股行情\n回复##查询圈共享股行情\n回复“+股票代码“增加自选股\n回复“-(.)股票代码“删除自选股\n回复“-(.)#“删除全部自选股");
	}
	

	/**
	 * 处理微信发来的请求
	 * 
	 * @param request
	 * @return
	 */
	public static String processRequest(HttpServletRequest request) {
		String respMessage = null;
		try {
			StringBuilder respContent = new StringBuilder();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			respContent.append(sdf.format(new Date()));
			respContent.append("\n");
			// xml请求解析
			Map<String, String> requestMap = MessageUtil.parseXml(request);

			// 发送方帐号（open_id）
			String fromUserName = requestMap.get("FromUserName");
			// 公众帐号
			String toUserName = requestMap.get("ToUserName");
			// 消息类型
			String msgType = requestMap.get("MsgType");
			String Content = requestMap.get("Content");
			System.out.println("消息处理：fromUserName:" + fromUserName + ",toUserName:" + toUserName + ",msgType:" + msgType
					+ "Content:" + Content);
			// 回复文本消息
			TextMessage textMessage = new TextMessage();
			textMessage.setToUserName(fromUserName);
			textMessage.setFromUserName(toUserName);
			textMessage.setCreateTime(new Date().getTime());
			textMessage.setMsgType(MessageUtil.RESP_MESSAGE_TYPE_TEXT);
			textMessage.setFuncFlag(0);

			Map<String, String> actionMap = ProcessContent(Content, msgType, fromUserName);
			String action=actionMap.get("action");
			String actionType=actionMap.get("actionType");
			// 股票代码处理
			if(actionType==""||actionType==null||action==null||action==""){
				respContent.append("未能解析发送内容");		
			}else if ("Message".equals(actionType)) {
				respContent.append(messageMap.get(action));				
			}else if ("SinaStock".equals(actionType)) {				
				respContent.append(ProcessStocks(action));
			}else if("AddStock".equals(actionType)){
				respContent.append(addCodeByUser(action, fromUserName, toUserName));
			}else if("DelStock".equals(actionType)){
				respContent.append(delCodeByUser(action, fromUserName, toUserName));
			}else if("DelAllStock".equals(actionType)){
				respContent.append(delAllByUser(action, fromUserName, toUserName));
			}else if("ChgBaseDiff".equals(actionType)){
				respContent.append(chgBaseDiffByUser(action, fromUserName, toUserName));
			}

			textMessage.setContent(respContent.toString());
			respMessage = MessageUtil.textMessageToXml(textMessage);
		} catch (Exception e) {
			e.printStackTrace();
		}

		return respMessage;
	}

	public static String addCodeByUser(String content, String open_id, String account_id) {
		String resulet="未找到相关数据或解析出错!";
		if (content != null && content.length() == 10 && content.charAt(0) == 's') {
			String stocks_code = content.replace("s_sh", "").replace("s_sz", "");
			if (stocks_code.length() == 6) {
				if (dbService.notExist(stocks_code, open_id, account_id)) {
					if(dbService.insertData(stocks_code, content, open_id, account_id)){
						resulet="操作成功!";
					}
				}else{
					resulet="相关代码已经存在,无需重复添加!";
				}
			}
		}
		return resulet;
	}
	
	public static String delCodeByUser(String content, String open_id, String account_id) {
		String resulet="未找到相关数据或解析出错!";
		if (content != null && content.length() == 10 && content.charAt(0) == 's') {
			String stocks_code = content.replace("s_sh", "").replace("s_sz", "");
			if (stocks_code.length() == 6) {
				if (dbService.delExist(stocks_code, open_id, account_id)) {
					resulet="操作成功!";
				}
			}
		}
		return resulet;
	}
	
	public static String delAllByUser(String content, String open_id, String account_id) {
		String resulet = "未找到相关数据或解析出错!";
		if (dbService.delAllExist(open_id, account_id)) {
			resulet = "操作成功!";
		}
		return resulet;
	}
	
	public static String chgBaseDiffByUser(String content, String open_id, String account_id) {
		String resulet = "未找到相关数据或解析出错!";
		if (dbService.chgBaseDiffByUser(open_id, account_id)) {
			resulet = "操作成功!";
		}
		return resulet;
	}
	//根据open_id获取自选股列表
	public static String getStocksListStr(String open_id) {
		String stocksListStr = dbService.getStockListStrByOpenID(open_id);
		if (stocksListStr == null || stocksListStr.length() < 9) {
			stocksListStr = dbService.getStockListStr();
		}
		return stocksListStr;
	}
	
	//根据open_id获取自选股列表
	public static String getStocksListStr() {
		return dbService.getStockListStr();
	}

	public static Map<String, String> ProcessContent(String Content, String msgType, String fromUserName) {
		Map<String, String> resMap = new HashMap<String, String>();
		String actionType = "";
		String action = "";
		// 文本消息
		if (msgType.equals(MessageUtil.REQ_MESSAGE_TYPE_TEXT) && Content != null) {
			System.out.println("文本内容："+Content);
			if("ok".equalsIgnoreCase(Content)){
				
				actionType = "ChgBaseDiff";
				action = Content;
			}else if("zx".equalsIgnoreCase(Content)||"#".contentEquals(Content)){
				actionType = "SinaStock";
				action=getStocksListStr(fromUserName);
			}else if("all".equalsIgnoreCase(Content)||"##".endsWith(Content)){
				actionType = "SinaStock";
				action=getStocksListStr();
			}else if(".#".equals(Content)||("-#".equals(Content))){
				actionType = "DelAllStock";
				action=Content;				
			}else if (Content.length() == 6) {// 长度为6 解析为stocks
				String stockCode = processStockCode(Content);
				if (stockCode.contains("s_sh") || stockCode.contains("s_sz")) {
					actionType = "SinaStock";
					action = stockCode;
				} else {
					actionType = "Message";
					action = "ErrorStock";
				}
			}else if(Content.length() == 7 ){
				String stockCode=processStockCode(Content.substring(1, 7));
				actionType = "Message";
				action = "ErrorStock";
				if(stockCode.length()==10){
					if(Content.charAt(0)=='+'){
						actionType = "AddStock";
						action=stockCode;
					}else if(Content.charAt(0)=='-'||Content.charAt(0)=='.'){
						actionType = "DelStock";
						action=stockCode;
					}
				}
			} else {
				actionType = "Message";
				action = "Manual";
			}
		} else {
			System.out.println("非文本内容："+Content);
			// 非文本类型
			actionType = "Message";
			action = "Manual";
		}
		resMap.put("actionType", actionType);
		resMap.put("action", action);
		return resMap;
	}

	public static String ProcessStocks(String action) {
		// 默认返回的文本消息内容
		StringBuilder respContent = new StringBuilder();
		StringBuilder url = new StringBuilder();
		url.append(baseURL);
		url.append("rn=");
		url.append(r.nextLong());
		url.append("&list=");
		url.append(action);
		Map<String, Stocks> currentInfo =sortMapByValue(monitor.getCurrentInfo(url.toString()));
		int count=currentInfo.keySet().size();
		for (String key : currentInfo.keySet()) {
			Stocks s = currentInfo.get(key);
			if (count > 1) {
				double percent=s.getChgpercent();
				String space;
				String percentStr;
				if(percent>=0){
					space="-";//"↑";
					percentStr="+"+percent;
				}else{
					space="-";//"↓";
					percentStr=String.valueOf(percent);
				}
				respContent.append(" <a href=\"http://image.sinajs.cn/newchart/min/n/");
				respContent.append(key.replace("s_", ""));
				respContent.append(".gif\" >");
				String name=s.getName().replace(" ", "");
				for (int i = 0; i < 8 - name.getBytes().length; i++) {
					respContent.append(space);
				}
				respContent.append(name);

				respContent.append("</a>");
				String price = String.valueOf(s.getPrice());
				respContent.append("  ");
				respContent.append(s.getPrice());
				for (int i = 0; i < 6 - price.getBytes().length; i++) {
					respContent.append("0");
				}
				respContent.append(",");
				respContent.append("  ");
				respContent.append(percentStr);
				for (int i = 0; i < 6 - percentStr.getBytes().length; i++) {
					respContent.append("0");
				}
				respContent.append("%\n");
			} else if (count == 1) {
				respContent.append(s.getName());
				respContent.append("(");
				respContent.append(s.getCode());
				respContent.append(")");
				respContent.append("\n价格:");
				respContent.append(s.getPrice());
				respContent.append(",涨幅:");
				respContent.append(s.getChgpercent());
				respContent.append("%\n");
				respContent.append(" <a href=\"http://image.sinajs.cn/newchart/min/n/");
				respContent.append(key.replace("s_", ""));
				respContent.append(".gif\" >分时</a>");

				respContent.append(" <a href=\"http://image.sinajs.cn/newchart/daily/n/");
				respContent.append(key.replace("s_", ""));
				respContent.append(".gif\" > 日K</a>");
				respContent.append(" <a href=\"http://image.sinajs.cn/newchart/weekly/n/");
				respContent.append(key.replace("s_", ""));
				respContent.append(".gif\" > 周K</a>");

				respContent.append(" <a href=\"http://image.sinajs.cn/newchart/monthly/n/");
				respContent.append(key.replace("s_", ""));
				respContent.append(".gif\" > 月K</a>");

			}
		}
		return respContent.toString();
	}


	public static String processStockCode(String Content) {
		String stockCode = "";
		if (Content.charAt(0) == '6') {
			stockCode = "s_sh" + Content;
		} else if (Content.charAt(0) == '0' || Content.charAt(0) == '3') {
			stockCode = "s_sz" + Content;
		}
		return stockCode;
	}
	
	
    public static Map<String, Stocks> sortMapByValue(Map<String, Stocks> oriMap) {
        if (oriMap == null || oriMap.isEmpty()) {
            return null;
        }
        Map<String, Stocks> sortedMap = new LinkedHashMap<String, Stocks>();
        List<Map.Entry<String, Stocks>> entryList = new ArrayList<Map.Entry<String, Stocks>>(
                oriMap.entrySet());
        Collections.sort(entryList, new Comparator(){
			public int compare(Object o1, Object o2) {
				// TODO Auto-generated method stub
				Entry<String, Stocks> m1=(Entry<String, Stocks>)o1;
				Entry<String, Stocks> m2=(Entry<String, Stocks>)o2;
				return m1.getValue().getChgpercent()>m2.getValue().getChgpercent()?-1:1;
			}
        });
        Iterator<Map.Entry<String, Stocks>> iter = entryList.iterator();
        Map.Entry<String, Stocks> tmpEntry = null;
        while (iter.hasNext()) {
            tmpEntry = iter.next();
            sortedMap.put(tmpEntry.getKey(), tmpEntry.getValue());
        }
        return sortedMap;
    }

}

// // 图片消息
// else if (msgType.equals(MessageUtil.REQ_MESSAGE_TYPE_IMAGE)) {
// respContent = "您发送的是图片消息！";
// }
// // 地理位置消息
// else if (msgType.equals(MessageUtil.REQ_MESSAGE_TYPE_LOCATION)) {
// respContent = "您发送的是地理位置消息！";
// }
// // 链接消息
// else if (msgType.equals(MessageUtil.REQ_MESSAGE_TYPE_LINK)) {
// respContent = "您发送的是链接消息！";
// }
// // 音频消息
// else if (msgType.equals(MessageUtil.REQ_MESSAGE_TYPE_VOICE)) {
// respContent = "您发送的是音频消息！";
// }
// // 事件推送
// else if (msgType.equals(MessageUtil.REQ_MESSAGE_TYPE_EVENT)) {
// // 事件类型
// String eventType = requestMap.get("Event");
// // 订阅
// if (eventType.equals(MessageUtil.EVENT_TYPE_SUBSCRIBE)) {
// respContent = "谢谢您的关注！";
// }
// // 取消订阅
// else if (eventType.equals(MessageUtil.EVENT_TYPE_UNSUBSCRIBE)) {
// // TODO 取消订阅后用户再收不到公众号发送的消息，因此不需要回复消息
// }
// // 自定义菜单点击事件
// else if (eventType.equals(MessageUtil.EVENT_TYPE_CLICK)) {
// // TODO 自定义菜单权没有开放，暂不处理该类消息
// }
// }
