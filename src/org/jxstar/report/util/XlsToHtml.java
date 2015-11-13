/*
 * XlsToHtml.java 2010-11-12
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.util;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.util.CellRangeAddress;

import org.jxstar.report.ReportException;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.log.Log;
import org.jxstar.util.resource.JsMessage;

/**
 * 解析xls文件为html文件。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-12
 */
public class XlsToHtml {
	private Log _log = Log.getInstance();
	//解析的html table id
	private static final String PARSERTABLEID = "xls_parser_table";
	//xls单元没有线的边框颜色
	private static final String EMPTYCOLOR = "DBDBDB";
	//模板添加3行3列的空行
	private static final int EMPTY_ROWNUM = 3;
	private static final int EMPTY_COLNUM = 3;

	//解析后的样式
	private static Map<String,String> _mpCss = FactoryUtil.newMap();
	
	public String parserXls(String fileName) throws ReportException {
		//构建报表对象
		HSSFWorkbook hssfWB = ReportXlsUtil.readWorkBook(fileName);
		if (hssfWB == null) {//"没有找到【{0}】报表模板文件！"
			throw new ReportException(JsMessage.getValue("xlstohtml.hint01"), fileName);
		}
		
		HSSFSheet sheet = hssfWB.getSheetAt(0); 
		//取模板中的最后一行，0为起始行
		int lastRowNum = sheet.getLastRowNum();
        if (lastRowNum == 0) {
        	_log.showDebug("xls file row num is 0!!");
        	return "";
        }
        
        //保存xls转后的table的html
        StringBuilder sbTable = new StringBuilder();
        sbTable.append("<table id='"+ PARSERTABLEID +"' class='xls_table' >\n");
        
        //记录空行的行号
        List<Integer> lsemp = FactoryUtil.newList();
        
        //记录有数据的行数，第1行设置宽度
        int hasnum = 0, tableColNum = 0;
        
        //保存每列的宽度，赋值给第1行，因为在IE下，如果第1行不设置列宽度，
        //则设置table-layout:fixed;后台，每列的宽度都平均了，所以每个报表模板第1行必须留空且不能合并
        List<Integer> lswidth = FactoryUtil.newList();
        
        //处理每行
        for (int i = 0; i <= lastRowNum; i++) {
            HSSFRow row = sheet.getRow(i);
            if (row == null) {//表格中间的空行也需要解析
            	lsemp.add(i);
            	sbTable.append("<tr height='22px' >\n{EMPTY_LINE}</tr>\n");
            	continue;
            }
            
            //取最后一列的位置
            int lastCellNum = row.getLastCellNum();
            
            //如果是空行cells的值为-1，添加空行的标识，并记录空行的行号
            if (lastCellNum <= 0) {
            	lsemp.add(i);
            	sbTable.append("<tr height='22px' >\n{EMPTY_LINE}</tr>\n");
            	continue;
            } else {
            	//记录有数据的第一行的列数
            	if (hasnum == 0) tableColNum = lastCellNum + EMPTY_COLNUM;
            	hasnum++;
            }

            //添加tr行
            sbTable.append("<tr height='"+ getHeightPixel(row.getHeightInPoints()) +"px' >\n");
            //_log.showDebug("row=" + i + "; nums=" + cells);
            for (int j = 0; j < tableColNum; j++) {
            	HSSFCell cell = null;
            	if (j < lastCellNum) cell = row.getCell(j);
            	//单元ID
            	String tdid = i + "," + j;
            	
            	//添加空列
            	if (cell == null) {
            		String ls = "";
            		if (hasnum == 1) {
            			//后补的空列宽度为30px
            			int width = (j < lastCellNum) ? 10 : 30;
            			ls = " style='width:"+ width +"px;'";
            			lswidth.add(width);
            		}
            		sbTable.append("\t<td id='"+ tdid +"' class='xls_emp'"+ls+" >&nbsp;</td>\n");
            		
            		continue;
            	}
            	
                //构建td的样式
            	String style = getCellStyle(cell);
            	
            	//根据样式内容取对应的cssName
            	String cssName = getTdCss(style);
            	
            	//取td显示内容
                String value = getCellValue(cell);
                if (value == null || value.length() == 0) {
                	value = "&nbsp;";
                } else {
                	value = value.replaceAll("\\s", "&nbsp;");
                }
            	
                //第1行需要处理列宽，其它行不需要处理
                if (hasnum == 1) {
                	//计算列宽
                	int colw = getWidthPixel(sheet.getColumnWidth(j));
                	lswidth.add(colw);
                    //添加td格
                	sbTable.append("\t<td id='"+ tdid +"' class='"+ cssName +"' style='width:"+ colw +"px;' >" + value + "</td>\n");
                } else {
                	sbTable.append("\t<td id='"+ tdid +"' class='"+ cssName +"' >" + value + "</td>\n");
                }
            }
            sbTable.append("</tr>\n");
        }
        //_log.showDebug(sbTable.toString());
        //在模板底部添加指定数量的空行
        for (int i = 1; i <= EMPTY_ROWNUM; i++) {
        	lsemp.add(lastRowNum + i);
            //添加tr行
            sbTable.append("<tr height='22px' >\n");
            sbTable.append("{EMPTY_LINE}");
            sbTable.append("</tr>\n");
        }
        
        //如果是空行cells的值为-1，补充之前的空行
        if (tableColNum > 0 && lsemp.size() > 0) {
        	sbTable = fillEmptyLine(sbTable, tableColNum, lsemp, lswidth);
        	lsemp.clear();
        }
        
        sbTable.append("</table>\n");
        
        //保存html脚本
        StringBuilder sbHtml = new StringBuilder();
        sbHtml.append("<html>\n<body style='margin:1px;'>\n");
        sbHtml.append(getCssStyle());
        sbHtml.append(sbTable);
        
        //处理表格中的合并单元格
        sbHtml.append(mergedRegion(sheet));
        
        //添加html尾
        sbHtml.append("</body>\n</html>\n");
        //_log.showDebug(sbHtml.toString());
		
		return sbHtml.toString();
	}
	
