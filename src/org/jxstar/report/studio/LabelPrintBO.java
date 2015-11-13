/*
 * Copyright(c) 2014 DongHong Inc.
 */
package org.jxstar.report.studio;

import java.io.UnsupportedEncodingException;
import java.util.Map;

import org.apache.commons.fileupload.FileItem;
import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.StringUtil;

/**
 * 标签打印设计器工具类。
 *
 * @author TonyTan
 * @version 1.0, 2014-4-21
 */
public class LabelPrintBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 保存标签设计信息
	 * @param request
	 * @return
	 */
	public String saveXML(RequestContext request) {
		String modeId = request.getRequestValue("modelid");
		String setxml = request.getRequestValue("setxml");
		String colxml = request.getRequestValue("colxml");
		String pagexml = request.getRequestValue("pagexml");

		String sql = "update lab_model set design_set = ?, design_col = ?, design_head = ? where model_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(setxml);
		param.addStringValue(colxml);
		param.addStringValue(pagexml);
		param.addStringValue(modeId);
		if (!_dao.update(param)) {
			setMessage("保存设计信息失败！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 读取标签设计信息
	 * @param modelId
	 * @return
	 */
	public String readXML(String modelId) {
		String sql = "select design_set, design_col, design_head from lab_model where model_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(modelId);
		Map<String,String> mp = _dao.queryMap(param);
		
		String json = "{}";
		if (!mp.isEmpty()) {
			json = "{pagexml:'"+ StringUtil.strForJson(mp.get("design_head"))
					+"', setxml:'"+ StringUtil.strForJson(mp.get("design_set")) +"'}";
		}
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 导入设计文件
	 * @param request
	 * @return
	 */
	public String importXML(RequestContext request) {
		String modelId = request.getRequestValue("modelid");
		String field = request.getRequestValue("fieldname");
		FileItem item = (FileItem) request.getRequestObject("xmlfile");
		if (item == null || item.isFormField()) {
			setMessage("没有找到上传文件！");
			return _returnFaild;
		}
		
		String xml = item.getString();
		String encode = "utf-8";
		if (xml.indexOf("gb2312") > 0) {
			encode = "gb2312";
		}
		try {
			xml = item.getString(encode);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		_log.showDebug("..........上传设计文件：" + xml);
		
		boolean ret = writeXML(modelId, field, xml);
		if (!ret) {
			setMessage("导入设计信息失败！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 修改设计信息
	 * @param modelId
	 * @param field
	 * @param xml
	 * @return
	 */
	public boolean writeXML(String modelId, String field, String xml) {
		String sql = "update lab_model set "+ field +" = ? where model_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(xml);
		param.addStringValue(modelId);
		return _dao.update(param);
	}
}
