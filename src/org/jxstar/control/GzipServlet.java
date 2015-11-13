/*
 * Copyright(c) 2014 DongHong Inc.
 */
package org.jxstar.control;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Iterator;
import java.util.Map;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jxstar.util.StringUtil;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.log.Log;

/**
 * 负责动态压缩js\css文件：
 * 1、先判断文件的修改时间是否变了，如果变了就不取缓存，否则就从缓存中取文件；
 * 2、如果文件大于指定大小，就采用压缩的格式；
 * 3、把读取到内存中的文件都缓存起来；
 * 
 * 注意需要压力测试的内容：高并发时，是否会造成访问堵塞；是否会出现内存占用过多；
 * 
 * 此方案的优点时平台自带静态文件压缩与修改版本动态加载的效果，给系统带来比较大的简便。
 * 
 *
 * @author TonyTan
 * @version 1.0, 2014-1-18
 */
public class GzipServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	//是否启用缓存
	private static boolean _useCache;
	//最多缓存文件数量，防止内存溢出，缺省500个文件，只有系统公共文件才缓存
	private static int _maxNum;
	//是否检查修改时间
	private static boolean _checkTime;
	//需要压缩的最小文件大小
	private static int _gzipMinSize;
	//缓存文件区域
	private static final Map<String, Object[]> _mpCache = FactoryUtil.newConMap();
	//上下文对象
	private static ServletContext _context;
	
	private static Log _log = Log.getInstance();
	
	protected void service(HttpServletRequest request,
			HttpServletResponse response) throws ServletException {
		try {
			String name = request.getPathInfo();
			String path = "public" + name;
			//_log.showDebug("....... gzip file : " + path);
			
			Object[] data;//[0 是否压缩、1 文件内容、2 文件修改时间]
			File file;
			byte[] ds = null;
			boolean isGzip = false;
			long lastTime;//上次修改的时间

			if (_checkTime) {
				file = new File(SystemVar.REALPATH, path);
				lastTime = file.lastModified();
			} else {
				file = null;
				lastTime = -1;
			}
			if (_useCache) {
				data = _mpCache.get(path);
				if (data != null) {
					if (!_checkTime || lastTime == (Long) data[2]) {
						isGzip = (Boolean) data[0];
						ds = (byte[]) data[1];
						if (!_checkTime)
							lastTime = (Long) data[2];
					}
				}
			}
			if (ds == null) {
				if (!_checkTime) {
					file = new File(SystemVar.REALPATH, path);
					lastTime = file.lastModified();
				}
				if (lastTime == 0) {
					response.sendError(HttpServletResponse.SC_NOT_FOUND, path);
					return;
				}
				//大于1M的文件要报异常提示，防止把大文件放入缓存中了
				if (file.length() > 1024 * 1024 * 1) {
					_log.showError(".......gzip js file ["+ name +"] size:" + file.length() + " more maxsize 2M!!");
					response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					return;
				}
				
				isGzip = _useCache && file.length() >= _gzipMinSize;
				ds = getResourceByte(file, isGzip);
				if (_useCache) {
					if (_mpCache.size() > _maxNum) {
						_log.showError(".......gzip js file case more maxnum:" + _maxNum);
						printFileName();
					}
					
					data = new Object[3];
					data[0] = isGzip;
					data[1] = ds;
					data[2] = lastTime;
					_mpCache.put(path, data);
				}
			}
			
			//标记最新时间，方便浏览器判断文件是否修改，如果没有修改，则返回状态304
			String fileEtag = Long.toString(lastTime), reqEtag = request
					.getHeader("If-None-Match");
			if (StringUtil.isEqual(reqEtag, fileEtag)) {
				response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
				return;
			}
			response.setHeader("Etag", fileEtag);
			
			if (isGzip)	response.setHeader("Content-Encoding", "gzip");
			response.setContentType(_context.getMimeType(path));
			response.setContentLength(ds.length);
			response.getOutputStream().write(ds);
			response.flushBuffer();
		} catch (Throwable e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
	}

	public void init() throws ServletException {
		super.init();
		_context = getServletContext();
		_useCache = SystemVar.getValue("index.gzip.usecache", "1").equals("1");
		_checkTime = SystemVar.getValue("index.gzip.checktime", "1").equals("1");
		String size = SystemVar.getValue("index.gzip.minsize", "5");//单位为k
		_gzipMinSize = Integer.parseInt(size)*1024;
		String num = SystemVar.getValue("index.gzip.maxnum", "500");//最多缓存文件数量
		_maxNum = Integer.parseInt(num);
	}

	private byte[] getResourceByte(File file, boolean isZip) throws Exception {
		InputStream is = new FileInputStream(file);
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		byte[] ds;

		try {
			if (isZip) {
				GZIPOutputStream gos = new GZIPOutputStream(bos);
				try {
					tos(is, gos);
				} finally {
					gos.close();
				}
			} else
				tos(is, bos);
			ds = bos.toByteArray();
		} finally {
			is.close();
			bos.close();
		}
		return ds;
	}
	
	private int tos(InputStream ins, OutputStream bos) throws Exception {
		byte buf[] = new byte[5120];
		int len, size = 0;

		while ((len = ins.read(buf)) > 0) {
			bos.write(buf, 0, len);
			size += len;
		}
		return size;
	}
	
	private void printFileName() {
		Iterator<String> itr = _mpCache.keySet().iterator();
		while(itr.hasNext()) {
			String name = itr.next();
			_log.showError("............" + name);
		}
	}
}
