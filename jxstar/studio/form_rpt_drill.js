Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
		var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		xtype:'container',
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
					{xtype:'textfield', fieldLabel:'功能ID', name:'rpt_drill__fun_id', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:25}
				]
			}
			]
		},{
			anchor:'100%',
			border:false,
			xtype:'container',
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				xtype:'container',
				columnWidth:0.99,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textarea', fieldLabel:'显示WhereSql', name:'rpt_drill__where_sql', width:'100%', height:72, maxLength:400},
					{xtype:'textfield', fieldLabel:'显示WhereType', name:'rpt_drill__where_type', anchor:'100%', maxLength:200},
					{xtype:'textfield', fieldLabel:'显示WhereValue', name:'rpt_drill__where_value', anchor:'100%', maxLength:200},
					{xtype:'hidden', fieldLabel:'主键', name:'rpt_drill__drill_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'区域ID', name:'rpt_drill__area_id', anchor:'100%'}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'rpt_drill'
	};

	
	
	
	return new Jxstar.FormNode(config);
}