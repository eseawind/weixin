/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
  
/**
 * 构建分组统计界面
 * 
 * @author TonyTan
 * @version 1.0, 2012-04-18
 */
JxGroupPage = {};
(function(){

	Ext.apply(JxGroupPage, {
	funId:'',
	selchars:[],
	selnums:[],
	charfields:'', //统计分类字段，带表名，防止多表列名重复
	numfields:'',  //统计数据字段，带表名，防止多表列名重复
	groupPage:null,
	statGrid:null,
	statTool:null,
	pageNode:null,
	
	/**
	* public 返回页面对象
	* 
	**/
	createPage: function(statId, pageNode) {
		var self = this;
		self.pageNode = pageNode;
		self.funId = pageNode.nodeId;
		
		var srcGrid = self.pageNode.page;
		var opt = srcGrid.getStore().lastOptions;
		if (!opt) {
			JxHint.alert('当前表格没有查询结果，不能执行统计方案！');
			return;
		} 
		
		var	page = new Ext.Container({
			broder:false,
			layout:'border',
			items:[{
				xtype:'container',
				region:'north',
				layout:'fit',
				height:200
			},{
				xtype:'container',
				region:'center',
				layout:'fit',
				style:'border-top:1px solid #99bbe8;'
			}]
		});
		
		self.groupPage = page;
		self.loadCase(statId);
		
		page.on('beforeclose', function(){
			if (!self.statGrid != null) self.statGrid.destroy();
			self.funId = '';
			self.selchars = [];
			self.selnums = [];
			self.charfields = '';
			self.numfields = '';
			self.groupPage = null;
			self.statGrid = null;
			self.statTool = null;
			self.pageNode = null;
		});
		
		return page;
	},
	
	//从后台加载方案字段
	loadCase: function(statId, page) {
		var self = this;
		var endcall = function(data) {
			//alert(Ext.encode(data));
			var grid = self.createGrid(data);
			self.statGrid = grid;
			self.groupPage.getComponent(0).add(grid);
			self.groupPage.doLayout();
		};
		var params = 'funid=sys_stat&pagetype=grid&eventcode=selcase&keyid=' + statId;
		Request.postRequest(params, endcall);
	},
	
	//转换combo中真实值为显示值，如果日期格式的转换为字符串
	comboCvt: function(field) {
		var self = this;
		//如果日期格式的转换为字符串
		var drend = function(v, record) {
			return Ext.isDate(v) ? v.format('Y-m-d') : v;
		};
		
		var param = self.pageNode.param;
		var cols = param.cols;
		if (!cols || cols.length == 0) return drend;
		
		for (var i = 0; i < cols.length; i++) {
			var f = cols[i].field;
			if (!f || f.name.length == 0) continue;
			//判断如果当前字段是combo类型，则返回显示值转换函数
			if (f.name.indexOf('__'+field) > 0) {
				var c = cols[i].col;
				if (c.editor && c.editor.isXType('combo')) {
					return c.renderer;
				}
			}
		}
		return drend;
	},
	
	//创建统计数据表格
	createGrid: function(config) {
		var self = this;
		//保存标题列与字段列
		var cm = [], cols = [], c = 0, f = 0;

		//取分组字段
		var charfields = '', chars = config.chars;
		for (var i = 0, n = chars.length; i < n; i++) {
			var text = chars[i].colname;
			var field = chars[i].colcode.split('__')[1];

			charfields += chars[i].colcode.replace('__', '.') + ',';
			
			self.selchars[i] = [field, text];
			cols[f++] = {name:field, type:'string', convert:self.comboCvt(field)};
			cm[c++] = {header:text, width:150, dataIndex:field};
		}
		if (charfields.length > 0) {
			charfields = charfields.substr(0, charfields.length-1);
		}
		self.charfields = charfields;
		
		//取统计字段
		var numfields = '', nums = config.nums;
		for (var i = 0, n = nums.length; i < n; i++) {
			var text = nums[i].colname;
			var field = nums[i].colcode
			if (field != 'recordnum') {
				numfields += field.replace('__', '.') + ',';
				field = field.split('__')[1];
			}
			
			self.selnums[i] = [field, text];
			cols[f++] = {name:field};
			cm[c++] = {header:text, width:100, dataIndex:field};
		}
		if (numfields.length > 0) {
			numfields = numfields.substr(0, numfields.length-1);
		}
		self.numfields = numfields;
		
		//查询数据URL
		var url = Jxstar.path + '/commonAction.do';
		var params = self.getStatParams();
		
		//创建数据对象
		var store = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				method: 'POST',
				url: url,
				listeners: {exception: function(a, b, c, d, e, f){
					store.removeAll();
					e.srcdesc = 'group_page.js?url='+url;
					JxUtil.errorResponse(e);
				}}
			}),
			reader: new Ext.data.JsonReader({
				root: 'data.root',
				totalProperty: 'data.total'
			}, cols),
			remoteSort: true,
			pruneModifiedRecords: true
		});
		store.on('load', function(){
			self.createImage();
		});
		store.load({params:params});
		
		self.statTool = self.createGroup();
		//创建表格对象
		var queryGrid = new Ext.grid.GridPanel({
			store: store,
			columns: cm,
			border: false,
			stripeRows: true,
			columnLines: true,
			viewConfig: {forceFit: true},
			bbar:self.statTool
		});
		return queryGrid;
	},
	
	//统计需要参数
	getStatParams: function() {
		var self = this;
		//取当前功能的最后查询的SQL
		var srcGrid = self.pageNode.page;
		var opt = srcGrid.getStore().lastOptions.params || {};
		var e = encodeURIComponent;
		
		var where_sql = opt.where_sql;
		var where_value = opt.where_value;
		var where_type = opt.where_type;
		var query_type = opt.query_type;
		//如果是来自高级查询，则直接从查询条件表中取条件
		var condGrid = self.pageNode.condGrid;
		if (condGrid) {
			var store = condGrid.getStore();
			var query = JxQuery.getQuery(store);
			if (query) {
				where_sql = query[0];
				where_value = query[1];
				where_type = query[2];
				query_type = '1';
			}
		}
		
		var params = 'funid=queryevent&query_funid='+ self.funId + '&pagetype=grid&eventcode=group_stat';
		params += '&where_sql='+ e(where_sql||'') + '&where_value='+ e(where_value||'');
		params += '&where_type='+(where_type||'') + '&query_type=' + query_type||'0';
		params += '&charfield='+self.charfields+'&numfield='+self.numfields + '&user_id='+Jxstar.session['user_id'];
		
		return params;
	},
	
	//导出统计数据
	exportXls: function() {
		var self = this;
		//图形类型
		var type = 'columnchart';
		Ext.each(self.statTool.findByType('radio'), function(item){
			if (item.checked == true) {
				type = item.inputValue;
				return;
			}
		});
		//取分组字段与统计字段
		var chars = self.statTool.find('name', 'group_field')[0];
		var nums = self.statTool.find('name', 'stat_field')[0];
		var charTitle = chars.el.dom.value;
		var numTitle = nums.el.dom.value;
		//从表格中取数据传到后台，格式：第一行：列名1,列名2,...；第二行开始就是数据；行用\n分割，列用,分隔；
		var expText = JxUtil.gridToCSV(self.statGrid, false).trim();
		//构建请求参数
		var params = 'funid=queryevent&query_funid='+ self.funId + '&pagetype=grid&eventcode=group_exp';
		params += '&chart_type=' + type + '&selchar=' + charTitle + '&selnum=' + numTitle + '&dataType=xls';
		//导出xls文件
		Request.expFile(params, {exp_text:expText});
	},
	
	//创建统计面板
	createGroup: function() {
		var self = this;
		var toolbar = new Ext.Toolbar({
				items:['-',
				   {xtype:'label', text:jx.group.groupfield},
				   {width: 100,
					xtype:'combo', 
					name:'group_field', store: new Ext.data.SimpleStore({
						fields:['value','text'],
						data: self.selchars
					}),
					mode: 'local',
					triggerAction: 'all',
					valueField: 'value',
					displayField: 'text',
					editable:false, allowBlank:false, 
					value: self.selchars[0][0]
				 },'-',{xtype:'label', text:jx.group.statfield},
				   {width: 100,
					xtype:'combo', 
					name:'stat_field', store: new Ext.data.SimpleStore({
						fields:['value','text'],
						data: self.selnums
					}),
					mode: 'local',
					triggerAction: 'all',
					valueField: 'value',
					displayField: 'text',
					editable:false, allowBlank:false, 
					value: self.selnums[0][0]
				},'-',
				{xtype:'label', text:jx.group.chattype+':'},
				{xtype:'radio', boxLabel:jx.group.col, width:60, name:'chart_type', inputValue:'columnchart', checked: true},
				{xtype:'radio', boxLabel:jx.group.pie, width:60, name:'chart_type', inputValue:'piechart'},
				{xtype:'radio', boxLabel:jx.group.line, width:60, name:'chart_type', inputValue:'linechart'},
				'-',
				{xtype:'button', iconCls:'eb_chart', text:'图形分析', handler:self.createImage.createDelegate(self)},
				{xtype:'button', iconCls:'eb_expxls', text:'另存excel', handler:self.exportXls.createDelegate(self)}
			]});
		return toolbar;
	},
	
	//创建图形面板
	createImage: function() {
		var self = this;
		//先删除子对象
		var ct = self.groupPage.getComponent(1);
		ct.removeAll(true);
		//统计数据
		var store = self.statGrid.getStore();
		//图形类型
		var type = 'columnchart';
		Ext.each(self.statTool.findByType('radio'), function(item){
			if (item.checked == true) {
				type = item.inputValue;
				return;
			}
		});
		//取分组字段与统计字段
		var chars = self.statTool.find('name', 'group_field')[0];
		var nums = self.statTool.find('name', 'stat_field')[0];
		//创建图表输出对象
		var chartPanel = JxGroup.createChartImage(store, chars.getValue(), nums.getValue(), type);
		
		ct.add(chartPanel);
		self.groupPage.doLayout();
	}
	
	});//Ext.apply

})();