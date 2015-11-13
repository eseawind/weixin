Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'*筛选数据值', width:122, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:100, allowBlank:false
		})}, field:{name:'sys_select_data__data_value',type:'string'}},
	{col:{header:'*筛选where条件设置', width:238, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:200, allowBlank:false
		})}, field:{name:'sys_select_data__data_where',type:'string'}},
	{col:{header:'*序号', width:77, sortable:true, align:'right',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.NumberField({
			decimalPrecision:0, maxLength:12, allowBlank:false
		}),renderer:JxUtil.formatInt()}, field:{name:'sys_select_data__data_index',type:'int'}},
	{col:{header:'设置ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_select_data__field_id',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_select_data__data_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '1',
		funid: 'sys_select_data'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}