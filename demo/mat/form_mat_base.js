Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
		var items = [{
		height: '97%',
		width: '97%',
		border: false,
		layout: 'form',
		style: 'padding:10px;',
		items: [{
			anchor:'100%',
			border: false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'物资编码', name:'mat_base__mat_code', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'textfield', fieldLabel:'型号规格', name:'mat_base__mat_size', anchor:'100%', maxLength:50},
					{xtype:'textfield', fieldLabel:'类别编号', name:'mat_base__type_code', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'hidden', fieldLabel:'类别ID', name:'mat_base__type_id', anchor:'100%'}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'物资名称', name:'mat_base__mat_name', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:50},
					{xtype:'textfield', fieldLabel:'计量单位', name:'mat_base__mat_unit', anchor:'100%', maxLength:20},
					{xtype:'textfield', fieldLabel:'类别名称', name:'mat_base__type_name', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', readOnly:true, anchor:'100%', maxLength:50},
					{xtype:'hidden', fieldLabel:'物资ID', name:'mat_base__mat_id', anchor:'100%'}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'mat_base'
	};

	
	
	return new Jxstar.FormNode(config);
}