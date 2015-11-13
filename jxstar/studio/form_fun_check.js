Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var Datap_settype = Jxstar.findComboData('p_settype');
	var Dataregstatus = Jxstar.findComboData('regstatus');
	var Datap_checktype = Jxstar.findComboData('p_checktype');
	var Datacondtype = Jxstar.findComboData('condtype');
	var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		style:'padding:5 10 5 10;',
		items:[{
			border:true,
			xtype:'fieldset',
			title:'基本信息',
			collapsible:false,
			collapsed:false,
			items:[{
			anchor:'100%',
			border:false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'numberfield', decimalPrecision:0, fieldLabel:'序号', name:'fun_check__check_no', defaultval:'1', anchor:'57%', maxLength:12},
					{xtype:'textfield', fieldLabel:'检查项描述', name:'fun_check__check_name', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:50},
					{xtype:'combo', fieldLabel:'设置类型', name:'fun_check__set_type', defaultval:'1',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Datap_settype
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Datap_settype[0][0]},
					{xtype:'hidden', fieldLabel:'检查扩展Fn', name:'fun_check__check_ext', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'检查项ID', name:'fun_check__check_id', anchor:'100%'}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'combo', fieldLabel:'状态', name:'fun_check__status', defaultval:'0',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Dataregstatus
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Dataregstatus[0][0]},
					{xtype:'combo', fieldLabel:'检查项类型', name:'fun_check__check_type', defaultval:'1',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Datap_checktype
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Datap_checktype[0][0]},
					{xtype:'textfield', fieldLabel:'功能标识', name:'fun_check__fun_id', readOnly:true, anchor:'100%', maxLength:25},
					{xtype:'hidden', fieldLabel:'事件代号', name:'fun_check__event_code', defaultval:'audit', anchor:'100%'}
				]
			}
			]
		},{
			anchor:'100%',
			border:false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.99,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textarea', fieldLabel:'检查失败信息', name:'fun_check__faild_desc', width:'100%', height:48, maxLength:100}
				]
			}
			]
		}]
		},{
			anchor:'100%',
			border:false,
			layout:'column',
			border:true,
			xtype:'fieldset',
			title:'类设置',
			collapsible:false,
			collapsed:false,
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'检查类名', name:'fun_check__class_name', anchor:'100%', maxLength:200},
					{xtype:'textfield', fieldLabel:'类方法名', name:'fun_check__method_name', anchor:'100%', maxLength:50}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'emptybox'},
					{xtype:'checkbox', fieldLabel:'传入请求对象', name:'fun_check__use_request', defaultval:'0', disabled:false, anchor:'48%'}
				]
			}
			]
		},{
			anchor:'100%',
			border:false,
			layout:'column',
			border:true,
			xtype:'fieldset',
			title:'SQL设置',
			collapsible:false,
			collapsed:false,
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.99,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textarea', fieldLabel:'来源值SQL或常量', name:'fun_check__src_sql', width:'100%', height:48, maxLength:500},
					{xtype:'combo', fieldLabel:'比较方法', name:'fun_check__comp_type', defaultval:'>',
						anchor:'49%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Datacondtype
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Datacondtype[0][0]},
					{xtype:'textarea', fieldLabel:'目标值SQL或常量', name:'fun_check__dest_sql', width:'100%', height:48, maxLength:500}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'fun_check'
	};

	
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
	
	return new Jxstar.FormNode(config);
}