Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'功能ID', width:100, sortable:true}, field:{name:'rpt_drill__fun_id',type:'string'}},
	{col:{header:'显示WhereSql', width:100, sortable:true}, field:{name:'rpt_drill__where_sql',type:'string'}},
	{col:{header:'显示WhereType', width:100, sortable:true}, field:{name:'rpt_drill__where_type',type:'string'}},
	{col:{header:'显示WhereValue', width:100, sortable:true}, field:{name:'rpt_drill__where_value',type:'string'}},
	{col:{header:'区域ID', width:100, sortable:true}, field:{name:'rpt_drill__area_id',type:'string'}},
	{col:{header:'主键', width:100, sortable:true}, field:{name:'rpt_drill__drill_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '0',
		isshow: '0',
		funid: 'rpt_drill'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}