Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var chkfieldData = Jxstar.findComboData('chkfield');
	var datastyleData = Jxstar.findComboData('datastyle');

	var cols = [
	{col:{header:'序号', width:55, sortable:true, align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			maxLength:12
		}),renderer:JxUtil.formatInt()}, field:{name:'rpt_detail_wf__col_index',type:'float'}},
	{col:{header:'节点名称', width:129, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:50
		})}, field:{name:'rpt_detail_wf__node_title',type:'string'}},
	{col:{header:'*审批信息字段', width:100, sortable:true, align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: chkfieldData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: chkfieldData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < chkfieldData.length; i++) {
				if (chkfieldData[i][0] == value)
					return chkfieldData[i][1];
			}
		}}, field:{name:'rpt_detail_wf__col_code',type:'string'}},
	{col:{header:'显示位置', width:66, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'rpt_detail_wf__col_pos',type:'string'}},
	{col:{header:'显示偏移位置', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'rpt_detail_wf__view_pos',type:'string'}},
	{col:{header:'显示样式', width:65, sortable:true, align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: datastyleData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: datastyleData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < datastyleData.length; i++) {
				if (datastyleData[i][0] == value)
					return datastyleData[i][1];
			}
		}}, field:{name:'rpt_detail_wf__format',type:'string'}},
	{col:{header:'过程名称', width:100, sortable:true}, field:{name:'rpt_detail_wf__process_name',type:'string'}},
	{col:{header:'过程ID', width:100, sortable:true, hidden:true}, field:{name:'rpt_detail_wf__process_id',type:'string'}},
	{col:{header:'区域ID', width:100, sortable:true, hidden:true}, field:{name:'rpt_detail_wf__area_id',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, hidden:true}, field:{name:'rpt_detail_wf__detwf_id',type:'string'}},
	{col:{header:'节点ID', width:100, sortable:true, hidden:true}, field:{name:'rpt_detail_wf__node_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '0',
		funid: 'rpt_detailwf'
	};
	
	config.initpage = function(gridNode){
		var grid = gridNode.page;
		grid.on('rowclick', function(g, rowindex, e) {
			var frm = Ext.get('frm_designer_report').dom;
			if (frm == null) return;
			var seldiv = frm.contentWindow.getSelectDiv();
			if (seldiv != null) {
				var record = g.getStore().getAt(rowindex);
				
				seldiv.oldRecord = seldiv.curRecord;
				seldiv.curRecord = record;
				seldiv.titleField = 'rpt_detail_wf__col_code';
				seldiv.positionField = 'rpt_detail_wf__col_pos';
			}
		});
	};
		
	return new Jxstar.GridNode(config);
}