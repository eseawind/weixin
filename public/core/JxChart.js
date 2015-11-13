/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 图表相关工具类。
 * 
 * @author TonyTan
 * @version 1.0, 2014-02-20
 */

JxChart = {
	green:'#55BF3B', 
	yellow:'#DDDF0D', 
	red:'#DF5353',
	
	//构建速度仪表盘，datas格式为：[{from:0, to:120, color:JxChart.green}, {from:120, to:160, color:JxChart.yellow}, {from:160, to:200, color:JxChart.red}] 
	//参数说明：ct -- 容器对象, value -- 刻度值, datas -- 数据值, title -- 标题
	speedChart: function(config) {
		var min = config.datas[0].from;
		var max = config.datas[2].to;
		
		var chart = new Highcharts.Chart({
			chart: {
				renderTo: config.ct,
				type: 'gauge',
				plotBackgroundColor: null,
				plotBackgroundImage: null,
				plotBorderWidth: 0,
				plotShadow: false
			},
			
			title: {
				text: config.title
			},
			
			pane: {
				startAngle: -150,
				endAngle: 150,
				background: [{
					backgroundColor: {
						linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
						stops: [
							[0, '#FFF'],
							[1, '#333']
						]
					},
					borderWidth: 0,
					outerRadius: '109%'
				}, {
					backgroundColor: {
						linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
						stops: [
							[0, '#333'],
							[1, '#FFF']
						]
					},
					borderWidth: 1,
					outerRadius: '107%'
				}, {
					// default background
				}, {
					backgroundColor: '#DDD',
					borderWidth: 0,
					outerRadius: '105%',
					innerRadius: '103%'
				}]
			},
			   
			// the value axis
			yAxis: {
				min: min,
				max: max,
				
				minorTickInterval: 'auto',
				minorTickWidth: 1,
				minorTickLength: 10,
				minorTickPosition: 'inside',
				minorTickColor: '#666',
		
				tickPixelInterval: 30,
				tickWidth: 2,
				tickPosition: 'inside',
				tickLength: 10,
				tickColor: '#666',
				labels: {
					step: 2,
					rotation: 'auto'
				},
				title: {
					text: ''//km/h
				},
				plotBands: config.datas
			},
		
			series: [{
				name: 'data',
				data: [config.value],
				tooltip: {
					valueSuffix: ' data'
				}
			}]
		
		});
		return chart;
	},
	
	
	//构建线状图表
	//参数说明：ct -- 容器对象, xdatas -- x数据值, ydatas -- y数据值, title -- 主标题, xtitle -- x标题, ytitle -- y标题
	lineChart: function(config) {
		var chart = new Highcharts.Chart({
			chart: {
				renderTo: config.ct
			},
            title: {
                text: config.title,
                x: -20 //center
            },
            xAxis: {
                categories: config.xdatas
            },
            yAxis: {
                title: {
                    text: config.ytitle
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: 'data',
                data: config.ydatas
            }]
        });
		return chart;
	},
	
	//构建矩状图
	//参数说明：ct -- 容器对象, xdatas -- x数据值, ydatas -- y数据值, title -- 主标题, xtitle -- x标题, ytitle -- y标题
	columnChart: function(config) {
		var chart = new Highcharts.Chart({
            chart: {
				renderTo: config.ct,
                type: 'column'
            },
            title: {
                text: config.title
            },
            xAxis: {
                categories: config.xdatas
            },
            yAxis: {
                min: 0,
				title: {
                    text: config.ytitle
                }
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: 'data',
                data: config.ydatas    
            }]
        });
		return chart;
	},
	
	//构建饼状图表
	//参数说明：ct -- 容器对象, datas -- 数据值, title -- 标题
	pieChart: function(config) {
		var chart = new Highcharts.Chart({
			chart: {
				renderTo: config.ct,
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			title: {
				text: config.title
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						color: '#000000',
						connectorColor: '#000000',
						format: '<b>{point.name}</b>: {point.percentage:.1f} %'
					}
				}
			},
			series: [{
				type: 'pie',
				name: 'data',
				data: config.datas
				/*[
					['Firefox',   45.0],
					['IE',       26.8],
					{
						name: 'Chrome',
						y: 12.8,
						sliced: true,
						selected: true
					},
					['Safari',    8.5],
					['Opera',     6.2],
					['Others',   0.7]
				]*/
			}]
		});
		return chart;
	}
};