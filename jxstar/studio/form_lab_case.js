Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var Datadatasrc = Jxstar.findComboData('datasrc');
	var Dataregstatus = Jxstar.findComboData('regstatus');
	var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		style:'padding:5 10 5 10;',
		items:[{
			border:true,
			xtype:'fieldset',
			title:'方案信息',
			collapsible:false,
			collapsed:false,
			items:[{
			anchor:'100%',
			border:false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'numberfield', decimalPrecision:0, fieldLabel:'序号', name:'lab_case__case_index', anchor:'100%', maxLength:22},
					{xtype:'combo', fieldLabel:'来源类型', name:'lab_case__data_type', defaultval:'sql',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Datadatasrc
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Datadatasrc[0][0]}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'方案名称', name:'lab_case__case_name', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:50},
					{xtype:'combo', fieldLabel:'状态', name:'lab_case__auditing', defaultval:'0',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Dataregstatus
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Dataregstatus[0][0]},
					{xtype:'hidden', fieldLabel:'主键', name:'lab_case__case_id', anchor:'100%'}
				]
			}
			]
		},{
			anchor:'100%',
			border:false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.99,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textarea', fieldLabel:'数据来源定义', name:'lab_case__data_src', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:96, maxLength:1000}
				]
			}
			]
		}]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'lab_case'
	};

	config.param.subConfig = {anchor:'', width:800};
	JxFormSub.formAddSub(config);

	
	
	return new Jxstar.FormNode(config);
}