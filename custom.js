//用于添加各项目自定义的公用JS文件
//注意文件名路径的正确性，第二个参数表示是否每次都重新加载，一般是true
//添加方法如: JxUtil.loadJS('/eam/JxPm.js', true);
JxUtil.loadJS('/zhx_res/arch-combo-lang-zh.js', true);
JxUtil.loadJS('/zhx_res/base-unit-zh.js', true);
JxUtil.loadCss('/zhx_res/css/zhx.css', true);
JxUtil.loadCss('/zhx_res/css/select.css', true);

Ext.apply(JxSelect, {
	/**
	* 多级数据选择控件
	* 	config: 选择数据的配置，参数有:
		nodeId: 'xxxxx',--功能id
		whereSql: '',
		whereValue: '',
		whereType: ''
	**/
	selectType: function(config, hdcall) {
		//定义界面模板
		//数据对象：{allTypes:[{typeId:'', typeName:'', childNum:n, twoTypes:[{typeId:'', typeName:'', 
		//           childNum:n, threeTypes:[{typeId:'', typeName:''},...]},...]}]}
		var tpl = new Ext.XTemplate(
			'<div class="sWap" id="selField">',
			'<tpl for=".">',
				'<div class="param">',
				'<span style="width:120px"><a style="color:#FF4400;font-weight:bold;width:120px;" childNum="{childNum}" typeId="{typeId}" typeName="{typeName}">{typeName}: </a></span>',
				'<dl>',
					'<dd class="clearfix">',
					'<tpl for="twoTypes">',
						'<i><a href="#" childNum="{childNum}" ',
						'<tpl if="childNum == 0">',
							'style="{background-color:#FFFFFF;} :hover{color:#FF0000}" ',
						'</tpl>',
						'typeId="{typeId}" typeName="{typeName}">{typeName}</a></i>',
					'</tpl>',
					'</dd>',
				'</dl>',
				'<div class="clear"></div>',
				'</div>',
			'</tpl>',
			'</div>'
		);
	
		//大类显示为标题、中类显示在大类后面、小类采用菜单的方式显示；
		var showPage = function(json) {
			var store = new Ext.data.Store({
				proxy: new Ext.data.MemoryProxy(json),
				reader: new Ext.data.JsonReader({
					root: 'allTypes'
					},[
					{name:'typeId'},
					{name:'typeName'},
					{name:'childNum'},
					{name:'twoTypes'}
					])
			});
			store.load();
			
			//获取第三级分类信息
			var getThree = function(el) {
				var item = Ext.fly(el).up('div.param');
				
				var twoId = el.getAttribute('typeId');
				var oneId = item.down('span').getAttribute('typeId');
				//alert(oneId + ';' + twoId);
				
				//查找一级分类信息
				var ones = json.allTypes;
				for (var i = 0, n = ones.length; i < n; i++) {
					if (ones[i].typeId == oneId) {
						var twos = ones[i].twoTypes;
						for (var j = 0, m = twos.length; j < m; j++) {
							if (twos[j].typeId == twoId) {
								return twos[j].threeTypes;
							}
						}
					}
				}
				
				return [];
			};
			
			//显示第三级分类信息
			var showTypes = function(el, xy) {
				var el = Ext.get(el);
				
				var threes = getThree(el);
				if (Ext.isEmpty(threes)) return;
				
				var tpl3 = new Ext.XTemplate(
					'<div class="param" style="width:380px;">',
						'<dd class="clearfix">',
						'<tpl for=".">',
							'<i><a href="#" style="text-decoration:none;background-color:#FFFFFF;" typeId="{typeId}" typeName="{typeName}">{typeName}</a></i>',
						'</tpl>',
						'</dd>',
					'</div>'
				);
				
				var html = tpl3.apply(threes);
				var win = new Ext.Window({
					html:html, width:350, autoHeight:true, 
					border:false, iconCls:'', modal:true,
					closeAction:'close', bodyStyle: 'background:#fff'});
				win.show(el);
				
				win.body.on('click', function(e, t){
					var t = e.getTarget('a');
					if (!t) return;
					//选择值到外部函数
					hdcall(t);
					
					win.close();
					winp.close();
				});
			};
			
			//构建视图区域
			var view = new Ext.DataView({
				store: store,
				tpl: tpl,
				autoHeight:true,
				multiSelect:false,
				itemSelector:'param',
				onClick:function(e){
					var t = e.getTarget('a');
					if (!t) return;
					
					//当第三级分类有值时才显示
					var childNum = t.getAttribute('childNum');
					if (childNum > 0) {
						showTypes(t, e.getXY());
					}
				},
				onDblClick:function(e){
					var t = e.getTarget('a');
					if (!t) return;
					
					var childNum = t.getAttribute('childNum');
					//if (childNum == 0) { //修改,第一级分类也可以双击进行过滤
						//选择值到外部函数
						hdcall(t);
						winp.close();
					//}
				}
			});
			
			var	winp = new Ext.Window({
				title: '选择',
				//layout: 'fit',
				autoScroll:true,
				width: 650,
				height: 350,
				border: false,
				modal: true,
				closeAction: 'close',
				bodyStyle: 'background:#fff',
				items: [view]
			});
			winp.show();
		};
		
		var e = encodeURIComponent;
		//根据过滤条件读取分类数据
		var params = 'funid=sys_select_field&qryfunid=' + config.nodeId + '&pagetype=editgrid&eventcode=loadtype&wheresql=' + 
			e(config.whereSql||'') + '&wheretype=' + e(config.whereType||'') + '&wherevalue=' + e(config.whereValue||'');
		Request.dataRequest(params, showPage);
	}
});


