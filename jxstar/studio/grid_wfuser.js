Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var yesnoData = Jxstar.findComboData('yesno');

	var cols = [
	{col:{header:'用户编码', width:83, sortable:true}, field:{name:'sys_user__user_code',type:'string'}},
	{col:{header:'分配用户', width:84, sortable:true, editable:false,
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'wf_user__user_name',type:'string'}},
	{col:{header:'用户组', width:164, sortable:true, hidden:true}, field:{name:'wf_user__group_name',type:'string'}},
	{col:{header:'部门编码', width:100, sortable:true, hidden:true}, field:{name:'sys_dept__dept_code',type:'string'}},
	{col:{header:'部门名称', width:124, sortable:true}, field:{name:'sys_dept__dept_name',type:'string'}},
	{col:{header:'是否定制类', width:70, sortable:true, hidden:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: yesnoData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: yesnoData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < yesnoData.length; i++) {
				if (yesnoData[i][0] == value)
					return yesnoData[i][1];
			}
		}}, field:{name:'wf_user__use_class',type:'string'}},
	{col:{header:'分配条件', width:256, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:1000
		})}, field:{name:'wf_user__cond_where',type:'string'}},
	{col:{header:'升级用户', width:83, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TriggerField({
			maxLength:20,
			editable:false,
			triggerClass:'x-form-search-trigger', 
			onTriggerClick: function() {
				var selcfg = {pageType:'combogrid', nodeId:'sys_user', layoutPage:'/public/layout/layout_tree.js', sourceField:'sys_user.user_name;user_id', targetField:'wf_user.up_user;up_userid', whereSql:"sys_user.is_novalid = '0'", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'1',queryField:'',likeType:'',fieldName:'wf_user.up_user'};
				JxSelect.createSelectWin(selcfg, this, 'node_wf_user_editgrid');
			}
		})}, field:{name:'wf_user__up_user',type:'string'}},
	{col:{header:'任务属性ID', width:100, sortable:true, hidden:true}, field:{name:'wf_user__nodeattr_id',type:'string'}},
	{col:{header:'用户组ID', width:100, sortable:true, hidden:true}, field:{name:'wf_user__group_id',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, hidden:true}, field:{name:'wf_user__wfuser_id',type:'string'}},
	{col:{header:'升级用户ID', width:100, sortable:true, hidden:true}, field:{name:'wf_user__up_userid',type:'string'}},
	{col:{header:'用户ID', width:100, sortable:true, hidden:true}, field:{name:'wf_user__user_id',type:'string'}},
	{col:{header:'过程ID', width:100, sortable:true, hidden:true}, field:{name:'wf_user__process_id',type:'string'}},
	{col:{header:'节点ID', width:100, sortable:true, hidden:true}, field:{name:'wf_user__node_id',type:'string'}},
	{col:{header:'部门ID', width:100, sortable:true, hidden:true}, field:{name:'sys_dept__dept_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '0',
		funid: 'wf_user'
	};
	
	
	config.initpage = function(pageNode){		var event = pageNode.event;		event.on('beforeimport', function(){		var fkValue = pageNode.page.fkValue;		if (!fkValue) {			JxHint.alert(jx.util.selectno);			return false;		}		return true;	});
};
		
	return new Jxstar.GridNode(config);
}