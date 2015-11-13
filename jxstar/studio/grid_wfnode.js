Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'节点ID', width:100, sortable:true}, field:{name:'wf_node__node_id',type:'string'}},
	{col:{header:'节点名称', width:145, sortable:true}, field:{name:'wf_node__node_title',type:'string'}},
	{col:{header:'节点类型', width:100, sortable:true}, field:{name:'wf_node__node_type',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, hidden:true}, field:{name:'wf_node__wfnode_id',type:'string'}},
	{col:{header:'过程ID', width:100, sortable:true, hidden:true}, field:{name:'wf_node__process_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '0',
		funid: 'wf_node'
	};
	
	
		
	return new Jxstar.GridNode(config);
}