Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var yesnoData = Jxstar.findComboData('yesno');

	var cols = [
	{col:{header:'*文件名称', width:194, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:100, allowBlank:false
		})}, field:{name:'sys_doc__doc_name',type:'string'}},
	{col:{header:'上传日期', width:100, sortable:true, defaultval:'fun_getToday()', align:'center',
		editable:false,
		editor:new Ext.form.DateField({
			format: 'Y-m-d',
			minValue: '1900-01-01'
		}),
		renderer:function(value) {
			return value ? value.format('Y-m-d') : '';
		}}, field:{name:'sys_doc__edit_date',type:'date'}},
	{col:{header:'上传人', width:74, sortable:true, defaultval:'fun_getUserName()', editable:false,
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'sys_doc__edit_user',type:'string'}},
	{col:{header:'是否注销', width:76, sortable:true, defaultval:'0', align:'center',
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
		}}, field:{name:'sys_doc__is_cancel',type:'string'}},
	{col:{header:'文件说明', width:193, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:100
		})}, field:{name:'sys_doc__doc_memo',type:'string'}},
	{col:{header:'上传人ID', width:100, sortable:true, hidden:true, defaultval:'fun_getUserId()'}, field:{name:'sys_doc__edit_userid',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, hidden:true}, field:{name:'sys_doc__doc_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'sys_doc'
	};
	
	JxAttach.addAttachCol(cols);

	
		
	return new Jxstar.GridNode(config);
}