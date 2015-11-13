/*
 * Copyright(c) 2013 Donghong Inc.
 */
package org.jxstar.report.studio;

import org.jxstar.control.action.RequestContext;
import org.jxstar.report.util.JxBarcodeUtil;
import org.jxstar.service.BusinessObject;

/**
 * 显示条码值为图片信息的处理类。
 *
 * @author TonyTan
 * @version 1.0, 2013-7-1
 */
public class ShowBarcodeBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	public String showBar(String code, RequestContext request) {
		byte[] datas = JxBarcodeUtil.createBarcode(code);
		
		//设置响应头信息
		request.setRequestValue("ContentType", "image/jpeg");
		request.setRequestValue("Attachment", code+".jpg");
		//返回文件对象
		request.setReturnBytes(datas);
		
		return _returnSuccess;
	}
}
