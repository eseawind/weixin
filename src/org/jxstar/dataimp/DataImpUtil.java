/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.dataimp;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.service.control.ControlerUtil;
import org.jxstar.service.define.FunctionDefine;
import org.jxstar.service.define.FunctionDefineManger;
import org.jxstar.service.util.TaskUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.key.CodeCreator;
import org.jxstar.util.key.KeyCreator;
import org.jxstar.util.log.Log;

/**
 * 数据导入工具方法。
 *
 * @author TonyTan
 * @version 1.0, 2012-6-11
 */
public class DataImpUtil {
	private static Log _log = Log.getInstance();
	private static BaseDao _dao = BaseDao.getInstance();
	//外键标志
	public static final String FKEYID_REGEX = "\\{FKEYID\\}";
	//新增主键标志
	public static final String NEW_KEYID = "{NEWKEYID}";
	public static final String NEW_KEYID_REGEX = "\\{NEWKEYID\\}";
	//新增编号标志
	public static final String NEW_CODE = "{NEWCODE}";
	public static final String NEW_CODE_REGEX = "\\{NEWCODE\\}";
	
	/**
	 * 取得关联关系数据
	 * @param lsRelatSql
	 * @param formData
	 * @param gridData
	 * @return
	 */
	public static Map<String,String> queryRelat(List<Map<String,String>> lsRelatSql,
			Map<String,String> formData,
			Map<String,String> gridData) {
		//把表格与表头数据拼在一起作为关系SQL的where参数解析来源
		Map<String,String> paramData = FactoryUtil.newMap();
		if (formData != null && !formData.isEmpty()) paramData.putAll(formData);
		if (gridData != null && !gridData.isEmpty()) paramData.putAll(gridData);
		
		Map<String,String> queryData = FactoryUtil.newMap();
		for (Map<String,String> mpRelatSql : lsRelatSql) {
			String sql = mpRelatSql.get("relat_sql");
			if (sql.length() == 0) continue;
			
			sql = TaskUtil.parseAppField(sql, paramData, true);
			_log.showDebug("..........relatsql:" + sql);
			
			DaoParam param = _dao.createParam(sql);
			param.setUseParse(true);
			Map<String,String> mp = _dao.queryMap(param);
			
			queryData.putAll(mp);
		}
		
		return queryData;
	}
	
	/**
	 * 解析新增SQL中的ID与编码值：{NEWKEYID}{NEWCODE}
	 * @param funId
	 * @param insertSql
	 * @return
	 */
	public static String parseInsertSQL(String funId, String fkValue, 
			String insertSql, Map<String,String> userInfo) {
		if (insertSql == null || insertSql.length() == 0) return "";
		
		//创建主键生成对象
		KeyCreator keyCreator = KeyCreator.getInstance();
		//创建编码生成对象
		CodeCreator codeCreator = CodeCreator.getInstance();
		//解析目标SQL中的常量
		insertSql = parseConstant(insertSql, userInfo);
		//解析目标SQL中的外键值
		insertSql = insertSql.replaceFirst(FKEYID_REGEX, addChar(fkValue));
		
		//是否新增主键
		boolean isNewKeyId = (insertSql.indexOf(NEW_KEYID) >= 0);
		if (isNewKeyId) {
			FunctionDefine funObject = FunctionDefineManger.getInstance().getDefine(funId);
			String tableName = funObject.getElement("table_name");
			String newKeyID = keyCreator.createKey(tableName);
			insertSql = insertSql.replaceFirst(NEW_KEYID_REGEX, addChar(newKeyID));
		}
		
		//是否新增编号
		boolean isNewCode = (insertSql.indexOf(NEW_CODE) >= 0);
		if (isNewCode) {
			String newCode = codeCreator.createCode(funId);
			insertSql = insertSql.replaceFirst(NEW_CODE_REGEX, addChar(newCode));
		}
		
		return insertSql;
	}
	
	/**
	 * 完善日期值：如果是yyyy/mm/dd则把/转换为-；如果是yyyy-mm样式，则添加-dd；
	 * @param value
	 * @return
	 */
	public static String repDateValue(String value) {
		if (value == null || value.length() == 0) return "";
		
		value = value.replace('/', '-');
		String[] vs = value.split("-");
		if (vs.length == 2) {
			value = value + "-01";
		} else if (vs.length == 1) {
			value = value + "-01-01";
		}
		
		return value;
	}
	
	/**
	 * 取编码值，支持自定义编码规则
	 * @param funId
	 * @param mpData
	 * @return
	 */
	public static String getCodeValue(String funId, Map<String,String> mpData) {
		CodeCreator codeCreator = CodeCreator.getInstance();
		return codeCreator.createCode(funId, mpData);
	}
	
	/**
	 * 取主键值
	 * @param funId
	 * @return
	 */
	public static String getKeyValue(String funId) {
		KeyCreator keyCreator = KeyCreator.getInstance();
		String tableName = getTableName(funId);
		
		return keyCreator.createKey(tableName);
	}
	
