	config.initpage = function(formNode){
		var event = formNode.event;
		
		event.on('beforesave', function(event) {
			var form = event.form;
			var assign_rule = form.get('wf_nodeattr__assign_rule');
			if (assign_rule == 'class') {
				var className = form.get('wf_nodeattr__custom_class');
				if (className.length == 0) {
					JxHint.alert('如果任务分配规则是自定义类，则自定义类名必须填写！');
					form.findField('wf_nodeattr__custom_class').focus();
					return false;
				}
			}
			
			var limit_value = form.get('wf_nodeattr__limit_value');
			if (limit_value != '00:00' && limit_value.length > 0) {
				var hhmi = /^([0-9]+):([0-9]|[0-5][0-9])$/;
		        if (hhmi.test(limit_value) == false) {
		        	JxHint.alert('任务时限格式不正确，格式为hh:mi，hh为任意数字，mi为小于59的数字！');
					form.findField('wf_nodeattr__limit_value').focus();
					return false;
		        }
			}
			
			return true;
		});
	};