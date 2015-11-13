Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataeventext = Jxstar.findComboData('eventext');
	var Dataregstatus = Jxstar.findComboData('regstatus');

	var cols = [
	{col:{header:'*类名(含包名)', width:284, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:1000, allowBlank:false
		})}, field:{name:'fun_event_invoke__module_name',type:'string'}},
	{col:{header:'*方法名', width:100, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:1000, allowBlank:false
		})}, field:{name:'fun_event_invoke__method_name',type:'string'}},
	{col:{header:'序号', width:50, sortable:true, defaultval:'1', align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			decimalPrecision:0, maxLength:22
		}),renderer:JxUtil.formatInt()}, field:{name:'fun_event_invoke__invoke_index',type:'int'}},
	{col:{header:'系统事件代码', width:90, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:1000
		})}, field:{name:'fun_event_invoke__event_code',type:'string'}},
	{col:{header:'扩展位置', width:79, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataeventext
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataeventext[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataeventext.length; i++) {
				if (Dataeventext[i][0] == value)
					return Dataeventext[i][1];
			}
		}}, field:{name:'fun_event_invoke__position',type:'string'}},
	{col:{header:'调用ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'fun_event_invoke__invoke_id',type:'string'}},
	{col:{header:'事件ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'fun_event_invoke__event_id',type:'string'}},
	{col:{header:'状态', width:52, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
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
		}}, field:{name:'fun_event_invoke__status',type:'string'}},
	{col:{header:'类说明', width:221, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:1000
		})}, field:{name:'fun_event_invoke__invoke_memo',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '0',
		funid: 'event_invoke'
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