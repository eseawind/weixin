Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataaudit = Jxstar.findComboData('audit');

	var cols = [
	{col:{header:'记录状态', width:91, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataaudit
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataaudit[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataaudit.length; i++) {
				if (Dataaudit[i][0] == value)
					return Dataaudit[i][1];
			}
		}}, field:{name:'mat_app__auditing',type:'string'}},
	{col:{header:'计划单号', width:100, sortable:true}, field:{name:'mat_app__app_code',type:'string'}},
	{col:{header:'客户名称', width:179, sortable:true}, field:{name:'mat_app__project_name',type:'string'}},
	{col:{header:'制单日期', width:100, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d') : '';
		}}, field:{name:'mat_app__app_date',type:'date'}},
	{col:{header:'计划人', width:100, sortable:true}, field:{name:'mat_app__app_user',type:'string'}},
	{col:{header:'计划说明', width:205, sortable:true}, field:{name:'mat_app__app_cause',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_app__app_id',type:'string'}},
	{col:{header:'计划人ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_app__app_userid',type:'string'}},
	{col:{header:'申请类型', width:100, sortable:true, hidden:true}, field:{name:'mat_app__app_type',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'mat_size_stock'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}