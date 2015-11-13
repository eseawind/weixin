Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var paramtypeData = Jxstar.findComboData('paramtype');

	var cols = [
	{col:{header:'*参数类型', width:100, sortable:true, align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: paramtypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: paramtypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < paramtypeData.length; i++) {
				if (paramtypeData[i][0] == value)
					return paramtypeData[i][1];
			}
		}}, field:{name:'fun_event_param__param_type',type:'string'}},
	{col:{header:'参数名称', width:149, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:50
		})}, field:{name:'fun_event_param__param_name',type:'string'}},
	{col:{header:'参数值', width:158, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TriggerField({
			maxLength:100,
			editable:true,
			triggerClass:'x-form-search-trigger', 
			onTriggerClick: function() {
				if (this.menu == null) {
					var selcfg = {pageType:'combogrid', nodeId:'sys_default', layoutPage:'', sourceField:'funall_default.func_name', targetField:'fun_event_param.param_value', whereSql:"funall_default.func_name like '{CUR%'", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'0',fieldName:'fun_event_param.param_value'};
					this.menu = Jxstar.createComboMenu(this);
					JxSelect.createComboGrid(selcfg, this.menu, 'node_event_param_editgrid');
				}
				this.menu.show(this.el);
			}
		})}, field:{name:'fun_event_param__param_value',type:'string'}},
	{col:{header:'*序号', width:59, sortable:true, defaultval:'1', align:'right',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.NumberField({
			maxLength:12, allowBlank:false
		}),renderer:JxUtil.formatInt()}, field:{name:'fun_event_param__param_index',type:'int'}},
	{col:{header:'参数说明', width:209, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:200
		})}, field:{name:'fun_event_param__param_memo',type:'string'}},
	{col:{header:'调用ID', width:100, sortable:true, hidden:true}, field:{name:'fun_event_param__invoke_id',type:'string'}},
	{col:{header:'参数ID', width:100, sortable:true, hidden:true}, field:{name:'fun_event_param__param_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '0',
		funid: 'event_param'
	};
	
	
		
	return new Jxstar.GridNode(config);
}