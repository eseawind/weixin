Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var msgstateData = Jxstar.findComboData('msgstate');
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
					{xtype:'textfield', fieldLabel:'发件人', name:'plet_msg__from_user', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'textfield', fieldLabel:'阅读部门', name:'plet_msg__dept_name', readOnly:true, anchor:'100%', maxLength:50},
					{xtype:'datefield', fieldLabel:'阅读时间', name:'plet_read__read_date', format:'Y-m-d H:i', anchor:'100%', readOnly:true},
					{xtype:'hidden', fieldLabel:'部门编码', name:'plet_msg__dept_code', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'部门ID', name:'plet_msg__dept_id', anchor:'62%'}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'datefield', fieldLabel:'发送时间', name:'plet_msg__send_date', format:'Y-m-d H:i', anchor:'100%', readOnly:true},
					{xtype:'textfield', fieldLabel:'收件人', name:'plet_read__user_name', readOnly:true, anchor:'100%', maxLength:100},
					{xtype:'combo', fieldLabel:'消息状态', name:'plet_msg__msg_state',
						anchor:'100%', readOnly:true, editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: msgstateData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: msgstateData[0][0]},
					{xtype:'hidden', fieldLabel:'消息ID', name:'plet_msg__msg_id', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'消息类型', name:'plet_msg__msg_type', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'用户ID', name:'plet_read__user_id', anchor:'62%'}
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
					{xtype:'textfield', fieldLabel:'公告标题', name:'plet_msg__msg_title', readOnly:true, anchor:'100%', maxLength:50},
					{xtype:'textarea', fieldLabel:'公告内容', name:'plet_msg__content', readOnly:true, width:'100%', height:96, maxLength:500}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'get_board'
	};

	
	
	return new Jxstar.FormNode(config);
}