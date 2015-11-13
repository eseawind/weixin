Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var msgstateData = Jxstar.findComboData('msgstate');
	var msgtypeData = Jxstar.findComboData('msgtype');

	var cols = [
	{col:{header:'收件人', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__to_user',type:'string'}},
	{col:{header:'消息状态', width:84, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: msgstateData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: msgstateData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < msgstateData.length; i++) {
				if (msgstateData[i][0] == value)
					return msgstateData[i][1];
			}
		}}, field:{name:'plet_msg__msg_state',type:'string'}},
	{col:{header:'发件人', width:100, sortable:true}, field:{name:'plet_msg__from_user',type:'string'}},
	{col:{header:'发送时间', width:133, sortable:true, renderer:function(value) {
			return value ? value.format('Y-m-d H:i') : '';
		}}, field:{name:'plet_msg__send_date',type:'date'}},
	{col:{header:'消息内容', width:394, sortable:true}, field:{name:'plet_msg__content',type:'string'}},
	{col:{header:'阅读时间', width:100, sortable:true, renderer:function(value) {
			return value ? value.format('Y-m-d H:i') : '';
		}}, field:{name:'plet_msg__read_date',type:'date'}},
	{col:{header:'消息类型', width:100, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: msgtypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: msgtypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < msgtypeData.length; i++) {
				if (msgtypeData[i][0] == value)
					return msgtypeData[i][1];
			}
		}}, field:{name:'plet_msg__msg_type',type:'string'}},
	{col:{header:'消息ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__msg_id',type:'string'}},
	{col:{header:'发件人ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__from_userid',type:'string'}},
	{col:{header:'收件人ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__to_userid',type:'string'}},
	{col:{header:'功能ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__fun_id',type:'string'}},
	{col:{header:'记录ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__data_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'get_msg'
	};
	
	
	config.initpage = function(gridNode){		var event = gridNode.event;		event.on('beforecustom', function(event) {			var records = event.grid.getSelectionModel().getSelections();						for (var i = 0; i < records.length; i++) {				var state = records[i].get('plet_msg__msg_state');				if (state != '1') {					JxHint.alert(jx.sys.hasyesmsg);	//'选择的消息记录中存在“已读”的消息，不能执行已读操作！'					return false;				}			}		});	};	config.eventcfg = {				showfun: function() {			var records = this.grid.getSelectionModel().getSelections();			if (!JxUtil.selectone(records)) return;						var funId = records[0].get('plet_msg__fun_id');			var dataId = records[0].get('plet_msg__data_id');					if (funId.length > 0 && dataId.length > 0) {				JxUtil.showFormData(funId, dataId);			} else {				JxHint.alert('没有关联单据数据！');				}		},				//取发出消息的附件		uploadWhereParam: function() {			var options = {};			var records = this.grid.getSelectionModel().getSelections();			var keyid = records[0].get('plet_msg__msg_id');			if (keyid == null || keyid.length == 0) return;			var keyids = keyid.split('-');						options.where_sql = 'sys_attach.data_id = ? and sys_attach.table_name = ?';			options.where_type = 'string;string';			options.where_value = keyids[0]+';plet_msg';			return options;		}	};
		
	return new Jxstar.GridNode(config);
}