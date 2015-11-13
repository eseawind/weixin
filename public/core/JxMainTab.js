/** 
 * 首页功能管理TabPanel控件。
 * 多余功能标签下拉显示处理方法：
 * 1、根据标签容器的宽度计算，最多可以存放多少个tab，超过后就把前面的标签隐藏，并在下拉菜单中显示；
 * 2、点击下拉菜单时，检查隐藏标签有哪些，显示在菜单中；点击后把该标签显示到最后，前面多余的标签又隐藏；
 * 
 * @author TonyTan
 * @version 1.0, 2014-04-25
 */
JxMainTab = function(config) {
	//显示功能标签的容器
	this.tabct = null;
	//每个功能标签的宽度
	this.tabwidth = 100;
	//显示所有功能的框架
	this.funct = null;
	//首页标签id
	this.homeid = '';
	
	//当前激活的标签，el对象
	this.currtab = null;
	//可以显示标签个数
	this.tabmax = 10;
	
	this.addEvents(
		'beforeactive', 
		'afteractive',
		'beforeclose', 
		'afterclose'
	);
	
	Ext.apply(this, config);
	JxMainTab.superclass.constructor.call(this, config);
};

(function(){
Ext.extend(JxMainTab, Ext.util.Observable, {
	//public 初始化首页控件
	initHome: function() {
		var me = this;
		var id = me.homeid;
		var tab = me.getTab(id);
		me.flagTab(tab);
		me.currtab.on('click', function(){
			me.activeTab(id);
		});
		
		//计算最多可以显示的标签数
		var topct = me.tabct.up('div[class=top_sysbtn]');
		var ctw = topct.getWidth();
		me.tabmax = Math.floor((ctw - 100)/108);
		
		//添加下拉菜单事件
		var el = me.tabct.next('span');
		el.on('click', function(){me.showTabMenu();});
	},
	
	//public 显示首页
	showHome: function() {
		this.activeTab(this.homeid);
	},
	
	//public 激活某个标签
	activeTab: function(id, text) {
		var me = this;
		if (me.fireEvent('beforeactive', me, id, text) == false) return;
		
		//如果标签存在，则激活为当前标签，否则创建新标签
		var tab = me.getTab(id);
		if (tab) {
			me.flagTab(tab);
		} else {
			//如果超过最多标签数后，隐藏第一个功能标签
			if (me.getTabNum() + 1 > me.tabmax) {
				me.hideTab();
			}
			tab = me.createTab(id, text);
			me.flagTab(tab);
		}
		
		me.fireEvent('afteractive', me, id, text);
	},
	
	//public 关闭标签，显示最近一个标签
	closeTab: function(id, me) {
		var tab = me.getTab(id);
		if (!tab) return;
		if (me.fireEvent('beforeactive', me, id) == false) return;
		
		//找到下一个，没有就找上一个标签
		var el = tab.next('li');
		if (!el) el = tab.prev('li');
		
		//关闭指定的标签
		tab.remove();
		
		//同时关闭当前功能页面
		me.funct.remove(id, true);
		
		//激活下一个标签
		if (el) me.flagTab(el);
		
		//显示一个隐藏的标签到尾部
		var tabs = me.tabct.select('li{display=none}:first', true).elements;
		if (tabs.length > 0) {
			var text = tabs[0].getAttribute('title');
			var itemid = tabs[0].getAttribute('itemid');
			tabs[0].remove();
			me.createTab(itemid, text);
		}
		
		me.fireEvent('afteractive', me, id);
	},
	
	//private 创建一个功能标签
	createTab: function(id, text) {
		var me = this;
		var label = text; 
		if (text.length > 6) label = text.substring(0, 6);//只取前6个字
		var html = '<li class="top-fun-text" title="'+ text +'" style="width:'+ me.tabwidth +'px;" itemid="'+ id +'">' +
					  '<span style="display:inline-block;width:'+ (me.tabwidth-20) +'px;text-align:center;">'+ label +'</span>' +
					  '<span class="top-fun-img eb_remco">&nbsp;</span>' +
				   '</li>';
		
		var tab = me.tabct.insertHtml('beforeEnd', html, true);
		tab.setVisibilityMode(Ext.Element.DISPLAY);
		//注册点击事件
		tab.on('click', function(e, t){
			me.activeTab(id);
		});
		
		//显示新的图标
		var icon = tab.child('span[class^=top]');
		icon.addClassOnOver('eb_remcc');
		//配置删除事件
		icon.on('click', function(e, t){
			me.closeTab(id, me);
			e.stopEvent();
		});
		
		return tab;
	},
	
	//private 取得某个标签
	getTab: function(id) {
		return this.tabct.child("li[itemid="+ id +"]");
	},
	
	//private 标记为当前标签
	flagTab: function(tab) {
		var me = this;
		//去掉上个当前标签样式
		if (me.currtab) {
			me.currtab.removeClass('top-fun-curr');
		}
		tab.addClass('top-fun-curr');
		
		//激活对应的功能页面
		var id = tab.getAttribute('itemid');
		me.funct.getLayout().setActiveItem(id);
		
		me.currtab = tab;
	},
	
	//private 获取显示的功能标签数
	getTabNum: function() {
		return this.tabct.select('li{display!=none}').getCount()-1;
	},
	
	//private 隐藏第一个功能标签
	hideTab: function() {
		this.tabct.select('li{display!=none}:nth(2)').hide();
	},
	
	//private 删除原标签，创建新标签
	showTab: function(id) {
		var me = this;
		var tab = me.getTab(id);
		var text = tab.getAttribute('title');
		
		tab.remove();
		me.activeTab(id, text);
	},
	
	//private 显示隐藏的标签在菜单中
	showTabMenu: function() {
		var me = this;
		var items = [];
		items[0] = {text:'关闭所有', handler:function(){
			var funs = me.funct.items;
			for (var i = funs.length-1; i > 0; i--) {
				//关闭功能页面
				var fun = funs.get(i);
				me.funct.remove(fun, true);
				
				//关闭功能标签
				var tab = me.getTab(fun.id);
				if (tab) tab.remove();
			}
			me.showHome();
		}};
		items[1] = {text:'关闭其他', handler:function(){
			var cur = me.funct.getLayout().activeItem;
		
			var funs = me.funct.items;
			for (var i = funs.length-1; i > 0; i--) {
				var fun = funs.get(i);
				if (fun.id == cur.id) continue;
				//关闭功能页面
				me.funct.remove(fun, true);
				
				//关闭功能标签
				var tab = me.getTab(fun.id);
				if (tab) tab.remove();
			}
		}};
		
		var tabs = me.tabct.select('li{display=none}', true).elements;
		for (var i = 0; i < tabs.length; i++) {
			if (i == 0) {items[2] = '-';}
			//如果标签隐藏了，则添加到菜单中
			var tab = tabs[i];
			var id = tab.getAttribute('itemid');
			var label = tab.getAttribute('title');
			items[i+2] = {text:label, itemId:id, handler:function(b){
				var tid = b.getItemId();
				me.showTab(tid);
			}};
		}
		
		var el = me.tabct.next('span');
		var winmenu = new Ext.menu.Menu({items:items});
        winmenu.showAt([el.getX(), el.getY()+10]);	
	}
});

})();