//给GridEvent添加基础数据应用事件
Ext.apply(Jxstar.GridEvent.prototype, {
		/**
	* public 
	* 导入txt数据
	**/
	impText: function(imp_index) {
		var impIndex = '';//功能导入定义序号
		if (Ext.isNumber(imp_index) || Ext.isString(imp_index)) {
			impIndex = imp_index;
		}
		
		var nodeid = this.define.nodeid;
		var queryForm = new Ext.form.FormPanel({
			layout:'form', 
			labelAlign:'right',
			labelWidth:80,
			border:false, 
			baseCls:'x-plain',
			autoHeight: true,
			bodyStyle: 'padding: 20px 10px 0 10px;',
			defaults: {
				anchor: '95%',
				allowBlank: false,
				msgTarget: 'side'
			},
			items: [{
				xtype: 'fileuploadfield',
				useType: 'file',
				fieldLabel: jx.event.selfile,	//选择文件
				name: 'import_file',
				buttonText: '',
				maxLength: 200,
				buttonCfg: {
					iconCls: 'upload_icon'
				}
			}]
		});

		//创建对话框
		var self = this;
		var win = new Ext.Window({
			title:'选择导入文件',
			layout:'fit',
			width:400,
			height:130,
			resizable: false,
			modal: true,
			closeAction:'close',
			items:[queryForm],

			buttons: [{
//				text:'下载模板',
//				handler:function(){
//					var params = 'funid=imp_list&impFunId='+ nodeid +'&pagetype=grid&eventcode=downtpl&impIndex='+ impIndex;
//					Request.fileDown(params);
//				}
//			},	{
				text:jx.base.ok,
				handler:function(){
					var form = queryForm.getForm();
					if (!form.isValid()) return;
					
					//当前功能外键值
					var fkValue = self.grid.fkValue;
					//上传参数
					var params = 'funid='+ nodeid +'&pagetype=grid&eventcode=imptext&fkValue='+ fkValue +'&impFunId='+ nodeid + '&impIndex='+ impIndex;
					var hdCall = function(data) {
						if (!Ext.isEmpty(data) && !Ext.isEmpty(data.valueInfo)) {
							JxHint.alert(data.valueInfo);
						}
						win.close();
						self.grid.getStore().reload();
						//导入数据子表汇总
						if (self.grid.gridNode.param.substat) {
							self.substat(self.grid);
						}
					};
					//上传附件
					Request.fileRequest(form, params, hdCall);
				}
			},{
				text:jx.base.cancel,
				handler:function(){win.close();}
			}]
		});
		win.show();
	},
	sampleAudit : function(auditval) {
		var keyids = [];
		var cm = this.grid.getColumnModel();
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selected(records)) return;
		
		//检查必填附件字段的值
		if (JxAttach.checkGrid(this.grid) == false) return;
		
		//检查数据是否有效
		if (JxUtil.validateGrid(this.grid) == false) return;

		//复核事件代码
		var eventcode = 'audit';
		if(auditval=='0'){
		  eventcode = 'unaudit';
		}else if(auditval=='1'){
		   eventcode = 'audit';
		}
		else{
		   eventcode = 'audit_cancel';
		}
		
		var self = this;
		var define = this.define;
		var hdcall = function() {
			//取选择记录的主键值
			var params = 'funid='+ self.define.nodeid;
			for (var i = 0; i < records.length; i++) {
				params += '&keyid=' + records[i].get(self.define.pkcol);
			}
			//设置请求的参数
			params += '&pagetype=grid&eventcode='+eventcode+'&auditvalue='+auditval;
			
			//提交后要处理的内容
			var endcall = function(data) {
				//重新加载数据
				self.grid.getStore().reload();
			};
			
			//处理检查项提示信息
			//result:{success:false, message:'', data:{}, extData:{}}
			var errorcall = function(result) {
				var extd = result.extData;
				if ( extd && extd.checkMsg) { //eventcode == 'audit' &&
					JxUtil.checkResult(extd);
				} else {
					var msg = result.message;
					if (msg.length == 0) msg = jx.req.faild;
					JxHint.alert(msg);
				}
			};

			//发送请求
			Request.postRequest(params, endcall, {errorcall:errorcall});
		};
		
		var audity = {'0': '草稿', '1': '应用', '7': '停用'};
		var shint = '确定当前记录改为['+ audity[auditval] +']状态吗？';
		Ext.Msg.confirm(jx.base.hint, shint, function(btn) {
			if (btn == "yes") hdcall();
		});
	},
	
	/**
	* public 
	* 高级筛选
	**/
	selQuery: function(){
		this.selBaseQuery(this.grid);
	},
	//外部可以直接调用此方法查询数据，dataobj可以是grid、store对象
	selBaseQuery: function(dataobj){
		var define = this.define;
		var funid = define.nodeid;
		//从后台加载筛选字段数据
		var loadFieldDate = function(funid){
			var endcall = function(data) {
				loadPage(data); 
			}
			var params = 'funid=sys_select_field&qryfunid=' + funid +'&pagetype=editgrid&eventcode=loadfield';
			Request.dataRequest(params, endcall);
		}
		
		loadFieldDate(funid);
	
		//加载筛选界面
		var loadPage = function(tpldata) {
			//定义筛选界面模板
			var tpl = new Ext.XTemplate(
				'<div class="sWap" id="selField">',
				'<tpl for=".">',
					'<div class="param">',
					'<span fieldCode="{fieldCode}" fieldType="{fieldType}" fieldSrc="{fieldSrc}">{fieldName}：</span>',
					'<em class="all cur"><a href="#" hidVal="all">不限</a></em>',
					'<dl>',
						'<dd class="clearfix less">',
						'<tpl if="this.isDate(fieldType)">', //类型是日期
								'<i><a href="#" hidVal="today">今天</a></i>',
								'<i><a href="#" hidVal="yestoday">昨天</a></i>',
								'<i><a href="#" hidVal="toweek">本周</a></i>',
								'<i><a href="#" hidVal="tomonth">本月</a></i>',
						'</tpl>',
						'<tpl if="this.isDate(fieldType) == false">',
							'<tpl for="fieldValues">',
								'<i><a href="#" hidVal="{selval}">{selname}</a></i>',
							'</tpl>',
						'</tpl>',
						'</dd>',
						'<tpl if="this.checkLen(charCount)">',
							'<dd class="moreitem" title="更多">&nbsp;</dd>',
						'</tpl>',
					'</dl>',
					'<div class="clear"></div>',
					'</div>',
				'</tpl>',
				'</div>', {
					isDate :function(type){
						return type == 'date';
					},
					checkLen :function(count){
						return count*15 + 20*(count*15/30) > 400;
					}
				}
			);
			
			//{allFields:[{fieldCode:'',fieldName:'',fieldType:'',fieldSrc:'',fieldValues:[{selval:'',selname:''}],'charCount':''}]}
			var store = new Ext.data.Store({
				proxy: new Ext.data.MemoryProxy(tpldata),
				reader: new Ext.data.JsonReader({
					root: 'allFields'
					},[
					{name:'fieldCode'},
					{name:'fieldName'},
					{name:'fieldType'},
					{name:'fieldSrc'},
					{name:'fieldValues'},
					{name:'charCount',type:'int'}
					])
			});
			store.load();

			var fieldDatas = new Array();
			var getFields = function(){
				var data = tpldata.allFields;
				var fieldcols = [];
				for(var i=0;i<data.length;i++){
					var fieldcode = data[i].fieldCode;
					var fieldtype = data[i].fieldType;
					var fieldSrc  = data[i].fieldSrc;
					fieldcols[i] = {col : fieldcode , value : '' , type : fieldtype , src : fieldSrc};
				}
				return fieldcols;
			}
			fieldDatas = getFields();
			
			//添加日期控件
			var addDateCfg = function(){
				
				//开始日期
				var startDate = new Ext.form.DateField({
					xtype:'datefield',name:'startDate',format: "Y-m-d",allowBlank :false,value:'',columnWidth:.45 
				}); 
				//结束日期
				var endDate = new Ext.form.DateField({
					xtype:'datefield',name:'endDate',format: "Y-m-d",allowBlank :false,value:'',columnWidth:.45
				});	
				
				var datecfg = [startDate,{xtype:'label',text:'到',style:'margin-left:5px',columnWidth:.1},endDate];
				
				return datecfg;
			};
			
			//渲染日期控件
			var renderDate = function(el, col){
				var datecfg = addDateCfg();
				var sd = datecfg[0];
				var to = datecfg[1];
				var ed = datecfg[2];
				var p = new Ext.Panel({
					layout:'column',
					border:false,
					items:[sd,to,ed]
				});
				p.render(el);
				
				var fn = function() {
					var sValue = sd.getValue().format('Y-m-d');
					var eValue = ed.getValue().format('Y-m-d');
					for(var i=0;i<fieldDatas.length;i++){
						var field = fieldDatas[i];
						if(field.col == col){
							field.value = sValue +';'+ eValue ;
							break;
						}
					}
				}
				sd.on('change',fn);
				ed.on('change',fn);
				
				return [sd,ed];
			}
			
			var dateArray = [];
			
			//构建视图区域
			var view = new Ext.DataView({
				store: store,
				tpl: tpl,
				autoHeight:true,
				multiSelect:false,
				itemSelector:'param',
				onClick : function(e){
					var it = e.getTarget('a');
					
					if(it){
						var item = Ext.fly(it).up('div.param');
						item.select('em.all').removeClass('cur');
						item.select('dd a').removeClass('cur');
						
						if(Ext.fly(it).up('em.all')){
							Ext.fly(e.getTarget('em.all')).addClass('cur');
						}else{
							Ext.fly(it).addClass('cur');
						}
						
						var val = it.getAttribute('hidVal');
						if(val.length != 0){
							var col = item.down('span').getAttribute('fieldCode');
							var type = item.down('span').getAttribute('fieldType');
							
							//如果类型是日期，则渲染日期控件（开始日期、结束日期）
							var dayValue = "";
							if(type == 'date'){
								var dd = Ext.fly(it).up('dd');
								var dp = Ext.fly(it).down('div');
								
								var dates = null;
								Ext.each(dateArray,function(obj){
									if(obj.col = col){
										dates = obj.dates;
									}
								});
								
								if(Ext.isEmpty(dates)){
									dates = renderDate(dd,col);
									dateArray.push({col:col,dates:dates});
								}
								var startDate = dates[0];
								var endDate = dates[1];
								
								if(val == 'today'){
									//今天日期
									var toDate = JxUtil.getToday();
									startDate.setValue(toDate);
									endDate.setValue(toDate);
									dayValue = toDate +';'+ toDate;
								}
								else if(val == 'yestoday'){
									//昨天日期
									var yesToDate = JxUtil.getToday(-1);
									startDate.setValue(yesToDate);
									endDate.setValue(yesToDate);
									dayValue = yesToDate +';'+ yesToDate;
								}
								else if(val == 'toweek'){
									//本周日期开始与结束日期
									var toWeekDate = JxUtil.getWeekDates();
									startDate.setValue(toWeekDate[0]);
									endDate.setValue(toWeekDate[1]);
									dayValue = toWeekDate[0] +';'+ toWeekDate[1];
								}
								else if(val == 'tomonth'){
									//本月日期开始与结束日期
									var toMonthDate = JxUtil.getMonthDates();
									startDate.setValue(toMonthDate[0]);
									endDate.setValue(toMonthDate[1]);
									dayValue = toMonthDate[0] +';'+ toMonthDate[1];
								}
							}
							
							for(var i=0;i<fieldDatas.length;i++){
								var field = fieldDatas[i];
								if(field.col == col){
									field.value = val;
									if(type == 'date'){
										field.value = dayValue;
									}
									break;
								}
							}
							
							var win = this.findParentByType('window');
							if(win != null) {
								var chb = win.buttons[0];
								//如果选中了立即查询，则执行查询
								if(chb.name == 'isq'){
									if(chb.checked){
										//是否查询含归档数据
										var querytype = '0';
										if(win.buttons[1].checked){
											querytype = '1';
										}
										
										queryData(dataobj, fieldDatas, querytype);
									}
								}
							}
							
						}
					}
					//显示更多行
					if (e.getTarget('dd.moreitem')){
						var moreitem = e.getTarget('dd.moreitem');
						Ext.fly(moreitem).prev().removeClass('less');
						Ext.fly(moreitem).replaceClass('moreitem','lessitem');
						moreitem.setAttribute('title','收起');
					}else{
						if (e.getTarget('dd.lessitem')){
							var lessitem = e.getTarget('dd.lessitem');
							Ext.fly(lessitem).prev().addClass('less');
							Ext.fly(lessitem).replaceClass('lessitem','moreitem');
							lessitem.setAttribute('title','更多');
						}
					}
					
				}
			});
			
			openSelWin(view, fieldDatas);
		}
		
		//打开筛选窗口
		var openSelWin = function(view, fieldDatas){
			var	win = new Ext.Window({
				title:'高级筛选查询窗口',
				layout:'fit',
				width: 600,
				height: 350,
				constrainHeader: true,
				resizable: false,
				modal: true,
				closeAction: 'close',
				bodyStyle: 'background:#fff',
				items:[{
					xtype:'container',
					style: 'padding:10px;',
					border: false,
					frame: false,
					items: [view]
				}],
				buttons:[{
					xtype:'checkbox',
					name:'isq',
					boxLabel:'立即查询',
					checked:true
				},{
					text:jx.star.qry, //查询
					handler : function(){
						//是否查询含归档数据
						var querytype = '0';
						if(win.buttons[1].checked){
							querytype = '1';
						}
						queryData(dataobj, fieldDatas, querytype);
					}
				}]
			});
			if (define.isarch == '1') {
				win.fbar.insertButton(1, {
					xtype:'checkbox',
					name:'isarch',
					boxLabel:'含归档数据',
					checked:false
				});
			}
		
			win.show();
		}
		
		//查询数据
		var queryData = function(dataobj, fieldDatas, querytype){
			var where_sql='', where_value='', where_type='';
			for(var i=0;i<fieldDatas.length;i++){
				
				if(fieldDatas[i].value != '' && fieldDatas[i].value != 'all'){
					
					if(fieldDatas[i].src == 'zdyz'){ //来源类型等于自定义值
						if(fieldDatas[i].value != ''){
							where_sql += ' (' + fieldDatas[i].value + ') and';
						}
						
					}
					else if(fieldDatas[i].type == 'date') { //字段类型等于date
						where_sql += ' (' + fieldDatas[i].col + ' >= ? and ' + fieldDatas[i].col + ' <= ? ) and';
						var date1 = fieldDatas[i].value.split(';')[0];
						var date2 = fieldDatas[i].value.split(';')[1];
						if(date1 == '' || date2 == '') continue;
						
						where_value += date1 + ';' + date2 + ';';
						where_type += 'date;date;';
					}
					else{
						var cond = '='; 
						var arg = ''
						if(fieldDatas[i].src == 'zdly' && fieldDatas[i].type == 'string') {
							cond = 'like';
							arg = '%';
						}
						where_sql += ' ' + fieldDatas[i].col + ' ' +cond+ ' ? and';
						where_value += fieldDatas[i].value +arg+ ';';
						where_type += fieldDatas[i].type + ';';
					}
				}
				if(fieldDatas[i].value == 'all' || fieldDatas[i].value == ''){
					where_sql += '';
					where_value += '';
					where_type += '';
				}
				
				
			}
			
			if(where_sql.lastIndexOf('and') > 0){
				where_sql = where_sql.substr(0, where_sql.lastIndexOf('and'));
			}
			if(where_value.lastIndexOf(';') > 0){
				where_value = where_value.substr(0, where_value.lastIndexOf(';'));
			}
			if(where_type.lastIndexOf(';') > 0){
				where_type = where_type.substr(0, where_type.lastIndexOf(';'));
			}
			
			var wheres = [where_sql, where_value, where_type];
			if (dataobj instanceof Ext.data.Store) {
				//直接通过store对象加载数据
				var options = {where_sql:where_sql, where_value:where_value, where_type:where_type, is_query:'1', query_type:'1'};
				var params = Ext.apply({start:0, limit:50}, options);
				dataobj.load({params:params});
			} else {
				Jxstar.myQuery(dataobj, wheres, querytype);
			}
		}
	},
	detqry : function(){//明细查询
		//打开物料选择界面
	//console.log(this.grid);
	var self=this;
	var define = this.define;
		var funid = define.nodeid;
		//从后台加载筛选字段数据
			var endcall = function(data) {
				console.log(data);
				if(data.qrySql){
					JxUtil.detQryWindow(self.grid,data.qrySql,data.dets);	
				}
			}
			
		var params = 'funid=sys_fun_det_qry&qryfunid=' + funid +'&pagetype=editgrid&eventcode=qry_sql';
			Request.dataRequest(params, endcall);
			
		
	}
	});
	
