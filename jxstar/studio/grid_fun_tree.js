Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var treetypeData = Jxstar.findComboData('treetype');
	var charflagData = Jxstar.findComboData('charflag');
	var nodeclsData = Jxstar.findComboData('nodecls');

	var cols = [
	{col:{header:'树序号', width:55, sortable:true}, field:{name:'fun_tree__tree_no',type:'string'}},
	{col:{header:'树类型', width:70, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: treetypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: treetypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < treetypeData.length; i++) {
				if (treetypeData[i][0] == value)
					return treetypeData[i][1];
			}
		}}, field:{name:'fun_tree__tree_type',type:'string'}},
	{col:{header:'树形组标志', width:75, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: charflagData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: charflagData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < charflagData.length; i++) {
				if (charflagData[i][0] == value)
					return charflagData[i][1];
			}
		}}, field:{name:'fun_tree__team_id',type:'string'}},
	{col:{header:'所属功能ID', width:100, sortable:true}, field:{name:'fun_tree__fun_id',type:'string'}},
	{col:{header:'树形标题', width:100, sortable:true}, field:{name:'fun_tree__tree_title',type:'string'}},
	{col:{header:'数据表', width:100, sortable:true}, field:{name:'fun_tree__table_name',type:'string'}},
	{col:{header:'节点名字段', width:138, sortable:true}, field:{name:'fun_tree__node_name',type:'string'}},
	{col:{header:'节点ID字段', width:135, sortable:true}, field:{name:'fun_tree__node_id',type:'string'}},
	{col:{header:'级别字段', width:133, sortable:true}, field:{name:'fun_tree__node_level',type:'string'}},
	{col:{header:'节点附加值', width:100, sortable:true, hidden:true}, field:{name:'fun_tree__node_other',type:'string'}},
	{col:{header:'目标过滤条件', width:208, sortable:true}, field:{name:'fun_tree__right_where',type:'string'}},
	{col:{header:'WHERE子句', width:184, sortable:true}, field:{name:'fun_tree__self_where',type:'string'}},
	{col:{header:'ORDER子句', width:139, sortable:true}, field:{name:'fun_tree__self_order',type:'string'}},
	{col:{header:'树形功能ID', width:100, sortable:true, hidden:true}, field:{name:'fun_tree__self_funid',type:'string'}},
	{col:{header:'数据源名', width:100, sortable:true, hidden:true}, field:{name:'fun_tree__db_name',type:'string'}},
	{col:{header:'树形ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'fun_tree__tree_id',type:'string'}},
	{col:{header:'节点样式', width:100, sortable:true, hidden:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: nodeclsData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: nodeclsData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < nodeclsData.length; i++) {
				if (nodeclsData[i][0] == value)
					return nodeclsData[i][1];
			}
		}}, field:{name:'fun_tree__node_style',type:'string'}},
	{col:{header:'不检查子级', width:100, sortable:true, hidden:true}, field:{name:'fun_tree__not_check',type:'string'}},
	{col:{header:'关联查询字段', width:100, sortable:true, hidden:true}, field:{name:'fun_tree__relat_col',type:'string'}},
	{col:{header:'是否含本级', width:100, sortable:true, hidden:true}, field:{name:'fun_tree__has_level',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '0',
		funid: 'fun_tree'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}