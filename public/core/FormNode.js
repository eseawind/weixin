/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 表单页面的基类对象。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

Ext.ns('Jxstar');
Jxstar.FormNode = function(config){
	//节点配置信息
	this.config = config;
	//表格定义信息
	this.param = config.param;

	//功能定义ID
	this.nodeId = this.param.funid;
	//功能页面类型
	this.pageType = 'form';

	//功能定义对象
	this.define = Jxstar.findNode(this.nodeId);
	//事件定义对象
	this.event = new Jxstar.FormEvent(this.define);

	//功能页面对象
	this.page = null;
	
	//父功能ID，用于控制子功能的操作权限
	this.parentNodeId = '';

	//是否设计状态 0 运行状态 1 设计状态
	this.state = '0';
	
	//当前功能权限信息，与读取按钮信息同时读出来
	this.right = {edit:'1', print:'1', audit:'1', other:'1'};
	
	//处理字段多语言文字
	if (this.state == '0') {
		JxLang.formField(this.nodeId, this.param.items);
	}
};

Jxstar.FormNode.prototype = {
	/**
	 * 显示功能页面，外部调用主要方法。
	 * pageType -- 页面类型，根据需要在显示时确定页面用途类型
	 * parentNodeId -- 父功能ID
	 **/
	showPage: function(pageType, parentNodeId){
		//如果外部给页面类型，则取外部的值
		if (pageType != null) this.pageType = pageType;
		//设置父功能ID
		if (parentNodeId != null) this.parentNodeId = parentNodeId;
		//创建页面
		if (!this.createPage()) return;
		//扩展自定义事件信息
		this.extEvent();
		//创建工具栏
		this.createTool();
		//扩展页面信息
		this.initPage();

		//返回页面对象
		return this.page;
	},

	/**
	 * 创建功能内容对象，用于扩展。
	 **/
	createPage: function(){
		var self = this, fm = self.param;
		if (fm == null || fm.items == null || fm.items.length == 0) {
			//'创建页面的字段参数为空！'
			JxHint.alert(jx.node.nofields);
			return false;
		}

		//添加工具栏的快捷键
		var tkm = new Ext.ux.ToolbarKeyMap();
		var tcfg = {deferHeight:true, plugins:tkm, items:[{text:' '}]};
		//处理：FF下工具栏高度为27px，IE为29px，通过下面设置后为27px
		if (Ext.isIE) tcfg.style = 'padding:1px;';
		//创建工具栏
		var tbar = new Ext.Toolbar(tcfg);
		//设置form内容区的宽度，缺省宽度800
		//如果items[0]是container类型，在IE中不能自适应宽度
		if (fm.items[0]) {
			var width = fm.formWidth||800;
			if (typeof width == 'string') {
				fm.items[0].anchor = width;
			} else {
				fm.items[0].width = width;
			}
		}
		
		//表单控件的初始属性
		var config = {
			labelAlign: fm.labelAlign || 'right',
			labelWidth: fm.labelWidth || 120,
			border: false,
			autoScroll: true,
			frame: false,
			tbar: tbar,
			items: fm.items
		};
		
		//添加其他扩展属性
		var ocfg = self.param.pageConfig;
		if (!Ext.isEmpty(ocfg)) {
			Ext.apply(config, ocfg);
		}
		
		//构建表单对象
		var form = new Ext.form.FormPanel(config);
		
		//设置form的宽度
		form.on('afterrender', function(page){
			var fw = page.getWidth();
			//有些外部panel的宽度小于800，需要重新设置宽度
			if (fw < 800) {//需要减少20的内部padding宽度
				page.getComponent(0).setWidth(fw-20);
			}
			
			//显示form时，聚焦第一个控件
			JxUtil.focusFirst(page);
		});

		//添加表单控件注销事件
		form.on('beforedestroy', function(fm){
			var my = fm.getForm();
			my.myGrid = null;		delete my.myGrid;
			my.myRecord = null;		delete my.myRecord;
			my.myStore = null;		delete my.myStore;
			my.fkName = null;		delete my.fkName;
			my.fkValue = null;		delete my.fkValue;
			my.srcEvent = null;		delete my.srcEvent;
			
			fm.formNode.destroy();
			fm.formNode = null;		delete fm.formNode;
			fm = null;
			
			return true;
		});
		
		//临时处理办法，将来采用全局对象来管理程序对象
		form.formNode = self;
		//设置事件对象的页面
		self.event.setPage(form);
		//设置页面对象
		self.page = form;

		return true;
	},

	/**
	 * 创建工具栏对象。
	 **/
	createTool: function(){
		var params = 'funid=queryevent&eventcode=query_loadtb&selpfunid='+this.parentNodeId;
		if (this.state == '1') {
			params += '&selfunid=sys_fun_base&selpagetype=desform';
		} else {
			params += '&selfunid='+this.nodeId+'&selpagetype='+this.pageType;
		}

		var self = this;
		var hdCall = function(json) {
			//如果打开功能立即关闭，会存在page为null
			if (self.page == null || json == null) return;
			//取按钮数组
			var items = json.buttons;
			//取权限信息
			var right = json.right;
			if (right) self.right = right;
			
			var ei = self.event;
			var tbar = self.page.getTopToolbar();
			
			//标示按钮段号，如果在不同的段位加分隔栏
			var dnum = 0;
			//保存扩展按钮
			var extItems = [];
			
			//给按钮对象分配事件
			for (var i = 0, n = items.length; i < n; i++){
				//处理按钮多语言文字
				JxLang.eventLang(self.nodeId, items[i]);
				//处理快捷键
				var hk = items[i].accKey;
				if (!Ext.isEmpty(hk)) {
					items[i].text = items[i].text+'('+ hk.toUpperCase() +')';
					items[i].keyBinding = {key:hk, ctrl:true, alt:true};
					//添加提示会造成one_page.jsp中打开功能时出现样式错误
					//items[i].tooltip = {text:'Ctrl+Alt+' + hk.toUpperCase()};
				}
				
				//按钮显示类型[tool|menu]
				var showType = items[i].showType;
				
				if (items[i].method.length > 0) {
					var h = ei[items[i].method];
					if (h == null) continue;
					var a = items[i].args;
					//自定义方法用事件代码作为参数
					if (items[i].method == 'customEvent') {
						a = [items[i].eventCode];
					}
					
					items[i].scope = ei;
					if (a != null && a.length > 0) {
						items[i].handler = h.createDelegate(ei, a);
					} else {
						//执行前判断按钮disable，上面的方法带参数取不到button
						h = h.createInterceptor(function(t){
							return !(t.disabled);
						});
						items[i].handler = h;
					}
				}

				//如果没有定义事件的样式，则取缺省样式
				var hasCss = Ext.util.CSS.getRule('.'+items[i].iconCls);
				if (hasCss == null && showType != 'menu') {
					items[i].iconCls = 'eb_empty';
				}

				//添加分隔栏
				var idx = items[i].eventIndex;
				if (idx == null || idx.length == 0) idx = '0';
				idx = parseInt(parseInt(idx)/100);
				if (idx > dnum) {
					if (i > 0) tbar.add('-');
					dnum = idx;
				}
				
				//如果是显示到菜单，则添加扩展栏中
				if (showType == 'menu') {
					extItems[extItems.length] = items[i];
				} else {
					//添加按钮
					tbar.add(items[i]);	
				}
			}
			//添加扩展工具栏
			var fn = self.config.toolext;
			if (fn && typeof fn == 'function') {
				fn(self, tbar, extItems);
			}
			
			//添加扩展按钮
			if (extItems.length > 0) {
				var extMenu = new Ext.menu.Menu({items: extItems});
				tbar.add({
					text: jx.node.extmenu,//'扩展操作…'
					iconCls: 'eb_menu',
					menu: extMenu
				});
			}

			if (tbar.items != null && tbar.items.getCount() == 1) {
				tbar.hide();
			} else {
				tbar.doLayout();
			}
		};

		Request.dataRequest(params, hdCall);
	},

	/**
	 * 扩展自定义事件到this.event中。
	 **/
	extEvent: function(){
		var scope = this;
		var cfg = this.config.eventcfg;
		if (cfg) {
			Ext.apply(this.event, cfg);
		}
	},
		
	/**
	 * 页面加载完后执行的方法，参数有表格对象与功能定义对象。
	 **/
	initPage: function(){
		var self = this;
		
		//给所有字段添加change事件，处理字段修改标记。
		self.page.getForm().fieldItems().each(function(f){
			var name = f.name;
			if (name != null && name.length > 0) {
				f.on('change', JxUtil.changeValue);
				//添加CTRL+F1事件查看字段帮助说明
				f.on('specialkey', JxUtil.specialKey);
			}
		});
		
		//加载子表
		JxFormSub.formShowSub(self);
		
		//自定义扩展
		var fn = self.config.initpage;
		if (typeof fn == 'function') {
			fn(self);
		}
	},

	/**
	 * 设置设计状态 0 运行状态 1 设计状态。
	 **/
	setState: function(state) {
		this.state = state;
	},
	
	/**
	 * 销毁form页面对象
	 **/
	destroy: function() {
		this.config = null;				delete this.config;
		this.param = null;				delete this.param;
		this.nodeId = null;				delete this.nodeId;
		this.pageType = null;			delete this.pageType;
		this.id = null;					delete this.id;
		this.define = null;				delete this.define;
		this.event.myDestroy();
		this.event = null;				delete this.event;
		this.page = null;				delete this.page;
		this.parentNodeId = null;		delete this.parentNodeId;
		this.state = null;				delete this.state;
		this.right = null;				delete this.right;
	}
};