	//取表格数据字段的位置信息，取行序号
	public static int getFirstRow(String impId) {
		String sql = "select field_pos from imp_field where data_src = '1' and imp_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(impId);
		
		Map<String,String> mp = _dao.queryMap(param);
		if (mp.isEmpty()) return -1;
		
		String field_pos = mp.get("field_pos");
		int[] pos = getPosition(field_pos);
		if (pos.length != 2) {
			return -1;
		}
		return pos[0];
	}
	
	/**
	 * 获取位置
	 * @param position
	 * @return
	 */
    public static int[] getPosition(String position) {
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
    
	/**
	 * 解析SQL中的常量值。
	 * @param sql
	 * @param userInfo
	 * @return
	 */
	public static String parseConstant(String sql, 
			Map<String,String> userInfo) {
		String regex = "\\{[^}]+\\}";
		Pattern p = Pattern.compile(regex);
		Matcher m = p.matcher(sql);
		StringBuffer sb = new StringBuffer();
		while (m.find()) {
			String tag = m.group();
			//取常量的值
			String value = (String) ControlerUtil.getConstantParam(tag, userInfo);
			//如果还含{，说明没有解析
			if (value.indexOf("{") >= 0) {
				m.appendReplacement(sb, value);
			} else {
				m.appendReplacement(sb, addChar(value));
			}
		}
		m.appendTail(sb);
		
		return sb.toString();
	}
    
	/**
	 * 字符串两头加上'
	 * @param str
	 * @return
	 */
	public static String addChar(String str) {
		StringBuilder sb = new StringBuilder();
		sb.append("'").append(str).append("'");
		
		return sb.toString();
	}
	
	//取数据导入的SQL
	public static Map<String,String> queryImp(String funId, String impIndex) {
		String sql = "select tpl_type, insert_sql, tpl_file, imp_id, fun_id from imp_list where fun_id = ? ";
		if (impIndex != null && impIndex.length() > 0) {
			sql += " and imp_index = " + impIndex;
		}
		sql += " order by imp_index";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		
		return _dao.queryMap(param);
	}
	
	//取数据导入的SQL
	public static Map<String,String> queryImpById(String imp_id) {
		String sql = "select tpl_type, insert_sql, tpl_file, imp_id, fun_id from imp_list where imp_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(imp_id);
		
		return _dao.queryMap(param);
	}
	
	//取表头字段定义，数据来源类型：1表格、2表头、3关系数据
	public static List<Map<String,String>> queryDataField(String impId, String srcType) {
		String sql = "select field_name, field_pos, is_must from imp_field where data_src = ? and imp_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(srcType);
		param.addStringValue(impId);
		
		return _dao.query(param);
	}
	
	//是否关系数据字段
	public static boolean hasRelatField(String impId) {
		String sql = "select count(*) as cnt from imp_field where data_src = '3' and imp_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(impId);
		
		Map<String,String> mpData = _dao.queryMap(param);
		return MapUtil.hasRecord(mpData);
	}
	
	//取关联关系SQL定义
	public static List<Map<String,String>> queryRelatSql(String impId) {
		String sql = "select relat_sql from imp_relat where imp_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(impId);
		
		return _dao.query(param);
	}
	
	//取新增SQL的参数列表
	public static List<Map<String,String>> queryField(String impId) {
		String sql = "select field_name, data_type, data_src, is_must, field_title, field_pos " +
				"from imp_field where is_param = '0' and imp_id = ? order by field_no";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(impId);
		
		return _dao.query(param);
	}
	
	//取导入数据字段的数据长度
	public static Map<String,String> queryFieldLen(String funId, String impId) {
		String sql = "select v_column_info.field_name, v_column_info.data_size " + 
				"from v_column_info, fun_base, imp_field where v_column_info.table_name = fun_base.table_name " +  
				"and v_column_info.field_name = imp_field.field_name and fun_base.fun_id = ? " + 
				"and imp_field.is_param = '0' and imp_field.imp_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(impId);
		
		List<Map<String,String>> lsData = _dao.query(param);
		
		//取字段长度存到MAP中
		Map<String,String> mpRet = FactoryUtil.newMap();
		for (Map<String,String> mpData : lsData) {
			mpRet.put(mpData.get("field_name"), mpData.get("data_size"));
		}
		
		return mpRet;
	}
	
	/**
	 * 取模板中显示的字段
	 * @param impId
	 * @return
	 */
	public static List<Map<String,String>> queryTplField(String impId) {
		String sql = "select field_title, field_pos from imp_field where data_src in ('1', '2') and imp_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(impId);
		
		return _dao.query(param);
	}
	
	//根据功能ID取表明
	public static String getTableName(String funId) {
		String sql = "select table_name from fun_base where fun_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		
		Map<String,String> mp = _dao.queryMap(param);
		return MapUtil.getValue(mp, "table_name");
	}
	
	/**
	 * 是否有没有定义数据来源位置的字段
	 * @param impId
	 * @return
	 */
	public static boolean hasNoPos(String impId) {
		List<Map<String,String>> lsField = queryTplField(impId);
		for (Map<String,String> mpField : lsField) {
			String field_pos = mpField.get("field_pos");
			if (field_pos.length() == 0) return true;
		}
		return false;
	}
}
