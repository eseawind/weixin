package com.zhx.weixin.util;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import com.google.gson.Gson;
import com.zhx.weixin.service.DBServiceBO;

public class HttpProcessUtil {
	public synchronized static ErrorInfo post(String action, String body) {
		ErrorInfo errorInfo;
		try {
			URL url = new URL(action);
			HttpURLConnection http = (HttpURLConnection) url.openConnection();
			http.setRequestMethod("POST");
			http.setRequestProperty("Content-Type",	"application/x-www-form-urlencoded");
			http.setDoOutput(true);
			http.setDoInput(true);
			http.setUseCaches(false);
			System.setProperty("sun.net.client.defaultConnectTimeout", "3000");// 连接超时3秒
			System.setProperty("sun.net.client.defaultReadTimeout", "3000"); // 读取超时3秒
			http.connect();
			OutputStream os = http.getOutputStream();
			os.write(body.getBytes("UTF-8"));// 传入参数
			InputStream is = http.getInputStream();
			int size = is.available();
			byte[] jsonBytes = new byte[size];
			is.read(jsonBytes);
			errorInfo =new Gson().fromJson(new String(jsonBytes, "UTF-8"), ErrorInfo.class) ;
			os.flush();
			os.close();
			http.disconnect();
			return errorInfo;
		} catch (Exception e) {
			errorInfo=new ErrorInfo("800","post url catched exception!");
			DBServiceBO.ds.insertErrorInfo("com.zhx.weixin.util.HttpProcessUtil", "post", "post url catched exception!");
			return errorInfo;
		}
	}
}
