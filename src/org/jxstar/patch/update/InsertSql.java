/*
 * InsertSqlBO.java 2012-3-15
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.patch.update;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.jxstar.dao.DaoParam;
import org.jxstar.dao.util.BigFieldUtil;
import org.jxstar.dao.util.SQLParseException;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.ArrayUtil;
import org.jxstar.util.FileUtil;
import org.jxstar.util.MapUtil;

/**
 * 根据功能ID或者模块ID，生成所有系统表的Insert Into语句。
 *
 * @author Jerry.Chao, Tony.Tan
 * @version 1.0, 2012-3-15
 */
public class InsertSql extends BusinessObject {
	private static final long serialVersionUID = 1L;
	//文件保存路径
	public String save_path = "D:/export/";
	//导出SQL文件名
	public String exp_sql_name = "exp_insert.sql";
	//项目的绝对路径
	public String realPath = "";
	
	/**
	 * 导出多个模块的SQL到文件中
	 * @param moduleIds
	 */
	public void modExpToFile(String[] moduleIds,String expDmcfg,String isNew,String expModule,
			String expControl,String expCtlSel,String expXls) {
		StringBuilder sbInsert = new StringBuilder();
		for (String moduleId : moduleIds) {
			sbInsert.append(modExpSql(moduleId,expDmcfg,isNew,expModule,expControl,expCtlSel,expXls));
		}
		
		String fileName = save_path + exp_sql_name;
		FileUtil.saveFileUtf8(fileName, sbInsert.toString());
	}
	
	/**
	 * 导出多个功能的SQL到文件中
	 * @param funIds
	 */
	public void funExpToFile(String[] funIds,String expDmcfg,String isNew,String expModule,
			String expControl,String expCtlSel,String expXls) {
		StringBuilder sbInsert = new StringBuilder();
		for (String funId : funIds) {
			sbInsert.append(funExpSql(funId));
			//把功能的grid页面和form页面、扩展页面导出
			ExportSqlUtil.expFunPage(funId, realPath, save_path + "page");
		}
		String funs = ArrayUtil.arrayToString(funIds, "','");
		funs = funs.substring(0, funs.length()-1);
		
		if(expDmcfg.equals("1")){
			//导出数据建模信息
			String status = (isNew.equals("1")) ? "1":"0";
			String funWhere = "where fun_id in ('"+ funs + ")";
			sbInsert.append(expDmSql(funWhere,status));
		}
		sbInsert.append(expRelaSql("", funs, expDmcfg, isNew, expModule, expControl, expCtlSel, expXls));
		
		String fileName = save_path + exp_sql_name;
		FileUtil.saveFileUtf8(fileName, sbInsert.toString());
	}
	
	/**
	 * 根据模块ID取该模块下所有功能的系统配置表信息
	 * @param moduleId -- 模块ID
	 * @return
	 */
	public StringBuilder modExpSql(String moduleId,String expDmcfg,String isNew,String expModule,
			String expControl,String expCtlSel,String expXls) {
		List<String> lsFunId = ExportSqlUtil.moduleFunId(moduleId);
		
		StringBuilder sbInsert = new StringBuilder();
		for (String funId : lsFunId) {
			sbInsert.append(funExpSql(funId));
			//把功能的grid页面和form页面、扩展页面导出
			ExportSqlUtil.expFunPage(funId, realPath, save_path + "page");
		}
		
		if(expDmcfg.equals("1")){
			//导出数据建模信息
			String funWhere = "where module_id like '"+ moduleId +"%'";
			sbInsert.append(expDmSql(funWhere,isNew));
		}
		String funs = ArrayUtil.listToString(lsFunId, "','");
		funs = funs.substring(0, funs.length()-1);
		
		sbInsert.append(expRelaSql(moduleId, funs, expDmcfg, isNew, expModule, expControl, expCtlSel, expXls));
		
		return sbInsert;
	}
	
