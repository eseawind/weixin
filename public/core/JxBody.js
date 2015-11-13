/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 系统首页处理类，登录成功后动态加载。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

(function(){
	Ext.QuickTips.init();  
	
	//欢迎提示信息
	var welcome = jx.base.welcome + ' ' + JxDefault.getUserName() +' ['+ JxDefault.getDeptName() +']';
	//处理工作代理
	var proxyuser = Jxstar.session['proxy_user_name'];
	if (proxyuser) {
		welcome += '('+ proxyuser +'-代理)';
	}
	
	//菜单显示位置
	var menuPos = Jxstar.systemVar.index__menu__pos || 'left';
	var btnHtml = '', homeid= 'fun_home_tab';
	var funHtml = 
		'<div style="padding-top:3px;">' +
			'<ul style="float:left;" class="main_tab_strip">' +
				'<li class="top-fun-text" style="width:60px;text-align:center;" itemid="'+ homeid +'">' +
				'<span class="top-menu-img eb_home">首页</span></li>' +
			'</ul>'+
			'<span style="float:right;" class="main_tab_down">' +
				'<span class="top-tabs-down"></span>' +
			'</span>'+
		'</div>';
	if (menuPos == 'left') {
		btnHtml = 
		'<span style="float:right;" id="top_btn_td">' +
			'<a href="#" class="top-menu-text" onclick="JxUtil.showWfnav(this);" style="display:none;" id="main_curr_wfnav">' +
				'<span class="top-menu-img eb_wfnav">业务导航</span></a>' +
			'<a href="#" class="top-menu-text" onclick="JxUtil.setPass(JxDefault.getUserId());"><span class="top-menu-img eb_pass">修改密码</span></a>' +
			'<a href="#" class="top-menu-text" onclick="JxUtil.onLineUser();"><span class="top-menu-img eb_online">在线用户</span></a>' +
			'<a href="#" class="top-menu-text" onclick="JxUtil.logout();"><span class="top-menu-img eb_logout">退出系统</span></a>' +
		'</span>';
	} else {
		btnHtml = '<span style="float:right;" id="main_menu"></span>';
	}
	var topHtml = '<div style="padding-top:4px;"><span style="float:left;">'+welcome+'</span>'+ btnHtml +'</div>';
	var headHtml = 
		"<div class='top_bg'>" + 
			"<div class='top_info' id='main_hint'>" + topHtml +"</div>" + 
			"<div class='top_sysbtn'>"+ funHtml +"</div>" + 
		"</div>";

	var imgpath = './resources/images/top-app.png';
	var lw = 134, ilw = Jxstar.systemVar.index__logo__width;
	
	if (Jxstar.systemVar.indexType == '1') {//如果是项目
		imgpath = './resources/project/images/top-app.png';

		if (ilw && ilw.length > 0) {
			lw = ilw;
		} else {
			lw = 64;//项目LOGO缺省长度，产品LOGO缺省长度146
		}
	}
	
    var topPanel = new Ext.Panel({
		region:'north',
        layout:'border',
		height:50,
		border:false,
	    items:
		[{
			width: lw,
			region:'west',
			border:false,
	        id:'top_left_img',
	        html: "<div class='top_bg'><img onload='JxUtil.fixPNG(this);' id='main_page_img' src='"+ imgpath
				+"' style='cursor:pointer;' width='100%' height='100%'/></div>"
	    },{
	        region:'center',
			border:false,
			html:headHtml
	    }]
	});

	//创建首页功能显示区域
	var sysMainTab = new Ext.Panel({
		id:'sys_main_tab',
		region:'center',
		layout:'card',
		activeItem:0,
		border:false,
		margins:'2 5 5 '+((menuPos == 'top') ? '5' : '0'),
		items:[{
			id:homeid,
			label:jx.base.onepage, //首页
			autoScroll:true,
			layout:'fit',
			iconCls:'function',
			border:false
		}]
	});
	//功能标签对象
	var mainTab = null;
	//保存到全局对象中
	Jxstar.sysMainTab = sysMainTab;
	//添加激活当前页面的方法，item类型可以是tab、tabid、number
	sysMainTab.activate = function(item){
		if (typeof item == "number") {
			item = sysMainTab.get(item);
		} else if (typeof item == "string") {
			item = Ext.getCmp(item);
		}
		//激活当前功能
		mainTab.activeTab(item.id, item.label);
	};
	
	//显示管理首页设置
	var isportset = Jxstar.systemVar.index__portlet__set;
	var showPortlet = function(el) {
		var hdcall = function(data){
			if (data != null) data = data.root; 
			if (data == null || data.length == 0) return;
			
			var items = [];
			for (var i = 0, n = data.length; i < n; i++) {
				var tplid = data[i].plet_templet__templet_id;
				var tplname = data[i].plet_templet__templet_name;
				
				items[i] = {text:tplname, itemId:tplid, handler:function(b){
					mainTab.showHome();
					//重新加载首页
					var funTab = sysMainTab.getComponent(0);
					funTab.removeAll(funTab.getComponent(0), true);
	
					JxPortalExt.showOnePortal(funTab, b.getItemId());
				}};
			}
		
			var winmenu = new Ext.menu.Menu({items:items});
			winmenu.showAt([el.getX(), el.getY()+20]);
		};
		
		var params = 'eventcode=query_data&funid=queryevent&pagetype=grid&query_funid=plet_templet';
		Request.dataRequest(params, hdcall);
	};
	
	//关闭当前功能
	var showwf = Jxstar.systemVar.index__show__wfnav||'0';
	JxUtil.delay(200, function(){
		//功能标签管理对象
		var config = {tabct:topPanel.getEl().child('.main_tab_strip'), funct:sysMainTab, homeid:homeid};
		mainTab = new JxMainTab(config);
		mainTab.initHome();
		Jxstar.funMainTab = mainTab;
		
		//显示流程导航
		if (showwf == '1') {
			var tt = topPanel.getEl().child('#main_curr_wfnav');
			if (tt) tt.show();
		}
		
		//显示管理首页
		var isadmin = JxUtil.isAdminUser();
		var showpt = Jxstar.systemVar.index__show__mainset||'0';
		if (showpt == '1' && isportset == '1' && isadmin) {
			var tt = mainTab.getTab(homeid);
			if (tt) {
				tt.on('contextmenu', function(){showPortlet(tt)});
				tt.dom.title = '右键鼠标可以查看管理模板设置';
			}
		}
		
		//如果菜单显示在顶部，则调整一下功能标签位置
		if (menuPos == 'top' && Ext.isIE) {
			var tt = topPanel.getEl().child('.top_sysbtn');
			tt.setStyle({paddingTop:1});
			tt.first().setStyle({paddingTop:0});
		}
	});
	
	//显示流程导航
	JxUtil.showWfnav = function(t) {
		var el = Ext.get(t);
		var hdCall = function(data) {
			if (data != null) data = data.root; 
			if (data == null || data.length == 0) return;
			
			var items = [];
			for (var i = 0, n = data.length; i < n; i++) {
				var gid = data[i].wfnav_graph__graph_id;
				var title = data[i].wfnav_graph__graph_name;
				
				items[i] = {text:title, itemId:gid, handler:function(b){
					JxWfGraph.showGraphFun(b.getItemId(), null, false, b.text);
				}};
			}
			
			var menu = new Ext.menu.Menu({items:items});
			menu.showAt([el.getX(), el.getY()+20]);	
		};
		var where_sql = encodeURIComponent('auditing = 1');
		var params = 'eventcode=query_data&funid=queryevent&pagetype=grid'+
			'&query_funid=wfnav_graph&where_sql=' + where_sql;
		Request.dataRequest(params, hdCall);
	};
	
	//构建菜单树
	if (menuPos == 'top') {
		//创建首页页面布局
		var viewport = new Ext.Viewport({
			layout:'border',
			items:[topPanel, sysMainTab]
		});
		//方便在代理工作切换时销毁此对象
		Jxstar.viewport = viewport;
		
		//创建头部的菜单，main_menu是显示菜单的DIV标示
		JxMenu.createMainMenu('main_menu');
	} else {
		var dataUrl = Jxstar.path + '/commonAction.do?funid=queryevent&eventcode=query_menu&user_id='+Jxstar.session['user_id'];
		var treeMenu = new Ext.tree.TreePanel({
			id: 'tree_main_menu',
			region:'west',
			title:'功能菜单',
			iconCls:'main-menu-tree',
			bodyCssClass:'menu_bg',
			margins:'2 0 5 5',
			split:true,
			width:180,
			minSize:180,
			maxSize:300,
			border:true,
			animate:true,
			collapsible:true,
			
			tools:[{//添加刷新按钮可以重新加载功能菜单
				id:'refresh',
				handler: function(event, tool, tree){
					tree.getLoader().load(tree.getRootNode());
				}
			}],
			
			autoScroll:true,
			rootVisible: false,
			lines: false,
			useArrows: true,
			
			loader: new Ext.tree.TreeLoader({dataUrl: dataUrl, listeners:{
				load:function(loader, node, response){
					var menuJson = Ext.decode(response.responseText);
					JxUtil.putRightNodes(menuJson);
					//显示一级模块的流程导航图
					if (showwf == '2') {
						JxUtil.viewNavIcon(treeMenu.getRootNode(), 1);
					}
				}
			}}),
			root: new Ext.tree.AsyncTreeNode({text:'main_menu_root'})
		});
		
		//打开功能
		treeMenu.on('click', function(node){
			if (node.isLeaf()) {
				Jxstar.createNode(node.id);	
			} else {
				if (node.isExpanded()) {
					node.collapse();
				} else {
					node.expand();
				}
			}
		});
		
		//给展开的菜单区域添加底部边框
		treeMenu.on('expandnode', function(node) {
			if (node.id.length == 4 && !node.isLast()) {
				var ct = Ext.get(node.getUI().ctNode);
				if (!ct.hasClass('x-tree-node-ct-ext')) {
					ct.addClass('x-tree-node-ct-ext');
				}
			}
			//显示二级模块的流程导航图标
			if (node.id.length == 4 && showwf == '2') {
				JxUtil.viewNavIcon(node, 2);
			}
		});

		//创建首页页面布局
		var viewport = new Ext.Viewport({
			layout:'border',
			items:[topPanel, treeMenu, sysMainTab]
		});
		//方便在代理工作切换时销毁此对象
		Jxstar.viewport = viewport;
	}

	//创建protel功能界面
	var funTab = sysMainTab.getComponent(0);
	if (isportset == '1') {
		JxPortalExt.createPortals(funTab);
	} else {
		JxPortal.createMainPortal(funTab);
	}

	//设置首页按钮
	Ext.fly('main_page_img').on('click', function(){
		mainTab.showHome();
		//重新加载首页
		funTab.removeAll(funTab.getComponent(0), true);
		if (isportset == '1') {
			JxPortalExt.createPortals(funTab);
		} else {
			JxPortal.createMainPortal(funTab);
		}
	});

	//关闭右键事件
	Ext.getDoc().on('contextmenu', function(e){e.stopEvent();});
	//关闭F5刷新事件
	Ext.getDoc().on('keydown', function(e){
		if (e.getKey() == 116){
			e.stopEvent(); 
			if (Ext.isIE) {event.keyCode = 0;}//用于IE
			alert('本系统采用无刷新技术，可以点击软件中的刷新按钮查看最新数据！');
			return false;
		}
	});
	
	window.onbeforeunload = function(ev){
		if (JxUtil.isLogout) return;	//正常退出系统
		//通过刷新退出系统
		JxUtil.logout(true);
		if (Ext.isIE) return '执行浏览器刷新操作会退出系统！';
		return false;
	};

	sysMainTab.doLayout();
	
	//显示代理工作连接
	JxMenu.showProxy();
	
	//启动会话效验
	SessionTimer.SESSION_TIMEOUT = Jxstar.session.maxInterval;
	SessionTimer.resetTimer();
	SessionTimer.startTimer();
})();