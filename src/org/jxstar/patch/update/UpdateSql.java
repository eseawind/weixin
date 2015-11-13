/**
 * 
 */
package org.jxstar.patch.update;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import org.jxstar.dao.DaoParam;
import org.jxstar.dao.pool.DataSourceConfig;
import org.jxstar.dao.pool.DataSourceConfigManager;
import org.jxstar.dao.util.BigFieldUtil;
import org.jxstar.dao.util.SQLParseException;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.ArrayUtil;
import org.jxstar.util.FileUtil;
import org.jxstar.util.StringUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 根据功能ID或者模块ID，对比目标数据源，生成所有系统表的更新语句。
 * @author kevin
 * 2013-3-28
 */
public class UpdateSql extends BusinessObject{
	private static final long serialVersionUID = 1L;
	//目标数据源名称
	private static String _target_sourse_name = "targetdb";
	//文件保存路径
	public String save_path = "D:/update/";
	//导出SQL文件名
	public String exp_sql_name = "exp_update.sql";
	//项目的绝对路径
	public String realPath = "";
	
	/**
	 * 配置目标数据源
	 * @param jdbcurl --访问URL
	 * @param username --数据库用户
	 * @param password --数据库密码
	 */
	public boolean setTargetDataSource(String jdbcurl,String username,String password) {
		DataSourceConfigManager dscm = DataSourceConfigManager.getInstance();
		
		DataSourceConfig dsc = dscm.getDataSourceConfig("default");
		String schemaName = dsc.getSchemaName();
		String driveClass = dsc.getDriverClass();
		String dbmsType = dsc.getDbmsType();
		
		dscm.addDataSourceConfig(_target_sourse_name, schemaName, driveClass, jdbcurl, username, password, dbmsType);
		
		//验证数据源是否有效
		String valid = validDS();
		if(valid != null && valid.equals("true")){
			return true;
		}
		return false;
	}
	
	/**
	 * 导出多个模块的SQL到文件中
	 * @param moduleIds
	 */
	public void modExpToFile(String[] moduleIds,String expDmcfg,String isNew,String expModule,
			String expControl,String expCtlSel,String expXls) {
		StringBuilder sbInsert = new StringBuilder();
		
		for (String moduleId : moduleIds) {
			List<String> lsFunId = ExportSqlUtil.moduleFunId(moduleId);
			expFunCompSql(sbInsert, lsFunId);
			//从目标数据库上找到所属模块的功能,对比当前数据库的功能，如果没有的记录则导出delete语句
			List<String> tarLsFunId = getTarFunId(moduleId);
			deleteFunSql(sbInsert, tarLsFunId);
			//对比选项
			String funs = ArrayUtil.listToString(lsFunId, "','");
			funs = funs.substring(0, funs.length()-1);
			sbInsert.append(expRelaSql(funs, expDmcfg, isNew, expModule, expControl, expCtlSel, expXls));
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
			//sbInsert.append(funExpSql(funId));
			//把功能的grid页面和form页面、扩展页面导出
			ExportSqlUtil.expFunPage(funId, realPath, save_path + "page");
		}
		List<String> lsFunId = Arrays.asList(funIds);
		expFunCompSql(sbInsert, lsFunId);
		//删除SQL
		deleteFunSql(sbInsert, lsFunId);
		//对比选项
		String funs = ArrayUtil.listToString(lsFunId, "','");
		funs = funs.substring(0, funs.length()-1);
		sbInsert.append(expRelaSql(funs, expDmcfg, isNew, expModule, expControl, expCtlSel, expXls));
		
		String fileName = save_path + exp_sql_name;
		FileUtil.saveFileUtf8(fileName, sbInsert.toString());
	}
	
