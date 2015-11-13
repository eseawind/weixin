Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataaudit = Jxstar.findComboData('audit');
	var Datanewstype = Jxstar.findComboData('newstype');
	var Datayesno = Jxstar.findComboData('yesno');

	var cols = [
	{col:{header:'状态', width:73, sortable:true, align:'center',
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
		}}, field:{name:'sys_news__state',type:'string'}},
	{col:{header:'公告标题', width:303, sortable:true}, field:{name:'sys_news__news_title',type:'string'}},
	{col:{header:'公告内容', width:100, sortable:true, hidden:true}, field:{name:'sys_news__news_cont',type:'string'}},
	{col:{header:'信息类型', width:100, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datanewstype
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datanewstype[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datanewstype.length; i++) {
				if (Datanewstype[i][0] == value)
					return Datanewstype[i][1];
			}
		}}, field:{name:'sys_news__cont_type',type:'string'}},
	{col:{header:'发布时间', width:127, sortable:true, align:'center',
		renderer:function(value) {
			return value ? value.format('Y-m-d H:i') : '';
		}}, field:{name:'sys_news__edit_date',type:'date'}},
	{col:{header:'发布人', width:74, sortable:true}, field:{name:'sys_news__edit_user',type:'string'}},
	{col:{header:'编号', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news__news_code',type:'string'}},
	{col:{header:'发布人ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news__edit_userid',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news__news_id',type:'string'}},
	{col:{header:'置顶？', width:60, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datayesno
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datayesno[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datayesno.length; i++) {
				if (Datayesno[i][0] == value)
					return Datayesno[i][1];
			}
		}}, field:{name:'sys_news__is_top',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'sys_news'
	};
	
	
	//预览公告	var renderDown = function(val, metaData, record) {		var keyid = record.get('sys_news__news_id');		var chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#0080FF\';"';		var html = '<a href="#" style=\'color:#0080FF;\' '+ chgcolor +' onclick="JxSender.readBoard(\''+ keyid +'\');">&nbsp;'+ val +'&nbsp;</a>';		return html;	};	for (var i = 0; i < cols.length; i++) {		var f = cols[i].field;		if (f && f.name.indexOf('sys_news__news_title') == 0) {			cols[i].col.renderer = renderDown;		}	}		config.eventcfg = {		createnew: function() {			var self = this;			//设置请求的参数			var params = 'funid='+ self.define.nodeid;			params += '&pagetype=grid&eventcode=create';						var endcall = function(data) {				var store = self.grid.getStore();				store.load({params:{start:0, limit:JxUtil.getPageSize(self.grid)},					callback : function() {						var num = store.find('sys_news__news_id', data.keyid);						self.grid.getSelectionModel().selectRow(num);						//显示表单数据						Jxstar.showForm({define:self.define, grid:self.grid, record:store.getAt(num), store:store})					}				});							};							Request.postRequest(params, endcall);		},				f_top: function(ecode) {			var self = this;			var records = JxUtil.getSelectRows(self.grid);			if (!JxUtil.selected(records)) return;			//设置请求的参数			var params = 'funid='+ self.define.nodeid;			params += '&pagetype=grid&eventcode='+ ecode;			for (var i = 0; i < records.length; i++) {				params += '&keyid=' + records[i].get(self.define.pkcol);			}						var endcall = function(data) {				self.grid.getStore().reload();			};							Request.postRequest(params, endcall);		},				//置顶		istop: function() {			this.f_top('istop');		},				//取消置顶		notop: function() {			this.f_top('notop');		}
	};		config.initpage = function(gn){			};
		
	return new Jxstar.GridNode(config);
}