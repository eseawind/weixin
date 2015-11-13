﻿Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Datapletcolno = Jxstar.findComboData('pletcolno');

	var cols = [
	{col:{header:'*显示名称', width:168, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'plet_portlet__portlet_title',type:'string'}},
	{col:{header:'*显示序号', width:94, sortable:true, defaultval:'10', align:'right',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.NumberField({
			decimalPrecision:0, maxLength:22, allowBlank:false
		}),renderer:JxUtil.formatInt()}, field:{name:'plet_portlet__portlet_no',type:'int'}},
	{col:{header:'*所属列', width:79, sortable:true, defaultval:'1', align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datapletcolno
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: Datapletcolno[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datapletcolno.length; i++) {
				if (Datapletcolno[i][0] == value)
					return Datapletcolno[i][1];
			}
		}}, field:{name:'plet_portlet__col_no',type:'string'}},
	{col:{header:'折叠?', width:58, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'plet_portlet__collapse',type:'string'}},
	{col:{header:'栏目名称', width:100, sortable:true}, field:{name:'plet_portlet__type_name',type:'string'}},
	{col:{header:'模板ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'plet_portlet__templet_id',type:'string'}},
	{col:{header:'栏目ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'plet_portlet__type_id',type:'string'}},
	{col:{header:'内容ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'plet_portlet__portlet_id',type:'string'}},
	{col:{header:'栏目代号', width:100, sortable:true}, field:{name:'plet_portlet__type_code',type:'string'}},
	{col:{header:'对象名称', width:161, sortable:true}, field:{name:'plet_portlet__object_name',type:'string'}},
	{col:{header:'参数值', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:25
		})}, field:{name:'plet_portlet__object_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '0',
		funid: 'plet_portlet'
	};
	
	
	config.eventcfg = {		
		
	return new Jxstar.GridNode(config);
}