//给基础数据附件状态列，添加：草稿、启用、停用的菜单
JxUtil.attachAudit = function(config) {
	var cols = config.param.cols;
	var funid = config.param.funid;
	var define = Jxstar.findNode(funid);
	if (define == null) return;
	
	var auditcol = define.auditcol;
	if (auditcol == null || auditcol.length == 0) return;
	//根据combo获取表格对象
	var getGrid = function(ed) {
		var gdom = ed.el.findParentNode('div.x-grid-panel');
		return Ext.getCmp(gdom.id);
	};
	
	var index = -1;
	for (var i = 0, n = cols.length; i < n; i++) {
		var fn = cols[i].field;;
		if (fn && fn.name.indexOf(auditcol) >= 0) {
			index = i;
		}
	}
	
	var render = function(val, meta, rec) {
		var data = Jxstar.findComboData('audity');
		var name = value = rec.get(auditcol);
		for (var i = 0; i < data.length; i++) {
			if (data[i][0] == value)
				name = data[i][1];
		}
		
		var html = '<span class="simpledropdown">'+name+'</span>';
		return html;
	};
	
	cols[index].col.renderer = render;
	cols[index].col.listeners = {
		click: function(col, grid, row, e){
			var gn = grid.gridNode;
			//如果是选择或者导入界面，则不显示操作菜单
			if (gn.pageType == 'import' || gn.pageType.indexOf('sel') >= 0) return;
			
			var rec = grid.getStore().getAt(row);
			var audit = rec.get(auditcol);
			var ge = gn.event;
			
			var items = [];
			if (audit != '0') items[items.length] = {text:'草稿', handler: function(){ge.sampleAudit('0');}};
			if (audit != '1') items[items.length] = {text:'应用', handler: function(){ge.sampleAudit('1');}};
			if (audit != '7') items[items.length] = {text:'停用', handler: function(){ge.sampleAudit('7');}};
			
			var m = new Ext.menu.Menu({items:items});
			m.show(e.getTarget());
		}
	};
};
	
