package com.zhx.weixin.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.zhx.weixin.util.Content;
import com.zhx.weixin.util.Message;



public class Test {
	public static void main(String[] args) {
		Gson gson = new GsonBuilder().disableHtmlEscaping().create();
		Message m=new Message();
		m.setTouser("o5j36ssFTWnak7AD_bH0aduzke8U");
		m.setMsgtype("text");
		m.setText(new Content("<a href\"hh\">hello word"));
		System.out.println(gson.toJson(m));
	}
	
}
