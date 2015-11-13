/*
 * JxstarFilter.java 2008-4-6
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.control.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jxstar.service.util.ClusterUtil;
import org.jxstar.util.resource.JsMessage;

/**
 * 框架公共过滤器：处理字符集；非法SQL过滤。
 * 
 * @author TonyTan
 * @version 1.0, 2008-4-6
 */
public class JxstarFilter implements Filter {
	//字符集编码
    private String _encoding = null;
    //需要过滤的非法SQL短语，用“;”分隔
    private String _illegalsql = null;

	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse rsp = (HttpServletResponse) response;
		
        if (_encoding != null){
        	req.setCharacterEncoding(_encoding);
        	rsp.setContentType("text/html; charset="+_encoding);
        }
        
        //如果设置了非法SQL短语，则需要过滤检查
        if (_illegalsql != null && _illegalsql.length() > 0) {
        	String[] words = _illegalsql.toLowerCase().split(";");
        	
        	//取where_sql参数值，如果为空，则不用处理
        	String wheresql = req.getParameter("where_sql"); 
        	if (wheresql == null) wheresql = "";
        	String whereSql = req.getParameter("whereSql");
        	if (whereSql == null) whereSql = "";
        	wheresql += whereSql;
        	if (wheresql != null && wheresql.length() > 0) {
        		wheresql = wheresql.toLowerCase();
        		
        		for (int i = 0, n = words.length; i < n; i++) {
        			if ((words[i].length() > 0) && (wheresql.indexOf(words[i]) >= 0)) {
        				rsp.sendError(401, JsMessage.getValue("jxstarfilter.hasillegalsql", words[i]));
        				return;
        			}
        		}
        	}
        }
        
        //如果是集群环境，如果没有注册服务器，则需要注册
        if (ClusterUtil.isCluster()) {
	        String serverName = ClusterUtil.getServerName();
	        if (serverName.length() == 0) {
	        	ClusterUtil.regServer(request);
	        }
        }
        
        //处理jsgz、cssgz压缩文件
        String path = req.getRequestURL().toString();
        if (path != null && path.length() > 0) {
        	if (path.endsWith(".jsgz") || path.endsWith(".cssgz")) {       
        		rsp.addHeader("Content-Encoding", "gzip");
        	}
        }
        
        chain.doFilter(req, rsp);
	}

	public void init(FilterConfig config) throws ServletException {
		_encoding = config.getInitParameter("encoding");
		if (_encoding != null) _encoding = _encoding.trim();
		
		_illegalsql = config.getInitParameter("illegalsql");
		if (_illegalsql != null) _illegalsql = _illegalsql.trim();
	}
	
	public void destroy() {
		_encoding = null;
		_illegalsql = null;
	}
}