JxUtil.attachActionCol = function(cols, openFunId) {
	cols[cols.length] = {col:
		{header:'操作', width:100, align:'center', 
			renderer: function() {
				return '<a href="#">分组管理</a>'
			},
			listeners: {click: function(col, grid, row){
				var rec = grid.getStore().getAt(row);
				var group_id = rec.get('base_group__group_id');
				
				//过滤条件
				var where_sql = 'base_group.parent_id = ?';
				var where_type = 'string';
				var where_value = group_id;
				
				//加载数据
				var hdcall = function(layout) {
					//显示数据
					JxUtil.delay(500, function(){
						//主表
						var grid = layout.getComponent(0).getComponent(0);
						//设置外键值
						grid.fkValue = where_value;

						Jxstar.loadData(grid, {where_sql:where_sql, where_value:where_value, where_type:where_type});
					});
				};

				//显示数据
				var define = Jxstar.findNode(openFunId);
				Jxstar.showData({
					nodedefine: define,
					filename: define.layout,
					title: define.nodetitle,
					width: 800,
					height: 600,
					callback: hdcall
				});
			}}
		}
	};
};

//显示颜色，如：JxUtil.showColor(cols, 'base_mat_code__color_name', 'base_mat_code__color_value');
JxUtil.showColor = function(cols, colorname, colorvalue) {
	var showcolor = function(value, metaData, record) {
		var color = record.get(colorvalue);
		var html = '<span style="background-color:'+ color +';padding-right:40px;">&nbsp;</span><span>&nbsp;'+value+'</span>';
		return html;
	};

	for (var i = 0; i < cols.length; i++) {
		if (cols[i].field == null) continue;
		
		var index = cols[i].field.name.indexOf(colorname);
		if (index >= 0) {
			cols[i].col.renderer = showcolor;
		}
	}
};

