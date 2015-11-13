/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.dataimp;

import java.util.Map;

import org.jxstar.control.action.RequestContext;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.FileUtil;
import org.jxstar.util.resource.JsParam;

/**
 * 数据导入模板下载。
 *
 * @author TonyTan
 * @version 1.0, 2012-6-13
 */
public class TplDownBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 下载模板
	 * @param request
	 * @return
	 */
	public String downTpl(RequestContext request) {
		String impFunId = request.getRequestValue("impFunId");
		String impIndex = request.getRequestValue("impIndex");
		String realPath = request.getRequestValue(JsParam.REALPATH);
		
		byte[] bytes = readTplFile(impFunId, impIndex, realPath);
		if (bytes == null || bytes.length == 0) return _returnFaild;
		request.setReturnBytes(bytes);
		
		//设置文件类型
		request.setRequestValue("ContentType", "application/vnd.ms-excel");
		//设置附件名称
		request.setRequestValue("Attachment", "imp_"+ impFunId + impIndex +".xls");
		
		return _returnSuccess;
	}
	
	private byte[] readTplFile(String impFunId, String impIndex, String realPath) {
		Map<String,String> mpImp = DataImpUtil.queryImp(impFunId, impIndex);
		if (mpImp.isEmpty()) {
			setMessage("没有找到【{0}】功能的数据导入定义！", impFunId);
			return null;
		}
		
		String tplFile = mpImp.get("tpl_file");
		if (tplFile.length() == 0) {
			setMessage("没有找到【{0}】功能的数据导入模板文件！", impFunId);
			return null;
		}
		
		String fileName = realPath + "/report/dataimp/" + tplFile;
		_log.showDebug("---------数据导入模板文件：" + fileName);
		
		byte[] bytes = FileUtil.fileToBytes(fileName);
		if (bytes == null || bytes.length == 0) {
			setMessage("没有找到【{0}】模板文件！", fileName);
			return null;
		} else {
			return bytes;
		}
	}
}
