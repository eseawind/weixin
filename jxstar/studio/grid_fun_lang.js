﻿Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var langstateData = Jxstar.findComboData('langstate');
	var langsrcData = Jxstar.findComboData('langsrc');
	var ctlpropData = Jxstar.findComboData('ctlprop');

	var cols = [
	{col:{header:'状态', width:58, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: langstateData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: langstateData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < langstateData.length; i++) {
				if (langstateData[i][0] == value)
					return langstateData[i][1];
			}
		}}, field:{name:'funall_lang__lang_state',type:'string'}},
	{col:{header:'文字代号', width:126, sortable:true}, field:{name:'funall_lang__lang_code',type:'string'}},
	{col:{header:'中文', width:198, sortable:true}, field:{name:'funall_lang__lang_zh',type:'string'}},
	{col:{header:'过滤识别值', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'funall_lang__lang_flag',type:'string'}},
	{col:{header:'繁体', width:196, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:500
		})}, field:{name:'funall_lang__lang_ft',type:'string'}},
	{col:{header:'英文', width:197, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:500
		})}, field:{name:'funall_lang__lang_en',type:'string'}},
	{col:{header:'文字来源', width:77, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: langsrcData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: langsrcData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < langsrcData.length; i++) {
				if (langsrcData[i][0] == value)
					return langsrcData[i][1];
			}
		}}, field:{name:'funall_lang__lang_src',type:'string'}},
	{col:{header:'文字类型', width:78, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: ctlpropData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: ctlpropData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < ctlpropData.length; i++) {
				if (ctlpropData[i][0] == value)
					return ctlpropData[i][1];
			}
		}}, field:{name:'funall_lang__lang_type',type:'string'}},
	{col:{header:'备注', width:260, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:200
		})}, field:{name:'funall_lang__lang_memo',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'funall_lang__lang_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '0',
		funid: 'fun_lang'
	};
	
	
	config.initpage = function(pageNode){	
		
	return new Jxstar.GridNode(config);
}