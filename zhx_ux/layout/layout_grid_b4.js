/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 上面一个GRID，下面4个表格。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

Jxstar.currentPage = function(define, pageParam) {
	if (define == null) {
		JxHint.alert('layout define param define is null!');
		return;
	}

	var funid = define.nodeid;
	var pkcol = define.pkcol;

	//创建上下表格功能布局面板
	var funLayout = new Ext.Panel({
		border:false,
		layout:'border',
		items:[{
			pagetype:'grid',
			region:'north',
			height:280,
			layout:'fit',
			split:true,
			border:false
		},{
			pagetype:'subgrid',
			region:'center',
			height:700,
			layout:'border',
			border:false,
			
			items:[{
				pagetype:'subgrid',
				region:'center',
				height:300,
				layout:'border',
				border:false,
				items:[{
					pagetype:'subgrid',
					region:'west',
					layout:'fit',
					width:300,
					split:true,
					border:false
				},{
					pagetype:'subgrid',
					region:'center',
					layout:'fit',
					border:false
				}]
			},{
				pagetype:'subgrid',
				region:'south',
				height:150,
				layout:'border',
				border:false,
				split:true,
				items:[{
					pagetype:'subgrid',
					region:'west',
					layout:'fit',
					width:300,
					split:true,
					border:false
				},{
					pagetype:'subgrid',
					region:'center',
					layout:'fit',
					border:false
				}]
			}
			
			]
		}]
	});
	
	//创建主表数据页面
	Jxstar.createPage(funid, 'gridpage', funLayout.getComponent(0), pageParam);
	var pageParam = {pageType:'subgrid', parentNodeId:funid};
	//创建子表数据页面
	var subfunid = define.subfunid;
	if (subfunid != null && subfunid.length > 0) {
		var subids = subfunid.split(',');
		if (subids.length > 0) {
			Jxstar.createPage(subids[0], 'gridpage', funLayout.getComponent(1).getComponent(0).getComponent(0), pageParam);
		}
		if (subids.length > 1) {
			Jxstar.createPage(subids[1], 'gridpage', funLayout.getComponent(1).getComponent(0).getComponent(1), pageParam);
		}
		if (subids.length > 2) {
			Jxstar.createPage(subids[2], 'gridpage', funLayout.getComponent(1).getComponent(1).getComponent(0), pageParam);
		}
		if (subids.length >3) {
			Jxstar.createPage(subids[3], 'gridpage', funLayout.getComponent(1).getComponent(1).getComponent(1), pageParam);
		}
	}
	
	//附加显示数据的事件
	var hd = function(gridm, layout) {
		var grids = layout.getComponent(1).getComponent(0).getComponent(0).getComponent(0);
		var grids1 = layout.getComponent(1).getComponent(0).getComponent(1).getComponent(0);
		var grids2 = layout.getComponent(1).getComponent(1).getComponent(0).getComponent(0);
		var grids3 =layout.getComponent(1).getComponent(1).getComponent(1).getComponent(0);


		grids.parentGrid = gridm;
		grids1.parentGrid = gridm;
		grids2.parentGrid = gridm;
		grids3.parentGrid = gridm;
		console.log(grids3);
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
			if (record == null) {//清除明细表中的数据
				grids.getStore().removeAll();grids.fkValue = '';
				grids1.getStore().removeAll();grids1.fkValue = '';
				grids2.getStore().removeAll();grids2.fkValue = '';
				grids3.getStore().removeAll();grids3.fkValue = '';
				return false;
			}
			
			//外键值
			var pkvalue = record.get(pkcol);
			//加载子表数据
			Jxstar.loadSubData(grids, pkvalue);
			Jxstar.loadSubData(grids1, pkvalue);
			Jxstar.loadSubData(grids2, pkvalue);
			Jxstar.loadSubData(grids3, pkvalue);
		});
	};
	//保证附加事件成功
	var callhd = function() {
		var gm = funLayout.getComponent(0).getComponent(0);
		if (gm) {
			hd(gm, funLayout);
		} else {
			JxUtil.delay(500, callhd);
		}
	};
	callhd();

	return funLayout;
}