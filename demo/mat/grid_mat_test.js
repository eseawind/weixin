Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataaudit = Jxstar.findComboData('audit');

	var cols = [
	{col:{header:'记录状态', width:76, sortable:true, align:'center',
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
		}}, field:{name:'mat_test__auditing',type:'string'}},
	{col:{header:'测试单号', width:117, sortable:true}, field:{name:'mat_test__test_code',type:'string'}},
	{col:{header:'项目名称', width:197, sortable:true}, field:{name:'mat_test__project_name',type:'string'}},
	{col:{header:'测试负责人', width:100, sortable:true}, field:{name:'mat_test__test_user',type:'string'}},
	{col:{header:'计划天数', width:100, sortable:true, align:'right',renderer:JxUtil.formatInt()}, field:{name:'mat_test__plan_days',type:'int'}},
	{col:{header:'测试费用', width:100, sortable:true, align:'right',renderer:JxUtil.formatNumber(2)}, field:{name:'mat_test__test_money',type:'float'}},
	{col:{header:'计划日期', width:100, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d') : '';
		}}, field:{name:'mat_test__plan_date',type:'date'}},
	{col:{header:'测试工作安排', width:100, sortable:true, hidden:true}, field:{name:'mat_test__work_desc',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_test__test_id',type:'string'}},
	{col:{header:'测试部门', width:100, sortable:true}, field:{name:'mat_test__dept_name',type:'string'}},
	{col:{header:'部门ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_test__dept_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'mat_test'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}