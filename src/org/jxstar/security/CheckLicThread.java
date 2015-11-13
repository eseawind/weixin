/*
 * CheckLicThread.java 2011-4-2
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */

package org.jxstar.security;

import java.util.Date;


/**
 * 检查临时许可的时间是否到期的线程。
 *
 * @author TonyTan
 * @version 1.0, 2011-4-2
 */
public class CheckLicThread extends Thread {
	
	public void run() {
		SafeManager manger = SafeManager.getInstance();
		
		while(true && !this.isInterrupted()) {
			//取网络时间
			Date netDate = NetTime.getNetTime();
			//如检查为非法，则会自动修改非法标志
			manger.validCode(netDate);
			//检查平台版本类型
			manger.updateEE();
			
			//等待检查间隔时间，10分钟检查一次
			try {
				sleep(10*60*1000);
			} catch (InterruptedException e) {
				return;//关闭异常信息，避免泄露信息
			}
		}
	}
}
