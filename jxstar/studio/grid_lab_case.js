Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var Dataregstatus = Jxstar.findComboData('regstatus');
	var Datadatasrc = Jxstar.findComboData('datasrc');

	var cols = [
	{col:{header:'方案名称', width:199, sortable:true}, field:{name:'lab_case__case_name',type:'string'}},
	{col:{header:'序号', width:61, sortable:true, align:'right',renderer:JxUtil.formatInt()}, field:{name:'lab_case__case_index',type:'int'}},
	{col:{header:'状态', width:77, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Dataregstatus
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Dataregstatus[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Dataregstatus.length; i++) {
				if (Dataregstatus[i][0] == value)
					return Dataregstatus[i][1];
			}
		}}, field:{name:'lab_case__auditing',type:'string'}},
	{col:{header:'来源类型', width:99, sortable:true, align:'center',
		editable:false,
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: Datadatasrc
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: Datadatasrc[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < Datadatasrc.length; i++) {
				if (Datadatasrc[i][0] == value)
					return Datadatasrc[i][1];
			}
		}}, field:{name:'lab_case__data_type',type:'string'}},
	{col:{header:'数据来源定义', width:465, sortable:true}, field:{name:'lab_case__data_src',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'lab_case__case_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '0',
		isshow: '1',
		funid: 'lab_case'
	};
	
	
	//设计标签
	cols.insert(0, {col:
		{header:'', width:30, xtype:'actioncolumn', menuDisabled:true, align:'center', items:[{
				icon: 'resources/images/icons/button/labdes.png',
				tooltip: '标签设计',
				handler: function(grid, rowIndex, colIndex) {
					var rec = grid.getStore().getAt(rowIndex);
					var keyid = rec.get('lab_case__case_id');
					JxUtil.loadJS('/jxstar/studio/pub/designer_label.js', true);
					
					//取布局对象与方案id
					var target = grid.findParentByType('tabpanel');
					JxLabelDes.showDesign(keyid, target);
				}
			}]
		}
	});

	config.eventcfg = {
		labeldes: function() {
			var me = this;
			var records = JxUtil.getSelectRows(me.grid);
			if (!JxUtil.selectone(records)) return;
			
			//if (typeof JxLabelDes == "undefined") {
				JxUtil.loadJS('/jxstar/studio/pub/designer_label.js', true);
			//}
			
			//取布局对象与方案id
			var target = me.grid.findParentByType('tabpanel');
			var keyid = records[0].get(me.define.pkcol);
			JxLabelDes.showDesign(keyid, target);
		}
	};
		
	return new Jxstar.GridNode(config);
}