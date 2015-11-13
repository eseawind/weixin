package org.jxstar.report.xls;

import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportXlsUtil;
import org.jxstar.total.util.TotalDao;
import org.jxstar.total.util.TotalUtil;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringFormat;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;

/**
 * 把统计报表的数据输出到xls模板中。
 *
 * @author TonyTan
 * @version 1.0, 2011-12-5
 */
public class ReportXlsTotal extends ReportXls {
	//统计报表参数值
	private Map<String,String> _mpParamData = FactoryUtil.newMap();
	//统计报表参数名
	private List<Map<String,String>> _lsParamCol = FactoryUtil.newList();
	//统计报表结果集
	private List<Map<String,String>> _lsTotalData = FactoryUtil.newList();
	
	/**
	 * 取出前台传到后台的统计结果数据
	 */
	public void initReport(Map<String, Object> mpParam) throws ReportException {
		super.initReport(mpParam);
		_log.showDebug("excel total report output init ...");
		
		@SuppressWarnings("unchecked")
		Map<String,Object> allParams = (Map<String,Object>) mpParam.get("all_params");
		
		String reportId = MapUtil.getValue(allParams, "reportId");
		if (reportId.length() == 0) {
			throw new ReportException(JsMessage.getValue("reportxls.error01"));
		}
		
		_lsParamCol = TotalDao.queryRequestParam(reportId);
		if (!_lsParamCol.isEmpty()) {
			_mpParamData = getTotalParam(_lsParamCol, allParams);
		}
		
		//取所有输出字段
		String allfields = MapUtil.getValue(allParams, "allfields");
		if (allfields.length() == 0) {
			throw new ReportException("allfields is null, not total fields!!");
		} else {
			_lsTotalData = getTotalData(allfields.split(","), allParams);
		}
	}

	/**
	 * 输出统计报表的数据
	 */
	public Object output() throws ReportException {
		_log.showDebug("excel total report output ...");
		String area_num = _mpMainArea.get("page_size");
		if (area_num.length() == 0) {//"报表输出错误：报表区域每页行数不能为空！"
			throw new ReportException(JsMessage.getValue("reportxlsgrid.hint01"));
		}
		//统计报表字段名
		List<Map<String,String>> lsTotalCol = TotalUtil.queryColumn(_reportId);

		//报表输出开始行
		int pos = 0;
		//报表每页行数
		int pageSize = Integer.parseInt(area_num);
		//报表页数
		int pageNum = ReportXlsUtil.calPageNum(_lsTotalData.size(), pageSize);
		
		//每输出一页构建一个临时报表对象
		HSSFWorkbook tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
		HSSFSheet tmpsheet = tmpwb.getSheetAt(0);

		HSSFSheet sheet = _hssfWB.getSheetAt(0);

		//输出所有报表页
		for (int i = 0; i < pageNum; i++) {
			pos = i * pageSize;

			if (i == 0) {
				sheet = fillGrid(sheet, _lsTotalData, lsTotalCol, pageSize, pos, i + 1, pageNum);
				//输出报表参数
				if (!_mpParamData.isEmpty()) sheet = fillParam(sheet, _mpParamData, _lsParamCol, i + 1, pageNum);
			} else {
				tmpsheet = fillGrid(tmpsheet, _lsTotalData, lsTotalCol, pageSize, pos, i + 1, pageNum);
				//输出报表参数
				if (!_mpParamData.isEmpty()) tmpsheet = fillParam(tmpsheet, _mpParamData, _lsParamCol, i + 1, pageNum);

				//每输出一页临时报表，就添加到原报表中
				sheet = ReportXlsUtil.appendSheet(sheet, tmpsheet);
				tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
				tmpsheet = tmpwb.getSheetAt(0);
			}
			//强制执行SHEET中的计算公式，由于目标位置原因，只有第一页有效
			if (i == 0) sheet.setForceFormulaRecalculation(true);
			
			//判断报表是否允许输出
			if (!ReportXlsUtil.isAllowOut(sheet)) break;
		}
		
		return _hssfWB;
	}
	
