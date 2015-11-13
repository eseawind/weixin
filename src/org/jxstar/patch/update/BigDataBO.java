/**
 * 
 */
package org.jxstar.patch.update;

import org.jxstar.control.action.RequestContext;
import org.jxstar.service.BusinessObject;

/**
 * 平台的大数据工具类。
 * @author kevin
 * 2013-4-7
 */
public class BigDataBO extends BusinessObject{
	private static final long serialVersionUID = 1L;

	/**
	 * 导出导入页面设计
	 */
	public String pageBlob(RequestContext request) {
		String path = request.getRequestValue("path");
		String type = request.getRequestValue("type");
		
		if(path == null || path.length() == 0){
			setMessage("请输入文件路径！");
			return _returnFaild;
		}
		
		if(type != null && type.length() != 0){
			UpdatePage page = new UpdatePage();
			if(type.equals("expfun")){ 		//导出功能设计文件
				page.saveBlob(path, "design_id", "fun_design", "page_content", "");
				setReturnData("{'msg':'导出功能设计文件成功！'}");
				
			}else if(type.equals("expwf")){ //导出流程图设计文件
				page.saveBlob(path, "design_id", "wf_design", "process_file", "");
				setReturnData("{'msg':'导出流程图设计文件成功！'}");
				
			}else if(type.equals("expnav")){//导出流程导航设计文件
				page.saveBlob(path, "design_id", "wfnav_design", "design_file", "");
				setReturnData("{'msg':'导出流程导航设计文件成功！'}");
				
			}else if(type.equals("impfun")){//导入功能设计设计文件
				String msg=page.update(path, "design_id", "fun_design", "page_content");
				setReturnData("{'msg':'导入功能设计文件成功！"+msg+"'}");
				
			}else if(type.equals("impwf")){//导入流程图设计文件
				page.update(path, "design_id", "wf_design", "process_file");
				setReturnData("{'msg':'导入流程图设计文件成功！'}");
				
			}else if(type.equals("impnav")){//导入流程导航设计文件
				page.update(path, "design_id", "wfnav_design", "design_file");
				setReturnData("{'msg':'导入流程导航设计文件成功！'}");
			}
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 自定义导出大数据字段的数据到文件中
	 */
	public String expBlob(RequestContext request) {
		String path = request.getRequestValue("path");
		String keyName = request.getRequestValue("keyName");
		String tableName = request.getRequestValue("tableName");
		String blobName = request.getRequestValue("blobName");
		
		if(path == null || path.length() == 0){
			setMessage("请输入文件路径！");
			return _returnFaild;
		}
		
		UpdatePage page = new UpdatePage();
		page.saveBlob(path, keyName, tableName, blobName, "");
		
		return _returnSuccess;
	}
	
	/**
	 * 自定义导入数据文件到数据库中
	 */
	public String impBlob(RequestContext request) {
		String path = request.getRequestValue("path");
		String keyName = request.getRequestValue("keyName");
		String tableName = request.getRequestValue("tableName");
		String blobName = request.getRequestValue("blobName");
		
		if(path == null || path.length() == 0){
			setMessage("请输入文件路径！");
			return _returnFaild;
		}
		
		UpdatePage page = new UpdatePage();
		page.update(path, keyName, tableName, blobName);
		
		return _returnSuccess;
	}
	
}
