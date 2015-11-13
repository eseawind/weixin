/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 统计表格与图表布局。
 * 
 * @author TonyTan
 * @version 1.0, 2014-02-20
 */

Jxstar.currentPage = function(define, pageParam) {
	if (define == null) {
		JxHint.alert('param define is null!');
		return;
	}

	var funid = define.nodeid;
	
	//加载图表类库
	JxUtil.loadHighCharts();
	
	//动态加载JS文件
	if (!window.JxTotalGrid) {
		JxUtil.loadJS('/public/layout/ux/total_grid.js', true);
		JxUtil.loadJS('/lib/ext/ux/ColumnHeaderGroup.js', true);
	}
	
	//执行统计
	var exestat = function(b) {
		var tbar = b.ownerCt;
		var bom1 = layout.getComponent(1);
		var top1 = layout.getComponent(0).getComponent(0);
		var top2 = layout.getComponent(0).getComponent(1);
		
		//统计前先清除原来的数据
		bom1.removeAll(true);
		top1.removeAll(true);
		top2.removeAll(true);
		
		var hdcall = function(data) {
			var actid = top1.body.id;
			var bctid = top2.body.id;
			
			var value1 = Math.round(Math.random() * 100);
			//-------------------显示仪表盘-------------------
			//从后台获取动态数据：value -- 刻度值, datas -- 数据值, title -- 标题
			var adata = {title:'发货完成率', value:value1, datas:[{from:0, to:40, color:JxChart.red}, 
				{from:40, to:80, color:JxChart.yellow}, {from:80, to:140, color:JxChart.green}]}
			//ct -- 容器对象
			adata.ct = actid;
			try {
				JxChart.speedChart(adata);
			} catch(e) {
				JxHint.alert(e);
			}
			
			var value2 = Math.round(Math.random() * 100);
			var value3 = Math.round(Math.random() * 300);
			var value4 = Math.round(Math.random() * 200);
			//-------------------显示矩状图-------------------
			//从后台获取动态数据：xdatas -- x数据值, ydatas -- y数据值, title -- 主标题, xtitle -- x标题, ytitle -- y标题
			var bdata = {title:'实际发货数量', xdatas:['杨树权片区', '詹冬吴片区', '杨树英片区', '吴美颖片区'], ydatas:[value2, value3, value4, 74]};
			//ct -- 容器对象
			bdata.ct = bctid;
			try {
				JxChart.columnChart(bdata);
			} catch(e) {
				JxHint.alert(e);
			}
			
			//构建表格对象，config格式：{data:[...], cols:[...], groups:[...]}
			var grid = JxTotalGrid.createData(data);
			bom1.add(grid);
			bom1.doLayout();
		};
		
		var statyear = tbar.get(1).getValue();
		var params = 'funid=mat_stat1&pagetype=grid&eventcode=statgrid&statyear=' + statyear;
		Request.postRequest(params, hdcall);
	};
	
	//添加统计工具栏
	var tbars = [{xtype:'tbtext', text:'年份：'}, {xtype:'textfield', name:'statyear', value:'2013'}, 
		         {iconCls:'eb_stat', text:'统计', handler:exestat}];
	
	var layout = new Ext.Panel({
		border:false,
		layout:'border',
		tbar:tbars,
		items:[{
			region:'north',
			height:280,
			layout:'border',
			split:true,
			border:false,
			items:[{
				region:'west',
				border:false,
				width:300,
				split:true
			},{
				region:'center',
				border:false
			}]
		},{
			region:'center',
			layout:'fit',
			border:false
		}]
	});

	return layout;
}