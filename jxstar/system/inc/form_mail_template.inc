﻿	//修改控件类型
	var findcfg = function(items) {
		for (var i = items.length-1; i >= 0; i--) {
			if (items[i].name == 'mail_template__template_cont') {
				return items[i];
			} else {
				if (items[i].items && items[i].items.length > 0) {
					return findcfg(items[i].items);
				}
			}
		}
		return null;
	};
	var heitem = findcfg(items);
	if (heitem) {
		delete heitem.width;
		heitem.xtype = 'imghtmleditor';
		heitem.anchor = '100%';
		heitem.maxLength = 20000;
	}
	
	config.initpage = function(fn){
		var fe = fn.event;
		
		fe.on('initother', function(fe){
			var field = fe.form.findField('mail_template__template_cont');
			var value = field.getValue();
			value = value.replace(/'/g, '"');//防止数据修改提示
			field.originalValue = value;
		});
	};