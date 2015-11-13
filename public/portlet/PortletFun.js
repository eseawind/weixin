/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 常用功能portlet控件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

PortletFun = {};
(function(){

	Ext.apply(PortletFun, {
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
	
	//设置个人的常用功能
	setFun: function() {
		//过滤条件
		var where_sql = 'plet_fun.owner_user_id = ?';
		var where_type = 'string';
		var where_value = Jxstar.session['user_id'];
		
		//显示数据
		var hdcall = function(grid) {
			JxUtil.delay(500, function(){
				//处理树形页面的情况
				if (!grid.isXType('grid')) {
					grid = grid.getComponent(1).getComponent(0);
				}

				//设置外键值
				grid.fkFunId = 'sys_user';
				grid.fkValue = where_value;
				Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
			});
		};
	
		var define = Jxstar.findNode('plet_fun');
		//显示数据
		Jxstar.showData({
			filename: define.gridpage,
			title: define.nodetitle, 
			pagetype: 'editgrid',
			nodedefine: define,
			callback: hdcall
		});
	},
	
	/**
	 * public
	 * 显示常用功能列表
	 **/
	showPortlet: function(target) {
		var self = this;
		if (target == null) {
			JxHint.alert(jx.plet.noparent);	//'显示PORTLET的容器对象为空！'
			return;
		}
		//首次显示添加设置个人常用功能的按钮
		var gear = target.getTool('gear');
		if (!gear) {
			var gear = {
				id:'gear',
				qtip:'设置个人常用功能',
				handler: function(e, target, cell){
					self.setFun();
				}
			};
			target.addTool(gear);
		}
		
		self.ownerCt = target;
		//先清除内容
		target.removeAll(target.getComponent(0), true);
	
		var hdcall = function(funJson) {
			var funHtml = self.createPortlet(funJson);
			
			target.add({html:funHtml,border:false,autoScroll:true});
			target.doLayout();
		};
		var pletid = target.initialConfig.pletid;
		var params = 'funid=queryevent&eventcode=query_pletfun&portletid='+pletid;
		Request.dataRequest(params, hdcall);
	},
	
	/**
	 * private
	 * 创建常用功能列表
	 * funJson参数是数组对象，每个成员的格式：funid -- 功能ID，funname -- 功能名称
	 **/
	createPortlet: function(funJson) {
		if (funJson.length == 0) {
			return '<div class="nav_msg_notip">'+ jx.plet.nofun +'</div>';	//没有定义常用功能！
		}
	
		var tableTpl = new Ext.Template(
			'<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" class="nav_msg_table">',
				'{rows}',
			'</table>'
		);
		
		var rowTpl = new Ext.Template(
			'<tr height="20" style="background-color:{bgcolor};"><td>',
				'<li><a href="#" {chgcolor} onclick="Jxstar.createNode(\'{funid}\');">{funname}</a>',
			'</td><tr>'
		);
	
		var cnt = 0, rows = [];
		var len = funJson.length;
		for (var i = 0; i < len; i++) {
			//没有操作权限的不显示
			if (Jxstar.validNode(funJson[i].funid) == false) continue;
			
			funJson[i].bgcolor = (cnt%2 == 1) ? '#ddffdd' : '';
			funJson[i].chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#0080FF\';"';
			
			rows[i] = rowTpl.apply(funJson[i]);
			//列表中只显示7条记录
			cnt++;
			//if (cnt > 6) break; 
		}
		
		return tableTpl.apply({rows:rows.join('')});
	}
	
	});//Ext.apply

})();
