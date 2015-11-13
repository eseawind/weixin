Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var msgtypeData = Jxstar.findComboData('msgtype');
	var msgstateData = Jxstar.findComboData('msgstate');
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
					{xtype:'textfield', fieldLabel:'发件人', name:'plet_msg__from_user', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'textfield', fieldLabel:'收件人', name:'plet_msg__to_user', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'combo', fieldLabel:'消息类型', name:'plet_msg__msg_type',
						anchor:'100%', readOnly:true, editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: msgtypeData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: msgtypeData[0][0]},
					{xtype:'hidden', fieldLabel:'收件人ID', name:'plet_msg__to_userid', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'记录ID', name:'plet_msg__data_id', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'功能ID', name:'plet_msg__fun_id', anchor:'62%'}
				]
			},{
				border:false,
				xtype:'container',
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'datefield', fieldLabel:'发送时间', name:'plet_msg__send_date', format:'Y-m-d H:i', anchor:'100%', readOnly:true},
					{xtype:'datefield', fieldLabel:'阅读时间', name:'plet_msg__read_date', format:'Y-m-d H:i', anchor:'100%', readOnly:true},
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
					{xtype:'hidden', fieldLabel:'发件人ID', name:'plet_msg__from_userid', anchor:'62%'}
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
					{xtype:'textarea', fieldLabel:'消息内容', name:'plet_msg__content', readOnly:true, width:'100%', height:144, maxLength:500}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'get_msg'
	};

	
	config.eventcfg = {				back: function() {			var msgType = this.form.findField('plet_msg__msg_type').getValue();			if (msgType != 'man') {				JxHint.alert(jx.sys.noman);	//'不是个人发送的消息，不能回复！'				return false;			}			//发件人ID			var fromUserId = this.form.findField('plet_msg__from_userid').getValue();			//发件人			var fromUserName = this.form.findField('plet_msg__from_user').getValue();						//打开发送消息的对话框后新增记录			var hdcall = function(page) {				page.formNode.event.create();				//回复发件人				page.getForm().set('plet_msg__to_userid', fromUserId);				page.getForm().set('plet_msg__to_user', fromUserName);			};						Jxstar.showData({				filename: '/jxstar/system/form_send_msg.js',				pagetype: 'sendform',				title: jx.plet.sendmsg,	//'发送消息'				callback: hdcall			});		},				showfun: function() {			var funId = this.form.findField('plet_msg__fun_id').getValue();			var dataId = this.form.findField('plet_msg__data_id').getValue();					if (funId.length > 0 && dataId.length > 0) {				JxUtil.showFormData(funId, dataId);			}		},				//取发出消息的附件		uploadWhereParam: function() {			var options = {};			var keyid = this.getPkField().getValue();			if (keyid == null || keyid.length == 0) return;			var keyids = keyid.split('-');						options.where_sql = 'sys_attach.data_id = ? and sys_attach.table_name = ?';			options.where_type = 'string;string';			options.where_value = keyids[0]+';plet_msg';			return options;		}	};
	
	return new Jxstar.FormNode(config);
}