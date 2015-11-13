﻿Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var Datatasktype = Jxstar.findComboData('tasktype');
	var Datataskstate = Jxstar.findComboData('taskstate');
	var Datayesno = Jxstar.findComboData('yesno');
	var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		style:'padding:5 10 5 10;',
		items:[{
			anchor:'100%',
			border:false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'任务名称', name:'task_base__task_name', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:50},
					{xtype:'textfield', fieldLabel:'后台类', name:'task_base__task_class', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:100},
					{xtype:'datefield', fieldLabel:'上次运行时间', name:'task_base__run_date', defaultval:'fun_getToday()', format:'Y-m-d H:i:s', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%'},
					{xtype:'combo', fieldLabel:'任务类型', name:'task_base__task_type', defaultval:'1',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Datatasktype
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Datatasktype[0][0]},
					{xtype:'hidden', fieldLabel:'任务ID', name:'task_base__task_id', anchor:'58%'}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'combo', fieldLabel:'任务状态', name:'task_base__task_state', defaultval:'1',
						anchor:'100%', readOnly:true, editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Datataskstate
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Datataskstate[0][0]},
					{xtype:'textfield', fieldLabel:'执行计划', name:'task_base__task_plan', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', readOnly:true, anchor:'100%', maxLength:50},
					{xtype:'combo', fieldLabel:'保留日志？', name:'task_base__has_log', defaultval:'1',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Datayesno
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Datayesno[0][0]},
					{xtype:'numberfield', decimalPrecision:0, fieldLabel:'最大日志条数', name:'task_base__log_num', defaultval:'1000', anchor:'100%', maxLength:22}
				]
			}
			]
		},{
			anchor:'100%',
			border:false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.99,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textarea', fieldLabel:'任务描述', name:'task_base__task_memo', width:'100%', height:96, maxLength:200}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'sys_task'
	};

	
	config.eventcfg = {	
	
	return new Jxstar.FormNode(config);
}