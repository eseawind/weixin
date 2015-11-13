Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var appstatusData = Jxstar.findComboData('appstatus');
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
					{xtype:'textfield', fieldLabel:'申请单号', name:'mat_app__app_code', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'textfield', fieldLabel:'申请部门', name:'mat_app__dept_name', defaultval:'fun_getDeptName()', anchor:'100%', maxLength:50},
					{xtype:'hidden', fieldLabel:'主键', name:'mat_app__app_id', anchor:'100%'}
				]
			},{
				border:false,
				xtype:'container',
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'datefield', fieldLabel:'申请日期', name:'mat_app__app_date', defaultval:'fun_getToday()', format:'Y-m-d', anchor:'100%'},
					{xtype:'combo', fieldLabel:'申请状态', name:'mat_app__app_status', defaultval:'10',
						anchor:'100%', readOnly:true, editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: appstatusData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: appstatusData[0][0]},
					{xtype:'hidden', fieldLabel:'申请部门ID', name:'mat_app__dept_id', defaultval:'fun_getDeptId()', anchor:'100%'}
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
					{xtype:'textfield', fieldLabel:'项目名称', name:'mat_app__project_name', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:50},
					{xtype:'textarea', fieldLabel:'申请理由', name:'mat_app__app_cause', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:72, maxLength:200}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'mat_app1'
	};

	
	
	
	return new Jxstar.FormNode(config);
}