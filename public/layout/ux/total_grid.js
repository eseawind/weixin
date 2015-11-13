/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
  
/**
 * 构建统计报表表格
 * 
 * @author TonyTan
 * @version 1.0, 2011-01-01
 */
JxTotalGrid = {};
(function(){

	Ext.apply(JxTotalGrid, {
	
	/**
	* public 返回表格对象
	* data -- 参数格式{toolfn:fn, cols:[{col_code:, display:, format:, combo_code:, is_show:, col_width:},...], 
	*                  groups:[{header:, colspan:, align:'center'},...], reportId:''}
	**/
	createGrid: function(config) {
		var self = this;
		//构建工具栏，由于有相关控件的数据
		//所以在后台直接生成工具栏返回前台
		var toolbar = config.toolfn();
		
		//构建store
		var fields = self.createFields(config.cols);
		var store = new Ext.data.Store({
			reader: new Ext.data.JsonReader({
				root: 'root',
				totalProperty: 'total'
			}, fields)
		});
		
		//构建表格分组标题
		var group, titles = config.groups;
		if (titles.length > 0) {
			titles[0].colspan += 1;
			group = new Ext.ux.grid.ColumnHeaderGroup({rows: [titles]});
		}
		
		//单元格选择
		var sm = new Ext.grid.CellSelectionModel();
		
		//构建表格
		var totalgrid = new Ext.grid.GridPanel({
			tbar: toolbar,
			columns: self.createColumns(config.cols),
			border:false,
			loadMask: true,
			columnLines: true,	//显示列分隔线
			sm: sm,
			store: store,
			stripeRows: true,	//显示斑马线
			enableHdMenu: false,
			enableColumnMove: false,
			plugins: group
		});
		//给统计参数赋缺省值
		totalgrid.on('afterrender', self.setToolDefault);
		//添加数据钻取事件
		totalgrid.on('cellclick', self.showDrill);
		
		//添加统计、打印、另存数据按钮
		toolbar.addButton({iconCls:'eb_stat', text:'统计', handler:function(){self.exeStat(config.nodeid, totalgrid, config);}});
		toolbar.addButton({iconCls:'eb_print', text:'打印', handler:function(){self.outputXls(config.reportId, totalgrid);}});
		toolbar.addButton({iconCls:'eb_expxls', text:'另存数据', handler:function(){Request.exportCSV(totalgrid, '统计数据.csv', false);}});
		toolbar.doLayout();
		
		return totalgrid;
	},
	
	/**
	* public 返回纯统计表格对象
	* config -- 参数格式{cols:[{col_code:, display:, format:, combo_code:, hidden:, col_width:},...], 
					   data:[{...},{...},{...}...],
	*                  groups:[{header:, colspan:, align:'center'},...]}
	**/
	createData: function(config) {
		var self = this;
		
		//构建store
		var fields = self.createFields(config.cols);
		var store = new Ext.data.Store({
			reader: new Ext.data.JsonReader({
				root: 'data',
				totalProperty: ''
			}, fields)
		});
		
		//构建表格分组标题
		var group, titles = config.groups;
		if (titles.length > 0) {
			group = new Ext.ux.grid.ColumnHeaderGroup({rows: [titles]});
		}
		
		//构建表格
		var grid = new Ext.grid.GridPanel({
			border:false,
			columns: self.createColumns(config.cols),
			loadMask: true,
			columnLines: true,	//显示列分隔线
			store: store,
			stripeRows: true,	//显示斑马线
			enableHdMenu: false,
			enableColumnMove: false,
			plugins: group
		});
		store.loadData(config);
		
		return grid;
	},
	
	//执行统计
	exeStat: function(nodeid, grid, config) {
		var tbar = grid.getTopToolbar();
		var params = '';
		var novalid = false;
		
		//执行外部扩展的统计前事件
		if (config.preStatEvent) {
			if (!config.preStatEvent(grid, config)) return;
		}
		
		//取工具栏中的参数值与有效性
		tbar.items.each(function(item){
			if (item.isXType('field')) {
				if (item.isValid() == false) {
					novalid = true;
					return false;
				}
				var val = item.getValue();
				val = Ext.isDate(val) ? val.dateFormat('Y-m-d H:i:s') : val;
				params += '&' + item.getName() + '=' + val;
			}
		});
		if (novalid) {
			JxHint.alert(jx.event.datavalid);
			return;
		}
		
		//统计后加载数据
		var hdcall = function(data) {
			var cm = grid.getColumnModel();
			//显示所有隐藏的列
			for (var i = 0, len = cm.config.length; i < len; i++) {
				if (cm.isHidden(i) && !(cm.config[i].ishidden)) {
					cm.setHidden(i, false);
				}
			}
			
			//如果有需要动态隐藏的列[field1, field2...]
			if (data.delcols) {
				var cols = data.delcols;
				for (var i = 0, n = cols.length; i < n; i++) {
					var index = cm.getIndexById(cols[i]);
					if (index > -1) {
						cm.setHidden(index, true);
					}
				}
			}
			
			grid.getStore().loadData(data);
			
			//执行外部扩展的统计事件
			if (config.extStatEvent) {
				config.extStatEvent(grid, config);
			}
		};
		
		//扩展外部统计参数
		if (typeof config.extStatParam == 'string') {
			params += config.extStatParam;
		} else if (typeof config.extStatParam == 'function') {
			params += config.extStatParam(grid);
		}
		
		//发送后台请求
		if (config.statParam) {//取外部参数
			params = config.statParam + params;
		} else {
			params = 'funid=sysevent&pagetype=grid&eventcode=totalexe&rpt_funid=' + nodeid + params;
		}
		
		Request.postRequest(params, hdcall);
	},
	
	//执行打印输出到模板
	outputXls: function(reportId, grid) {
		if (Ext.isEmpty(reportId)) {
			JxHint.alert('没有找到报表定义ID，不能输出！');
			return false;
		}
		
		var tparams = '';
		var tbar = grid.getTopToolbar();
		//取工具栏中的参数
		tbar.items.each(function(item){
			if (item.isXType('field')) {
				var val = item.getValue();
				val = Ext.isDate(val) ? val.dateFormat('Y-m-d H:i:s') : val;
				tparams += '&' + item.getName() + '=' + val;
			}
		});
		
		//构建输出报表的参数
		var params = 'funid=rpt_list&printType=xls&reportId='+ reportId +'&user_id=' + Jxstar.session['user_id'] + tparams;
		this.postXls(grid, params);
	},
	
	//private 发送post请求输出报表
	postXls: function(grid, params) {
		var self = this;
		var hiddens = self.createHidden(grid);
		if (hiddens == null || hiddens.length == 0) {
			JxHint.alert('没有找到报表字段信息，不能输出！');
			return false;
		}
		
		var fd = Ext.DomHelper.append(Ext.getBody(), {
					tag:'form', 
					method:'post', 
					id:'frmOutputTotalXls', 
					name:'frmOutputTotalXls',
					action:Jxstar.path + "/reportAction.do?" + params,
					target:'_blank',
					cls:'x-hidden',
					cn:hiddens
				}, true);
		fd.dom.submit();
		fd.remove();
	},
	
	//private 把数据值保存到隐藏字段中
	createHidden: function(grid) {
		var hiddens = [];
		var store = grid.getStore();
		var cm = grid.getColumnModel();
		var rownum = store.getCount();//记录数
		var colnum = cm.getColumnCount();//字段个数
		var allfields = '';//记录所有字段名称
		
		var cnt = 0;//字段个数
		for (var i = 0; i < colnum; i++) {
			var name = cm.getDataIndex(i);
			if (name.length == 0) continue;
			
			allfields += name + ',';
			hiddens[cnt++] = {tag:'input',name:name,id:name,type:'hidden'};
		}
		//把字段名称也传到后台
		if (allfields.length > 1) {
			allfields = allfields.substring(0 , allfields.length-1);
			hiddens[cnt++] = {tag:'input',name:'allfields',id:'allfields',value:allfields,type:'hidden'};
		} else {
			return null;
		}
		
		var colval = '';
		for (var i = 0; i < hiddens.length-1; i++) {
			for (var r = 0; r < rownum; r++) {
				var val = store.getAt(r).get(hiddens[i].name);
				if (Ext.isEmpty(val)) val = '';
				val = Ext.isDate(val) ? val.dateFormat('Y-m-d H:i:s') : val;
				colval += val + ',';
			}
			//添加结束标志，处理值为空的问题
			colval += 'end';
			hiddens[i].value = colval; colval = '';
		}
		
		return hiddens;
	},
	
	/**
	 * private 构建表格列信息
	 * 如果列定义中含有: drillparam 参数，表示需要数据钻取，用蓝色下划线表示
	 * 隐藏字段要往后面放，否则分组标题会显示不正确
	 **/
	createColumns: function(cols) {
		var columns = [], self = this, cnt = 0;
		//添加行选控件
		var rn = new Ext.grid.RowNumberer();
		columns[cnt++] = rn;
		
		var hcols = [];
		for (var i = 0; i < cols.length; i++) {
			var code = cols[i].col_code;
			var format = cols[i].format;
			
			var col = {header:cols[i].display, id:code, dataIndex:code, width:cols[i].col_width};
			if (cols[i].drillparam) {
				col.drillparam = cols[i].drillparam;
			}
			self.setRenderer(format, col);
			if (cols[i].hidden) {
				col.hidden = true;
				col.ishidden = true;
				hcols[hcols.length] = col;
			} else {
				columns[cnt++] = col;
			}
		}
		
		//添加隐藏的字段
		if (hcols.length > 0) {
			columns = columns.concat(hcols);
		}
		
		return columns;
	},
	
	//private 给报表参数赋缺省值
	setToolDefault: function(grid) {
		var tbar = grid.getTopToolbar();
		//取工具栏中的参数
		tbar.items.each(function(item){
			if (item.isXType('field')) {
				var defaultval = item.defaultval;
				if (typeof defaultval == 'string' && defaultval.indexOf('fun_') == 0) {
					var val = eval('JxDefault.' + defaultval.split('fun_')[1]);
					item.setValue(val);
				}
			}
		});
	},
	
	/** 
	 * grid event 'cellclick' define:
	 * 显示钻取数据明细表格，如果有多个统计数据区域，则每个统计数据区域都需要定义钻取规则；
	 * 注意：数据分类与横向分类中的“分类标示字段”必须填写，否则不能使用分类ID作为参数；
	 *       而且纵向分类中的类别ID字段也必须在字段明细表中定义，否则也会找不到分类值；
	 * options的参数有：
	 * fun_id:
	 * where_sql:显示where
	 * where_type:string;string...
	 * where_value:[param_name1];[param_name2]...
	 * xfield:
	 * yfield:
	 **/
	showDrill: function(myGrid, rowIndex, colIndex) {
		var cm = myGrid.getColumnModel();
		//根据当前点击的列，取到过滤条件对象
		var options = cm.config[colIndex].drillparam;
		if (!options) return;
		
		//取得页面参数值
		var statParam = {};
		var tbar = myGrid.getTopToolbar();
		tbar.items.each(function(item){
			if (item.isXType('field')) {
				var name = item.getName();
				var value = item.getValue();
				if (Ext.isDate(value)) value = value.format('Y-m-d');
				statParam[name] = value;
			}
		});
		
		//解析查询参数值，参数值来源有：工具栏中的页面参数、纵向分类ID、横向分类ID
		var values = [], where_value = '';
		if (!Ext.isEmpty(options.where_value)) {
			values = options.where_value.split(';');
			for (var i = 0, n = values.length; i < n; i++) {
				if (values[i].length > 2 && values[i].indexOf('[') >= 0 && values[i].indexOf(']') >= 0) {
					var one_value = null;
					//可能参数值是这种形式：%[name1]%;%[name2]%
					var val = values[i], param = '', lefted = false, rgExp = /\[\S+\]/g;
					var vals = val.split(rgExp);//IE中为空没有值，FF中为空会有值
					if (vals.length > 0) {
						if (vals.length == 1) {//在IE中可能会出现只有一边有值，则需要标记是在哪一边
							lefted = !(val.charAt(0) == '[')//说明值在右边
						}
						var matchs = val.match(rgExp);//返回的是数组
						val = matchs[0];
					}
					//处理参数值中的字段名
					param = val.substring(1, val.length-1);
					
					//取横向分类ID，根据当前点击的列，根据表格列模型数据找到分类ID值
					if (!Ext.isEmpty(options.xfield) && param == options.xfield) {
						var colid = cm.getColumnId(colIndex);
						if (colid != null && colid.length > 0) {
							var ids = colid.split('__');
							if (ids.length > 1) {
								one_value = ids[1];
								//如果是点击合计字段，则清空值
								if (one_value == 'sum') one_value = '';
							}
						}
					} else if (!Ext.isEmpty(options.yfield) && param == options.yfield) {
					//取纵向分类ID，从当前记录值中取
						var record = myGrid.getStore().getAt(rowIndex);
						if (record) {
							one_value = record.get(param);
						}
					} else {
					//取工具栏中的统计参数值
						one_value = statParam[param];
					}
					if (one_value == null) {
						JxHint.alert(String.format('没有找到钻取数据的【{0}】参数值！', param));
						return;
					}
					if (vals.length == 2) {
						where_value += vals[0] + one_value + vals[1] + ';';
					} else if (vals.length == 1) {
						if (lefted) {
							where_value += vals[0] + one_value + ';';
						} else {
							where_value += one_value + vals[0] + ';';
						}
					} else {
						where_value += one_value + ';';
					}
				} else {
					where_value += values[i] + ';';
				}
			}
		}
		if (where_value.length > 0) {
			where_value = where_value.substring(0, where_value.length-1);
		}

		//过滤条件
		var where_sql = options.where_sql;
		var where_type = options.where_type;
		var where_value = where_value;
		//alert('where_sql=' + where_sql + ';where_type=' + where_type + ';where_value=' + where_value);
		//显示数据
		var hdcall = function(grid) {
			JxUtil.delay(500, function(){
				Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type, query_type:'1'});
			});
		};

		//显示数据
		var define = Jxstar.findNode(options.fun_id);
		Jxstar.showData({
			filename: define.gridpage,
			title: define.nodetitle,
			pagetype: 'query',
			width: 800,
			nodedefine: define,
			callback: hdcall
		});
	},
	
	//private 构建数据显示样式
	setRenderer: function(format, config) {
		if (format == 'text') return;
		
		if (format == 'int') {
			if (config.drillparam) {
				config.renderer = function(value) {
					var fn = JxUtil.formatInt();
					return '<span style="color:blue;">' + fn(value) + '</span>';
				}
			} else {
				config.renderer = JxUtil.formatInt();
			}
			return;
		} else if (format.indexOf('number') >= 0) {
			var n = 2;
			if (format.length > 6) n = format.charAt(6);
			if (config.drillparam) {
				config.renderer = function(value) {
					var fn = JxUtil.formatNumber(n);
					return '<span style="color:blue;">' + fn(value) + '</span>';
				}
			} else {
				config.renderer = JxUtil.formatNumber(n);
			}
			return;
		}
		
		var str = 'Y-m-d';
		if (format == 'datetime') {
			str = 'Y-m-d H:i:s';
		} else if (format = 'datemin') {
			str = 'Y-m-d H:i';
		} else if (format = 'datemonth') {
			str = 'Y-m';
		} else if (format = 'date') {
			str = 'Y-m-d';
		} else if (format = 'dateyear') {
			str = 'Y';
		}
		if (format.indexOf('date') >= 0) {
			config.renderer = function(value) {
				return value ? value.format(str) : '';
			}
		}
	},
	
	//private 构建数据字段信息
	createFields: function(cols) {
		var fields = [], self = this;
		for (var i = 0; i < cols.length; i++) {
			var format = cols[i].format;
			var dataType = self.getDataType(format);
			
			fields[i] = {name:cols[i].col_code, type:dataType};
		}
		
		return fields;
	},
	
	//private 取数据类型
	getDataType: function(format) {
		if (format == 'text') {
			return 'string';
		}
		if (format.indexOf('number') > -1) {
			return 'float';
		}
		if (format.indexOf('date') > -1) {
			return 'date';
		}
		if (format == 'int') {
			return 'int';
		}
		return 'string';
	}
	
	});//Ext.apply

})();