/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
  
/**
 * 统计功能模板。
 * 需要支持扩展外部统计参数，同时支持扩展外部统计事件；
 * totalParam = {extStatEvent: function(totalGrid, config){}, extStatParam:'&param1=xxx&param2=xxx'}
 * 
 * @author TonyTan
 * @version 1.0, 2011-01-01
 */

Jxstar.currentPage = function(define, totalParam) {
	if (define == null) {
		JxHint.alert('layout_total define param define is null!');
		return;
	}
	var funid = define.nodeid;
	
	//动态加载JS文件
	if (!window.JxTotalGrid) {
		JxUtil.loadJS('/public/layout/ux/total_grid.js');
		JxUtil.loadJS('/lib/ext/ux/ColumnHeaderGroup.js');
	}
	
	//加载统计扩展参数：
	//{statParam:'&param1=xxx&param2=xxx', preStatEvent: function(totalGrid, config){}}
	var jsurl = define.gridpage;
	if (jsurl && jsurl.length > 0) {
		if (!totalParam) totalParam = {};
		JxUtil.loadJS(jsurl, true);
		Ext.apply(totalParam, Jxstar.statParam());
		Jxstar.statParam = null;
	}
	
	//创建临时数据面板，从后台到数据后将替换模板内容
	var tmpPanel = new Ext.Panel({border:true,layout:'fit'});
	
	//构建统计报表{toolfn:fn, cols:[{col_code:, display:, format:, combo_code:, is_show:, col_width:},...]}
	var hdcall = function(config) {
		if (config.toolfn == null) {
			JxHint.alert('构建统计工具栏的参数错误！');
			return;
		}
		if (config.cols == null || config.cols.length == 0) {
			JxHint.alert('构建统计表格的参数错误！');
			return;
		}
		
		//扩展外部统计参数与统计事件
		if (totalParam) {
			Ext.apply(config, totalParam);
		}
		
		config.nodeid = funid;
		var grid = JxTotalGrid.createGrid(config);
		tmpPanel.add(grid);
		tmpPanel.doLayout();
	};
	
	//调用后台取统计报表的条件与统计列
	var params = 'funid=queryevent&pagetype=grid&eventcode=totalgrid&rpt_funid=' + funid;
	Request.postRequest(params, hdcall);
	
	return tmpPanel;
};
