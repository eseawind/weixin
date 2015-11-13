/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */

/**
 * 处理多语言相关的工具类，系统支持根据当前语言环境调整初始的语言类型。
 * 全局语言对象有：
 * jx -- 自定义描述文字的语言对象
 * jeLang -- 按钮事件文字的语言对象
 * jfLang -- 菜单模块与功能名称的语言对象
 * jdLang -- 功能字段名的语言对象
 * ComboData -- 选项控件描述文字的语言对象
 * 
 * 本系统语言相关的文件有：
 * ext-lang-zh.js, jxstar-lang-zh.js, combo-lang-zh.js,
 * fun-lang-zh.js, event-lang-zh.js, field-lang-zh.js
 * 缺省状态下需要加载的语言文件有前三个文件，后三个采样页面文件中的文字；
 * 替换语言后，要清除原来的语言对象，重新加载所有语言文件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

//字段语言对象初始化
jdLang = {};
JxLang = {};
(function(){
	
	var changIndexLang = function() {
		Ext.fly('label_company').dom.innerHTML = jx.index.company + ' ' + jx.index.right + ' 2010';
		Ext.fly('label_usercode').dom.innerHTML = jx.index.usercode;
		Ext.fly('label_userpass').dom.innerHTML = jx.index.userpass;
		document.title = jx.index.proname + ' V1.0';
	};

Ext.apply(JxLang, {
	//缺省母语类型
	BASE: 'zh',
	
	//当前系统语言类型
	type: 'zh',
	
	/**
	* 在首页顶部显示支持语言类型
	* curLangType -- 当前语言类型
	* supLangType -- 支持的语言类型，格式如：zh=中文;en=English
	*/
	showLang: function(curLangType, supLangType) {
		if (curLangType.length > 0) {
			this.type = curLangType;
		}
		if (supLangType.length == 0) return;
		
		var html = '';
		var types = supLangType.split(';');
		for (var i = 0, n = types.length; i < n; i++) {
			var lang = types[i].split('=');
			
			html += '<a href="#" onclick="JxLang.selectLang(\''+ lang[0] +'\');">'+ lang[1] +'</a>&nbsp;';
		}
		//显示支持的语言类型
		Ext.fly('td_language').insertHtml('beforeEnd', html);
	},

	/**
	* 选择不同的语言类型
	* type -- 选择的语言类型，如：zh, en
	*/
	selectLang: function(type) {
		if (type == this.type) return;
		
		this.type = type;
		//删除原语言对象
		jx = null;
		jeLang = null;
		jfLang = null;
		jdLang = null;
		jdLang = {};
		ComboData = null;
		//IE强制回收内存
		if(Ext.isIE){CollectGarbage();}
		
		//加载ExtJs语言文件
		JxUtil.loadJS('lib/ext/locale/ext-lang-'+ type +'.js');
		//加载自定义语言文件
		JxUtil.loadJS('/public/locale/jxstar-lang-'+ type +'.js');
		//加载功能模块语言文件
		JxUtil.loadJS('/public/locale/fun-lang-'+ type +'.js');
		//加载功能事件语言文件
		JxUtil.loadJS('/public/locale/event-lang-'+ type +'.js');
		//加载选项控件语言文件
		JxUtil.loadJS('/public/locale/combo-lang-'+ type +'.js');
		//字段信息动态加载
		
		//修改登录页面的语言文字
		changIndexLang();
	},
	
	/**
	* 处理按钮文字的多语言，
	* 如果是功能自定义事件，则在功能事件中取值，否则在系统事件中取值
	* nodeId -- 功能ID
	* cfg -- 按钮配置对象
	*/
	eventLang: function(nodeId, cfg) {
		if (this.type == this.BASE) return;
		if (Ext.isEmpty(jeLang)) return;
		
		var ntext, code = cfg.eventCode;
		//先根据功能ID取值
		var lang = jeLang[nodeId];
		//如果是自定义事件，则有值
		if (lang) ntext = lang[code];
		//否则取系统事件中同名事件的值
		if (Ext.isEmpty(ntext)) ntext = (jeLang.sysevent)[code];
		
		//修改按钮的文字
		if (!Ext.isEmpty(ntext)) cfg.text = ntext;
	},
	
	/**
	* 处理菜单模块文字的多语言
	* moduleId -- 模块ID
	* text -- 母语文字
	*/
	moduleText: function(moduleId, text) {
		if (this.type == this.BASE) return text;
		if (Ext.isEmpty(jfLang)) return text;
		
		var ntext = jfLang.module[moduleId];
		return (ntext) ? ntext : text;
	},
	
	/**
	* 处理功能名称的多语言
	* nodeId -- 功能ID
	* text -- 母语文字
	*/
	funText: function(nodeId, text) {
		if (this.type == this.BASE) return text;
		if (Ext.isEmpty(jfLang)) return text;
		
		var ntext = jfLang.fun[nodeId];
		return (ntext) ? ntext : text;
	},
	
	//----------------------------------下面处理字段名的多语言文字-----------------------------------
	//加载字段语言文件，如果存在则不重新加载
	fieldLang: function(nodeId) {
		var lang = jdLang[nodeId];
		if (lang) return lang;
	
		var url = '/public/locale/field/'+ nodeId +'-lang-'+ this.type +'.js';
		JxUtil.loadJS(url);
		return jdLang[nodeId];
	},
	
	//递归处理form页面文件中的字段文字
	formText: function(items, lang) {
		for (var i = 0, n = items.length; i < n; i++) {
			var name = items[i].name,
				label = items[i].fieldLabel;
			
			if (name && label && lang) {
				var ntext = lang[name];
				if (ntext) {
					items[i].fieldLabel = ntext;
				}
			}
			
			var subitems = items[i].items;
			if (subitems && subitems.length > 0) {
				JxLang.formText(subitems, lang);
			}
		}
	},
	
	/**
	* 处理Grid中字段名的多语言，功能字段信息动态加载
	* nodeId -- 功能ID
	* cols -- 表格类定义信息
	*/
	gridField: function(nodeId, cols) {
		if (this.type == this.BASE) return;
		if (cols == null || cols.length == 0) return;
		if (nodeId == null || nodeId.length == 0) return;
		
		var lang = this.fieldLang(nodeId);
		if (lang == null) return;
		
		for (var i = 0, n = cols.length; i < n; i++) {
			if (cols[i].col == null || cols[i].field == null) continue;
			var ntext = lang[cols[i].field.name];
			if (ntext) {
				cols[i].col.header = ntext;
			}
		}
	},
	
	/**
	* 处理Form中字段名的多语言，功能字段信息动态加载
	* nodeId -- 功能ID
	* cols -- 表格类定义信息
	*/
	formField: function(nodeId, items) {
		if (this.type == this.BASE) return;
		if (items == null || items.length == 0) return;
		if (nodeId == null || nodeId.length == 0) return;
		
		var lang = this.fieldLang(nodeId);
		JxLang.formText(items, lang);
	}
});
})();