/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 上报任务portlet控件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

PortletWarn = {};
(function(){

	Ext.apply(PortletWarn, {
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
		
		var hdCall = function(warnJson) {
			warnJson = warnJson.root;
			var warnHtml = '';
			if (!warnJson || warnJson.length == 0) {
				warnHtml = '<div class="nav_msg_notip">'+ jx.plet.nowarn +'</div>';	//没有新上报任务！
			} else {
				warnHtml = PortletWarn.createPortlet(warnJson);
			}
			
			target.add({html:warnHtml,autoScroll:true});
			target.doLayout();
		};
		//加载显示“待办任务”的上报消息
		var params = 'funid=sys_warn&eventcode=cntwarn';
		Request.dataRequest(params, hdCall);
	},
	
	/**
	 * private
	 * 创建上报消息列表
	 * warnJson参数是数组对象，每个成员的格式：funid -- 功能ID, warnid -- 上报ID, warnname -- 上报名称, warnnum -- 上报数量
	 **/
	createPortlet: function(warnJson) {
		var tableTpl= new Ext.Template(
			'<table width="100%" border="0" align="center" cellpadding="1" cellspacing="1" class="nav_msg_table">',
				'{rows}',
			'</table>'
		);
	
		var rowTpl = new Ext.Template(
			'<tr height="20" style="background-color:{bgcolor};"><td>',
				'<li><a href="#" {chgcolor} onclick="{readFn}">{warntitle}</a>',
			'</td><tr>'
		);
	
		var en = function(str){
			if (str == null || str.length == 0) return '';
			str = encodeURIComponent(str);
			str = str.replace(/'/g, "\\'");
			return str;
		};
		
		var rows = [];
		//列表中只显示6条最新消息
		var len = warnJson.length;// > 6 ? 6 : warnJson.length;
		for (var i = 0; i < len; i++) {
			var warnVal = {};
			warnVal.readFn = 'PortletWarn.showWarnData(\''+ 
				warnJson[i].fun_id +'\', \''+ en(warnJson[i].whereSql) +'\');';
			
			var warnnum = warnJson[i].warn_num;
			var warnname = warnJson[i].warn_name;
			warnVal.warntitle = warnname+'['+warnnum+']';
			warnVal.bgcolor = (i%2 == 1) ? '#ddffdd' : '';
			warnVal.chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#0080FF\';"';
			
			rows[i] = rowTpl.apply(warnVal);
			warnVal = null;
		}
		
		return tableTpl.apply({rows:rows.join('')});
	},
	
	/**
	 * 显示上报任务的记录
	 * funId -- 功能ID
	 * wheresql -- 过滤条件
	 **/
	showWarnData: function(funId, wheresql) {
		//取功能对象信息
		var define = Jxstar.findNode(funId);
		if (define == null) {
			JxHint.alert(String.format(jx.star.nopage, funId));	//'没有定义【{0}】功能页面信息！'
			return false;
		}
		
		var pageParam = {whereSql:decodeURIComponent(wheresql)};
		Jxstar.createNode(funId, pageParam);
	}
	
	});//Ext.apply

	//5分钟刷新一次
	setInterval(function() {PortletWarn.refresh();}, 1000*60*5);
})();
