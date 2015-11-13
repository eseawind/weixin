Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var condtypeData = Jxstar.findComboData('condtype');
	var rownoData = Jxstar.findComboData('rowno');
	var andorData = Jxstar.findComboData('andor');

	var cols = [
	{col:{header:'左括', width:39, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'sys_query_det__left_brack',type:'string'}},
	{col:{header:'*字段标题', width:113, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'sys_query_det__colname',type:'string'}},
	{col:{header:'字段名', width:145, sortable:true, hidden:true}, field:{name:'sys_query_det__colcode',type:'string'}},
	{col:{header:'条件', width:68, sortable:true, defaultval:'like', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: condtypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: condtypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < condtypeData.length; i++) {
				if (condtypeData[i][0] == value)
					return condtypeData[i][1];
			}
		}}, field:{name:'sys_query_det__condtype',type:'string'}},
	{col:{header:'查询值', width:98, sortable:true, hidden:true}, field:{name:'sys_query_det__cond_value',type:'string'}},
	{col:{header:'序号', width:51, sortable:true, align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			maxLength:12
		}),renderer:JxUtil.formatInt()}, field:{name:'sys_query_det__col_no',type:'int'}},
	{col:{header:'行号', width:56, sortable:true, defaultval:'1', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: rownoData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: rownoData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < rownoData.length; i++) {
				if (rownoData[i][0] == value)
					return rownoData[i][1];
			}
		}}, field:{name:'sys_query_det__row_no',type:'string'}},
	{col:{header:'逻辑符', width:62, sortable:true, defaultval:'and', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: andorData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: andorData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < andorData.length; i++) {
				if (andorData[i][0] == value)
					return andorData[i][1];
			}
		}}, field:{name:'sys_query_det__andor',type:'string'}},
	{col:{header:'右括', width:41, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'sys_query_det__right_brack',type:'string'}},
	{col:{header:'数据类型', width:100, sortable:true, hidden:true}, field:{name:'sys_query_det__coltype',type:'string'}},
	{col:{header:'查询ID', width:100, sortable:true, hidden:true}, field:{name:'sys_query_det__query_id',type:'string'}},
	{col:{header:'明细ID', width:100, sortable:true, hidden:true}, field:{name:'sys_query_det__query_detid',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '0',
		funid: 'sys_qrydet'
	};
	
	
	config.param.hidePageTool = true;	config.eventcfg = {				dataImportParam: function() {			var fkValue = this.grid.fkValue;			if (!fkValue) {				JxHint.alert('先选择左边的查询方案，才能添加查询字段！');				return;			}					var grid = this.grid;			var options = {				whereSql: 'fun_col.fun_id = ?',				whereValue: grid.qryFunId,				whereType: 'string'			};			return options;		}	};config.initpage = function(gridNode){ 	var grid = gridNode.page;		grid.on('beforeedit', function(e) {		if (e.field != 'sys_query_det__condtype') return true;		var coltype = e.record.get('sys_query_det__coltype');				var cols = gridNode.config.param.cols, combo = null;		for(var i = 0, n = cols.length; i < n; i++) {			var col = cols[i].col;			var field = cols[i].field;			if (field.name == 'sys_query_det__condtype') {				combo = col.editor;			}		}				if (combo && combo.isXType('combo')) {			var cs = combo.store;			var cr = cs.reader.recordType;			if (coltype == 'string') {				if (cs.getCount() == 5) {					cs.insert(5, new cr({value:'llike', text:jx.query.llike}));					cs.insert(6, new cr({value:'rlike', text:jx.query.rlike}));					cs.insert(7, new cr({value:'like', text:jx.query.like}));				}			} else {				if (cs.getCount() == 8) {					cs.remove(cs.getAt(7));					cs.remove(cs.getAt(6));					cs.remove(cs.getAt(5));				}			}		}		return true;	});};
		
	return new Jxstar.GridNode(config);
}