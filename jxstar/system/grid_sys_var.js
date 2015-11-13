Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'*属性编码', width:166, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:100, allowBlank:false
		})}, field:{name:'sys_var__var_code',type:'string'}},
	{col:{header:'*属性名称', width:477, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:100, allowBlank:false
		})}, field:{name:'sys_var__var_name',type:'string'}},
	{col:{header:'属性值', width:172, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:100
		})}, field:{name:'sys_var__var_value',type:'string'}},
	{col:{header:'属性描述', width:274, sortable:true, hidden:true}, field:{name:'sys_var__var_memo',type:'string'}},
	{col:{header:'属性ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_var__var_id',type:'string'}},
	{col:{header:'用于页面?', width:75, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'sys_var__use_page',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'sys_var'
	};
	
	
	config.eventcfg = {					readKey: function() {			//设置请求的参数			var params = 'funid=sys_var&pagetype=editgrid&eventcode=read_key';			var endcall = function(data) {				JxHint.alert('序列号：' + data.key);			};			//发送请求			Request.postRequest(params, endcall);		}, 				readInfo: function() {			//设置请求的参数			var params = 'funid=sys_var&pagetype=editgrid&eventcode=read_info';			var endcall = function(data) {				JxHint.alert(data.info);			};			//发送请求			Request.postRequest(params, endcall);		}	};
		
	return new Jxstar.GridNode(config);
}