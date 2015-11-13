/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 上下GRID布局，上为主下为子。  下可有2个tab
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

Jxstar.currentPage = function(define, pageParam) {
	if (define == null) {
		JxHint.alert('layout_grid_tb define param define is null!');
		return;
	}

	var funid = define.nodeid;
	var pkcol = define.pkcol;

	 var funLayout=new Ext.Panel({
		border:true,
		layout:'border',
		items:[{
			pagetype:'grid',
			region:'north',
			height:280,
			layout:'fit',
			split:true,
			border:false
		},
		new Ext.TabPanel({  
        region:'center',  
        activeTab:0,  
        items:[  
            
        ]  
    })
		
		]
	});  

 

	
	//创建主表数据页面
	Jxstar.createPage(funid, 'gridpage', funLayout.getComponent(0));
	var pageParam = {pageType:'subgrid', parentNodeId:funid};
	
	
	
	var subfunid = define.subfunid;
	if (subfunid != null && subfunid.length > 0 && !define.showFormSub) {
		var subfunids = subfunid.split(',');
		for (var i = 0, n = subfunids.length; i < n; i++) {
			var subid = subfunids[i];
			if (subid.length == 0) continue;
						
			var subdefine = Jxstar.findNode(subid);
			var newtab = funLayout.getComponent(1).add({
				pagetype:'subgrid',
				title: subdefine.nodetitle,	//明细
				autoScroll:true,
				layout:'fit',
				border:false,
				iconCls:'tab_sub'
			});
			
			var subParam = {pageType:'subgrid', parentNodeId:funid};
			Jxstar.createPage(subid, 'gridpage', newtab, subParam);
		}
	}
	
	//附加显示数据的事件
	var hd = function() {
		var gridm = funLayout.getComponent(0).getComponent(0);//主表
		var grids = funLayout.getComponent(1).getComponent(0).getComponent(0);//子表
		var grids1 = funLayout.getComponent(1).getComponent(1).getComponent(0);
		var selectRow = function(g){
			g.getSelectionModel().selectFirstRow();
			g.fireEvent('rowclick', g, 0);
		};
		gridm.getStore().on('load', function(s){
			selectRow(gridm);
		});		
		
		//点击主表记录，显示明细表记录
		gridm.on('rowclick', function(g, n, e){
			grids.parentGrid = gridm;//设置主表对象
			grids1.parentGrid = gridm;//设置主表对象
		
			var record = g.getStore().getAt(n);
			if (record == null) {//清除明细表中的数据
				grids.getStore().removeAll();grids.fkValue = '';
				grids1.getStore().removeAll();grids1.fkValue = '';
				return false;
			}
			
			//外键值
			var pkvalue = record.get(pkcol);
			//加载子表数据
			Jxstar.loadSubData(grids, pkvalue);
			Jxstar.loadSubData(grids1, pkvalue);
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