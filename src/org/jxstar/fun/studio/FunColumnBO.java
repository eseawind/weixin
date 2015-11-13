/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.fun.studio;

import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.MapUtil;

/**
 * 处理功能设计器中的字段列信息。
 *
 * @author TonyTan
 * @version 1.0, 2012-12-21
 */
public class FunColumnBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 导入字段后调用此方法：如果不是当前表的字段信息，则更新、编辑值都为否。
	 * @param newKeyIds
	 * @return
	 */
	public String updateCol(String newKeyIds) {
		if (newKeyIds == null || newKeyIds.length() == 0) {
			_log.showDebug("........update col newkeyis is null!");
			return _returnSuccess;
		}
		_log.showDebug("........update col new keyid:" + newKeyIds);
		
		String[] colIds = newKeyIds.split(";");
		if (colIds[0].length() == 0) {
			_log.showDebug("........update col col_id is null!");
			return _returnSuccess;
		}

		Map<String,String> mpData = getFun(colIds[0]);
		String funId = MapUtil.getValue(mpData, "fun_id");
		String tableName = MapUtil.getValue(mpData, "table_name");
		if (tableName.length() == 0) {
			_log.showDebug("........update col table_name is null!");
			return _returnSuccess;
		}
		
		String sql = "update fun_col set is_edit = '0', is_update = '0' where fun_id = ? and col_code not like ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(tableName+".%");
		_dao.update(param);
		
		return _returnSuccess;
	}
	
	/**
	 * 根据字段列ID取当前功能的表名
	 * @param colId
	 * @return
	 */
	private Map<String,String> getFun(String colId) {
		String sql = "select fun_base.table_name, fun_base.fun_id from fun_base, fun_col " +
				"where fun_base.fun_id = fun_col.fun_id and fun_col.col_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(colId);
		return _dao.queryMap(param);
	}
}
