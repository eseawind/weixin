Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var auditData = Jxstar.findComboData('audit');

	var cols = [
	{col:{header:'记录状态', width:68, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: auditData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: auditData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < auditData.length; i++) {
				if (auditData[i][0] == value)
					return auditData[i][1];
			}
		}}, field:{name:'sys_proxy__auditing',type:'string'}},
	{col:{header:'代理人账号', width:87, sortable:true}, field:{name:'sys_proxy__user_code',type:'string'}},
	{col:{header:'代理人', width:55, sortable:true}, field:{name:'sys_proxy__user_name',type:'string'}},
	{col:{header:'被代理人账号', width:100, sortable:true}, field:{name:'sys_proxy__to_user_code',type:'string'}},
	{col:{header:'被代理人', width:64, sortable:true}, field:{name:'sys_proxy__to_user_name',type:'string'}},
	{col:{header:'代理结束日期', width:116, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d') : '';
		}}, field:{name:'sys_proxy__end_date',type:'date'}},
	{col:{header:'代理开始日期', width:111, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d') : '';
		}}, field:{name:'sys_proxy__start_date',type:'date'}},
	{col:{header:'设置人', width:57, sortable:true}, field:{name:'sys_proxy__set_user',type:'string'}},
	{col:{header:'设置日期', width:100, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d') : '';
		}}, field:{name:'sys_proxy__set_date',type:'date'}},
	{col:{header:'设置说明', width:165, sortable:true}, field:{name:'sys_proxy__set_memo',type:'string'}},
	{col:{header:'代理人ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_proxy__user_id',type:'string'}},
	{col:{header:'被代理人ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_proxy__to_user_id',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_proxy__proxy_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'sys_proxy'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}