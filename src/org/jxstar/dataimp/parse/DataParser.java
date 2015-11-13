/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.dataimp.parse;

import java.io.InputStream;

/**
 * 数据解析接口。
 *
 * @author TonyTan
 * @version 1.0, 2012-6-11
 */
public interface DataParser {
	
	/**
	 * 根据导入数据值初始化结果集对象
	 * @param inputStream -- 导入文件
	 * @param firstRow -- 第一行数据的位置
	 */
	public void init(InputStream inputStream, int firstRow);
	
	/**
	 * 返回第一行数据位置
	 * @return
	 */
	public int getFirstRow();

	/**
	 * 返回数据总行数，不含标题与表头
	 * @return
	 */
	public int getRowsNum();
	
	/**
	 * 返回数据总列数
	 * @return
	 */
	public int getColsNum();
	
	/**
	 * 返回指定行、列位置的数据，0为起始位置
	 * @param row
	 * @param col
	 * @return
	 */
	public String getData(int row, int col);
}
