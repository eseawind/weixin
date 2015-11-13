/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.report.util;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;

import org.jxstar.util.config.SystemVar;
import org.krysalis.barcode4j.HumanReadablePlacement;
import org.krysalis.barcode4j.impl.AbstractBarcodeBean;
import org.krysalis.barcode4j.impl.codabar.CodabarBean;
import org.krysalis.barcode4j.impl.code128.Code128Bean;
import org.krysalis.barcode4j.impl.code39.Code39Bean;
import org.krysalis.barcode4j.impl.upcean.EAN13Bean;
import org.krysalis.barcode4j.output.bitmap.BitmapCanvasProvider;

/**
 * 条码处理相关工具类。 支持的条码标准格式有：pdf417, upc-a, upc-e, ean-13, intl2of5, itf-14, code39,
 * datamatrix, codabar, usps4cb, royal-mail-cbc, postnet, code128, ean-128,
 * ean-8,
 * 
 * @author TonyTan
 * @version 1.0, 2012-6-14
 */
public class JxBarcodeUtil {
	private static double _barHeight = 5; // 高度mm，如：5
	private static double _moduleWidth = 0.16; // 每个元素的宽度mm，如：0.18
	private static int _resolution = 300; // 位图分辨率像素，如：500
	private static double _fontSize = 2; // 字体大小，如：2
	private static String _format = "codabar"; // 条码格式

	/**
	 * 重新初始化条码参数
	 */
	public static void initSize() {
		String height = SystemVar.getValue("codebar.height", "5");
		_barHeight = Double.parseDouble(height);

		String width = SystemVar.getValue("codebar.modulewidth", "0.16");
		_moduleWidth = Double.parseDouble(width);

		String font = SystemVar.getValue("codebar.fontsize", "2");
		_fontSize = Double.parseDouble(font);

		String resolution = SystemVar.getValue("codebar.resolution", "300");
		_resolution = Integer.parseInt(resolution);

		_format = SystemVar.getValue("codebar.format", "codabar").toLowerCase();
	}

	/**
	 * 构建条码
	 * 
	 * @param value
	 * @return
	 */
	public static byte[] createBarcode(String value) {
		if (_format.equals("ean-13") || _format.equals("ean13")) {
			return createEAN13(value);
		} else if (_format.equals("code39")) {
			return createCode39(value);
		} else if (_format.equals("code128")) {
			return createCode128(value);
		} else {
			return createCodabar(value);
		}
	}

	/**
	 * 构建EAN13格式的编码
	 * 
	 * @param value
	 * @return
	 */
	public static byte[] createEAN13(String value) {
		initSize();
		EAN13Bean bean = new EAN13Bean();

		bean.setBarHeight(_barHeight);// 单位为mm
		bean.setModuleWidth(_moduleWidth);// 指每个元素的宽度，用mm为单位
		bean.doQuietZone(false);
		bean.setFontSize(_fontSize);

		return writeBytes(bean, value);
	}

	/**
	 * 构建Codabar格式的编码
	 * 
	 * @param value
	 * @return
	 */
	public static byte[] createCodabar(String value) {
		initSize();
		CodabarBean bean = new CodabarBean();

		bean.setBarHeight(_barHeight);// 单位为mm
		bean.setModuleWidth(_moduleWidth);// 指每个元素的宽度，用mm为单位
		bean.setWideFactor(3);// 2|3
		bean.doQuietZone(false);
		bean.setFontSize(_fontSize);

		return writeBytes(bean, value);
	}

	/**
	 * 构建Code128格式的编码
	 * 
	 * @param value
	 * @return
	 */
	public static byte[] createCode128(String value) {
		initSize();
		Code128Bean bean = new Code128Bean();

		bean.setBarHeight(_barHeight);// 单位为mm
		bean.setModuleWidth(_moduleWidth);// 指每个元素的宽度，用mm为单位
		bean.doQuietZone(false);
		bean.setQuietZone(1);
		bean.setFontSize(_fontSize);
		bean.setMsgPosition(HumanReadablePlacement.HRP_BOTTOM);

		return writeBytes(bean, value);
	}

	/**
	 * 构建Code39格式的编码
	 * 
	 * @param value
	 * @return
	 */
	public static byte[] createCode39(String value) {
		initSize();
		Code39Bean bean = new Code39Bean();

		bean.setBarHeight(_barHeight);// 单位为mm
		bean.setModuleWidth(_moduleWidth);// 指每个元素的宽度，用mm为单位
		bean.setWideFactor(3);// 2|3
		bean.doQuietZone(false);
		bean.setFontSize(_fontSize);

		return writeBytes(bean, value);
	}

	/**
	 * 保存字节为文件
	 * 
	 * @param fileName
	 *            -- 文件名，必须含路径
	 * @param datas
	 *            -- 数据
	 */
	public static void saveFile(String fileName, byte[] datas) {
		try {
			FileOutputStream out = new FileOutputStream(new File(fileName));
			try {
				out.write(datas);
				out.flush();
			} finally {
				out.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// 输出指定格式的条码对象
	private static byte[] writeBytes(AbstractBarcodeBean bean, String value) {
		byte[] datas = new byte[0];
		if (value == null || value.length() == 0)
			return datas;

		try {
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			try {
				BitmapCanvasProvider canvas = new BitmapCanvasProvider(out,
						"image/png", _resolution,
						BufferedImage.TYPE_BYTE_BINARY, false, 0);

				// Generate the barcode
				bean.generateBarcode(canvas, value);

				// Signal end of generation
				canvas.finish();

				datas = out.toByteArray();
			} finally {
				out.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
			return datas;
		}

		return datas;
	}
}
