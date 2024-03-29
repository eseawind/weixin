/*
 * DaoUtil.java 2009-5-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.dao;

import java.io.IOException;
import java.io.Reader;
import java.sql.CallableStatement;
import java.sql.Clob;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.jxstar.dao.transaction.TransactionException;
import org.jxstar.dao.transaction.TransactionObject;
import org.jxstar.util.StringUtil;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.log.Log;

/**
 * 数据访问工具对象: 处理ResultSet 到 List 的转换； 处理ResultSet 到 Map 的转换；
 * 
 * @author TonyTan
 * @version 1.0, 2009-5-28
 */
public class DaoUtil {
	private static Log _log = Log.getInstance();
	
	/**
	 * 获取结果集中的字段信息，Map中的字段有：fieldname, datatype, length, precision, scale
	 * 
	 * @param rs -- 结果集
	 * @return List
	 * @throws SQLException
	 */
	public static List<Map<String,String>> getRsToCol(ResultSet rs) throws SQLException {
		List<Map<String,String>> lsRet = FactoryUtil.newList();

		// 取得结果集的单元信息
		ResultSetMetaData rsmd = rs.getMetaData();
		int columnNum = rsmd.getColumnCount();

		for (int i = 1; i <= columnNum; i++) {
			Map<String,String> mp = FactoryUtil.newMap();
			mp.put("fieldname", rsmd.getColumnLabel(i).toLowerCase());
			mp.put("datatype", rsmd.getColumnTypeName(i).toLowerCase());
			mp.put("length", Integer.toString(rsmd.getColumnDisplaySize(i)));
			mp.put("precision", Integer.toString(rsmd.getPrecision(i)));
			mp.put("scale", Integer.toString(rsmd.getScale(i)));
			
			lsRet.add(mp);
		}

		return lsRet;
	}

	/**
	 * ResultSet 转换为 List。
	 * 
	 * @param rs -- 结果集
	 * @param recNum -- 控制取recNum条记录，如果<=0，则不限制数量
	 * @param hideCols -- 需要隐藏数据的列
	 * @return List
	 * @throws SQLException
	 */
	public static List<Map<String,String>> getRsToList(ResultSet rs, int recNum, 
			List<String> hideCols) throws SQLException {
		if (rs == null) {
			throw new SQLException("getRsToList(): ResultSet param is null! ");
		}

		List<Map<String,String>> lsRet = FactoryUtil.newList();
		Map<String,String> map = null;

		// 取得结果集的单元信息
		ResultSetMetaData rsmd = rs.getMetaData();
		int columnNum = rsmd.getColumnCount();
		//允许查询输出最多数据条数
		String sMaxNum = SystemVar.getValue("db.query.maxnum", "50000");
		int count = 0, maxNum = Integer.parseInt(sMaxNum);

		// 列数为0,返回空的ArrayList
		String strVal = null, strCol = null;
		while (rs.next()) {
			count++;
			//用于控制取recNum条记录
			if (recNum > 0 && count > recNum) break;
			
			if (count > maxNum) {
				_log.showError("query data num more max [{0}]!!", maxNum);
				break;
			}
			
			map = FactoryUtil.newMap();
			for (int i = 1; i <= columnNum; i++) {
				//由getColumnName改为getColumnLabel，DB2中必须用它取别名，其它数据库两者的值相同
				strCol = rsmd.getColumnLabel(i).toLowerCase();
				strVal = rs.getString(strCol);
				if (strVal == null) strVal = "";
								
				//如果是日期类型的字段，转换为日期对象
				int type = rsmd.getColumnType(i);
				if (type == java.sql.Types.DATE || type == java.sql.Types.TIMESTAMP) {
					if (strVal.length() > 0) {
						String strTmp[] = strVal.split("\\.");
						if (strTmp.length == 2) {
							strVal = strTmp[0];
						}
					}
				} else if (type == java.sql.Types.CLOB) {
					strVal = getClobValue(rs, strCol);
				}
				
				//隐藏此字段的值
				if (hideCols != null && !hideCols.isEmpty()) {
					if (hideCols.contains(strCol)) strVal = "";
				}
				
				map.put(strCol, strVal);
			}
			lsRet.add(map);
		}

		return lsRet;
	}
	
