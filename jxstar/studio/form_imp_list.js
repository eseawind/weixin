Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var imptpltypeData = Jxstar.findComboData('imptpltype');
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
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'trigger', fieldLabel:'功能标识', name:'imp_list__fun_id',
						anchor:'100%', triggerClass:'x-form-search-trigger',
						maxLength:25, allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', editable:false,
						onTriggerClick: function() {
							var selcfg = {pageType:'combogrid', nodeId:'sel_fun', layoutPage:'/public/layout/layout_tree.js', sourceField:'fun_base.fun_id;fun_name', targetField:'imp_list.fun_id;fun_name', whereSql:"", whereValue:'', whereType:'', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'1',fieldName:'imp_list.fun_id'};
							JxSelect.createSelectWin(selcfg, this, 'node_imp_list_form');
						}},
					{xtype:'textfield', fieldLabel:'模板文件', name:'imp_list__tpl_file', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:200},
					{xtype:'numberfield', allowDecimals:false, fieldLabel:'序号', name:'imp_list__imp_index', anchor:'100%', maxLength:12},
					{xtype:'hidden', fieldLabel:'定义ID', name:'imp_list__imp_id', anchor:'100%'}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'功能名称', name:'imp_list__fun_name', readOnly:true, anchor:'100%', maxLength:50},
					{xtype:'combo', fieldLabel:'模板类型', name:'imp_list__tpl_type', defaultval:'xls',
						anchor:'100%', editable:false, allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*',
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: imptpltypeData
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: imptpltypeData[0][0]}
				]
			}
			]
		},{
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
					{xtype:'textarea', fieldLabel:'新增SQL', name:'imp_list__insert_sql', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:96, maxLength:2000}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'imp_list'
	};

	
	
	return new Jxstar.FormNode(config);
}