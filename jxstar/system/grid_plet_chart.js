Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var charttypeData = Jxstar.findComboData('charttype');

	var cols = [
	{col:{header:'图形名称', width:184, sortable:true}, field:{name:'plet_chart__chart_name',type:'string'}},
	{col:{header:'图形类型', width:125, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: charttypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: charttypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < charttypeData.length; i++) {
				if (charttypeData[i][0] == value)
					return charttypeData[i][1];
			}
		}}, field:{name:'plet_chart__chart_type',type:'string'}},
	{col:{header:'分类字段', width:148, sortable:true}, field:{name:'plet_chart__field_type',type:'string'}},
	{col:{header:'统计字段', width:130, sortable:true}, field:{name:'plet_chart__field_stat',type:'string'}},
	{col:{header:'结果集SQL', width:100, sortable:true, hidden:true}, field:{name:'plet_chart__result_sql',type:'string'}},
	{col:{header:'图形ID', width:100, sortable:true, hidden:true}, field:{name:'plet_chart__chart_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'plet_chart'
	};
	
	
		
	return new Jxstar.GridNode(config);
}