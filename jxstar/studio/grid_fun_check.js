Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataregstatus = Jxstar.findComboData('regstatus');
	var Datap_settype = Jxstar.findComboData('p_settype');
	var Datap_checktype = Jxstar.findComboData('p_checktype');
	var Datacondtype = Jxstar.findComboData('condtype');

	var cols = [
	{col:{header:'状态', width:65, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataregstatus
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataregstatus[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataregstatus.length; i++) {
				if (Dataregstatus[i][0] == value)
					return Dataregstatus[i][1];
			}
		}}, field:{name:'fun_check__status',type:'string'}},
	{col:{header:'检查项描述', width:230, sortable:true}, field:{name:'fun_check__check_name',type:'string'}},
	{col:{header:'序号', width:52, sortable:true, align:'right',renderer:JxUtil.formatInt()}, field:{name:'fun_check__check_no',type:'int'}},
	{col:{header:'检查失败信息', width:229, sortable:true}, field:{name:'fun_check__faild_desc',type:'string'}},
	{col:{header:'检查扩展Fn', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'fun_check__check_ext',type:'string'}},
	{col:{header:'设置类型', width:82, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datap_settype
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datap_settype[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datap_settype.length; i++) {
				if (Datap_settype[i][0] == value)
					return Datap_settype[i][1];
			}
		}}, field:{name:'fun_check__set_type',type:'string'}},
	{col:{header:'检查项类型', width:81, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datap_checktype
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datap_checktype[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datap_checktype.length; i++) {
				if (Datap_checktype[i][0] == value)
					return Datap_checktype[i][1];
			}
		}}, field:{name:'fun_check__check_type',type:'string'}},
	{col:{header:'事件代号', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'fun_check__event_code',type:'string'}},
	{col:{header:'功能标识', width:100, sortable:true}, field:{name:'fun_check__fun_id',type:'string'}},
	{col:{header:'检查项ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'fun_check__check_id',type:'string'}},
	{col:{header:'检查类名', width:100, sortable:true, hidden:true}, field:{name:'fun_check__class_name',type:'string'}},
	{col:{header:'类方法名', width:100, sortable:true, hidden:true}, field:{name:'fun_check__method_name',type:'string'}},
	{col:{header:'来源值SQL或常量', width:100, sortable:true, hidden:true}, field:{name:'fun_check__src_sql',type:'string'}},
	{col:{header:'比较方法', width:100, sortable:true, hidden:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datacondtype
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datacondtype[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datacondtype.length; i++) {
				if (Datacondtype[i][0] == value)
					return Datacondtype[i][1];
			}
		}}, field:{name:'fun_check__comp_type',type:'string'}},
	{col:{header:'目标值SQL或常量', width:100, sortable:true, hidden:true}, field:{name:'fun_check__dest_sql',type:'string'}},
	{col:{header:'传入请求对象', width:100, sortable:true, hidden:true}, field:{name:'fun_check__use_request',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '0',
		funid: 'fun_check'
	};
	
	
	var renderTask = function(value, metaData, record) {
		var color = value == '0' ? 'green' : 'red'
		var title = value || '';
		var cbo = Jxstar.findComboData('regstatus');
		for (var i = 0; i < cbo.length; i++) {
			if (cbo[i][0] == value) {
				title = cbo[i][1]; break;
			}
		}
		
		var html = '<span style="color:'+ color +'; font-weight:bold;">'+ title +'</span>';
		return html;
	};
	
	for (var i = 0; i < cols.length; i++) {
		if (cols[i].field.name.indexOf('__status') > 0) {
			cols[i].col.renderer = renderTask;
			break;
		}
	}
		
	return new Jxstar.GridNode(config);
}