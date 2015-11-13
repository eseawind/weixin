	config.initpage = function(formNode){
		var event = formNode.event;
		var form = formNode.page.getForm();
		
		var setfield = function(form, d){
			form.findField('fun_check__class_name').setReadOnly(!d);
			form.findField('fun_check__method_name').setReadOnly(!d);
			form.findField('fun_check__src_sql').setReadOnly(d);
			form.findField('fun_check__comp_type').setReadOnly(d);
			form.findField('fun_check__dest_sql').setReadOnly(d);
			formNode.page.doLayout();
		};
		
		//如果设置类型为类，则SQL设置字段不能编辑，否则类设置字段不能编辑
		var settype = form.findField('fun_check__set_type');
		settype.on('change', function(field){
			var d = (settype.getValue() == '1');
			setfield(form, d);
		});
		
		//设置字段可编辑状态
		event.initOther = function() {
			var form = formNode.page.getForm();
			var settype = form.findField('fun_check__set_type');
			var d = (settype.getValue() == '1');
			setfield(form, d);
		};
		
		//检查必须设置类或SQL
		event.on('beforesave', function(event) {
			var form = event.form;
			var settype = form.get('fun_check__set_type');
			if (settype == '1') {
				if (form.get('fun_check__class_name').length == 0 || 
					form.get('fun_check__method_name').length == 0) {
					JxHint.alert('该检查项必须设置类名与方法名！');
					return false;
				}
			} else {
				if (form.get('fun_check__src_sql').length == 0) {
					JxHint.alert('该检查项必须设置来源值或常量！');
					return false;
				}
			}
			return true;
		});
	};