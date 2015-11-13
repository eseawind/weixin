/*
 * Copyright(c) 2014 DongHong Inc.
 */
package org.jxstar.report;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
/*
 * Copyright(c) 2014 ZHX Inc.
 */
import org.jxstar.dao.DaoParam;
import org.jxstar.report.util.ReportXlsUtil;
import org.jxstar.report.xls.ReportXlsFormGrid;
import org.jxstar.util.MapUtil;


/**
 * 计划差异分析报表 处理类
 * 
 * @author huan
 * @version 1.0, 2014-11-19
 */
public class DynFormGridXlsPlanClothSumDiff extends ReportXlsFormGrid {
	
	public Object output() throws ReportException {

		Map<String,String > rcd0=_lsMainRecord.get(0);
		String groupId=rcd0.get("size_group_id");
		List<Map<String, String>> sizeInfo=querySizeName(groupId);
		//处理动态列字段信息（表头）
		for(int i=0;i<6;i++){
			Map<String,String> mapf=new HashMap<String,String>();
			mapf.put("area_id", "jxstar5171411");
			mapf.put("is_outzero", "1");
			mapf.put("display", MapUtil.getValue(sizeInfo.get(i),"size_name"));
			mapf.put("col_code", "dnycol"+i);
			mapf.put("format", "text");
			mapf.put("col_pos", "2,"+(8+i));
			mapf.put("col_index", "90"+i);
			mapf.put("is_show", "1");
			mapf.put("is_stat", "0");
			_lsMainCol.add(mapf);
		}
		//添加动态列数据信息
		for(int i=0;i<this._lsMainRecord.size();i++){
			Map<String,String > rcd=_lsMainRecord.get(i);
			String keyId=rcd.get("key_id");
			List<Map<String, String>> det=queryDet(keyId);
			for(int j=0;j<det.size();j++){
				String val=MapUtil.getValue(det.get(j),"qty");
				rcd.put("dnycol"+j, val);
			}
		}
		
		HSSFSheet sheet = _hssfWB.getSheetAt(0);
		//将数据写入EXCEL
		ReportXlsUtil.fillGrid(sheet,this._lsMainRecord, this._lsMainCol, this._mpUser, 1000, 0, 1, 1);
		
		//写入EXCEL表头
		HSSFRow row = sheet.getRow(1);
		if (row == null) row = sheet.createRow(1);
		for(int i=0;i<sizeInfo.size();i++){
			HSSFCell cell = row.getCell(8+i);
			if (cell == null) cell = row.createCell(8+i);
			//填充单元格内容
			cell.setCellValue(MapUtil.getValue(sizeInfo.get(i),"size_name"));
		}
		return _hssfWB;
	}
	// 根据尺码组id找到尺码名称信息
	public List<Map<String, String>> querySizeName(String sizeId) {
		String sql = "select size_name from base_mat_size where group_id like ? order by size_index";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(sizeId + "%");
		return _dao.query(param);
	}
	/**
	 * 查询某一主键对应的 计划数、入库数、差异数、增减幅度或超浮数
	 * @param detid
	 * @return
	 */
	public List<Map<String, String>> queryDet(String detid) {
		// keyID格式：plan_row_id-col_ind
		int iPos = detid.indexOf("-");
		if (iPos < 0){
			return null;
		}
		String plan_row_id = detid.substring(0, iPos);
		String col_ind = detid.substring(iPos + 1);
		String col_name="ff.plan_qty";
		if(col_ind.equals("2")){ //入库数
			col_name="ff.stockin_qty";
		}else if(col_ind.equals("3")){ //差异数
			col_name="ff.diff_qty";
		} else if(col_ind.equals("4")){ //增减幅度(%)
			col_name="ff.diff_ratio";
		}else if(col_ind.equals("5")){ //
			col_name="ff.over_qty";
		}
		
		String sql = "select dd.size_name,"+col_name+" qty from v_prod_plan_cloth_sum ff "
				+ " join prod_plan_row_det aa on ff.plan_row_id=aa.plan_row_id "
				+ " join base_style bb on aa.style_id=bb.style_id "
				+ " join base_style_type cc on bb.style_type_id=cc.style_type_id "
				+ " join base_mat_size dd on cc.size_group_id=dd.group_id  "
				+ " join base_clothing ee on ee.style_id=aa.style_id and ee.color_id=aa.color_id and ee.size_id=dd.size_id and ff.clothing_id=ee.clothing_id "
				+ " where aa.plan_row_id = ? order by dd.size_name";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(plan_row_id);
		List<Map<String, String>> ls = _dao.query(param);
		return ls;
	}
}
