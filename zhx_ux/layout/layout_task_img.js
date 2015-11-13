/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 图片管理布局。
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
	//显示资料表
	var docGrid = new Ext.Panel({
		height:163,
		layout:'fit',
		border:false,
		fieldLabel:'图片资料'
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
			items:[{xtype:'imagefield', fieldLabel:'设计图', name:'dev_task__des_img', readOnly:true, width:'100%', height:160},
			{xtype:'hidden', fieldLabel:'设计号', name:'dev_task__des_code', anchor:'100%'},
			{xtype:'hidden', fieldLabel:'任务ID', name:'dev_task__task_id', anchor:'100%'}]
		},{
			border:false, columnWidth:0.2, layout:'form', style: 'padding-left:10px;',
			items:[{xtype:'imagefield', fieldLabel:'样衣图', labelStyle:'color:#0000FF;', labelSeparator:'*', name:'dev_task__pro_img', allowBlank:false, width:'100%', height:160}]
		},{
			border:false, columnWidth:0.6, layout:'form', style: 'padding-left:10px;', height:185, 
			items:[docGrid]
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
		}]
	});
	//添加grid页面
	Jxstar.createPage(funid, 'gridpage', mainGrid);
	var subParam = {pageType:'subgrid', parentNodeId:funid};
	Jxstar.createPage('dev_attach', 'gridpage', docGrid, subParam);
	
	//绑定表格行选事件
	JxUtil.delay(1000, function(){
		devForm.doLayout();
		var mp = funLayout.getComponent(0);
		var grid = mp.getComponent(0).getComponent(0);
		
		//点击表格记录时，更新form中的记录值
		grid.on('rowclick', function(grid){
			var taskId = '';
			var define = grid.gridNode.define;
			var rs = JxUtil.getSelectRows(grid);
			if (rs.length > 0) {
				taskId = rs[0].get('dev_task__old_task_id');
				if (taskId.length == 0) {
					taskId = rs[0].get(define.tablename + '__task_id');
				}
			}
			if (taskId.length == 0) return;
			
			//加载表单信息
			var def = Jxstar.findNode('dev_prod_img');
			devForm.formNode = {define:def};
			var form = devForm.getForm();
			var desimg = rs[0].get('dev_task__des_img');
			var proimg = rs[0].get('dev_task__pro_img');
			var devcode = rs[0].get('dev_task__des_code');
			
			form.oset('dev_task__des_img', desimg);
			form.oset('dev_task__pro_img', proimg);
			form.oset('dev_task__task_id', taskId);
			form.oset('dev_task__des_code', devcode);
			
			var desitem = form.findField('dev_task__des_img');
			desitem.loadImage();
			desitem.on('beforesave', function(field, param){
				if (param.params.indexOf('&attach_type=') < 0) {
					param.params = param.params + '&attach_type=0';
				}
				return true;
			});
			
			var proitem = form.findField('dev_task__pro_img');
			proitem.loadImage();
			//刷新明细表中的数据====================
			var subgrid = docGrid.getComponent(0);
			proitem.on('afterdelete', function(field, param){
				subgrid.getStore().reload();
			});
			proitem.on('beforesave', function(field, param){//支持上传高清图片，缩略图大小为600
				if (param.params.indexOf('&attach_type=') < 0) {
					param.params = param.params + '&attach_type=1&is_imageresize=1&imagesize=600';
				}
				return true;
			});
			proitem.on('aftersave', function(field, param){
				subgrid.getStore().reload();
			});
			//==================================================
			
			subgrid.fkValue = taskId;
			subgrid.attachDataId = taskId;
			subgrid.attachFunId = 'dev_prod_img';
			//加载技术资料表，只显示样衣图片与设计图片
			var wsql = "attach_type in ('1','0') and table_name = 'dev_task' and data_id = ?";
			var whereParam = {where_sql:wsql, where_value:taskId, where_type:'string'};
			Jxstar.loadData(subgrid, whereParam);
		});
		var count = grid.getStore().getCount();
		if (count > 0) {
			var sm = grid.getSelectionModel();
			sm.selectRow(0);
			grid.fireEvent('rowclick', grid, 0);
		}
	});
	
	return funLayout;
}