	/**
	 * 输出报表参数
	 * @param sheet
	 * @param mpData
	 * @param lsField
	 * @param curPage
	 * @param sumPage
	 * @return
	 */
	private static HSSFSheet fillParam(HSSFSheet sheet,
		  	Map<String,String> mpData,
		  	List<Map<String,String>> lsField,
			int curPage, int sumPage) {
		if (lsField == null || mpData == null) {
			return sheet;
		}
		if (lsField.isEmpty() || mpData.isEmpty()) {
			_log.showDebug("data is empty or field is null!");
			return sheet;
		}
		
		//单元格的值
		String strValue = "";
		for (int i = 0, n = lsField.size(); i < n; i++ ) {
			Map<String,String> mpField = lsField.get(i);
			
			String strStyle = mpField.get("format");				//字段格式
			String strColName = mpField.get("param_name");				//字段名称
			String strColCode = (mpField.get("param_code")).toLowerCase();		//字段编码
			
			int[] posi = getPosition(mpField.get("param_pos"));
			if (posi.length != 2) {
				_log.showWarn(strColName + " ["+mpField.get("param_pos")+"] position is error!");
				continue;
			}
			
			if (strColCode.equalsIgnoreCase("{CURDATE}")) {
			//当前日期
				strValue = StringFormat.getDataValue(DateUtil.getTodaySec(), strStyle);
			} else if (strColCode.equalsIgnoreCase("{CURPAGENUM}")) {
			//当前所在页数
				strValue = Integer.toString(curPage);
			} else if (strColCode.equalsIgnoreCase("{CURSUMPAGE}")) {
			//当前共页数
				strValue = Integer.toString(sumPage);
			} else {
			//设置cell的显示值
				strValue = MapUtil.getValue(mpData, strColCode);
				strValue = StringFormat.getDataValue(strValue, strStyle);
			}
			
			//获取指定的单元格
			HSSFRow row = sheet.getRow(posi[0]);
			if (row == null) row = sheet.createRow(posi[0]);
			HSSFCell cell = row.getCell(posi[1]);
			if (cell == null) cell = row.createCell(posi[1]);
			//填充单元格内容
			cell.setCellValue(strValue.trim());
		}
		
		return sheet;
	}
	
	/**
	 * 输出表格数据
	 * @param sheet
	 * @param lsData
	 * @param lsField
	 * @param pageSize
	 * @param pos
	 * @param curPage
	 * @param sumPage
	 * @return
	 */
	private static HSSFSheet fillGrid(HSSFSheet sheet, 
			List<Map<String,String>> lsData,
			List<Map<String,String>> lsField,
			int pageSize, int pos, int curPage, int sumPage) {
		if (lsField == null || lsData == null) {
			_log.showWarn("data is null or field is null!");
			return sheet;
		}
		
		if (lsField.isEmpty() || lsData.isEmpty()) {
			_log.showDebug("data is empty or field is null!");
			return sheet;
		}
		
		HSSFRow row = null;					//excel的行对象
		HSSFCell cell = null;				//excel的列对象
		String strValue = null;				//每个格的信息内容
		Map<String,String> mpData = null;	//每条记录数据
		Map<String,String> mpField = null;	//每条个字段的信息
		
		int posi = (pageSize > 0 && pos >= 0)?pos:0;
		int cnt = (pageSize <= 0)?lsData.size():pageSize + posi;
		int[] posis = new int[2];
		int index = 0, rowIndex = 0;
		String strColName = null, strColCode = null;
		
		for (rowIndex = posi, index = 0; rowIndex < cnt; rowIndex++, index++) {
			if (lsData.size() <= rowIndex) break;					//如果rowIndex大于记录数
			mpData = lsData.get(rowIndex);
			
			for (int i = 0, n = lsField.size(); i < n; i++ ) {
				mpField = lsField.get(i);
				
				String format = MapUtil.getValue(mpField, "format");
				strColName = mpField.get("display");				//字段名称
				strColCode = mpField.get("col_code").toLowerCase();	//字段编码
				
				posis = getPosition(mpField.get("col_pos"));
				if (posis.length != 2) {
					_log.showDebug(strColName + " ["+mpField.get("col_pos")+"] position is null!");
					continue;
				}
				//_log.showDebug("col_code=" + strColCode + " col_pos=" + posis[0]+","+posis[1]);
				
				row = sheet.getRow(posis[0] + index);
				if (row == null) row = sheet.createRow(posis[0] + index);
				
				cell = row.getCell(posis[1]);
				if (cell == null) cell = row.createCell(posis[1]);
				
				if (strColCode.equalsIgnoreCase("{CURDATE}")) {
				//当前日期
					strValue = StringFormat.getDataValue(DateUtil.getTodaySec(), format);
				} else if (strColCode.equalsIgnoreCase("{NUMBER}")) {
				//输出序号
					strValue = Integer.toString(rowIndex+1);
				} else if (strColCode.equalsIgnoreCase("{CURPAGENUM}")) {
				//当前所在页数
					strValue = Integer.toString(curPage);
				} else if (strColCode.equalsIgnoreCase("{CURSUMPAGE}")) {
				//当前共页数
					strValue = Integer.toString(sumPage);
				} else {
				//设置cell的显示值
					strValue = MapUtil.getValue(mpData, strColCode);
					strValue = StringFormat.getDataValue(strValue, format);
				}
				//处理单元格类型，方便表格中的计算公式生效
				if (format.equals("int") || format.indexOf("num") == 0) {
					if (strValue.length() == 0) strValue = "0";
					cell.setCellValue(Double.parseDouble(strValue));
				} else {
					cell.setCellValue(strValue.trim());
				}
			}
		}
		
		return sheet;
	}