//显示样衣试制单
JxUtil.showDevOrder = function(taskId) {
	var nodeId = 'dev_order';
	var define = Jxstar.findNode(nodeId);
	if (define == null) {
		JxHint.alert(String.format(jx.star.nopage, nodeId));	//'没有定义【{0}】功能页面信息！'
		return false;
	}
	
	//构建页面参数
	var pageParam = {
		whereSql: ' dev_order.task_id = ?',
		whereValue: taskId,
		whereType: 'string',
		showType: 'form'
	};
	Jxstar.createNode(nodeId, pageParam);
};

//在form中显示四个明细表
JxUtil.showDevGrid = function(config, subid1, subid2, subid3, subid4) {
	//在GridNode.js中构建表格时不带边框，而且分页工具栏显示在顶部。
	var sd1 = Jxstar.findNode(subid1);
	sd1.showInForm = true; st1 = sd1.nodetitle;
	var sd2 = Jxstar.findNode(subid2);
	sd2.showInForm = true; st2 = sd2.nodetitle;
	var sd3 = Jxstar.findNode(subid3);
	sd3.showInForm = true; st3 = sd3.nodetitle;
	var sd4 = Jxstar.findNode(subid4);
	sd4.showInForm = true; st4 = sd4.nodetitle;
	
	config.param.items[1] = {
			height:260,
			anchor:'100%',
			border:false,
			layout:'column',
			items:[{
				columnWidth:0.2,
				title:st1, baseCls:'xs-panel', iconCls:'sub_title', data:subid1, style:'padding-right:0;',
				cls:'sub_panel', border:true, layout:'fit', collapsible:true, height:260
			},{
				columnWidth:0.3,
				title:st2, baseCls:'xs-panel', iconCls:'sub_title', data:subid2, style:'padding-right:0;',
				cls:'sub_panel', border:true, layout:'fit', collapsible:true, height:260
			},{
				columnWidth:0.5,
				title:st3, baseCls:'xs-panel', iconCls:'sub_title', data:subid3, 
				cls:'sub_panel', border:true, layout:'fit', collapsible:true, height:260
			}]
		};
	config.param.items[2] = {
				title:st4, baseCls:'xs-panel', iconCls:'sub_title', data:subid4, 
				cls:'sub_panel', border:true, layout:'fit', collapsible:true, 
				collapsed:false, anchor:'100%', height:230
			};
};

