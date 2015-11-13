Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataobjtype = Jxstar.findComboData('objtype');

	var cols = [
	{col:{header:'姓名', width:102, sortable:true}, field:{name:'sys_news_obj__obj_name',type:'string'}},
	{col:{header:'编号', width:96, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news_obj__obj_code',type:'string'}},
	{col:{header:'类型', width:66, sortable:true, colindex:10000, hidden:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataobjtype
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataobjtype[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataobjtype.length; i++) {
				if (Dataobjtype[i][0] == value)
					return Dataobjtype[i][1];
			}
		}}, field:{name:'sys_news_obj__obj_type',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news_obj__obj_detid',type:'string'}},
	{col:{header:'新闻ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news_obj__news_id',type:'string'}},
	{col:{header:'对象ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'sys_news_obj__obj_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '0',
		isshow: '0',
		funid: 'sys_msg_obj'
	};
	
	config.param.selectModel = 'nocheck';
	config.param.hidePageTool = true;
	config.param.noRowNum = true;

	//在最后添加一列按钮
	cols[cols.length] = {col:
		{header:'', width:50, xtype:'actioncolumn', menuDisabled:true, align:'center', items:[{
			icon: 'resources/images/icons/button/cancel.gif',
			tooltip: '删除',
			handler: function(grid, rowIndex, colIndex) {
				var sm = grid.getSelectionModel();
				sm.selectRow(rowIndex);
				
				var ge = grid.gridNode.event;
				ge.del();
			}
			}]
		}
	};
		
	return new Jxstar.GridNode(config);
}