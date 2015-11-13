/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 左边显示主表、右边显示上下表格，上为主表、下为子表
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

	//创建左上下表格功能布局面板
	var funLayout = new Ext.Panel({
		border:true,
		layout:'border',
		items:[{
			pagetype:'grid',
			region:'west',
			width:350,
			layout:'fit',
			split:true,
			border:false
		},{
			pagetype:'subgrid',
			region:'center',
			layout:'border',
			border:false,
			items:[{
				pagetype:'grid',
				region:'north',
				height:240,
				layout:'fit',
				split:true,
				border:false
			},{
				pagetype:'subgrid',
				region:'center',
				layout:'fit',
				border:false
			}]
		}]
	});
	
	//创建主表数据页面
	Jxstar.createPage(funid, 'gridpage', funLayout.getComponent(0), null);
	var pageParam = {pageType:'subeditgrid', parentNodeId:funid};
	
	//检查是否设置了子功能ID
	var subfunid = define.subfunid;
	if (Ext.isEmpty(subfunid)) {
		JxHint.alert('没有设置子功能，不能显示子功能数据！');
		return funLayout;
	}
	var subdefine = Jxstar.findNode(subfunid);
	var ssubfunid = subdefine.subfunid;
	if (Ext.isEmpty(subfunid)) {
		JxHint.alert('没有设置子子功能，不能显示子子功能数据！');
		return funLayout;
	}
	var ssubdefine = Jxstar.findNode(ssubfunid);
	
	//创建子表数据页面
	Jxstar.createPage(subfunid, 'gridpage', funLayout.getComponent(1).getComponent(0), pageParam);
	Jxstar.createPage(ssubfunid, 'gridpage', funLayout.getComponent(1).getComponent(1), pageParam);
	
	//附加显示数据的事件
	var hd = function() {
		var gridm = funLayout.getComponent(0).getComponent(0);//主表
		var subPanel = funLayout.getComponent(1);
		var grids  = subPanel.getComponent(0).getComponent(0);//子表
		var gridss = subPanel.getComponent(1).getComponent(0);//子子表
		
		var selectRow = function(g){
			g.getSelectionModel().selectFirstRow();
			g.fireEvent('rowclick', g, 0);
		};
		gridm.getStore().on('load', function(s){
			grids.getStore().removeAll();
			selectRow(gridm);
		});
		grids.getStore().on('load', function(s){
			gridss.getStore().removeAll();
			selectRow(grids);
		});
		
		//点击主表记录，显示明细表记录
		gridm.on('rowclick', function(g, n, e){
			var record = g.getStore().getAt(n);
			if (record == null) return false;
			
			//外键值
			var pkvalue = record.get(define.pkcol);
			//加载子表数据
			Jxstar.loadSubData(grids, pkvalue);
		});
		//点击子表记录，显示子子明细表记录
		grids.on('rowclick', function(g, n, e){
			var record = g.getStore().getAt(n);
			if (record == null) return false;
			
			//外键值
			var pkvalue = record.get(subdefine.pkcol);
			//加载子表数据
			Jxstar.loadSubData(gridss, pkvalue);
		});
		selectRow(gridm);
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