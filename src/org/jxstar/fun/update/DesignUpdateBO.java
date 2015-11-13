/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.fun.update;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.dao.util.BigFieldUtil;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.FileUtil;
import org.jxstar.util.key.KeyCreator;

/**
 * 设计文件更新类。
 *
 * @author TonyTan
 * @version 1.0, 2012-8-7
 */
public class DesignUpdateBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	private static final String FILE_FLAG = "___";

	/**
	 * 找出所有差异的设计文件，并生成文件
	 * @param srcDN
	 * @param destDN
	 * @param toPath
	 */
	public String compareDesign(String srcDN, String destDN, String toPath) {
		if (toPath == null || toPath.length() == 0) toPath = "d:\\design_update";
		FileUtil.createPath(toPath);
		
		_log.showDebug("生成更新设计文件到此目录中：" + toPath);
		if (srcDN == null || srcDN.length() == 0 ||
			destDN == null || destDN.length() == 0) {
			setMessage("来源与目标数据源都不能为空！");
			return _returnFaild;
		}
		
		List<Map<String,String>> lsSrcDes = queryDesign(srcDN);
		
		int cnt = 0;
		for (Map<String,String> mpSrc : lsSrcDes) {
			String funId = mpSrc.get("fun_id");
			String pageType = mpSrc.get("page_type");
			_log.showDebug("compare funid=" + funId + " pagetype=" + pageType);
			
			String srcDesign = readDesign(srcDN, funId, pageType);
			String destDesign = readDesign(destDN, funId, pageType);
			
			int srcLen = srcDesign.length();
			int destLen = destDesign.length();
			_log.showDebug("src_len=" + srcLen + " dest_len=" + destLen);
			
			//只比较长度，不等就生成文件
			if (srcLen != destLen || !srcDesign.equals(destDesign)) {
				cnt++;
				String fileName = toPath + "\\" + funId + FILE_FLAG + pageType + ".txt";
				
				_log.showDebug("生成更新设计文件：" + fileName);
				FileUtil.saveFile(fileName, srcDesign, "UTF-8");
			}
		}
		_log.showDebug("共生成更新设计文件个数：" + cnt);
		return _returnSuccess;
	}
	
	/**
	 * 更新设计文件
	 * @param dsName
	 * @param toPath
	 */
	public String updateDesign(String dsName, String toPath) {
		if (toPath == null || toPath.length() == 0) toPath = "d:\\design_update";
		_log.showDebug("指定的设计文件目录为：" + toPath);
		
		toPath = toPath.replace('\\', '/');
        if (toPath.charAt(toPath.length()-1) == '/') {
        	toPath = toPath.substring(0, toPath.length()-1);
        }
		
		File path = new File(toPath);
		
		File[] files = path.listFiles();
		if (files == null || files.length == 0) {
			setMessage("设计文件目录不存在，或者没有需要更新的设计文件！");
			return _returnFaild;
		}
		
		for (File file : files) {
			String name = file.getName();
			_log.showDebug("更新的设计文件是：" + name);
			
			String fileName = toPath + "/" + name;
			String content = FileUtil.readFile(fileName, "UTF-8");
			
			//支持另一种文件命名规范
			if (name.indexOf("fun_design") >= 0) {
				String[] names = name.split("\\.");
				if (names.length < 3) continue;
				
				_log.showDebug("更新的设计文件ID：" + names[1]);
				writeDesignById(dsName, names[1], content);
			} else {
				String[] names = name.split("\\.")[0].split(FILE_FLAG);
				if (names.length < 2) continue;
				
				_log.showDebug("更新的设计文件功能ID与页面类型：" + names[0]+";"+names[1]);
				if (!hasDesign(dsName, names[0], names[1])) {
					insertDesign(dsName, names[0], names[1]);
				}
				writeDesign(dsName, names[0], names[1], content);
			}
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 取出所有设计文件
	 * @param dsName
	 * @return
	 */
	public List<Map<String,String>> queryDesign(String dsName) {
		String sql = "select design_id, fun_id, page_type from fun_design order by fun_id, page_type";
		DaoParam param = _dao.createParam(sql);
		param.setDsName(dsName);
		return _dao.query(param);
	}
	
	/**
	 * 是否有设计记录
	 * @param dsName
	 * @param funId
	 * @param pageType
	 * @return
	 */
	public boolean hasDesign(String dsName, String funId, String pageType) {
		String sql = "select count(*) as cnt from fun_design where fun_id = ? and page_type = ?";
		DaoParam param = _dao.createParam(sql);
		param.setDsName(dsName);
		param.addStringValue(funId);
		param.addStringValue(pageType);
		
		Map<String,String> mp = _dao.queryMap(param);
		return ! mp.get("cnt").equals("0");
	}
	
	/**
	 * 新增一条设计记录
	 * @param dsName
	 * @param funId
	 * @param pageType
	 * @return
	 */
	public boolean insertDesign(String dsName, String funId, String pageType) {
		String sql = "insert into fun_design(design_id, fun_id, page_type) "+
		 "values(?, ?, ?)";

		//创建主键
		String keyId = KeyCreator.getInstance().createKey("fun_design");
		
		DaoParam param = _dao.createParam(sql);
		param.setDsName(dsName);
		param.addStringValue(keyId).addStringValue(funId).addStringValue(pageType);
		
		return _dao.update(param);
	}
	
	/**
	 * 读取设计文件
	 * @param dsName
	 * @param funId
	 * @param pageType
	 * @return
	 */
	public String readDesign(String dsName, String funId, String pageType) {
		String sql = "select page_content from fun_design where fun_id = '"+ 
			funId +"' and page_type = '"+ pageType +"'";
		
		return BigFieldUtil.readStream(sql, "page_content", dsName);
	}
	
	/**
	 * 更新设计文件
	 * @param dsName
	 * @param funId
	 * @param pageType
	 * @param content
	 * @return
	 */
	public boolean writeDesign(String dsName, String funId, String pageType, String content) {
		String sql = "update fun_design set page_content = ? where fun_id = '"+ 
			funId +"' and page_type = '"+ pageType +"'";
		
		return BigFieldUtil.updateStream(sql, content, dsName);
	}
	
	/**
	 * 根据设计ID更新设计文件
	 * @param dsName
	 * @param designId
	 * @param content
	 * @return
	 */
	public boolean writeDesignById(String dsName, String designId, String content) {
		String sql = "update fun_design set page_content = ? where design_id = '"+ designId +"'";
		
		return BigFieldUtil.updateStream(sql, content, dsName);
	}
}
