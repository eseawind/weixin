Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Datafun_module = Jxstar.findComboData('fun_module');
	var Datatabletype = Jxstar.findComboData('tabletype');

	var cols = [
	{col:{header:'表名', width:260, sortable:true}, field:{name:'c17_table_info__table_name',type:'string'}},
	{col:{header:'表备注', width:192, sortable:true}, field:{name:'c17_table_info__comments',type:'string'}},
	{col:{header:'功能模块', width:100, sortable:true, align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datafun_module
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datafun_module[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datafun_module.length; i++) {
				if (Datafun_module[i][0] == value)
					return Datafun_module[i][1];
			}
		}}, field:{name:'c17_table_info__fun_module',type:'string'}},
	{col:{header:'*同步', width:67, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'c17_table_info__syn_flag',type:'string'}},
	{col:{header:'*序号', width:59, sortable:true, align:'right',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.NumberField({
			decimalPrecision:0, maxLength:22, allowBlank:false
		}),renderer:JxUtil.formatInt()}, field:{name:'c17_table_info__syn_index',type:'int'}},
	{col:{header:'*删除', width:69, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'c17_table_info__init_flag',type:'string'}},
	{col:{header:'表类型', width:100, sortable:true, align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datatabletype
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datatabletype[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datatabletype.length; i++) {
				if (Datatabletype[i][0] == value)
					return Datatabletype[i][1];
			}
		}}, field:{name:'c17_table_info__table_type',type:'string'}},
	{col:{header:'同步信息', width:201, sortable:true}, field:{name:'c17_table_info__syn_info',type:'string'}},
	{col:{header:'说明', width:302, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:1024
		})}, field:{name:'c17_table_info__memo',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'c17_table_info__info_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'c17_table_info'
	};
	
	
	for (var i = 0; i < cols.length; i++) {
	if (cols[i].field.name.indexOf('__syn_info') > 0 ) {
		cols[i].col.renderer = JxUtil.wordWrap;
		cols[i].col.editor=new Ext.form.TextArea({
			maxLength:1000,grow:true
		});
		break;
	}
}
		
	return new Jxstar.GridNode(config);
}