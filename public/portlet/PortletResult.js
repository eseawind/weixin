/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 图形结果集portlet控件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

PortletResult = {};
(function(){

	Ext.apply(PortletResult, {
	/**
	 * public
	 * 父对象
	 **/
	ownerCt:null,
	
	/**
	 * public
	 * 刷新窗口内容
	 **/
	refresh: function() {
		if (this.ownerCt) {
			this.showPortlet(this.ownerCt);
		}
	},
	
	/**
	 * public
	 * 显示结果集图形
	 **/
	showPortlet: function(target) {
		var self = this;
		if (target == null) {
			JxHint.alert(jx.plet.noparent);	//'显示PORTLET的容器对象为空！'
			return;
		}
		this.ownerCt = target;
		//先清除内容
		target.removeAll(target.getComponent(0), true);
		//加载图表类库
	    JxUtil.loadHighCharts();
	   var layout = new Ext.Panel({
		border:false,
		layout:'border',
		items:[
			{
			region:'center',
			width: 220,
			height:220,
			layout:'fit',
			split:true,
			border:false
		    }]
		 });
		 target.add(layout);
		 target.doLayout();
		//取结果集图形设置ID
		
	
        var chartId=target.initialConfig.objectid;
		//取图形结果集数据后的回调函数
		var hdCall = function(chartJson) {
		var actid =layout.getComponent(0).body.id;
		//var actid1 =layout.getComponent(1).body.id;
		//var actid2 =layout.getComponent(2).body.id;
		//var actid3 =layout.getComponent(3).body.id;
			
			//图形类型
				var value1 = Math.round(Math.random() * 100);
			//-------------------显示仪表盘-------------------
			//从后台获取动态数据：value -- 刻度值, datas -- 数据值, title -- 标题
			var adata = {title:'生产计划完成率', value:value1, datas:[{from:0, to:40, color:JxChart.red}, 
				{from:40, to:80, color:JxChart.yellow}, {from:80, to:140, color:JxChart.green}]}
			var adata1 = {title:'产品合格率', value:value1, datas:[{from:0, to:40, color:JxChart.red}, 
				{from:40, to:80, color:JxChart.yellow}, {from:80, to:140, color:JxChart.green}]}			
			var adata2 = {title:'采购计划完成率', value:value1, datas:[{from:0, to:40, color:JxChart.red}, 
				{from:40, to:80, color:JxChart.yellow}, {from:80, to:140, color:JxChart.green}]}
			var adata3 = {title:'交货及时率', value:value1, datas:[{from:0, to:40, color:JxChart.red}, 
				{from:40, to:80, color:JxChart.yellow}, {from:80, to:140, color:JxChart.green}]}
			
			//ct -- 容器对象
			adata.ct = actid;
			//adata1.ct = actid1;
			//adata2.ct = actid2;
			//adata3.ct = actid3;
			try {
				JxChart.speedChart(adata);
				//JxChart.speedChart(adata1);
				//JxChart.speedChart(adata2);
				//JxChart.speedChart(adata3);
			} catch(e) {
				JxHint.alert(e);
			}
			
			//显示图形对象
		
		}
		
		//从后台取图形设置信息
		var params = 'funid=queryevent&eventcode=query_pletres&chart_id='+chartId;
		Request.dataRequest(params, hdCall);
	}
	
	});//Ext.apply

})();
