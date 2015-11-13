﻿Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataaudit = Jxstar.findComboData('audit');

	var cols = [
	{col:{header:'状态', width:73, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataaudit
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataaudit[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataaudit.length; i++) {
				if (Dataaudit[i][0] == value)
					return Dataaudit[i][1];
			}
		}}, field:{name:'sys_news__state',type:'string'}},
	{col:{header:'消息内容', width:343, sortable:true}, field:{name:'sys_news__news_cont',type:'string'}},
	{col:{header:'发布时间', width:127, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d H:i') : '';
		}}, field:{name:'sys_news__edit_date',type:'date'}},
	{col:{header:'发布人', width:74, sortable:true}, field:{name:'sys_news__edit_user',type:'string'}},
	{col:{header:'发布人ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news__edit_userid',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news__news_id',type:'string'}},
	{col:{header:'信息类型', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news__cont_type',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'sys_msg'
	};
	
	
	var renderDown = function(val, metaData, record) {
	};
		
	return new Jxstar.GridNode(config);
}