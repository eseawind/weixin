/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 表格结果集portlet控件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

PortletResultG = {};
(function(){

	Ext.apply(PortletResultG, {
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
			var grid = this.ownerCt.getComponent(0);
			Jxstar.reload(grid);
		}
	},
	
	/**
	 * public
	 * 显示结果集表格
	 **/
	showPortlet: function(target) {
		var self = this;
		if (target == null) {
			JxHint.alert(jx.plet.noparent);	//'显示PORTLET的容器对象为空！'
			return;
		}
		this.ownerCt = target;
		//先清除内容
		target.removeAll(target.getComponent(0), true);
	
		//取结果集对应的功能ID
		var resultFunId = target.initialConfig.objectid;
		//显示grid页面
		var param = {pageType:'notoolgrid'};
		Jxstar.createPage(resultFunId, 'gridpage', target, param);
	}
	
	});//Ext.apply
})();