	/**
	 * 导出完功能的insert into语句，是否还导出相关的选项控件、选择窗口、模块定义、XLS导入定义、数据模型定义信息
	 */
	private StringBuilder expRelaSql(String funs, String expDmcfg,String isNew,String expModule,
			String expControl,String expCtlSel,String expXls) {
		StringBuilder sbUpdate = new StringBuilder();
		
		InsertSql isbo = new InsertSql();
		isbo.save_path = save_path;
		isbo.exp_sql_name = exp_sql_name;
		
		if(expModule.equals("1")){
			//对比功能模块定义信息
			sbUpdate.append(ExportSqlUtil.getTableSql(compToSql("funall_module", "", isbo, null), "funall_module"));
			sbUpdate.append(compToDelSql("funall_module", "", null));
		}
		if(expControl.equals("1")){
			//对比选项控件定义信息
			sbUpdate.append(ExportSqlUtil.getTableSql(compToSql("funall_control", "control_type = 'combo'", isbo, null), "funall_control combo"));
			sbUpdate.append(compToDelSql("funall_control", "control_type = 'combo'", null));
		}
		if(expCtlSel.equals("1")){
			//对比选择窗口定义信息
			sbUpdate.append(ExportSqlUtil.getTableSql(compToSql("funall_control", "control_type = 'combowin'", isbo, null), "funall_control combowin"));
			sbUpdate.append(compToDelSql("funall_control", "control_type = 'combowin'", null));
		}
		if(expXls.equals("1")){
			//对比相关XLS导入定义
			sbUpdate.append(updateImpSql(funs,isbo));
		}
		if(expDmcfg.equals("1")){
			//对比相关数据模型定义
			sbUpdate.append(updateDmSql(funs, isNew, isbo));
		}
		
		return sbUpdate;
	}
	
	/**
	 * 导出数据建模的配置信息
	 * @param funWhere
	 * @return
	 */
	private StringBuilder updateDmSql(String funs,String isNew, InsertSql isbo) {
		//构建where子句
		String[][] tableWheres = {
			{"dm_fieldcfg", "table_id in (select table_id from dm_tablecfg where table_name in (select table_name from fun_base where fun_id in ('"+ funs + ")))"},
			{"dm_indexcfg", "table_id in (select table_id from dm_tablecfg where table_name in (select table_name from fun_base where fun_id in ('"+ funs + ")))"},
			{"dm_tablecfg", "table_name in (select table_name from fun_base where fun_id in ('"+ funs + "))"}
		};
		
		StringBuilder sbRet = new StringBuilder();
		StringBuilder sbInsert = new StringBuilder();
		sbInsert.append("\r\n--update dm config...\r\n");
		
		int len = sbInsert.toString().length();
		for (int i = tableWheres.length-1; i >= 0; i--) {
			String[] tableWhere = tableWheres[i];
			sbInsert.append(compToSql(tableWhere[0], tableWhere[1],isbo, "dm"));
		}
		if(sbInsert.toString().length() > len){
			sbInsert.append("commit;\r\n");
			sbRet = sbInsert;
		}
		
		for (String[] tableWhere : tableWheres) {
			sbRet.append(compToDelSql(tableWhere[0], tableWhere[1], "dm"));
		}
		
		return sbRet;
	}
	
	/**
	 * 对比相关XLS导入定义
	 * @param funWhere
	 * @return
	 */
	private StringBuilder updateImpSql(String funs, InsertSql isbo) {
		//构建where子句
		String[][] tableWheres = {
			{"imp_relat", "imp_id in (select imp_id from imp_list where fun_id in ('" + funs + "))"},
			{"imp_field", "imp_id in (select imp_id from imp_list where fun_id in ('" + funs + "))"},
			{"imp_list",  "fun_id in ('" + funs +")"}
		};
		
		StringBuilder sbRet = new StringBuilder();
		StringBuilder sbInsert = new StringBuilder();
		sbInsert.append("\r\n--update imp config...\r\n");
		
		int len = sbInsert.toString().length();
		for (int i = tableWheres.length-1; i >= 0; i--) {
			String[] tableWhere = tableWheres[i];
			sbInsert.append(compToSql(tableWhere[0], tableWhere[1], isbo, null));
		}
		if(sbInsert.toString().length() > len){
			sbInsert.append("commit;\r\n");
			sbRet = sbInsert;
		}
		
		for (String[] tableWhere : tableWheres) {
			sbRet.append(compToDelSql(tableWhere[0], tableWhere[1], null));
		}
		
		return sbRet;
	}
	
