Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var Datanewstype = Jxstar.findComboData('newstype');
	var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		style:'padding:5 10 5 10;',
		items:[{
			border:true,
			xtype:'fieldset',
			title:'公告内容',
			collapsible:false,
			collapsed:false,
			items:[{
			anchor:'100%',
			border:false,
			layout:'column',
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.7013,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'公告标题', name:'sys_news__news_title', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', anchor:'100%', maxLength:100},
					{xtype:'hidden', fieldLabel:'发布人', name:'sys_news__edit_user', defaultval:'fun_getUserName()', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'主键', name:'sys_news__news_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'状态', name:'sys_news__state', anchor:'100%'}
				]
			},{
				border:false,
				columnWidth:0.2888,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'combo', fieldLabel:'信息类型', name:'sys_news__cont_type', defaultval:'1',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Datanewstype
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Datanewstype[0][0]},
					{xtype:'hidden', fieldLabel:'发布时间', name:'sys_news__edit_date', defaultval:'fun_getToday()', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'编号', name:'sys_news__news_code', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'发布人ID', name:'sys_news__edit_userid', defaultval:'fun_getUserId()', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'置顶？', name:'sys_news__is_top', defaultval:'0', anchor:'100%'}
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
					{xtype:'textarea', fieldLabel:'公告内容', name:'sys_news__news_cont', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:312, maxLength:0}
				]
			}
			]
		}]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'sys_news'
	};

	config.param.formWidth = '80%';
	config.param.labelWidth = 80;
	config.param.subConfig = {anchor:'80%'};
	JxFormSub.formAddSub(config);

	//修改控件类型	var findcfg = function(items) {		for (var i = items.length-1; i >= 0; i--) {			if (items[i].name == 'sys_news__news_cont') {				return items[i];			} else {				if (items[i].items && items[i].items.length > 0) {					return findcfg(items[i].items);				}			}		}		return null;	};	var heitem = findcfg(items);	if (heitem) {		delete heitem.width;		heitem.xtype = 'imghtmleditor';		heitem.anchor = '100%';		heitem.maxLength = 20000;	}		config.initpage = function(fn){		var fe = fn.event;				fe.on('initother', function(fe){			var field = fe.form.findField('sys_news__news_cont');			var value = field.getValue();			value = value.replace(/'/g, '"');//防止数据修改提示			field.originalValue = value;		});	};
	
	return new Jxstar.FormNode(config);
}