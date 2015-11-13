/*
 * PageParserBO.java 2009-10-25
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.fun.design;

import java.util.Map;

import org.jxstar.fun.design.parser.FormPageParser;
import org.jxstar.fun.design.parser.GridPageParser;
import org.jxstar.fun.design.parser.PageParser;
import org.jxstar.fun.design.parser.PageParserUtil;
import org.jxstar.security.LicenseVar;
import org.jxstar.security.SafeManager;
import org.jxstar.service.BoException;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.define.FunDefineDao;
import org.jxstar.util.FileUtil;
import org.jxstar.util.resource.JsMessage;

/**
 * 页面文件生成类，可以生成GRID与FORM页面。
 *
 * @author TonyTan
 * @version 1.0, 2009-10-25
 */
public class PageParserBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 把页面文件生成到指定的路径
	 * @param funcId -- 功能ID
	 * @param pageType -- 页面类型，只有form,grid
	 * @param realPath -- 系统路径
	 * @return
	 */
	public String createJs(String funcId, String pageType, String realPath) {
		if (funcId == null || funcId.length() == 0 ||
				pageType == null || pageType.length() == 0) {
			//"错误：生成文件的参数值为空！"
			_log.showWarn(JsMessage.getValue("formdisignbo.paramnull"));
			return _returnFaild;
		}
		
		//----------------------------许可检测-----------------------------
		SafeManager safe = SafeManager.getInstance();
		String verName = safe.getVerName();
		//安全类标志检查
		String flagValid = LicenseVar.getValue(LicenseVar.FLAG_VALID, "0");
		if (flagValid.equals("0")) {
			//不添加safe.setTmpValid("0");方便用户恢复远程控制
			setMessage(JsMessage.getValue("license.notvalid"), 0);
			return _returnFaild;
		}
		
		//学习版不检测合法性，其它版本都检测
		if (!verName.equals("SE")) {
			int code = safe.checkCode();
			if (code > 0) {
				setMessage(JsMessage.getValue("license.notvalid"), code);
				return _returnFaild;
			}
		}
		//企业版不控制注册数，其它版本都控制
		if (!verName.equals("EE")) {
			int funNum = safe.getNum(1);//注册功能数
			int regNum = PageParserUtil.getFunNum();
			if (funNum < regNum) {
				setMessage(JsMessage.getValue("license.funnum", funNum));
				return _returnFaild;
			}
			//数量安全标识检查
			String numValid = LicenseVar.getValue(LicenseVar.NUM_VALID, "0");
			if (numValid.equals("0")) {
				safe.setTmpValid("0");
				setMessage(JsMessage.getValue("license.notvalid"), 9);
				return _returnFaild;
			}
		}
		//-----------------------------------------------------------------
		
		//取功能定义信息
		Map<String,String> mpFun = FunDefineDao.queryFun(funcId);
		
		//生成页面文件内容
		String page = "";
		try {
			page = parsePage(funcId, pageType, realPath);
		} catch (BoException e) {
			setMessage(e.getMessage());
			return _returnFaild;
		}
		
		//取页面文件名
		String fileName = "";
		if (pageType.indexOf("grid") >= 0) {
			fileName = mpFun.get("grid_page");
		} else {
			fileName = mpFun.get("form_page");
		}
		if (fileName.length() == 0) {
			setMessage(JsMessage.getValue("jscreator.notpage"), pageType);
			return _returnFaild;
		}
		
		//生成页面物理文件
		fileName = realPath + fileName;
		_log.showDebug("生成文件的名称=" + fileName);
		FileUtil.saveFileUtf8(fileName, page);
		
		return _returnSuccess;
	}
	
	/**
	 * 把页面设计信息解析为JS页面文件，可以返回到前台页面。
	 * @param funcId -- 功能ID
	 * @param pageType -- 页面类型
	 * @param realPath -- 系统路径
	 * @return
	 */
	private String parsePage(String funcId, String pageType, String realPath) 
		throws BoException {
		PageParser parser = null;
		if (pageType.indexOf("grid") >= 0) {
			parser = new GridPageParser(funcId, pageType, realPath, false);
		} else {
			parser = new FormPageParser(funcId, pageType, realPath, false);
		}
		
		//解析页面文件
		String ret = parser.parsePage();
		if (ret.equals(_returnFaild)) {
			throw new BoException(parser.getMessage());
		}
		
		return parser.getReturnData();
	}
}