	/**
	 * 导出完功能的insert into语句，是否还导出相关的选项控件、选择窗口、模块定义、XLS导入定义、数据模型定义信息
	 */
	private StringBuilder expRelaSql(String moduleId,String funs,String expDmcfg,String isNew,String expModule,
			String expControl,String expCtlSel,String expXls) {
		StringBuilder sbInsert = new StringBuilder();
		
		if(expModule.equals("1") && moduleId.length() != 0){
			//导出功能模块定义信息
			sbInsert.append("\r\n--export moduleId "+moduleId+"...\r\n");
			int len = sbInsert.toString().length();
			sbInsert.append(batchMakeSQL("funall_module", "module_id like '"+ moduleId +"%'"));
			if(sbInsert.toString().length() > len){
				sbInsert.append("commit;\r\n");
			}
		}
		if(expControl.equals("1")){
			//导出选项控件定义信息
			sbInsert.append("\r\n--export funall_control combo ...\r\n");
			int len = sbInsert.toString().length();
			sbInsert.append(batchMakeSQL("funall_control", "control_type = 'combo' and control_prop <> '8' and control_code in " +
					"(select control_name from fun_col where (col_control = 'combo' or col_control = 'checkbox') and fun_id in ('"+funs+"))"));
			if(sbInsert.toString().length() > len){
				sbInsert.append("commit;\r\n");
			}
		}
		if(expCtlSel.equals("1")){
			//导出选择窗口定义信息
			sbInsert.append("\r\n--export funall_control combowin ...\r\n");
			int len = sbInsert.toString().length();
			sbInsert.append(batchMakeSQL("funall_control", "control_type = 'combowin' and control_prop <> '8' and control_code in " +
					"(select control_name from fun_col where (col_control = 'combowin' or col_control = 'combosel' or col_control = 'selectwin') and fun_id in ('"+funs+"))"));
			if(sbInsert.toString().length() > len){
				sbInsert.append("commit;\r\n");
			}
		}
		if(expXls.equals("1")){
			//导出相关XLS导入定义
			sbInsert.append(expImpSql(funs));
		}
		
		return sbInsert;
	}
	
	/**
	 * 根据功能ID取该功能所有的系统配置表信息
	 * @param funId -- 功能ID
	 * @return
	 */
	public StringBuilder funExpSql(String funId) {
		String[][] tableWheres = getTableWhere();
		
		StringBuilder sbRet = new StringBuilder();
		for (int i = tableWheres.length-1; i >= 0; i--) {
			String[] tableWhere = tableWheres[i];
			String whereSql = tableWhere[1];
			whereSql = whereSql.replace("?", "'"+ funId +"'");
			
			sbRet.append(batchMakeSQL(tableWhere[0], whereSql));
		}
		if(sbRet.toString().length() > 0){
			sbRet.append("commit;\r\n");
			sbRet.insert(0, "\r\n--export funid "+funId+"...\r\n");
		}
		
		return sbRet;
	}
	
	/**
	 * 导出一个表中的所有数据
	 * @param tableName
	 * @return
	 */
	public StringBuilder tableExpSql(String tableName) {
		StringBuilder sbInsert = new StringBuilder();
		sbInsert.append("\r\n--export table ["+ tableName +"]...\r\n");
		sbInsert.append(batchMakeSQL(tableName, ""));
		sbInsert.append("commit;\r\n");
		
		return sbInsert;
	}
	
	/**
	 * 导出数据建模的配置信息
	 * @param funWhere
	 * @return
	 */
	private StringBuilder expDmSql(String funWhere,String isNew) {
		//构建where子句
		String[][] tableWheres = {
			{"dm_fieldcfg", "table_id in (select table_id from dm_tablecfg where table_name in (select table_name from fun_base "+ funWhere +"))"},
			{"dm_indexcfg", "table_id in (select table_id from dm_tablecfg where table_name in (select table_name from fun_base "+ funWhere +"))"},
			{"dm_tablecfg", "table_name in (select table_name from fun_base "+ funWhere +")"}
		};
		
		StringBuilder sbRet = new StringBuilder();
		for (int i = tableWheres.length-1; i >= 0; i--) {
			String[] tableWhere = tableWheres[i];
			sbRet.append(batchMakeSQL(tableWhere[0], tableWhere[1]));
			
			if(isNew.equals("1")){
				sbRet.append("update " + tableWhere[0] + " set state = '1' where " + tableWhere[1] + ";\r\n\r\n");
			}
		}
		if(sbRet.toString().length() > 0){
			sbRet.append("commit;\r\n");
			sbRet.insert(0, "\r\n--export dm config...\r\n");
		}
		
		return sbRet;
	}
	
