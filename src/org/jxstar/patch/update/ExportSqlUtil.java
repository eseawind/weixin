/*
 * ExportSqlUtil.java 2012-3-15
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.patch.update;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.util.SqlParser;
import org.jxstar.util.FileUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.factory.SystemFactory;

/**
 * 导出SQL用的工具类。
 *
 * @author TonyTan
 * @version 1.0, 2012-3-15
 */
public class ExportSqlUtil {
	private static BaseDao _dao = BaseDao.getInstance();
	
	//SQL解析器
	public static SqlParser _parser = (SqlParser) SystemFactory.createSystemObject("SqlParser");
	
	/**
	 * 取一个模块的所有功能ID
	 * @param moduleId -- 模块ID
	 * @return
	 */
	public static List<String> moduleFunId(String moduleId) {
		List<String> lsRet = FactoryUtil.newList();
		
		String sql = "select fun_id from fun_base where module_id like ? order by fun_index";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(moduleId + "%");
		
		List<Map<String, String>> lsData = _dao.query(param);
		for (Map<String, String> mpData : lsData) {
			lsRet.add(mpData.get("fun_id"));
		}
		
		return lsRet;
	}
	
	/**
	 * 取文件路径下面的文件
	 * @return
	 */
	public static String[] listFileNames(String path) {
		String[] rets = new String[0];
		
		File df = new File(path);
		if (df.isDirectory()) {
			rets = df.list();
		}
		
		return rets;
	}
	
	/**
	 * 处理路径
	 * @param path
	 * @return
	 */
	public static String dealPath(String path) {
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
	
	/**
	 * 删除文件夹下的全部文件
	 * @param path
	 * @return
	 */
	public static boolean deleteFile(String path) {
		boolean flag = false;
		File file = new File(path);
		if (file.exists()) {
			if (file.isFile()) {
				file.delete();
			} else if (file.isDirectory()) {
				String[] tempList = file.list();
				String temp = null;
				for (int i = 0; i < tempList.length; i++) {
					if (path.endsWith(File.separator)) {
						temp = path + tempList[i];
					} else {
						temp = path + File.separator + tempList[i];
					}
					deleteFile(temp);
				}
				file.delete();
			}
			flag = true;
		}
		return flag;
	}
	
	/**
	 * 特殊符号处理
	 * @param value
	 * @return
	 */
	public static String toSqlChar(String value) {
		value = value.replace("'", "''");
		//去掉回车换行符号
		value = value.replace("\r", "");
		value = value.replace("\n", " ");
		
		return value;
	}

	/**
	 * 取表的字段名称与数据类型信息
	 * @param tableName -- 表名
	 * @return
	 */
	public static Map<String, String> getFieldType(String tableName) {
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
	
	/**
	 * 根据表名取主键名
	 * @param tableName
	 * @return
	 */
	public static String getKeyName(String tableName) {
		String sql = "select key_field from dm_tablecfg where table_name = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tableName);
		
		Map<String,String> mpData = _dao.queryMap(param);
		if (mpData.isEmpty()) return "";
		
		return mpData.get("key_field");
	}
	
	/**
	 * 包装输入的SQL语句
	 * @param sqlstr
	 * @return
	 */
	public static StringBuilder getTableSql(StringBuilder sqlstr, String tips) {
		StringBuilder sbRet = new StringBuilder();
		StringBuilder sbUpdate = new StringBuilder();
		sbUpdate.append("\r\n--update "+tips+" ...\r\n");
		int len = sbUpdate.toString().length();
		
		sbUpdate.append(sqlstr);
		
		if(sbUpdate.toString().length() > len){
			sbUpdate.append("commit;\r\n");
			sbRet = sbUpdate;
		}
		
		return sbRet;
	}
	
	/**
	 * 查询目标数据库的系统版本号
	 */
	public static String getVerNo() {
		String sql = "select var_value from sys_var where var_code = 'sys.version.no'";
		DaoParam param = _dao.createParam(sql);
		param.setDsName("targetdb");
		Map<String,String> mpData = _dao.queryMap(param);
		if (mpData.isEmpty()) return "";
		
		return mpData.get("var_value");
	}
	
	/**
	 * 复制文件
	 * @param srcPath
	 * @param tarPath
	 * @return
	 */
	public static boolean copyPage(String srcPath, String tarPath) {
		boolean flag = false;
		File f = new File(srcPath);
		
		if(f.isFile()){
			String fileContent = FileUtil.readFileUtf8(srcPath);
			flag = FileUtil.saveFileUtf8(tarPath, fileContent);
			flag = true;
		}
		return flag;
	}
	
	/**
	 * 导出功能页面（grid页面、form页面、扩展页面）
	 * @param funId --功能ID
	 * @param path	--复制到的文件夹
	 */
	public static void expFunPage(String funId, String realPath, String path) {
		String sql1 = "select grid_page,form_page,layout_page from fun_base where fun_id = ?";
		String sql2 = "select grid_initpage,form_initpage from fun_ext where fun_id = ?";
		
		DaoParam param1 = _dao.createParam(sql1);
		param1.addStringValue(funId);
		Map<String,String> mpData1 = _dao.queryMap(param1);
		String grid_page = mpData1.get("grid_page");
		String form_page = mpData1.get("form_page");
		String layout_page = mpData1.get("layout_page");
		//导出grid页面、form页面
		copyPage(realPath + grid_page, path + grid_page);
		copyPage(realPath + form_page, path + form_page);
		
		if(layout_page.length() > 0){
			int index = layout_page.indexOf("/public/layout/");
			if(index < 0){
				copyPage(realPath + layout_page, path + layout_page);
			}
		}
		
		DaoParam param2 = _dao.createParam(sql2);
		param2.addStringValue(funId);
		Map<String,String> mpData2 = _dao.queryMap(param2);
		String grid_initpage = mpData2.get("grid_initpage");
		String form_initpage = mpData2.get("form_initpage");
		//导出扩展页面
		copyPage(realPath + grid_initpage, path + grid_initpage);
		copyPage(realPath + form_initpage, path + form_initpage);
		
	}
}
