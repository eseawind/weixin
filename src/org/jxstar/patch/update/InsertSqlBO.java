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
import org.jxstar.dao.util.SqlParser;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.ArrayUtil;
import org.jxstar.util.FileUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.factory.SystemFactory;

/**
 * 根据功能ID或者模块ID，生成所有系统表的Insert Into语句。
 *
 * @author Jerry.Chao, Tony.Tan
 * @version 1.0, 2012-3-15
 */
public class InsertSqlBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	//SQL解决器
	private static SqlParser _parser = (SqlParser) SystemFactory.createSystemObject("SqlParser");
	//文件保存路径
	private static String _save_path = "d:/update/";
	//导出SQL文件名
	private static String _exp_sql_name = "exp_insert.sql";
	
	/**
	 * 导出一个模块的SQL到文件中
	 * @param moduleIds
	 */
	public void modExpToFile(String[] moduleIds) {
		StringBuilder sbInsert = new StringBuilder();
		for (String moduleId : moduleIds) {
			sbInsert.append(modExpSql(moduleId));
		}
		
		String fileName = _save_path + _exp_sql_name;
		FileUtil.saveFile(fileName, sbInsert.toString());
	}
	
	/**
	 * 导出多个功能的SQL到文件中
	 * @param funIds
	 */
	public void funExpToFile(String[] funIds) {
		StringBuilder sbInsert = new StringBuilder();
		for (String funId : funIds) {
			sbInsert.append(funExpSql(funId));
		}
		
		//导出数据建模信息
		String funs = ArrayUtil.arrayToString(funIds, "','");
		funs = funs.substring(0, funs.length()-1);
		String funWhere = "where fun_id in ('"+ funs + ")";
		sbInsert.append(expDmSql(funWhere));
		
		String fileName = _save_path + _exp_sql_name;
		FileUtil.saveFile(fileName, sbInsert.toString());
	}
	
	/**
	 * 根据模块ID取该模块下所有功能的系统配置表信息
	 * @param moduleId -- 模块ID
	 * @return
	 */
	public StringBuilder modExpSql(String moduleId) {
		List<String> lsFunId = ExportSqlUtil.moduleFunId(moduleId);
		
		StringBuilder sbInsert = new StringBuilder();
		for (String funId : lsFunId) {
			sbInsert.append(funExpSql(funId));
		}
		
		//导出数据建模信息
		String funWhere = "where module_id like '"+ moduleId +"%'";
		sbInsert.append(expDmSql(funWhere));
		
		return sbInsert;
	}
	
	/**
	 * 根据功能ID取该功能所有的系统配置表信息
	 * @param funId -- 功能ID
	 * @return
	 */
	public StringBuilder funExpSql(String funId) {
		String[][] tableWheres = getTableWhere();
		
		StringBuilder sbInsert = new StringBuilder();
		sbInsert.append("\r\n--export funid "+funId+"...\r\n");
		
		for (int i = tableWheres.length-1; i >= 0; i--) {
			String[] tableWhere = tableWheres[i];
			String whereSql = tableWhere[1];
			if (tableWhere[0].indexOf("rpt_") == 0) {
				whereSql = whereSql.replace("fun_id = ?", "(fun_id like '%"+ funId +"%' or fun_id = '"+ funId +"')");
			} else {
				whereSql = whereSql.replace("?", "'"+ funId +"'");
			}
			
			sbInsert.append(batchMakeSQL(tableWhere[0], whereSql));
		}
		sbInsert.append("commit;\r\n");
		
		return sbInsert;
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
	private StringBuilder expDmSql(String funWhere) {
		//构建where子句
		String[][] tableWheres = {
			{"dm_fieldcfg", "table_id in (select table_id from dm_tablecfg where table_name in (select table_name from fun_base "+ funWhere +"))"},
			{"dm_indexcfg", "table_id in (select table_id from dm_tablecfg where table_name in (select table_name from fun_base "+ funWhere +"))"},
			{"dm_tablecfg", "table_name in (select table_name from fun_base "+ funWhere +")"}
		};
		
		StringBuilder sbInsert = new StringBuilder();
		sbInsert.append("\r\n--export dm config...\r\n");
		
		for (int i = tableWheres.length-1; i >= 0; i--) {
			String[] tableWhere = tableWheres[i];
			sbInsert.append(batchMakeSQL(tableWhere[0], tableWhere[1]));
			
			sbInsert.append("update " + tableWhere[0] + " set state = '1' where " + tableWhere[1] + ";\r\n\r\n");
		}
		sbInsert.append("commit;\r\n");
		
		return sbInsert;
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
			
			{"fun_attr", "fun_id = ?"},
			{"fun_ext", "fun_id = ?"},
			{"fun_tree", "fun_id = ?"},
			{"fun_design", "fun_id = ?"},
			{"fun_base", "fun_id = ?"}
		};
		
		return strs;
	}
	
	//导出系统表、平台表类型
	/*private String[][] getDmTable() {
		String[][] strs = {
			{"dm_field", "table_id in (select table_id from dm_tablecfg where table_type in ('5', '8'))"},
			{"dm_fieldcfg", "table_id in (select table_id from dm_tablecfg where table_type in ('5', '8'))"},
			{"dm_index", "table_id in (select table_id from dm_tablecfg where table_type in ('5', '8'))"},
			{"dm_indexcfg", "table_id in (select table_id from dm_tablecfg where table_type in ('5', '8'))"},
			{"dm_table", "table_type in ('5', '8')"},
			{"dm_tablecfg", "table_type in ('5', '8')"}
		};
		
		return strs;
	}*/
	
	/**
	 * 把查询结果集构建为Insert Into语句
	 * @param tableName -- 表名
	 * @param whereSql -- 过滤条件
	 * @return
	 */
	public StringBuilder batchMakeSQL(String tableName, String whereSql) {
		StringBuilder sbInsert = new StringBuilder();
		//sbInsert.append("\r\n--export tablename "+tableName+"...\r\n");
		
		List<Map<String, String>> lsData = queryData(tableName, whereSql);
		for (Map<String, String> mp : lsData) {
			sbInsert.append(makeSQL(tableName, mp));
		}
		_log.showDebug("......export end " + tableName);
		
		return sbInsert;
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
	private StringBuilder makeSQL(String tableName, Map<String, String> mpData) {
		if (mpData.isEmpty()) {
			return new StringBuilder(""); 
		}
		
		//保存字段与值的SQL
		StringBuilder sbField = new StringBuilder();
		StringBuilder sbValue = new StringBuilder();
		
		//获取当前记录中所有字段的类型
		Map<String, String> mpType = getFieldType(tableName);
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
						fieldValue = _parser.parse("{TO_DATETIME}('"+fieldValue+"')");
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
		String keyName = getKeyName(tableName);
		if (keyName == null || keyName.length() == 0) return;
		
		String keyValue = MapUtil.getValue(mpData, keyName);
		
		String querySql = "select * from "+tableName+" where "+ keyName +"='"+keyValue+"'";
		
		String blobValue = BigFieldUtil.readStream(querySql, blobName, "");
		
		String fileName = _save_path + tableName + "/" + tableName + "." + keyValue + ".txt";
		FileUtil.saveFileUtf8(fileName, blobValue);
	}
	
	/**
	 * 根据表名取主键名
	 * @param tableName
	 * @return
	 */
	private String getKeyName(String tableName) {
		String sql = "select key_field from dm_tablecfg where table_name = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tableName);
		
		Map<String,String> mpData = _dao.queryMap(param);
		if (mpData.isEmpty()) return "";
		
		return mpData.get("key_field");
	}
	
	/**
	 * 取表的字段名称与数据类型信息
	 * @param tableName -- 表名
	 * @return
	 */
	private Map<String, String> getFieldType(String tableName) {
		String sql = "select field_name, data_type from dm_fieldcfg, dm_tablecfg where " +
				"dm_fieldcfg.table_id = dm_tablecfg.table_id and dm_tablecfg.table_name = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tableName);
		List<Map<String, String>> lsData = _dao.query(param);
		
		Map<String, String> mpType = FactoryUtil.newMap();
		for (Map<String, String> map : lsData) {
			mpType.put(map.get("field_name"), map.get("data_type"));
		}
		
		return mpType;
	}
}
