/*
 * ExpJxstarBO.java 2012-3-15
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.patch.update;

import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.pool.DataSourceConfig;
import org.jxstar.dao.pool.DataSourceConfigManager;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.FileUtil;

/**
 * 平台数据对比的工具类。
 *
 * @author KevinCao
 * @version 1.0, 2013-3-28
 */
public class CompJxstarBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	/**
	 * 导出平台的更新SQL
	 */
	public String expUpdateSql(RequestContext request) {
		String jdbcurl = request.getRequestValue("jdbcurl");
		String username = request.getRequestValue("username");
		String password = request.getRequestValue("password");
		
		String expType = request.getRequestValue("exptype"); //导出类型：模块或功能
		String expIds = request.getRequestValue("expIds");			 //模块ID或功能ID的字符串
		String expPath = request.getRequestValue("exppath"); //导出文件路径
		
		String expControl = request.getRequestValue("expcontrol"); //导出相关选项控件  1是 0否
		String expCtlSel = request.getRequestValue("expctlsel");	//导出相关选择控件、 选择窗口
		String expModule = request.getRequestValue("expmodule");	//导出相关模块定义
		String expXls = request.getRequestValue("expxls");		//导出相关XLS导入定义
		String expDmcfg = request.getRequestValue("expdmcfg");		//导出相关数据模型定义
		String isNew = request.getRequestValue("isnew");		//数据模型是否新建状态
		String realPath = request.getRequestValue("sys.realpath"); 
		//String verno = SystemVar.getValue("sys.version.no"); //当前版本号
		
		UpdateSql comp = new UpdateSql();
		if((jdbcurl == null || jdbcurl.length() == 0) || (username == null || username.length() == 0) || 
				(password == null || password.length() == 0) ){
			setMessage("请设置好目标数据源！");
			return _returnFaild;
		}
		boolean valid = comp.setTargetDataSource(jdbcurl, username, password);
		if(!valid){
			setMessage("目标数据源无效！");
			return _returnFaild;
		}
		/*平台版本不影响对比效果
		if(!ExportSqlUtil.getVerNo().equals(verno)){
			setMessage("当前数据库与目标数据库的jxstar平台版本不一致，无法对比！");
			return _returnFaild;
		}*/
		
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
		comp.save_path = expPath;
		comp.realPath = realPath;
		
		String[] Ids = expIds.split(",");
		if(Ids.length > 0){
			if(expType != null && expType.equals("mod")){
				//导出指定模块的SQL
				String[] moduleIds = Ids;
				comp.modExpToFile(moduleIds,expDmcfg,isNew,expModule,expControl,expCtlSel,expXls);
			}else{
				//导出指定功能的SQL
				String[] funIds = Ids;
				comp.funExpToFile(funIds,expDmcfg,isNew,expModule,expControl,expCtlSel,expXls);
			}
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 获取当前数据源访问URL和用户名
	 */
	public String getJdbcURL() {
		DataSourceConfig dsc = DataSourceConfigManager.getInstance().getDataSourceConfig("default");
		String jdbcUrl = dsc.getJdbcUrl();
		String userName = dsc.getUserName();
		
		setReturnData("{'jdbcurl':'"+ jdbcUrl +"','username':'"+ userName +"'}");
		return _returnSuccess;
	}
	
}
