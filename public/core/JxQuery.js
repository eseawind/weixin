/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 高级查询工具类。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

JxQuery = {};
(function(){

	Ext.apply(JxQuery, {
	//当前功能ID
	funid: '',
	//查询方案表格
	gridHis: null,
	//查询条件明细表格
	gridDet: null,
	//查询条件明细表的数据存储对象
	storeDet: null,
	
	/**
	* public
	* 高级查询页面
	* queryData -- 查询数据格式，该表字段数据都提取到前台
	* 		[{query_id:'', query_name:'', is_share:'', user_id:''},{},...]
	* pageNode -- 当前功能的表格定义对象，用于取表格字段对象
	**/
	queryWindow: function(queryData, pageNode) {
		var self = this;
		self.funid = pageNode.nodeId;
		//查询方案表格
		self.gridHis = self.historyGrid(queryData);
		//查询明细表格对象
		self.gridDet = self.conditionGrid(pageNode);
		
		var queryLayout = new Ext.Container({
			layout:'border',
			defaults:{margins:'2 2 2 2'},
			items:[{
				xtype:'container',
				region:'west',
				layout:'fit',
				width:200,
				items:[self.gridHis]
			},{
				xtype:'container',
				region:'center',
				layout:'fit',
				items:[self.gridDet]
			}]
		});
		
		//选择查询方案的第一条记录
		JxUtil.delay(800, function(){
			var cnt = self.gridHis.getStore().getCount();
			if (cnt > 0) {
				self.gridHis.getSelectionModel().selectRow(0);
				self.gridHis.fireEvent('rowclick', self.gridHis, 0);
			}
		});
		
		//用于构建统计方案的查询条件，在对象关闭的时需要销毁
		pageNode.condGrid = self.gridDet;
		//添加统计方案
		JxGroupExt.showCaseInQuery(pageNode, self.gridDet);
		
		queryLayout.on('beforedestroy', function(){
			pageNode.condGrid = null;
			delete pageNode.condGrid;
		});
		
		return queryLayout;
	},
	
	/**
	* private
	* 创建查询方案表格
	* queryData -- 查询数据格式，该表字段数据都提取到前台
	* 		[{query_id:'', query_name:'', is_share:'', user_id:''},{},...]
	**/
	historyGrid: function(queryData) {
		var self = this;
		var queryStore = new Ext.data.ArrayStore({
			fields: [
			   {name: 'query_id'},
			   {name: 'query_name'},
			   {name: 'is_share'},
			   {name: 'user_id'}
			]
		});
		//json对象转换为数组
		var data = [];
		for(var i = 0, len = queryData.root.length; i < len; i++){
			var item = [];
			item[0] = queryData.root[i].query_id;
			item[1] = queryData.root[i].query_name;
			item[2] = queryData.root[i].is_share;
			item[3] = queryData.root[i].user_id;
			data[i] = item;
		}
		queryStore.loadData(data);

		//删除查询方案
		var del_case = function() {
			var s = JxUtil.getSelectRows(self.gridHis);
			if (!JxUtil.selectone(s)) return false;
			
			var userid = s[0].get('user_id');
			if (userid.length > 0 && userid != JxDefault.getUserId()) {
				JxHint.alert(jx.query.deluser);//只能删除本人创建的条件！
				return false;
			}
			
			var hdcall = function() {
				var queryid = s[0].get('query_id');
				var params = 'funid=sysevent&pagetype=grid&eventcode=cond_delete';
				params += '&query_id='+queryid;
				
				Request.postRequest(params, function() {
					queryStore.remove(s[0]);
					//如果有记录，则选第一条，否则清除右边的条件
					var cnt = queryStore.getCount();
					if (cnt > 0) {
						self.gridHis.getSelectionModel().selectRow(0);
						self.gridHis.fireEvent('rowclick', self.gridHis, 0);
					} else {
						self.storeDet.removeAll();
						self.gridDet.fkValue = '';
					}
				});
			};
			//'确定删除选择的记录吗？'
			Ext.Msg.confirm(jx.base.hint, jx.event.delyes, function(btn) {
				if (btn == 'yes') hdcall();
			});
		};
		//保存查询方案
		var save_case = function() {
			var self = this;
			//请求参数
			var params = 'funid=sysevent&pagetype=grid&eventcode=cond_case';
			
			//组织查询条件明细信息
			queryStore.each(function(item) {
				params += '&query_name=' + item.get('query_name') + '&is_share=' + item.get('is_share') + '&query_id=' + item.get('query_id');
			});
			var hdCall = function() {
				queryStore.commitChanges();
			};
			
			//发送后台请求
			Request.postRequest(params, hdCall);
		};
		
		var queryTool = new Ext.Toolbar({deferHeight:true, 
			items:[
				{text:jx.base.del, iconCls:'eb_delete', handler: del_case},
				{text:jx.base.save, iconCls:'eb_save', handler: save_case}
			]
		});
		
		var sm = new Ext.grid.RowSelectionModel();
		var queryGrid = new Ext.grid.EditorGridPanel({
			store: queryStore,
			columns: [
				{header: jx.query.casename, width: 140, dataIndex: 'query_name', editable:true, hcss:'color:#3039b4;', 
					editor:new Ext.form.TextField({
						maxLength:50, allowBlank:false
					})
				},
				{header: jx.query.pub, width: 50, dataIndex: 'is_share', editable:true, hcss:'color:#3039b4;',
					editor:new Ext.form.Checkbox(),
					renderer:function(value) {return value=='1' ? jx.base.yes : jx.base.no;}
				},
				{header: "query_id", hidden:true, dataIndex: 'query_id'},
				{header: "user_id", hidden:true, dataIndex: 'user_id'}
			],
			tbar: queryTool,
			
			sm: sm,
			frame:false,
			border:true,
			enableHdMenu: false,
			stripeRows: true,
			columnLines: true,
			viewConfig: {forceFit:true}
		});
		
		//点击记录，刷新查询条件明细
		queryGrid.on('rowclick', function(g, n, e){
			var record = g.getStore().getAt(n);
			if (record == null) return false;
			var queryid = record.get('query_id');
			
			//加载明细数据
			var hdCall = function(condata) {
				self.storeDet.removeAll();
				//先删除，再重新加载
				var data = [];
				for(var i = 0, len = condata.root.length; i < len; i++){
					var item = [];
					item[0] = condata.root[i].left_brack;
					item[1] = condata.root[i].colcode.replace('.', '__');//查询方案中的字段名中带.
					item[2] = condata.root[i].condtype;
					item[3] = condata.root[i].cond_value;
					item[4] = condata.root[i].right_brack;
					item[5] = condata.root[i].andor;
					item[6] = condata.root[i].coltype;
					item[7] = condata.root[i].col_no;
					data[i] = item;
				}
				self.storeDet.loadData(data);
				self.gridDet.getView().refresh();
				self.gridDet.fkValue = queryid;
			};
			
			var params = 'funid=queryevent&eventcode=cond_qrydet';
			params += '&query_id='+queryid;
			Request.dataRequest(params, hdCall);
		});
		
		return queryGrid;
	},
		
	/**
	* private
	* 保存查询条件；如果有选择的查询方案，则直接保存，否则弹出窗口另存
	* isother -- 是否另存 true|false
	**/
	saveQuery: function(self, isother) {
		var cnt = self.storeDet.getCount();
		if (cnt == 0) {
			JxHint.alert(jx.query.condempty);	//'查询条件为空，不能保存！'
			return false;
		}
		
		for (var i = 0; i < self.storeDet.getCount(); i++) {
			var record = self.storeDet.getAt(i);
			var value = record.get('cond_value');
			if (Ext.isEmpty(value)) {
				JxHint.alert(String.format(jx.query.valempty, i+1));	//'第{0}行的查询值为空，不能保存！'
				return false;
			}
		}
		
		//如果有查询Id，则直接保存，否则弹出窗口填写方案名称
		var queryId = self.gridDet.fkValue;
		if (queryId != null && queryId.length > 0 && !isother) {
			self.saveQueryFn(queryId);
			return;
		}
		
		var queryForm = new Ext.form.FormPanel({
				layout:'form', 
				labelAlign:'right',
				labelWidth:80,
				style:'padding-top:20px;', 
				border:false, 
				baseCls:'x-plain',
				items:[
					{xtype:'checkbox', fieldLabel:jx.query.share, name:'is_share'},		//'是否共享?'
					{xtype:'textfield', fieldLabel:jx.query.casename, name:'query_name', //'查询方案名称'
						allowBlank:false, labelSeparator:'*', anchor:'95%', labelStyle:'color:#0000ff;', maxLength:50}
				]
			});
		
		//创建对话框
		var win = new Ext.Window({
			title:jx.query.savetitle,	//'保存查询条件'
			layout:'fit',
			width:400,
			height:160,
			resizable: false,
			modal: true,
			closeAction:'close',
			items:[queryForm],

			buttons: [{
				text:jx.base.ok,	//'确定'
				handler:function(){
					var form = queryForm.getForm();
					//取条件名称
					var isshare = form.findField('is_share').getValue();
					var qryname = form.findField('query_name').getValue();
					if (qryname.length == 0) {
						JxHint.alert(jx.query.noname);	//'查询条件名称不能为空！'
						return false;
					}
					
					//组织查询条件主表信息
					var param = '&is_share=' + isshare;
					param += '&query_name=' + encodeURIComponent(qryname);
					//保存查询条件
					self.saveQueryFn('', param, win);
				}
			},{
				text:jx.base.cancel,	//'取消'
				handler:function(){win.close();}
			}]
		});
		win.show();
	},
	
	//private 保存查询条件的方法
	saveQueryFn: function(queryId, caseUrl, caseWin) {
		var self = this;
		//请求参数
		var params = 'funid=sysevent&selfunid='+ self.funid;
		params += '&pagetype=grid&eventcode=cond_save&query_id='+ queryId;
		
		//组织查询条件明细信息
		self.storeDet.each(function(item) {
			params += '&' + Ext.urlEncode(item.data);
		});
		
		if (caseUrl) params += caseUrl;
		
		//刷新查询条件表数据
		var hdCall = function(data) {
			if (queryId.length == 0) {
				data.user_id = JxDefault.getUserId();
				var r = new (self.gridHis.getStore().reader.recordType)(data);
				self.gridHis.getStore().insert(0, r);
			}
			self.gridHis.getSelectionModel().selectRow(0);
			self.gridHis.fireEvent('rowclick', self.gridHis, 0);
			
			if (caseWin) caseWin.close();
		};
		
		//发送后台请求
		Request.postRequest(params, hdCall);
	},
	
	/**
	* private
	* 查询条件编辑表格
	* pageNode -- 当前功能的表格定义对象，用于取表格字段对象
	**/
	conditionGrid: function(pageNode) {
		var self = this;
		var condData = [];
		//创建存储对象
		var condStore = new Ext.data.ArrayStore({
			fields: [
			   {name: 'left_brack'},
			   {name: 'colcode'},
			   {name: 'condtype'},
			   {name: 'cond_value'},
			   {name: 'right_brack'},
			   {name: 'andor'},
			   {name: 'coltype'},
			   {name: 'col_no'}
			]
		});
		condStore.loadData(condData);
		self.storeDet = condStore;
		
		var editor = new Ext.ux.grid.RowEditor({
			name: JxUtil.newId() + '_qv',
			saveText: jx.base.ok,		//'确定'
			cancelText: jx.base.cancel,	//'取消'
			
			listeners: {
				show: function(){selectField(fieldCombo, true);},
				validateedit: function(ed, changes, r, rowIndex){
					//判断s是否包含不是c的字符
					var ischar = function(s, c) {
						if (s != null && s.length > 0) {
							for (var i = 0; i < s.length; i++) {
								if (s.charAt(i) != c) {
									return false;
								}
							}
						}
						return true;
					};
					//括号字段只能输入()
					var lv = changes['left_brack'];
					var rv = changes['right_brack'];
					if (lv != null && lv.length > 0 && !ischar(lv, '(')) {
						JxHint.alert('列【（】中只能输入 ( 字符！');
						return false;
					}
					if (rv != null && rv.length > 0 && !ischar(rv, ')')) {
						JxHint.alert('列【）】中只能输入 ) 字符！');
						return false;
					}
					return true;
				}
			}
		});
		//覆盖该方法，可以不提交修改进入下一行，但会有脚本错误
		//editor.isDirty = function(){return false};
		
		//复选模式
		var sm = new Ext.grid.CheckboxSelectionModel();
		
		//创建字段列表
		var fieldID = pageNode.id + '_hqf';
		var colm = pageNode.page.getColumnModel();
		var fieldData = [], mycols = colm.config;
		for (var i = 0, c = 0, n = mycols.length; i < n; i++){
			var col = mycols[i], fn = col.dataIndex;
			if (fn == null || fn.length == 0) continue;
			if (col.colindex >= 10000) continue;
			
			var len = fn.length;
			if (fn.substring(len-2) != 'id' || !col.hidden) {
				var h = col.header;
				if(!Ext.isNumber(h)){
					if (h.charAt(0) == '*') h = h.substr(1);
					fieldData[c++] = [fn, h];
				}
			}
		}
		var fieldCombo = Jxstar.createCombo(fieldID, fieldData, 100);
		
		//创建条件选项
		var condID = pageNode.id + '_hqc';
		var condData = ComboData.condtype;
		var condCombo = Jxstar.createCombo(condID, condData);
		
		//创建逻辑选项
		var andorID = pageNode.id + '_hqa';
		var andorData = [['and', jx.query.and], ['or', jx.query.or]];
		var andorCombo = Jxstar.createCombo(andorID, andorData);
		
		//监听字段选择的事件
		var vIndex = 4;
		var selectField = function(combo, isInit) {
			var field, coltype = 'string';
			//更换字段查询值的输入控件
			var mycols = pageNode.param.cols;
			for (var i = 0, n = mycols.length; i < n; i++){
				var mc = mycols[i].col, mf = mycols[i].field;
				if (mf && mf.name == combo.getValue()) {
					coltype = mf.type;
					if (!mc.hasOwnProperty('editor')) {
						if (coltype == 'string') { 
							field = new Ext.form.TextField({allowBlank:false});
						} else if (coltype == 'date') { 
							var format = JxUtil.getDateFormat(mc.renderer);//设置日期控件的样式，可能是月份样式
							field = new Ext.form.DateField({format:format, allowBlank:false});
						} else {
							field = new Ext.form.NumberField({allowBlank:false, maxLength:12});
						}
					} else {
						var oldcmp = mc.editor;
						//combo控件不能编辑，但可以删除选项值；combosel、combowin控件可以编辑；
						//由于db2数据库的查询值长度不能超过字段长度，才做这样的判断
						var iscombo = false;
						if (oldcmp.isXType('combo') && oldcmp.mode == 'local') {
							iscombo = true;
						}
						Ext.apply(oldcmp.initialConfig, {allowBlank:true, editable:!iscombo, cls:''});
						field = new oldcmp.constructor(oldcmp.initialConfig);
					}
					break;
				}
			}
			if (field == null) {
				field = new Ext.form.TextField({allowBlank:false});
			}
			//初始数据时才取原值
			if (isInit) {
				//取原字段的值
				var rowIndex = editor.rowIndex;
				var record = condStore.getAt(rowIndex);
			
				var oldval ='';
				if(record != null) oldval = record.get('cond_value');
				
				if (field.isXType('datefield')) {
					oldval = Ext.isDate(oldval) ? oldval.dateFormat('Y-m-d') : oldval;
					if (oldval.length > 0) oldval = oldval.split(' ')[0];
					oldval = Date.parseDate(oldval, "Y-m-d");
				}
			
				field.setValue(oldval);
			}
			
			//聚焦全选字段值
			field.selectOnFocus = true;
			//先删除原对象，再更新为新对象
			editor.remove(editor.getComponent(vIndex), true);
			editor.insert(vIndex, field);
			editor.verifyLayout();

			//更换字段查询条件的缺省值
			self.setCondDefault(condCombo, coltype, field.getXType());

			//保存字段数据类型
			editor.record.set('coltype', coltype);
		};
		fieldCombo.on('select', function(combo){selectField(combo, false);});
		
		//创建列对象
		var cm = new Ext.grid.ColumnModel([sm,
			//"左括号"
			{id:'left_brack', header:'（', width:30, dataIndex:'left_brack', hcss:'color:#004080;',
				editor:new Ext.form.TextField()
			},//"列名*"
			{id:'colcode', header:jx.query.colcode, width:130, dataIndex:'colcode', hcss:'color:#0000ff;',
				editor:fieldCombo,
				renderer:function(value){
					for (var i = 0; i < fieldData.length; i++) {
						if (fieldData[i][0] == value)
							return fieldData[i][1];
					}
				}
			},//"条件*"
			{id:'condtype', header:jx.query.cond, width:70, dataIndex:'condtype', hcss:'color:#0000ff;',
				editor:condCombo,
				renderer:function(value){
					for (var i = 0; i < condData.length; i++) {
						if (condData[i][0] == value)
							return condData[i][1];
					}
				}
			},//"查询值*"
			{id:'cond_value', header:jx.query.value, width:110, dataIndex:'cond_value', hcss:'color:#0000ff;',
				editor:new Ext.form.TextField(),
				renderer:function(value){
					var value = Ext.isDate(value) ? value.format('Y-m-d') : value;
					if (value.length > 0 && value.indexOf(' 00:00:00') >= 0) {//日期格式值处理
						value = value.split(' ')[0];
					}
					return value;
				}
			},//"右括号"
			{id:'right_brack', header:'）', width:30, dataIndex:'right_brack', hcss:'color:#004080;',
				editor:new Ext.form.TextField()
			},//"逻辑符"
			{id:'andor', header:jx.query.andor, width:50, dataIndex:'andor', hcss:'color:#004080;',
				editor:andorCombo,
				renderer:function(value){
					for (var i = 0; i < andorData.length; i++) {
						if (andorData[i][0] == value)
							return andorData[i][1];
					}
				}
			},
			{id:'col_no', header:jx.query.colno, width:40, dataIndex:'col_no', hcss:'color:#004080;',
				editor:new Ext.form.TextField()
			},//"序号"
			{id:'coltype', dataIndex:'coltype', hidden:true},
			{id:'colname', dataIndex:'colname', hidden:true}
		]);
		
		//新增查询条件
		var createQuery = function() {
			var c = new (condStore.reader.recordType)({
				left_brack: '',
				colcode: fieldData[0][0],
				condtype: condData[0][0],
				cond_value: '',
				right_brack: '',
				andor: andorData[0][0],
				coltype: 'string',
				col_no: '0'
			});
			
			editor.stopEditing();
			condStore.insert(0, c);
			condGrid.getView().refresh();
			condGrid.getSelectionModel().selectRow(0);
			editor.startEditing(0);
			//显示字段查询值输入控件
			fieldCombo.fireEvent('select', fieldCombo);
		};
		
		//删除查询条件
		var deleteQuery = function() {
			editor.stopEditing();
			var s = condGrid.getSelectionModel().getSelections();
			if (s == null || s.length == 0) {
				JxHint.alert(jx.query.delcond);	//'请选择要删除的查询条件！'
				return false;
			}
			for(var i = 0, r; r = s[i]; i++){
				condStore.remove(r);
			}
		};
		
		//创建工具栏
		var condTool = new Ext.Toolbar({deferHeight:true, 
			items:[
				{text:jx.base.add, iconCls:'eb_add', handler:createQuery}, 	//'添加'
				{text:jx.base.del, iconCls:'eb_delete', handler:deleteQuery}, 	//'删除'
				{text:jx.base.save, iconCls:'eb_save', handler:function(){self.saveQuery(self);}},	//'保存'
				{text:jx.query.save, iconCls:'eb_copy', handler:function(){self.saveQuery(self, true);}}	//'另存'
			]
		});
		
		//执行查询事件
		var executeQuery = function() {
			var cnt = condStore.getCount();
			if (cnt == 0) {
				JxHint.alert(jx.query.nocond);		//'查询条件为空，请添加查询条件！'
				return false;
			}
			
			for (var i = 0; i < condStore.getCount(); i++) {
				var record = condStore.getAt(i);
				var value = record.get('cond_value');
				if (Ext.isEmpty(value)) {
					JxHint.alert(String.format(jx.query.valempty, i+1));	//第{0}行的查询值为空，不能执行！
					return false;
				}
			}
			
			var query = self.getQuery(condStore);
			if (query == null) return false;
			condStore.commitChanges();
			/*系统升级需修改  begin*/
			//备份当前查询条件
			pageNode.page.queryBak=query;
			pageNode.page.extDetSql="";
			pageNode.page.queryTypeBak='1';
			/*系统升级需修改  end*/	
			
			//高级查询能查询到已提交记录，不处理归档
			Jxstar.myQuery(pageNode.page, query, '1');
		};
		
		//创建底部工具栏
		var buttons = [
				{text:'查询', iconCls:'eb_qry', handler:executeQuery}, 
				{text:'统计', iconCls:'eb_sum', handler:function(){
					//var query = self.getQuery(condStore);
					//JxGroup.showWindow(query, pageNode);
					JxGroupExt.caseWin(pageNode);
				}}
			];
			
		//创建表格对象
		var condGrid = new Ext.grid.GridPanel({
			store: condStore,
			cm: cm,
			sm: sm,
			tbar: condTool,
			plugins: [editor],
			
			frame:false,
			border:true,
			enableHdMenu: false,
			stripeRows: true,
			columnLines: true,
			viewConfig: {forceFit:true},
			
			buttonCls: '',
			buttonAlign: 'center',
			buttons: buttons
		});
		
		//点击一条记录时显示字段值控件，防止combo控件中直接输入值
		condGrid.on('rowdblclick', function(g, row){
			selectField(fieldCombo, true);
		});
		
		return condGrid;
	},
	
	/**
	* private
	* 取查询子句信息
	* store -- 查询明细对象，支持MixedCollection对象
	* return 返回数组：wheresql, value, type
	*/
	getQuery: function(store) {
		if (store == null || store.getCount() == 0) return null;
		
		var query = new Array('','','');
		
		var lb = '', rb = '';//记录左括号长度与右括号长度，如果长度相等则说明括号匹配。
		for (var i = 0; i < store.getCount(); i++) {
			var data;
			if (store.getAt) {
				data = store.getAt(i).data;
			} else {
				data = store.itemAt(i);
			}
			var left_brack = data['left_brack'];
			var colcode = data['colcode'].replace('__', '.');
			var condtype = data['condtype'];
			var cond_value = data['cond_value'];
			var right_brack = data['right_brack'];
			var andor = data['andor'];
			var coltype = data['coltype'];
			
			lb += left_brack.trim();
			rb += right_brack.trim();
			
			/*系统升级需修改  begin*/
			//备份当前查询条件
			if (condtype == 'is null') {
				cond_value = '~null~';
			}
			/*系统升级需修改  end*/	

			if (Ext.isEmpty(cond_value)) continue;
			
			//如果是空值判断
			if (cond_value == '~null~') {
				if (condtype == '<>') {
					query[0] += colcode + ' is not null ' + andor + ' ';
				} else {
					query[0] += colcode + ' is null ' + andor + ' ';
				}
				continue;
			}
			
			
			//如果是日期对象，则需要转换为字符串
			cond_value = Ext.isDate(cond_value) ? cond_value.dateFormat('Y-m-d') : cond_value;
			
			var values = this.getQueryValue(cond_value, condtype, coltype);
			/*系统升级需修改  begin*/
			var upperfields=Jxstar.systemVar.opr__sys__uppercase__field||'_';
			var colname=colcode.substring(colcode.indexOf('.')+1);
			if(upperfields.indexOf(colname)>=0){
				colcode='upper('+colcode.toUpperCase()+')';
				values[0]=values[0].toUpperCase();
			}
			/*系统升级需修改  end*/
			//日期类型'=' 改为 >=? and <?查询
			if (condtype == "=" && coltype == "date") {
				query[0] += left_brack;
				query[0] += "(" + colcode + " >= ? and " + colcode + " < ? )";
				query[0] += right_brack;
				query[0] += " " + andor + " ";

				var nextDate = JxUtil.getNextDate(values[0], 1);
				query[1] += values[0]+";"+nextDate + ";";
				query[2] += coltype+";"+coltype + ";";
			} else {
				query[0] += left_brack;
				query[0] += colcode + this.getCondType(condtype) + "?";
				query[0] += right_brack;
				query[0] += " " + andor + " ";

				query[1] += values[0] + ";";
				query[2] += values[1] + ";";
			}
		}
		
		if (lb.length != rb.length) {
			JxHint.alert('左边与右边的括号不匹配，不能执行查询！');
			return null;
		}
		
		if (query[0].length > 0) {
			query[0] = "(" + query[0].substr(0, query[0].length - (andor.length + 1)) + ")";
		}
		if (query[1].length > 0) {
			query[1] = query[1].substr(0, query[1].length - 1);
		}
		if (query[2].length > 0) {
			query[2] = query[2].substr(0, query[2].length - 1);
		}

		return query;
	},
	
	/**
	* public
	* 取查询子句信息
	* colcode -- 字段
	* condtype -- 条件
	* value -- 查询值
	* coltype -- 字段类型
	* return 返回数组：wheresql, value, type
	*/
	getWhere: function(colcode, condtype, value, coltype) {
		var query = new Array('','','');
		if (Ext.isEmpty(value)){
			/*系统升级需修改  begin*/
			if(condtype=='is null'){
				query[0] = colcode + ' is null';
			}
			/*系统升级需修改  end*/
			return query;
		} 
		
		//如果是空值判断
		if (value == '~null~') {
			if (condtype == '<>') {
				query[0] = colcode + ' is not null';
			} else {
				query[0] = colcode + ' is null';
			}
			return query;
		}
		/*系统升级需修改  begin*/
		var upperfields=Jxstar.systemVar.opr__sys__uppercase__field||'_';
		var colname=colcode.substring(colcode.indexOf('.')+1);
		if(upperfields.indexOf(colname)>=0){
			colcode='upper('+colcode.toUpperCase()+')';
			value=value.toUpperCase();
		}
		/*系统升级需修改  end*/
		//如果是日期对象，则需要转换为字符串
		value = Ext.isDate(value) ? value.dateFormat('Y-m-d') : value;
			
		var values = this.getQueryValue(value, condtype, coltype);
		
		if (condtype == "=" && coltype == "date") {
			query[0] += "(" + colcode + " >= ? and " + colcode + " < ? )";

			var nextDate = JxUtil.getNextDate(values[0], 1);
			query[1] += values[0]+";"+nextDate;
			query[2] += coltype+";"+coltype;
		} else {
			query[0] += colcode + this.getCondType(condtype) + "?";

			query[1] += values[0];
			query[2] += values[1];
		}

		return query;
	},
	
	/**
	* private
	* 返回条件语句
	* condtype -- 条件选项值
	*/
	getCondType: function (condtype) {
		var ret = "like";
		if (condtype == "") {
			return ret;
		}

		switch (condtype) {
			case '=':
				ret = " = ";
				break;
			case '>':
				ret = " > ";
				break;
			case '<':
				ret = " < ";
				break;
			case '>=':
				ret = " >= ";
				break;
			case '<=':
				ret = " <= ";
				break;
			case '<>':
				ret = " <> ";
				break;
			case 'llike':
				ret = " like ";
				break;
			case 'rlike':
				ret = " like ";
				break;
			case 'like':
				ret = " like ";
				break;
		}

		return ret;
	},

	/**
	* private
	* 返回查询内容值
	* value -- 查询值
	* condtype -- 条件类型
	* coltype -- 字段类型
	* return 返回数组：查询值与数据类型 
	*/
	getQueryValue: function(value, condtype, coltype) {
		var ret = new Array();

		switch (coltype) {
			case 'string':
				if (condtype == "llike") {
					ret[0] = value + "%";
				} else if (condtype == "rlike") {
					ret[0] = "%" + value;
				} else if (condtype == "like") {
					ret[0] = "%" + value + "%";
				} else {
					ret[0] = value;
				}

				ret[1] = "string";
				break;
			case 'int':
				ret[0] = value;
				ret[1] = "int";
				break;
			case 'date':
				//如果不含时间，且是< <=判断，则添加时间
				if (value.indexOf(' ') < 0 && (condtype == '<=')) {
					value += ' 23:59:59';
				}
				ret[0] = value;
				ret[1] = "date";
				break;
			case 'float':
				ret[0] = value;
				ret[1] = "double";
				break;
			default :
				ret[0] = value;
				ret[1] = coltype;
				break;
		}

		return ret;
	},
	
	
	/**
	* private
	* 处理条件选项缺省值
	* condCombo -- 条件选项
	* coltype -- 字段类型
	* ctlType -- 控件类型
	*/
	setCondDefault: function(condCombo, coltype, ctlType) {
		var cs = condCombo.store;
		var cr = cs.reader.recordType;
		if (coltype == 'string') {
			if (cs.getCount() == 5) {
				cs.insert(5, new cr({value:'llike', text:jx.query.llike}));	//'左匹配'
				cs.insert(6, new cr({value:'rlike', text:jx.query.rlike}));	//'右匹配'
				cs.insert(7, new cr({value:'like', text:jx.query.like}));	//'类似'
			}
			
			condCombo.setValue('like');
			if (ctlType == 'combo') {
				condCombo.setValue('=');
			}
		} else {
			condCombo.setValue('=');
			//非字符类型去掉类似查询
			if (cs.getCount() == 8) {
				cs.remove(cs.getAt(7));
				cs.remove(cs.getAt(6));
				cs.remove(cs.getAt(5));
			}
		}
	}

	});//Ext.apply

})();
