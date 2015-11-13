Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataaudit = Jxstar.findComboData('audit');
	var Dataapptype = Jxstar.findComboData('apptype');

	var cols = [
	{col:{header:'记录状态', width:100, sortable:true, defaultval:'0', align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataaudit
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataaudit[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataaudit.length; i++) {
				if (Dataaudit[i][0] == value)
					return Dataaudit[i][1];
			}
		}}, field:{name:'mat_app__auditing',type:'string'}},
	{col:{header:'申请单号', width:100, sortable:true, editable:false,
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'mat_app__app_code',type:'string'}},
	{col:{header:'申请日期', width:100, sortable:true, defaultval:'fun_getToday()', align:'center',
		editable:false,
		editor:new Ext.form.DateField({
			format: 'Y-m-d',
			minValue: '1900-01-01'
		}),
		renderer:function(value) {
			return value ? value.format('Y-m-d') : '';
		}}, field:{name:'mat_app__app_date',type:'date'}},
	{col:{header:'申请部门', width:100, sortable:true, defaultval:'fun_getDeptName()', editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:50
		})}, field:{name:'mat_app__dept_name',type:'string'}},
	{col:{header:'采购负责人', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'mat_app__stock_user',type:'string'}},
	{col:{header:'申请类型', width:84, sortable:true, align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataapptype
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataapptype[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataapptype.length; i++) {
				if (Dataapptype[i][0] == value)
					return Dataapptype[i][1];
			}
		}}, field:{name:'mat_app__app_type',type:'string'}},
	{col:{header:'*项目名称', width:191, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'mat_app__project_name',type:'string'}},
	{col:{header:'申请理由', width:195, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:200
		})}, field:{name:'mat_app__app_cause',type:'string'}},
	{col:{header:'预算金额(万元)', width:113, sortable:true, align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			maxLength:12
		}),renderer:JxUtil.formatNumber(2)}, field:{name:'mat_app__app_money',type:'float'}},
	{col:{header:'采购数量', width:100, sortable:true, align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			maxLength:12
		}),renderer:JxUtil.formatNumber(2)}, field:{name:'mat_app__app_num',type:'float'}},
	{col:{header:'申请部门ID', width:100, sortable:true, colindex:10000, hidden:true, defaultval:'fun_getDeptId()'}, field:{name:'mat_app__dept_id',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_app__app_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'mat_order'
	};
	
	
	
		
	return new Jxstar.GridNode(config);
}