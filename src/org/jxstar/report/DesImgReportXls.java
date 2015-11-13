/*
 * Copyright(c) 2013 DongHong Inc.
 */
package org.jxstar.report;

import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.report.util.ReportXlsUtil;
import org.jxstar.report.xls.ReportXls;
import org.jxstar.service.BoException;
import org.jxstar.service.studio.AttachBO;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 款式图打印功能，由于取款式图的任务Id有特殊处理，先找是否有原任务ID，
 * 如果有则用原任务ID取图，否则用当前任务ID取图。
 *
 * @author TonyTan
 * @version 1.0, 2013-11-5
 */
public class DesImgReportXls extends ReportXls {

	public Object output() throws ReportException {
		_log.showDebug("excel form report output ...");
		//取报表所属功能ID，用于报表图片输出时取功能表名、主键信息用
		String funId = _mpReptInfo.get("fun_id");
		//报表区域ID
        String areaId = _mpMainArea.get("area_id");
        
		//每输出一页构建一个临时报表对象
		HSSFWorkbook tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
		HSSFSheet tmpsheet = tmpwb.getSheetAt(0);

		HSSFSheet sheet = _hssfWB.getSheetAt(0);

		Map<String, String> mpValue = null;
		for (int i = 0; i < _lsMainRecord.size(); i++) {
			mpValue = _lsMainRecord.get(i);
			
			//原系统功能不输出图片
			mpValue.put("donot_image", "1");
			
			String old_task_id = mpValue.get("old_task_id");
			String task_id = mpValue.get("task_id");
			Map<String,Object> mpImage = queryDesImage(old_task_id, task_id);
			//填写一条记录
			if (i == 0) {
				sheet = ReportXlsUtil.fillForm(funId, sheet, mpValue, _lsMainCol, _mpUser, i + 1, _lsMainRecord.size());
				sheet = ReportXlsUtil.custPrintImage(areaId, sheet, mpImage);
				sheet = ReportXlsUtil.fillHead(sheet, _lsHeadInfo, _mpUser);
			} else {
				tmpsheet = ReportXlsUtil.fillForm(funId, tmpsheet, mpValue, _lsMainCol, _mpUser, i + 1, _lsMainRecord.size());
				sheet = ReportXlsUtil.custPrintImage(areaId, sheet, mpImage);
				tmpsheet = ReportXlsUtil.fillHead(tmpsheet, _lsHeadInfo, _mpUser);

				sheet = ReportXlsUtil.appendSheet(sheet, tmpsheet);
				tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
				tmpsheet = tmpwb.getSheetAt(0);
			}
			//强制执行SHEET中的计算公式，由于目标位置原因，只有第一页有效
			if (i == 0) sheet.setForceFormulaRecalculation(true);
			
			//判断报表是否允许输出
			if (!ReportXlsUtil.isAllowOut(sheet)) break;
		}

		return _hssfWB;
	}

	//取洗涤标志的图片数据
	private Map<String,Object> queryDesImage(String old_task_id, String task_id) {
		Map<String,Object> mpret = FactoryUtil.newMap();
		
		String dataId = old_task_id;
		if (old_task_id.length() == 0) {
			dataId = task_id;
		}
		
		AttachBO attachBO = new AttachBO();
		//取图文附件记录
		Map<String, String> mpAttach = null;
		try {
			mpAttach = attachBO.queryAttach(dataId, "dev_task", "des_img");
		} catch (BoException e1) {
			e1.printStackTrace();
		}
		if (mpAttach == null || mpAttach.isEmpty()) {
			_log.showDebug("--------queryDesImage(): not attach dataId=" + dataId);
			return mpret;
		}
		
		//取图文附件字节信息
		byte[] bytes = null;
		try {
			bytes = attachBO.queryAttachContent(mpAttach);
			
			mpret.put("des_img", bytes);
		} catch (BoException e1) {
			e1.printStackTrace();
		}
		if (bytes == null || bytes.length == 0) {
			_log.showDebug("--------queryWaveImage(): not find attach image file!!");
			return mpret;
		}
		
		return mpret;
	}
	
}
