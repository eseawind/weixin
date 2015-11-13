	config.initpage = function(formNode){
		var event = formNode.event;
		
		event.on('beforecreate', function(event) {
			var form = formNode.page.getForm();
			var pnid = formNode.parentNodeId;
			//取设置SQL的功能ID
			var selectFunId = '';
			//“数据导入”设置目标功能ID
			var setFunId = 'fun_rule_sql__dest_funid';
			if (pnid == 'rule_route') {
				var pg = JxUtil.getParentGrid(form.myGrid);
				if (pg) {
					var records = pg.getSelectionModel().getSelections();
					if (records.length > 0) {
						selectFunId = records[0].get('fun_rule_route__fun_id');
					}
				}
			} else {
				setFunId = 'fun_rule_sql__src_funid';
				selectFunId = form.myGrid.selectFunId;
			}

			var field = form.findField(setFunId);
			field.setValue(selectFunId);
			//field.disable();
		});
		
		event.initOther = function() {
			var form = formNode.page.getForm();
			var pnid = formNode.parentNodeId;
			//“数据导入”设置目标功能ID
			var setFunId = 'fun_rule_sql__dest_funid';
			if (pnid != 'rule_route') {
				setFunId = 'fun_rule_sql__src_funid';
			}
			
			//var field = form.findField(setFunId);
			//field.disable();
		};
	};