Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'物资编码', width:103, sortable:true, editable:false,
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'mat_base__mat_code',type:'string'}},
	{col:{header:'*物资名称', width:164, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'mat_base__mat_name',type:'string'}},
	{col:{header:'型号规格', width:161, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:50
		})}, field:{name:'mat_base__mat_size',type:'string'}},
	{col:{header:'计量单位', width:61, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'mat_base__mat_unit',type:'string'}},
	{col:{header:'*类别名称', width:177, sortable:true, editable:false,
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'mat_base__type_name',type:'string'}},
	{col:{header:'类别编号', width:100, sortable:true, editable:false,
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'mat_base__type_code',type:'string'}},
	{col:{header:'类别ID', width:100, sortable:true, hidden:true}, field:{name:'mat_base__type_id',type:'string'}},
	{col:{header:'物资ID', width:100, sortable:true, hidden:true}, field:{name:'mat_base__mat_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'mat_base'
	};
	
	config.initpage = function(gridNode){ 
	var event = gridNode.event;
	
	event.on('beforecreate', function(ge) {
		var myGrid = this.grid;
		//获取当前选择节点属性信息
		var attr = myGrid.treeNodeAttr;
		if( attr == null || !attr.leaf ) {
			JxHint.alert('必须选择最底层物资分类，才能新增物资编码！');	
			myGrid.store.removeAt(0);
			return false;
		}
		
		var node_id = attr.id;
		var node_text = attr.text;
		var node_code = attr.type_code;
		var rec = myGrid.store.getAt(0);
		rec.set('mat_base__type_code', attr.type_code);
		rec.set('mat_base__type_name', attr.text);
		rec.set('mat_base__type_id', attr.id);
		
		return true;
	});
}
		
	return new Jxstar.GridNode(config);
}