	/**
	 * 导出相关XLS导入定义
	 * @param funWhere
	 * @return
	 */
	private StringBuilder expImpSql(String funs) {
		//构建where子句
		String[][] tableWheres = {
			{"imp_relat", "imp_id in (select imp_id from imp_list where fun_id in ('" + funs + "))"},
			{"imp_field", "imp_id in (select imp_id from imp_list where fun_id in ('" + funs + "))"},
			{"imp_list",  "fun_id in ('" + funs +")"}
		};
		
		StringBuilder sbRet = new StringBuilder();
		for (int i = tableWheres.length-1; i >= 0; i--) {
			String[] tableWhere = tableWheres[i];
			sbRet.append(batchMakeSQL(tableWhere[0], tableWhere[1]));
		}
		if(sbRet.toString().length() > 0){
			sbRet.append("commit;\r\n");
			sbRet.insert(0, "\r\n--export imp xls config...\r\n");
		}
		
		return sbRet;
	}
	
	/**
	 * 取过滤条件配置信息，要注意顺序，否则删除数据时有问题
	 * @return
	 */
	public String[][] getTableWhere() {
		String[][] strs = {
			{"rpt_param", "area_id in (select area_id from rpt_area where report_id in (select report_id from rpt_list where fun_id = ?))"},
			{"rpt_detail", "area_id in (select area_id from rpt_area where report_id in (select report_id from rpt_list where fun_id = ?))"},
			{"rpt_area", "report_id in (select report_id from rpt_list where fun_id = ?)"},
			{"rpt_head", "report_id in (select report_id from rpt_list where fun_id = ?)"},
			{"rpt_list", "fun_id = ?"},
					
			{"fun_rule_param", "rule_id in (select rule_id from fun_rule_sql where route_id in (select route_id from fun_rule_route where fun_id = ?))"},
			{"fun_rule_param", "rule_id in (select rule_id from fun_rule_sql where route_id = 'noroute' and src_funid = ?)"},
			{"fun_rule_sql", "route_id in (select route_id from fun_rule_route where fun_id = ?)"},
			{"fun_rule_sql", "route_id = 'noroute' and src_funid = ?"},
			{"fun_rule_route", "fun_id = ?"},
			
			{"fun_colext", "col_id in (select col_id from fun_col where fun_id = ?)"},
			{"fun_col", "fun_id = ?"},
			
			{"fun_event_param", "invoke_id in (select invoke_id from fun_event_invoke where event_id in (select event_id from fun_event where fun_id = ?))"},
			{"fun_event_invoke", "event_id in (select event_id from fun_event where fun_id = ?)"},
			{"fun_event", "fun_id = ?"},
			
			{"sys_coderule", "fun_id = ?"},
			{"fun_status", "fun_id = ?"},
			{"fun_attr", "fun_id = ?"},
			{"fun_ext", "fun_id = ?"},
			{"fun_tree", "fun_id = ?"},
			{"fun_design", "fun_id = ?"},
			{"fun_base", "fun_id = ?"}
		};
		
		return strs;
	}
	
	/**
	 * 把查询结果集构建为Insert Into语句
	 * @param tableName -- 表名
	 * @param whereSql -- 过滤条件
	 * @return
	 */
	public StringBuilder batchMakeSQL(String tableName, String whereSql) {
		StringBuilder sbRet = new StringBuilder();
		
		List<Map<String, String>> lsData = queryData(tableName, whereSql);
		for (Map<String, String> mp : lsData) {
			sbRet.append(makeSQL(tableName, mp));
		}
		_log.showDebug("......export end " + tableName);
		
		if (sbRet.length() > 0) {
			sbRet.insert(0, "\r\n--export tablename "+tableName+"...\r\n");
		}
		
		return sbRet;
	}
	
