/*
 * Copyright(c) 2013 DongHong Inc.
 */
package org.jxstar.report;

import java.util.Map;

import org.jxstar.report.html.ReportHtml;
import org.jxstar.report.util.ReportHtmlUtil;
import org.jxstar.report.util.SignPicUtil;
import org.jxstar.util.MapUtil;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 款式图打印功能，由于取款式图的任务Id有特殊处理，先找是否有原任务ID，
 * 如果有则用原任务ID取图，否则用当前任务ID取图。
 *
 * @author TonyTan
 * @version 1.0, 2013-11-5
 */
public class DesImgReportHtml extends ReportHtml {

	public Object output() throws ReportException {
        _log.showDebug("html form report output ...");
        //取报表所属功能ID，用于报表图片输出时取功能表名、主键信息用，取功能审批信息用
        String funId = _mpReptInfo.get("fun_id");
        //报表区域ID
        String areaId = _mpMainArea.get("area_id");
        
        StringBuilder sbRet = new StringBuilder();
        //获取javascript变量声明
        sbRet.append(ReportHtmlUtil.defineHead());
		String userId = MapUtil.getValue(_mpUser, "user_id");

        Map<String, String> mpValue = null;
        for (int i = 0 ,n = (_lsMainRecord.size() >= _imaxPage)?_imaxPage:_lsMainRecord.size() ;i < n ;i++) {
            mpValue = _lsMainRecord.get(i);
            //原系统功能不输出图片
			mpValue.put("donot_image", "1");

			String old_task_id = mpValue.get("old_task_id");
			String task_id = mpValue.get("task_id");
			Map<String,String> mpImage = queryDesImage(old_task_id, task_id, userId);
			
            if (i == 0) {
                sbRet.append(ReportHtmlUtil.fillForm(funId, mpValue, _lsMainCol, _mpUser, "tblobj", i + 1, _lsMainRecord.size()));
                sbRet.append(ReportHtmlUtil.custPrintImage(areaId, "tblobj", mpImage));
                sbRet.append(ReportHtmlUtil.fillHead("tblobj" ,_lsHeadInfo, _mpUser));
            } else {
                //插入新table
                sbRet.append("newTblObj = f_insertTable(tblValue, tblobj);\r\n");

                sbRet.append(ReportHtmlUtil.fillForm(funId, mpValue, _lsMainCol, _mpUser, "newTblObj", i + 1, _lsMainRecord.size()));
                sbRet.append(ReportHtmlUtil.custPrintImage(areaId, "newTblObj", mpImage));
                sbRet.append(ReportHtmlUtil.fillHead("newTblObj" ,_lsHeadInfo, _mpUser));
            }
        }
        
        return sbRet.toString();
	}

	//取洗涤标志的图片数据
	private Map<String,String> queryDesImage(String old_task_id, String task_id, String userId) {
		Map<String,String> mpret = FactoryUtil.newMap();
		
		String dataId = old_task_id;
		if (old_task_id.length() == 0) {
			dataId = task_id;
		}
		
		String value = "";
		//取图文附件URL
		String url = SignPicUtil.signURL(dataId, "dev_task", "des_img", "dev_des_up", userId);
		if (url.length() > 0) {
			value = "<img width='100%' height='100%' src='"+ url +"' />";
		}
		
		mpret.put("des_img", value);
		return mpret;
	}
	
}
