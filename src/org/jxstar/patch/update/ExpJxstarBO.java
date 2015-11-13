/*
 * ExpJxstarBO.java 2012-3-15
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.patch.update;

import org.jxstar.control.action.RequestContext;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.FileUtil;

/**
 * 平台数据迁移的工具类。
 *
 * @author TonyTan
 * @version 1.0, 2012-3-15
 */
public class ExpJxstarBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 导出平台的新增SQL
	 */
	public String expInsertSql(RequestContext request) {
		String expType = request.getRequestValue("exptype"); //导出类型：模块或功能
		String expIds = request.getRequestValue("expIds");	//模块ID或功能ID的字符串
		String expPath = request.getRequestValue("exppath"); //导出文件路径
		
		String expControl = request.getRequestValue("expcontrol"); //导出相关选项控件  1是 0否
		String expCtlSel = request.getRequestValue("expctlsel");	//导出相关选择控件、 选择窗口
		String expModule = request.getRequestValue("expmodule");	//导出相关模块定义
		String expXls = request.getRequestValue("expxls");		//导出相关XLS导入定义
		String expDmcfg = request.getRequestValue("expdmcfg");		//导出相关数据模型定义
		String isNew = request.getRequestValue("isnew");		//数据模型是否新建状态
		
		String realPath = request.getRequestValue("sys.realpath"); 
		
		InsertSql exp = new InsertSql();
		
		if(expPath == null || expPath.length() == 0){
			setMessage("请输入文件路径！");
			return _returnFaild;
		}
		expPath = ExportSqlUtil.dealPath(expPath);
		String[] direNames = {"fun_design","wf_design","wfnav_design","page"};
		if(FileUtil.exists(expPath)){
			for(String direName :direNames){
				ExportSqlUtil.deleteFile(expPath + direName +"/");
			}
		} 
		exp.save_path = expPath;
		exp.realPath = realPath;
		
		String[] Ids = expIds.split(",");
		if(Ids.length > 0){
			if(expType != null && expType.equals("mod")){
				//导出指定模块的SQL
				String[] moduleIds = Ids;
				exp.modExpToFile(moduleIds,expDmcfg,isNew,expModule,expControl,expCtlSel,expXls);
			}else{
				//导出指定功能的SQL
				String[] funIds = Ids;
				exp.funExpToFile(funIds,expDmcfg,isNew,expModule,expControl,expCtlSel,expXls);
			}
		}
		
		return _returnSuccess;
	}
	
}
