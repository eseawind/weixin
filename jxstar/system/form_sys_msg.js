Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
		var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		style:'padding:5 10 5 10;',
		items:[{
			anchor:'100%',
			border:false,
			layout:'column',
			border:true,
			xtype:'fieldset',
			title:'消息内容',
			collapsible:false,
			collapsed:false,
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.99,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textarea', fieldLabel:'消息内容', name:'sys_news__news_cont', allowBlank:false, labelStyle:'color:#0000FF;', labelSeparator:'*', width:'100%', height:360, maxLength:4000},
					{xtype:'hidden', fieldLabel:'发布时间', name:'sys_news__edit_date', defaultval:'fun_getToday()', anchor:'48%'},
					{xtype:'hidden', fieldLabel:'发布人', name:'sys_news__edit_user', defaultval:'fun_getUserName()', anchor:'48%'},
					{xtype:'hidden', fieldLabel:'发布人ID', name:'sys_news__edit_userid', defaultval:'fun_getUserId()', anchor:'48%'},
					{xtype:'hidden', fieldLabel:'主键', name:'sys_news__news_id', anchor:'48%'},
					{xtype:'hidden', fieldLabel:'状态', name:'sys_news__state', anchor:'48%'}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'sys_msg'
	};

	config.param.formWidth = '80%';
	config.param.labelWidth = 80;
	config.param.subConfig = { anchor:'80%'};
	JxFormSub.formAddSub(config);

	//修改控件类型	var findcfg = function(items) {		for (var i = items.length-1; i >= 0; i--) {			if (items[i].name == 'sys_news__news_cont') {				return items[i];			} else {				if (items[i].items && items[i].items.length > 0) {					return findcfg(items[i].items);				}			}		}		return null;	};	var heitem = findcfg(items);	if (heitem) {		delete heitem.width;		heitem.xtype = 'imghtmleditor';		heitem.anchor = '100%';		heitem.maxLength = 20000;	}		config.eventcfg = {		saves: function() {			var me = this;			//取消息内容			var html = me.form.get('sys_news__news_cont');			var keyid = me.getPkField().getValue();						//设置请求的参数			var params = 'funid=sys_msg&keyid='+ keyid +'&pagetype=form&eventcode=saves&news_cont='+html;						//保存后刷新记录			var endcall = function(data) {				var record = me.form.myRecord;				me.form.oset('sys_news__state', '1');								record.set('sys_news__state', '1');				record.set('sys_news__news_cont', html);								record.commit();			};			//发送请求			Request.postRequest(params, endcall);		}	};		config.initpage = function(fn){		var fe = fn.event;				fe.on('initother', function(fe){			var field = fe.form.findField('sys_news__news_cont');			var value = field.getValue();			value = value.replace(/'/g, '"');//防止数据修改提示			field.originalValue = value;		});	};
	
	return new Jxstar.FormNode(config);
}