	/**
	 * 根据表名与Where子句查询数据
	 * @param tableName -- 表名
	 * @param whereSql -- 过滤条件
	 * @return
	 */
	private List<Map<String, String>> queryData(String tableName, String whereSql) {
		String sql = "select  *  from " + tableName;
		if (whereSql != null && whereSql.length() > 0) {
			sql += " where " + whereSql;
		}
		
		DaoParam param = _dao.createParam(sql);
		return _dao.query(param);
	}
	
	/**
	 * 构建一条记录的SQL
	 * @param tableName
	 * @param mpData
	 * @return
	 */
	public StringBuilder makeSQL(String tableName, Map<String, String> mpData) {
		if (mpData.isEmpty()) {
			return new StringBuilder(""); 
		}
		
		//保存字段与值的SQL
		StringBuilder sbField = new StringBuilder();
		StringBuilder sbValue = new StringBuilder();
		
		//获取当前记录中所有字段的类型
		Map<String, String> mpType = ExportSqlUtil.getFieldType(tableName);
		if (mpType.isEmpty()) {
			return new StringBuilder(""); 
		}
		
		Set<Entry<String, String>> setData = mpData.entrySet();
		for (Entry<String, String> entry : setData) {
			String fieldName = entry.getKey();
			String fieldValue = entry.getValue();
			
			if (fieldValue == null || fieldValue.length() == 0) {
				fieldValue = "null";
			} else {
				//处理特殊符号
				fieldValue = ExportSqlUtil.toSqlChar(fieldValue);
				
				//取字段的数据类型
				String dataType = mpType.get(fieldName);
				//字符型加单引
				if (dataType.equals("varchar") || dataType.equals("char")) {
					fieldValue = "'"+fieldValue+ "'";
				}  else if (dataType.equals("date")) {
					//日期型 用函数转
					try {
						fieldValue = ExportSqlUtil._parser.parse("{TO_DATETIME}('"+fieldValue+"')");
					} catch (SQLParseException e) {
						e.printStackTrace();
						fieldValue = "null";
					}
				} else if(dataType.equals("blob")) {
					//保存大字段值到文件中 
					saveBlobToFile(tableName, fieldName, mpData);
					
					//导出文件后，值用空值
					fieldValue = "null";
				}
			}
			
			sbField.append(fieldName + ", ");
			sbValue.append(fieldValue+", ");
		}
		
		//构建InsertInto SQL
		StringBuilder sbInsert = new StringBuilder("insert into " + tableName + "(");
		sbInsert.append(sbField.substring(0, sbField.length()-2));
		sbInsert.append(") values(");
		sbInsert.append(sbValue.substring(0, sbValue.length()-2));
		sbInsert.append(");\r\n");
		
		_log.showDebug(sbInsert.toString());
		
		return sbInsert;
	}
	
	/**
	 * 根据表名、主键值，取大字段的值，保存为文件，
	 * 文件名采用表名加主键的格式
	 * @param tableName -- 表名
	 * @param mpData -- 当前记录值
	 */
	private void saveBlobToFile(String tableName, String blobName, Map<String, String> mpData) {
		String keyName = ExportSqlUtil.getKeyName(tableName);
		if (keyName == null || keyName.length() == 0) return;
		
		String keyValue = MapUtil.getValue(mpData, keyName);
		
		String querySql = "select * from "+tableName+" where "+ keyName +"='"+keyValue+"'";
		
		String blobValue = BigFieldUtil.readStream(querySql, blobName, "");
		
		String fileName = save_path + tableName + "/" + tableName + "." + keyValue + ".txt";
		FileUtil.saveFileUtf8(fileName, blobValue);
	}
	
}
