/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */

JxLabelDes = {
	//当前方案id
	caseId: '',
	//档案设计器面板
	designCt: null,
	//画布容器
	canvaCt: null,
	//属性面板
	formAttr: null,
	//标记当前选择的控件
	currCtl: null,
	//当前模板id
	currModelId: '',
	//约定1mm = 4px，因为标尺背景图片是10mm = 40px
	PIXN: 4,

	/**
	* 创建页面对象，布局：标签模板列表 + 设计器 + 字段列表 + 属性列表
	* 
	* caseId：方案ID
	* target：功能对象显示的布局
	*/
	showDesign: function(caseId, target) {
		this.caseId = caseId;
		var me = this;
		var attr = me.createAttr();
		var tbar = me.createTool();
		var bbar = me.createSizeTool();
		
		var designCt = new Ext.Panel({
			border:false,
			layout:'border',
			tbar:tbar,
			items:[{
				width:155,
				border:false,
				region:'west',
				layout:'border',
				items:[{//显示标签字段
					region:'center',
					layout:'fit',
					border:false
				},{//显示打印模板列表
					region:'south',
					height:250,
					layout:'fit',
					border:false
				}]
			},{//显示标签设计器
				region:'center',
				layout:'border',
				border:true,
				bbar:bbar,
				items:[{//顶部标尺
					region:'north',
					height:24,
					xtype:'container',
					style:'margin-left:24px; background:#ffffff url(./resources/images/design/top_flag.png) repeat-x;font-size:12px;'
				},{//底部标尺
					width:24,
					region:'west',
					xtype:'container',
					style:'margin-top:-1px; background:#ffffff url(./resources/images/design/left_flag.png) repeat-y;font-size:12px;'
				},{//设计区域
					region:'center',
					bodyStyle:'background-color:#a7a7a7;',
					border:false
				}]
			},{//显示属性面板
				width:202,
				region:'east',
				autoScroll:true,
				border:false,
				items:[attr]
			}]
		});
		
		var desgrid = designCt.getComponent(0);
		Jxstar.createPage('lab_field1', 'gridpage', desgrid.getComponent(0), {pageType:'notool'});
		Jxstar.createPage('lab_model1', 'gridpage', desgrid.getComponent(1), {pageType:'notool'});
				
		var tabid = 'jxstar_label_design';
		var tab = target.getComponent(tabid);
		if (tab) target.remove(tab, true);
			
		var cfg = {
			id:tabid,
			title:'标签设计器',
			layout:'fit',
			border:false,
			closable:true,
			autoScroll:true,
			iconCls:'tab_des',
			items:[designCt]
		};
		tab = target.add(cfg);
		target.activate(tab);
		
		//模板、字段加载数据
		var hd = function() {
			var gridm = desgrid.getComponent(1).getComponent(0);
			var gridf = desgrid.getComponent(0).getComponent(0);
			
			Jxstar.loadSubData(gridm, caseId);
			Jxstar.loadSubData(gridf, caseId);
					
			//点击模板记录，加载最新的设计文件
			gridm.on('rowclick', function(g, n, e){
				var rec = g.getStore().getAt(n);
				var modelId = rec.get('lab_model__model_id');
				me.currModelId = modelId;
				me.readXML(modelId);
			});
			
			//双击字段，添加字段标签到设计器中
			gridf.on('rowdblclick', function(g, n, e){
				var rec = g.getStore().getAt(n);
				me.addFieldLabel(me.canvaCt, rec);
				me.addFieldLabel(me.canvaCt, rec, '1');
			});
			
			gridm.getStore().on('load', function(){
				gridm.getSelectionModel().selectFirstRow();
				gridm.fireEvent('rowclick', gridm, 0);
			});
		};
		//保证附加事件成功
		var callhd = function() {
			var gm = desgrid.getComponent(0).getComponent(0);
			if (gm) {
				hd();
			} else {
				JxUtil.delay(200, callhd);
			}
		};
		callhd();
		
		me.designCt = designCt;
		me.formAttr = attr.getForm();
		
		//添加标尺数字
		JxUtil.delay(200, function(){
			var ct = designCt.getComponent(1);
			me.createFlagNum(ct);
		});
	},
	
	//创建属性面板对象
	createAttr: function() {
		var me = this;
		//字体设置
		var data_ztsz = [['黑体','黑体'],['文鼎CS中黑','文鼎CS中黑'],['宋体','宋体'],['楷体','楷体'],['微软雅黑','微软雅黑'],
						 ['隶书','隶书'],['Arial','Arial'],['Tahoma','Tahoma'],['Roman','Roman']];
		//字体大小
		var data_ztdx = [];	for (var i = 1; i < 40; i++) {data_ztdx[i-1] = [i, i]}
		//水平对齐
		var data_spdq = [['center','居中'],['left','居左'],['right','居右']];
		//垂直对齐
		var data_czdq = [['middle','居中'],['top','靠上'],['bottom','靠下']];
		//条形码类型
		var data_tmlx = [['CODE128A','CODE128A'],['CODE128C','CODE128C'],['INTERLEAVED20F5','INTERLEAVED20F5'],['QRCode','QRCode']];
		//条码方向
		var data_tmfx = [['正常','正常'],['上','上'],['左','左'],['右','右']];
		
		//修改位置属性
		var posicfg = {change:function(f){
						me.setPosiProp.createDelegate(me, [f])();
					  }};
		//修改字体属性
		var fontcfg = {change:function(f){
						me.setFontProp.createDelegate(me, [f])();
					  }};
		//修改条码属性
		var codecfg = {change:function(f){
						me.setCodeProp.createDelegate(me, [f])();
					  }};
		
		
		var form1 = new Ext.form.FormPanel({
			border:false,
			labelAlign: 'right',
			labelWidth: 60,
			items: [{
				title: "标签位置",
				style:'margin:5 5 0 5px;padding:0;',
				xtype: "fieldset",
				items: [{
					name: "display",
					fieldLabel: "显示文字",
					width:100,
					xtype: "textfield",
					listeners:posicfg
				},{
					name: "lbltop",
					fieldLabel: "垂直位置",
					width:100,
					xtype: "numberfield",
					listeners:posicfg
				},{
					name: "lblleft",
					fieldLabel: "水平位置",
					width:100,
					xtype: "numberfield",
					listeners:posicfg
				},{
					name: "lblheight",
					fieldLabel: "高度",
					width:100,
					xtype: "numberfield",
					listeners:posicfg
				},{
					name: "lblwidth",
					fieldLabel: "宽度",
					width:100,
					xtype: "numberfield",
					listeners:posicfg
				}]
			},{
				title: "字体设置",
				style:'margin:5 5 0 5px;padding:0;',
				xtype: "fieldset",
				items: [{
					name: "lblfont",
					fieldLabel: "字体",
					width:100,
					xtype: "combo", editable:false, 
					store: new Ext.data.SimpleStore({fields:['value','text'], data: data_ztsz}),
					mode: 'local', triggerAction: 'all', valueField: 'value', displayField: 'text',
					listeners:fontcfg
				},
				{
					name: "lblfontsize",
					fieldLabel: "字体大小",
					width:100,
					xtype: "combo", editable:false, 
					store: new Ext.data.SimpleStore({fields:['value','text'], data: data_ztdx}),
					mode: 'local', triggerAction: 'all', valueField: 'value', displayField: 'text',
					listeners:fontcfg
				},
				{
					name: "lblalign",
					fieldLabel: "水平对齐",
					width:100,
					xtype: "combo", editable:false, 
					store: new Ext.data.SimpleStore({fields:['value','text'], data: data_spdq}),
					mode: 'local', triggerAction: 'all', valueField: 'value', displayField: 'text',
					listeners:fontcfg
				},
				{
					name: "lblvalign",
					fieldLabel: "垂直对齐",
					width:100,
					xtype: "combo", editable:false, 
					store: new Ext.data.SimpleStore({fields:['value','text'], data: data_czdq}),
					mode: 'local', triggerAction: 'all', valueField: 'value', displayField: 'text',
					listeners:fontcfg
				},
				{	
					style:'margin:-8 0 2 12px;font-size:13px;',
					xtype:'container',
					layout:'absolute',
					width:170,
					height:48,
					items: [
						{name: "lblfontbold", boxLabel: "粗体", width:80, x:5, y:5, xtype: "checkbox", listeners:fontcfg},
						{name: "lblfontitalic", boxLabel: "斜体", width:80, x:90, y:5, xtype: "checkbox", listeners:fontcfg},
						{name: "lblfontdelline", boxLabel: "删除线", width:80, x:5, y:30, xtype: "checkbox", listeners:fontcfg},
						{name: "lblfontunderline", boxLabel: "下划线", width:80, x:90, y:30, xtype: "checkbox", listeners:fontcfg}
					]
				}]
			},
			{
				title: "条码设置",
				style:'margin:5 5 5 5px;padding:0;',
				xtype: "fieldset",
				items: [
				{	
					style:'margin:-8 0 0 12px;font-size:13px;',
					xtype:'container',
					layout:'absolute',
					width:170,
					height:26,
					items: [
						{name: "isbarcode", boxLabel: "条形码", width:80, x:5, y:5, xtype: "checkbox", listeners:codecfg},
						{name: "bardisplayval", boxLabel: "显示文字", width:80, x:90, y:5, xtype: "checkbox", listeners:codecfg}
					]
				},
				{
					name: "bartype",
					fieldLabel: "条码类型",
					width:100,
					xtype: "combo", editable:false, 
					store: new Ext.data.SimpleStore({fields:['value','text'], data: data_tmlx}),
					mode: 'local', triggerAction: 'all', valueField: 'value', displayField: 'text', 
					listeners:codecfg
				},
				{
					name: "orientation",
					fieldLabel: "条码方向",
					width:100,
					xtype: "combo", editable:false, 
					store: new Ext.data.SimpleStore({fields:['value','text'], data: data_tmfx}),
					mode: 'local', triggerAction: 'all', valueField: 'value', displayField: 'text', 
					listeners:codecfg
				},
				{
					name: "barwidth",
					fieldLabel: "条码密度",
					width:100,
					xtype: "numberfield", 
					listeners:codecfg
				},
				{
					name: "testval",
					width: 100,
					fieldLabel: "测试值",
					xtype: "textfield", 
					listeners:codecfg
				}]
			},
			{
				title: "其他设置",
				style:'margin:5 5 0 5px;padding:0;',
				xtype: "fieldset",
				items: [{
					name: "picpath",
					width: 100,
					fieldLabel: "图片路径",
					xtype: "textfield"
				}]
			}]
		});
		
		return form1;
	}, 
	
	//创建工具栏
	createTool: function() {
		var me = this;
		var tbar = new Ext.Toolbar({
			items:[
				{iconCls:'eb_add', text:'添加文字', handler:function(){
					var width = 25*me.PIXN, height = 5*me.PIXN;
					me.addBaseLabel(me.canvaCt, 'label', '新文字', '', 0, 0, width, height);
				}},
				{iconCls:'eb_add', text:'添加线条', handler:function(){
					var width = 25*me.PIXN, height = 0.5*me.PIXN;
					me.addBaseLabel(me.canvaCt, 'line', '', '', me.PIXN, me.PIXN, width, height);
				}},
				/*{iconCls:'eb_add', text:'添加图片', handler:function(){
					alert('暂不实现，因为插件打印本地图片没实现！');
				}},*/
				'-',
				{iconCls:'eb_cancel', text:'删除控件', handler:function(){
					me.canvaCt.remove(me.currCtl, true);
					me.currCtl = null;
					me.clearAttr();
				}},
				{iconCls:'eb_save', text:'保存设计', handler:function(){
					if (Ext.isEmpty(me.currModelId)) {
						JxHint.alert('请先创建或选择标签打印模板！');
						return;
					}
					me.saveXML(me.currModelId);
				}},
				'-',
				{iconCls:'eb_reply', text:'预览', handler:function(){
					if (Ext.isEmpty(me.currModelId)) {
						JxHint.alert('请先创建或选择标签打印模板！');
						return;
					}
					
					var dataXML = me.getSetXML();
					var headXML = me.getPageXML();
					var printValue = me.getPreviewData();//构建预览用的数据
					
					JxLabelPrint.printCtl().printviewByXml(headXML, dataXML, printValue);
				}},
				{iconCls:'eb_refresh', text:'刷新', handler:function(){
					var desgrid = me.designCt.getComponent(0);
					var gridm = desgrid.getComponent(1).getComponent(0);
					var gridf = desgrid.getComponent(0).getComponent(0);
					
					Jxstar.loadSubData(gridm, me.caseId);
					Jxstar.loadSubData(gridf, me.caseId);
				}},
				{iconCls:'eb_menu', text:'导出设计', menu:{items:[
					{text:'导出col', handler:function(){
						var fn = me.getModelName()+'.xml';
						Request.exportString(fn, me.getColXML());
					}},
					{text:'导出head', handler:function(){
						var fn = me.getModelName()+'set_head.xml';
						Request.exportString(fn, me.getPageXML());
					}},
					{text:'导出set', handler:function(){
						//要转换为 UTF-8 无编码格式，插件才可以读取
						var fn = me.getModelName()+'set.xml';
						Request.exportString(fn, me.getSetXML(), 'UTF-8');
					}}
				]}}
			]
		});
		return tbar;
	},
	
	//添加标签
	createPage: function(ct, w, h) {
		if (ct.getComponent(0)) {
			ct.remove(ct.getComponent(0), true);
		}
	
		var me = this;
		var page = new Ext.Container({
			x:0, y:0, width:w, height:h, 
			layout:'absolute',
			style:'background-color:#ffffff;'
		});
		me.setSizeValue('width', w/me.PIXN);
		me.setSizeValue('height', h/me.PIXN);
		
		ct.add(page);
		ct.doLayout();
		
		//添加点击事件
		me.clickEvent(page);
			
		var re = new Ext.Resizable(page.el, {
			minWidth:me.PIXN*10,
			minHeight:me.PIXN*5,
			dynamic:true,
			transparent:true,
			widthIncrement:me.PIXN,
			heightIncrement:me.PIXN
		});
		
		re.on('resize', function(re, w, h, e){
			me.setSizeValue('width', w/me.PIXN);
			me.setSizeValue('height', h/me.PIXN);
		});
		
		return page;
	},
	
	//页面尺寸设置
	createSizeTool: function() {
		var me = this;
		var ecfg = {change:function(f){me.setPageSize.createDelegate(me, [f])();}};
		var tbar = new Ext.Toolbar({
			items:[
				{xtype:'tbtext', text:'标签尺寸(mm):'},
				{xtype:'tbtext', text:'宽'},
				{xtype:'numberfield', width:40, name:'width', value:0, listeners:ecfg},
				{xtype:'tbtext', text:'高'},
				{xtype:'numberfield', width:40, name:'height', value:0, listeners:ecfg},
				{xtype:'tbtext', text:'左边距'},
				{xtype:'numberfield', width:40, name:'margin-left', value:0},
				{xtype:'tbtext', text:'右边距'},
				{xtype:'numberfield', width:40, name:'margin-right', value:0},
				{xtype:'tbtext', text:'上边距'},
				{xtype:'numberfield', width:40, name:'margin-top', value:0},
				{xtype:'tbtext', text:'下边距'},
				{xtype:'numberfield', width:40, name:'margin-bottom', value:0}
			]
		});
		return tbar;
	},
	
	//设置页面尺寸
	setSizeValue: function(name, value) {
		var me = this;
		var bbar = me.designCt.getComponent(1).getBottomToolbar();
		bbar.find('name', name)[0].setValue(value);
	},
	setPageSize: function(field) {
		var me = this;
		if (field.name == 'width') {
			me.canvaCt.setWidth(field.getValue()*me.PIXN);
		}
		if (field.name == 'height') {
			me.canvaCt.setHeight(field.getValue()*me.PIXN);
		}
	},
	
	//添加标尺
	createFlagNum: function(ct) {
		var width = ct.getWidth() - 24;
		var height = ct.getHeight() - 24;
		var tophtml = '', lefthtml = '';
		var CMPX = this.PIXN * 10;
		//添加顶部标尺
		var wn = width / CMPX;
		for (var i = 0; i < wn; i++) {
			tophtml += "<span style='left:"+ (3 + i*CMPX) +"px; top:1px;position:absolute;'>"+ i +"</span>";
		}
		//添加左边标尺
		var hn = height / CMPX;
		for (var i = 0; i < hn; i++) {
			lefthtml += "<span style='top:"+ (1 + i*CMPX) +"px; left:2px;position:absolute;'>"+ i +"</span>";
		}
		
		ct.getComponent(0).update(tophtml);
		ct.getComponent(1).update(lefthtml);
	},
	
	//添加一个字段标签
	addFieldLabel: function(ct, rec, isdata) {
		var me = this;
		var field_code = rec.get('lab_field__field_code');
		var field_title = rec.get('lab_field__field_title');
		var type = (isdata == '1') ? 'data' : 'label';
		
		var x = 0, y = 0;
		if (type == 'data') {//数值标签显示位置靠后
			x = 26*me.PIXN;
			field_title = field_title + '(值)';
		}
		
		var width = 25*me.PIXN, height = 5*me.PIXN;
		
		me.addBaseLabel(ct, type, field_title, field_code, x, y, width, height);
	},
	
	//添加一个标签：
	//type有: data -- 数据、pic -- 图片、label -- 文字标签、line -- 线条
	addBaseLabel: function(ct, type, text, fieldcode, x, y, width, height) {
		var me = this;
		var bgcolor = (type == 'line') ? '#000000' : '#F0F0F0';
		var ctl = new Ext.Container({
			x:x, y:y, width:width, height:height,
			html:'<span>'+text+'</span>', 
			style:'cursor:pointer;font-family:黑体; text-align:left; vertical-align:middle; font-size:10pt; background-color:'+ bgcolor +';'
		});
		
		ct.add(ctl);
		ct.doLayout();
		
		//添加属性
		ctl.el.dom.field_title = text;
		ctl.el.dom.field_code = fieldcode;
		ctl.el.dom.data_type = type;
		
		//添加点击事件
		me.clickEvent(ctl);
		
		//添加删除快捷键，无效，没有找到原因
		/*ctl.el.on('keypress', function(e, t){
			if (e.getKey() == 46) {
				t = me.getCtl(t);
				me.canvaCt.remove(t, true);
			}
		});*/
		
		//设置控件可以调整大小
		var re = new Ext.Resizable(ctl.el, {
			minWidth:me.PIXN*1,
			minHeight:me.PIXN*0.5,
			dynamic:true,
			draggable:true,
			transparent:true,
			widthIncrement:me.PIXN,
			heightIncrement:me.PIXN
		});
		re.on('resize', function(re, w, h, e){
			var t = me.getCtl(re.getEl().dom);
			me.flagControl(t);
		});
		
		//设置可以拖动区域与步长
		var dd = re.dd;
		dd.setXConstraint(1000, 1000, me.PIXN);
        dd.setYConstraint(1000, 1000, me.PIXN);
		
		//拖动控件时显示当前坐标
		dd.tip = new Ext.ToolTip({
			target: ctl.el,
			html: '',
			listeners: {
				show: function(tip){
					var tag = tip.initialConfig.target;
					var xy = Ext.getCmp(tag.id).getPosition(true);
					tip.update('x:' + xy[0]/me.PIXN + ',y:' + xy[1]/me.PIXN);
				}
			} 
		});
		dd.onDrag = function(e) {
			this.tip.show();
		};
		dd.endDrag = function(e) {
			this.tip.hide();
		};
		
		return ctl;
	},
	
	//取标签控件
	getCtl: function(t) {
		var tag = t.tagName.toLowerCase();
		if (tag != 'div') {
			t = t.parentNode;
		}
		return Ext.getCmp(t.id);
	},
	
	//控件点击事件
	clickEvent: function(ctl) {
		var me = this;
		ctl.el.on('click', function(e, t){
			e.stopEvent();
			t = me.getCtl(t);
			me.flagControl(t);
		});
	},
	
	//标记当前控件
	flagControl: function(ctl) {
		var me = this;
		if (me.currCtl) {
			me.currCtl.removeClass('fdes-selectcomp');
			me.currCtl = null;
		}
		
		if (ctl != me.canvaCt) {
			//显示当前选择控件的属性
			me.showProp(ctl);
		
			me.currCtl = ctl;
			me.currCtl.addClass('fdes-selectcomp');
		} else {
			me.clearAttr();
		}
	},
	
	//显示控件属性
	showProp: function(ctl) {
		var me = this;
		//显示标签位置属性
		var xy = ctl.getPosition(true);
		var width = ctl.getWidth();
		var height = ctl.getHeight();
		var label = ctl.el.getAttribute('field_title');
		
		me.formAttr.set('display', label);
		me.formAttr.set('lbltop', xy[1]/me.PIXN);
		me.formAttr.set('lblleft', xy[0]/me.PIXN);
		me.formAttr.set('lblwidth', width/me.PIXN);
		me.formAttr.set('lblheight', height/me.PIXN);
		
		//显示字体属性
		var el = ctl.el;
		me.formAttr.set('lblfont', el.getStyle('font-family'));
		me.formAttr.set('lblfontsize', parseInt(el.getStyle('font-size')));
		me.formAttr.set('lblalign', el.getStyle('text-align'));
		me.formAttr.set('lblvalign', el.getStyle('vertical-align'));
		me.formAttr.set('lblfontbold', (el.getStyle('font-weight') == 'bold'));
		me.formAttr.set('lblfontitalic', (el.getStyle('font-style') == 'italic'));
		me.formAttr.set('lblfontunderline', (el.getStyle('text-decoration') == 'underline'));
		me.formAttr.set('lblfontdelline', (el.getStyle('text-decoration') == 'line-through')); 
		
		//显示条码属性
		me.formAttr.set('bartype', me.getAttr(el, 'bartype'));
		me.formAttr.set('barwidth', me.getAttr(el, 'barwidth'));
		me.formAttr.set('testval', me.getAttr(el, 'testval'));
		me.formAttr.set('orientation', me.getAttr(el, 'orientation'));
		me.formAttr.set('isbarcode', (me.getAttr(el, 'isbarcode') == '1'));
		me.formAttr.set('bardisplayval', (me.getAttr(el, 'bardisplayval') == '1'));
		
		//显示其他属性
		me.formAttr.set('picpath', me.getAttr(el, 'picpath'));
	},
	
	//设置位置属性
	setPosiProp: function(field) {
		var me = this;
		var ctl = me.currCtl;
		if (!ctl) return;
		
		var xy = ctl.getPosition(true);
		
		if (field.name == 'display') {
			ctl.el.first().dom.innerHTML = field.getValue();
			ctl.el.dom.field_title = field.getValue();
		}
		if (field.name == 'lbltop') {
			ctl.setPosition([xy[0], field.getValue()*me.PIXN]);
		}
		if (field.name == 'lblleft') {
			ctl.setPosition([field.getValue()*me.PIXN, xy[1]]);
		}
		if (field.name == 'lblwidth') {
			ctl.setWidth(field.getValue()*me.PIXN);
		}
		if (field.name == 'lblheight') {
			ctl.setHeight(field.getValue()*me.PIXN);
		}
	},
	
	//设置字体属性
	setFontProp: function(field) {
		var me = this;
		var ctl = me.currCtl;
		if (!ctl) return;
		
		var el = ctl.el;
		var v = field.getValue();
		
		if (field.name == 'lblfont') {
			el.setStyle('font-family', v);
		}
		if (field.name == 'lblfontsize') {
			el.setStyle('font-size', v+'pt');
		}
		if (field.name == 'lblalign') {
			el.setStyle('text-align', v);
		}
		if (field.name == 'lblvalign') {
			el.setStyle('vertical-align', v);
		}
		if (field.name == 'lblfontbold') {
			el.setStyle('font-weight', (v == '1') ? 'bold' : '');
		}
		if (field.name == 'lblfontitalic') {
			el.setStyle('font-style', (v == '1') ? 'italic' : '');
		}
		if (field.name == 'lblfontunderline') {
			el.setStyle('text-decoration', (v == '1') ? 'underline' : '');
		}
		if (field.name == 'lblfontdelline') {
			el.setStyle('text-decoration', (v == '1') ? 'line-through' : '');
		}
	},
	
	//设置条码属性
	setCodeProp: function(field) {
		var me = this;
		var ctl = me.currCtl;
		if (!ctl) return;
		
		var el = ctl.el;
		var val = field.getValue();
		var isbar = me.formAttr.get('isbarcode');
		var url = './fileAction.do?funid=sys_attach&pagetype=editgrid&eventcode=barcode&dataType=byte&user_id='+ Jxstar.session['user_id'];
		
		//是条码，则需要显示条码图片
		if (field.name == 'isbarcode') {
			el.first().remove();
			el.dom.isbarcode = isbar;
			
			if (isbar == '1') {
				url += '&codevalue=12345678';
				el.insertHtml('afterBegin', "<img width='100%' height='100%' src='"+ url +"' />");
			} else {
				el.insertHtml('afterBegin', '<span>' + me.formAttr.get('display') + '</span>');
			}
		}
		if (field.name == 'testval' & isbar == '1') {
			el.first().remove();
			el.dom.testval = val;
			
			if (val.length > 0) {
				url += '&codevalue=' + val;
			} else {
				url += '&codevalue=12345678';
			}
			el.insertHtml('afterBegin', "<img width='100%' height='100%' src='"+ url +"' />");
		}
		if (field.name == 'bartype') {
			el.dom.bartype = val;
		}
		if (field.name == 'barwidth') {
			el.dom.barwidth = val;
		}
		if (field.name == 'bardisplayval') {
			el.dom.bardisplayval = val;
		}
		if (field.name == 'orientation') {
			el.dom.orientation = val;
		}
	},
	
	//清除所有属性
	clearAttr: function() {
		var me = this;
		me.formAttr.items.each(function(f){
			if (f.isFormField) {
				f.setValue('');
			}
		});
	},
	
	//构建字段信息xml
	getColXML: function() {
		var colgrid = this.designCt.getComponent(0).getComponent(0).getComponent(0);
		var store = colgrid.getStore();
		var xml = '<?xml version="1.0" encoding="gb2312"?>\n<data>';
		store.each(function(rec){
			var code = rec.get('lab_field__field_code');
			var title = rec.get('lab_field__field_title');
			xml += '\n\t<col>\n\t\t<code>'+ code +'</code>\n\t\t<name>'+ title +'</name>\n\t\t<source>head</source>\n\t</col>';
		});
		xml += '\n</data>';
		
		return xml;
	},
	
	//构建页面设置xml
	getPageXML: function() {
		var bbar = this.designCt.getComponent(1).getBottomToolbar();
		var getv = function(name){
			var v = bbar.find('name', name)[0].getValue();
			if (v.length == 0) v = 0;
			return v;
		};
		
		var xml = '<?xml version="1.0" encoding="gb2312"?>\n<page>\n\t<head>';
		xml += '\n\t\t<height>'+ getv('height') +'</height>';
		xml += '\n\t\t<width>'+ getv('width') +'</width>';
		xml += '\n\t\t<margin-right>'+ getv('margin-right') +'</margin-right>';
		xml += '\n\t\t<margin-left>'+ getv('margin-left') +'</margin-left>';
		xml += '\n\t\t<margin-top>'+ getv('margin-top') +'</margin-top>';
		xml += '\n\t\t<margin-bottom>'+ getv('margin-bottom') +'</margin-bottom>';
		xml += '\n\t</head>\n</page>';
		
		return xml;
	},
	
	//取属性值
	getAttr: function(el, name, def) {
		var v = el.getAttribute(name);
		def = def||'';
		return v||def;
	},
	
	//构建标签字段设置xml
	getSetXML: function() {
		var me = this;
		//取一个控件的配置
		var getXML = function(item) {
			var el = item.el;
			var type = me.getAttr(el, 'data_type');
			var fx = (type == 'data' || type == 'label') ? 'txt' : 'tmp'; 
			var xy = item.getPosition(true);
			var width = item.getWidth();
			var height = item.getHeight();
			
			var xml = '\n\t<col>';
			xml += '\n\t\t<id>' + fx + '_' + el.id + '</id>';
			xml += '\n\t\t<code>'+ me.getAttr(el, 'field_code') +'</code>';
			xml += '\n\t\t<name>'+ me.getAttr(el, 'field_title') +'</name>';
			xml += '\n\t\t<display>'+ el.first().dom.innerHTML +'</display>';
			xml += '\n\t\t<fonttype>'+ type +'</fonttype>';
			xml += '\n\t\t<lbltop>'+ xy[1]/me.PIXN +'</lbltop>';
			xml += '\n\t\t<lblleft>'+ xy[0]/me.PIXN +'</lblleft>';
			xml += '\n\t\t<lblwidth>'+ width/me.PIXN +'</lblwidth>';
			xml += '\n\t\t<lblheight>'+ height/me.PIXN +'</lblheight>';
			xml += '\n\t\t<lblfont>'+ el.getStyle('font-family') +'</lblfont>';
			xml += '\n\t\t<lblfontsize>'+ parseInt(el.getStyle('font-size')) +'</lblfontsize>';
			xml += '\n\t\t<lblfontbold>'+ (el.getStyle('font-weight') == 'bold') +'</lblfontbold>';
			xml += '\n\t\t<lblfontitalic>'+ (el.getStyle('font-style') == 'italic') +'</lblfontitalic>';
			xml += '\n\t\t<lblfontunderline>'+ (el.getStyle('text-decoration') == 'underline') +'</lblfontunderline>';
			xml += '\n\t\t<lblfontdelline>'+ (el.getStyle('text-decoration') == 'line-through') +'</lblfontdelline>';
			xml += '\n\t\t<lblAlign>'+ el.getStyle('text-align') +'</lblAlign>';
			xml += '\n\t\t<lblVAlign>'+ el.getStyle('vertical-align') +'</lblVAlign>';
			xml += '\n\t\t<bartype>'+ me.getAttr(el, 'bartype') +'</bartype>';
			xml += '\n\t\t<barwidth>'+ me.getAttr(el, 'barwidth') +'</barwidth>';
			xml += '\n\t\t<bardisplayval>'+ (me.getAttr(el, 'bardisplayval') == '1') +'</bardisplayval>';
			xml += '\n\t\t<testval>'+ me.getAttr(el, 'testval') +'</testval>';
			xml += '\n\t\t<isbarcode>'+ (me.getAttr(el, 'isbarcode') == '1') +'</isbarcode>';
			xml += '\n\t\t<picpath>'+ me.getAttr(el, 'picpath') +'</picpath>';
			xml += '\n\t\t<orientation>'+ me.getAttr(el, 'orientation') +'</orientation>';
			xml += '\n\t</col>';
			return xml;
		};
		//取所有控件的配置信息
		var xml = '<?xml version="1.0" standalone="yes"?>\n<printcol>';
		var items = this.canvaCt.items;
		items.each(function(item){
			xml += getXML(item);
		}, me);
		xml += '\n</printcol>';
		
		return xml;
	},
	
	//保存页面设置到数据表中
	saveXML: function(modelId) {
		var me = this;
		var setxml = me.getSetXML();
		var colxml = me.getColXML();
		var pagexml = me.getPageXML();
		
		var e = encodeURIComponent; //编码, 处理isHexDigit异常
		var params = 'funid=lab_case&eventcode=savexml&modelid='+modelId;
			params += '&setxml='+ e(setxml) +'&colxml='+ e(colxml) +'&pagexml='+ e(pagexml);

		//发送请求保存设计文件到数据库中
		Request.postRequest(params, null);
	},
	
	//读取页面设计信息到设计器
	readXML: function(modelId) {
		var me = this;
		var hdcall = function(data) {
			if (Ext.isEmpty(data)) {
				JxHint.alert('没有找到标签设计信息！');
				return;
			}
			
			//如果为空，则创建一个新的画布
			if (Ext.isEmpty(data.pagexml)) {
				var dt = me.designCt.getComponent(1).getComponent(2);
				me.canvaCt = me.createPage(dt, 70*me.PIXN, 40*me.PIXN);
			} else {
				me.setPageXML(data.pagexml);
			}
			me.setLabelXML(data.setxml);
		};
		
		var params = 'funid=lab_case&eventcode=readxml&modelid='+modelId;
		Request.postRequest(params, hdcall);
	},
	
	//设置画布属性
	setPageXML: function(xml) {
		var me = this;
		if (xml.length == 0) return;
		//从xml中读取数据
		var xdoc = Request.loadXML(xml);
		var page = xdoc.getElementsByTagName("page").item(0);
		var head = page.getElementsByTagName("head").item(0);
		var getv = function(name) {
			var node = head.getElementsByTagName(name).item(0);
			var ch = node.childNodes[0];
			return ch ? ch.nodeValue : '';
		};
		
		var bbar = me.designCt.getComponent(1).getBottomToolbar();
		var setv = function(name){
			var v = getv(name);
			var f = bbar.find('name', name)[0];
			f.setValue(v);
		};
		
		var width = getv('width')*me.PIXN;
		var height = getv('height')*me.PIXN;
		setv('margin-right');
		setv('margin-left');
		setv('margin-top');
		setv('margin-bottom');
		
		//创建画布对象
		var dt = me.designCt.getComponent(1).getComponent(2);
		me.canvaCt = me.createPage(dt, width, height);
	},
	
	//设置标签属性
	setLabelXML: function(xml) {
		var me = this;
		if (xml.length == 0) return;
		//从xml中读取数据
		var xdoc = Request.loadXML(xml);
		var printcol = xdoc.getElementsByTagName("printcol").item(0);
		var cols = printcol.getElementsByTagName("col");
		
		for (var i = 0; i < cols.length; i++) {
			me.createLabelXML(cols.item(i));
		}
	},
	
	//创建一个标签对象
	createLabelXML: function(col) {
		var me = this;
		var getv = function(name) {
			var node = col.getElementsByTagName(name).item(0);
			var ch = node.childNodes[0];
			return ch ? ch.nodeValue : '';
		};
		
		var type = getv('fonttype');
		var text = getv('name');
		var fieldcode = getv('code');
		var x = getv('lblleft')*me.PIXN;
		var y = getv('lbltop')*me.PIXN;
		var width = getv('lblwidth')*me.PIXN;
		var height = getv('lblheight')*me.PIXN;
		
		//添加控件
		var ctl = me.addBaseLabel(me.canvaCt, type, text, fieldcode, x, y, width, height);
		var el = ctl.el;
		
		//设置字体属性
		el.setStyle('font-family', getv('lblfont'));
		el.setStyle('font-size', getv('lblfontsize')+'pt');
		el.setStyle('text-align', getv('lblAlign'));
		el.setStyle('vertical-align', getv('lblVAlign'));
		el.setStyle('font-weight', (getv('lblfontbold') == 'true') ? 'bold' : '');
		el.setStyle('font-style', (getv('lblfontitalic') == 'true') ? 'italic' : '');
		el.setStyle('text-decoration', (getv('lblfontunderline') == 'true') ? 'underline' : '');
		el.setStyle('text-decoration', (getv('lblfontdelline') == 'true') ? 'line-through' : '');
		
		//设置条码属性
		if (getv('isbarcode') == 'true') {//是条码，则需要显示条码图片
			el.first().remove();
			el.dom.isbarcode = '1';
			
			var val = getv('testval');
			el.dom.testval = val;
			
			var url = './fileAction.do?funid=sys_attach&pagetype=editgrid&eventcode=barcode&dataType=byte&user_id='+ Jxstar.session['user_id'];
			if (val.length > 0) {
				url += '&codevalue=' + val;
			} else {
				url += '&codevalue=12345678';
			}
			el.insertHtml('afterBegin', "<img width='100%' height='100%' src='"+ url +"' />");
		}
		el.dom.bartype = getv('bartype');
		el.dom.barwidth = getv('barwidth');
		el.dom.bardisplayval = getv('bardisplayval');
		el.dom.orientation = getv('orientation');
		
		//设置其他属性
		el.dom.picpath = getv('picpath');
	},
	
	//取模板的名称
	getModelName: function() {
		var me = this;
		var desgrid = me.designCt.getComponent(0);
		var gridm = desgrid.getComponent(1).getComponent(0);
		var records = JxUtil.getSelectRows(gridm);
		if (records.length == 0) return '缺省标签';
		
		return records[0].get('lab_model__model_name');
	},
	
	//构建预览用的数据
	getPreviewData: function() {
		var me = this;
		var data = "<print>";
		var items = me.canvaCt.items;
		items.each(function(item){
			var el = item.el;
			var type = me.getAttr(el, 'data_type');
			if (type == 'data') {
				var code = me.getAttr(el, 'field_code');
				var title = me.getAttr(el, 'field_title');
				var test = me.getAttr(el, 'testval');
				if (test.length > 0) {
					data += "<"+ code +">" + test + "</"+ code +">";
				} else {
					if ((me.getAttr(el, 'isbarcode') == '1')) {
						data += "<"+ code +">12345678</"+ code +">";
					} else {
						data += "<"+ code +">" + title + "</"+ code +">";
					}
				}
			}
		});
		data += "</print>";
		return data;
	}
};