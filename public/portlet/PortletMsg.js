/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 消息栏portlet控件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

PortletMsg = {};
(function(){

	Ext.apply(PortletMsg, {
	/**
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
	 * 显示消息列表
	 **/
	showPortlet: function(target) {
		if (target == null) {
			JxHint.alert(jx.plet.noparent);	//'显示PORTLET的容器对象为空！'
			return;
		}
		this.ownerCt = target;
		//先清除内容
		target.removeAll(target.getComponent(0), true);
		
		var hdCall = function(msgJson) {
			var msgJson = msgJson.root;
			//如果没有消息则显示提示
			var msgHtml = '';
			if (msgJson.length == 0) {
				msgHtml = '<div class="nav_msg_notip">'+ jx.plet.nomsg +'</div>';	//没有新消息！
			} else {
				msgHtml = PortletMsg.createPortlet(msgJson);
			}
			var panelHtml = PortletMsg.createHtml(msgHtml, msgJson.length);
			
			target.add({html:panelHtml,autoScroll:true});
			target.doLayout();
		};
		//加载显示“新”的消息记录
		var params = 'funid=get_msg&eventcode=newmsg';
		Request.dataRequest(params, hdCall);
	},
	
	/**
	 * private
	 * 构建消息内容的HTML
	 **/
	createHtml: function(msgHtml, msgNum) {
		var chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#444\';"';
		//发送消息 收件箱 发件箱 已阅公告
		var btnHtml = 
			'<a href="#" '+ chgcolor +' style="padding-right:8px;color:#444" onclick="PortletMsg.sendMsg();">'+ jx.plet.sendmsg +'</a>' +
			'<a href="#" '+ chgcolor +' style="padding-right:8px;color:#444" onclick="PortletMsg.queryGetMsg();">'+ jx.plet.getbar +'</a>' +
			'<a href="#" '+ chgcolor +' style="padding-right:8px;color:#444" onclick="PortletMsg.querySendMsg();">'+ jx.plet.sendbar +'</a>' +
			'<a href="#" '+ chgcolor +' style="padding-right:8px;color:#444" onclick="PortletMsg.queryReadBoard();">'+ jx.plet.hisboard +'</a>'
			;
		
		var numHtml = '';
		if (msgNum > 0) {//共'+msgNum+'条
			numHtml = '<td>'+ String.format(jx.plet.sumnum, msgNum) +'</td>';
		}
		
		var toolHtml = 
			'<table width="100%" border="0" align="center" cellpadding="1" cellspacing="1" style="bottom:4px;" class="nav_msg_table">' +
				'<tr>'+ numHtml +'<td style="text-align:right;">'+ btnHtml +'</td></tr>' +
			'</table>';
		
		var panelHtml = 
			'<table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">' +
				'<tr height="90%" style="vertical-align:top;"><td>'+ msgHtml +'</td></tr>' +
				'<tr height="10%" style="vertical-align:bottom;background-color:#deecfd;"><td>'+ toolHtml +'</td></tr>' + 
			'</table>';
		
		return panelHtml;
	},
	
	/**
	 * private
	 * 创建消息列表
	 * msgJson参数是数组对象，数据格式：msg_title, content, msg_type, dept_id, msg_id
	 * 如果是公告，则判断是属于本部门，否则不显示，公告只显示msg_title内容；
	 * 不同类型的消息，要显示不同的图标；
	 **/
	createPortlet: function(msgJson) {
		var tableTpl= new Ext.Template(
			'<table width="100%" border="0" align="center" cellpadding="1" cellspacing="1" class="nav_msg_table">',
				'{rows}',
			'</table>'
		);
	
		var rowTpl = new Ext.Template(
			'<tr height="20" style="background-color:{bgcolor};">',
				'<td width="20" style="padding-left:4px;"><div class="{msgicon}" title="{msghint}">&nbsp;</div></td>',
				'<td><a href="#" {chgcolor} onclick="{readFn};">{msgtitle}</a></td>',
			'<tr>'
		);
	
		var rows = [];
		for (var i = 0; i < msgJson.length; i++) {
			var msgVal = {}, data = msgJson[i];
			
			var msgid = data.msg_id,
				msgtitle = data.content, 
				msghint = jx.plet.manmsg,	//'个人消息'
				readFn = 'PortletMsg.readMsg(\''+ msgid +'\');',
				msgtype = data.msg_type;
			
			if (msgtype == 'gg') {
				//取当前用户部门ID
				var deptid = JxDefault.getDeptId();	
				//如果不是所属部门或上级部门的公告则不显示
				if (data.dept_id.length > 0 && deptid.indexOf(data.dept_id) != 0) continue;
				
				msgtitle = data.msg_title;
				msghint = jx.plet.ggmsg;	//'公告消息'
				readFn = 'PortletMsg.readBoard(\''+ msgid +'\');';
			}
			if (msgtype == 'sys') {
				msghint = jx.plet.sysmsg;	//'系统消息'
			}
			
			msgVal.readFn = readFn;
			msgVal.msghint = msghint;
			msgVal.msgicon = 'msg_' + msgtype;
			msgVal.msgtitle = Ext.util.Format.ellipsis(msgtitle, 30);
			msgVal.bgcolor = (i%2 == 1) ? '#ddffdd' : '';
			msgVal.chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#0080FF\';"';
			
			rows[i] = rowTpl.apply(msgVal);
			msgVal = null;
		}
		
		return tableTpl.apply({rows:rows.join('')});
	},
	
	/**
	 * public
	 * 阅读消息，弹出对话框，显示当前消息内容。
	 **/
	readMsg: function(msgid) {
		var self = this;
		var hdcall = function(page) {
			var options = {
				where_sql: 'plet_msg.msg_id = ?',
				where_type: 'string',
				where_value: msgid,
				callback: function(data) {
					if (data.length == 0) {
						JxHint.alert(jx.plet.notmsg);	//'没有找到消息记录！'
					} else {
						var r = page.formNode.event.newRecord(data[0]);
						
						page.getForm().myRecord = r;
						page.getForm().loadRecord(r);
					}
				}
			};
			Jxstar.queryData('get_msg', options);
			
			//阅读窗口关闭时刷新消息窗口
			page.on('destroy', function() {
				//刷新消息
				var endcall = function() {
					self.showPortlet(self.ownerCt);
				}
				//标志消息为"已读"
				var params = 'funid=get_msg&keyid=' + msgid +'&pagetype=form&eventcode=read';
				//发送请求
				Request.postRequest(params, endcall);
			});
		};
		
		Jxstar.showData({
			filename: '/jxstar/system/form_get_msg.js',
			pagetype: 'form',
			title: jx.plet.readmsg,	//'阅读消息'
			callback: hdcall
		});
	},
	
	/**
	 * public
	 * 阅读公告，弹出对话框，显示当前公告内容。
	 **/
	readBoard: function(msgid) {
		var self = this;
		var hdcall = function(page) {
			var options = {
				where_sql: 'plet_msg.msg_id = ?',
				where_type: 'string',
				where_value: msgid,
				callback: function(data) {
					if (data.length == 0) {
						JxHint.alert(jx.plet.notboard);	//'没有找到公告记录！'
					} else {
						var r = page.formNode.event.newRecord(data[0]);
						
						page.getForm().myRecord = r;
						page.getForm().loadRecord(r);
					}
				}
			};
			Jxstar.queryData('send_board', options);
			
			//阅读窗口关闭时刷新消息窗口
			page.on('destroy', function() {
				//刷新消息
				var endcall = function() {
					self.showPortlet(self.ownerCt);
				}
				//生成公告阅读记录
				var params = 'funid=send_board&keyid=' + msgid +'&pagetype=readform&eventcode=read';
				//发送请求
				Request.postRequest(params, endcall);
			});
		};
		
		Jxstar.showData({
			filename: '/jxstar/system/form_send_board.js',
			pagetype: 'readform',
			title: jx.plet.readboard,	//'阅读公告'
			callback: hdcall
		});
	},
	
	/**
	 * public
	 * 发送消息，弹出对话框，选择发送人，填写消息内容，上传附件，点击发送。
	 **/
	sendMsg: function() {
		//打开后新增记录
		var hdcall = function(page) {
			page.formNode.event.create();
		};
		
		Jxstar.showData({
			filename: '/jxstar/system/form_send_msg.js',
			pagetype: 'sendform',
			title: jx.plet.sendmsg,		//'发送消息'
			callback: hdcall
		});
	},
	
	/**
	 * public
	 * 发件箱消息，弹出对话框，显示发送人为当前人的消息记录。
	 **/
	querySendMsg: function() {
		//过滤条件
		var where_sql = 'plet_msg.from_userid = ?';
		var where_type = 'string';
		var where_value = JxDefault.getUserId();
			
		var hdcall = function(grid) {
			//显示数据
			JxUtil.delay(500, function(){
				Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
			});
		};
		
		Jxstar.showData({
			filename: '/jxstar/system/grid_send_msg.js',
			pagetype: 'sendgrid',
			title: jx.plet.sendbar,		//'发件箱'
			callback: hdcall
		});
	},
	
	/**
	 * public
	 * 收件箱消息，弹出对话框，显示收件人为当前人的消息记录。
	 * state -- 消息状态
	 **/
	queryGetMsg: function(state) {
		//过滤条件
		var where_sql = 'plet_msg.to_userid = ?';
		var where_type = 'string';
		var where_value = JxDefault.getUserId();
		if (state != null && state.length > 0) {
			where_sql += ' and plet_msg.msg_state = ?';
			where_type += ';string';
			where_value += ';1';
		}
		
		var self = this;
		var hdcall = function(grid) {
			//显示数据
			JxUtil.delay(500, function(){
				Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
			});
			
			//收件箱窗口关闭时刷新消息窗口
			grid.on('destroy', function() {
				self.showPortlet(self.ownerCt);
			});
		};
		
		Jxstar.showData({
			filename: '/jxstar/system/grid_get_msg.js',
			pagetype: 'grid',
			title: jx.plet.getbar,		//'收件箱'
			callback: hdcall
		});
	},
	
	/**
	 * public
	 * 弹出对话框，显示已生成阅读记录的公告记录。
	 **/
	queryReadBoard: function() {
		//过滤条件
		var where_sql = 'plet_read.user_id = ?';
		var where_type = 'string';
		var where_value = JxDefault.getUserId();
		
		var self = this;
		var hdcall = function(grid) {
			//显示数据
			JxUtil.delay(500, function(){
				//取tabpanel中的grid
				grid = grid.getComponent(0).getComponent(0);
				Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
			});
		};
		
		Jxstar.showData({
			filename: '/public/layout/layout_main.js',
			pagetype: 'grid',
			title: jx.plet.hisboard,	//'已阅公告'
			nodedefine: Jxstar.findNode('get_board'),
			callback: hdcall
		});
	}
	
	});//Ext.apply

	//5分钟刷新一次
	setInterval(function() {PortletMsg.refresh();}, 1000*60*5);
})();
