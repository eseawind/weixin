Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Datactlprop = Jxstar.findComboData('ctlprop');

	var cols = [
	{col:{header:'*功能ID', width:100, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:1000, allowBlank:false
		})}, field:{name:'funall_control__value_data',type:'string'}},
	{col:{header:'*功能名称', width:100, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:1000, allowBlank:false
		})}, field:{name:'funall_control__display_data',type:'string'}},
	{col:{header:'*序号', width:100, sortable:true, align:'right',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.NumberField({
			maxLength:22, allowBlank:false
		}),renderer:JxUtil.formatNumber(2)}, field:{name:'funall_control__control_index',type:'float'}},
	{col:{header:'控件类型', width:100, sortable:true, hidden:true, defaultval:'combo'}, field:{name:'funall_control__control_type',type:'string'}},
	{col:{header:'控件代码', width:100, sortable:true, defaultval:'selectctl', editable:false,
		editor:new Ext.form.TextField({
			maxLength:1000
		})}, field:{name:'funall_control__control_code',type:'string'}},
	{col:{header:'控件名称', width:100, sortable:true, defaultval:'筛选控件设置', editable:false,
		editor:new Ext.form.TextField({
			maxLength:1000
		})}, field:{name:'funall_control__control_name',type:'string'}},
	{col:{header:'控件属性', width:100, sortable:true, defaultval:'7', align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datactlprop
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datactlprop[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datactlprop.length; i++) {
				if (Datactlprop[i][0] == value)
					return Datactlprop[i][1];
			}
		}}, field:{name:'funall_control__control_prop',type:'string'}},
	{col:{header:'控件ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'funall_control__control_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'sys_select_ctl'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}