	/**
	 * 替换html中的空行
	 * @param sbHtml -- 原html的内容
	 * @param cells -- 单元格数量
	 * @param lsemp -- 空行的行号
	 * @param lswidth -- 各列的宽度，设置第0行的各列的宽度
	 * @return
	 */
	private StringBuilder fillEmptyLine(StringBuilder sbHtml, int cells, 
								List<Integer> lsemp, List<Integer> lswidth) {
		String oldHtml = sbHtml.toString();
		//_log.showDebug("lsemp=" + lsemp.toString());
		_log.showDebug("lswidth=" + lswidth.toString());
		//_log.showDebug("html old=" + sbHtml.toString());
		
		for (int i = 0; i < lsemp.size(); i++) {
			StringBuilder sbEmpty = new StringBuilder();
			
			int row = lsemp.get(i);
			for (int j = 0; j < cells; j++) {
            	//单元ID
            	String tdid = row + "," + j;
				
            	//给第0行，空行各列设置宽度
            	String width = "";
            	if (row == 0 && lswidth.size() > 0) {
            		width = "style='width:"+ lswidth.get(j) +"px;' ";
            	} 
            	sbEmpty.append("\t<td id='"+ tdid +"' class='xls_emp' "+ width +">&nbsp;</td>\n");
			}
			
			//_log.showDebug("html empty=" + sbEmpty.toString());
			oldHtml = oldHtml.replaceFirst("\\{EMPTY_LINE\\}", sbEmpty.toString());
		}
		//_log.showDebug("html new=" + oldHtml.toLowerCase());
		
		return new StringBuilder(oldHtml);
	}
	
