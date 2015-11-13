	if (typeof JxDynCol == 'undefined') {
		JxUtil.loadJS('/public/layout/ux/dyncol_grid.js', true);
	}
	
	//当前功能ID
	var curfunid = 'mat_size_det';
	//小计列字段名
	var sum_colname = 'mat_appdet__mat_num';
	//明细主键字段名
	var det_keyname = 'mat_appdet__det_id';
	//尺码组id字段ming
	var size_keyname = 'mat_base__type_id';
	
	//缺省动态列数量20，一般都不需要修改
	var DYNNUM = 20;
	
	var dyncol = new JxDynCol({'curfunid':curfunid, 'sum_colname':sum_colname, 
		'det_keyname':det_keyname, 'size_keyname':size_keyname, 'DYNNUM':DYNNUM});
	
	//构建20个尺码标题列，缺省隐藏
	dyncol.initDynCols(cols, sum_colname);
	
	config.initpage = function(gridNode) {
		var grid = gridNode.page;
		
		//点击某行标记表格标题的颜色
		grid.on('rowclick', function(g, i){
			var store = g.getStore();
			var rec = store.getAt(i);
			//取尺码组ID
			var dataid = rec.get(size_keyname);
			dyncol.selectHeader(dataid, g);
		});
		
		//控制没有标题的cell不可编辑
		grid.on('beforeedit', function(event) {
			var rec = event.record;
			var field = event.field;
			var dataid = rec.get(size_keyname);
			
			//根据字段名标题里面的值判断此cell是否可编辑
			return dyncol.hasColName(dataid, field, event.grid);
		});
		
		//修改明细数量后计算小记值
		grid.on('afteredit', function(event) {
			var record = event.record;
			var field = event.field;
			
			dyncol.caluSumData(field, record, event.grid);
		});
		
		//保存动态列数据
		var event = gridNode.event;
		event.on('beforesave', function(e){
			return dyncol.saveDynData(e.grid);
		});
		
		//重构动态列标题，显示动态列数据
		var store = grid.getStore();
		store.on('load', function(store){
			dyncol.loadDynData(grid);
			
			//重新构建页面，否则不出现滚动条；添加下面的行，没有统计数据行了
			//grid.getView().refresh();
		});
	};