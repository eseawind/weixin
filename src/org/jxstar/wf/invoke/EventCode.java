/*
 * EventCode.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.invoke;

/**
 * 过程执行过程的事件代号。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public interface EventCode {
	//过程实例的状态
	public static final String PROCESS_INITIATED = "process_0";	//初始化
	public static final String PROCESS_RUNNING = "process_1";	//启动
	public static final String PROCESS_ACTIVE = "process_2";	//执行
	public static final String PROCESS_COMPLETED = "process_3";	//完成
	public static final String PROCESS_SUSPENDED = "process_4";	//挂起
	public static final String PROCESS_TERMINATED = "process_7";//终止
	
	//任务实例的状态
	public static final String TASK_CREATED = "task_0";		//创建
	public static final String TASK_EXECUTED = "task_1";	//已执行
	public static final String TASK_COMPLETED = "task_3";	//完成
}