	/**
	 * 取文本大字段的数据
	 * @param rs -- 结果集
	 * @param colname -- 字段名
	 * @return
	 * @throws SQLException
	 */
	public static String getClobValue(ResultSet rs, String colname) throws SQLException {
		String value = "";
		
		if (rs == null) return value;
		Clob clob = rs.getClob(colname);
		if (clob == null) return value;
		
		Reader reader = clob.getCharacterStream();
		try {
			int len = (int) clob.length();
			if (len == 0) return value;
			
			char[] cbuf = new char[len];
			reader.read(cbuf);
			value = new String(cbuf);
			reader.close();
		} catch (IOException e) {
			_log.showError(e);
		}
		return value;
	}

	/**
	 * 给查询结果集添加表名。
	 * 
	 * @param mp --	 结果集
	 * @param tblName -- 表名
	 * @return Map<String,String>
	 */
	public static Map<String,String> mapAddTable(Map<String,String> mp, String tblName) {
		Map<String,String> mpRet = FactoryUtil.newMap();
		
		if (mp == null || mp.isEmpty()) return mpRet;
		
		if (tblName == null || tblName.length() == 0) return mpRet;
		
		Iterator<String> itr = mp.keySet().iterator();
		while(itr.hasNext()) {
			String key = itr.next();
			String value = mp.get(key);
			mpRet.put(tblName+"."+key, value);
		}

		return mpRet;
	}

	/**
	 * 给预编译语句赋值。
	 * 
	 * @param astrVal -- 参数值
	 * @param astrType -- 参数类型
	 * @param aps -- 预编译语句
	 * @return PreparedStatement
	 */
	public static PreparedStatement setPreStmParams(List<String> lsValue, 
			List<String> lsType, PreparedStatement aps) throws SQLException {
		if (lsValue == null) {
			throw new SQLException("setPreStmParams(): astrVal param is null! ");
		}
		if (lsType == null) {
			throw new SQLException("setPreStmParams(): astrType param is null! ");
		}
		if (aps == null) {
			throw new SQLException("setPreStmParams(): PreparedStatement param is null! ");
		}

		String strval = "";
		String strtype = "";

		int icount = lsValue.size();
		if (icount > lsType.size())
			icount = lsType.size();

		for (int i = 1; i <= icount; i++) {
			strval = lsValue.get(i - 1);
			strtype = lsType.get(i - 1);

			if (strtype.equalsIgnoreCase("string")) {
				if ((null != strval) && (strval.length() > 0)) {
					aps.setString(i, strval);
				} else {
					aps.setNull(i, java.sql.Types.VARCHAR);
				}
			} else if (strtype.equalsIgnoreCase("date")) {
				if ((null != strval)
						&& (!strval.trim().equalsIgnoreCase("null"))
						&& (strval.trim().length() > 0)) {
					if (strval.length() <= 10) {
						aps.setDate(i, Date.valueOf(strval));
					} else {
						aps.setTimestamp(i, Timestamp.valueOf(strval));
					}
				} else {
					aps.setNull(i, java.sql.Types.DATE);
				}
			} else if ((strtype.equalsIgnoreCase("double"))
					|| (strtype.equalsIgnoreCase("float"))) {
				if ((null != strval) && (strval.length() > 0)) {
					aps.setDouble(i, Double.parseDouble(strval));
				} else {
					aps.setNull(i, java.sql.Types.DOUBLE);
				}
			} else if (strtype.equalsIgnoreCase("int")) {
				if ((null != strval) && (strval.length() > 0)) {
					aps.setInt(i, Integer.parseInt(strval));
				} else {
					aps.setNull(i, java.sql.Types.INTEGER);
				}
			}
		}

		return aps;
	}	
	
	/**
	 * 注册输出参数。
	 * @param start -- 输入参数的格式，从1开始
	 * @param lsOutType -- 输出参数类型
	 * @param aps -- 预编译语句
	 * @return
	 */
	public static CallableStatement setStmOutParams(int start, List<Integer> lsOutType, 
			CallableStatement aps) throws SQLException {
		if (lsOutType == null) {
			throw new SQLException("setOutStmParams(): lsOutType param is null! ");
		}
		if (aps == null) {
			throw new SQLException("setOutStmParams(): CallableStatement param is null! ");
		}

		for (int i = 1, n = lsOutType.size(); i <= n; i++) {
			int itype = lsOutType.get(i - 1);
			
			aps.registerOutParameter(start+i, itype);
		}
		
		return aps;
	}
	
