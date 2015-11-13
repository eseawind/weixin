Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var appstatusData = Jxstar.findComboData('appstatus');

	var cols = [
	{col:{header:'申请状态', width:84, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: appstatusData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: appstatusData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < appstatusData.length; i++) {
				if (appstatusData[i][0] == value)
					return appstatusData[i][1];
			}
		}}, field:{name:'mat_app__app_status',type:'string'}},
	{col:{header:'申请单号', width:125, sortable:true}, field:{name:'mat_app__app_code',type:'string'}},
	{col:{header:'申请日期', width:100, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d') : '';
		}}, field:{name:'mat_app__app_date',type:'date'}},
	{col:{header:'申请部门', width:100, sortable:true}, field:{name:'mat_app__dept_name',type:'string'}},
	{col:{header:'项目名称', width:182, sortable:true}, field:{name:'mat_app__project_name',type:'string'}},
	{col:{header:'申请理由', width:281, sortable:true}, field:{name:'mat_app__app_cause',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, hidden:true}, field:{name:'mat_app__app_id',type:'string'}},
	{col:{header:'申请部门ID', width:100, sortable:true, hidden:true}, field:{name:'mat_app__dept_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'mat_app1'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}