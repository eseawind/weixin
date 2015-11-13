﻿Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Datadatatype = Jxstar.findComboData('datatype');
	var Datactltype = Jxstar.findComboData('ctltype');
	var Datadatastyle = Jxstar.findComboData('datastyle');

	var cols = [
	{col:{header:'*字段代码', width:224, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:1000, allowBlank:false
		})}, field:{name:'fun_col__col_code',type:'string'}},
	{col:{header:'*字段名称', width:120, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:1000, allowBlank:false
		})}, field:{name:'fun_col__col_name',type:'string'}},
	{col:{header:'*数据类型', width:100, sortable:true, defaultval:'string', align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datadatatype
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: Datadatatype[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datadatatype.length; i++) {
				if (Datadatatype[i][0] == value)
					return Datadatatype[i][1];
			}
		}}, field:{name:'fun_col__data_type',type:'string'}},
	{col:{header:'更新?', width:50, sortable:true, defaultval:'1', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'fun_col__is_update',type:'string'}},
	{col:{header:'编辑?', width:48, sortable:true, defaultval:'1', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'fun_col__is_edit',type:'string'}},
	{col:{header:'必填?', width:48, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'fun_col__is_notnull',type:'string'}},
	{col:{header:'序号', width:67, sortable:true, align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			decimalPrecision:0, maxLength:22
		}),renderer:JxUtil.formatInt()}, field:{name:'fun_col__col_index',type:'int'}},
	{col:{header:'*控件类型', width:84, sortable:true, defaultval:'text', align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datactltype
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: Datactltype[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datactltype.length; i++) {
				if (Datactltype[i][0] == value)
					return Datactltype[i][1];
			}
		}}, field:{name:'fun_col__col_control',type:'string'}},
	{col:{header:'控件名称', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			maxLength:1000, name:'fun_col__control_name', 
			editable:true, hcss:'color:#3039b4;',
			triggerClass:'x-form-search-trigger', 
			listeners:{afterrender: function(combo) {
				JxSelect.initCombo('sys_fun_col', combo, 'node_sys_fun_col_editgrid');
			}}
		})}, field:{name:'fun_col__control_name',type:'string'}},
	{col:{header:'*数据样式', width:82, sortable:true, defaultval:'text', align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datadatastyle
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: Datadatastyle[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datadatastyle.length; i++) {
				if (Datadatastyle[i][0] == value)
					return Datadatastyle[i][1];
			}
		}}, field:{name:'fun_col__format_id',type:'string'}},
	{col:{header:'表格编辑', width:70, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'fun_col__is_gridedit',type:'string'}},
	{col:{header:'统计列?', width:55, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'fun_col__is_statcol',type:'string'}},
	{col:{header:'缺省值', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TriggerField({
			maxLength:1000,
			editable:true,
			triggerClass:'x-form-search-trigger', 
			onTriggerClick: function() {
				if (this.menu == null) {
					var selcfg = {pageType:'combogrid', nodeId:'sys_default', layoutPage:'', sourceField:'funall_default.func_name', targetField:'fun_col.default_value', whereSql:"func_name like 'fun_%'", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'0',queryField:'',likeType:'',fieldName:'fun_col.default_value'};
					this.menu = Jxstar.createComboMenu(this);
					JxSelect.createComboGrid(selcfg, this.menu, 'node_sys_fun_col_editgrid');
				}
				this.menu.show(this.el);
			}
		})}, field:{name:'fun_col__default_value',type:'string'}},
	{col:{header:'BLURFUNC', width:100, sortable:true, hidden:true}, field:{name:'fun_col__blur_func',type:'string'}},
	{col:{header:'KEYUPFUNC', width:100, sortable:true, hidden:true}, field:{name:'fun_col__keyup_func',type:'string'}},
	{col:{header:'功能标识', width:100, sortable:true, hidden:true}, field:{name:'fun_col__fun_id',type:'string'}},
	{col:{header:'字段ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'fun_col__col_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '0',
		funid: 'sys_fun_col'
	};
	
	
	config.initpage = function(gridNode){
		dataImportParam: function() {

		setFunColext: function(){
			var records = this.grid.getSelectionModel().getSelections();
			if (!JxUtil.selectone(records)) return;


			//显示数据
			Jxstar.showData({
				filename: define.formpage,
				title: define.nodetitle,
				callback: hdcall
			});
		}
	};
		
	return new Jxstar.GridNode(config);
}