Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var numtypeData = Jxstar.findComboData('numtype');

	var cols = [
	{col:{header:'指标名称', width:131, sortable:true}, field:{name:'plet_kpi__kpi_name',type:'string'}},
	{col:{header:'值类型', width:75, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: numtypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: numtypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < numtypeData.length; i++) {
				if (numtypeData[i][0] == value)
					return numtypeData[i][1];
			}
		}}, field:{name:'plet_kpi__value_type',type:'string'}},
	{col:{header:'目标值', width:100, sortable:true, renderer:JxUtil.formatNumber(2)}, field:{name:'plet_kpi__mb_value',type:'float'}},
	{col:{header:'注意值', width:100, sortable:true, renderer:JxUtil.formatNumber(2)}, field:{name:'plet_kpi__zy_value',type:'float'}},
	{col:{header:'报警值', width:100, sortable:true, renderer:JxUtil.formatNumber(2)}, field:{name:'plet_kpi__bj_value',type:'float'}},
	{col:{header:'统计SQL', width:100, sortable:true, hidden:true}, field:{name:'plet_kpi__kpi_sql',type:'string'}},
	{col:{header:'指标ID', width:100, sortable:true, hidden:true}, field:{name:'plet_kpi__kpi_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'plet_kpi'
	};
	
	
		
	return new Jxstar.GridNode(config);
}