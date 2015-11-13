package com.zhx.weixin.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.zhx.weixin.bean.AccessToken;
import com.zhx.weixin.util.AccessTokenUtil;
import com.zhx.weixin.util.Content;
import com.zhx.weixin.util.ErrorInfo;
import com.zhx.weixin.util.HttpProcessUtil;
import com.zhx.weixin.util.Message;
import com.zhx.weixin.util.UserMapUtil;

public class MessageSend {
	public synchronized ErrorInfo SendMessage(String message,String msgtype,String openId,boolean resend) {
		Gson gson = new GsonBuilder().disableHtmlEscaping().create();
		AccessToken accessToken=AccessTokenUtil.getSingleAccessToken();
		if(accessToken==null){
			System.out.println("get token failed......");
			DBServiceBO.ds.insertErrorInfo("com.zhx.weixin.service.MessageSend", "SendMessage", "get token failed......");
			return new ErrorInfo("801","get token failed......");
		}
		String token = accessToken.getToken();
		String action ="https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token="+token;
		Message m=new Message();
		m.setTouser(openId);
		m.setMsgtype(msgtype);
		m.setText(new Content(message));		
		ErrorInfo errorInfo=HttpProcessUtil.post(action,gson.toJson(m));
		DBServiceBO.ds.insertMessage(openId, UserMapUtil.userMap.get(openId), message, gson.toJson(errorInfo));
		//如果token失效 清空内存中的token,将数据库token设置为过期,消息重发
		if("40001".equals(errorInfo.getErrcode())){
			AccessTokenUtil.setAccessToken(null);
			DBServiceBO.ds.setTokenExpiresd(AccessTokenUtil.getAppid(),AccessTokenUtil.getAppsecret());
			if(resend){
				ErrorInfo resendInfo=this.SendMessage(openId, msgtype, message,false);
				if(!"0".equals(resendInfo.getErrcode())){
					DBServiceBO.ds.insertErrorInfo("com.zhx.weixin.service.MessageSend", "SendMessage", "resend message failed......");
				}
			}
		}
		return errorInfo;
	}
}