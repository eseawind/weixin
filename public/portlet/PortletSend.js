/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 发送消息portlet控件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

PortletSend = {};
(function(){

	Ext.apply(PortletSend, {
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
	 * 显示消息列表
	 **/
	showPortlet: function(target) {
		var self = this;
		if (target == null) {
			JxHint.alert(jx.plet.noparent);	//'显示PORTLET的容器对象为空！'
			return;
		}
		self.ownerCt = target;
		//先清除内容
		target.removeAll(target.getComponent(0), true);
		
		//绑定按钮事件
		var fsend = function(){
			var send = target.getComponent(0).body.select('a.send');
			send.on('click', function(){JxSender.send(self);});
		};
		var fquery = function(){
			var send = target.getComponent(0).body.select('a.query');
			send.on('click', function(){JxSender.queryMsg();});
		};
		var ftitle = function(cls){
			var title = target.getComponent(0).body.select('a.title');
			title.on('click', function(e, t){
				var el = Ext.get(t);
				var itemid = el.getAttribute('itemid');
				JxSender.readBoard(itemid, self);
			});
		};
		
		var hdcall = function(msgJson) {
			var msgHtml = '';
			if (msgJson.length == 0) {
				msgHtml = '<div class="nav_msg_notip">没有消息！</div>';
			} else {
				msgHtml = self.createPortlet(msgJson);
			}
			var panelHtml = self.createHtml(msgHtml, msgJson.length);
			
			target.add({html:panelHtml,autoScroll:true,data:msgJson});
			target.doLayout();
			
			fsend();
			fquery();
			ftitle();
		};
		var params = 'funid=sys_msg&eventcode=qrycont&pagetype=grid';
		Request.dataRequest(params, hdcall);
	},
	
	/**
	 * private
	 * 构建消息内容的HTML
	 **/
	createHtml: function(msgHtml) {
		var chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#444\';"';
		var btnHtml = 
		'<a href="#" '+ chgcolor +' class="send" style="padding-right:8px;color:#444">'+ jx.plet.sendmsg +'</a>' +
		'<a href="#" '+ chgcolor +' class="query" style="padding-right:8px;color:#444">'+ jx.plet.all +'</a>';	//所有...
		
		var toolHtml = 
		'<table width="100%" border="0" align="center" cellpadding="1" cellspacing="1" style="bottom:4px;" class="nav_msg_table">' +
            '<tr><td style="text-align:right;">'+ btnHtml +'</td></tr>' +
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
	 * msgJson参数是数组对象: news_id -- 消息ID, news_cont -- 消息内容
	 **/
	createPortlet: function(msgJson) {
		var tableTpl = new Ext.Template(
			'<table width="100%" border="0" align="center" cellpadding="1" cellspacing="1" class="nav_msg_table">',
				'{rows}',
			'</table>'
		);
		
		var rowTpl = new Ext.Template(
			'<tr height="20" style="background-color:{bgcolor};"><td>',
				'<li><a href="#" class="title" itemid="{msgid}" {chgcolor}>{news_cont}</a>',
			'</td><tr>'
		);//onclick="JxSender.readBoard(\'{msgid}\');"
	
		var rows = [];
		for (var i = 0; i < msgJson.length; i++) {
			var msgVal = {};
			msgVal.msgid = msgJson[i].news_id;
			var news_cont = msgJson[i].news_cont;
			news_cont = JxSender.htmlToText(news_cont);
			
			msgVal.news_cont = Ext.util.Format.ellipsis(news_cont, 40);
			msgVal.bgcolor = (i%2 == 1) ? '#ddffdd' : '';
			msgVal.chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#0080FF\';"';
			if (msgJson[i].is_top == '1') {
				msgVal.chgcolor += ' style="font-weight:bold;"';
			}
			
			rows[i] = rowTpl.apply(msgVal);
		}
		
		return tableTpl.apply({rows:rows.join('')});
	}
	
	});//Ext.apply
	
	//5分钟刷新一次
	setInterval(function() {PortletSend.refresh();}, 1000*60*5);
})();