//在form中显示5个明细表
JxUtil.showDevGridForFive = function(config, subid1, subid2, subid3, subid4,subid5) {
	//在GridNode.js中构建表格时不带边框，而且分页工具栏显示在顶部。
	var sd1 = Jxstar.findNode(subid1);
	sd1.showInForm = true; st1 = sd1.nodetitle;
	var sd2 = Jxstar.findNode(subid2);
	sd2.showInForm = true; st2 = sd2.nodetitle;
	var sd3 = Jxstar.findNode(subid3);
	sd3.showInForm = true; st3 = sd3.nodetitle;
	var sd4 = Jxstar.findNode(subid4);
	sd4.showInForm = true; st4 = sd4.nodetitle;
	var sd5 = Jxstar.findNode(subid5);
	sd5.showInForm = true; st5 = sd5.nodetitle;
	
	config.param.items[1] = {
			height:260,
			anchor:'100%',
			border:false,
			layout:'column',
			items:[{
				columnWidth:0.2,
				title:st1, baseCls:'xs-panel', iconCls:'sub_title', data:subid1, style:'padding-right:0;',
				cls:'sub_panel', border:true, layout:'fit', collapsible:true, height:260
			},{
				columnWidth:0.3,
				title:st2, baseCls:'xs-panel', iconCls:'sub_title', data:subid2, style:'padding-right:0;',
				cls:'sub_panel', border:true, layout:'fit', collapsible:true, height:260
			},{
				columnWidth:0.5,
				title:st3, baseCls:'xs-panel', iconCls:'sub_title', data:subid3, 
				cls:'sub_panel', border:true, layout:'fit', collapsible:true, height:260
			}]
		};
	config.param.items[2] = {
				title:st4, baseCls:'xs-panel', iconCls:'sub_title', data:subid4, 
				cls:'sub_panel', border:true, layout:'fit', collapsible:true, 
				collapsed:false, anchor:'100%', height:230
			};
	config.param.items[3] = {
		title:st5, baseCls:'xs-panel', iconCls:'sub_title', data:subid5, 
		cls:'sub_panel', border:true, layout:'fit', collapsible:true, 
		collapsed:false, anchor:'100%', height:230
	};
};
JxUtil.openTemWin = function(record,srcType) {
	var temId = record.get('dev_template__tem_id');
	var desCode = record.get('dev_task__des_code');
	var temCode = record.get('dev_template__tem_code');
	var chkmemo = record.get('dev_template__pro_chkmemo');
	//var proCode = record.get('dev_template__pro_code');
	var str = desCode + ' 制版号' + temCode;
	var fun_id='dev_pro_up';
	
	if(srcType==undefined){
		srcType="0";
	}
	if(srcType=="1"){
		fun_id="dev_tem_up";
	}
	var Datatem_type = Jxstar.findComboData('zblx');
	var contForm = new Ext.form.FormPanel({
			layout:'form', 
			labelAlign:'right',
			labelWidth:60,
			border:false, 
			baseCls:'x-plain',
			autoHeight: true,
			bodyStyle: 'padding: 10px 10px 0 10px;',
			defaults: {
				allowBlank: false,
				msgTarget: 'side'
			},
			items: [
			{xtype:'displayfield', fieldLabel:'设计号', name:'dev_task__des_code', value:str},
			{xtype:'combo', fieldLabel:'制版类型', name:'dev_template__tem_type',
				width:'80%', editable:false,
				store: new Ext.data.SimpleStore({
					fields:['value','text'],
					data: Datatem_type
				}),
				emptyText: jx.star.select,
				mode: 'local',
				triggerAction: 'all',
				valueField: 'value',
				displayField: 'text',
				value: 10
			},{xtype:'textarea', fieldLabel:'制版需求', name:'dev_template__tem_desc', 
				width:'90%', height:100, maxLength:1000,value:chkmemo
			}
			]
		});

	//创建对话框
	var win = new Ext.Window({
		title:'重新制版',
		layout:'fit',
		width:400,
		height:260,
		resizable: false,
		modal: true,
		closeAction:'close',
		items:[contForm],

		buttons: [{
			text:jx.base.ok,	//确定
			handler:function(){
				var form = contForm.getForm();
				if (!form.isValid()) {
					JxHint.alert('制版类型与制版需求必须填写！');
					return;
				}
				
				var temtype = form.get('dev_template__tem_type');
				var temdesc = form.get('dev_template__tem_desc');
				//请求参数
				var e = encodeURIComponent;
				var params = 'funid='+fun_id+'&pagetype=grid&eventcode=openTem';
					params += '&oldtemid='+ temId +'&temtype='+ temtype +'&temdesc='+ e(temdesc);
				
				var endcall = function(){
					win.close();
				};
				
				Request.postRequest(params, endcall);
			}
		},{
			text:jx.base.cancel,//取消
			handler:function(){win.close();}
		}]
	});
	win.show();
};

