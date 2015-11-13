Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var yesnoData = Jxstar.findComboData('yesno');
	var tablestateData = Jxstar.findComboData('tablestate');
	var fdatatypeData = Jxstar.findComboData('fdatatype');
	var fieldtypeData = Jxstar.findComboData('fieldtype');
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
				columnWidth:0.33,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'numberfield', allowDecimals:false, fieldLabel:'序号', name:'dm_fieldcfg__field_index', defaultval:'10', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:12},
					{xtype:'textfield', fieldLabel:'字段名称', name:'dm_fieldcfg__field_name', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:50},
					{xtype:'numberfield', allowDecimals:false, fieldLabel:'长度', name:'dm_fieldcfg__data_size', defaultval:'50', anchor:'100%', maxLength:12},
					{xtype:'textfield', fieldLabel:'缺省值', name:'dm_fieldcfg__default_value', anchor:'100%', maxLength:20},
					{xtype:'hidden', fieldLabel:'字段ID', name:'dm_fieldcfg__field_id', anchor:'100%'}
				]
			},{
				border:false,
				columnWidth:0.33,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'emptybox'},
					{xtype:'textfield', fieldLabel:'字段标题', name:'dm_fieldcfg__field_title', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:50},
					{xtype:'numberfield', allowDecimals:false, fieldLabel:'小数位', name:'dm_fieldcfg__data_scale', anchor:'100%', maxLength:12},
					{xtype:'combo', fieldLabel:'必填?', name:'dm_fieldcfg__nullable', defaultval:'0',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: yesnoData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: yesnoData[0][0]},
					{xtype:'hidden', fieldLabel:'表ID', name:'dm_fieldcfg__table_id', anchor:'100%'}
				]
			},{
				border:false,
				columnWidth:0.33,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'combo', fieldLabel:'状态', name:'dm_fieldcfg__state', defaultval:'1',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: tablestateData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: tablestateData[0][0]},
					{xtype:'combo', fieldLabel:'数据类型', name:'dm_fieldcfg__data_type', defaultval:'varchar',
						anchor:'100%', editable:false, allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*',
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: fdatatypeData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: fdatatypeData[0][0]},
					{xtype:'textfield', fieldLabel:'等同字段', name:'dm_fieldcfg__like_field', anchor:'100%', maxLength:50},
					{xtype:'combo', fieldLabel:'分类', name:'dm_fieldcfg__field_type', defaultval:'0',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: fieldtypeData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: fieldtypeData[0][0]}
				]
			}
			]
		},{
			anchor:'100%',
			border: false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.99,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textarea', fieldLabel:'字段说明', name:'dm_fieldcfg__field_memo', width:'100%', height:96, maxLength:1000}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'dm_fieldcfg_rep'
	};

	
	
	return new Jxstar.FormNode(config);
}