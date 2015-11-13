/*
 * UpdatePageBO.java 2012-3-15
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.patch.update;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.dao.util.BigFieldUtil;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.FileUtil;
import org.jxstar.util.MapUtil;

/**
 * 保存页面设计文件到数据库中。
 *
 * @author TonyTan
 * @version 1.0, 2012-3-16
 */
public class UpdatePageBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 更新设计文件到数据库中
	 * @param path
	 */
	public void update(String path) {
		path = dealPath(path);
		//找到设计文件路径下面的文件
		String[] names = ExportSqlUtil.listFileNames(path);
		
		//更新到数据表中
		for (String name : names) {
			_log.showDebug(".............update " + name + " ...");
			String[] ns = name.split("\\.");
			if (ns.length == 3) {
				String sql = "update fun_design set page_content = ? where design_id = '"+ ns[1] +"'";
				String data = FileUtil.readFileUtf8(path + name);
				_log.showDebug(".............update sql=" + sql);
				//_log.showDebug(".............update data=" + data);
				
				BigFieldUtil.updateStream(sql, data, "");
			}
			_log.showDebug(".............update " + name + " end.");
		}
	}
	
	/**
	 * 保存大字段中的数据到文件中
	 * @param path -- 生成文件的路径，如：d:/update
	 * @param keyName -- 大字段所在的表的主键字段名称
	 * @param tableName -- 大字段所在的表名
	 * @param blobName -- 大字段名
	 * @param where -- 导出指定过滤条件的大字段数据，不含where
	 */
	public void saveBlob(String path, String keyName, String tableName, String blobName, String where) {
		path = dealPath(path);
		
		String sql = "select "+ keyName +" from "+ tableName;
		if (where.length() > 0) {
			sql += " where " + where;
		}
		
		DaoParam param = _dao.createParam(sql);
		List<Map<String,String>> lsKey = _dao.query(param);
		
		for (Map<String,String> mpKey : lsKey) {
			String keyId = MapUtil.getValue(mpKey, keyName);
			if (keyId.length() == 0) continue;
			
			String querySql = "select * from "+tableName+" where "+ keyName +"='"+keyId+"'";
			
			String blobValue = BigFieldUtil.readStream(querySql, blobName, "");
			
			String fileName = path + tableName + "/" + tableName + "." + keyId + ".txt";
			FileUtil.saveFileUtf8(fileName, blobValue);
		}
	}
	
	//处理路径
	private String dealPath(String path) {
		if (path == null || path.length() == 0) {
			path = "d:/update";
		} else {
			path = path.replace('\\', '/');
	        if (path.charAt(path.length()-1) != '/') {
	        	path = path + "/";
	        }
		}
		return path;
	}
}
