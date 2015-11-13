/*
 * ReportException.java 2010-11-11
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report;

import java.text.MessageFormat;

/**
 * 报表异常对象。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-11
 */
public class ReportException extends Exception {
	private static final long serialVersionUID = 1L;

	/**
	 * @param message
	 */
	public ReportException(String message) {
		super(message);
	}
	
	public ReportException(String message, Object ... params) {
		super(MessageFormat.format(message, params));
	}

	/**
	 * @param message
	 * @param cause
	 */
	public ReportException(String message, Throwable cause) {
		super(message, cause);
	}
}
