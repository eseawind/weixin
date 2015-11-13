/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 任务分配布局。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

Jxstar.currentPage = function(define, pageParam) {
	if (define == null) {
		JxHint.alert('layout define param define is null!');
		return;
	}

	var pkcol = define.pkcol;
	var funid = define.nodeid;
	var title = define.nodetitle;
	//下表格的功能ID，但不是子表ID
	var funidx = define.subfunid;
	
	//已分配的工作
	var topLayout = new Ext.Panel({
		region:'north',
		height:240,
		split:true,
		
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
			border:false,
			frame:true,
			html:'步骤：<br>'+
			'1、先选择下面的可分配人员，右表中显示此人已分配的任务；<br>'+
			'2、再选择上表中待分配的任务记录；<br>'+
			'3、再点击“分配”按钮，下表数据刷新后显示最新分配的任务，分配完成；<br>'+
			'4、下表中可以修改已分配人员，也可以修改计划完成日期。'
		},{
			region:'center',
			layout:'fit',
			border:false
		}]
	});
	Jxstar.createPage(funid, 'gridpage', topLayout.getComponent(1));
	
	//已分配的工作
	var botLayout = new Ext.Panel({
		region:'center',
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
	Jxstar.createTree(funidx, botLayout);
	Jxstar.createPage(funidx, 'gridpage', botLayout.getComponent(1));
	
	//创建上下表格功能布局面板
	var funLayout = new Ext.Panel({
		border:false,
		layout:'border',
		title:title,
		items:[topLayout, botLayout]
	});
	
	var funTab = new Ext.TabPanel({
		closeAction:'close',
		activeTab:0,
		items:[funLayout]
	});
	
	//创建款式档案页面
	var newtab = funTab.add({
		pagetype:'form',
		title: '款式工艺资料',
		autoScroll:true,
		layout:'fit',
		border:false,
		iconCls:'tab_form'
	});
	Jxstar.createPage('dev_des_sel', 'formpage', newtab, {pageType:'form'});
	//显示款式档案页面
	funTab.showTask = function(temId, store, funTab) {
		var formTab = funTab.getComponent(1);
		var page = formTab.getComponent(0);
		var form = page.getForm();
		form.myGrid = null;
		form.myStore = store;
		
		//加载Form数据
		var options = {
			where_sql: 'dev_template.tem_id = ?',
			where_type: 'string',
			where_value: temId,
			callback: function(data) {
				//如果没有数据则执行新增
				if (data.length == 0) {
					JxHint.alert('没有找当前记录！');
					return;
				} else {
					var r = page.formNode.event.newRecord(data[0]);
					
					page.getForm().myRecord = r;
					page.getForm().loadRecord(r);
				}
				
				//切换到form页面
				funTab.activate(formTab);
				page.formNode.event.initForm();
			}
		};
		Jxstar.queryData('dev_des_sel', options);
	};
	
	//绑定表格行双击事件
	 JxUtil.delay(500, function(){
		var grid = topLayout.getComponent(1).getComponent(0);
		if (!grid) return false;
		//点击表格记录时，更新form中的记录值
		grid.on('rowdblclick', function(grid,rowIndex){	
			var store = grid.getStore();
			grid.getSelectionModel().selectRow(rowIndex);
			
			var temId = store.getAt(rowIndex).get('dev_template__tem_id');
			funTab.showTask(temId, store, funTab);

		});
	});
	
	
	
	 
	return funTab;
}