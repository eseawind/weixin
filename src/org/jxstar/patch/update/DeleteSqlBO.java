/*
 * DeleteSqlBO.java 2012-3-15
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.patch.update;

import java.util.List;

import org.jxstar.service.BusinessObject;
import org.jxstar.util.FileUtil;

/**
 * 构建删除SQL。
 *
 * @author TonyTan
 * @version 1.0, 2012-3-15
 */
public class DeleteSqlBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	//文件保存路径
	private static String _save_path = "d:/update/";
	//导出SQL文件名
	private static String _exp_sql_name = "exp_delete.sql";
	
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
	 * 导出一个功能的SQL到文件中
	 * @param funIds
	 */
	public void funExpToFile(String[] funIds) {
		StringBuilder sbInsert = new StringBuilder();
		for (String funId : funIds) {
			sbInsert.append(funExpSql(funId));
		}
		
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
		
		return sbInsert;
	}
	
	/**
	 * 根据功能ID构建删除所有的系统配置表信息的SQL
	 * @param funId -- 功能ID
	 * @return
	 */
	public StringBuilder funExpSql(String funId) {
		String[][] tableWheres = (new InsertSqlBO()).getTableWhere();
		
		StringBuilder sbDelete = new StringBuilder();
		sbDelete.append("\n--export funid "+funId+"...\n");
		
		for (String[] tableWhere : tableWheres) {
			sbDelete.append(deleteSql(tableWhere[0], tableWhere[1], funId));
		}
		sbDelete.append("commit;\n");
		_log.showDebug("......export end " + funId);
		
		return sbDelete;
	}
	
	/**
	 * 构建删除SQL
	 * @param tableName -- 表名
	 * @param whereSql -- 过滤条件
	 * @param keyValue -- 查询值
	 * @return
	 */
	private StringBuilder deleteSql(String tableName, String whereSql, String keyValue) {
		StringBuilder sql = new StringBuilder("delete from " + tableName);
		if (whereSql != null && whereSql.length() > 0) {
			whereSql = whereSql.replace("?", "'"+ keyValue +"'");
			
			sql.append(" where " + whereSql);
		}
		sql.append(";\n");
		
		return sql;
	}
}
