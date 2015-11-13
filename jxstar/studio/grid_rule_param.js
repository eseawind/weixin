Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var datatypeData = Jxstar.findComboData('datatype');

	var cols = [
	{col:{header:'*序号', width:52, sortable:true, defaultval:'10', align:'right',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.NumberField({
			maxLength:12, allowBlank:false
		}),renderer:JxUtil.formatInt()}, field:{name:'fun_rule_param__param_no',type:'int'}},
	{col:{header:'*参数名称', width:144, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:20, allowBlank:false
		})}, field:{name:'fun_rule_param__param_name',type:'string'}},
	{col:{header:'*参数类型', width:134, sortable:true, defaultval:'string', align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: datatypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: datatypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < datatypeData.length; i++) {
				if (datatypeData[i][0] == value)
					return datatypeData[i][1];
			}
		}}, field:{name:'fun_rule_param__param_type',type:'string'}},
	{col:{header:'参数ID', width:100, sortable:true, hidden:true}, field:{name:'fun_rule_param__param_id',type:'string'}},
	{col:{header:'规则ID', width:100, sortable:true, hidden:true}, field:{name:'fun_rule_param__rule_id',type:'string'}},
	{col:{header:'参数来源', width:100, sortable:true, hidden:true, defaultval:'db'}, field:{name:'fun_rule_param__param_src',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '0',
		funid: 'rule_param'
	};
	
	
		
	return new Jxstar.GridNode(config);
}