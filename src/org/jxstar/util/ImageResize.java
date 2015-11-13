package org.jxstar.util;

import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Iterator;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageTypeSpecifier;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.jxstar.util.log.Log;

/**
 * 图片按比例缩小到指定大小，并保存为新的图片文件。
 * 
 * @author TonyTan
 * @version 1.0, 2013-10-21
 */
public class ImageResize {
	private static Log _log = Log.getInstance();
	
	/**
	 * 把来源图片压缩生成指定大小的图片
	 * @param srcfile -- 来源图片文件名
	 * @param tagfile -- 目标图片文件名
	 * @param tagsize -- 指定长度或宽度的最大像素值
	 * @throws Exception
	 */
	public static boolean resizeImage(File srcfile, File tagfile, float tagsize) {
		Image src = null;
		FileOutputStream fos = null;
		ImageOutputStream outs = null;
		
		try {
			src = javax.imageio.ImageIO.read(srcfile);	//构造Image对象
		
			int old_w = src.getWidth(null); 	//得到源图宽
			int old_h = src.getHeight(null); 	//得到源图长
			int new_w = 0;
			int new_h = 0;
	
			float rate;							//需要缩小的倍数
			if (old_w > old_h) {
				rate = old_w / tagsize;
			} else {
				rate = old_h / tagsize;
			}
			if (rate < 1) {
				return false;
			}
			
			new_w = Math.round(old_w / rate);
			new_h = Math.round(old_h / rate);	//计算新图长宽
			_log.showDebug("...........resize image width=" + new_w + "; height=" + new_h);
			
			BufferedImage tag = new BufferedImage(new_w, new_h,	BufferedImage.TYPE_INT_RGB);
			tag.getGraphics().drawImage(src, 0, 0, new_w, new_h, null); //绘制缩小后的图
	
			ImageWriter writer = null;
			ImageTypeSpecifier type = ImageTypeSpecifier.createFromRenderedImage(tag);
			Iterator<ImageWriter> iter = ImageIO.getImageWriters(type, "jpg");
			if (iter.hasNext()) {
				writer = iter.next();
			}
			IIOImage iioImage = new IIOImage(tag, null, null);
			ImageWriteParam param = writer.getDefaultWriteParam();
			// param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
			// param.setCompressionQuality(0.2f);
	
			fos = new FileOutputStream(tagfile);
			outs = ImageIO.createImageOutputStream(fos);
			writer.setOutput(outs);
			writer.write(null, iioImage, param);
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		} finally {
			try {
				if (outs != null) outs.close();
				if (fos != null) fos.close();
			} catch (IOException e) {
				e.printStackTrace();
				return false;
			}
		}
		
		return true;
	}
}
