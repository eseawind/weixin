Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'物资编码', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			maxLength:1000, name:'mat_base__mat_code', 
			editable:true, hcss:'color:#3039b4;',
			triggerClass:'x-form-search-trigger', 
			listeners:{afterrender: function(combo) {
				JxSelect.initCombo('mat_appdet', combo, 'node_mat_appdet_editgrid');
			}}
		})}, field:{name:'mat_base__mat_code',type:'string'}},
	{col:{header:'物资名称', width:136, sortable:true}, field:{name:'mat_base__mat_name',type:'string'}},
	{col:{header:'型号规格', width:98, sortable:true}, field:{name:'mat_base__mat_size',type:'string'}},
	{col:{header:'计量单位', width:70, sortable:true}, field:{name:'mat_base__mat_unit',type:'string'}},
	{col:{header:'*申请数量', width:84, sortable:true, defaultval:'1', align:'right',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.NumberField({
			maxLength:22, allowBlank:false
		}),renderer:JxUtil.formatNumber(2)}, field:{name:'mat_appdet__mat_num',type:'float'}},
	{col:{header:'*计划单价(万元)', width:115, sortable:true, defaultval:'0', align:'right',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.NumberField({
			maxLength:22, allowBlank:false
		}),renderer:JxUtil.formatNumber(2)}, field:{name:'mat_appdet__mat_price',type:'float'}},
	{col:{header:'预算金额(万元)', width:120, sortable:true, defaultval:'0', align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			decimalPrecision:6, maxLength:22
		}),renderer:JxUtil.formatNumber(6)}, field:{name:'mat_appdet__mat_money',type:'float'}},
	{col:{header:'类别名称', width:153, sortable:true, hidden:true}, field:{name:'mat_base__type_name',type:'string'}},
	{col:{header:'物资ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_appdet__mat_id',type:'string'}},
	{col:{header:'类别ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_base__type_id',type:'string'}},
	{col:{header:'明细ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_appdet__det_id',type:'string'}},
	{col:{header:'申请单ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_appdet__app_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '0',
		funid: 'mat_appdet'
	};
	
	config.param.substat = true;

	config.initpage = function(gridNode) {
		var grid = gridNode.page;
		
		var calu = function(record, field1, field2, field3) {
			var value = record.get(field1) * record.get(field2);
			record.set(field3, value);
		};
		
		//金额 = 数量 * 单价;
		grid.on('afteredit', function(e){
			if (e.field == 'mat_appdet__mat_num' || e.field == 'mat_appdet__mat_price') {
				calu(e.record, 'mat_appdet__mat_num', 'mat_appdet__mat_price', 'mat_appdet__mat_money');
			}
		});
	};
		
	return new Jxstar.GridNode(config);
}