/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 常用功能图标portlet控件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

PortletIcon = {};
(function(){

	Ext.apply(PortletIcon, {
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
		
		var view = target.getComponent(0);
		if (view) {
			var store = view.getStore();
			store.reload();
		} else {
			var pletid = target.initialConfig.pletid;
			var view = self.createPortlet(pletid);
			
			target.add(view);
			target.doLayout();
		}
	},
	
	/**
	 * private
	 * 创建常用功能列表
	 * funJson参数是数组对象，每个成员的格式：funid -- 功能ID，funname -- 功能名称
	 **/
	createPortlet: function(portletId) {
		var url = Jxstar.path + '/commonAction.do?funid=queryevent&eventcode=query_pletfun&portletid='+portletId+'&user_id=' + Jxstar.session['user_id'];
		var store = new Ext.data.JsonStore({
			url: url,
			root: 'data',
			fields: [
				'funid', 'funname', 'funicon'
			]
		});
		store.load();
		
		var tpl = new Ext.XTemplate(
			'<ul>',
                '<tpl for=".">',
                    '<li class="phone">',
                        '<img src="./resources/images/fun/{funicon}.png" />',
                        '<span>{funname}</span>',
                    '</li>',
                '</tpl>',
            '</ul>'
		);
		tpl.compile();
		
		var view = new Ext.DataView({
			cls: 'fun-icon',
			store: store,
			tpl: tpl,
			singleSelect: true,
			autoHeight:true,
			autoScroll: true,
			itemSelector:'li.phone',
			overClass:'phone-hover',
			listeners: {
				click: function(dv, index){
					//打开功能
					var rec = dv.getStore().getAt(index);
					var funid = rec.get('funid');
					Jxstar.createNode(funid);
				},
				containerclick: function(dv){
					dv.clearSelections();
				}
			}
		});
		
		return view;
	}
	
	});//Ext.apply

})();
