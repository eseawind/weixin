package com.zhx.weixin.service;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import com.zhx.weixin.bean.AccessToken;
import com.zhx.weixin.util.AccessTokenUtil;

public class GroupManager {	
	public void moveUser(String open_id,String group_id){
		try {
			StringBuilder action = new StringBuilder("https://api.weixin.qq.com/cgi-bin/groups/members/update?access_token=");
			AccessToken accessToken=AccessTokenUtil.getAccessToken();
			if(accessToken==null){
				System.out.println("get token failed......");
			}
			String token = accessToken.getToken();
			action.append(token);
			URL url = new URL(action.toString());
			StringBuilder json =new StringBuilder();
			json.append("{\"openid\":\"");
			json.append(open_id);
			json.append("\",\"to_groupid\":");
			json.append(group_id);
			json.append("}\"");
			HttpURLConnection http = (HttpURLConnection) url.openConnection();
			http.setRequestMethod("POST");
			http.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
			http.setDoOutput(true);
			http.setDoInput(true);
			System.setProperty("sun.net.client.defaultConnectTimeout", "30000");// 连接超时30秒
			System.setProperty("sun.net.client.defaultReadTimeout", "30000"); // 读取超时30秒
			http.connect();
			OutputStream os = http.getOutputStream();
			os.write(json.toString().getBytes("UTF-8"));// 传入参数
			InputStream is = http.getInputStream();
			int size = is.available();
			byte[] jsonBytes = new byte[size];
			is.read(jsonBytes);
			String result = new String(jsonBytes, "UTF-8");
			System.out.println("删除黑名请求返回结果:" + result);
			os.flush();
			os.close();
			http.disconnect();
			// ds.insertMessage(open_id, userMap.get(open_id).toString(), msg,
			// result);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}
