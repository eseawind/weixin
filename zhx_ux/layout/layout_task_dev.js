/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * grid-form布局；grid中显示上下区域；form中显示多行子表；
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
	var title = define.nodetitle;
	
	//显示业务记录表格
	var mainGrid = new Ext.Panel({
		region:'center',
		layout:'fit',
		border:false
	});
	//显示物料表
	var matGrid = new Ext.Panel({
		height:163,
		layout:'fit',
		border:false,
		fieldLabel:'物料表'
	});
	
	//显示款式说明与设计图
	var devForm = new Ext.form.FormPanel({
		frame:true,
		height:200,
		split:true,
		region:'south',
		labelAlign:'top',
		layout:'column',
		items:[{
			border:false, columnWidth:0.2, layout:'form', style: 'padding-left:10px;',
			items:[{xtype:'textarea', fieldLabel:'款式说明', name:'dev_task__type_desc', readOnly:true, width:'100%', height:60},
			{xtype:'textarea', fieldLabel:'设计备注', name:'dev_task__des_domemo', readOnly:true, width:'100%', height:75},
			{xtype:'hidden', fieldLabel:'任务ID', name:'dev_task__task_id', anchor:'100%'}]
		},{
			border:false, columnWidth:0.2, layout:'form', style: 'padding-left:10px;',
			items:[{xtype:'imagefield', fieldLabel:'设计图', name:'dev_task__des_img', readOnly:true, width:'100%', height:160}]
		},{
			border:false, columnWidth:0.6, layout:'form', style: 'padding-left:10px;', height:185, 
			items:[matGrid]
		}]
	});

	//创建grid-form布局
	var funLayout = new Ext.TabPanel({
		border:false,
		closeAction:'close',
		activeTab:0,
		items:[{
			pagetype:'grid',
			title: title+'-'+jx.layout.grid,	//列表
			layout:'border',
			border:false,
			iconCls:'tab_grid',
			items:[mainGrid,devForm]
		},{
			pagetype:'form',
			title: title+'-'+jx.layout.form,	//表单
			autoScroll:true,
			layout:'fit',
			border:false,
			iconCls:'tab_form'
		}]
	});
	//处理审批页面类型
	var isCheck = (pageParam && pageParam.pageType && pageParam.pageType == 'check');
	if (isCheck) pageParam.pageType = 'chkgrid';
	//添加grid页面
	Jxstar.createPage(funid, 'gridpage', mainGrid, pageParam);
	Jxstar.createPage('dev_mat_sel', 'gridpage', matGrid);
	//添加form页面
	var fpageType = isCheck ? 'chkform' : 'form';
	Jxstar.createPage(funid, 'formpage', funLayout.getComponent(1), {pageType:fpageType});
	
	//绑定表格行选事件
	JxUtil.delay(1000, function(){
		devForm.doLayout();
		var mp = funLayout.getComponent(0);
		var grid = mp.getComponent(0).getComponent(0);
		
		//点击表格记录时，更新form中的记录值
		grid.on('rowclick', function(grid){
			var taskId = '', dataId = '';
			var define = grid.gridNode.define;
			var rs = JxUtil.getSelectRows(grid);
			if (rs.length > 0) {
				taskId = rs[0].get(define.tablename + '__task_id');
				dataId = rs[0].get('dev_task__old_task_id');
				if (dataId.length == 0) {
					dataId = taskId;
				}
			}
			if (taskId.length == 0) return;
			
			//加载表单信息
			var def = Jxstar.findNode('dev_des_up');
			devForm.formNode = {define:def};
			var form = devForm.getForm();
			var desimg = rs[0].get('dev_task__des_img');
			var typedesc = rs[0].get('dev_task__type_desc');
			var devdesc = rs[0].get('dev_task__des_domemo');
			
			form.oset('dev_task__type_desc', typedesc);
			form.oset('dev_task__des_domemo', devdesc);
			form.oset('dev_task__des_img', desimg);
			form.oset('dev_task__task_id', dataId);
			
			var item = form.findField('dev_task__des_img');
			if (desimg.length == 0) {
				item.loadImage(Ext.BLANK_IMAGE_URL);
			} else {
				item.loadImage();
			}
			
			//加载物料表
			var wsql = 'task_id = ?';
			var whereParam = {where_sql:wsql, where_value:taskId, where_type:'string'};
			Jxstar.loadData(matGrid.getComponent(0), whereParam);
		});
		var count = grid.getStore().getCount();
		if (count > 0) {
			var sm = grid.getSelectionModel();
			sm.selectRow(0);
			grid.fireEvent('rowclick', grid, 0);
		}
	});
	
	funLayout.on('beforetabchange', function(tab, newTab, curTab){
		var mp = tab.getComponent(0);
		if (mp == null) return true;
		var fgrid = mp.getComponent(0).getComponent(0);
		if (fgrid == null) return true;
		
		var pagetype = newTab.pagetype;
		var records = fgrid.getSelectionModel().getSelections();
		if (records.length == 0 && pagetype != 'grid') {
			var form = newTab.getComponent(0);
			if (pagetype != 'form'  || (pagetype == 'form' && form.getForm().srcEvent != 'create')) {
				JxHint.alert(jx.layout.selmain);	//'请选择一条主记录！'
				return false;
			}
		}
		var curPage = curTab.getComponent(0);
		if (curPage != null && curPage.isXType('form') && curPage.getForm().isDirty()) {
			if (confirm(jx.layout.modify)) {	//'记录已被修改，是否需要先保存？'
				curPage.formNode.event.save();
				return false;
			}
		}
		
		return true;
	});

	funLayout.on('tabchange', function(tab, activeTab){
		//取当前激活的Tab页面类型
		var pagetype = activeTab.pagetype;
		//处理有些页面没有自动显示的问题
		activeTab.doLayout();
		var mp = tab.getComponent(0);
		if (mp == null) return false;
		var fgrid = mp.getComponent(0).getComponent(0);
		if (fgrid == null) return false;
		
		var curPage = activeTab.getComponent(0);
		if (curPage == null) return true;
		
		//聚焦当前页面，方便执行快捷键
		if (curPage.isXType('form')) {JxUtil.focusFirst(curPage);}
		if (curPage.isXType('grid')) {JxUtil.focusFirstRow(curPage);}
		
		//取选择记录的主键值
		var pkvalue = '';
		var records = fgrid.getSelectionModel().getSelections();
		if (records.length >= 1) {
			pkvalue = records[0].get(pkcol);
		} else {
			if ((pagetype != 'grid' && pagetype != 'form') || 
			    (pagetype == 'form' && curPage.getForm().srcEvent != 'create')) {
				JxHint.alert(jx.layout.selmain);	//'请选择一条主记录！'
				return false;
			}
		}
		
		//显示表单数据
		if (pagetype == 'form') {
			var form = curPage.getForm();
			if (form.srcEvent != 'create') {
				var record = records[0];
				form.myGrid = fgrid;
				form.myStore = fgrid.getStore();
				form.myRecord = record;
				form.loadRecord(record);
			}
			//显示FORM时，执行初始化事件
			curPage.formNode.event.initForm();
			//清除打开form的来源事件
			delete form.srcEvent;
		}
	});
	return funLayout;
}