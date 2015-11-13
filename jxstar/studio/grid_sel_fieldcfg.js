Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var tablestateData = Jxstar.findComboData('tablestate');
	var fdatatypeData = Jxstar.findComboData('fdatatype');
	var yesnoData = Jxstar.findComboData('yesno');
	var fieldtypeData = Jxstar.findComboData('fieldtype');

	var cols = [
	{col:{header:'状态', width:65, sortable:true, hidden:true, align:'center',
		renderer:function(value){
			for (var i = 0; i < tablestateData.length; i++) {
				if (tablestateData[i][0] == value)
					return tablestateData[i][1];
			}
		}}, field:{name:'dm_fieldcfg__state',type:'string'}},
	{col:{header:'序号', width:44, sortable:true, renderer:JxUtil.formatInt()}, field:{name:'dm_fieldcfg__field_index',type:'int'}},
	{col:{header:'字段名称', width:122, sortable:true}, field:{name:'dm_fieldcfg__field_name',type:'string'}},
	{col:{header:'字段标题', width:134, sortable:true}, field:{name:'dm_fieldcfg__field_title',type:'string'}},
	{col:{header:'数据类型', width:75, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: fdatatypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: fdatatypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < fdatatypeData.length; i++) {
				if (fdatatypeData[i][0] == value)
					return fdatatypeData[i][1];
			}
		}}, field:{name:'dm_fieldcfg__data_type',type:'string'}},
	{col:{header:'长度', width:41, sortable:true, renderer:JxUtil.formatInt()}, field:{name:'dm_fieldcfg__data_size',type:'int'}},
	{col:{header:'表名称', width:100, sortable:true}, field:{name:'dm_tablecfg__table_name',type:'string'}},
	{col:{header:'表标题', width:132, sortable:true}, field:{name:'dm_tablecfg__table_title',type:'string'}},
	{col:{header:'小数位', width:67, sortable:true, hidden:true, renderer:JxUtil.formatInt()}, field:{name:'dm_fieldcfg__data_scale',type:'int'}},
	{col:{header:'必填?', width:55, sortable:true, hidden:true, align:'center',
		renderer:function(value){
			for (var i = 0; i < yesnoData.length; i++) {
				if (yesnoData[i][0] == value)
					return yesnoData[i][1];
			}
		}}, field:{name:'dm_fieldcfg__nullable',type:'string'}},
	{col:{header:'缺省值', width:71, sortable:true, hidden:true}, field:{name:'dm_fieldcfg__default_value',type:'string'}},
	{col:{header:'等同字段', width:127, sortable:true, hidden:true}, field:{name:'dm_fieldcfg__like_field',type:'string'}},
	{col:{header:'分类', width:67, sortable:true, hidden:true, align:'center',
		renderer:function(value){
			for (var i = 0; i < fieldtypeData.length; i++) {
				if (fieldtypeData[i][0] == value)
					return fieldtypeData[i][1];
			}
		}}, field:{name:'dm_fieldcfg__field_type',type:'string'}},
	{col:{header:'字段说明', width:255, sortable:true, hidden:true}, field:{name:'dm_fieldcfg__field_memo',type:'string'}},
	{col:{header:'字段ID', width:100, sortable:true, hidden:true}, field:{name:'dm_fieldcfg__field_id',type:'string'}},
	{col:{header:'表ID', width:100, sortable:true, hidden:true}, field:{name:'dm_fieldcfg__table_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '0',
		funid: 'sel_fieldcfg'
	};
	
	config.initpage = function(gridNode){
		var event = gridNode.event;
		//导入字段后，修改主表为修改状态
		event.on('afterimport', function(ge) {
			//目标功能外键值
			var parentId = ge.grid.destParentId;
			//目标功能ID
			var destFunId = ge.grid.destNodeId;
			
			if (destFunId == 'dm_fieldcfg' && parentId && parentId.length > 0) {
				var params = 'funid=sel_fieldcfg&pagetype=editgrid&eventcode=impfield&tableid='+ parentId;
				Request.postRequest(params, null);
			}
		});
	};
		
	return new Jxstar.GridNode(config);
}