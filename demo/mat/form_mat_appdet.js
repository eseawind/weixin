Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
		var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		style:'padding:5 10 5 10;',
		items:[{
			anchor:'100%',
			border:false,
			xtype:'container',
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				xtype:'container',
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'combo', fieldLabel:'物资编码', name:'mat_base__mat_code',
						anchor:'100%', triggerClass:'x-form-search-trigger',
						maxLength:1000, allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', editable:true,
						listeners:{afterrender: function(combo) {
							JxSelect.initCombo('mat_appdet', combo, 'node_mat_appdet_form');
						}}},
					{xtype:'numberfield', decimalPrecision:2, fieldLabel:'计划单价(万元)', name:'mat_appdet__mat_price', defaultval:'0', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:12},
					{xtype:'textfield', fieldLabel:'物资名称', name:'mat_base__mat_name', readOnly:true, anchor:'100%', maxLength:1000},
					{xtype:'textfield', fieldLabel:'计量单位', name:'mat_base__mat_unit', readOnly:true, anchor:'100%', maxLength:1000},
					{xtype:'hidden', fieldLabel:'类别ID', name:'mat_base__type_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'明细ID', name:'mat_appdet__det_id', anchor:'100%'}
				]
			},{
				border:false,
				xtype:'container',
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'numberfield', decimalPrecision:2, fieldLabel:'申请数量', name:'mat_appdet__mat_num', defaultval:'1', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:12},
					{xtype:'numberfield', decimalPrecision:6, fieldLabel:'预算金额(万元)', name:'mat_appdet__mat_money', defaultval:'0', anchor:'100%', maxLength:12},
					{xtype:'textfield', fieldLabel:'型号规格', name:'mat_base__mat_size', readOnly:true, anchor:'100%', maxLength:1000},
					{xtype:'textfield', fieldLabel:'类别名称', name:'mat_base__type_name', readOnly:true, anchor:'100%', maxLength:1000},
					{xtype:'hidden', fieldLabel:'申请单ID', name:'mat_appdet__app_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'物资ID', name:'mat_appdet__mat_id', anchor:'100%'}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'mat_appdet'
	};

	
	
	
	return new Jxstar.FormNode(config);
}