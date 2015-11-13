Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var Dataaudit = Jxstar.findComboData('audit');
	var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		style:'padding:5 10 5 10;',
		items:[{
			anchor:'100%',
			border:false,
			layout:'column',
			border:true,
			xtype:'fieldset',
			title:'计划信息',
			collapsible:false,
			collapsed:false,
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'客户名称', name:'mat_app__project_name', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:50},
					{xtype:'textfield', fieldLabel:'计划说明', name:'mat_app__app_cause', anchor:'100%', maxLength:200},
					{xtype:'textfield', fieldLabel:'计划单号', name:'mat_app__app_code', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'hidden', fieldLabel:'主键', name:'mat_app__app_id', anchor:'100%'}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'datefield', fieldLabel:'制单日期', name:'mat_app__app_date', defaultval:'fun_getToday()', format:'Y-m-d', anchor:'100%'},
					{xtype:'textfield', fieldLabel:'计划人', name:'mat_app__app_user', defaultval:'fun_getUserName()', anchor:'100%', maxLength:20},
					{xtype:'combo', fieldLabel:'记录状态', name:'mat_app__auditing', defaultval:'0',
						anchor:'100%', readOnly:true, editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Dataaudit
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Dataaudit[0][0]},
					{xtype:'hidden', fieldLabel:'计划人ID', name:'mat_app__app_userid', defaultval:'fun_getUserId()', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'申请类型', name:'mat_app__app_type', defaultval:'4', anchor:'100%'}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'mat_size_stock'
	};

	config.param.formWidth = '100%';
	config.param.subResizable = true;
	config.param.subConfig = { height:300};
	JxFormSub.formAddSub(config);

	
	
	return new Jxstar.FormNode(config);
}