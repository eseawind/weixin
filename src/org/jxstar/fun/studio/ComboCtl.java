/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.fun.studio;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jxstar.dao.DaoParam;
import org.jxstar.fun.design.parser.PageParserUtil;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.define.FunDefineDao;
import org.jxstar.util.MapUtil;

/**
 * 智能查询选择控件。
 *
 * @author TonyTan
 * @version 1.0, 2012-7-23
 */
public class ComboCtl extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 构建一个JSON对象，用于构建智能查询控件
	 * {selcfg:{},fields:[{},{}...],design:[{},{}...]}
	 * @param funId
	 * @param colCode
	 * @return
	 */
	public String createCtl(String funId, String colCode) {
		if (funId == null || funId.length() == 0 ||
				colCode == null || colCode.length() == 0) {
			setMessage("构建智能查询选项控件的参数为空！");
			return _returnFaild;
		}
		
		//取字段扩展定义信息
		String selcfg = (new ComboDefine()).configJson(funId, colCode);
		
		String fields = "null", design = "null";
		
		//取来源功能ID
		String ctlFunId = queryCtlFunId(funId, colCode);
		if (!selcfg.equals("null") && ctlFunId.length() > 0) {
			//取来源功能字段信息
			fields = createFields(ctlFunId);
			
			//取grid设计信息
			design = readDesign(ctlFunId);
		}
		
		//返回信息到前台
		StringBuilder sb = new StringBuilder();
		sb.append("{selcfg:" + selcfg);
		sb.append(",fields:" + fields);
		sb.append(",design:" + design + "}");
		_log.showDebug("............comboctl json=" + sb.toString());
		
		setReturnData(sb.toString());
		
		return _returnSuccess;
	}
	
	//构建字段定义信息
	private String createFields(String funId) {
		List<Map<String,String>> lsDesign = FunDefineDao.queryCol(funId);
		if (lsDesign.isEmpty()) return "";
		
		StringBuilder sb = new StringBuilder();
		for(Map<String,String> mp : lsDesign) {
			String type = mp.get("data_type");
			String format = mp.get("format_id");
			String code = mp.get("col_code");
			code = code.replace(".", "__");
			
			if (type.equals("date")) {
				String df = PageParserUtil.dateFormat(format);
				sb.append("{name:'" + code + "', type:'"+ type +"', dateFormat:'"+ df +"'},");
			} else {
				sb.append("{name:'" + code + "'},");
			}
		}
		String json = "";
		if (sb.length() > 0) {
			json = sb.substring(0, sb.length()-1);
		}
		
		return "["+ json +"]";
	}
	
	//取grid的设计信息
	//格式如：[{n:'funall_default__func_name',w:165,h:false},{}...]
	private String readDesign(String funId) {
		String ds = PageParserUtil.readDesign(funId, "grid");
		
		//替换设计信息中的-
		ds = ds.replaceAll("\\}-\\{", "\\},\\{");
		
		//给字段名添加''
		Pattern p = Pattern.compile("n:[^:]+,");
		Matcher m = p.matcher(ds);
		StringBuffer sb = new StringBuffer();
		while (m.find()) {
			String field = m.group();
			field = field.replace("n:", "n:'");
			field = field.replace(",", "',");
			
			m.appendReplacement(sb, field);
		}
		m.appendTail(sb);
		
		return "[" + sb.toString() + "]";
	}
	
	//取控件的功能ID
	private String queryCtlFunId(String funId, String colCode) {
		String sql = "select fun_id from funall_control where control_code in "+
			"(select control_name from fun_col where fun_id = ? and col_code = ?)";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(funId);
		param.addStringValue(colCode);
		
		Map<String,String> mp = _dao.queryMap(param);
		return MapUtil.getValue(mp, "fun_id");
	}
}
