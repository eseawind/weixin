/*
 * ReportHtml.java 2010-11-12
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.report.html;

import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.jxstar.dao.BaseDao;
import org.jxstar.dao.DaoParam;
import org.jxstar.report.Report;
import org.jxstar.report.ReportException;
import org.jxstar.report.util.ReportDao;
import org.jxstar.util.MapUtil;
import org.jxstar.util.log.Log;
import org.jxstar.util.resource.JsMessage;

/**
 * Html输出报表基类。
 *
 * @author TonyTan
 * @version 1.0, 2010-11-12
 */
public abstract class ReportHtml implements Report {
    public static Log _log = Log.getInstance();
    public static BaseDao _dao = BaseDao.getInstance();

    //主区域查询条件
    public String _sql = "";
    public String _sqlType = "";
    public String _sqlValue = "";
    
    //页面查询条件
    public String _pageSql = "";
    public String _pageSqlType = "";
    public String _pageSqlValue = "";
    
    //需要隐藏数据显示的字段
    public List<String> _hideCols = null;
    
    public String _reportId = "";
    //当前用户信息
    public Map<String,String> _mpUser = null;

    //报表定义信息
    public Map<String,Object> _allParams = null;             //扩展参数用
    public Map<String,String> _mpReptInfo = null;            //报表列表信息
    public Map<String,String> _mpMainArea = null;            //主区域信息
    public List<Map<String,String>> _lsSubArea = null;       //子区域信息
    public List<Map<String,String>> _lsMainRecord = null;    //主区域记录信息
    public List<Map<String,String>> _lsHeadInfo = null;      //表头信息

    public List<Map<String,String>> _lsMainCol = null;       //主区域字段列表
    public Map<String, List<Map<String,String>>> _mpSubCol = null;//子区域字段列表

    //excel报表文件与报表对象
    public String _xlsFile = null;
    public HSSFWorkbook _hssfWB = null;

    //报表类型[grid][form][formgrid][label]
    public String _reportType = null;
    
    //输出报表格式[xls][html]
    public String _printType = null;
    
    //最大页数限制
    public static int _imaxPage = 1000;
    
    @SuppressWarnings("unchecked")
    public void initReport(Map<String, Object> mpParam) throws ReportException {
        _log.showDebug("html report output init ...");
        
        //给自定义报表扩展用
        _allParams = (Map<String,Object>) mpParam.get("all_params");
        
        //报表ID
        _reportId = MapUtil.getValue(mpParam, "reportId");
        if (_reportId.length() == 0) {
            //"初始化报表参数出错：报表ID不能为空！"
            throw new ReportException(JsMessage.getValue("reportxls.error01"));
        }

        //获取表头信息
        _lsHeadInfo = ReportDao.getHeadInfo(_reportId);
        
        //报表定义信息
        _mpReptInfo = (Map<String, String>) mpParam.get("report");
        if (_mpReptInfo == null || _mpReptInfo.isEmpty()) {
            //"初始化报表参数出错：报表定义信息不能为空！"
            throw new ReportException(JsMessage.getValue("reportxls.error02"));
        }

        //报表模板文件
        String model = _mpReptInfo.get("report_file");
        if (model.length() == 0) {//"初始化报表参数出错：报表模板文件不能为空！"
            throw new ReportException(JsMessage.getValue("reportxls.error03"));
        }

        //报表类型
        _reportType = MapUtil.getValue(_mpReptInfo, "report_type");
        if (_reportType.length() == 0) {//"初始化报表参数出错：报表定义类型不能为空！"
            throw new ReportException(JsMessage.getValue("reportxls.error04"));
        }

        //打印类型
        _printType = MapUtil.getValue(mpParam, "printType");
        if (_printType.length() == 0) {//"初始化报表参数出错：报表输出类型不能为空！"
            throw new ReportException(JsMessage.getValue("reportxls.error05"));
        }

        //用户信息
        _mpUser = (Map<String, String>) mpParam.get("user");
        if(_mpUser == null || _mpUser.isEmpty()) {//"初始化报表参数出错：用户信息不能为空！"
            throw new ReportException(JsMessage.getValue("reportxls.error06"));
        }
        
        //主区域定义sql语句
        _sql = MapUtil.getValue(mpParam, "mainSql");
        if (_sql.length() == 0) {//"初始化报表参数出错：报表主区域数据SQL不能为空！"
            throw new ReportException(JsMessage.getValue("reportxls.error07"));
        }

        //页面where语句参数值
        _sqlValue = MapUtil.getValue(mpParam, "whereValue");

        //页面where语句参数类型
        _sqlType = MapUtil.getValue(mpParam, "whereType");

        //页面传递sql语句
        _pageSql = MapUtil.getValue(mpParam, "whereSql");

        //页面传递sql语句参数值
        _pageSqlValue = MapUtil.getValue(mpParam, "whereValue");

        //页面传递sql语句参数类型
        _pageSqlType = MapUtil.getValue(mpParam, "whereType");
        
        //需要隐藏数据的字段
        _hideCols = (List<String>) mpParam.get("hideCols");
            
        //获取相应的报表信息
        loadReportInfo();
    }

    /**
     * 获取相应的报表信息
     * 
     * @return void
     */
    private void loadReportInfo() {
        //获取当前报表的主区域
        _mpMainArea = ReportDao.getMainArea(_reportId);
        
        //获取当前使用数据源
        String dsName = _mpMainArea.get("ds_name");

        //获取当前报表功能的所有子区域
        _lsSubArea = ReportDao.getSubAreas(_reportId);

        DaoParam param = _dao.createParam(_sql);
        param.setUseParse(true);
        param.setDsName(dsName);
        param.setType(_sqlType);
        param.setValue(_sqlValue);
        //设置要隐藏数据的字段
		param.setHideCols(_hideCols);
		
        //获取主区域记录信息
        _lsMainRecord = _dao.query(param);
        _log.showDebug("main record size = " + _lsMainRecord.size());

        //主区域字段列表
        _lsMainCol = ReportDao.getAreaCol(_mpMainArea.get("area_id"));

        //子区域字段列表
        _mpSubCol = ReportDao.getSubAreaCol(_lsSubArea);
    }
}
