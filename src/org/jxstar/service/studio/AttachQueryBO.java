/*
 * Copyright(c) 2014 DongHong Inc.
 */
package org.jxstar.service.studio;

import java.io.File;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.FileUtil;
import org.jxstar.util.StringUtil;
import org.jxstar.util.config.SystemVar;

/**
 * 附件信息查询。
 *
 * @author TonyTan
 * @version 1.0, 2014-5-21
 */
public class AttachQueryBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 查询附件信息
	 * @param attachId
	 * @return
	 */
	public String onQuery(String attachId) {
		String json = "{}";
		//取附件记录
		Map<String,String> mpAttach = queryAttach(attachId);
		if (mpAttach.isEmpty()) {
			setReturnData(json);
			return _returnSuccess;
		}
		
		String contentType = mpAttach.get("content_type");
		String systemPath = SystemVar.getValue("upload.file.path", "D:/ATTACHDOC");
		
		String attachPath = mpAttach.get("attach_path");
		String tableName = mpAttach.get("table_name");
		String fileName = FileUtil.getFileName(attachPath);
		attachPath = systemPath + "/" + tableName + "/" + fileName;
		
		//判断文件是否存在
		File file = new File(attachPath);
		if (!file.exists()) {
			setReturnData(json);
			return _returnSuccess;
		}
		
		json = "{contentType:'"+ StringUtil.strForJson(contentType) +"', attachPath:'"+ StringUtil.strForJson(attachPath) +"'}";
		setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 取附件记录
	 * @param attachId -- 附件记录ID
	 * @return
	 */
	private Map<String,String> queryAttach(String attachId) {
		String sql = "select table_name, data_id, content_type, attach_field, fun_id, attach_path " +
					 "from sys_attach where attach_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(attachId);
		return _dao.queryMap(param);
	}
}
