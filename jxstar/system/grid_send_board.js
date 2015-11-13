﻿Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var msgstateData = Jxstar.findComboData('msgstate');
	var msgtypeData = Jxstar.findComboData('msgtype');

	var cols = [
	{col:{header:'公告状态', width:83, sortable:true, align:'center',
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
	{col:{header:'公告标题', width:226, sortable:true}, field:{name:'plet_msg__msg_title',type:'string'}},
	{col:{header:'发送时间', width:138, sortable:true, renderer:function(value) {
			return value ? value.format('Y-m-d H:i') : '';
		}}, field:{name:'plet_msg__send_date',type:'date'}},
	{col:{header:'编辑人', width:100, sortable:true}, field:{name:'plet_msg__from_user',type:'string'}},
	{col:{header:'公告内容', width:343, sortable:true}, field:{name:'plet_msg__content',type:'string'}},
	{col:{header:'消息类型', width:100, sortable:true, hidden:true, align:'center',
		renderer:function(value){
			for (var i = 0; i < msgtypeData.length; i++) {
				if (msgtypeData[i][0] == value)
					return msgtypeData[i][1];
			}
		}}, field:{name:'plet_msg__msg_type',type:'string'}},
	{col:{header:'编辑人ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__from_userid',type:'string'}},
	{col:{header:'消息ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__msg_id',type:'string'}},
	{col:{header:'部门编码', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__dept_code',type:'string'}},
	{col:{header:'阅读部门', width:100, sortable:true}, field:{name:'plet_msg__dept_name',type:'string'}},
	{col:{header:'部门ID', width:100, sortable:true, hidden:true}, field:{name:'plet_msg__dept_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'send_board'
	};
	
	config.initpage = function(gridNode){		var event = gridNode.event;		event.on('beforecustom', function(event) {			var records = event.grid.getSelectionModel().getSelections();						for (var i = 0; i < records.length; i++) {				var state = records[i].get('plet_msg__msg_state');				if (state != '0') {					JxHint.alert(jx.sys.hasnoboard);	//'选择的记录中存在非“草稿”状态的公告，不能发布！'					return false;				}			}		});	};
		
	return new Jxstar.GridNode(config);
}