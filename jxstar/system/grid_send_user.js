Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'收件人', width:148, sortable:true}, field:{name:'plet_msg_user__user_name',type:'string'}},
	{col:{header:'部门名称', width:216, sortable:true}, field:{name:'plet_msg_user__dept_name',type:'string'}},
	{col:{header:'收件人ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg_user__user_id',type:'string'}},
	{col:{header:'部门ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg_user__dept_id',type:'string'}},
	{col:{header:'消息ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg_user__msg_id',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, hidden:true}, field:{name:'plet_msg_user__key_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '0',
		isshow: '0',
		funid: 'send_user'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}