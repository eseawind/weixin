package org.jxstar.report;

import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.report.util.ReportXlsUtil;
import org.jxstar.report.util.SignPicUtil;
import org.jxstar.report.xls.ReportXlsFormGrid;
import org.jxstar.service.BoException;
import org.jxstar.service.studio.AttachBO;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;

public class BomImgXls extends ReportXlsFormGrid {
	
	public Object output() throws ReportException {
		_log.showDebug("excel form report output ...");
		//取报表所属功能ID，用于报表图片输出时取功能表名、主键信息用
		String funId = _mpReptInfo.get("fun_id");
		//报表区域ID
        String areaId = _mpMainArea.get("area_id");
        String userId = MapUtil.getValue(_mpUser, "user_id");

		//每输出一页构建一个临时报表对象
		HSSFWorkbook tmpwb = ReportXlsUtil.readWorkBook(_xlsFile);
		HSSFSheet tmpsheet = tmpwb.getSheetAt(0);

		HSSFSheet sheet = _hssfWB.getSheetAt(0);

		Map<String, String> mpValue = null;
		for (int i = 0; i < _lsMainRecord.size(); i++) {
			mpValue = _lsMainRecord.get(i);
			
			//原系统功能不输出图片
			mpValue.put("donot_image", "1");
			
			String style_id = mpValue.get("style_id");
			Map<String,Object> mpImage = queryStyleImage(style_id);
			//填写一条记录
			if (i == 0) {
				sheet = ReportXlsUtil.fillForm(funId, sheet, mpValue, _lsMainCol, _mpUser, i + 1, _lsMainRecord.size());
				sheet = ReportXlsUtil.custPrintImage(areaId, sheet, mpImage);
				sheet = ReportXlsUtil.fillHead(sheet, _lsHeadInfo, _mpUser);
				//填写从表信息
				sheet = super.fillSubArea(sheet, mpValue);//fillSubArea
			} else {
				tmpsheet = ReportXlsUtil.fillForm(funId, tmpsheet, mpValue, _lsMainCol, _mpUser, i + 1, _lsMainRecord.size());
				tmpsheet = ReportXlsUtil.custPrintImage(areaId, tmpsheet, mpImage);
				tmpsheet = ReportXlsUtil.fillHead(tmpsheet, _lsHeadInfo, _mpUser);

				//填写从表信息
				tmpsheet = super.fillSubArea(tmpsheet, mpValue);//fillSubArea
				
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


	// 取款式图片的图片数据
	private Map<String, Object> queryStyleImage(String styleId) {
		Map<String, Object> mpret = FactoryUtil.newMap();

		AttachBO attachBO = new AttachBO();
		// 取图文附件记录
		Map<String, String> mpAttach = null;
		try {
			mpAttach = attachBO.queryAttach(styleId, "base_style", "style_pic1");
		} catch (BoException e1) {
			e1.printStackTrace();
		}
		if (mpAttach == null || mpAttach.isEmpty()) {
			_log.showDebug("--------queryStyleImage(): not attach styleId=" + styleId);
			return mpret;
		}

		// 取图文附件字节信息
		byte[] bytes = null;
		try {
			bytes = attachBO.queryAttachContent(mpAttach);

			mpret.put("style_pic1", bytes);
		} catch (BoException e1) {
			e1.printStackTrace();
		}
		if (bytes == null || bytes.length == 0) {
			_log.showDebug("--------queryStyleImage(): not find attach image file!!");
			return mpret;
		}

		return mpret;
	}

}
