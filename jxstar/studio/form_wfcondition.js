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
					{xtype:'textarea', fieldLabel:'判断条件', name:'wf_condition__cond_where', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:72, maxLength:200},
					{xtype:'hidden', fieldLabel:'是否定制类', name:'wf_condition__use_class', defaultval:'0', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'条件ID', name:'wf_condition__condition_id', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'过程ID', name:'wf_condition__process_id', anchor:'62%'},
					{xtype:'hidden', fieldLabel:'流转ID', name:'wf_condition__line_id', anchor:'62%'}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'wf_condition'
	};

	
	
	return new Jxstar.FormNode(config);
}