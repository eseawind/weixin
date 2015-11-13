/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.dataimp.parse;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

import org.jxstar.util.log.Log;

/**
 * 文本文件解析对象。
 *
 * @author TonyTan
 * @version 1.0, 2012-6-12
 */
public class TxtDataParser implements DataParser {
	private int _rowsNum = 0;
	private int _colsNum = 0;
	private int _firstRow = 0;
	private String[] _rows = null;
	//保存每行、每列数据
	private String[][] _values = null;
	
	private Log _log = Log.getInstance();
	
	public void init(InputStream ins, int firstRow) {
		int len = 0;
		byte[] datas = new byte[0];
		try {
			len = ins.available();
			datas = new byte[len];
			ins.read(datas);
			ins.close();
			ins = null;
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		String content = "";
		try {
			content = new String(datas, "GBK");
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		content = content.trim();
		content = content + "\n";
		_log.showDebug(".........TxtDataParser read txt:" + content);
		
		//分隔所有的行
		_rows = content.split("\n");
		_rowsNum = _rows.length;
		_values = new String[_rowsNum][];
		
		//保存每个单元格中的数据
		for (int i = 0; i < _rowsNum; i++) {
			_values[i] = _rows[i].split(",", -1);//尾部的空串也需要解析
		}
		
		//取总列数
		if (firstRow >= 0 && firstRow < _rows.length) {
			_colsNum = _values[firstRow].length;
		}
		_log.showDebug(".........TxtDataParser rowsNum: {0}, colsNum: {1}.", _rowsNum, _colsNum);
		
		_firstRow = firstRow;
	}
	
	public int getFirstRow() {
		return _firstRow;
	}

	public int getRowsNum() {
		return _rowsNum;
	}

	public int getColsNum() {
		return _colsNum;
	}

	public String getData(int rowIndex, int colIndex) {
		if (rowIndex < 0 || rowIndex >= _rowsNum) return "";
		if (colIndex < 0 || colIndex >= _colsNum) return "";
		
		return _values[rowIndex][colIndex];
	}

}
