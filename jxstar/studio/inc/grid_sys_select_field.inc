
	//打开自定义数据设置功能
	var showSelectData = function(field_id) {
		//过滤条件
		var where_sql = 'sys_select_data.field_id = ?';
		var where_type = 'string';
		var where_value = field_id;
		
		//加载数据
		var hdcall = function(layout) {
			//显示数据
			JxUtil.delay(500, function(){
				var grid = layout.getComponent(0).getComponent(0);
				grid.fkValue = where_value;
				Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
			});
		};

		//显示数据
		var define = Jxstar.findNode('sys_select_data');
		Jxstar.showData({
			filename: '/public/layout/layout_main.js',
			title: define.nodetitle,
			nodedefine: define,
			callback: hdcall
		});
	};
	//指定来源SQL定义
	var setZDSQL = function(field_id,value,endCall){
		var setWin = new Ext.Window({
			title:'来源SQL设置',
			layout:'fit',
			width: 480,
			height: 200,
			constrainHeader: true,
			resizable: false,
			closeAction: 'close',
			bodyStyle: 'background:#fff',
			items:[{
				border: false,
				style: 'padding:5px;',
				items:[{
					xtype:'label',
					style:'color:red',
					text:'筛选值来源的SQL设置，查询字段的别名必须为display，如：select name as display from table;'
				},{
					xtype:'textarea',
					width: 445,
					height: 90,
					maxLength: 200,
					value: value
				}]
			}],
			buttons:[{
				text:jx.base.ok, //确定
				handler : function(){
					var sqlValue = setWin.getComponent(0).getComponent(1).getValue();
					endCall(sqlValue);
					setWin.close();
				}
			},{
				text:jx.base.cancel,  //取消
				handler:function(){setWin.close();}
			}]
		});
		setWin.show();
	};

	cols[cols.length] = {col:
		{header:'操作', width:100, align:'center', 
			renderer: function(value, metaData, record) {
				var data_src = record.get('sys_select_field__data_src');
				var html = '';
				if (data_src == 'zdyz') {
					html += '<a href="#" name="zdyz">自定义数据设置</a>';
				}
				if (data_src == 'zdly') {
					html += '<a href="#" name="zdly">来源SQL设置</a>';
				}
				return html;
			},
			listeners: {click: function(col, grid, row, e){
				var target = e.getTarget();
				var rec = grid.getStore().getAt(row);
				var field_id = rec.get('sys_select_field__field_id');
				if(target.name == 'zdyz'){
					showSelectData(field_id);
				}
				if(target.name == 'zdly'){
					var sql_value = rec.get('sys_select_field__data_set');
					var endCall = function(value){
						rec.set('sys_select_field__data_set',value);
					};
					setZDSQL(field_id,sql_value,endCall);
				}
			}}
		}
	};
config.initpage = function(gridNode) {
	var grid = gridNode.page;
	grid.on('beforeedit', function(e){
		//如果是类型是自定义值字段数据来源不能编辑
		if (e.field == 'sys_select_field__data_set') {
			if(e.record.get('sys_select_field__data_src') == 'zdyz')
				return false;
		}
	});
};

config.eventcfg = {		
		dataImportParam: function() {
			var grid = this.grid;
			var control_id = grid.fkValue;
			if (!control_id || control_id.length == 0) {
				JxHint.alert('没有选择主记录，不能添加筛选字段！');
				return false;
			}
			/*
			var attr = grid.treeNodeAttr;
			if (!attr || !attr.id) {
				JxHint.alert('先选择左边的筛选控件树节点，才能添加筛选字段！');
				return false;
				
			}
			//从选中的树形节点的属性得到功能ID
			var treeId = attr.id; */
			var gridm = grid.parentGrid;
			var records = JxUtil.getSelectRows(gridm);
			if (!JxUtil.selected(records)) return;
			var fun_id = records[0].get('funall_control__value_data');
			
			var options = {
				whereSql: 'fun_col.fun_id = ? and not exists (select field_code from sys_select_field where control_id = ? and fun_col.col_code = sys_select_field.field_code)',
				whereValue: fun_id +';'+ control_id,
				whereType: 'string;string'
			};
			return options;
		}
};