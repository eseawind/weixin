Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'*函数名称', width:165, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:100, allowBlank:false
		})}, field:{name:'funall_default__func_name',type:'string'}},
	{col:{header:'函数描述', width:297, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:100
		})}, field:{name:'funall_default__memo',type:'string'}},
	{col:{header:'函数定义ID', width:100, sortable:true, hidden:true}, field:{name:'funall_default__func_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '1',
		funid: 'sys_default'
	};
	
	
		
	return new Jxstar.GridNode(config);
}