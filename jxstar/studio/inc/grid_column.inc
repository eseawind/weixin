config.initpage = function(gridNode){		var grid = gridNode.page;		//表格编辑后事件		grid.on('afteredit', function(event) {			if (event.field == 'fun_col__data_type') {				var r = event.record;				var datatype = r.get('fun_col__data_type');				if (datatype == 'string') {					r.set('fun_col__col_control', 'text');					r.set('fun_col__format_id', 'text');				} else if (datatype == 'int') {					r.set('fun_col__col_control', 'number');					r.set('fun_col__format_id', 'int');				} else if (datatype == 'double') {					r.set('fun_col__col_control', 'number');					r.set('fun_col__format_id', 'number');				} else if (datatype == 'date') {					r.set('fun_col__col_control', 'date');					r.set('fun_col__format_id', 'date');				}			}		});	};	config.eventcfg = {		
		dataImportParam: function() {			var pg = JxUtil.getParentGrid(this.grid);			var records = pg.getSelectionModel().getSelections();			if (!JxUtil.selectone(records)) return;			var funId = records[0].get('fun_base__fun_id');			var tableName = records[0].get('fun_base__table_name');						var options = {				whereSql: 'table_name = ? and col_code not in (select col_code from fun_col where fun_id = ?)',				whereValue: tableName+';'+funId,				whereType: 'string;string'			};			return options;		},

		setFunColext: function(){
			var records = this.grid.getSelectionModel().getSelections();
			if (!JxUtil.selectone(records)) return;
			var selcolid = records[0].get('fun_col__col_id');						//加载Form数据			var hdcall = function(page) {				//设置外键键				page.getForm().fkName = 'fun_colext__col_id';				page.getForm().fkValue = selcolid;								//加载显示数据				var options = {					where_sql: 'fun_colext.col_id = ?',					where_type: 'string',					where_value: selcolid,					callback: function(data) {						//如果没有数据则执行新增						if (data.length == 0) {							page.formNode.event.create();						} else {							var r = page.formNode.event.newRecord(data[0]);														page.getForm().myRecord = r;							page.getForm().loadRecord(r);						}					}				};				Jxstar.queryData('fun_colext', options) 			};

			//显示数据			var define = Jxstar.findNode('fun_colext');
			Jxstar.showData({
				filename: define.formpage,
				title: define.nodetitle,
				callback: hdcall
			});
		}
	};