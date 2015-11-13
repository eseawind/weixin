﻿Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'*附件名称', width:156, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:200, allowBlank:false
		})}, field:{name:'sys_attach__attach_name',type:'string'}},
	{col:{header:'附件ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_attach__attach_id',type:'string'}},
	{col:{header:'表名', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_attach__table_name',type:'string'}},
	{col:{header:'功能名称', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_attach__fun_name',type:'string'}},
	{col:{header:'功能ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_attach__fun_id',type:'string'}},
	{col:{header:'记录ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_attach__data_id',type:'string'}},
	{col:{header:'上传人', width:78, sortable:true}, field:{name:'sys_attach__upload_user',type:'string'}},
	{col:{header:'上传日期', width:111, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d H:i') : '';
		}}, field:{name:'sys_attach__upload_date',type:'date'}},
	{col:{header:'文件名', width:189, sortable:true}, field:{name:'sys_attach__attach_path',type:'string'}},
	{col:{header:'文件类型', width:117, sortable:true, hidden:true}, field:{name:'sys_attach__content_type',type:'string'}},
	{col:{header:'相关字段', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_attach__attach_field',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '0',
		funid: 'sys_attach'
	};
	
	
	if (Jxstar.systemVar.uploadType != '1') {
		
	return new Jxstar.GridNode(config);
}