	/**
	 * 注册输出参数。
	 * @param start -- 输入参数的格式，从1开始
	 * @param typenum -- 输出参数个数
	 * @param aps -- 预编译语句
	 * @param -- 把输出参数的值设置到参数对象中
	 * @return
	 */
	public static void getStmOutParams(int start, int typenum,
			CallableStatement aps, CallParam param) throws SQLException {
		if (aps == null) {
			throw new SQLException("setOutStmParams(): CallableStatement param is null! ");
		}

		for (int i = 1; i <= typenum; i++) {
			int index = start + i;
			String value = aps.getString(index);
			if (value == null) value = "";
			
			param.setOutValue(value);
		}
	}
	
	/**
	 * ResultSet 转换为 JSON。
	 * 
	 * @param rs -- 结果集
	 * @param cols -- 字段列，带表名
	 * @param hideCols -- 隐藏数据的字段列，不带表名
	 * @return String
	 * @throws SQLException
	 */
	public static String getRsToJson(ResultSet rs, String[] cols, 
			List<String> hideCols) throws SQLException {
		if (rs == null) {
			throw new SQLException("getRsToJson(): ResultSet param is null! ");
		}
		if (cols == null) {
			throw new SQLException("getRsToJson(): cols param is null! ");
		}
		if (cols.length == 0) return "";
		
		//允许查询输出最多数据条数
		String sMaxNum = SystemVar.getValue("db.query.maxnum", "50000");
		int count = 0, maxNum = Integer.parseInt(sMaxNum);

		//取字段的数据类型值 
		ResultSetMetaData rsmd = rs.getMetaData();
		//构建json对象
		StringBuilder sbJson = new StringBuilder();
		
		String strVal = null;
		String strCol = null;
		while (rs.next()) {
			count++;
			if (count > maxNum) {
				_log.showError("query data num more max [{0}]!!", maxNum);
				break;
			}

			sbJson.append("{");
			//组织一行数据
			for (int i = 1, n = cols.length; i <= n; i++) {
				strVal = rs.getString(i);
				if (strVal == null) strVal = "";
				//隐藏此字段的值
				if (hideCols != null && !hideCols.isEmpty()) {
					strCol = rsmd.getColumnLabel(i).toLowerCase();
					if (hideCols.contains(strCol)) {
						sbJson.append("'"+cols[i-1]+"'").append(":'',");
						continue;
					}
				}
				
				//如果是日期类型的字段，转换为日期对象
				int type = rsmd.getColumnType(i);
				if (type == java.sql.Types.DATE || type == java.sql.Types.TIMESTAMP) {
					if (strVal.length() == 0) {
						strVal = "''";
					} else {
						//秒后可能会存在.0的字符
						String strTmp[] = strVal.split("\\.");
						if (strTmp.length == 2) {
							strVal = strTmp[0];
						}
						
						//约定日期格式：yyyy-mm-dd 时间戳格式：yyyy-mm-dd hh:mm:ss
						String[] dt = strVal.split(" ");
						String[] ds = dt[0].split("-");
						
						//月份值要减1
						int y = Integer.parseInt(ds[0]);
						int m = Integer.parseInt(ds[1])-1;
						int d = Integer.parseInt(ds[2]);
						
						if (dt.length > 1) {
						//TIMESTAMP类型
							String[] ts = dt[1].split(":");
							int hh = Integer.parseInt(ts[0]);
							int mm = Integer.parseInt(ts[1]);
							int ss = Integer.parseInt(ts[2]);
							
							strVal = "(new Date("+y+", "+m+", "+d+", "+hh+", "+mm+", "+ss+"))";
						} else {
						//DATE类型
							strVal = "(new Date("+y+", "+m+", "+d+"))";
						}
					}
					
					sbJson.append("'"+cols[i-1]+"'").append(":").append(strVal).append(",");
				} else if (type == java.sql.Types.CLOB) {
					strCol = rsmd.getColumnLabel(i).toLowerCase();
					strVal = getClobValue(rs, strCol);
					strVal = StringUtil.strForJson(strVal);
					
					sbJson.append("'"+cols[i-1]+"'").append(":'").append(strVal).append("',");
				} else {
					strVal = StringUtil.strForJson(strVal);

					sbJson.append("'"+cols[i-1]+"'").append(":'").append(strVal).append("',");
				}
			}

			sbJson.append("},\n");
		}
		
		String retJson = sbJson.toString();
		if (retJson.length() == 0) {
			return "";
		}
		//取掉每行数据最后的,号
		retJson = retJson.replaceAll(",},", "},");
		retJson = retJson.substring(0, retJson.length()-2);
		
		return retJson;
	}
	
