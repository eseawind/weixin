/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
  
/**
 * 显示图片查询与浏览功能。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

Jxstar.currentPage = function(define, pageParam) {
	if (define == null) {
		JxHint.alert('layout_main define param define is null!');
		return;
	}

	var funid = define.nodeid;
	var pkcol = define.pkcol;
	var title = define.nodetitle;
	var tablename = define.tablename;
	
	//=======================================显示样衣试制单=================================
	var showForm = function(taskId, temId) {
		var pf = tabImage.getComponent(1);
		var page = pf.getComponent(0);
		var form = page.getForm();
		form.myGrid = null;
		form.myStore = store;
		
		//加载Form数据
		var options = {
			where_sql: 'dev_task.task_id = ?',
			where_type: 'string',
			where_value: taskId,
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
				tabImage.activate(pf);
				page.formNode.event.initForm();
			}
		};
		if (temId.length > 0) {
			options.where_sql += ' and dev_template.tem_id = ?';
			options.where_type += ';string';
			options.where_value += ';' + temId;
		}
		
		Jxstar.queryData('dev_des_sel', options);
	};

	//=======================================显示图片=======================================
	//查询数据URL
	var url = Jxstar.path + '/commonAction.do?eventcode=query_data&funid=queryevent&pagetype=grid';
		url += '&query_funid='+ funid +'&user_id='+ Jxstar.session['user_id'];
	
	var fields = ['dev_task__task_code', 'dev_task__splan_year', 'dev_task__season_name', 'dev_task__brand_name', 
	              'dev_task__ptype_name', 'dev_task__des_code', 'dev_task__des_username', 'dev_task__task_id', 'dev_task__old_task_id', 
				  'dev_template__pro_code', 'dev_template__tem_id'];
	
	//创建数据对象
	var store = new Ext.data.Store({
		proxy: new Ext.data.HttpProxy({
			method: 'POST',
			url: url,
			listeners: {exception: function(a, b, c, d, e, f){
				store.removeAll();
				
				//处理异常信息
				JxUtil.errorResponse(e);
			}}
		}),
		reader: new Ext.data.JsonReader({
				root: 'data.root',
				totalProperty: 'data.total'
			}, 
			fields
		)
	});
    
	//取图片的路径
	var showUrl = function(dataId) {
		if (this.old_task_id && this.old_task_id.length > 0) {
			dataId = this.old_task_id;
		}
		//取图片字段
		attach_field = 'des_img';
		var desratio = tbar.items.get(11);
		if (desratio.checked) {
			attach_field = 'pro_img';
		}
		
		var params = 'funid=sys_attach&pagetype=editgrid&eventcode=fdown';
		params += '&attach_field='+attach_field+'&dataid='+ dataId;
		params += '&table_name=dev_task&datafunid=dev_des_up';
		
		var url = (JxAttach.uploadType == '1') ? JxAttach.uploadUrl : Jxstar.path;
		url += '/fileAction.do?' + params + '&dataType=byte&nousercheck=1&dc=' + (new Date()).getTime();
		return url;
	};
	//取任务ID
	var getTaskId = function(oldTaskId) {
		this.old_task_id = oldTaskId;
		
		return oldTaskId;
	};
	
	//显示模板
	var tpl = new Ext.XTemplate(
            '<ul>',
                '<tpl for=".">',
                    '<li class="phone">',//width="98%" height="85%" 控制图片控件大小
                        '<img width="140" height="170" data="{dev_task__old_task_id:this.getTaskId}" src="{dev_task__task_id:this.showUrl}" />',
                        '<span>{dev_task__season_name}:{dev_task__brand_name} <br>设计号:{dev_task__des_code} <br>样衣号:{dev_template__pro_code}</span>',
                    '</li>',
                '</tpl>',
            '</ul>'
        );
	tpl.showUrl = showUrl;
	tpl.getTaskId = getTaskId;
	
	//显示图片的对象
    var dataview = new Ext.DataView({
        store: store,
        tpl  : tpl,
        id: 'phones',
		listeners: {click: function(dv, index){
			//显示样衣试制单
			var rec = dv.getStore().getAt(index);
			var taskId = rec.get('dev_task__task_id');
			var temId = rec.get('dev_template__tem_id');
			showForm(taskId, temId);
		}},
        
        itemSelector: 'li.phone',
        overClass   : 'phone-hover',
        singleSelect: true,
        multiSelect : true,
        autoScroll  : true
    });
	//=======================================显示图片 end=======================================
	
	//=======================================处理查询=======================================
	//查询工具栏
	var url = Jxstar.path + '/commonAction.do?funid=dev_prod_tech&pagetype=grid&user_id='+Jxstar.session['user_id']+'&eventcode=';
	var tbar = new Ext.Toolbar({deferHeight:true, items:[
					{xtype: 'tbtext', text: '设计号：'},
					{xtype:'textfield', name:'des_code', width:100,
						listeners: {specialkey: function(f, e){
							if (e.getKey() == e.ENTER) {query(tbar);}}
						}
					},
					{xtype: 'tbtext', text: '样版号：'},
					{xtype:'textfield', name:'tem_code', width:100,
						listeners: {specialkey: function(f, e){
							if (e.getKey() == e.ENTER) {query(tbar);}}
						}
					},
					{xtype: 'tbtext', text: '样衣号：'},
					{xtype:'textfield', name:'pro_code', width:100,
						listeners: {specialkey: function(f, e){
							if (e.getKey() == e.ENTER) {query(tbar);}}
						}
					},
					{
						iconCls:'eb_qry', 
						text:'查询',
						handler:function(){
							query(tbar);
						}
					},
					{
						iconCls:'eb_qryh', 
						text:'筛选',
						handler:function(){
							var ge = new Jxstar.GridEvent(define);
							ge.selBaseQuery(store);
						}
					},
					{	iconCls:'eb_clear', 
						text:'清除',
						handler:function(){
							query(tbar, true);
						}
					}]
					});
	tbar.add('->');
	tbar.add({xtype:'radio',boxLabel:'设计图',name:'imgtype',inputValue:'des_img', checked:true, listeners:{check:function(){query(tbar);}}});
	tbar.add({xtype:'radio',boxLabel:'样衣图',name:'imgtype',inputValue:'pro_img', listeners:{check:function(){query(tbar);}}});
					
	//查询款式信息
	var query = function(tbar, isClear) {
		if (isClear) {
			tbar.items.get(1).setValue('');
			tbar.items.get(3).setValue('');
			tbar.items.get(5).setValue('');
		}
		var desCode = tbar.items.get(1).getValue();
		var temCode = tbar.items.get(3).getValue();
		var proCode = tbar.items.get(5).getValue();
		
		var where_sql = '';
		var where_value = '';
		var where_type = '';
		if (desCode.length > 0) {
			where_sql += 'dev_task.des_code like ? and ';
			where_value += '%' + desCode + '%;';
			where_type += 'string;';
		}
		if (temCode.length > 0) {
			where_sql += 'dev_template.tem_code like ? and ';
			where_value += '%' + temCode + '%;';
			where_type += 'string;';
		}
		if (proCode.length > 0) {
			where_sql += 'dev_template.pro_code like ? and ';
			where_value += '%' + proCode + '%;';
			where_type += 'string;';
		}
		
		if (where_sql.length > 0) {
			where_sql = where_sql.substr(0, where_sql.length-5);
			where_value = where_value.substr(0, where_value.length-1);
			where_type = where_type.substr(0, where_type.length-1);
		}
		
		store.load({params:{start:0, limit:50, where_sql:where_sql, where_value:where_value, where_type:where_type}});
	};
	//=======================================处理查询 end=======================================
	
	//页面布局
	var tabImage = new Ext.TabPanel({
		closeAction:'close',
		activeTab:0,
		items:[{
			style: 'border-top: 1px solid #99bbe8',
			title: '款式图片',
			layout: 'fit',
			items : dataview,
			tbar  : tbar,
			bbar:new Ext.PagingToolbar({
				deferHeight:true,
				pageSize: 50,
				store: store,
				displayInfo: true,
				displayMsg: '共 {2} 条',
				emptyMsg: jx.node.datano
			})
		}]
	});
	//创建款式档案页面
	var newtab = tabImage.add({
		pagetype:'form',
		title: '款式工艺资料',
		autoScroll:true,
		layout:'fit',
		border:false,
		iconCls:'tab_form'
	});
	Jxstar.createPage('dev_des_sel', 'formpage', newtab, {pageType:'form'});
	
	//初始显示所有设计款式
	store.load({params:{start:0,limit:50}});
	
	return tabImage;
};
