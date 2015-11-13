Ext.onReady(function(){

	var tophtml = new Ext.Container({
		region:'north',
		height:66,
		border:false,
		contentEl : 'header'
	});
	var lefthtml = new Ext.Container({
		region:'west',
		width:185,
		border:false,
		contentEl : 'center'
	});
	
	var sysMainCard = new Ext.Container({
		region:'center',
		id:'sys_main_tab',
		layout:'card',
		activeItem: 0,
		border:false
	});
	
	var viewport = new Ext.Viewport({
			layout:'border',
			items:[tophtml,lefthtml,sysMainCard]
	});
	//保存到全局对象中
	Jxstar.sysMainTab = sysMainCard;
	var curSelMenu, curSelFun ;
	
	//打开功能
	var navHandler = function(nodeId, pageParam){ 
		if (nodeId == null || nodeId.length == 0) {
				JxHint.alert(jx.star.noid);	//'打开的功能ID为空！'
				return false;
			}
			
			//功能对象信息
			var define = Jxstar.findNode(nodeId);
			if (define == null) {
				JxHint.alert(String.format(jx.star.nodef, nodeId));	//'没有定义【{0}】功能页面信息！'
				return false;
			}
			
			//检查用户是否有该功能的权限，审批时不判断
			var isCheck = (pageParam && pageParam.pageType && pageParam.pageType == 'check');
			if (!isCheck && !Jxstar.validNode(nodeId)) {
				JxHint.alert(String.format(jx.star.noright, nodeId));	//'用户没有该【{0}】功能的授权！'
				return false;
			}
			
			//取主功能TAB
			var mainTab = Jxstar.sysMainTab;
			var funTitle = define.nodetitle;
			
			//如果打开了功能界面就显示，否则创建功能界面
			var funTab = mainTab.getComponent('fun_' + define.nodeid);
			
			//如果是审批界面，功能标题上添加'--审批'
			if (isCheck) {
				funTitle += '--' + jx.base.check;	//审批
				if (funTab != null) {//如果已显示，则先删除该功能再显示
					mainTab.remove(funTab, true);
					funTab = null;
				}
			}
			
			if (funTab == null) {
				var index = mainTab.items.length;
				var sum = 0;
				for (var i=0;i<index;i++) {
					var ft = mainTab.getComponent(i); 
					if (ft.id.indexOf('fun_') > -1) { //计算当前打开的功能数量
						sum += 1;
					}
				}
				if (sum >= 5) {
					//JxHint.alert(jx.star.morefun);	//'打开的功能数量过多,请关闭不必要的功能标签页！'
					//return false;
					
					//打开的功能过多时，先关闭第一个功能，再打开功能
					var menuli = Ext.fly('open_menu').query('li');
					var fid = menuli[0].getAttribute('id').substr(5);
					var firstFun = mainTab.getComponent('fun_' + fid);
					
					if(firstFun != null){
						mainTab.remove(firstFun, true);
						Ext.fly('open_' + fid).remove();
					} 
				}
				
				//异步加载功能对象后再显示
				var hdCall = function(f) {
					var page = f(define, pageParam);
					//如果不是layout页面，是GridNode页面，则有showPage方法
					if (typeof page.showPage == 'function') {
						pageParam = pageParam || {};
						page = page.showPage(pageParam.pageType, pageParam.parentNodeId);
					}
					
					funTab = mainTab.add({
						id: 'fun_' + define.nodeid,
						border: false,
						layout: 'fit',
						autoScroll: true,
						iconCls: 'function',
						items: [page],
						listeners: {//下面的方法有利于释放内存对象
							beforedestroy: function(){
								page = null;
								funTab = null;
							},
							destroy: function(){
								if(Ext.isIE){CollectGarbage();}//IE强制回收内存
							}
						}
					});
					addOpenTitle(define.nodeid,define.nodetitle); //在当前使用菜单添加标题
					
					mainTab.layout.setActiveItem(funTab.id);
					funTab.doLayout();
					
					//显示表格对象后再加载数据才稳定
					if (page.isXType('grid')) {
						if (pageParam && pageParam.whereSql && pageParam.whereSql.length > 0) {
							Jxstar.loadData(page, {where_sql:pageParam.whereSql, where_value:pageParam.whereValue, where_type:pageParam.whereType, is_query:pageParam.isQuery});
						} else {
							Jxstar.loadInitData(page);
						}
					}
					page = null;
				};

				//异步从JS文件加载功能对象
				var pathname = define.layout;
				if (pathname == null || pathname.length == 0) pathname = define.gridpage;
				if (pathname == null || pathname.length == 0 || pathname.indexOf('.jsp') > -1) {
					JxHint.alert(String.format(jx.star.nopage, nodeId));
					return false;
				}
				Request.loadJS(pathname, hdCall);
			} else {
				Ext.fly('task-navigation').select('li.desktop-handler').removeClass('active');
				Ext.fly('open_' +nodeId).addClass('active');
			
				mainTab.layout.setActiveItem(funTab.id);
			}
			curSelFun = nodeId;
	};
	
	//加载右侧静态页面使用
	var disPage = function(nodeId,pageurl){
		var mainTab = Jxstar.sysMainTab;
		var funTab = mainTab.getComponent('fun_' + nodeId);
		if (funTab == null) {
			var frmid = 'frm_' + parseInt(Math.random() * 10000);
			var ifrHtml = '<iframe id="'+ frmid +'" frameborder="no" style="display:none;border-width:0;width:100%;height:100%;" ></iframe>';
			var funTab = mainTab.add({
				id: 'page_' + nodeId,
				border: false,
				layout: 'fit',
				autoScroll: true,
				bodyStyle: 'padding:15px',
				//autoLoad:{url: pageurl},
				html: ifrHtml,
				listeners: {//下面的方法有利于释放内存对象
					beforedestroy: function(){
						funTab = null;
					},
					destroy: function(){
						if(Ext.isIE){CollectGarbage();}//IE强制回收内存
					}
				}
			});
			
			mainTab.layout.setActiveItem(funTab.id);
			funTab.doLayout();
			
			pageurl = Jxstar.path + '/' + pageurl;
			var frm = Ext.get(frmid);
			frm.dom.src = pageurl + '?_dc=' + (new Date()).getTime();//避免缓存
			frm.show();
		}else{
			mainTab.layout.setActiveItem(funTab.id);
		}
	};
	

	//创建功能菜单视图
	var createFunView = function(moduleId){
		
		var getStore = function(moduleId){
			var url ;
			if(moduleId.length != 0) url = 'zhx/menuJson.jsp?mid=' + moduleId +'&time='+(new Date()).getTime();
			var store = new Ext.data.JsonStore({
				url: url,
				root: 'allFuns',
				autoLoad:true,
				fields: ['moduleId','moduleName','funs']
			});
			//store.load();
			//store.sort('sort', 'ASC');
		
			return store;
		}; 
		//{data:[{'moduleId':'1001','moduleName':'NAME','funs':[{},{}..]},{'mid':'1001','mname':'NAME','funs':[{},{}..]}]}
		var tpl = new Ext.XTemplate(
			'<a class="listicon" href="javascript:void(0)" title="刷新" attr="refresh"><img valign="middle" src="zhx_res/images/refresh.png"></a>', 
			'<tpl for=".">',
				'<div class="panel-header" id="{moduleId}"><h3>{moduleName}</h3></div>',
				'<dl>',
				'<tpl for="funs">',
					'<dd>',
						 '<div class="thumb-wrap" id="{funId}">',
							'<a href="javascript:void(0)" title="{funName}" attr="node"><img src="zhx_res/images/{imgUrl}" />', 
							'<span>{funName}</span></a>',
							'<div><a href="javascript:void(0)">设为常用</a><a class="btnset" style="display:none;">取消常用</a>|<a href="javascript:void(0)">帮助</a></div>',
						 '</div>',
					'</dd>',
				'</tpl>',
				'<div style="clear:left"></div></dl>',
			'</tpl>'
		); 

		var mainTab = Jxstar.sysMainTab;
		var funTab = mainTab.getComponent('menuView');
		//创建DateView
		var retview = function(mid){
			var store = getStore(mid);
			var dataView = new Ext.DataView({
				store: store,
				tpl: tpl,
				autoHeight:true,
				multiSelect:false,
				itemSelector:'div.thumb-wrap',
				overClass:'thumb-wrap-hover',
				onClick : function(e){
					var t = e.getTarget('a');
					if (t) {
						var attr = t.getAttribute('attr');
						if (attr && attr == 'refresh'){
							reloadData(moduleId);
						} 
						else if (attr && attr == 'node') {
							var nodeid = Ext.fly(t).up('div').getAttribute('id');
							navHandler(nodeid);
						}
					}
				}
			});	
			return dataView;
		}
		//刷新视图
		var reloadData = function(id){
			funTab.remove(funTab.getComponent(0),true);
			var view = retview(id);
			funTab.add(view);
			
			mainTab.layout.setActiveItem(funTab.id);
			funTab.doLayout();
		};
			
		if (funTab == null) {
			
			var menuview = retview(moduleId);
			var funTab = mainTab.add({
				id: 'menuView',
				border: false,
				autoScroll: true,
				bodyStyle: 'padding:15px',
				items: menuview
			});
			
			mainTab.layout.setActiveItem(funTab.id);
			funTab.doLayout();

		}else{
			reloadData(moduleId);
		}
	};
	
	var selectLi = function(e){
		var self = Ext.fly(this);
		if (Ext.fly(this).hasClass('active')) return false;
		Ext.fly('task-navigation').select('li.desktop-handler').removeClass('active');
        Ext.fly(this).addClass('active');
		
		var menuId = Ext.fly(this).getAttribute('id');
		//当前打开的功能
		if(menuId.split('_')[0] == 'open'){ 
			var nodeId = menuId.split('open_')[1];
			navHandler(nodeId);
			
		}else if(menuId.split('_')[0] == 'menu'){  //我的菜单
			var moduleId = menuId.split('menu_')[1];
			createFunView(moduleId);
			curSelMenu = menuId;
		}else if(menuId.split('_')[0] == 'common'){  //常用功能
			
		}else if(menuId == 'myWaitTask'){  //代办任务
			disPage(menuId,'zhx/demo/home.html');
		}else if(menuId == 'index'){  //主页
			disPage(menuId,'zhx/demo/index.html');
		}
		
	};
	
	if (Ext.isIE) { 
		 Ext.fly('task-navigation').select('li span').on('mouseover',function(){ 
			Ext.fly(this).addClass('spanover');
		 }); 
		 Ext.fly('task-navigation').select('li span').on('mouseout',function(){ 
			Ext.fly(this).removeClass('spanover');
		 }); 
	}	 
	
	 Ext.fly('task-navigation').select('li.desktop-handler').on('click',selectLi);  
	 
	 var addOpenTitle = function(nodeId,nodetitle){
		var li = Ext.fly('open_' +nodeId);
		
		var html = '<li id="open_' + nodeId + '" class="desktop-handler"><span>'+nodetitle+'</span>' 
				+ '<div id="close_' + nodeId + '" style="position:absolute; right:1px; top:0px; left:auto; bottom:auto;cursor: pointer;z-index: 9999;" >'
				+ '<img src="zhx_res/images/close.gif"></div>'
				+ '</li>';
		
		var newli = Ext.get('open_menu').insertHtml('beforeEnd',html,true);
		newli.on('click', selectLi);
		var closebtn = Ext.get('close_' +nodeId);
		closebtn.on('click',closeEvent);
		Ext.fly('task-navigation').select('li.desktop-handler').removeClass('active');
		Ext.fly('open_' +nodeId).addClass('active');
		
		if (Ext.isIE) { 
			 Ext.fly('task-navigation').select('li span').on('mouseover',function(){ 
				Ext.fly(this).addClass('spanover');
			}); 
			 Ext.fly('task-navigation').select('li span').on('mouseout',function(){ 
				Ext.fly(this).removeClass('spanover');
			 }); 
			 
			Ext.fly('task-navigation').select('li').on('mouseover',function(){ 
				Ext.fly(this).down('div').down('img').addClass('divhover');
			 }); 
			 Ext.fly('task-navigation').select('li').on('mouseout',function(){
				Ext.fly(this).down('div').down('img').removeClass('divhover');
			 });
		}
	 };
	 
	 //关闭当前使用功能
	 var closeEvent = function(e){ 
		var funId = Ext.fly(this).getAttribute('id').split('close_')[1]; 
			
		var mainTab = Jxstar.sysMainTab;
		var funTab = mainTab.getComponent('fun_'+funId);
		
		if(funTab != null){
			mainTab.remove(funTab, true);
			Ext.fly('open_'+funId).remove();
			if (funId == curSelFun) curSelFun = '';
			
			var index = mainTab.items.length;
			for(var i=0;i<index;i++){
				var item = mainTab.getComponent(i);
				if(item.id != '' && item.id.indexOf('fun_') > -1){
					var nodeid = item.id.substr(4);
					if (curSelFun == ''){
						navHandler(nodeid);
						return ;
					}
					if(nodeid == curSelFun){
						navHandler(nodeid);
						return ;
					}
					
				}
			}
			mainTab.layout.setActiveItem('menuView');
			Ext.fly(curSelMenu).addClass('active');
		}
		
	 };
	
	Ext.fly('menu_0000').addClass('active');
	createFunView('0000');
	curSelMenu = 'menu_0000';
	
	Ext.getDom("header").style.display="block";
    Ext.getDom("center").style.display="block";
});