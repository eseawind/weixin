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
					{xtype:'textfield', fieldLabel:'Grid扩展文件', name:'fun_ext__grid_initpage', anchor:'100%', maxLength:100},
					{xtype:'textfield', fieldLabel:'Form扩展文件', name:'fun_ext__form_initpage', anchor:'100%', maxLength:100},
					{xtype:'hidden', fieldLabel:'功能ID', name:'fun_ext__fun_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'扩展ID', name:'fun_ext__ext_id', anchor:'100%'}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'fun_ext'
	};

	
	
	return new Jxstar.FormNode(config);
}