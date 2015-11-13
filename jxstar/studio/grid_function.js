Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var funreg_typeData = Jxstar.findComboData('funreg_type');
	var fun_stateData = Jxstar.findComboData('fun_state');
	var auditvData = Jxstar.findComboData('auditv');
	var showformData = Jxstar.findComboData('showform');

	var cols = [
	{col:{header:'功能标识', width:110, sortable:true}, field:{name:'fun_base__fun_id',type:'string'}},
	{col:{header:'*功能名称', width:146, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'fun_base__fun_name',type:'string'}},
	{col:{header:'业务表名', width:126, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			maxLength:50, name:'fun_base__table_name', 
			editable:true, hcss:'color:#3039b4;',
			triggerClass:'x-form-search-trigger', 
			listeners:{afterrender: function(combo) {
				JxSelect.initCombo('sys_fun_base', combo, 'node_sys_fun_base_editgrid');
			}}
		})}, field:{name:'fun_base__table_name',type:'string'}},
	{col:{header:'功能序号', width:74, sortable:true, align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			maxLength:12
		}),renderer:JxUtil.formatInt()}, field:{name:'fun_base__fun_index',type:'int'}},
	{col:{header:'注册类型', width:83, sortable:true, defaultval:'main', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: funreg_typeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: funreg_typeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < funreg_typeData.length; i++) {
				if (funreg_typeData[i][0] == value)
					return funreg_typeData[i][1];
			}
		}}, field:{name:'fun_base__reg_type',type:'string'}},
	{col:{header:'功能状态', width:83, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: fun_stateData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: fun_stateData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < fun_stateData.length; i++) {
				if (fun_stateData[i][0] == value)
					return fun_stateData[i][1];
			}
		}}, field:{name:'fun_base__fun_state',type:'string'}},
	{col:{header:'布局页面', width:201, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TriggerField({
			maxLength:100,
			editable:true,
			triggerClass:'x-form-search-trigger', 
			onTriggerClick: function() {
				if (this.menu == null) {
					var selcfg = {pageType:'combogrid', nodeId:'fun_layout', layoutPage:'', sourceField:'funall_layout.layout_path', targetField:'fun_base.layout_page', whereSql:"", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'0',queryField:'',likeType:'',fieldName:'fun_base.layout_page'};
					this.menu = Jxstar.createComboMenu(this);
					JxSelect.createComboGrid(selcfg, this.menu, 'node_sys_fun_base_editgrid');
				}
				this.menu.show(this.el);
			}
		})}, field:{name:'fun_base__layout_page',type:'string'}},
	{col:{header:'GRID页面', width:213, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:100
		})}, field:{name:'fun_base__grid_page',type:'string'}},
	{col:{header:'FORM页面', width:195, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:100
		})}, field:{name:'fun_base__form_page',type:'string'}},
	{col:{header:'功能主键', width:143, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TriggerField({
			maxLength:50,
			editable:true,
			triggerClass:'x-form-search-trigger', 
			onTriggerClick: function() {
				if (this.menu == null) {
					var selcfg = {pageType:'combogrid', nodeId:'sel_field', layoutPage:'', sourceField:'v_field_info.col_code', targetField:'fun_base.pk_col', whereSql:"v_field_info.table_name = ?", whereValue:'[fun_base.table_name]', whereType:'string', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'0',queryField:'',likeType:'',fieldName:'fun_base.pk_col'};
					this.menu = Jxstar.createComboMenu(this);
					JxSelect.createComboGrid(selcfg, this.menu, 'node_sys_fun_base_editgrid');
				}
				this.menu.show(this.el);
			}
		})}, field:{name:'fun_base__pk_col',type:'string'}},
	{col:{header:'功能外键', width:134, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TriggerField({
			maxLength:50,
			editable:true,
			triggerClass:'x-form-search-trigger', 
			onTriggerClick: function() {
				if (this.menu == null) {
					var selcfg = {pageType:'combogrid', nodeId:'sel_field', layoutPage:'', sourceField:'v_field_info.col_code', targetField:'fun_base.fk_col', whereSql:"v_field_info.table_name = ?", whereValue:'[fun_base.table_name]', whereType:'string', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'0',queryField:'',likeType:'',fieldName:'fun_base.fk_col'};
					this.menu = Jxstar.createComboMenu(this);
					JxSelect.createComboGrid(selcfg, this.menu, 'node_sys_fun_base_editgrid');
				}
				this.menu.show(this.el);
			}
		})}, field:{name:'fun_base__fk_col',type:'string'}},
	{col:{header:'编码字段', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TriggerField({
			maxLength:50,
			editable:true,
			triggerClass:'x-form-search-trigger', 
			onTriggerClick: function() {
				if (this.menu == null) {
					var selcfg = {pageType:'combogrid', nodeId:'sel_field', layoutPage:'', sourceField:'v_field_info.col_code', targetField:'fun_base.code_col', whereSql:"v_field_info.table_name = ?", whereValue:'[fun_base.table_name]', whereType:'string', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'0',queryField:'',likeType:'',fieldName:'fun_base.code_col'};
					this.menu = Jxstar.createComboMenu(this);
					JxSelect.createComboGrid(selcfg, this.menu, 'node_sys_fun_base_editgrid');
				}
				this.menu.show(this.el);
			}
		})}, field:{name:'fun_base__code_col',type:'string'}},
	{col:{header:'编码前缀', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'fun_base__code_prefix',type:'string'}},
	{col:{header:'子功能ID', width:60, sortable:true, hidden:true}, field:{name:'fun_base__subfun_id',type:'string'}},
	{col:{header:'有效记录值', width:60, sortable:true, hidden:true, defaultval:'1', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: auditvData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: auditvData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < auditvData.length; i++) {
				if (auditvData[i][0] == value)
					return auditvData[i][1];
			}
		}}, field:{name:'fun_base__valid_flag',type:'string'}},
	{col:{header:'记录状态列', width:100, sortable:true, hidden:true}, field:{name:'fun_base__audit_col',type:'string'}},
	{col:{header:'复制列', width:100, sortable:true, hidden:true}, field:{name:'fun_base__copy_col',type:'string'}},
	{col:{header:'from子句', width:100, sortable:true, hidden:true}, field:{name:'fun_base__from_sql',type:'string'}},
	{col:{header:'where子句', width:100, sortable:true, hidden:true}, field:{name:'fun_base__where_sql',type:'string'}},
	{col:{header:'order子句', width:100, sortable:true, hidden:true}, field:{name:'fun_base__order_sql',type:'string'}},
	{col:{header:'group子句', width:100, sortable:true, hidden:true}, field:{name:'fun_base__group_sql',type:'string'}},
	{col:{header:'用户信息', width:100, sortable:true, hidden:true, defaultval:'1'}, field:{name:'fun_base__is_userinfo',type:'string'}},
	{col:{header:'是否归档', width:100, sortable:true, hidden:true, defaultval:'0'}, field:{name:'fun_base__is_archive',type:'string'}},
	{col:{header:'数据源名', width:100, sortable:true, hidden:true, defaultval:'default'}, field:{name:'fun_base__ds_name',type:'string'}},
	{col:{header:'必填子功能', width:100, sortable:true, hidden:true}, field:{name:'fun_base__val_subid',type:'string'}},
	{col:{header:'模块ID', width:100, sortable:true, hidden:true}, field:{name:'fun_base__module_id',type:'string'}},
	{col:{header:'表格编辑', width:100, sortable:true, hidden:true, defaultval:'0'}, field:{name:'fun_base__isedit',type:'string'}},
	{col:{header:'初始显示', width:100, sortable:true, hidden:true, defaultval:'1'}, field:{name:'fun_base__init_show',type:'string'}},
	{col:{header:'显示查询', width:100, sortable:true, hidden:true, defaultval:'1'}, field:{name:'fun_base__is_query',type:'string'}},
	{col:{header:'审批界面类型', width:100, sortable:true, hidden:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: showformData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: showformData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < showformData.length; i++) {
				if (showformData[i][0] == value)
					return showformData[i][1];
			}
		}}, field:{name:'fun_base__show_form',type:'string'}},
	{col:{header:'缺省查询字段', width:100, sortable:true, hidden:true}, field:{name:'fun_base__first_field',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '0',
		funid: 'sys_fun_base'
	};
	
	
	config.eventcfg = {
		updateDes: function(){			var hintcall = function(btn, text) {				if (btn != 'ok') return;				if (text.length == 0) {					JxHint.alert('必须输入设计文件更新路径，如d:\\design_update');					return;				}												var params = 'funid=sys_fun_base&topath='+ text +'&pagetype=editgrid&eventcode=updatedes';								//发送请求				Request.postRequest(params, null);			};			Ext.MessageBox.prompt(jx.base.hint, '输入设计文件更新路径', hintcall);		},		
		createFun: function(){
			var self = this;						var attr = self.grid.treeNodeAttr;			if(attr == null || !attr.leaf ) {				JxHint.alert('必须选择最底层模块，才能新增功能！');				return;			}			
			var hintcall = function(btn, text) {
				if (btn != 'ok') return;

				var hdcall = function() {
					self.grid.getStore().reload();
				};
				
				var params = 'funid=sys_fun_base&cfunid='+ text +'&pagetype=editgrid&eventcode=create';
				//添加模块ID
				params += '&cmodid=' + attr.id;
				
				//发送请求
				Request.postRequest(params, hdcall);
			};

			//'请输入新功能ID'
			Ext.MessageBox.prompt(jx.base.hint, jx.fun.newid, hintcall);
		},				copyFun: function(){			var records = this.grid.getSelectionModel().getSelections();			if (!JxUtil.selectone(records)) return;			var selfunid = records[0].get('fun_base__fun_id');					var self = this;			var hintcall = function(btn, text) {				if (btn != 'ok') return;				var hdcall = function() {					self.grid.getStore().reload();				};								var params = 'funid=sys_fun_base&oldfunid='+ selfunid +'&newfunid='+ text +'&pagetype=editgrid&eventcode=copy';								//发送请求				Request.postRequest(params, hdcall);			};			//'请输入新功能ID'			Ext.MessageBox.prompt(jx.base.hint, jx.fun.newid, hintcall);		},
			
		createNode: function(){			var self = this;						//取模块ID			var attr = self.grid.treeNodeAttr;			var modId = '', modText = '', hintText = '';			if(attr != null) {				modId = attr.id;				modText = attr.text;			}			if (modId.length > 0 && modText.length > 0) {				hintText = '生成所有功能数据选“是”，生成【'+ modText +'】模块数据选“否”，或取消？';			} else {				hintText = '确定生成所有功能的数据吗？';			}						var hintcall = function(btn, text) {				if (btn == 'cancel') return;				if (btn == 'yes') modId = '';				//设置请求的参数				var params = 'funid='+ self.define.nodeid + '&moduleid=' + modId;				params += '&pagetype=grid&eventcode=createNode&projectpath=' + Jxstar.session['project_path'];				//生成文件后自动加载该文件				var hdcall = function() {					Request.loadJS('/public/data/NodeDefine.js');				};				//发送请求				Request.postRequest(params, hdcall);			};			Ext.Msg.show({			   title: jx.base.hint,			   msg: hintText,			   buttons: (modId.length > 0) ? Ext.Msg.YESNOCANCEL : Ext.Msg.OKCANCEL,			   fn: hintcall,			   icon: Ext.MessageBox.QUESTION			});
		},

		createRule: function(){
			//取选择记录的主键值
			var params = 'funid='+ this.define.nodeid;
			
			//设置请求的参数
			params += '&pagetype=grid&eventcode=createRule&projectpath=' + Jxstar.session['project_path'];

			//生成文件后自动加载该文件
			var hdcall = function() {
				Request.loadJS('/public/data/RuleData.js');
			};

			//发送请求
			Request.postRequest(params, hdcall);
		},
		
		createTree: function(){
			//取选择记录的主键值
			var params = 'funid='+ this.define.nodeid;
			
			//设置请求的参数
			params += '&pagetype=grid&eventcode=createTree&projectpath=' + Jxstar.session['project_path'];

			//生成文件后自动加载该文件
			var hdcall = function() {
				Request.loadJS('/public/data/TreeData.js');
			};

			//发送请求
			Request.postRequest(params, hdcall);
		},

		setFunext: function(){			var records = this.grid.getSelectionModel().getSelections();			if (!JxUtil.selectone(records)) return;			var selfunid = records[0].get('fun_base__fun_id');						//加载Form数据			var hdcall = function(page) {				//设置外键键				page.getForm().fkName = 'fun_ext__fun_id';				page.getForm().fkValue = selfunid;								//加载显示数据				var options = {					where_sql: 'fun_ext.fun_id = ?',					where_type: 'string',					where_value: selfunid,					callback: function(data) {						//如果没有数据则执行新增						if (data.length == 0) {							page.formNode.event.create();						} else {							var r = page.formNode.event.newRecord(data[0]);														page.getForm().myRecord = r;							page.getForm().loadRecord(r);						}					}				};				Jxstar.queryData('fun_ext', options);			};						//显示数据			var define = Jxstar.findNode('fun_ext');			Jxstar.showData({				filename: define.formpage,				title: define.nodetitle,				width: 500,				height: 200,				callback: hdcall			});		},				setStatus: function(){			var records = this.grid.getSelectionModel().getSelections();			if (!JxUtil.selectone(records)) return;			var selfunid = records[0].get('fun_base__fun_id');						//加载Form数据			var hdcall = function(page) {				//设置外键键				page.getForm().fkName = 'fun_status__fun_id';				page.getForm().fkValue = selfunid;								//加载显示数据				var options = {					where_sql: 'fun_status.fun_id = ?',					where_type: 'string',					where_value: selfunid,					callback: function(data) {						//如果没有数据则执行新增						if (data.length == 0) {							page.formNode.event.create();						} else {							var r = page.formNode.event.newRecord(data[0]);														page.getForm().myRecord = r;							page.getForm().loadRecord(r);						}					}				};				Jxstar.queryData('fun_status', options);			};						//显示数据			var define = Jxstar.findNode('fun_status');			Jxstar.showData({				filename: define.formpage,				title: define.nodetitle,				width: 700,				height: 250,				callback: hdcall			});		},		setFunTree: function(){			var records = this.grid.getSelectionModel().getSelections();			if (!JxUtil.selectone(records)) return;			//过滤条件			var where_sql = 'fun_tree.fun_id = ?';			var where_type = 'string';			var where_value = records[0].get('fun_base__fun_id');						//加载数据			var hdcall = function(layout) {				//显示数据				JxUtil.delay(500, function(){					var grid = layout.getComponent(0).getComponent(0);									//设置外键值					grid.fkValue = where_value;					Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});				});			};			//显示数据			var define = Jxstar.findNode('fun_tree');			Jxstar.showData({				filename: define.layout,				title: define.nodetitle,				pagetype: 'subgrid',				nodedefine: define,				callback: hdcall			});		},				setFunRoute: function(){			var records = this.grid.getSelectionModel().getSelections();			if (!JxUtil.selectone(records)) return;			//过滤条件			var where_sql = 'fun_rule_route.fun_id = ?';			var where_type = 'string';			var where_value = records[0].get('fun_base__fun_id');						//加载数据			var hdcall = function(layout) {				//显示数据				JxUtil.delay(500, function(){					var grid = layout.getComponent(0).getComponent(0);									//设置外键值					grid.fkValue = where_value;					Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});				});			};			//显示数据			var define = Jxstar.findNode('rule_route');			Jxstar.showData({				filename: define.layout,				title: define.nodetitle,				pagetype: 'subgrid',				nodedefine: define,				callback: hdcall			});		},				setFunSql: function(){			var records = this.grid.getSelectionModel().getSelections();			if (!JxUtil.selectone(records)) return;			//过滤条件			var selectFunId = records[0].get('fun_base__fun_id');			var where_sql = 'fun_rule_sql.src_funid = ? and fun_rule_sql.route_id = ?';			var where_type = 'string;string';			var where_value = selectFunId + ';noroute';						//加载数据			var hdcall = function(layout) {				//显示数据				JxUtil.delay(500, function(){					var grid = layout.getComponent(0).getComponent(0);					//当前选择的功能ID					grid.selectFunId = selectFunId;					//清除外键设置，在form的initpage方法中处理来源功能ID为外键值					grid.fkValue = 'noroute';					Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});				});			};			//显示数据			var define = Jxstar.findNode('rule_sqlm');			Jxstar.showData({				filename: define.layout,				title: define.nodetitle,				pagetype: 'subgrid',				nodedefine: define,				callback: hdcall			});		},				setCodeRule: function(){			var records = this.grid.getSelectionModel().getSelections();			if (!JxUtil.selectone(records)) return;			var selfunid = records[0].get('fun_base__fun_id');						//加载Form数据			var hdcall = function(page) {				//设置外键键				page.getForm().fkName = 'sys_coderule__fun_id';				page.getForm().fkValue = selfunid;								//加载显示数据				var options = {					where_sql: 'sys_coderule.fun_id = ?',					where_type: 'string',					where_value: selfunid,					callback: function(data) {						//如果没有数据则执行新增						if (data.length == 0) {							page.formNode.event.create();						} else {							var r = page.formNode.event.newRecord(data[0]);														page.getForm().myRecord = r;							page.getForm().loadRecord(r);						}					}				};				Jxstar.queryData('sys_coderule', options);			};						//显示数据			var define = Jxstar.findNode('sys_coderule');			Jxstar.showData({				filename: define.formpage,				title: define.nodetitle,				width: 650,				height: 250,				callback: hdcall			});		},				createReport: function(reportType) {			var records = this.grid.getSelectionModel().getSelections();			if (!JxUtil.selected(records)) return;			for (var i = 0, n = records.length; i < n; i++) {				var funid = records[i].get('fun_base__fun_id');				var params = 'funid=sys_fun_base&selfunid='+ funid +'&pagetype=grid&eventcode=createreport&reportType=' + reportType;				//发送请求				Request.postRequest(params, null);			}		}	};
	
	config.initpage = function(gridNode){		var event = gridNode.event;		var grid = gridNode.page;				grid.on('rowdblclick', function(g, n, e) {			event.showForm();		});				//表格编辑后事件		grid.on('afteredit', function(event) {			if (event.field == 'fun_base__table_name') {				var record = event.record;				var table_name = record.get('fun_base__table_name');				var from_sql = record.get('fun_base__from_sql');				if (from_sql.length == 0) {					record.set('fun_base__from_sql', 'from ' + table_name);				}			}		});	};
		
	return new Jxstar.GridNode(config);
}