/*
 * StatusCode.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.invoke;

/**
 * 过程执行过程的状态代号。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public interface StatusCode {
	//过程实例的状态
	public static final String PROCESS_INITIATED = "0";	//初始化
	public static final String PROCESS_RUNNING = "1";	//启动
	public static final String PROCESS_ACTIVE = "2";	//执行
	public static final String PROCESS_COMPLETED = "3";	//完成
	public static final String PROCESS_SUSPENDED = "4";	//挂起
	public static final String PROCESS_TERMINATED = "7";//终止
	
	//任务实例的状态
	public static final String TASK_CREATED = "0";		//创建
	public static final String TASK_EXECUTED = "1";		//执行中
	public static final String TASK_COMPLETED = "3";	//完成
}