//点击按钮显示款式资料表单
JxUtil.showAllotTask = function(cols) {
	cols.insert(0, {col:
		{header:'资料', width:40, xtype:'actioncolumn', align:'center', items:[{
				icon: './resources/images/icons/button/showm.gif',
				tooltip: '查看款式资料',
				handler: function(grid, rowIndex, colIndex) {
					var funTab = grid.findParentByType('tabpanel');
					if (funTab) {
						var store = grid.getStore();
						grid.getSelectionModel().selectRow(rowIndex);
						
						var temId = store.getAt(rowIndex).get('dev_template__tem_id');
						funTab.showTask(temId, store, funTab);
					}
				}
			}]
		}
	});
};

//在表格中添加上传图片、删除图片、预览图片的列与方法
//picfield 不要带表名
JxUtil.colShowImage = function(cols, funid, picfield, picwidth, picheight) {
	var define = Jxstar.findNode(funid);
	var tablename = define.tablename;
	var pkcol = define.pkcol;
	picwidth = picwidth || 30;
	picheight = picheight || 30;
	
	//取图片的路径
	var showUrl = function(dataId) {
		var params = 'funid=sys_attach&pagetype=editgrid&eventcode=fdown';
		params += '&attach_field='+ picfield +'&dataid='+ dataId;
		params += '&table_name='+ tablename +'&datafunid='+ funid;
		
		var url = (JxAttach.uploadType == '1') ? JxAttach.uploadUrl : Jxstar.path;
		url += '/fileAction.do?' + params + '&dataType=byte&nousercheck=1&dc=' + (new Date()).getTime();
		return url;
	};
	
	//重新显示图片，不直接刷新所有数据，提高效率
	var reshow = function(grid, record) {
		var dataId = record.get(pkcol);
		var row = grid.getStore().indexOf(record);
		var cell = grid.getView().getCell(row, 2);
		if (cell) {
			var img = Ext.fly(cell).child('img', true);
			if (img) img.src = showUrl(dataId);
		}
	};
	//删除图片附件
	var delPic = function(grid) {
		var records = JxUtil.getSelectRows(grid);
		if (!JxUtil.selected(records)) return;
		var dataId = records[0].get(pkcol);
		
		var hdcall = function() {
			//上传参数
			var params = 'funid=sys_attach&pagetype=editgrid&eventcode=fdelete';
				params += '&attach_field='+ picfield +'&dataid='+ dataId;
				params += '&table_name='+ tablename +'&datafunid='+ funid;
				
			//清除图片信息
			var hdcall = function() {
				//重新加载数据
				//grid.getStore().reload();
				reshow(grid, records[0]);
			};
			
			//发送删除请求
			if (JxAttach.uploadType == '1') {//删除远程附件
				var url = JxAttach.uploadUrl + '/fileAction.do?' + params + '&nousercheck=1';
				Ext.fly('frmhidden').dom.src = url;
				//延时执行回调函数，index.jsp中的frmhidden.load事件会提示执行完成！
				JxUtil.delay(800, function(){
					hdcall();
				});
			} else {
				Request.postRequest(params, hdcall);
			}
		};
		
		//确定删除选择的记录吗？
		Ext.Msg.confirm(jx.base.hint, jx.event.delyes, function(btn) {
			if (btn == 'yes') hdcall();
		});
	};
	
	cols.insert(0, {col:
		{header:'删除', width:40, xtype:'actioncolumn', align:'center', items:[{
				icon: './resources/images/icons/button/imgdel.png',
				tooltip: '删除图片',
				handler: function(grid, rowIndex, colIndex) {
					var sm = grid.getSelectionModel();
					if (sm.selectRow) {
						sm.selectRow(rowIndex);
					} else {
						sm.select(rowIndex, colIndex);
					}
					delPic(grid);
				}
			}]
		}
	});
	
	cols.insert(0, {col:
		{header:'上传', width:40, xtype:'actioncolumn', align:'center', items:[{
				icon: './resources/images/icons/button/image.gif',
				tooltip: '上传图片',
				handler: function(grid, rowIndex, colIndex) {
					var sm = grid.getSelectionModel();
					if (sm.selectRow) {
						sm.selectRow(rowIndex);
					} else {
						sm.select(rowIndex, colIndex);
					}
					var ge = grid.gridNode.event;
					ge.addAttach(picfield);
				}
			}]
		}
	});
	
	cols.insert(0, {col:
		{header:'图片', width:picwidth+10, align:'center', 
			renderer: function(value, metaData, record) {
				var dataId = record.get(pkcol);

				JxUtil.showImage = function(img) {
					var el = Ext.get(img);
					if (el.toolTip) {el.toolTip.show(); return;}
					
					var url = showUrl(el.getAttribute('dataId'));
					var html = '<img src="'+ url +'">';
					var cfg = {
						target: el,
						autoWidth: true,
						autoHeight: true,
						html: html,
						anchor: 'left',//设置该参数，可以自动控制tip显示位置，防止图片被挡住
						dismissDelay: 15000
					};
					//IE下面tip显示错位，不能使用autoWidth参数
					if (Ext.isIE) {
						cfg.autoWidth = false;
						cfg.width = 50;
					}
					el.toolTip = new Ext.ToolTip(cfg);
					el.toolTip.show();
				};
				
				var html = '<img src="'+ showUrl(dataId) +'" dataId="'+ dataId +'" onmouseover="JxUtil.showImage(this);" style="width:'+ picwidth +'px; height:'+ picheight +'px; cursor:pointer;">';
				return html;
			}
		}
	});

};

