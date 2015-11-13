/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.dataimp.parse;

import java.io.IOException;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.util.Calendar;
import java.util.Date;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.util.DateUtil;

/**
 * 解析导入文件XLS中的数据
 *
 * @author TonyTan
 * @version 1.0, 2012-6-11
 */
public class XlsDataParser implements DataParser {
	private int _rowsNum = 0;
	private int _colsNum = 0;
	private int _firstRow = 0;
	private HSSFSheet _sheet = null;
	
	/**
	 * 加载导入数据
	 */
	public void init(InputStream inputStream, int firstRow) {
		HSSFWorkbook wb;
		try {
			wb = new HSSFWorkbook(inputStream);
			_sheet = wb.getSheetAt(0);
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		_firstRow = firstRow;
		
		//初始化行数与列数
		if (_sheet != null) {
			_rowsNum = _sheet.getLastRowNum();
			_rowsNum++;
			
			HSSFRow row = _sheet.getRow(_firstRow);
			if (row == null) {
				_colsNum = -1;
			} else {
				_colsNum = row.getLastCellNum();
				_colsNum++;
			}
		}
	}
	
	public int getFirstRow() {
		return _firstRow;
	}
	
	/**
	 * 返回数据总行数，不含标题与表头
	 * @return
	 */
	public int getRowsNum() {
		return _rowsNum;
	}
	
	/**
	 * 返回数据总列数
	 * @return
	 */
	public int getColsNum() {
		return _colsNum;
	}
	
	/**
	 * 返回指定行、列位置的数据，0为起始位置
	 * @param rowIndex
	 * @param colIndex
	 * @return
	 */
	public String getData(int rowIndex, int colIndex) {
		if (_sheet == null) return "";
		if (rowIndex < 0 || rowIndex >= _rowsNum) return "";
		if (colIndex < 0 || colIndex >= _colsNum) return "";
		
		
		HSSFRow row = _sheet.getRow(rowIndex);
		if (row != null) {
			HSSFCell cell = row.getCell(colIndex);
			if (cell != null) {
				int itype = cell.getCellType();
				if (HSSFCell.CELL_TYPE_NUMERIC == itype) {
					if (HSSFDateUtil.isCellDateFormatted(cell)) { //处理单元格中的日期值  
				        double d = cell.getNumericCellValue();   
				        Date date = HSSFDateUtil.getJavaDate(d);
				        Calendar cal = Calendar.getInstance();
				        cal.setTime(date);
				        return DateUtil.calendarToDate(cal);
				    } else {
				    	//处理科学计数法与数字中的格式字符
				    	DecimalFormat df = new DecimalFormat("###.#########");
				    	String value = df.format(cell.getNumericCellValue());
				    	
				    	//去掉double类型数据的尾部的".0"，因为有些数字型的文本字段列也会识别为double类型
				    	String strTmp[] = value.split("\\.");
						if (strTmp.length == 2 && strTmp[1].equals("0")) {
							return strTmp[0];
						} else {
							return value;
						}
				    }
				} else {
					//去掉头尾的特殊符号
					String value = cell.getStringCellValue().trim();
					value = trim(value, ' ');
					value = trim(value, '?');
					return value;
				}
			}
		}
		
		return "";
	}
	
	//去掉头尾的特殊符号
	public String trim(String value, char c) {
		value = value.trim();
		
		int len = value.length();
		int st = 0;
		while ((st < len) && (value.charAt(st) == c)) {
		    st++;
		}
		while ((st < len) && (value.charAt(len-1) == c)) {
			len--;
		}
		
		return ((st > 0) || (len < value.length())) ? value.substring(st, len) : value;
	}
}
