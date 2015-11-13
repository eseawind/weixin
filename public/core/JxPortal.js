/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 首页Portlet构建工具类。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

JxPortal = {};
(function(){

	Ext.apply(JxPortal, {
	/**
	 * private
	 * 保存系统创建的portal对象
	 **/
	mainPortals: [],
	/**
	 * private
	 * 保存portal内容对象
	 **/
	ContentTypes: {
		'portlet_fun':PortletFun, 
		'portlet_msg':PortletMsg, 
		'portlet_warn':PortletWarn, 
		'portlet_board':PortletBoard, 
		'portlet_result':PortletResult,
		'portlet_resultg':PortletResultG,
		'portlet_flow':PortletAssign,
		'portlet_icon':PortletIcon,
		'portlet_news':PortletNews,
		'portlet_send':PortletSend
	},
	
	/**
	 * private
	 * portel栏目上的小按钮
	 **/
	tools: [{
		id:'refresh',
		handler: function(e, target, cell){
			//取portlet类型代号
			var typecode = cell.initialConfig.typecode;
			//取对应的内容解析对象
			var content = JxPortal.ContentTypes[typecode];
			if (content == null) {
				JxHint.alert(String.format(jx.port.noport, typecode));	//'JxPortal对象中没有定义['+ typecode +']类型的解析对象！'
				return false;
			}
			//显示内容，showPortlet是公共方法
			content.showPortlet(cell);			
		}
	}/*,{
		id:'close',
		handler: function(e, target, cell){
			cell.ownerCt.remove(panel, true);
		}
    }*/],

	/**
	 * public
	 * 从系统中取portal配置，构建后显示在target中
	 **/
	createMainPortal: function(target) {
		//重新加载portal时，关闭所有的定时任务
		Ext.TaskMgr.stopAll();
		
		var hdcall = function(portalsJson) {
			if (portalsJson == null || portalsJson.portalnum == 0) {
				JxHint.alert(jx.port.notemp);	//'当前用户所属的角色没有定义首页模板！'
				return;
			}
			var portalPanel = JxPortal.parsePortal(portalsJson);
			
			target.add(portalPanel);
			target.doLayout();
			
			//开始加重portel中的内容
			var pnum = JxPortal.mainPortals.length;
			//处理每个portal
			for (var i = 0; i < pnum; i++) {
				var portal = JxPortal.mainPortals[i];
				
				//处理每列
				var colnum = portal.items.length;
				for (var j = 0; j < colnum; j++) {
					var col = portal.items.itemAt(j);
					
					//处理每个portlet
					var cellnum = col.items.length;
					for (var k = 0; k < cellnum; k++) {
						var cell = col.items.itemAt(k);
						
						//取portlet类型代号
						var typecode = cell.initialConfig.typecode;
						//取对应的内容解析对象
						var content = JxPortal.ContentTypes[typecode];//JxHint.alert(typecode+';'+content);
						if (content == null) continue;
						//显示内容，showPortlet是公共方法
						content.showPortlet(cell);
					}
				}
			}
		};
	
		var params = 'funid=queryevent&eventcode=query_portal';
		Request.dataRequest(params, hdcall);
	},
	
	/**
	 * private 创建portal对象
	 * portalnum -- 首页模板的数量，如果有多个模板，需要用tabpanel控件
	 * portals -- 模板信息数组，单个模板数据的参数有：
	 *			templet_name -- 模板标题
	 *			col_num -- 列数
	 *			col_width -- 列宽
	 *			items -- 列信息
	 *          
	 *			items -- portels栏目内容，参数有：id, title, iconCls, height, typecode, objectid
	 * 示例数据：
	 *{portalnum:2, portals:[{
			templet_name:'操作员',
			col_num:2,
			col_width:'270;720',
			items:[
				{id:'portlet_fun',
				 title:'常用功能',
				 iconCls:'nav_fun',
				 height:'220',
				 objectid:''},
				 ...
			]
	 * },{
		...
	   }]}
	 **/
    parsePortal: function(portalsJson) {
		//模板数量
		var portalnum = parseInt(portalsJson.portalnum);
		
		//如果有多个首页模板，需要创建tabpanel
		if (portalnum > 1) {
			var tabitems = [portalnum];
			for (var i = 0; i < portalnum; i++) {
				var portalJson = portalsJson.portals[i];
				var portal = JxPortal.createPortal(portalJson);
				tabitems[i] = {
					title:portalJson.templet_name,
					autoScroll:true,
					layout:'fit',
					iconCls:'function',
					items:portal
				};
				
				JxPortal.mainPortals[i] = portal;
			}
			//创建tabpanel
			var portalTab = new Ext.TabPanel({
				border:false,
				id:'sys_portal_tab',
				region:'center',
				closeAction:'close',
				activeTab:0,
				items:tabitems
			});
			
			return portalTab;
		} else {
			var portalJson = portalsJson.portals[0];
			var portal = JxPortal.createPortal(portalJson);
			JxPortal.mainPortals[0] = portal;
			return portal;
		}
	},
	
	/**
	 * private
	 * 构建一个portal对象，参数内容格式见上一个函数
	 **/
	createPortal: function(portalJson) {
		//列数量
		var colnum = portalJson.col_num;
		//列宽度
		var colwidths  = portalJson.col_width.split(';');
		if (colnum != colwidths.length) {
			var text = String.format(jx.port.colrow, colnum, colwidths);	//'定义列数[{0}]与定义列宽[{1}]数量不等！'
			JxHint.alert(text);
			return false;
		}
		
		//初始化列内容数组
		var colitems = [colnum];
		for (var i = 0; i < colnum; i++) {
			colitems[i] = [];
		}
		//总栏目数量
		var cellnum = portalJson.items.length;
		//构建每列中的内容
		for (var i = 0; i < cellnum; i++) {
			var item = portalJson.items[i];
			//列号
			var colno = parseInt(item.colno) - 1;
			if (colno >= colnum) {
				JxHint.alert('【' + item.title + '】所属列大于模板总列数！');
				continue;
			}
			//栏目信息，portels栏目内容，参数有：id, title, iconCls, height, typecode, objectid
			var cell = {
				title: item.title,
				iconCls: item.iconCls,
                layout: 'fit',
				autoScroll:true,
                tools: JxPortal.tools,
                height: parseInt(item.height),
                collapsed: (item.collapse == '1'),
				pletid: item.id,			//portletid，后台需要的参数
                typecode: item.typecode,	//portlet类型的编码，后台需要的参数
				objectid: item.objectid	//结果集与KPI类型的需要用objectid找具体的实例对象
			};
			//添加到列数组中
			var len = colitems[colno].length;
			colitems[colno][len] = cell;
		}
		
		//构建列对象
		var portalitems = [colnum];
		for (var i = 0; i < colnum; i++) {
			portalitems[i] = {
				width: colwidths[i],
				style: i < (colnum-1) ? 'padding:10px 0 10px 10px' : 'padding:10px',
				items: colitems[i]
			};
		}
		
		//构建Portal对象
		var portals = new Ext.ux.Portal({
			region:'center',
			border:false,
			margins:'5 5 5 0',
			items:portalitems
		});
		
		return portals
	}
	
	});//Ext.apply
})();