	//从前台参数中取统计参数
	private Map<String,String> getTotalParam(
			List<Map<String,String>> lsParam, Map<String,Object> allParams) {
		Map<String,String> mpRet = FactoryUtil.newMap();
		
		for (int i = 0, n = lsParam.size(); i < n; i++) {
			Map<String,String> mpParam = lsParam.get(i);
			String param_code = mpParam.get("param_code");
			String param_value = MapUtil.getValue(allParams, param_code);
			_log.showDebug("................total param code:" + param_code + "; param value:" + param_value);
			
			mpRet.put(param_code, param_value);
		}
		return mpRet;
	}
	
	//从前台参数中取统计数据
	private List<Map<String,String>> getTotalData(
			String[] codes, Map<String,Object> allParams) {
		List<Map<String,String>> lsRet = FactoryUtil.newList();
		if (codes.length == 0) return lsRet;
		
		//取所有字段的值
		List<String[]> lsData = FactoryUtil.newList();
		for (int i = 0, n = codes.length; i < n; i++) {
			String value = MapUtil.getValue(allParams, codes[i]);
			_log.showDebug("................total data code:" + codes[i] + "; data value:" + value);
			
			if (value.length() == 0) continue;
			lsData.add(value.split(","));
		}
		
		//取记录数据行数，最后一行数据是标志行，用于处理,分隔值为空的问题
		int rownum = lsData.get(0).length - 1;
		if (rownum <= 0) return lsRet;
		
		//检查字段值数组的长度是否一致
		for (int i = 0, n = lsData.size(); i < n; i++) {
			if (rownum != lsData.get(i).length - 1) {
				_log.showError("统计字段值数组的长度不一致！");
				return lsRet;
			}
		}
		
		//把数据存为一个表格
		for (int r = 0; r < rownum; r++) {
			Map<String,String> mpRow = FactoryUtil.newMap();
			for (int i = 0, n = lsData.size(); i < n; i++) {
				mpRow.put(codes[i], lsData.get(i)[r]);
			}
			lsRet.add(mpRow);
		}
		
		return lsRet;
	}
	
    protected static int[] getPosition(String position) {
        int [] ret = new int[0];
        if (position == null || position.length() == 0) {
            return ret;
        }
        String[] strRet = position.split(",");
        if (strRet.length != 2) return ret;

        ret = new int[2];
        ret[0] = Integer.parseInt(strRet[0]);   //行
        ret[1] = Integer.parseInt(strRet[1]);   //列

        return ret;
    }
}
