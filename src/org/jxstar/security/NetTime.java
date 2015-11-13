/*
 * NetTime.java 2011-4-2
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */

package org.jxstar.security;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * 获取网络时间的方法。
 *
 * @author TonyTan
 * @version 1.0, 2011-4-2
 */
public class NetTime {

	/**
	 * 取互联网时间，格式如：yyyy-MM-dd HH:mm:ss
	 * @return
	 */
	public static Date getNetTime() {
		String timeLine = getTimeLine();
		if (timeLine.length() == 0) return (new Date());
		
		Date netdate = null;
		SimpleDateFormat sdf = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'", Locale.US);
		try {
			netdate = sdf.parse(timeLine.substring(6));
		} catch (ParseException e) {
			e.printStackTrace();
			netdate = new Date();
		}
		//添加8小时时差
		netdate.setTime(netdate.getTime() + 8*60*60*1000);
		
		return netdate;
	}
	
	/**
	 * 取http响应的时间串，如：Date: Sat, 02 Apr 2011 08:50:38 GMT
	 * 如果不能联网，则返回空串
	 * @return
	 */
	public static String getTimeLine() {
		Socket socket = null;
		PrintWriter out = null;
		BufferedReader in = null;
		try {
			socket = new Socket("www.baidu.com", 80);
			
			out = new PrintWriter(socket.getOutputStream(), true);
			in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

			//send an HTTP request to the web server
			out.println("GET / HTTP/1.1");
			out.println("Host: www.baidu.com");
			out.println("Connection: Close");
			out.println();
			
			//read the response
			//只取指定行数的响应信息，因为一般第二条就是日期信息
			int lineNum = 8;
			boolean loop = true;
			while (loop) {
				if (in.ready()) {
					String s = in.readLine();
					while (s != null && lineNum > 0) {
						if (s.toLowerCase().indexOf("date:") >= 0) {
							return s;
						}
						
						s = in.readLine();
						lineNum--;
					}
					loop = false;
				}

				try {
					Thread.sleep(50);
				} catch (InterruptedException e) {
					//e.printStackTrace();
				}
			}
		} catch (UnknownHostException e) {
			//e.printStackTrace();
		} catch (IOException e) {
			//e.printStackTrace();
		} finally {
			try {
				if (in != null) in.close();
				if (out != null) out.close();
				if (socket != null) socket.close();
			} catch (IOException e) {
				//e.printStackTrace();
			}
		}
		
		return "";
	}
}
