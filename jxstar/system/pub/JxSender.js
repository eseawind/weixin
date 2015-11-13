/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
  
/**
 * 消息发送页面。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

JxSender = {};
Jxstar.jxsender = JxSender;
Ext.apply(JxSender, {
	grid: null,//在表格中发送消息时用
	
	portlet: null,//在portlet中发送消息时用

	//外部调用的发送消息的方法
	send: function(src) {
		var me = this;
		if (src) {
			if (src.isXType && src.isXType('grid')) {
				me.grid = src;
			} else {
				me.portlet = src;
			}
		}
		
		var keyid = me.createId();
		me.createPage('sys_msg', keyid);
	},
	
	//外部调用编辑消息
	edit: function(keyid, grid) {
		var me = this;
		me.grid = grid;
		
		me.createPage('sys_msg', keyid);
	},
	
	//创建发送消息的主键
	createId: function() {
		var rand = Math.round(Math.random()*100);
		//如果不加jx字符，系统会认为是数字，变为负数了
		return 'jx'+rand+((new Date()).getTime()-(new Date(2013,0,1)).getTime());
	},
	
	//创建发送消息的界面
	createPage: function(funid, keyid) {
		var me = this;
		var form = new Ext.form.FormPanel({
			layout:'fit', 
			region:'center',
			border: false,
			items: [
				{xtype:'imghtmleditor', name:'sys_news__news_cont', allowBlank:false, anchor:'100%', maxLength:20000},
				{xtype:'hidden', name:'sys_news__news_id', value:keyid}
				]
		});
		//给系统定义信息，方便上传附件
		var define = Jxstar.findNode('sys_msg');
		form.formNode = {define:define};
		
		//添加明细表
		var page = new Ext.Panel({
			border:false,
			layout:'border',
			items:[{
				pagetype:'subgrid',
				region:'west',
				layout:'fit',
				width:160,
				split:true,
				border:false
			},form]
		});
		//添加明细表
		var subParam = {pageType:'subgrid', parentNodeId:funid};
		var subfunid = define.subfunid;
		var subpanel = page.getComponent(0);
		Jxstar.createPage(subfunid, 'gridpage', subpanel, subParam);
		JxUtil.delay(1000, function(){
			var subgrid = subpanel.getComponent(0);
			Jxstar.loadSubData(subgrid, keyid);
		});
		
		//创建对话框
		var	win = new Ext.Window({
			title: '发送消息',
			layout: 'fit',
			width: 750,
			height: 450,
			modal: true,
			border: false,
			closeAction: 'close',
			items: [page],
			buttons: [{
				text:'直接发送',
				handler:function(){
					//判断是否有发送对象
					var subgrid = subpanel.getComponent(0);
					var cnt = subgrid.getStore().getCount();
					if (cnt == 0) {
						JxHint.alert('没有选择接收消息的人，不能发送！');
						return;
					}
					
					//取消息内容
					var html = form.getForm().get('sys_news__news_cont');
					html = encodeURIComponent(html);
					if (html.length == 0) {
						JxHint.alert('没有消息内容，不能发送！');
						return;
					}
					
					//设置请求的参数
					var params = 'funid='+ funid +'&keyid='+ keyid +'&pagetype=form&eventcode=send&news_cont='+html;
					
					//保存后刷新记录
					var endcall = function(data) {
						win.success = true;
						win.close();
						if (me.grid) {
							me.grid.getStore().reload();
						}
						if (me.portlet) {
							me.portlet.refresh();
						}
					};

					//发送请求
					Request.postRequest(params, endcall);
				}
			},{
				text:'保存草稿',
				handler:function(){
					//取消息内容
					var html = form.getForm().get('sys_news__news_cont');
					html = encodeURIComponent(html);
					if (html.length == 0) {
						JxHint.alert('没有消息内容，不需保存！');
						return;
					}
					
					//设置请求的参数
					var params = 'funid='+ funid +'&keyid='+ keyid +'&pagetype=form&eventcode=fsave&news_cont='+html;
					
					//保存后刷新记录
					var endcall = function(data) {
						win.success = true;
						win.close();
						if (me.grid) {
							me.grid.getStore().reload();
						}
						if (me.portlet) {
							me.portlet.refresh();
						}
					};

					//发送请求
					Request.postRequest(params, endcall);
				}
			},{
				text:'取消',
				handler:function(){
					win.close();
				}
			}]
		});
		win.show();
		
		//如果是非正常关闭，则清除临时数据
		win.on('close', function(){
			if (!win.success) {
				me.deltmp(funid, keyid);
			}
		});
		
		return win;
	},
	
	//提取html中的文本
	htmlToText: function(html) {
		if (!html) return '';
		html = html.replace(/<(\/\s*)?((\w+:)?\w+)(\w+(\s*=\s*((["'])(\\["'tbnr]|[^\7])*?\7|\w+)|.{0})|\s)*?(\/\s*)?>/ig,'');
		
		//var start_ptn = /(<.[^>]+>)*/gmi;      	//过滤标签开头       
		//var end_ptn = /<\/?\w+>$/;            	//过滤标签结束   
		//var space_ptn = /(&nbsp;)*/;            //过滤空格   
		//html = html.replace(start_ptn,"").replace(end_ptn).replace(space_ptn,""); 
		html = html.replace(/？/g, ''); 		//过滤特殊符号
		
		return html;
	},
	
	//删除没有发送成功的消息的临时数据，包括发送对象，附件明细
	deltmp: function(funid, keyid) {
		var params = 'funid='+ funid +'&keyid='+ keyid;
		params += '&pagetype=form&eventcode=deltmp';

		//发送请求
		Request.postRequest(params);
	},
	
	/*********************************************下面是portlet中需要用到的方法************************************/
	/**
	 * public
	 * 阅读消息，弹出对话框，显示当前消息内容。
	 **/
	readBoard: function(newsId, src) {
		var me = this;
		
		if (src) {
			if (src.isXType && src.isXType('grid')) {
				me.grid = src;
			} else {
				me.portlet = src;
			}
		}

		//显示消息内容对话框
		var showWin = function(data) {
			var userid = JxDefault.getUserId();
			var edit_userid = data.cont.edit_userid;
			
			var btns = [{iconCls:'eb_return', text:'回复', handler:function(){me.replyBoard(newsId, win);}},
						{iconCls:'eb_refresh', text:'刷新', handler:function(){me.refreshCont(newsId, win);}}];
			var cont_type = data.cont.cont_type;
			if (cont_type == '0') {
				var btnname = (userid == edit_userid) ? '注销' : '不关注';
				btns.push({iconCls:'eb_cancel', text:btnname, handler:function(){me.notshow(newsId, win);}});				
			}
			
			//创建工具栏
			var tbar = new Ext.Toolbar({deferHeight:true, items:btns});
			//创建消息显示内容
			var html = me.contHtml(data.cont);
			var replys = data.reply;
			for (var i = 0, n = replys.length; i < n; i++) {
				html += me.replyHtml(i+1, replys[i], edit_userid);
			}
			//创建先生消息内容的panel
			var page = new Ext.Panel({tbar: tbar, html: html, autoScroll:true});
			
			//在功能中打开
			var mainTab = Jxstar.sysMainTab;
			var win = mainTab.add({
								title: '阅读消息',
								border: false,
								layout: 'fit',
								closable: true,
								iconCls: 'function',
								style: 'font-size:12px;',
								items: [page]
							});
			mainTab.activate(win);
			
			//添加删除事件
			me.addDelete(page);
		};
		
		//返回的数据格式为：{cont:{...}, reply:[...]}，第一部分为消息，第二部分为回复
		var hdcall = function(data) {
			if (Ext.isEmpty(data)) {
				JxHint.alert(jx.plet.notboard);
			} else {
				showWin(data);
			}
		};
		var params = 'funid=sys_news_reply&eventcode=fqury&pagetype=form&newsId='+newsId;
		Request.dataRequest(params, hdcall);
	},
	
	//构建消息内容html
	contHtml: function(msgjson) {
		var msgTpl = new Ext.Template(
			'<div flag="0" itemid="{news_id}">',
			'<p style="margin:8px;background-color:#f0f0f0;padding:5px;">',
				'<span>发布者：{edit_user}&nbsp;&nbsp;{edit_date}</span>',
			'</p>',
			'<p style="margin:8px;font-size:14px;font-weight:bold;">{news_title}</p>',
			'<div style="margin:8px;">{news_cont}</div>',
			'</div>'
		);
		
		return msgTpl.apply(msgjson);
	},
		
	//构建回复内容html
	replyHtml: function(index, msgjson, edit_userid) {
		var delhtml = '';
		var userid = JxDefault.getUserId();
		var reuserid = msgjson.edit_userid;
		if (edit_userid == userid || userid == reuserid) {//发布者或回复人可以直接删除回复信息
			delhtml = '&nbsp;&nbsp;<a href="#" class="delete" itemid="{reply_id}" parentid="{news_id}">删除</a>';
		}
	
		var msgTpl = new Ext.Template(
			'<div flag="1" itemid="{reply_id}">',
			'<p style="margin:8px;background-color:#f0f0f0;padding:5px;">',
				'<span>楼{index}: {edit_user}&nbsp;&nbsp;{edit_date}'+ delhtml +'</span>',
			'</p>',
			'<div style="margin:8px;">{reply_cont}</div>',
			'</div>'
		);
		
		msgjson.index = index;
		return msgTpl.apply(msgjson);
	},
	
	//private 回复信息
	replyBoard: function(newsId, newsWin) {
		var me = this;
		var reply_id = me.createId();
		//创建回复信息界面
		var page = new Ext.form.FormPanel({
				layout:'fit', 
				border: false,
				items: [
					{xtype:'imghtmleditor', name:'sys_news_reply__reply_cont', allowBlank:false, anchor:'100%', maxLength:20000},
					{xtype:'hidden', name:'sys_news_reply__reply_id', value:reply_id}
					]
			});
		//给系统定义信息，方便上传附件
		var d = Jxstar.findNode('sys_news_reply');
		page.formNode = {define:d};
		
		//创建对话框
		var	win = new Ext.Window({
			title: '回复消息',
			layout: 'fit',
			width: 650,
			height: 400,
			modal: true,
			border: false,
			closeAction: 'close',
			style: 'padding: 5px;',
			items: [page],
			buttons: [{
				text:jx.base.ok,		//确定
				handler:function(){
					var html = page.getForm().get('sys_news_reply__reply_cont');
					html = encodeURIComponent(html);
					
					//设置请求的参数
					var params = 'funid=sys_news_reply&keyid='+reply_id+'&pagetype=form&eventcode=fsave';
					params += '&news_id='+newsId+'&reply_cont='+html;
					
					//保存后刷新记录
					var endcall = function(data) {
						me.refreshCont(newsId, newsWin);
						win.close();
					};

					//发送请求
					Request.postRequest(params, endcall);
				}
			},{
				text:jx.base.cancel,	//取消
				handler:function(){win.close();}
			}]
		});
		win.show();
	},
	
	//刷新消息与回复信息
	refreshCont: function(newsId, newsWin) {
		var me = this;
		var hdcall = function(data) {
			if (Ext.isEmpty(data)) {
				JxHint.alert(jx.plet.notboard);
			} else {
				//先删除原来的内容
				var page = newsWin.getComponent(0);
				page.removeAll();
				
				//创建消息显示内容
				var html = me.contHtml(data.cont);
				var replys = data.reply;
				for (var i = 0, n = replys.length; i < n; i++) {
					html += me.replyHtml(i+1, replys[i], data.cont.edit_userid);
				}
				
				//显示新内容
				page.update(html);
				//添加删除事件
				me.addDelete(page);
			}
		};
		var params = 'funid=sys_news_reply&eventcode=fqury&pagetype=form&newsId='+newsId;
		Request.dataRequest(params, hdcall);
	},
	
	//不关注此消息，不再显示在消息栏中
	notshow: function(newsId, newsWin) {
		var me = this;
		//直接关闭此功能
		var hdcall = function(data) {
			newsWin.destroy();
			if (me.portlet) {
				me.portlet.refresh();
			}
		};
		var params = 'funid=sys_msg&eventcode=notshow&pagetype=grid&newsId='+newsId;
		Request.dataRequest(params, hdcall);
	},
	
	//给回复消息添加删除事件，只有管理员才有权限
	addDelete: function(page) {
		var me = this;
		//删除回复记录与相关附件
		var delReply = function(replyId, newsId) {
			//设置请求的参数
			var params = 'funid=sys_news_reply&replyId='+replyId+'&pagetype=form&eventcode=fdelete';
			
			//保存后刷新记录
			var endcall = function(data) {
				me.refreshCont(newsId, page.ownerCt);
			};

			//发送请求
			Request.postRequest(params, endcall);
		};
		
		var dela = page.body.select('a.delete');
		dela.on('click', function(e, t){
			var el = Ext.get(t);
			var itemid = el.getAttribute('itemid');
			var parentid = el.getAttribute('parentid');
			delReply(itemid, parentid);
		});
	},
	
	/**
	 * public
	 * 显示所有自已发布的消息。
	 **/
	queryMsg: function() {
		var userid = Jxstar.session['user_id'];
		//过滤条件
		var where_sql = '(edit_userid = ? or exists (select * from sys_news_obj where sys_news_obj.news_id = sys_news.news_id and '+
						'sys_news.state = ? and obj_type = ? and obj_id = ?))';
		var where_type = 'string;string;string;string';
		var where_value = userid +';1;1;'+ userid;
		
		var funid = 'sys_msg';
		var define = Jxstar.findNode(funid);
		Jxstar.rightNodes.push(funid);
		
		var param = {whereSql:where_sql, whereType:where_type, whereValue:where_value};
		Jxstar.createNode(funid, param);
	},
	
	/**
	 * public
	 * 显示所有已发布的公告。
	 **/
	queryBoard: function() {
		var userid = Jxstar.session['user_id'];
		//过滤条件
		var where_sql = 'f_isnews(news_id, ?) = ? and sys_news.state = ?';
		var where_type = 'string;string;string';
		var where_value = userid +';1;1';
		
		var funid = 'sys_news';
		var define = Jxstar.findNode(funid);
		Jxstar.rightNodes.push(funid);
		
		var param = {whereSql:where_sql, whereType:where_type, whereValue:where_value};
		Jxstar.createNode(funid, param);
	}
});
