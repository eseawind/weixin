﻿Jxstar.currentPage = function() {
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
					{xtype:'datefield', fieldLabel:'发送时间', name:'plet_msg__send_date', defaultval:'fun_getToday()', format:'Y-m-d H:i', anchor:'100%', readOnly:true},
					{xtype:'trigger', fieldLabel:'阅读部门', name:'plet_msg__dept_name',
						anchor:'100%', triggerClass:'x-form-search-trigger',
						maxLength:50, editable:false,
						onTriggerClick: function() {
							var selcfg = {pageType:'combogrid', nodeId:'sys_dept', layoutPage:'/public/layout/layout_tree.js', sourceField:'sys_dept.dept_name;dept_code;dept_id', targetField:'plet_msg.dept_name;dept_code;dept_id', whereSql:"", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'1',fieldName:'plet_msg.dept_name'};
							JxSelect.createSelectWin(selcfg, this, 'node_send_board_form');
						}},
					{xtype:'hidden', fieldLabel:'编辑人ID', name:'plet_msg__from_userid', defaultval:'fun_getUserId()', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'部门编码', name:'plet_msg__dept_code', anchor:'62%'}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'编辑人', name:'plet_msg__from_user', defaultval:'fun_getUserName()', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'combo', fieldLabel:'公告状态', name:'plet_msg__msg_state', defaultval:'0',
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
					{xtype:'hidden', fieldLabel:'消息类型', name:'plet_msg__msg_type', defaultval:'gg', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'部门ID', name:'plet_msg__dept_id', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'消息ID', name:'plet_msg__msg_id', anchor:'62%'}
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
					{xtype:'textfield', fieldLabel:'公告标题', name:'plet_msg__msg_title', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:50},
					{xtype:'textarea', fieldLabel:'公告内容', name:'plet_msg__content', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:168, maxLength:500}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'send_board'
	};

	config.eventcfg = {		
	
	return new Jxstar.FormNode(config);
}