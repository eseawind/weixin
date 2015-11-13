﻿Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'部门名称', width:182, sortable:true}, field:{name:'sys_dept__dept_name',type:'string'}},
	{col:{header:'部门编码', width:105, sortable:true}, field:{name:'sys_dept__dept_code',type:'string'}},
	{col:{header:'部门类别', width:100, sortable:true, hidden:true}, field:{name:'sys_dept__dept_type',type:'string'}},
	{col:{header:'备注', width:184, sortable:true}, field:{name:'sys_dept__memo',type:'string'}},
	{col:{header:'是否注销', width:67, sortable:true, hidden:true}, field:{name:'sys_dept__is_novalid',type:'string'}},
	{col:{header:'部门ID', width:100, sortable:true, hidden:true}, field:{name:'sys_dept__dept_id',type:'string'}},
	{col:{header:'部门级别', width:100, sortable:true, hidden:true, renderer:JxUtil.formatInt()}, field:{name:'sys_dept__dept_level',type:'int'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '0',
		isshow: '1',
		funid: 'sys_dept1'
	};
	
	
	//添加自定义查询按钮
		
	return new Jxstar.GridNode(config);
}