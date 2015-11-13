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