	/**
	 * 当前数据库不存在的功能构建删除SQL 
	 * @param sbDelete
	 * @param lsFunId 目标数据可的功能ID集合
	 */
	private void deleteFunSql(StringBuilder sbDelete, List<String> lsFunId) {
		
		DeleteSql delbo = new DeleteSql();
		for(String funId : lsFunId) {
			boolean flag = checkData("fun_base","fun_id",funId, true);
			if(!flag){
				sbDelete.append(delbo.funExpSql(funId));
			}else{
				//当前数据库存在功能，但是跟功能相关的系统表也需要与目标数据库的表对比，目标数据库有而当前数据库没有的构建delete SQL.
				String[][] tableWheres = (new InsertSql()).getTableWhere();
				for (int i = 0; i < tableWheres.length-1; i++) {
					String[] tableWhere = tableWheres[i];
					String tableName = tableWhere[0];
					String whereSql = tableWhere[1];
					whereSql = whereSql.replace("?", "'"+ funId +"'");
					
					sbDelete.append(compToDelSql(tableName, whereSql, null));
				}
			}
		}
	}
	
	/**
	 * 对比目标数据库表，当前数据库表不存在的记录构建删除SQL
	 * @param tableName
	 * @param whereSql
	 * @return
	 */
	private StringBuilder compToDelSql(String tableName,String whereSql,String isDm) {
		StringBuilder sbRet = new StringBuilder();
		StringBuilder sbDel = new StringBuilder();
		sbDel.append("\r\n--delete "+ tableName +" rows ...\r\n");
		
		int len = sbDel.toString().length();
		String keyField = getKeyNameByTarget(tableName); //主键的字段名
		//获取目标数据库表的查询数据
		List<Map<String, String>> tarls = queryData(tableName, whereSql, false);
		String tbId = "";
		for(Map<String, String> tarMap : tarls){
			String keyValue = tarMap.get(keyField); //主键值
			boolean flag = checkData(tableName,keyField,keyValue, true);
			//当前数据库表不存在该条记录
			if(!flag){
				if(isDm != null && isDm.equals("dm")){ //是数据模型的删除
					String table_id = tarMap.get("table_id");
					sbDel.append("update "+tableName +" set state = '3' where "+keyField + " = '"+keyValue +"';\r\n");
					if((tableName.equals("dm_fieldcfg") || tableName.equals("dm_indexcfg")) && !table_id.equals(tbId)){
						sbDel.append("update dm_tablecfg set state = '2' where table_id = '"+table_id+"';\r\n");
					}
					tbId = table_id;
				}else{
					sbDel.append(new DeleteSql().deleteSql(tableName, keyField + " = ? ", keyValue));
				}
			}
		}
		
		if(sbDel.toString().length() > len){
			sbDel.append("commit;\r\n");
			sbRet = sbDel;
		}
		
		return sbRet;
	}
	
	/**
	 * 与目标数据库系统表比对，生成差异SQL
	 * @param sbInsert
	 * @param lsFunId
	 */
	private void expFunCompSql(StringBuilder sbInsert, List<String> lsFunId) {
		InsertSql isbo = new InsertSql();
		isbo.save_path = save_path;
		isbo.exp_sql_name = exp_sql_name;
		for (String funId : lsFunId) {
			//查询目标数据库的功能列表是否存在有该功能标识
			boolean flag = checkData("fun_base","fun_id",funId, false);
			//在目标数据库中没有找到该功能ID的记录，则导出功能的insert into语句
			if(!flag){
				sbInsert.append(isbo.funExpSql(funId));
			}
			//在目标数据库中找到功能，则对比所有系统表中每个字段的值，内容不相同的导出为update语句
			else{
				String[][] tableWheres = isbo.getTableWhere();
				sbInsert.append(compFunToSql(funId, tableWheres, isbo));
			}
		}
	}
	