	/**
	 * 处理表格中的合并单元格
	 * @param sheet -- 报表对象
	 * @return
	 */
	private String mergedRegion(HSSFSheet sheet) {
        //取所有的合并单元格
        int mergnum = sheet.getNumMergedRegions();
        _log.showDebug("xls file merg cell num is: " + mergnum);
        
        if (mergnum <= 0) return "";
        
        StringBuilder sbJs = new StringBuilder();
        sbJs.append("<script>\n");
        sbJs.append("var xlsmerged = function(){\n");
        
        //保存所有合并单元的位置
        StringBuilder sbMergpos = new StringBuilder();
        
        //分别处理每个合并单元格
        for (int i = 0; i < mergnum; i++) {
        	CellRangeAddress range = sheet.getMergedRegion(i);
        	int y1 = range.getFirstColumn();
        	int x1 = range.getFirstRow();
        	
        	int y2 = range.getLastColumn();
        	int x2 = range.getLastRow();
        	
        	String curid = x1 + "," + y1;
        	//设置合并的行数
        	int rowspan = x2 - x1 + 1;
        	int colspan = y2 - y1 + 1;
        	sbJs.append("\tvar curdom = document.getElementById('"+ curid +"');\n");
        	sbJs.append("\tcurdom.style.width = '';\n");
        	sbJs.append("\tcurdom.rowSpan = "+ rowspan +";\n");
        	sbJs.append("\tcurdom.colSpan = "+ colspan +";\n");
        	
        	//循环处理范围内每个cell，左上角第一个不处理
        	for (int j = x1; j <= x2; j++) {
        		for (int k = y1; k <= y2; k++) {
        			if (j == x1 && k == y1) continue;
        			
        			sbMergpos.append('\'').append(j).append(',').append(k).append("',");
        		}
        	}
        	_log.showDebug("xls file merg cell range:" + x1 + "," + y1 + "-" + x2 + "," + y2);
		}
        String spos = sbMergpos.substring(0, sbMergpos.length()-1);
        sbJs.append("\tvar mergpos = ["+ spos +"];\n");
        sbJs.append("\tfor (var i = 0, n = mergpos.length; i < n; i++) {\n");
        sbJs.append("\t\tdocument.getElementById(mergpos[i]).style.display = 'none';\n");
        sbJs.append("\t}\n");
        sbJs.append("};\nxlsmerged();\n");
        sbJs.append("</script>\n");
        
		return sbJs.toString();
	}
	
	/**
	 * 解析xls样式为html样式
	 * @param cell -- xls单元格
	 * @return
	 */
	private String getCellStyle(HSSFCell cell) {
		HSSFCellStyle style = cell.getCellStyle();
		HSSFSheet sheet = cell.getSheet();
		String value = getCellValue(cell);
		
		//返回样式内容
		StringBuilder sbStyle = new StringBuilder();
		
		//解析边框样式
		sbStyle.append(getBorderStyle(style));
		
		//解析对齐方式
		sbStyle.append(getAlignStyle(style));
		
		//处理字体样式
		HSSFFont font = style.getFont(sheet.getWorkbook());
		sbStyle.append(getFontStyle(font));
		
    	//没有内容的cell字体颜色采用红色
        if (value == null || value.length() == 0) {
        	sbStyle.append("color:red;");
        }
		
		return sbStyle.toString();
	}
	
	/**
	 * 取单元格中的值
	 * @param cell
	 * @return
	 */
	private String getCellValue(HSSFCell cell) {
		String value = null;
		if (cell.getCellType() == HSSFCell.CELL_TYPE_STRING) {
			value = cell.getStringCellValue();
		} else if (cell.getCellType() == HSSFCell.CELL_TYPE_NUMERIC) {
			value = Double.toString(cell.getNumericCellValue());
		} else if (cell.getCellType() == HSSFCell.CELL_TYPE_BOOLEAN) {
			value = Boolean.toString(cell.getBooleanCellValue());
		} else {
			value = "";
		}
		if (value != null) {
			value = value.trim();
		} else {
			value = "";
		}
		
		return value;
	}
	
	/**
	 * 取字体样式
	 * @param style -- xls样式对象
	 * @return
	 */
	private String getFontStyle(HSSFFont font) {
		StringBuilder sbStyle = new StringBuilder();
		
		//控制大号字不换行
		sbStyle.append("word-break:keep-all;");
		sbStyle.append("font-family:" + font.getFontName() + ";");
		sbStyle.append("font-size:" + font.getFontHeightInPoints() + "pt;");
		
		short bold = font.getBoldweight();
		if (bold == Font.BOLDWEIGHT_BOLD) {
			sbStyle.append("font-weight:bold;");
		}
		
		return sbStyle.toString();
	}
	
