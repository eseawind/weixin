Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var msgstateData = Jxstar.findComboData('msgstate');
	var msgtypeData = Jxstar.findComboData('msgtype');

	var cols = [
	{col:{header:'公告标题', width:227, sortable:true}, field:{name:'plet_msg__msg_title',type:'string'}},
	{col:{header:'公告内容', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__content',type:'string'}},
	{col:{header:'阅读部门', width:115, sortable:true}, field:{name:'plet_msg__dept_name',type:'string'}},
	{col:{header:'发件人', width:83, sortable:true}, field:{name:'plet_msg__from_user',type:'string'}},
	{col:{header:'发送时间', width:126, sortable:true, renderer:function(value) {
			return value ? value.format('Y-m-d H:i') : '';
		}}, field:{name:'plet_msg__send_date',type:'date'}},
	{col:{header:'收件人', width:87, sortable:true}, field:{name:'plet_read__user_name',type:'string'}},
	{col:{header:'阅读时间', width:117, sortable:true, renderer:function(value) {
			return value ? value.format('Y-m-d H:i') : '';
		}}, field:{name:'plet_read__read_date',type:'date'}},
	{col:{header:'消息状态', width:100, sortable:true, hidden:true, align:'center',
		renderer:function(value){
			for (var i = 0; i < msgstateData.length; i++) {
				if (msgstateData[i][0] == value)
					return msgstateData[i][1];
			}
		}}, field:{name:'plet_msg__msg_state',type:'string'}},
	{col:{header:'消息类型', width:100, sortable:true, hidden:true, align:'center',
		renderer:function(value){
			for (var i = 0; i < msgtypeData.length; i++) {
				if (msgtypeData[i][0] == value)
					return msgtypeData[i][1];
			}
		}}, field:{name:'plet_msg__msg_type',type:'string'}},
	{col:{header:'部门编码', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__dept_code',type:'string'}},
	{col:{header:'消息ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__msg_id',type:'string'}},
	{col:{header:'部门ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__dept_id',type:'string'}},
	{col:{header:'用户ID', width:100, sortable:true, hidden:true}, field:{name:'plet_read__user_id',type:'string'}},
	{col:{header:'阅读ID', width:100, sortable:true, hidden:true}, field:{name:'plet_read__read_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '0',
		funid: 'get_board'
	};
	
	
		
	return new Jxstar.GridNode(config);
}