/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 左右GRID布局，左为主右为子。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

Jxstar.currentPage = function(define, pageParam) {
	if (define == null) {
		JxHint.alert('layout_grid_lr define param define is null!');
		return;
	}
	var funid = define.nodeid;
	var pkcol = define.pkcol;
	var leftwidth=define.layoutLeftWidth;
	if(!leftwidth){
		leftwidth=400;
	}
	//创建上下表格功能布局面板
	var funLayout = new Ext.Panel({
		border:true,
		layout:'border',
		items:[{
			pagetype:'grid',
			region:'west',
			width:leftwidth,
			layout:'fit',
			split:true,
			border:false
		},{
			pagetype:'subgrid',
			region:'center',
			layout:'fit',
			border:false
		}]
	});
	
	//创建主表数据页面
	Jxstar.createPage(funid, 'gridpage', funLayout.getComponent(0));
	var pageParam = {pageType:'subgrid', parentNodeId:funid};
	//创建子表数据页面
	var subfunid = define.subfunid;
	if (subfunid != null && subfunid.length > 0) {
		Jxstar.createPage(subfunid, 'gridpage', funLayout.getComponent(1), pageParam);
	}
	
	//附加显示数据的事件
	var hd = function() {
		var gridm = funLayout.getComponent(0).getComponent(0);//主表
		var grids = funLayout.getComponent(1).getComponent(0);//子表
		
		var selectRow = function(g){
			g.getSelectionModel().selectFirstRow();
			g.fireEvent('rowclick', g, 0);
		};
		gridm.getStore().on('load', function(s){
			selectRow(gridm);
		});				
		//点击主表记录，显示明细表记录
		gridm.on('rowclick', function(g, n, e){
			var record = g.getStore().getAt(n);
			if (record == null) return false;
			
			//外键值
			var pkvalue = record.get(pkcol);
			//加载子表数据
			Jxstar.loadSubData(grids, pkvalue);
		});
	};
	//保证附加事件成功
	var callhd = function() {
		var gm = funLayout.getComponent(0).getComponent(0);
		if (gm) {
			hd();
		} else {
			JxUtil.delay(500, callhd);
		}
	};
	callhd();

	return funLayout;
}