	/**
	 * 打印查询时间，并打印超长时间的SQL。
	 * 
	 * @param long			开始时间
	 * @param DaoParam		执行的SQL
	 */
	public static void showUpdateTime(long startTime, DaoParam param) {
		long curQueryTime = System.currentTimeMillis() - startTime;
		//是否显示所有查询时间
		String isShow = SystemVar.getValue("db.show.querytime");
		if (isShow.equals("1")) {
			_log.showDebug("update time = " + curQueryTime);
		}
		
		//查询超时提醒时间
		String maxTime = SystemVar.getValue("db.max.querytime", "5000");
		if (curQueryTime > Integer.parseInt(maxTime)) {
			StringBuilder sb = new StringBuilder();
			sb.append("\nupdate time = ").append(curQueryTime);
			sb.append("\nupdate time exe_sql = ").append(param.getSql());
			sb.append("\nupdate time where_type = ").append(param.strType());
			sb.append("\nupdate time where_value = ").append(param.strValue());
			
			_log.showError(sb.toString());
		}
	}
	
	/**
	 * 打印查询时间，并打印超长时间的SQL。
	 * 
	 * @param long			开始时间
	 * @param DaoParam		执行的SQL
	 */
	public static void showQueryTime(long startTime, DaoParam param) {
		//不输出异常信息
		if (!param.isCatchError()) return;
		
		long curQueryTime = System.currentTimeMillis() - startTime;
		//是否显示所有查询时间
		String isShow = SystemVar.getValue("db.show.querytime", "0");
		if (isShow.equals("1")) {
			_log.showDebug("query time = " + curQueryTime);
		}
		
		//查询超时提醒时间
		String maxTime = SystemVar.getValue("db.max.querytime", "5000");
		if (curQueryTime > Integer.parseInt(maxTime)) {
			StringBuilder sb = new StringBuilder();
			sb.append("\nquery time = ").append(curQueryTime);
			sb.append("\nquery time exe_sql = ").append(param.getSql());
			sb.append("\nquery time where_type = ").append(param.strType());
			sb.append("\nquery time where_value = ").append(param.strValue());
			
			_log.showError(sb.toString());
		}
	}	
	
	/**
	 * 输出所有SQL与参数到文件中，需要设置参数：db.show.sql=1
	 * @param param
	 * @param type -- 操作类型：1查询，2更新 ，3所有
	 */
	public static void debugSQL(DaoParam param, String type) {
		if (param == null) return;
		
		String isShow = SystemVar.getValue("db.show.sql", "0");
		if (isShow == null || isShow.length() == 0 || isShow.equals("0")) return;
		boolean valid =
			(isShow.equals("3") || 						//显示所有SQL
			 isShow.equals("1") && type.equals("1") ||	//只显示查询SQL
			 isShow.equals("2") && type.equals("2"));	//只显示更新SQL
		if (!valid) return;
		
		StringBuilder sb = new StringBuilder();
		sb.append("\nthreadid = ").append(Thread.currentThread().hashCode());
		sb.append("\nexe_sql = ").append(param.getSql());
		sb.append("\nwhere_type = ").append(param.strType());
		sb.append("\nwhere_value = ").append(param.strValue());
		
		_log.showError(sb.toString());
	}
	
	/**
	 * 显示异常信息。
	 * 
	 * @param Exception		异常对象
	 * @param DaoParam		执行的SQL
	 */
	public static void showException(Exception e, DaoParam param) {
		//不输出异常信息
		if (!param.isCatchError()) return;
		
		param.setError(e.getMessage());
		
		StringBuilder sb = new StringBuilder();
		sb.append("\nexe_sql = ").append(param.getSql());
		sb.append("\nwhere_type = ").append(param.strType());
		sb.append("\nwhere_type = ").append(param.strValue());
		
		_log.showError(sb.toString());
		_log.showError(e);
	}
	
	/**
	 * 关闭事务对象。
	 * 
	 * @param tranObj - 事务对象
	 */
	public static void closeTranObj(TransactionObject tranObj) {
		try {
			if (tranObj != null) {
				tranObj.rollback();
			}
		} catch (TransactionException e) {
			tranObj = null;
			_log.showError(e);
		}
	}	
}