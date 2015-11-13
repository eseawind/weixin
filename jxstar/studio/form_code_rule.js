Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
		var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		xtype:'container',
		style:'padding:5 10 5 10;',
		items:[{
			anchor:'100%',
			border:false,
			xtype:'container',
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				xtype:'container',
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'trigger', fieldLabel:'编码扩展', name:'sys_coderule__code_ext', defaultval:':yyyyMM',
						anchor:'100%', triggerClass:'x-form-search-trigger',
						maxLength:50, editable:true,
						onTriggerClick: function() {
							if (this.menu == null) {
								var selcfg = {pageType:'combogrid', nodeId:'sys_default', layoutPage:'', sourceField:'funall_default.func_name', targetField:'sys_coderule.code_ext', whereSql:"func_name like ':%'", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'0',queryField:'',likeType:'',fieldName:'sys_coderule.code_ext'};
								this.menu = Jxstar.createComboMenu(this);
								JxSelect.createComboGrid(selcfg, this.menu, 'node_sys_coderule_form');
							}
							this.menu.show(this.el);
						}},
					{xtype:'numberfield', allowDecimals:false, fieldLabel:'编码长度,不含前缀', name:'sys_coderule__code_length', defaultval:'12', anchor:'100%', maxLength:12},
					{xtype:'hidden', fieldLabel:'功能ID', name:'sys_coderule__fun_id', anchor:'100%'}
				]
			},{
				border:false,
				xtype:'container',
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'编码流水号', name:'sys_coderule__code_no', defaultval:'000000', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:10},
					{xtype:'hidden', fieldLabel:'编码规则ID', name:'sys_coderule__rule_id', anchor:'100%'}
				]
			}
			]
		},{
			anchor:'100%',
			border:false,
			xtype:'container',
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				xtype:'container',
				columnWidth:0.99,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textarea', fieldLabel:'编码规则说明', name:'sys_coderule__code_memo', width:'100%', height:48, maxLength:200}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'sys_coderule'
	};

	
	
	
	return new Jxstar.FormNode(config);
}