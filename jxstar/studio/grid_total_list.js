Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var repttypeData = Jxstar.findComboData('repttype');
	var yesnoData = Jxstar.findComboData('yesno');

	var cols = [
	{col:{header:'序号', width:56, sortable:true, align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			maxLength:12
		}),renderer:JxUtil.formatInt()}, field:{name:'rpt_list__report_index',type:'int'}},
	{col:{header:'*报表名称', width:216, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'rpt_list__report_name',type:'string'}},
	{col:{header:'模板文件', width:235, sortable:true, hidden:true}, field:{name:'rpt_list__report_file',type:'string'}},
	{col:{header:'*所属功能', width:134, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:25, allowBlank:false
		})}, field:{name:'rpt_list__fun_id',type:'string'}},
	{col:{header:'*所属模块', width:100, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:25, allowBlank:false
		})}, field:{name:'rpt_list__module_id',type:'string'}},
	{col:{header:'报表样式', width:79, sortable:true, defaultval:'total2', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: repttypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: repttypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < repttypeData.length; i++) {
				if (repttypeData[i][0] == value)
					return repttypeData[i][1];
			}
		}}, field:{name:'rpt_list__report_type',type:'string'}},
	{col:{header:'缺省?', width:48, sortable:true, hidden:true, defaultval:'1', align:'center',
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
		}}, field:{name:'rpt_list__is_default',type:'string'}},
	{col:{header:'自定义报表类', width:136, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:100
		})}, field:{name:'rpt_list__custom_class',type:'string'}},
	{col:{header:'报表备注', width:189, sortable:true, hidden:true}, field:{name:'rpt_list__report_memo',type:'string'}},
	{col:{header:'报表ID', width:100, sortable:true, hidden:true}, field:{name:'rpt_list__report_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'total_list'
	};
	
	
	config.initpage = function(gridNode){
		var event = gridNode.event;
		event.on('beforecreate', function(event) {
			var page = event.grid;
			var attr = page.treeNodeAttr;
			if (attr) {
				var record = page.getStore().getAt(0);
				record.set('rpt_list__module_id', attr.id);
			}
		});
	};
		
	return new Jxstar.GridNode(config);
}