	/**
	 * 根据功能ID比较该功能所有的系统配置表内容，生成更新SQL
	 * @param funId
	 * @param tableWheres
	 * @return
	 */
	private StringBuilder compFunToSql(String funId, String[][] tableWheres, InsertSql isbo) {
		StringBuilder sbRet = new StringBuilder();
		StringBuilder sbUpdate = new StringBuilder();
		sbUpdate.append("\r\n--update funid "+funId+"...\r\n");
		
		int len = sbUpdate.toString().length();
		for (int i = tableWheres.length-1; i >= 0; i--) {
			String[] tableWhere = tableWheres[i];
			String tableName = tableWhere[0];
			String whereSql = tableWhere[1];
			whereSql = whereSql.replace("?", "'"+ funId +"'");
			
			sbUpdate.append(compToSql(tableName, whereSql, isbo, null));
		}
		if(sbUpdate.toString().length() > len){
			sbUpdate.append("commit;\r\n");
			sbRet = sbUpdate;
		}
		
		return sbRet;
	}
	
	/**
	 * 根据表名和查询条件得到sql语句
	 * @param tableName
	 * @param whereSql
	 * @param isbo
	 * @return
	 */
	private StringBuilder compToSql(String tableName,String whereSql, InsertSql isbo, String isDm) {
		StringBuilder sbUpdate = new StringBuilder();
		
		String keyField = ExportSqlUtil.getKeyName(tableName); //主键的字段名
		//获取表的查询数据
		List<Map<String, String>> ls = queryData(tableName, whereSql, true);
		String tbId = "";
		for(Map<String, String> map : ls){
			String keyValue = map.get(keyField); //主键值
			
			//根据表名与主键获取目标数据库的记录
			Map<String, String> tarMap = queryTarRecord(tableName, keyField, keyValue);
			if(!tarMap.isEmpty()){
				//对比字段的内容,返回不相同的字段
				Set<Entry<String, String>> setData = map.entrySet();
				Map<String, String> updFieldMap = FactoryUtil.newMap(); 
				for (Entry<String, String> entry : setData) {
					String fieldName = entry.getKey();
					String fieldValue = entry.getValue();
					
					String tarFieldVal = tarMap.get(fieldName);
					if(!fieldValue.equals(tarFieldVal)){
						updFieldMap.put(fieldName, fieldValue);
					}
				}
				if(isDm != null && isDm.equals("dm")){//是数据模型的修改
					String state = map.get("state");
					if(state.equals("6")){
						map.put("state", "2");
					}
				}
				sbUpdate.append(makeUpdateSQL(tableName, keyField, keyValue, updFieldMap));
			}
			else{
				if(isDm != null && isDm.equals("dm")){//是数据模型的新增
					map.put("state", "1");
					sbUpdate.append(isbo.makeSQL(tableName, map));
					
					String table_id = map.get("table_id");
					if((tableName.equals("dm_fieldcfg") || tableName.equals("dm_indexcfg")) && !table_id.equals(tbId)){
						sbUpdate.append("update dm_tablecfg set state = '2' where state = '6' " +
								" and table_id in (select table_id from "+tableName+" where state = '1' and table_id = '"+table_id+"');\r\n");
					}
					tbId = table_id;
				}else{
					//找不到目标记录,构建insert into SQL
					sbUpdate.append(isbo.makeSQL(tableName, map));
				}
			}
		}
		
		return sbUpdate;
	}
	
