Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
		var items = [{
		height: '97%',
		width: '97%',
		border: false,
		layout: 'form',
		style: 'padding:10px;',
		items: [{
			anchor:'100%',
			border: false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.99,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'功能名称', name:'fun_base__fun_name', readOnly:true, anchor:'100%', maxLength:100},
					{xtype:'textarea', fieldLabel:'数据权限SQL', name:'sys_user_funx__ext_sql', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:144, maxLength:500},
					{xtype:'hidden', fieldLabel:'功能ID', name:'sys_user_funx__fun_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'用户ID', name:'sys_user_funx__user_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'设置ID', name:'sys_user_funx__user_funx_id', anchor:'100%'}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'sys_user_funx'
	};

	
	
	return new Jxstar.FormNode(config);
}