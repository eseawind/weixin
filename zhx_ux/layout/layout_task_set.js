/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 企划设置布局
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
	
	//创建子功能页面
	var createFun = function(subFunId, ownerCt) {
		var subdefine = Jxstar.findNode(subFunId);
		var fkName = subdefine.tablename + '.season_id';
		var subparam = {pageType:'subgrid', parentNodeId:funid};
		
		var hdcall = function(f) {
			var page = f(subdefine, subparam);
			//是layout或GridNode页面
			if (typeof page.showPage == 'function') {
				page = page.showPage(subparam.pageType, subparam.parentNodeId);
			}
			//添加子功能到容器中
			ownerCt.add(page);
			ownerCt.doLayout();
			//加载子表数据
			page.fkName = fkName;
		};

		//异步从JS文件加载功能对象
		var path = subdefine.layout;
		if (path.length == 0) path = subdefine.gridpage;
		Request.loadJS(path, hdcall);
	};

	//创建树形布局面板
	var treeLayout = new Ext.Panel({
		itemId:'main',
		pagetype:'grid',
		title: '开发季节设置',
		iconCls:'tab_grid',
			
		border:false,
		layout:'border',
		items:[{
			autoScroll:true,
			region:'west',
			layout:'fit',
			width:160,
			minSize: 160,
	        maxSize: 300,
			split:true,
			border:false
		},{
			region:'center',
			layout:'fit',
			border:false
		}]
	});
	//创建数据页面
	Jxstar.createTree(funid, treeLayout);
	Jxstar.createPage(funid, 'gridpage', treeLayout.getComponent(1), pageParam);
	
	//创建设置tab布局
	var subLayout = new Ext.TabPanel({
		itemId:'sub',
		pagetype:'form',
		title: '企划基础设置',
		iconCls:'tab_form',
			
		border:false,
		closeAction:'close',
		activeTab:0,
		items:[{
			pagetype:'form',
			title: '开发系列',
			layout:'fit',
			border:false,
			iconCls:'tab_grid'
		},{
			pagetype:'form',
			title: '开发主题',
			layout:'fit',
			border:false,
			iconCls:'tab_grid'
		},{
			pagetype:'form',
			title: '开发颜色',
			layout:'fit',
			border:false,
			iconCls:'tab_grid'
		},{
			pagetype:'form',
			title: '波段设置',
			layout:'fit',
			border:false,
			iconCls:'tab_grid'
		}]
	});
	//创建所有子功能
	JxUtil.delay(800, function(){
		createFun('splan_serial', subLayout.getComponent(0));
		createFun('splan_theme', subLayout.getComponent(1));
		createFun('splan_color', subLayout.getComponent(2));
		createFun('splan_wave', subLayout.getComponent(3));
	});
	
	//创建tab布局
	var funLayout = new Ext.TabPanel({
		border:false,
		closeAction:'close',
		activeTab:0,
		items:[treeLayout,subLayout]
	});
	
	//绑定表格行双击事件
	JxUtil.delay(1000, function(){
		var grid = treeLayout.getComponent(1).getComponent(0);
		if (!grid) return;
		//点击表格记录时，更新form中的记录值
		grid.on('rowdblclick', function(grid){
			funLayout.setActiveTab(subLayout);
		});
	});
	
	//没有选择主记录时不能打开明细功能
	funLayout.on('beforetabchange', function(tabm, newTab, curTab){
		if (newTab.getItemId() == 'sub') {
			//取主表
			var mgrid = curTab.getComponent(1).getComponent(0);
			if (mgrid == null) return false;
			
			var records = mgrid.getSelectionModel().getSelections();
			if (records.length == 0) {
				JxHint.alert('请选择一条开发季节记录！');
				return false;
			} else {
				//当前记录没有保存，不能操作
				var pkvalue = records[0].get(pkcol);
				if (Ext.isEmpty(pkvalue)) {
					JxHint.alert(jx.event.nosave);
					return false;
				}
				var brandId = records[0].get('splan_season__brand_id');
				//保存当前选择的主键值
				newTab.curMainId = pkvalue;
				newTab.curBrandId = brandId;
			}
		}
		return true;
	});
	//第二次打开设置界面时需要触发一下subLayout的tabchange事件
	funLayout.on('tabchange', function(tabm, subLayTab){
		if (subLayTab.getItemId() == 'sub') {
			if (subLayTab.isOpenTab) {//激活后才执行
				subLayTab.fireEvent('tabchange', subLayTab, subLayTab.getActiveTab());
			}
			//标记已经被激活
			subLayTab.isOpenTab = true;
		}
	});
	
	//显示子表对象时刷新明细表的数据
	subLayout.on('tabchange', function(tabm, activeTab){
		var sublay = activeTab.getComponent(0);
		var mgrid = sublay;
		if (!mgrid.isXType('grid') && sublay.getComponent) {
			mgrid = sublay.getComponent(0).getComponent(0);
		}
		if (!mgrid.isXType('grid')) return;//预览图片时，没有表格
		
		//给外键名
		mgrid.fkName = sublay.fkName;
		mgrid.fkValue = tabm.curMainId;
		mgrid.curBrandId = tabm.curBrandId;
		
		Jxstar.loadSubData(mgrid, mgrid.fkValue);
	});
	
	return funLayout;
}