	/**
	 * 构建一条记录的更新SQL
	 * @param tableName --表名
	 * @param keyName	--主键字段
	 * @param keyValue	--主键字段值
	 * @param mpData	
	 * @return
	 */
	private StringBuilder makeUpdateSQL(String tableName,String keyName, String keyValue, Map<String, String> mpData) {
		if (mpData.isEmpty()) {
			return new StringBuilder(""); 
		}
		
		//保存字段与值的SQL
		StringBuilder sbField = new StringBuilder();
		
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
					saveBlobToFile(tableName, fieldName, mpData, keyName,keyValue);
					
					//导出文件后，值用空值
					fieldValue = "null";
				}
			}
			
			sbField.append(fieldName + " = " + fieldValue + ", ");
		}
		
		//构建UPDATE SET SQL
		StringBuilder sbUpdate = new StringBuilder("update " + tableName + " set ");
		sbUpdate.append(sbField.substring(0, sbField.length()-2));
		sbUpdate.append(" where " + keyName +" = '" + keyValue +"'");
		sbUpdate.append(";\r\n");
		
		_log.showDebug(sbUpdate.toString());
		
		return sbUpdate;
	}
	
	/**
	 * 取目标数据库一个模块的所有功能ID
	 * @param moduleId -- 模块ID
	 * @return
	 */
	private List<String> getTarFunId(String moduleId) {
		List<String> lsRet = FactoryUtil.newList();
		
		String sql = "select fun_id from fun_base where module_id like ? order by fun_index";
		DaoParam param = _dao.createParam(sql);
		param.setDsName(_target_sourse_name);
		param.addStringValue(moduleId + "%");
		
		List<Map<String, String>> lsData = _dao.query(param);
		for (Map<String, String> mpData : lsData) {
			lsRet.add(mpData.get("fun_id"));
		}
		
		return lsRet;
	}
	
	/**
	 * 根据表名和主键字段值查询目标数据库的记录
	 * @param tableName -- 表名
	 * @param keyName	-- 主键字段
	 * @param keyValue	-- 主键值
	 * @return
	 */
	private Map<String, String> queryTarRecord(String tableName, String keyName, String keyValue) {
		String sql = "select  *  from " + tableName + " where " + keyName +" = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.setDsName(_target_sourse_name);
		param.addStringValue(keyValue);
		return _dao.queryMap(param);
	}
	
	/**
	 * 根据表名与Where子句查询数据
	 * @param tableName -- 表名
	 * @param whereSql -- 过滤条件
	 * @param isCurDs  -- 是否当前数据源
	 * @return
	 */
	private List<Map<String, String>> queryData(String tableName, String whereSql, boolean isCurDs) {
		String sql = "select  *  from " + tableName;
		if (whereSql != null && whereSql.length() > 0) {
			sql += " where " + whereSql;
		}
		
		DaoParam param = _dao.createParam(sql);
		if(!isCurDs){
			param.setDsName(_target_sourse_name);
		}
		return _dao.query(param);
	}
	
	/**
	 * 检查数据表是否存在某条数据
	 * @param tableName -- 表名
	 * @param keyName   -- 主键字段
	 * @param keyValue  -- 主键值
	 * @param isCurDs  -- 是否当前数据源
	 * @return
	 */
	private boolean checkData(String tableName,String keyName,String keyValue, boolean isCurDs) {
		String sql = "select count(*) as count from " + tableName + " where " + keyName + " = ? ";
		DaoParam param =  _dao.createParam(sql);
		if(!isCurDs){
			param.setDsName(_target_sourse_name);
		}
		param.addStringValue(keyValue);
		Map<String, String> map = _dao.queryMap(param);
		
		double count = StringUtil.tonum(map.get("count"));
		if(count > 0) return true;
		
		return false;
	}
	
	/**
	 * 验证目标数据源有效性
	 */
	private String validDS() {
		String sql = "select count(*) from fun_base";
		DaoParam param = _dao.createParam(sql);
		param.setDsName(_target_sourse_name);
		Map<String, String> retmap = _dao.queryMap(param);
		if(!retmap.isEmpty()) return "true";
		return "false";
	}
	
	/**
	 * 从目标数据源根据表名取主键名
	 * @param tableName
	 * @return
	 */
	private String getKeyNameByTarget(String tableName) {
		String sql = "select key_field from dm_tablecfg where table_name = ?";
		DaoParam param = _dao.createParam(sql);
		param.setDsName(_target_sourse_name); 
		param.addStringValue(tableName);
		
		Map<String,String> mpData = _dao.queryMap(param);
		if (mpData.isEmpty()) return "";
		
		return mpData.get("key_field");
	}
	
	/**
	 * 根据表名、主键值，取大字段的值，保存为文件，
	 * 文件名采用表名加主键的格式
	 * @param tableName -- 表名
	 * @param mpData -- 当前记录值
	 */
	private void saveBlobToFile(String tableName, String blobName, Map<String, String> mpData, String keyName,String keyValue) {
		if (keyName == null || keyName.length() == 0) return;
		
		String querySql = "select * from "+tableName+" where "+ keyName +"='"+keyValue+"'";
		
		String blobValue = BigFieldUtil.readStream(querySql, blobName, "");
		
		String fileName = save_path + tableName + "/" + tableName + "." + keyValue + ".txt";
		FileUtil.saveFileUtf8(fileName, blobValue);
	}
}
