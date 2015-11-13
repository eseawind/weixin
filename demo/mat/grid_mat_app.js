Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataaudit = Jxstar.findComboData('audit');
	var Dataapptype = Jxstar.findComboData('apptype');

	var cols = [
	{col:{header:'记录状态', width:73, sortable:true, align:'center',
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
	{col:{header:'申请单号', width:100, sortable:true}, field:{name:'mat_app__app_code',type:'string'}},
	{col:{header:'项目名称', width:183, sortable:true}, field:{name:'mat_app__project_name',type:'string'}},
	{col:{header:'申请日期', width:100, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d') : '';
		}}, field:{name:'mat_app__app_date',type:'date'}},
	{col:{header:'申请类型', width:100, sortable:true, align:'center',
		editable:false,
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
	{col:{header:'申请人', width:74, sortable:true}, field:{name:'mat_app__app_user',type:'string'}},
	{col:{header:'申请部门', width:100, sortable:true}, field:{name:'mat_app__dept_name',type:'string'}},
	{col:{header:'采购负责人', width:81, sortable:true}, field:{name:'mat_app__stock_user',type:'string'}},
	{col:{header:'预算金额万', width:120, sortable:true, align:'right',renderer:JxUtil.formatNumber(6)}, field:{name:'mat_app__app_money',type:'float'}},
	{col:{header:'申请理由', width:248, sortable:true}, field:{name:'mat_app__app_cause',type:'string'}},
	{col:{header:'申请人ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_app__app_userid',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_app__app_id',type:'string'}},
	{col:{header:'申请部门ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'mat_app__dept_id',type:'string'}},
	{col:{header:'效益分析', width:100, sortable:true, hidden:true}, field:{name:'mat_app__app_analyse',type:'string'}},
	{col:{header:'采购数量', width:100, sortable:true, align:'right',renderer:JxUtil.formatNumber(6)}, field:{name:'mat_app__app_num',type:'float'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'mat_app'
	};
	
	JxAttach.addAttachCol(cols);
	config.param.showStat = true;

	config.initpage = function(gridNode){
		var event = gridNode.event;
		
		//data = {reportId:reportId, printType:printType, printScope:printScope, printMode:printMode};
		/*event.on('beforeprint', function(e, data){
			if (data.printScope == 'query') return;
			var records = JxUtil.getSelectRows(this.grid);
			if (!JxUtil.selectone(records)) return false;
			
			//alert(data.reportId + ';' + data.printType + ';' + data.printScope + ';' + data.printMode);
			return true;
		});*/
	};
	
	config.eventcfg = {
		/*dataPrintParam: function(data) {
			if (data.printScope == 'query') return;
			var records = JxUtil.getSelectRows(this.grid);
			if (!JxUtil.selectone(records)) return '';
			
			var project_name = records[0].get('mat_app__project_name');
			var e = encodeURIComponent; //编码
			return '&reportName=' + e(project_name+'的项目文件');
		}*/
	};
		
	return new Jxstar.GridNode(config);
}