Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataright_type = Jxstar.findComboData('right_type');
	var Databtnshow = Jxstar.findComboData('btnshow');

	var cols = [
	{col:{header:'域？', width:45, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'fun_event__is_domain',type:'string'}},
	{col:{header:'*代码', width:100, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TriggerField({
			maxLength:20,
			editable:true, allowBlank:false,
			triggerClass:'x-form-search-trigger', 
			onTriggerClick: function() {
				if (this.menu == null) {
					var selcfg = {pageType:'combogrid', nodeId:'event_domain', layoutPage:'', sourceField:'funall_domain.domain_code;domain_name;[1]', targetField:'fun_event.event_code;event_name;fun_event.is_domain', whereSql:"", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'0',queryField:'',likeType:'',fieldName:'fun_event.event_code'};
					this.menu = Jxstar.createComboMenu(this);
					JxSelect.createComboGrid(selcfg, this.menu, 'node_fun_event_editgrid');
				}
				this.menu.show(this.el);
			}
		})}, field:{name:'fun_event__event_code',type:'string'}},
	{col:{header:'*名称', width:100, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'fun_event__event_name',type:'string'}},
	{col:{header:'前台方法', width:100, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:50
		})}, field:{name:'fun_event__client_method',type:'string'}},
	{col:{header:'页面类型', width:172, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:100
		})}, field:{name:'fun_event__page_type',type:'string'}},
	{col:{header:'权限类型', width:60, sortable:true, defaultval:'edit', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataright_type
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataright_type[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataright_type.length; i++) {
				if (Dataright_type[i][0] == value)
					return Dataright_type[i][1];
			}
		}}, field:{name:'fun_event__right_type',type:'string'}},
	{col:{header:'显示类型', width:71, sortable:true, defaultval:'tool', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Databtnshow
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Databtnshow[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Databtnshow.length; i++) {
				if (Databtnshow[i][0] == value)
					return Databtnshow[i][1];
			}
		}}, field:{name:'fun_event__show_type',type:'string'}},
	{col:{header:'序号', width:49, sortable:true, align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			decimalPrecision:0, maxLength:22
		}),renderer:JxUtil.formatInt()}, field:{name:'fun_event__event_index',type:'int'}},
	{col:{header:'隐藏？', width:50, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.Checkbox(),
		renderer:function(value) {
			return value=='1' ? jx.base.yes : jx.base.no;
		}}, field:{name:'fun_event__is_hide',type:'string'}},
	{col:{header:'快捷键', width:60, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:1
		})}, field:{name:'fun_event__access_key',type:'string'}},
	{col:{header:'功能ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'fun_event__fun_id',type:'string'}},
	{col:{header:'事件ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'fun_event__event_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '0',
		funid: 'fun_event'
	};
	
	
	//显示事件的类设置
	var showClass = function(fun_id, event_code, target) {
		var url = Jxstar.path + '/commonAction.do?eventcode=queryinfo&funid=fun_event_info&pagetype=grid';
		url += '&user_id='+Jxstar.session['user_id'];
		
		//显示数据
		var hdcall = function(grid) {
			JxUtil.delay(500, function(){
				var params = Ext.apply({start:0, limit:50}, {info_funid:fun_id, info_code:event_code});
				var store = grid.getStore();
				store.proxy.setUrl(url);
				store.load({params:params});
			});
		};
		
		Jxstar.showData({
			filename: '/jxstar/studio/grid_fun_event_info.js',
			title: '调用类列表',
			callback: hdcall,
			pagetype: 'notoolgrid',
			width: 600,
			height: 350
		});
	};
	
	//显示域的事件明细
	var showDomain = function(fun_id, domain_code, target) {
		//过滤条件
		var where_sql = 'domain_id in (select domain_id from funall_domain where domain_code = ?)';
		var where_type = 'string';
		var where_value = domain_code;
		
		//加载数据
		var hdcall = function(grid) {
			//显示数据
			JxUtil.delay(500, function(){
				//设置外键值
				grid.fkValue = where_value;
				grid.srcFunId = fun_id;

				Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
			});
		};

		//显示数据
		var define = Jxstar.findNode('event_domain_det');
		Jxstar.showData({
			filename: define.gridpage,
			title: define.nodetitle,
			callback: hdcall
		});
	};
	
	cols[cols.length] = {col:
		{header:'查看', width:80, align:'center', 
			renderer: function(value, metaData, record) {
				var isdo = record.get('fun_event__is_domain');
				var html = '';
				if (isdo == '1') {
					html = '<a name="qryevent" href="#">查看域</a>';
				} else {
					html = '<a name="clsset" href="#">查看类</a>';
				}
				return html;
			},
			listeners: {click: function(col, grid, row, e){
				var target = e.getTarget();
				var rec = grid.getStore().getAt(row);
				var fun_id = rec.get('fun_event__fun_id');
				var event_code = rec.get('fun_event__event_code');
				
				if (target.name == 'clsset') {
					showClass(fun_id, event_code, target);
				}
				if (target.name == 'qryevent') {
					showDomain(fun_id, event_code, target);
				}
			}}
		}
	};

	config.eventcfg = {
		f_invoke: function(){
			var records = this.grid.getSelectionModel().getSelections();
			if (!JxUtil.selectone(records)) return;

			//过滤条件
			var where_sql = 'fun_event_invoke.event_id = ?';
			var where_type = 'string';
			var where_value = records[0].get('fun_event__event_id');
			
			//加载数据
			var hdcall = function(layout) {
				//显示数据
				JxUtil.delay(500, function(){
					//调用类表
					var grid = layout.getComponent(0).getComponent(0);
					//设置外键值
					grid.fkValue = where_value;

					Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
				});
			};

			//显示数据
			Jxstar.showData({
				filename: '/jxstar/studio/pub/layout_invoke.js',
				title: jx.fun.invoke,	//'调用类注册'
				callback: hdcall
			});
		},
		
		checkSet: function(){
			var funId = this.grid.fkValue;
			//过滤条件
			var where_sql = 'fun_check.event_code = ? and fun_check.fun_id = ?';
			var where_type = 'string;string';
			var where_value = 'audit;'+funId;
			
			//加载数据
			var hdcall = function(layout) {
				//显示数据
				JxUtil.delay(500, function(){
					//调用类表
					var grid = layout.getComponent(0).getComponent(0);
					//设置外键值
					grid.fkValue = funId;

					Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
				});
			};

			//显示数据
			var define = Jxstar.findNode('fun_check');
			Jxstar.showData({
				nodedefine: define,
				filename: define.layout,
				title: define.nodetitle,
				callback: hdcall
			});
		},
		
		dataImportParam: function() {
			var funId = this.grid.fkValue;
			
			var options = {
				whereSql: 'event_code not in (select event_code from fun_event where fun_id = ?)',
				whereValue: funId,
				whereType: 'string'
			};
			return options;
		}
	};
		
	return new Jxstar.GridNode(config);
}