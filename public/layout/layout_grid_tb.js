/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 上下GRID布局，上为主下为子。
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

	//创建上下表格功能布局面板
	var funLayout = new Ext.Panel({
		border:true,
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
		if (grids) grids.disable();//未选主记录时子表不可用
		
		//点击主表记录，显示明细表记录
		gridm.on('rowclick', function(g, n, e){
			/*系统升级需修改  begin*/
			//huan@2015.03.19上下结构主表提交后子表不可修改
			var records = JxUtil.getSelectRows(gridm);
			//如果主记录已提交，则明细表的按钮不能使用
			if (define.auditcol.length > 0) {
				//设置业务状态值
				var audit0 = '0', audit2 = '2', audit6 = '6';
				if (define.status) {
					audit0 = define.status['audit0'];
					audit2 = define.status['audit2'];
				}
				var state = records[0].get(define.auditcol);
				if (state == null || state.length == 0) state = audit0;
				var disable = (state != audit0 && state != audit6);
				
				//设置子表在审批过程中可以编辑
				var subdef = gridm.gridNode.define;
				var subEdit = subdef.subChkEdit||false;
				if (subEdit && state == audit2) disable = false;
				
				var tools = grids.getTopToolbar();
				JxUtil.disableButton(tools, disable);
			}
			/*系统升级需修改  end*/
			grids.parentGrid = gridm;//设置主表对象
		
			var record = g.getStore().getAt(n);
			if (record == null) {//清除明细表中的数据
				grids.getStore().removeAll();grids.fkValue = '';
				return false;
			}
			grids.enable();//选择主记录后子表可用
			
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