Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var notestatusData = Jxstar.findComboData('notestatus');
	var notesrcData = Jxstar.findComboData('notesrc');
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
					{xtype:'textfield', fieldLabel:'手机号码', name:'sys_note__mob_code', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:20},
					{xtype:'textarea', fieldLabel:'短信内容', name:'sys_note__send_msg', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:96, maxLength:200}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'combo', fieldLabel:'消息发送状态', name:'sys_note__send_status', defaultval:'0',
						anchor:'100%', readOnly:true, editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: notestatusData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: notestatusData[0][0]},
					{xtype:'datefield', fieldLabel:'发送时间', name:'sys_note__send_date', defaultval:'fun_getToday()', format:'Y-m-d H:i', anchor:'100%', readOnly:true},
					{xtype:'combo', fieldLabel:'发送来源', name:'sys_note__send_src', defaultval:'user',
						anchor:'100%', readOnly:true, editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: notesrcData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: notesrcData[0][0]},
					{xtype:'textfield', fieldLabel:'发送人', name:'sys_note__send_user', defaultval:'fun_getUserName()', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'textfield', fieldLabel:'接收用户', name:'sys_note__user_name', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'hidden', fieldLabel:'来源记录ID', name:'sys_note__send_srcid', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'短信ID', name:'sys_note__note_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'功能ID', name:'sys_note__fun_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'接收用户ID', name:'sys_note__user_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'数据ID', name:'sys_note__data_id', anchor:'100%'}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'sys_note'
	};

	
	
	return new Jxstar.FormNode(config);
}