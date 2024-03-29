/*
 * AttachBO.java 2010-11-29
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.service.studio;

import java.io.File;
import java.util.Map;

import org.apache.commons.fileupload.FileItem;
import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.DaoParam;
import org.jxstar.service.BoException;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.define.FunDefineDao;
import org.jxstar.util.DateUtil;
import org.jxstar.util.FileUtil;
import org.jxstar.util.ImageResize;
import org.jxstar.util.MapUtil;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.key.KeyCreator;
import org.jxstar.util.resource.JsMessage;

/**
 * 附件管理类，附件上传到服务器指定的文件目录中，系统参数有：
 * upload.file.path -- 附件存放路径，缺省值：C:/JXSTARDOC
 * upload.file.maxsize -- 允许附件最大值(M)，缺省值：10
 * 
 * 如果文件路径中存在同名的文件，则文件名后加'(2)'，并更新附件记录中的文件名。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-29
 */
public class AttachBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	//高清附件图片文件名后缀
	private static final String IMAGE_BIG = "_image_big";
	
	/**
	 * 下载附件到本地
	 * @param attachId -- 附件记录ID
	 * @return
	 */
	public String downAttach(String attachId, RequestContext requestContext) {
		if (attachId == null || attachId.length() == 0) {
			setMessage(JsMessage.getValue("systembo.attachbo.paramerror"));
			return _returnFaild;
		}
		
		//取附件记录
		Map<String,String> mpAttach = queryAttach(attachId);
		if (mpAttach.isEmpty()) {
			_log.showDebug("not attach data id: " + attachId);
			return _returnSuccess;
		}
		
		//是否下载高清图片
		String is_highimage = requestContext.getRequestValue("is_highimage", "0");
		mpAttach.put("is_highimage", is_highimage);
		
		//附件信息返回到前台
		try {
			byte[] bytes = queryAttachContent(mpAttach);
			requestContext.setReturnBytes(bytes);
		} catch (BoException e) {
			setMessage(JsMessage.getValue("systembo.attachbo.downerror"));
			return _returnFaild;
		}
		
		//设置文件类型
		String contentType = mpAttach.get("content_type");
		requestContext.setRequestValue("ContentType", contentType);
		//设置附件名称
		String attachPath = mpAttach.get("attach_path");
		String fileName = FileUtil.getFileName(attachPath);
		requestContext.setRequestValue("Attachment", fileName);
		
		return _returnSuccess;
	}
	
	/**
	 * 返回附件文件字节内容
	 * @param mpAttach -- 附件记录，主要使用字段信息有：attach_path, table_name
	 * @return
	 * @throws BoException
	 */
	public byte[] queryAttachContent(Map<String,String> mpAttach) throws BoException {
		//构建附件文件名
		String attachPath = mpAttach.get("attach_path");
		if (attachPath == null || attachPath.length() == 0) {
			throw new BoException(JsMessage.getValue("systembo.attachbo.filenameerror"));
		}
		
		//可能附件保存路径改变了，所以要重新构建路径
		String systemPath = SystemVar.getValue("upload.file.path", "D:/ATTACHDOC");
		String tableName = mpAttach.get("table_name");
		String fileName = FileUtil.getFileName(attachPath);
		attachPath = systemPath + "/" + tableName + "/" + fileName;
		_log.showDebug("---------查看附件名称：" + attachPath);
		
		//取高清图片附件名
		String is_highimage = MapUtil.getValue(mpAttach, "is_highimage", "0");
		String content_type = MapUtil.getValue(mpAttach, "content_type");
		if (is_highimage.equals("1") && content_type.indexOf("image") >= 0) {
			String[] orgNames = fileName.split("\\.");
			String hFileName = orgNames[0] + IMAGE_BIG + fileName.substring(fileName.indexOf("."));
			String hAttachPath = systemPath + "/" + tableName + "/" + hFileName;
			_log.showDebug("---------查看高清图片名称：" + hAttachPath);
			
			//如果高清图片存在，则取高清图片文件
			File ftmp = new File(hAttachPath);
			boolean isexists = ftmp.exists();
			if (isexists) {
				attachPath = hAttachPath;
			} else {
				_log.showDebug("---------高清图片不存在，取原图！");
			}
		}
		
		byte[] bytes = FileUtil.fileToBytes(attachPath);
		if (bytes == null) {//bytes.length == 0不判断，因为很多空文件的长度都是0
			throw new BoException(JsMessage.getValue("systembo.attachbo.downerror"));
		} else {
			return bytes;
		}
	}
	
	/**
	 * 批量删除附件记录
	 * @param attachIds -- 附件记录ID数组
	 * @return
	 */
	public String deleteAttach(String[] attachIds) {
		if (attachIds == null || attachIds.length == 0) {
			setMessage(JsMessage.getValue("systembo.attachbo.paramerror"));
			return _returnFaild;
		}
		
		for (int i = 0, n = attachIds.length; i < n; i++) {
			String ret = deleteAttach(attachIds[i]);
			if (ret.equals(_returnFaild)) {
				return _returnFaild;
			}
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 删除附件： 先删除附件文件，再删除附件记录
	 * @param attachId -- 附件记录ID
	 * @return
	 */
	public String deleteAttach(String attachId) {
		//取附件记录
		Map<String,String> mpAttach = queryAttach(attachId);
		if (mpAttach.isEmpty()) {
			_log.showDebug("not attach data id: " + attachId);
			return _returnSuccess;
		}
		
		//构建附件文件名
		String fileName = mpAttach.get("attach_path");
		if (fileName == null || fileName.length() == 0) {
			setMessage(JsMessage.getValue("systembo.attachbo.filenameerror"));
			return _returnFaild;
		}
		
		//可能附件保存路径改变了，所以要重新构建路径
		String systemPath = SystemVar.getValue("upload.file.path", "D:/ATTACHDOC");
		String tableName = mpAttach.get("table_name");
		fileName = FileUtil.getFileName(fileName);
		fileName = systemPath + "/" + tableName + "/" + fileName;
		_log.showDebug("---------删除附件名称：" + fileName);
		
		File file = new File(fileName);
		if (file.exists() && !file.delete()) {
			setMessage(JsMessage.getValue("systembo.attachbo.deleteerror"));
			return _returnFaild;
		}
		
		//删除记录
		String sql = "delete from sys_attach where attach_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(attachId);
		if (!_dao.update(param)) {
			setMessage(JsMessage.getValue("systembo.attachbo.deleteerror"));
			return _returnFaild;
		}
		
		//清除业务表中的附件字段的值，忽略错误信息
		clearFieldValue(mpAttach);
		
		//处理缩略图，原文件名为：xxxx_image_big.xxx，缩略图文件保存为当前文件
		String use_resize = SystemVar.getValue("sys.attach.use_resize", "0");
		if (use_resize.equals("1")) {
			File tofile = FileUtil.postfix(file, IMAGE_BIG);
			if (tofile.exists()) {
				_log.showDebug(".............删除缩略图：" + tofile.getName());
				tofile.delete();
			}
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 保存上传的附件，附件将保存到指定的文件目录。
	 * 文件名将保留上传附件的文件名，这样可能造成文件名重名，如果采用记录ID则造成识别性差。
	 * 
	 * @param requestContext -- 请求参数对象
	 * @return
	 */
	public String saveAttach(RequestContext requestContext) {
		//上传附件的数据ID
		String dataId = requestContext.getRequestValue("dataid");
		//上传附件的功能ID
		String dataFunId = requestContext.getRequestValue("datafunid");
		if (dataId.length() == 0 || dataFunId.length() == 0) {
			setMessage(JsMessage.getValue("systembo.attachbo.dataerror"));
			return _returnFaild;
		}
		//新增附件记录
		String attachId = "";
		try {
			attachId = insertRecord(dataId, dataFunId, requestContext);
		} catch (BoException e) {
			_log.showError(e);
			setMessage(e.getMessage());
			return _returnFaild;
		}
		
		FileItem item = getAttachItem(requestContext);
		//取原文件名
		String orgName = FileUtil.getFileName(item.getName());
		//取保存文件的完整路径，在insertRecord方法中赋值的
		String filePath = requestContext.getRequestValue("save_path");
		//需要保存的文件名
		String fileName = filePath + orgName;
		_log.showDebug("---------保存附件名称：" + fileName + "; size:" + item.getSize());
		
		FileUtil.createPath(filePath);
		File file = FileUtil.getValidFile(fileName);
		try {
			item.write(file);
		} catch (Exception e) {
			_log.showError(e);
			setMessage(JsMessage.getValue("systembo.attachbo.savefileerror"));
			return _returnFaild;
		}
		
		//如果保存的文件名与原文件名不同，则需要修改文件名
		String saveName = file.getName();
		if (!saveName.equals(orgName)) {
			if (!updatePath(attachId, saveName)) {//不保存filePath，没意义
				setMessage(JsMessage.getValue("systembo.attachbo.savefileerror"));
				return _returnFaild;
			}
		}
		
		//保存附件类型
		saveType(attachId, requestContext);
		
		//处理缩略图，把原文件改名为：xxxx_image_big.xxx，缩略图文件保存为当前文件
		String contentType = item.getContentType();
		if (contentType.indexOf("image") >= 0) {
			String imageSize = requestContext.getRequestValue("imagesize");//缩略图的尺寸
			String isImageResize = requestContext.getRequestValue("is_imageresize");//是否保存缩略图
			if (isImageResize.equals("1")) {
				saveImageResize(file, imageSize);
			}
		}
		String json = "{attachId:'"+ attachId +"'}";
		requestContext.setReturnData(json);
		
		return _returnSuccess;
	}
	
	/**
	 * 保存新的缩量图文件
	 * @param file
	 * @param requestContext
	 * @return
	 */
	private boolean saveImageResize(File file, String imageSize) {
		if (imageSize.length() == 0) {
			imageSize = SystemVar.getValue("sys.attach.resize", "600");
		}
		float tosize = Float.parseFloat(imageSize);
		//保留原文件名
		String orgname = file.getName();
		String orgpath = file.getParent();
		
		File tofile = FileUtil.postfix(file, "_image_big");
		boolean b = file.renameTo(tofile);
		if (b) {
			_log.showDebug(".............修改原图片文件成功：" + tofile.getName());
		} else {
			_log.showDebug(".............修改原图片文件失败：" + tofile.getName());
		}
		
		//生成缩略图
		boolean ret = ImageResize.resizeImage(tofile, file, tosize);
		_log.showDebug(".............保存缩略图结果：" + ret + ";" + tofile.getName());
		if (!ret) {//生成缩略图失败，文件名还原
			String orgstr = orgpath + "/" + orgname;
			_log.showDebug(".............原文件名：" + orgstr);
			File orgfile = new File(orgstr);
			tofile.renameTo(orgfile);
		}
		
		return true;
	}
	
	/**
	 * 新增附件记录。
	 * @param dataId -- 数据ID
	 * @param dataFunId -- 数据功能ID
	 * @param requestContext
	 * @return
	 * @throws BoException
	 */
	private String insertRecord(String dataId, String dataFunId, 
						RequestContext requestContext) throws BoException {
		//取新增附件ID
		String attachId = KeyCreator.getInstance().createKey("sys_attach");
		//取附件名称
		String attachName = requestContext.getRequestValue("attach_name");
		//取附件相关的字段
		String attachField = requestContext.getRequestValue("attach_field");
		//取功能基础信息
		Map<String,String> mpFun = FunDefineDao.queryFun(dataFunId);
		//取功能表名
		String tableName = mpFun.get("table_name");
		//取功能名称
		String funName = mpFun.get("fun_name");
		//保存附件到指定文件目录
		String systemPath = SystemVar.getValue("upload.file.path", "D:/ATTACHDOC");
		
		//取附件信息
		FileItem item = getAttachItem(requestContext);
		if (item == null || item.isFormField()) {
			throw new BoException(JsMessage.getValue("systembo.attachbo.noupload"));
		}
		String fileName = FileUtil.getFileName(item.getName());
		if (fileName == null || fileName.length() == 0) {
			throw new BoException(JsMessage.getValue("systembo.attachbo.filenameerror"));
		}
		//保存附件路径
		String attachPath = systemPath+"/"+tableName+"/";
		requestContext.setRequestValue("save_path", attachPath);
		attachPath += fileName;
		String contentType = item.getContentType();
		//取用户信息
		Map<String,String> mpUser = requestContext.getUserInfo();
		String userId = MapUtil.getValue(mpUser, "user_id");
		//跨域上传附件时，没有用户信息，但会传递用户ID
		if (userId.length() == 0) {
			userId = requestContext.getRequestValue("user_id");
			if (userId.length() > 0) {
				mpUser = queryUser(userId);
			}
		}
		String userName = MapUtil.getValue(mpUser, "user_name");
		
		StringBuilder sbsql = new StringBuilder();
		sbsql.append("insert into sys_attach (");
		sbsql.append("attach_id, table_name, data_id, attach_name, content_type, attach_field, fun_id,"); 
		sbsql.append("fun_name, attach_path, upload_date, upload_user, add_userid, add_date");
		sbsql.append(") values (?, ?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?, ?)");
		
		DaoParam param = _dao.createParam(sbsql.toString());
		param.addStringValue(attachId);
		param.addStringValue(tableName);
		param.addStringValue(dataId);
		param.addStringValue(attachName);
		param.addStringValue(contentType);
		param.addStringValue(attachField);
		param.addStringValue(dataFunId);
		
		param.addStringValue(funName);
		param.addStringValue(fileName);//不保存attachPath，没意义
		param.addDateValue(DateUtil.getTodaySec());
		param.addStringValue(userName);
		param.addStringValue(userId);
		param.addDateValue(DateUtil.getTodaySec());
		
		if (!_dao.update(param)) {
			throw new BoException(JsMessage.getValue("systembo.attachbo.newerror"));
		}

		return attachId;
	}
	
	/**
	 * 取上传file对象
	 */
	private FileItem getAttachItem(RequestContext request) {
		String myField = "attach_path";
		//取附件相关的字段
		String attachField = request.getRequestValue("attach_field");
		if (attachField.length() > 0) {
			myField = attachField;
		}
		
		FileItem item = (FileItem) request.getRequestObject(myField);
		if (item == null || item.isFormField()) {
			//业务表名
			String table = request.getRequestValue("table_name");
			item = (FileItem) request.getRequestObject(table+"__"+attachField);
		}
		
		return item;
	}
	
	/**
	 * 更新附件文件路径
	 * @param attachId -- 附件记录ID
	 * @param path -- 附件新的路径名称
	 * @return
	 */
	private boolean updatePath(String attachId, String path) {
		String sql = "update sys_attach set attach_path = ? where attach_id = ?";
		
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(path);
		param.addStringValue(attachId);
		
		return _dao.update(param);
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
	
	//清除业务表中附件字段的值
	private boolean clearFieldValue(Map<String,String> mpAttach) {
		//如果没有附件字段，则不用清除
		String attachField = mpAttach.get("attach_field");
		if (attachField.length() == 0) return true; 
		
		String dataId = mpAttach.get("data_id");
		String tableName = mpAttach.get("table_name");
		String funId = mpAttach.get("fun_id");
		//取功能基础信息
		Map<String,String> mpFun = FunDefineDao.queryFun(funId);
		//取主键字段名
		String keyName = mpFun.get("pk_col");
		
		String sql = "update " + tableName + " set " + attachField + " = '' where " + keyName + " = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(dataId);
		
		return _dao.update(param);
	}
	
	/**
	 * 取附件记录，暂时用于ReportXlsUtil.printCellImage()方法，用于报表中输出图片。
	 * @param attachId -- 附件记录ID
	 * @return
	 */
	public Map<String,String> queryAttach(String dataId, String tableName, String fieldName) 
									throws BoException{
		if (dataId == null || dataId.length() == 0 ||
				tableName == null || tableName.length() == 0 ||
				fieldName == null || fieldName.length() == 0) {
			throw new BoException(JsMessage.getValue("systembo.attachbo.paramerror"));
		}
		
		String sql = "select table_name, data_id, content_type, attach_field, fun_id, attach_path " +
					 "from sys_attach where table_name = ? and data_id = ? and attach_field = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(tableName);
		param.addStringValue(dataId);
		param.addStringValue(fieldName);
		return _dao.queryMap(param);
	}

	//跨域上传附件时，没有用户信息，但会传递用户ID
	public Map<String,String> queryUser(String userId) {
		String sql = "select user_id, user_name from sys_user where user_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(userId);
		
		return _dao.queryMap(param);
	}
	
	//保存附件类型；为了方便升级，此代码暂时不融入到insertRecord方法中
	private boolean saveType(String attachId, RequestContext request) {
		String typeData = request.getRequestValue("attach_type");
		if (typeData.length() == 0) return true;
		
		String sql = "update sys_attach set attach_type = ? where attach_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(typeData);
		param.addStringValue(attachId);
		
		return _dao.update(param);
	}
}
