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
			border:true,
			xtype:'fieldset',
			title:'消息内容',
			collapsible:false,
			collapsed:false,
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
					{xtype:'trigger', fieldLabel:'收件人', name:'plet_msg__to_user',
						anchor:'100%', triggerClass:'x-form-search-trigger',
						maxLength:20, editable:false,
						onTriggerClick: function() {
							var selcfg = {pageType:'combogrid', nodeId:'sys_user', layoutPage:'/public/layout/layout_tree.js', sourceField:'sys_user.user_name;user_id', targetField:'plet_msg.to_user;to_userid', whereSql:"", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'1',queryField:'',likeType:'',fieldName:'plet_msg.to_user'};
							JxSelect.createSelectWin(selcfg, this, 'node_send_msg_form');
						}},
					{xtype:'textfield', fieldLabel:'发件人', name:'plet_msg__from_user', defaultval:'fun_getUserName()', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'hidden', fieldLabel:'消息类型', name:'plet_msg__msg_type', defaultval:'man', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'发件人ID', name:'plet_msg__from_userid', defaultval:'fun_getUserId()', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'消息ID', name:'plet_msg__msg_id', anchor:'62%'}
				]
			},{
				border:false,
				xtype:'container',
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'datefield', fieldLabel:'发送时间', name:'plet_msg__send_date', defaultval:'fun_getToday()', format:'Y-m-d H:i', anchor:'100%', readOnly:true},
					{xtype:'datefield', fieldLabel:'阅读时间', name:'plet_msg__read_date', format:'Y-m-d H:i', anchor:'100%', readOnly:true},
					{xtype:'hidden', fieldLabel:'消息状态', name:'plet_msg__msg_state', defaultval:'0', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'收件人ID', name:'plet_msg__to_userid', anchor:'62%'}
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
					{xtype:'textarea', fieldLabel:'消息内容', name:'plet_msg__content', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:72, maxLength:500}
				]
			}
			]
		}]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'send_msg'
	};

	config.param.labelWidth = 60;
	JxFormSub.formAddSub(config);

	config.eventcfg = {				send: function() {			var keyid = this.getPkField().getValue();			if (keyid == null || keyid.length == 0) {				JxHint.alert(jx.event.nosave);				return;			}						var self = this;			var hdcall = function() {				//回调函数				var endcall = function(data) {					var g = self.form.myGrid;					if (g) g.getStore().reload();									var win = self.page.ownerCt;					if (win.getXType() == 'window') {						win.close();					}				};							//设置请求的参数				var params = 'funid='+ self.define.nodeid +'&keyid=' + keyid;				params += JxUtil.getFormValues(self.form);				params += '&pagetype=form&eventcode=send';				//发送请求				Request.postRequest(params, endcall);			};			//'确定发送消息吗？'			Ext.Msg.confirm(jx.base.hint, jx.sys.sendyes, function(btn) {				if (btn == "yes") hdcall();			});		}			};
	
	return new Jxstar.FormNode(config);
}