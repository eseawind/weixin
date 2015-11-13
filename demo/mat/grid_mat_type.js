Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'*类别编号', width:149, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:20, allowBlank:false
		})}, field:{name:'mat_type__type_code',type:'string'}},
	{col:{header:'*类别名称', width:196, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'mat_type__type_name',type:'string'}},
	{col:{header:'备注', width:224, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:200
		})}, field:{name:'mat_type__type_memo',type:'string'}},
	{col:{header:'类别ID', width:100, sortable:true, hidden:true}, field:{name:'mat_type__type_id',type:'string'}},
	{col:{header:'级别', width:100, sortable:true, hidden:true, renderer:JxUtil.formatInt()}, field:{name:'mat_type__type_level',type:'int'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'mat_type'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}