	/**
	 * 取边框样式
	 * @param style -- xls样式对象
	 * @return
	 */
	private String getBorderStyle(HSSFCellStyle style) {
		StringBuilder sbStyle = new StringBuilder();
		
		//解析cell边框
		short lw = style.getBorderLeft();
		String lc = "000";
		if (lw == 0) {
			lw = 1;
			lc = EMPTYCOLOR;
		}
		sbStyle.append("border-left:" + lw + "px solid #" + lc + ";");
		
		short tw = style.getBorderTop();
		String tc = "000";
		if (tw == 0) {
			tw = 1;
			tc = EMPTYCOLOR;
		}
		sbStyle.append("border-top:" + tw + "px solid #" + tc + ";");
		
		//如果左与上边框都没有，则不右与下边框
		if (lc.equals(EMPTYCOLOR) && tc.equals(EMPTYCOLOR)) {
			return sbStyle.toString();
		}
		
		short rw = style.getBorderRight();
		String rc = "000";
		if (rw == 0) {
			rw = 1;
			rc = EMPTYCOLOR;
		}
		sbStyle.append("border-right:" + rw + "px solid #" + rc + ";");
		
		short bw = style.getBorderBottom();
		String bc = "000";
		if (bw == 0) {
			bw = 1;
			bc = EMPTYCOLOR;
		}
		sbStyle.append("border-bottom:" + bw + "px solid #" + bc + ";");
		
		return sbStyle.toString();
	}
	
	/**
	 * 取对齐方式
	 * @param style -- xls样式对象
	 * @return
	 */
	private String getAlignStyle(HSSFCellStyle style) {
		//取水平对齐方式
		short align = style.getAlignment();
		String strAlign = "text-align:left;";
		if (align == CellStyle.ALIGN_CENTER) {
			strAlign = "text-align:center;";
		} else if (align == CellStyle.ALIGN_RIGHT) {
			strAlign = "text-align:right;";
		}
		
		//取垂直对齐方式
		short valign = style.getVerticalAlignment();
		String strVAlign = "vertical-align:bottom;";
		if (valign == CellStyle.VERTICAL_CENTER) {
			strVAlign = "vertical-align:middle;";
		} else if (valign == CellStyle.VERTICAL_TOP) {
			strVAlign = "vertical-align:top;";
		}
		
		return strAlign+strVAlign;
	}
	
	/**
	 * 取样式脚本
	 * @return
	 */
	private String getCssStyle() {
		if (_mpCss.isEmpty()) return "";
		
		StringBuilder sbStyle = new StringBuilder();
		sbStyle.append("\n<style type='text/css'>\n");
		//添加表格样式，添加到main.css文件中了
		//sbStyle.append("\t.xls_table {border-collapse:collapse;table-layout:fixed;border:1px solid #"+EMPTYCOLOR+";border-width:1 0 0 1px;cursor:pointer;}\n");
		//添加空列的样式
		//sbStyle.append("\t.xls_emp {border:1px solid #"+EMPTYCOLOR+";border-width:0 1 1 0px;color:red;}\n");
		
		Iterator<String> itr = _mpCss.keySet().iterator();
		while (itr.hasNext()) {
			String key = itr.next();
			String value = _mpCss.get(key);
			sbStyle.append("\t."+ value +" {"+ key +"}\n");
		}
		
		sbStyle.append("</style>\n");
		
		return sbStyle.toString();
	}
	
	/**
	 * 根据td样式内容取样式的名称，如果没有则新添加样式。
	 * @param style -- 样式内容
	 * @return
	 */
	private String getTdCss(String style) {
		String css = "";
		
		if (_mpCss.containsKey(style)) {
			return _mpCss.get(style);
		} else {
			css = "xls_td" + _mpCss.size();
			_mpCss.put(style, css);
		}
		
		return css;
	}
	
	/**
	 * xls的高度换算为html的像素，换算后有时会存在1个像素的偏差。
	 * @param h -- xls的高度
	 * @return
	 */
	private int getHeightPixel(float h) {
		double pixels = 3.78;	//每毫米像素数
		double points = 2.83;	//每毫米点数
		//大约与h*4/3相等
		return (int) (h*pixels/points);
	}
	
	/**
	 * xls的宽度换算为html的像素，换算后有时会存在1个像素的偏差。
	 * @param w -- xls的宽度
	 * @return
	 */
	private int getWidthPixel(int w) {
		int factor = 256;
		int offset = 7;
		//大约与w*11/400相等
		return (int) w*offset/factor;
	}
}
