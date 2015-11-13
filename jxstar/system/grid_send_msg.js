Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var msgstateData = Jxstar.findComboData('msgstate');
	var msgtypeData = Jxstar.findComboData('msgtype');

	var cols = [
	{col:{header:'消息状态', width:76, sortable:true, align:'center',
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
	{col:{header:'收件人', width:115, sortable:true}, field:{name:'plet_msg__to_user',type:'string'}},
	{col:{header:'发件人', width:115, sortable:true, hidden:true}, field:{name:'plet_msg__from_user',type:'string'}},
	{col:{header:'发送时间', width:136, sortable:true, renderer:function(value) {
			return value ? value.format('Y-m-d H:i') : '';
		}}, field:{name:'plet_msg__send_date',type:'date'}},
	{col:{header:'消息内容', width:370, sortable:true}, field:{name:'plet_msg__content',type:'string'}},
	{col:{header:'阅读时间', width:122, sortable:true, renderer:function(value) {
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
	{col:{header:'发件人ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__from_userid',type:'string'}},
	{col:{header:'消息ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__msg_id',type:'string'}},
	{col:{header:'收件人ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__to_userid',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'send_msg'
	};
	
	config.initpage = function(gridNode){		var event = gridNode.event;		event.on('beforecustom', function(event) {			var records = event.grid.getSelectionModel().getSelections();						for (var i = 0; i < records.length; i++) {				var state = records[i].get('plet_msg__msg_state');				if (state != '0') {					JxHint.alert(jx.sys.hasnomsg);	//'选择的消息记录中存在非“草稿”状态的消息，不能发送消息！'					return false;				}			}		});	};
		
	return new Jxstar.GridNode(config);
}