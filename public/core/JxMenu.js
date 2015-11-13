/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 主菜单构建工具类。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

JxMenu = {};
(function(){

	Ext.apply(JxMenu, {
		/**
		* public
		* 创建主菜单
		* targetId -- 显示对象的ID
		*/
		createMainMenu: function(targetId){
			var hdCall = function(menuJson) {
				var panelItems = JxMenu.createMenumItems(menuJson);
				/*系统升级需修改  begin*/
				//支持新首页tab控件
				var funHtml = 
				'<span style="float:left;padding-top:6px;">' +
				'<a href="#" class="top-menu-text" onclick="JxUtil.showMain();" id="main_curr_home"><span class="top-menu-img eb_home">首页</span></a>' +
				'<a href="#" class="top-menu-text" onclick="JxUtil.showWfnav(this);" style="display:none;" id="main_curr_wfnav">' +
					'<span class="top-menu-img eb_wfnav">业务导航</span></a>' +
				'<a href="#" class="top-menu-text" onclick="JxUtil.currWin(this);"><span class="top-menu-img eb_windows">切换窗口</span></a>' +
				'<a href="#" class="top-menu-text" title="关闭此功能" style="display:none;">' +
					'<span class="top-menu-img eb_colse" id="main_curr_fun">&nbsp;</span></a>' +
				'</span>';
				if (Jxstar.sysMainTab.isXType('tabpanel')) funHtml = '&nbsp;';
				/*系统升级需修改  end*/
				//本空白栏的作用是使按钮栏右对齐
				panelItems[0] = {
					baseCls: 'x-plain',
					cls: 'btn-panel',
					xtype: 'panel',
					/*系统升级需修改  begin*/
					html: '<div>'+ funHtml +'</div>',
					/*系统升级需修改  end*/
					columnWidth: 1
				};

				//创建并显示菜单面板
				var topMenu = new Ext.Panel({
					layout:'column',
					defaultType: 'button',
					defaults:{style:'margin-right:1px;'},
					baseCls: 'x-plain',
					cls: 'btn-panel',
					renderTo : targetId,
					items: panelItems
				});
				
				//保留顶部菜单，方便创建代理菜单
				Jxstar.topMenu = topMenu;
			};

			var params = 'funid=queryevent&eventcode=query_menu';
			//从后台取菜单
			Request.dataRequest(params, hdCall);
		},
		
		/**
		 * private
		 * 创建菜单内容
		 **/
		createMenumItems: function(menuJson) {
			//保存一级菜单
			var oneMenuItems = [], m = 1;
			//预留第一个显示空白栏
			oneMenuItems[0] = {};

			for (var i = 0; i < menuJson.length; i++) {
				var oneModule = menuJson[i];
				//处理多语言文字
				oneModule.text = JxLang.moduleText(oneModule.id, oneModule.text);

				//创建二级菜单
				var towMenu = new Ext.menu.Menu();
				for (var j = 0; j < oneModule.children.length; j++) {
					var towModule = oneModule.children[j];
					//处理多语言文字
					towModule.text = JxLang.moduleText(towModule.id, towModule.text);
				
					//创建三级功能菜单
					var threeMenu = new Ext.menu.Menu();
					for (var k = 0; k < towModule.children.length; k++) {
						var threeModule = towModule.children[k];
						//处理多语言文字
						threeModule.text = JxLang.funText(threeModule.id, threeModule.text);
						
						threeMenu.add({id:'menu_' + threeModule.id, text:threeModule.text});
						//保存授权的功能ID
						Jxstar.rightNodes.push(threeModule.id);
					}
					//添加打开功能事件
					threeMenu.on('itemclick', function(item, e){
						var funid = item.id.substr(5);
						Jxstar.createNode(funid);	
					});

					towMenu.add({id:'menu_' + towModule.id, text:towModule.text, menu:threeMenu});
				}

				//点击事件取消
				towMenu.on('itemclick', function(item, e){return false;});
				
				oneMenuItems[m++] = {id:'menu_' + oneModule.id, text:oneModule.text, baseCls: 'x-plain', menu:towMenu};
			}
			
			var otherMenu = [{id:'menu_modify_pwd', text:'修改密码', baseCls: 'x-plain', handler:function(){
					var userId = JxDefault.getUserId();
					JxUtil.setPass(userId);
				}}];
			otherMenu[1] = {id:'menu_show_online', text:'在线用户', handler:JxUtil.onLineUser};
			//系统操作
			oneMenuItems[m] = {id:'menu_sys_other', text:'其它', iconCls:'eb_online', leaf:false, menu:otherMenu};
			//退出系统
			oneMenuItems[m+1] = {id:'menu_logout', text:'退出', baseCls:'x-plain', iconCls:'eb_logout', handler:JxUtil.logout};
			
			return oneMenuItems;
		},
		
		/**
		* public 创建TOP菜单的代理工作连接
		*/
		showProxy: function() {
			//如果当前是代理状态，则显示退出代理的链接
			var proxy_id = Jxstar.session['proxy_id'];
			if (proxy_id) {
				JxMenu.showOutProxy();
				return;
			}
			
			//显示代理设置的对话框
			var showWin = function() {
				var hdcall = function(grid) {
					//当前用户ID与当前日期-1天
					var userid = Jxstar.session['user_id'];
					var ed = (new Date()).add(Date.DAY, -1).format('Y-m-d');
					
					var options = {
						where_sql: 'auditing=1 and user_id = ? and end_date > ?',
						where_type: 'string;date',
						where_value: userid+';'+ed
					};
					Jxstar.loadData(grid, options);
				};
				var define = Jxstar.findNode('sys_proxy_sel');
				Jxstar.showData({
					filename: define.gridpage,
					title: define.nodetitle,
					pagetype: 'selgrid',
					width: 600,
					height: 300,
					callback: hdcall
				});
			};
			
			var hdCall = function(data) {
				if (data.total == 0) return;
				//菜单显示位置
				var menuPos = Jxstar.systemVar.index__menu__pos;
				//显示代理工作的链接或菜单
				if (menuPos && menuPos == 'top') {
					//等待菜单加载完成后才执行
					var fn = function(){
						if (Jxstar.topMenu) {
							//不能用Ext.getCmp()的方式获取控件，会造成进入代理界面后不能显示"其它"菜单了。
							var otherMenu = Jxstar.topMenu.getComponent('menu_sys_other');
							otherMenu.menu.add({id:'menu_in_proxy', iconCls:'eb_proxy', text:'代理工作', handler:showWin});
						} else {
							JxUtil.delay(500, fn);
						}
					};
					fn();
				} else {
					var topPanel = Jxstar.viewport.getComponent(0);
					var topBtnTd = topPanel.getEl().query('#top_btn_td');
					if (topBtnTd.length > 0) {
						var html = '<span><a href="#" class="top-menu-text" ><span class="top-menu-img eb_proxy">代理工作</span></a></span>';
						var btn = Ext.get(topBtnTd[0]).insertHtml('afterBegin', html, true);
						btn.on('click', showWin);
					}
				}
			};
			
			//当前用户ID与当前日期-1天
			var userid = Jxstar.session['user_id'];
			var ed = (new Date()).add(Date.DAY, -1).format('Y-m-d');
			var params = 'eventcode=query_data&funid=queryevent&pagetype=grid'+
						'&query_funid=sys_proxy&where_sql=auditing=1 and user_id = ? and end_date > ?'+
						'&where_type=string;date&where_value='+userid+';'+ed;
			Request.dataRequest(params, hdCall);
		},
		
		/**
		* public 创建TOP菜单的退出代理工作连接
		*/
		showOutProxy: function() {
			var proxy_id = Jxstar.session['proxy_id'];
			var to_userid = Jxstar.session['user_id'];
			var proxy_userid = Jxstar.session['proxy_user_id'];
			//退出代理
			var outfn = function(){
				JxMenu.loginProxy(to_userid, proxy_userid, '0', proxy_id);
			};
			
			//菜单显示位置
			var menuPos = Jxstar.systemVar.index__menu__pos;
			//显示代理工作的链接或菜单
			if (menuPos && menuPos == 'top') {
				//等待菜单加载完成后才执行
				var fn = function(){
					if (Jxstar.topMenu) {
						//不能用Ext.getCmp()的方式获取控件，会造成进入代理界面后不能显示"其它"菜单了。
						var otherMenu = Jxstar.topMenu.getComponent('menu_sys_other');
						otherMenu.menu.add({id:'menu_out_proxy', iconCls:'eb_audit_back', text:'退出代理', handler:outfn});
					} else {
						JxUtil.delay(500, fn);
					}
				};
				fn();
			} else {
				var topPanel = Jxstar.viewport.getComponent(0);
				var topBtnTd = topPanel.getEl().query('#top_btn_td');
				if (topBtnTd.length > 0 && proxy_id) {
					var html = '<span><a href="#" class="top-menu-text"><span class="top-menu-img eb_audit_back">退出代理</span></a></span>';
					var btn = Ext.get(topBtnTd[0]).insertHtml('afterBegin', html, true);
					btn.on('click', outfn);
				}
			}
		},
		
		/**
		* public 进入代理工作或退出代理工作
		* to_userid -- 被代理人ID
		* proxy_userid -- 当前用户ID
		* isin -- 是否进入代理：1 进入, 0 退出
		* proxy_id -- 如果是退出代理，则需要此值
		*/
		loginProxy: function(to_userid, proxy_userid, isin, proxy_id) {
			var login_url = Jxstar.path + '/jxstar/other/jsp/workproxy.jsp?proxy_in='+ isin 
				+'&to_userid=' + to_userid + '&proxy_userid=' + proxy_userid;
			if (proxy_id) {
				login_url += '&proxy_id=' + proxy_id;
			}
			//代理登陆成功
			var f_success = function(data) {
				//销毁菜单对象
				if (Jxstar.topMenu) {
					Jxstar.topMenu.destroy();
					Jxstar.topMenu = null;
				}
				
				//销毁原主界面对象
				Jxstar.viewport.destroy();
				Jxstar.viewport = null;
				
				
				//保留原来的一些会话信息
				data.maxInterval = Jxstar.session.maxInterval;
				data.sessionId = Jxstar.session.sessionId;
				Jxstar.session = data;
				
				Request.loadJS('/public/core/JxBody.js');
			};
			
			Ext.Ajax.request({
				method: 'POST',
				url: login_url,
				success: function(response) {
					var result = Ext.decode(response.responseText);
					if (result.success == true || result.success == 'true') {
						JxHint.hint('执行成功：' + result.message);

						//成功执行后重新打开系统主页面
						f_success(result.data);
					} else {
						var msg = result.message;
						JxHint.alert('执行失败：' + msg);
					}
				},
				failure: function(response) {
					response.srcdesc = 'JxMenu.js?login_url='+login_url;
					JxUtil.errorResponse(response);
				}
			});
		}
	
	});//Ext.apply

})();
