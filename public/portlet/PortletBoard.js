/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 公告栏portlet控件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

PortletBoard = {};
(function(){

	Ext.apply(PortletBoard, {
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
	 * 显示公告列表
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
		
		//最近30天的公告
		var options = {
			where_sql: 'plet_msg.msg_state = ? and plet_msg.send_date <= ?',
			where_type: 'string;date',
			where_value: '1;'+JxUtil.getNextDate(JxUtil.getToday(), 30),
			callback: function(msgJson) {
				//如果没有消息则显示提示
				var msgHtml = '';
				if (msgJson.length == 0) {
					msgHtml = '<div class="nav_msg_notip">'+ jx.plet.noboard +'</div>';	//没有新公告！
				} else {
					msgHtml = self.createPortlet(msgJson);
				}
				var panelHtml = self.createHtml(msgHtml, msgJson.length);
				
				target.add({html:panelHtml,autoScroll:true});
				target.doLayout();
			}
		};
		Jxstar.queryData('send_board', options);
	},
	
	/**
	 * private
	 * 构建消息内容的HTML
	 **/
	createHtml: function(msgHtml) {
		var chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#444\';"';
		var btnHtml = 
		'<a href="#" '+ chgcolor +' style="padding-right:8px;color:#444" onclick="PortletBoard.queryBoard();">'+ jx.plet.all +'</a>';	//所有...
		
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
	 * 创建公告列表
	 * msgJson参数是数组对象，每个成员的格式：msgid -- 消息ID，msgtitle -- 消息标题
	 **/
	createPortlet: function(msgJson) {
		var tableTpl = new Ext.Template(
			'<table width="100%" border="0" align="center" cellpadding="1" cellspacing="1" class="nav_msg_table">',
				'{rows}',
			'</table>'
		);
		
		var rowTpl = new Ext.Template(
			'<tr height="20" style="background-color:{bgcolor};"><td>',
				'<li><a href="#" {chgcolor} onclick="PortletBoard.readBoard(\'{msgid}\');">{msgtitle}</a>',
			'</td><tr>'
		);
	
		var rows = [];
		for (var i = 0; i < msgJson.length; i++) {
			var msgVal = {};
			msgVal.msgid = msgJson[i].plet_msg__msg_id;
			var msgtitle = msgJson[i].plet_msg__msg_title;
			msgVal.msgtitle = Ext.util.Format.ellipsis(msgtitle, 40);
			msgVal.bgcolor = (i%2 == 1) ? '#ddffdd' : '';
			msgVal.chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#0080FF\';"';
			
			rows[i] = rowTpl.apply(msgVal);
		}
		
		return tableTpl.apply({rows:rows.join('')});
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
	 * 显示所有已发布的公告。
	 **/
	queryBoard: function() {
		//过滤条件
		var where_sql = 'plet_msg.msg_state = ?';
		var where_type = 'string';
		var where_value = '1';
			
		var hdcall = function(grid) {
			//显示数据
			JxUtil.delay(500, function(){
				Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
			});
		};
		
		Jxstar.showData({
			filename: '/jxstar/system/grid_send_board.js',
			pagetype: 'readgrid',
			title: jx.plet.allboard,	//'所有公告'
			callback: hdcall
		});
	}
	
	});//Ext.apply

})();
