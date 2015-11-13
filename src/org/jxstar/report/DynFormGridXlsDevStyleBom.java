package org.jxstar.report;

import java.util.List;
import java.util.Map;
import java.util.Random;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.jxstar.dao.CallDao;
import org.jxstar.dao.CallParam;
import org.jxstar.dao.DaoParam;
import org.jxstar.report.xls.ReportXlsFormGrid;
import org.jxstar.util.factory.FactoryUtil;

public class DynFormGridXlsDevStyleBom extends ReportXlsFormGrid {

	public Object output() throws ReportException {

		super.output(); 
		
		HSSFSheet sheet=_hssfWB.getSheetAt(0);
		//调整贴图行高度
		sheet.getRow(11).setHeightInPoints(80);
		sheet.getRow(20).setHeightInPoints(80);
		sheet.getRow(29).setHeightInPoints(80);
		return _hssfWB;
	}
	
	// 查询明细数据
	public Map<String, List<Map<String, String>>> getSubRecord(String keyID, String pkcol,
			List<Map<String, String>> lsSubArea) throws ReportException {
		Map<String, List<Map<String, String>>> ret = FactoryUtil.newMap();

		if (lsSubArea == null || lsSubArea.isEmpty())
			return ret;
		if (keyID == null || pkcol == null)
			return ret;

		for (int i = 0, n = lsSubArea.size(); i < n; i++) {
			Map<String, String> mpField = lsSubArea.get(i);
			int sessionId=0;
			
			/*-----------如果是第一个子表，默认为面辅料子表，调用存储过程构造数据到临时表:rpt_dev_style_bom中，然后直接在该表取出数据*/
			if(i==0){
				Random rd1 = new Random();
				sessionId=rd1.nextInt(); //产生一随机数避免两个用户同时打开报表
				
				CallDao dao = CallDao.getInstance();
				// 执行存储过程注意添加{}
				String sql = "{call proc_rpt_dev_style_bom(?,?)}";
				CallParam param = dao.createParam(sql);
				param.addStringValue(keyID);
				param.addIntValue(String.valueOf(sessionId));
				dao.execute(param);
			}
			
			String sql = mpField.get("data_sql");
			String areaName = mpField.get("area_name");
			String subFkcol = mpField.get("sub_fkcol");
			// 如果没有定义子区域外键字段，则取主区域的主键字段
			if (subFkcol == null || subFkcol.length() == 0) {
				subFkcol = pkcol;
			}
			if (subFkcol == null || subFkcol.length() == 0) {
				throw new ReportException("主从报表的子区域的外键字段名不能为空！");
			}

			String strWhere = mpField.get("data_where");
			String strOrder = mpField.get("data_order");
			String strGroup = mpField.get("data_group");

			String dsName = mpField.get("ds_name");

			sql += " where (" + subFkcol + " = '" + keyID + "')";
			if (strWhere.length() > 0) {
				sql += " and (" + strWhere + ")";
			}

			//增加以sessionId为过滤条件
			if(i==0){
				sql += " and ( session_id = " + String.valueOf(sessionId) + ")";
			}
			
			if (strGroup.length() > 0) {
				sql += " group by " + strGroup;
			}

			if (strOrder.length() > 0) {
				sql += " order by " + strOrder;
			}
			_log.showDebug(areaName + "[" + keyID + "] " + "sub sql = " + sql);
			
			
			DaoParam param = _dao.createParam(sql);
			param.setDsName(dsName);
			List<Map<String, String>> lsTmpRs = _dao.query(param);

			_log.showDebug(areaName + "[" + keyID + "] " + "data size = " + lsTmpRs.size());
			ret.put(mpField.get("area_id"), lsTmpRs);
		}

		return ret;
	}
}
