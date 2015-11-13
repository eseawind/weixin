	config.initpage = function(gridNode) {
		var grid = gridNode.page;
		
		var calu = function(record, field1, field2, field3) {
			var value = record.get(field1) * record.get(field2);
			record.set(field3, value);
		};
		
		//金额 = 数量 * 单价;
		grid.on('afteredit', function(e){
			if (e.field == 'mat_appdet__mat_num' || e.field == 'mat_appdet__mat_price') {
				calu(e.record, 'mat_appdet__mat_num', 'mat_appdet__mat_price', 'mat_appdet__mat_money');
			}
		});
	};