JxUtil.wordWrap=function(val){
    return '<div style="white-space:normal !important;">'+ val +'</div>';
};
//field3=field1*field2；
JxUtil.mult = function(record, field1, field2, field3) {
	var value = record.get(field1) * record.get(field2);
	record.set(field3, value);
};
//field3=field1/field2
JxUtil.divc = function(record, field1, field2, field3) {
	var v2 = parseFloat(record.get(field2));
	if (v2 == 0 || isNaN(v2)) return;
	var v1 = parseFloat(record.get(field1));
	var value = parseFloat(v1 / v2).toFixed(2);
	record.set(field3, value);
};
//field3=field1+field2
JxUtil.fadd = function(record, field1, field2, field3) {
	var value = record.get(field1) + record.get(field2);
	record.set(field3, value);
};
//field3=
JxUtil.frate = function(record, field1, field2, field3) {
	var value = record.get(field1) *(1+record.get(field2)/100);
	record.set(field3, value);
};
JxUtil.furate = function(record, field1, field2, field3) {
	var value = record.get(field1) /(1+record.get(field2)/100);
	record.set(field3, value);
};
JxUtil.toFixedDecimal=function(record,unitField,valuefield){
	var unitValue = record.get(unitField);
	var len = parseInt(Jxstar.systemVar.sys__numdyn__len);
	var unitLen;
	if (unitValue && (typeof(Jxstar.UnitData) != 'undefined')) {
		for (var i = 0; i < Jxstar.UnitData.length; i++) {
			if (Jxstar.UnitData[i].unit_name == unitValue) {
				unitLen = Jxstar.UnitData[i].keep_num;
				break;
			}
		}
	}
	if (Ext.isEmpty(unitLen)) {
		var unitLen = isNaN(len) ? 2 : len;
	}
	var basenum = record.get(valuefield);
	if (Ext.isNumber(basenum)) {
		console.log(basenum);
		console.log( basenum.toFixed(unitLen));
		record.set(valuefield, basenum.toFixed(unitLen));
	}
};

JxUtil.excDetQry = function(form,myGrid,sql){//执行查询
		//构造明细查询语句
		var name, val, data = '  ', e = encodeURIComponent;
		var gridNode=myGrid.gridNode;
		
		form.fieldItems().each(function(f){
			name = f.name.replace('__', '.');
			val = f.getValue();
			val = Ext.isDate(val) ? val.dateFormat('Y-m-d H:i:s') : val;
			if (name != null && name.length > 0 && ( f.isDirty())) {
				if(f.xtype=='textfield'){
				data += " and " + (name) + " like '%" + (val) + "%'" ;
				}else {
					data += " and " + (name) + " = '" + (val) + "'" ;
				}
			}
		});
		data=sql.replace('@extsql@',data);
		var query=Array('','','');
		var queryType='0';
		//console.log(myGrid);
		if(myGrid.queryTypeBak){ 
			queryType=myGrid.queryTypeBak;			
		}
		if(myGrid.queryBak){ //Array('','','')
			query =myGrid.queryBak;
			query[0]=query[0]+' and ' +data;
		}else{
			query[0]=  data;
		}
		myGrid.extDetSql=data;
		
		Jxstar.myQuery(myGrid, query, queryType);
	},
	/**
		* private 创建明细查询对话框
		*
		**/
	JxUtil.detQryWindow=function(myGrid,sql,dets) {
		var formItems=new Array();
		var defH=120;
		if(dets.length>0){
			Ext.each(dets,function(item){
				var fi={xtype:'textfield', fieldLabel:item.field_lable, name:item.field_name, anchor:'100%', maxLength:50};
				formItems.push(fi);
			});
			defH=defH+30*dets.length;
		}else{
			JxHint.alert("没有设置查询明细");
		}
			var printForm = new Ext.form.FormPanel({
				id: 'node_det_qry',
				style: 'padding:30px;',
				border: false,
				frame: false,
				LabelAlign:'right',
				layout:'form',
				baseCls: 'x-plain',
				items: formItems
			});
			
			var form = printForm.getForm();
				
			var self = this;
			//创建对话框
			var win = new Ext.Window({
				title:	'明细查询',
				layout:'fit',
				width:300,
				height:defH,
				resizable: false,
				modal: true,
				closeAction:'close',
				items:[printForm],

				buttons: [{
					text:jx.base.ok,		//'确定'
					handler:function(){
						//数据校验
						if (!form.isValid()) {
							JxHint.alert(jx.event.datavalid);	//'请确保输入的数据正确完整！'
							return;
						}
						JxUtil.excDetQry(form,myGrid,sql);
						win.close();
					}
				},{
					text:jx.base.cancel,	//'取消'
					handler:function(){win.close();}
				}]
			});
			win.show();
		}
		
Ext.apply(JxUtil,{
	/**
	 * 同步加载js文件，加载后的文件为全局对象；
	 * public目录中的静态文件可以缓存，通过后台类压缩管理；
	 * url --  JS文件路径
	 * nocache -- 是否不使用缓存
	 **/
	loadJSCus: function(url, nocache) {
		//第1一个字符应该是/
		if (url.charAt(0) != '/') url = '/' + url;
		url = Jxstar.path + url;
		
		//不使用缓存时，加唯一标志
		if (nocache === true) {
			var dc = '?dc=' + (new Date()).getTime();
			url += dc;
		}
		try{
			var req = new XmlRequest('GET', url, false);
			req.send();
			var js = req.getText();
			if (window.execScript) {
			   window.execScript(js);
			} else {
			   window.eval(js);
			}
		}catch(e){
			//找不到文件，不做处理
			//alert(e)
		}
	}
});