/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 分组统计与图表生成工具类。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

JxGroup = {};
(function(){

	Ext.apply(JxGroup, {
	//当前功能ID
	funId: '',
	//非数字字段
	charFields: [],
	//数字字段
	numFields: [],
	//已选择的分组字段库
	selCharStore: null,
	//已选择的统计字段ku
	selNumStore: null,
	//已选择的分组字段
	selCharField: [],
	//已选择的统计字段
	selNumField: [],
	//统计结果表格
	statGrid: null,
	//查询条件数组[sql, value, type]
	querys: [],
	
	//当前对话窗口
	groupWin: null,
	
	/**
	* private
	* 初始化参数
	**/
	init: function(querys, pageNode) {
		this.funId = pageNode.nodeId;
		this.querys = querys || {};
		this.charFields = [];
		this.numFields = [];
		this.selCharField = [];
		this.selNumField = [];
		
		//取字段信息
		var fieldNames = [], mycols = pageNode.param.cols;
		for (var i = 0, b = 0, c = 0, n = mycols.length; i < n; i++) {
			var mc = mycols[i].col, mf = mycols[i].field;
			if (mc && mf) {
				var h = mc.header;
				if (h.charAt(0) == '*') h = h.substr(1);
				
				var data = [mf.name, h];
				var type = mf.type;
				
				if (type == 'int' || type == 'float') {
					this.numFields[b++] = data;
				} else {
					this.charFields[c++] = data;
				}
			}
		}
	},

	/**
	* public
	* 显示分组统计的选择分组字段窗口
	* querys -- 查询条件数组[sql, value, type]
	* pageNode -- 当前功能的表格定义对象，用于取表格字段对象
	**/
	showWindow: function(querys, pageNode) {
		var self = this;
		//初始化参数
		self.init(querys, pageNode);
		//创建对话框
		self.groupWin = new Ext.Window({
			title:jx.group.seltitle,	//选择分组字段
			layout:'fit',
			width:400,
			height:450,
			resizable:true,
			modal:true,
			closeAction:'close',
			items:[{html:''}],
			
			buttons:[{text:jx.base.ok},{text:jx.base.cancel}],
			listeners: {beforeclose: function(){
			//窗口关闭前清除所有对象
					if (self.statGrid != null) self.statGrid.destroy();
					self.funId = null;
					self.charFields = null;
					self.numFields = null;
					self.selCharStore = null;
					self.selNumStore = null;
					self.selCharField = null;
					self.selNumField = null;
					self.statGrid = null;
					self.querys = null;
					self.groupWin = null;
				}}
		});
		self.groupWin.show();
		
		self.showGroupField();
	},
	
	/**
	* private
	* 显示选择分组字段的窗口
	**/
	showGroupField: function() {
		var self = this;
		//创建新的内容区
		var jxLists = new JxLists({
			leftData:self.charFields, 
			leftHeader:jx.group.nonum, 	//非数字字段
			rightHeader:jx.group.selnonum	//已选择分组字段
		});
		var listPanel = jxLists.render();
		//创建新的按钮
		var buttons = [{
				text:jx.group.next,		//下一步
				width:70,
				handler:function(){
					self.selCharStore = jxLists.getSelectStore();
					if (self.selCharStore.getCount() == 0) {
						JxHint.alert(jx.group.nofield);	//没有选择字段，不能执行分组统计！
						return false;
					}
					
					//显示选择统计字段
					self.showNumField();
				}
			},{
				text:jx.base.cancel,		//取消
				width:70,
				handler:function(){self.groupWin.close();}
			}];
		
		//更新窗口内容
		self.updateWindow(jx.group.seltitle, 400, listPanel, buttons);
	},
	
	/**
	* private
	* 显示选择统计字段的窗口
	**/
	showNumField: function() {
		var self = this;
		//创建新的内容区
		var jxLists = new JxLists({
			leftData:self.numFields, 
			leftHeader:jx.group.numfield, 	//数字字段
			rightHeader:jx.group.selfield	//已选择统计字段
		});
		var listPanel = jxLists.render();
		//创建新的按钮
		var buttons = [{
				text:jx.group.pre,			//上一步
				width:70,
				handler:function(){
					//显示选择分组字段
					self.showGroupField();
				}
			},{
				text:jx.group.stat,		//统计
				width:70,
				handler:function(){
					self.selNumStore = jxLists.getSelectStore();
					//如果存在原表格则删除
					if (self.statGrid != null) {
						self.statGrid.remove();
					}
					//显示选择统计字段
					self.showGroupData(true);
				}
			},{
				text:jx.base.cancel,
				width:70,
				handler:function(){self.groupWin.close();}
			}];
		
		//选择统计字段，缺省包含【记录数】统计字段
		self.updateWindow(jx.group.stattitle, 400, listPanel, buttons);
	},
	
	/**
	* private
	* 显示分组统计结果的窗口
	* isnew -- 是否需要重新统计
	**/
	showGroupData: function(isnew) {
		var self = this;
		//创建新的按钮
		var buttons = [{
				text:jx.group.outchat,	//输出图表
				width:70,
				handler:function(){
					self.showChartConfig();
				}
			},{
				text:jx.group.saveas,	//另存数据
				width:70,
				handler:function(){
					//把grid中的数据保存为csv格式的文件, 统计数据.csv
					Request.exportCSV(self.statGrid, jx.group.statdata+'.csv');
				}
			},{
				text:jx.group.back,	//返回
				width:70,
				handler:function(){self.showNumField();}
			},{
				text:jx.base.close,	//关闭
				width:70,
				handler:function(){self.groupWin.close();}
			}];
		/**********************不需要重新统计，直接显示原统计表格*************/
		//上面的代码用于构建buttons.另存数据的url，所以放到上面了
		if (!isnew && self.statGrid != null) {
			self.updateWindow(jx.group.restitle, 700, self.statGrid, buttons);	//分组统计结果
			return;
		}		
		
		//保存标题列与字段列
		var cm = [], cols = [], c = 0, f = 0;
	
		//取分组字段
		var charfields = '', fieldStore = self.selCharStore;
		for (var i = 0, n = fieldStore.getCount(); i < n; i++) {
			var text = fieldStore.getAt(i).get('text');
			var field = fieldStore.getAt(i).get('value').split('__')[1];
			
			charfields += field + ',';
			
			self.selCharField[i] = [field, text];
			cols[f++] = {name:field, type:'string'};
			cm[c++] = {header:text, width:150, dataIndex:field};
		}
		if (charfields.length > 0) {
			charfields = charfields.substr(0, charfields.length-1);
		}
		
		//取统计字段
		var numfields = '', fieldStore = self.selNumStore;
		for (var i = 0, n = fieldStore.getCount(); i < n; i++) {
			var text = fieldStore.getAt(i).get('text');
			var field = fieldStore.getAt(i).get('value').split('__')[1];
			
			numfields += field + ',';
			
			self.selNumField[i] = [field, text];
			cols[f++] = {name:field};
			cm[c++] = {header:text, width:100, dataIndex:field};
		}
		self.selNumField[self.selNumField.length] = ['recordnum', jx.group.recnum];	//记录数
		if (numfields.length > 0) {
			numfields = numfields.substr(0, numfields.length-1);
		}
		
		//添加记录数字段
		cm[c++] = {header:jx.group.recnum, width:100, dataIndex:'recordnum'};	//记录数
		cols[f++] = {name:'recordnum'};
		
		//解析查询参数
		var where_sql = self.querys[0] || '';
		var where_value = self.querys[1] || '';
		var where_type = self.querys[2] || '';
		
		/**************************重新统计结果*******************************/
		var e = encodeURIComponent;	//编码
		var params = 'funid=queryevent&query_funid='+ self.funId + '&pagetype=grid&eventcode=group_stat';
		params += '&where_sql='+ e(where_sql) + '&where_value='+ e(where_value);
		params += '&where_type='+where_type + '&query_type=1';
		params += '&charfield='+charfields+'&numfield='+numfields+'&user_id='+Jxstar.session['user_id'];

		//查询数据URL
		var url = Jxstar.path + '/commonAction.do';
		//创建数据对象
		var queryStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				method: 'POST',
				url: url,
				listeners: {exception: function(a, b, c, d, e, f){
					queryStore.removeAll();
					e.srcdesc = 'JxGroup.js?params='+params;
					JxUtil.errorResponse(e);
				}}
			}),
			reader: new Ext.data.JsonReader({
				root: 'data.root',
				totalProperty: 'data.total'
			}, cols)
		});
		queryStore.load({params:params});
		
		//创建表格对象
		var queryGrid = new Ext.grid.GridPanel({
			store: queryStore,
			columns: cm,
			border: false,
			stripeRows: true,
			columnLines: true
		});
		
		//保存统计表格
		self.statGrid = queryGrid;
		
		//更新窗口内容
		self.updateWindow(jx.group.restitle, 700, queryGrid, buttons);	//分组统计结果
	},
	
	/**
	* private
	* 显示图表输出设置的窗口
	**/
	showChartConfig: function() {
		var self = this;
		//创建新的内容区
		var chartForm = new Ext.form.FormPanel({
			style:'padding:20px;',
			broder:false,
			baseCls: 'x-plain',
			items:[{
				xtype:'fieldset',
				title:jx.group.datafield,	//'数据字段'
				items:[{
					xtype:'combo', fieldLabel:jx.group.groupfield, //'分组字段:'
					name:'group_field', store: new Ext.data.SimpleStore({
						fields:['value','text'],
						data: self.selCharField
					}),
					mode: 'local',
					triggerAction: 'all',
					valueField: 'value',
					displayField: 'text',
					editable:false, allowBlank:false, 
					value: self.selCharField[0][0]
				},{
					xtype:'combo', fieldLabel:jx.group.statfield, 	//'统计字段:'
					name:'stat_field', store: new Ext.data.SimpleStore({
						fields:['value','text'],
						data: self.selNumField
					}),
					mode: 'local',
					triggerAction: 'all',
					valueField: 'value',
					displayField: 'text',
					editable:false, allowBlank:false, 
					value: self.selNumField[0][0]
				}]
			},/*{
				xtype:'fieldset',
				title:'图表标题',
				items:[{
					xtype:'textfield', fieldLabel:'图表标题:', name:'chart_title', maxLength:40
				}]
			},*/{
				xtype:'fieldset',
				title:jx.group.chattype,	//'图表类型'
				items:[{
					xtype:'radiogroup',
					fieldLabel:jx.group.chattype+':',	//'图表类型'
					name:'chart_type',
					items:[
						{boxLabel:jx.group.pie, name:'chart_type', inputValue:'piechart', checked: true},	//'饼状'
						{boxLabel:jx.group.col, name:'chart_type', inputValue:'columnchart'},				//'柱状'
						{boxLabel:jx.group.line, name:'chart_type', inputValue:'linechart'}				//'线型'
					]
				}]
			}]
						
		});
		//创建新的按钮
		var buttons = [{
				text:jx.group.createchat,	//'生成图表'
				width:70,
				handler:function(){
					var form = chartForm.getForm();
					var charField = form.findField('group_field').getValue();
					var numField = form.findField('stat_field').getValue();
					var chartType = form.findField('chart_type').getValue().inputValue;
					//JxHint.alert(charField+';'+numField+';'+chartType);
					self.showChartImage(charField, numField, chartType);
				}
			},{
				text:jx.group.back,	//'返回'
				width:70,
				handler:function(){
					//不再重新统计
					self.showGroupData(false);
				}
			},{
				text:jx.base.close,	//'关闭'
				width:70,
				handler:function(){self.groupWin.close();}
			}];
		
		//更新窗口内容
		self.updateWindow(jx.group.outset, 400, chartForm, buttons);	//'图表输出设置'
	},
	
	/**
	* public
	* 创建图表输出控件，在首页PORTLET中也用到
	* store -- 显示数据
	* charField -- 分类字段
	* numField -- 数值字段
	* chartType -- 图形类型
	**/
	createChartImage: function(store, charField, numField, chartType) {
		var self = this;
		//创建图表输出对象
		var piechart = {
				store: store,
				xtype: chartType,
				dataField: numField,
				categoryField: charField,
				extraStyle: {
					legend: {
						display: 'right',
						padding: 5,
						font:{family: 'Tahoma',size: 13}
					}
				}
			};
		//计算y轴的最大值与间隔值
		var maxs = [100, 10];
		if (chartType != 'piechart') {
			maxs = self.maxValue(store, numField);
		}
		var colchart = {
				store: store,
				xtype: chartType,
				yField: numField,
				xField: charField,
				yAxis: new Ext.chart.NumericAxis({
					maximum: maxs[0],
					majorUnit: maxs[1]
					//labelRenderer:Ext.util.Format.int
				}),
				tipRenderer : function(chart, record){
					return record.get(charField) + 
						   jx.group.val + record.get(numField);	//'值: '
				}
			};
		
		//创建新的内容区
		var chartPanel = new Ext.Panel({
			border: false,
			items: (chartType == 'piechart') ? piechart : colchart
		});
		
		return chartPanel;
	},
	
	/**
	* private
	* 显示图表输出结果的窗口
	**/
	showChartImage: function(charField, numField, chartType) {
		var self = this;
		//统计数据
		var store = self.statGrid.getStore();
		//创建图表输出对象
		var chartPanel = self.createChartImage(store, charField, numField, chartType);
		
		//创建新的按钮
		var buttons = [{
				text:jx.group.back,		//'返回'
				width:70,
				handler:function(){
					self.showChartConfig();
				}
			},{
				text:jx.base.close, 	//'关闭'
				width:70,
				handler:function(){self.groupWin.close();}
			}];
		
		//更新窗口内容
		self.updateWindow(jx.group.chattitle, 700, chartPanel, buttons);	//'图表输出结果'
	},
	
	/**
	* private
	* 更新对话框中的内容
	**/
	updateWindow: function(title, width, mainPanel, buttons) {
		var win = this.groupWin;
		win.setTitle(title);
		//清除原内容区，如果原控件是统计表格，则不销毁
		var oldPanel = win.getComponent(0);
		if (oldPanel != null) {
			if (oldPanel.isXType('grid')) {
				oldPanel.hide();
			} else {
				win.remove(oldPanel, true);
			}
		}
		//添加新内容区，如果是原统计数据表格，则只需要显示就可以了
		if (mainPanel.isXType('grid') && mainPanel.hidden == true) {
			mainPanel.show();
		} else {
			win.insert(0, mainPanel);
		}
		
		//清除原按钮
		win.fbar.removeAll(true);
		//添加新按钮
		win.fbar.add(buttons);
		//刷新页面
		win.setWidth(width);
		win.doLayout();
		win.center();
	},
	
	/**
	* private
	* 取统计数据中的最大值，并计算(最大值-最小值)/10
	**/
	maxValue: function(store, field) {
		var max = 0, min = 0;
		for (var i = 0, n = store.getCount(); i < n; i++) {
			var val = store.getAt(i).get(field);
			val = (new Number(val)).valueOf();
			if (val > max) max = val;
			if (val < min) min = val;
		}
		if (max == 0) max = 100;
		
		//判断统计值是否为整数
		var isInt = (parseInt(max) == max && parseInt(min) == min);
		
		var interval = (max - min)/10;
		if (isInt) {
			interval = parseInt(interval);
			if (interval == 0) interval = 1;
		} else {
			interval = parseFloat(interval).toFixed(2);
		}
		
		return [max, interval];
	}
	
	});//Ext.apply

})();
