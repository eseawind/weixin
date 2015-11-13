/*
 * Copyright(c) 2014 DongHong Inc.
 */
package org.jxstar.patch.update;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.FileUtils;
import org.jxstar.dao.DaoParam;
import org.jxstar.dao.util.BigFieldUtil;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.FileUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 对比所有功能设计文件的差异信息。
 *
 * @author TonyTan
 * @version 1.0, 2014-3-29
 */
public class CompDesign extends BusinessObject {
	private static final long serialVersionUID = 1L;
	
	//对比的目标数据源
	private String TO_DSNAME = "todefault";
	private String DSNAME = "default";
	
	//生成差异设计文件存放的目录
	private String _path = "c:/tmpblob";
	
	public void setPath(String path) {
		_path = path;
	}
	
	//对比后自动更新：适用于开发库与目标库都可以直接连接的情况
	public boolean update() {
		List<String> srcDes = queryDesignId(DSNAME);
		List<String> tagDes = queryDesignId(TO_DSNAME);
		
		boolean retb = false;
		int newi = 0, updatei = 0;
		for (String srcid : srcDes) {
			//如果在目标库中存在，则对比设计文件
			if (tagDes.contains(srcid)) {
				retb = updateCont(srcid);
				if (retb) updatei++;
			} else {
				String fundesc = queryFun(srcid);
				_log.showDebug("............新增设计文件：" + fundesc);
				
				//如果不存在，新增记录到目标库中
				String csql = createSql(srcid);
				DaoParam param = _dao.createParam(csql);
				param.setDsName(TO_DSNAME);
				retb = _dao.update(param);
				if (!retb) return retb;
				
				//还需有更新设计文件
				String src = queryCont(srcid, DSNAME);
				String sql = "update fun_design set page_content = ? where design_id = '"+ srcid +"'";
				retb = BigFieldUtil.updateStream(sql, src, TO_DSNAME);
				if (!retb) return retb;
				
				newi++;
			}
		}
		
		_log.showDebug("............新增设计文件：" + newi);
		_log.showDebug("............更新设计文件：" + updatei);
		
		return true;
	}

	//对比两个数据源中的差异，返回新设计sql；
	//适用于目标库不可以直接连接，需要发更新包的情况，设计文件可以用功能设计器的扩展操作更新，新增sql语句另外执行
	public String compare() {
		//如果存在则先删除
		File f = new File(_path);
		if (f.exists()) {
			try {
				FileUtils.deleteDirectory(f);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		List<String> srcDes = queryDesignId(DSNAME);
		List<String> tagDes = queryDesignId(TO_DSNAME);
		
		StringBuilder sbsql = new StringBuilder();
		
		int newi = 0, updatei = 0;
		//保存差异设计文件
		for (String srcid : srcDes) {
			//如果在目标库中存在，则对比设计文件
			if (tagDes.contains(srcid)) {
				if (compareCont(srcid)) updatei++;
			} else {
				newi++;
				
				String fundesc = queryFun(srcid);
				_log.showDebug("............新增设计文件：" + fundesc);
				
				//如果不存在，则生成新增sql，还需要生成设计文件
				String csql = createSql(srcid);
				sbsql.append(csql + ";\r\n");
				
				String src = queryCont(srcid, DSNAME);
				String fileName = _path + "/fun_design." + srcid + ".txt";
				FileUtil.saveFile(fileName, src, "UTF-8");
			}
		}
		
		//保存新增sql
		String nsql = sbsql.toString();
		if (nsql.length() > 0) {
			FileUtil.saveFile("c:/insert.sql", nsql);
			_log.showDebug("............新增设计SQL：" + nsql);
		}
		
		_log.showDebug("............新增设计文件：" + newi);
		_log.showDebug("............更新设计文件：" + updatei);
		
		return nsql;
	}
	
	//比较设计文件差异
	private boolean compareCont(String designId) {
		String src = queryCont(designId, DSNAME);
		String tag = queryCont(designId, TO_DSNAME);
		
		//如果不相同，就保存来源库中的文件
		if (!src.equals(tag)) {
			String fundesc = queryFun(designId);
			_log.showDebug("............生成设计文件：" + fundesc);
			
			String fileName = _path + "/fun_design." + designId + ".txt";
			return FileUtil.saveFile(fileName, src, "UTF-8");
		}
		
		return false;
	}
	
	//设计文件不同时自动更新
	private boolean updateCont(String designId) {
		String src = queryCont(designId, DSNAME);
		String tag = queryCont(designId, TO_DSNAME);
		
		//如果不相同，就保存来源库中的文件
		if (!src.equals(tag)) {
			String fundesc = queryFun(designId);
			_log.showDebug("............更新设计文件：" + fundesc);
			
			String sql = "update fun_design set page_content = ? where design_id = '"+ designId +"'";
			return BigFieldUtil.updateStream(sql, src, TO_DSNAME);
		}
		
		return false;
	}
	
	//生成新增sql
	private String createSql(String designId) {
		String sql = "select fun_id, page_type from fun_design where design_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.setDsName(DSNAME);
		param.addStringValue(designId);
		Map<String,String> mp = _dao.queryMap(param);
		
		if (mp.isEmpty()) return "";
		
		String csql = "insert into fun_design(design_id, fun_id, page_type) values('"+ 
			designId +"', '"+ mp.get("fun_id") +"', '"+ mp.get("page_type") +"')";
		
		return csql;
	}
	
	//取所有设计ID
	private List<String> queryDesignId(String dsName) {
		String sql = "select design_id from fun_design";
		DaoParam param = _dao.createParam(sql);
		param.setDsName(dsName);
		List<Map<String,String>> ls = _dao.query(param);
		
		List<String> lsRet = FactoryUtil.newList();
		for (Map<String,String> mp : ls) {
			lsRet.add(mp.get("design_id"));
		}
		return lsRet;
	}
	
	//取页面设计信息
	private String queryCont(String designId, String dsName) {
		String sql = "select page_content from fun_design where design_id = '"+ designId +"'";
		return BigFieldUtil.readStream(sql, "page_content", dsName);
	}
	
	//取功能名称
	private String queryFun(String designId) {
		String sql = "select fun_base.fun_name, fun_base.fun_id, fun_design.page_type " +
		"from fun_design, fun_base where fun_design.fun_id = fun_base.fun_id and fun_design.design_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(designId);
		Map<String,String> mp = _dao.queryMap(param);
		
		return mp.get("fun_name") + ";" + mp.get("fun_id") + ";" + mp.get("page_type");
	}
	
}
