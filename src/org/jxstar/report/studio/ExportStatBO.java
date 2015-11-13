/*
 * ExportStatBO.java 2010-12-14
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.studio;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFName;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.jxstar.control.action.RequestContext;
import org.jxstar.report.util.ReportXlsUtil;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.StringValidator;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.resource.JsMessage;

/**
 * 导出分组统计中的数据xls文件中。
 *
 * @author TonyTan
 * @version 1.0, 2010-12-14
 */
public class ExportStatBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	//取创建xls对象的公共方法
	private ExportXlsBO expXls = new ExportXlsBO();

	public String exportXls(RequestContext request) {
		//取统计数据，第一行是标题，第二行开始是数据
		String expText = request.getRequestValue("exp_text");
		String chartType = request.getRequestValue("chart_type");
		String charTitle = request.getRequestValue("selchar");
		String numTitle = request.getRequestValue("selnum");
		
		if (expText.length() == 0) {
			setMessage("没有统计数据！");
			return _returnFaild;
		}
		String[] expTexts = expText.split("\n");
		int explen = expTexts.length;
		_log.showDebug(".............exp text rownum=" + explen);
		if (explen < 2) {
			setMessage("统计数据为空！");
			return _returnFaild;
		}
		
		HSSFWorkbook wb = readWorkbook(chartType);
		if (wb == null) {
			setMessage("/report/tpl/目录下的统计图表模板文件找不到！");
			return _returnFaild;
		}
		
		//取统计数据的标题
		String[] titles = expTexts[0].trim().split(",");
		//取统计数据值
		String[][] contents = new String[explen-1][];
		for (int i = 1, n = explen; i < n; i++) {
			contents[i-1] = expTexts[i].trim().split(",");
		}
		
		//修改统计名称信息
		updateChartName(titles, charTitle, numTitle, wb);
		
		//设置响应头信息
		request.setRequestValue("ContentType", "application/vnd.ms-excel");
		//"分组统计数据.xls"
		request.setRequestValue("Attachment", JsMessage.getValue("exportstatbo.stat"));
		//返回xls文件对象
		HSSFWorkbook wbRet = writeBook(contents, titles, wb);
		request.setReturnObject(wbRet);
		
		_log.showDebug("---------file output end!");
		
		return _returnSuccess;
	}
	
	/**
	 * 把数据写入workbook中
	 * @param lsData -- 数据内容
	 * @param lsCol -- 字段列表
	 * @return
	 */
	private HSSFWorkbook writeBook(String[][] contents, String[] titles, HSSFWorkbook wb) {
		//新建一个sheet
		HSSFSheet sheet = wb.getSheetAt(0);
		
		//设置sheet页名称
		String title = "分组统计数据";
		wb.setSheetName(0, title);

		//创建数据cell样式
		HSSFCellStyle cellStyle = expXls.createCellStyle(wb);
		
		//建标题区域
		sheet = createTitleArea(title, titles, sheet);
		//建数据区域
		for (int i = 0, n = contents.length; i < n; i++) {
			String[] rowconts = contents[i];
			
			HSSFCell sfCell = null;
			HSSFRow hfRow = sheet.createRow(i+2);
			for (int j = 0, m = rowconts.length+1; j < m; j++) {
				sfCell = hfRow.createCell(j);
				if (j == 0) continue;
				String value = rowconts[j-1];
				
				//是否为数字，设置不同的样式
				boolean isDouble = StringValidator.validValue(value, 
						StringValidator.DOUBLE_TYPE);
				//第一列为标题显示文本；科学计数法的值都显示为文本
				boolean isNum = false;
				if (j > 1 && isDouble && value.length() > 0) {
					String v = Double.toString(Double.parseDouble(value));
					if (v.indexOf('E') < 0) isNum = true;
				}
				if (isNum) {
					sfCell.setCellType(HSSFCell.CELL_TYPE_NUMERIC);
					sfCell.setCellValue(Double.parseDouble(value));
				} else {
					sfCell.setCellType(HSSFCell.CELL_TYPE_STRING);
					sfCell.setCellValue(value);
				}
				sfCell.setCellStyle(cellStyle);
			}
		}
		
		return wb;
	}
	
	/**
	 * 设置输出文件的头部
	 * @param fileTitle -- 表格标题
	 * @param titles -- 字段标题数组
	 * @param sheet -- 表格
	 * @return
	 */
	private HSSFSheet createTitleArea(String fileTitle, String[] titles, HSSFSheet sheet) {
		HSSFCell sfCell = null;
		int rsCnt = titles.length+1;
		 HSSFWorkbook wb = sheet.getWorkbook();
		//创建标题样式
		HSSFCellStyle titleStyle = expXls.createTitleStyle(wb);
		//创建表头样式
		HSSFCellStyle headerStyle = expXls.createHeadStyle(wb);

		//第一行，设置标题，第1列为空
		HSSFRow hfRow = sheet.createRow(0);
		hfRow.setHeightInPoints(25);
		for (int i = 0, n = rsCnt; i < n; i++) {
			sfCell = hfRow.createCell(i);
			sheet.setColumnWidth(i, 4000);//设置每列的宽度
		}
		sfCell = hfRow.getCell(0);
		sheet.setColumnWidth(0, 448); //设置第一列的宽度
		//合并单元格
		CellRangeAddress range = new CellRangeAddress(0, 0, 1, rsCnt-1);
		sheet.addMergedRegion(range);

		//设置标题单元格样式和内容
		sfCell = hfRow.getCell(1);
		sfCell.setCellType(HSSFCell.CELL_TYPE_STRING);
		sfCell.setCellValue(fileTitle);
		sfCell.setCellStyle(titleStyle);

		//第二行，设置列表头
		hfRow = sheet.createRow(1);
		for (int i = 0, n = rsCnt; i < n; i++) {
			sfCell = hfRow.createCell(i);
			if (i == 0) continue;
			
			String colname = titles[i-1];
			sfCell.setCellType(HSSFCell.CELL_TYPE_STRING);
			sfCell.setCellValue(colname);
			sfCell.setCellStyle(headerStyle);
		}
		
		return sheet;
	}
	
	/**
	 * 根据图表类型读取模板文件
	 * @param chartType
	 * @return
	 */
	private HSSFWorkbook readWorkbook(String chartType) {
		String fileName = SystemVar.REALPATH + "/report/tpl/";
		if (chartType.equals("columnchart")) {
			fileName += "TplColumn.xls";
		} else if (chartType.equals("linechart")) {
			fileName += "TplLine.xls";
		} else if (chartType.equals("piechart")) {
			fileName += "TplPie.xls";
		} else {
			return null;
		}
		return ReportXlsUtil.readWorkBook(fileName);
	}
	
	/**
	 * 修改excle模板中的名称信息，模板中定义了两个名称：
	 * s1y=OFFSET(Sheet1!$C$3,0,0,COUNTA(Sheet1!C:C)-1,1) -- 用于纵轴
	 * s2y=OFFSET(Sheet1!$B$3,0,0,COUNTA(Sheet1!B:B)-1,1) -- 用于横轴
	 * @param titles -- 所有标题
	 * @param chars -- 横轴标题
	 * @param nums -- 纵轴标题
	 * @param wb -- 表格
	 * @return
	 */
	private boolean updateChartName(String[] titles, String chars, String nums, HSSFWorkbook wb) {
		//注意第1列为空，所以序号要加1
		char x_no = 'B', y_no = 'C';
		for (int i = 0, n = titles.length; i < n; i++) {
			if (chars.equals(titles[i])) {
				x_no = (char)(65+i+1);
			} else if (nums.equals(titles[i])) {
				y_no = (char)(65+i+1);
			}
		}
		
		//取表单中的名称信息
		HSSFName s1y = wb.getName("s1y");
		HSSFName s2y = wb.getName("s2y");
		if (s1y == null || s2y == null) {
			_log.showWarn("chart tpl HSSFName s1y is null or s2y is null!!");
			return false;
		}
		
		_log.showDebug(".............x_no=" + x_no + ";y_no=" + y_no);
		s1y.setRefersToFormula("OFFSET(Sheet1!$"+y_no+"$3,0,0,COUNTA(Sheet1!"+y_no+":"+y_no+")-1,1)");
		s2y.setRefersToFormula("OFFSET(Sheet1!$"+x_no+"$3,0,0,COUNTA(Sheet1!"+x_no+":"+x_no+")-1,1)");
		
		return true;
	}
}
