Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'模块编号', width:127, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'funall_module__module_code',type:'string'}},
	{col:{header:'*模块名称', width:165, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'funall_module__module_name',type:'string'}},
	{col:{header:'*序号', width:66, sortable:true, defaultval:'10', align:'right',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.NumberField({
			maxLength:12, allowBlank:false
		}),renderer:JxUtil.formatInt()}, field:{name:'funall_module__module_index',type:'string'}},
	{col:{header:'是否显示', width:70, sortable:true, defaultval:'1', editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'funall_module__is_show',type:'string'}},
	{col:{header:'级别', width:100, sortable:true, hidden:true}, field:{name:'funall_module__module_level',type:'string'}},
	{col:{header:'模块ID', width:100, sortable:true, hidden:true}, field:{name:'funall_module__module_id',type:'string'}},
	{col:{header:'是否展开', width:66, sortable:true, defaultval:'0', editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'funall_module__is_expanded',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'sys_module'
	};
	
	
		
	return new Jxstar.GridNode(config);
}