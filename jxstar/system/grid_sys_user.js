﻿Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataduty_type = Jxstar.findComboData('duty_type');
	var Datausersex = Jxstar.findComboData('usersex');

	var cols = [
	{col:{header:'*姓名', width:65, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:20, allowBlank:false
		})}, field:{name:'sys_user__user_name',type:'string'}},
	{col:{header:'*工 号', width:77, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:20, allowBlank:false
		})}, field:{name:'sys_user__user_code',type:'string'}},
	{col:{header:'*部门名称', width:114, sortable:true, editable:false,
		editor:new Ext.form.TriggerField({
			maxLength:50,
			myeditable:false, allowBlank:false,
			triggerClass:'x-form-search-trigger', 
			onTriggerClick: function() {
				var selcfg = {pageType:'combogrid', nodeId:'sys_dept', layoutPage:'/public/layout/layout_tree.js', sourceField:'sys_dept.dept_name;dept_id', targetField:'sys_dept.dept_name;sys_user.dept_id', whereSql:"", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'1',queryField:'',likeType:'',fieldName:'sys_dept.dept_name'};
				JxSelect.createSelectWin(selcfg, this, 'node_sys_user_editgrid');
			}
		})}, field:{name:'sys_dept__dept_name',type:'string'}},
	{col:{header:'职务分类', width:90, sortable:true, align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataduty_type
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataduty_type[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataduty_type.length; i++) {
				if (Dataduty_type[i][0] == value)
					return Dataduty_type[i][1];
			}
		}}, field:{name:'sys_user__duty_type',type:'string'}},
	{col:{header:'职务', width:85, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:50
		})}, field:{name:'sys_user__duty',type:'string'}},
	{col:{header:'部门负责人？', width:95, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'sys_user__is_leader',type:'string'}},
	{col:{header:'固定电话', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'sys_user__phone_code',type:'string'}},
	{col:{header:'手机号码', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'sys_user__mob_code',type:'string'}},
	{col:{header:'性别', width:34, sortable:true, align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datausersex
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datausersex[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datausersex.length; i++) {
				if (Datausersex[i][0] == value)
					return Datausersex[i][1];
			}
		}}, field:{name:'sys_user__sex',type:'string'}},
	{col:{header:'邮箱', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:50
		})}, field:{name:'sys_user__email',type:'string'}},
	{col:{header:'是否注销', width:62, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'sys_user__is_novalid',type:'string'}},
	{col:{header:'所属角色', width:100, sortable:true}, field:{name:'v_sys_user_role__role_name',type:'string'}},
	{col:{header:'备注', width:172, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:200
		})}, field:{name:'sys_user__memo',type:'string'}},
	{col:{header:'用户ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_user__user_id',type:'string'}},
	{col:{header:'部门ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_user__dept_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'sys_user'
	};
	
	
	config.initpage = function(gridNode){

		setRole: function(){
			var records = this.grid.getSelectionModel().getSelections();
			if (!JxUtil.selectone(records)) return;

		},
	};
		
	return new Jxstar.GridNode(config);
}