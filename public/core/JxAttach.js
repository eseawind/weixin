/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 附件相关处理工具：
 * 1、表格记录附件浏览功能扩展。
 * 2、表单附件字段处理工具类。
 * 3、图片浏览控件扩展。
 * 
 * 远程附件管理存在的问题：
 * 1、表格附件标记功能都已实现远程预览；
 * 2、Form中的附件字段，不能支持上传远程附件的功能、查看与删除都没有问题；
 *    如果远程上传，则把附件字段设置为只读，且通过菜单按钮上传此字段中的图文附件；
 * 
 * @author TonyTan
 * @version 1.0, 2011-11-22
 */
JxAttach = {};

(function(){

	Ext.apply(JxAttach, {
		//附件管理模式设置、及URL设置
		uploadType: '0',
		uploadUrl: '',
		
		//在表格中添加附件列，此方法用在表格INC文件的第一行
		addAttachCol: function(cols, index) {
			//添加一列
			var item = {col:
				{header:'<div class="hd_attach" title="附件标志">&#160;</div>', width:22, name:'attachcol', 
					xtype:'actioncolumn', menuDisabled:true, align:'center', 
					renderer:function(){
						return '<div unselectable="on" class="x-grid3-cell-inner">&nbsp;</div>';
					}
				}
			};
			if (!index) index = 0;
			cols.insert(index, item);
		},
		
		//取表格中定义附件列序号
		getAttachColNum: function(grid) {
			var isCheck = grid.getSelectionModel() instanceof Ext.grid.CheckboxSelectionModel;
		
			var mycols = grid.gridNode.param.cols;
			for (var i = 0, n = mycols.length; i < n; i++) {
				if (mycols[i].col.name == 'attachcol') {
					//排除序号列与checkbox列
					return i + (isCheck ? 2:1);
				}
			}
			return -1;
		},
	
		//根据contentType取dsoframer程序的名称
		officeAppName: function(contentType) {
			if (contentType.indexOf('word') >= 0) {
				return 'Word.Document';
			} else if (contentType.indexOf('excel') >= 0 || contentType.indexOf('spreadsheetml.sheet') >= 0) {
				return 'Excel.Sheet';
			}
			
			return '';
		},
	
		//在线浏览office文档
		previewOffice: function(attachId, attachName, appName, tabPanel) {
			var objid = "objAttach_" + attachId;
			var tabid = 'tabAttach_' + attachId;
			var divid = "divAttach_" + attachId;
			
			//如果已经打开，则直接退出
			var tab = tabPanel.getComponent(tabid);
			if (tab) {
				tabPanel.activate(tab);
				return;
			}
			
			var div_html = '<div id="'+ divid +'" class="login_loading">'+
						'<img src="resources/images/jxstar32.gif" width="32" height="32"'+
						'style="margin-right:8px;float:left;vertical-align:bottom;"/>'+
						'<span id="loading-msg">正在加载'+ attachName +'...</span>'+
						'</div>';
			
			var url = Jxstar.path;
			if (JxAttach.uploadType == '1') {
				url = JxAttach.uploadUrl;
			}
			url += "/fileAction.do?funid=sys_attach&pagetype=editgrid&eventcode=down&nousercheck=1&dataType=byte&keyid="+attachId;
			var html = div_html + 
						'<OBJECT classid="clsid:00460182-9e5e-11d5-b7c8-b8269041dd57" id="'+ objid +'" '+
						'style="left:0px; top:0px; width:10px; height:10px" '+
						'viewastext codebase=lib/dso/dsoframer.ocx#version=2,2,0,8>'+
						'<PARAM NAME="_ExtentX" VALUE="6350">'+
						'<PARAM NAME="_ExtentX" VALUE="6350">'+
						'<PARAM NAME="_ExtentY" VALUE="6350">'+
						'<PARAM NAME="BorderColor" VALUE="-2147483632">'+
						'<PARAM NAME="BackColor" VALUE="-2147483643">'+
						'<PARAM NAME="ForeColor" VALUE="-2147483640">'+
						'<PARAM NAME="TitlebarColor" VALUE="-2147483635">'+
						'<PARAM NAME="TitlebarTextColor" VALUE="-2147483634">'+
						'<PARAM NAME="BorderStyle" VALUE="0">'+
						'<PARAM NAME="Titlebar" VALUE="0">'+
						'<PARAM NAME="Toolbars" VALUE="0">'+
						'<PARAM NAME="Menubar" VALUE="0">'+
						'</OBJECT>';
			
			var cfg = {
				id:tabid,
				pagetype:'formpic',
				title:'浏览-' + attachName,
				layout:'fit',
				border:false,
				closable:true,
				iconCls:'tab_form',
				html:html
			};
			tab = tabPanel.add(cfg);
			tabPanel.activate(tab);
			
			var obj = Ext.getDom(objid);
			obj.Open(url, true, appName);
			
			Ext.fly(divid).hide();
			Ext.fly(obj).setStyle({left:0, top:0, width:'100%', height:'100%'});
		},
		
		//在线浏览PDF文档，此OCX控件暂时不支持流文件
		previewPDF: function(attachId, attachName, tabPanel) {
			var objid = "objAttachPDF_" + attachId;
			var tabid = 'tabAttachPDF_' + attachId;
			
			//如果已经打开，则直接退出
			var tab = tabPanel.getComponent(tabid);
			if (tab) {
				tabPanel.activate(tab);
				return;
			}
			
			var url = Jxstar.path;
			if (JxAttach.uploadType == '1') {
				url = JxAttach.uploadUrl;
			}
			url += "/fileAction.do?funid=sys_attach&pagetype=editgrid&eventcode=down&nousercheck=1&dataType=byte&keyid="+attachId;
			var html = '<OBJECT classid="clsid:ca8a9780-280d-11cf-a24d-444553540000" id="'+ objid +'" '+
						'style="left: 0px; top: 0px; width: 100%; height: 100%" border="0">'+
						'<param name="src" value="'+ url +'">'+
						'</OBJECT>';
			
			var cfg = {
				id:tabid,
				pagetype:'formpic',
				title:'浏览-' + attachName,
				layout:'fit',
				border:false,
				closable:true,
				iconCls:'tab_form',
				html:html
			};
			tab = tabPanel.add(cfg);
			tabPanel.activate(tab);
		},
		
		//文档转换为SWF，远程在线浏览
		previewDoc: function(attachId, attachName, tabPanel) {
			var objid = "objAttachSWF_" + attachId;
			var tabid = 'tabAttachSWF_' + attachId;
			
			//如果已经打开，则直接退出
			var tab = tabPanel.getComponent(tabid);
			if (tab) {
				tabPanel.activate(tab);
				return;
			}
			
			var html = '<iframe frameborder="no" style="display:none;border-width:0;width:100%;height:100%;" ></iframe>'+
					   '<div class="nav_msg_notip">'+
							'<img src="resources/images/jxstar32.gif" width="32" height="32"'+
							'style="margin-right:8px;float:left;vertical-align:bottom;"/>'+
							'<span>正在加载文件...</span>'+
						'</div>';
			var cfg = {
				id:tabid,
				pagetype:'formpic',
				title:'浏览-' + attachName,
				layout:'fit',
				border:false,
				closable:true,
				iconCls:'tab_form',
				html:html
			};
			tab = tabPanel.add(cfg);
			tabPanel.activate(tab);
			
			JxAttach.loadDoc(attachId, attachName, tab);
		},
		//加载swf文件
		loadDoc: function(attachId, attachName, tab) {
			//{contentType:'', attachPath:''}
			var hdCall = function(data) {
				if (!data || !data.attachPath) {
					tab.getEl().child('div').hide();
					JxHint.alert('没有找到['+attachName+']的物理路径，不能预览！');
					return;
				}
				
				var path = data.attachPath;
				var type = data.contentType;
				var e = encodeURIComponent;
				var viewurl, servurl = Jxstar.systemVar.sys__attach__swfurl;
				
				if (type.indexOf('text') == 0) {
					viewurl = servurl + 'textview.jsp?filename='+ e(path);
				} else {
					//转换文档为swf并且返回文件名
					var convurl = servurl + 'swfconv.jsp?filepath='+ e(path) +'&filetype='+ e(type);
					var req = new XmlRequest('GET', convurl, false);
					req.send();
					var retstr = req.getText();
					//alert(retstr);
					
					var rets = retstr.split('&&');
					if (rets.length < 4 || rets[1] == 'false') {
						JxHint.alert('文件转换失败，不能预览！');
						return;
					}
					//文件显示页面
					viewurl = servurl + 'swfview.jsp?swfname='+ e(rets[2]);
				}
				
				//隐藏转换中提示
				tab.getEl().child('div').hide();
				
				var frm = tab.getEl().child('iframe');
				frm.dom.src = viewurl;
				frm.show();
				tab.show();
				tab.bwrap.show();
			};
			
			//从后台查询附件完整路径与名称
			var params = 'funid=sys_attach&pagetype=editgrid&eventcode=qrydoc&attachId='+ attachId;
			Request.dataRequest(params, hdCall);
		},
		//弹出窗口显示文件
		showDoc: function(attachId, attachName) {
			var html = '<iframe frameborder="no" style="display:none;border-width:0;width:100%;height:100%;" ></iframe>'+
					   '<div class="nav_msg_notip">'+
							'<img src="resources/images/jxstar32.gif" width="32" height="32"'+
							'style="margin-right:8px;float:left;vertical-align:bottom;"/>'+
							'<span>正在加载文件...</span>'+
						'</div>';
			var win = new Ext.Window({
				title: '浏览-' + attachName,
				layout: 'fit',
				width: 805,
				height: 550,
				constrainHeader: true,
				resizable: true,
				border: false,
				modal: true,
				closeAction: 'close',
				autoScroll: true,
				items:[{border:false, html:html}]
			});
			win.show();
			var tab = win.getComponent(0);
			
			JxAttach.loadDoc(attachId, attachName, tab);
		},
		
		//private 构建图片缩放工具栏
		imgZoomTool: function(imgCmp) {
			var resiz, imgel, oldw = 0, oldh = 0;
			//构建缩放比例数据
			var zooms = [];
			for (var i = 20; i <= 200; i += 20) {
				zooms[zooms.length] = [i, i];
			}
			zooms[zooms.length] = ['all', '全屏'];
			
			var tbar = new Ext.Toolbar({items:[
				{xtype:'tbtext', text:'缩放比例：'},
				{xtype:'combo', width:80, editable:false,
					store: new Ext.data.SimpleStore({
						fields:['value','text'], 
						data: zooms
					}),
					mode: 'local', triggerAction: 'all', valueField: 'value',
					displayField: 'text', value: 100,
					listeners:{select:function(s){
						if (!resiz || oldw == 0) return;
						var v = s.getValue(), w, h;
						if (v == 'all') {
							w = imgel.getWidth();
							h = imgel.getHeight();
						} else {
							w = parseInt(oldw) * parseInt(v) / 100;
							h = parseInt(oldh) * parseInt(v) / 100;
						}
						resiz.resizeTo(w, h);
					}}},
				{xtype:'tbtext', text:' %'}]
			});
			
			//延时添加图片缩放功能
			var delayFn = function(){
				imgel = imgCmp.getEl();
				resiz = new Ext.Resizable(imgel.child('img'), {
					wrap:true,
					pinned:true,
					minWidth:200,
					minHeight:100,
					preserveRatio:true,
					dynamic:true,
					handles:'all',
					draggable:true
				});
				
				//取图片原始大小
				oldw = resiz.getEl().getWidth();
				oldh = resiz.getEl().getHeight();
			};
			JxUtil.delay(1000, delayFn);
			
			return tbar;
		},
		
		//在线浏览图片
		previewImage: function(attachId, attachName, tabPanel) {
			var objid = "objAttachIMG_" + attachId;
			var tabid = 'tabAttachIMG_' + attachId;
			
			//如果已经打开，则直接退出
			var tab = tabPanel.getComponent(tabid);
			if (tab) {
				tabPanel.activate(tab);
				return;
			}
			
			var url = Jxstar.path;
			if (JxAttach.uploadType == '1') {
				url = JxAttach.uploadUrl;
			}
			url += "/fileAction.do?funid=sys_attach&pagetype=editgrid&eventcode=down&nousercheck=1&dataType=byte&keyid="+attachId;
			//支持查看高清图片
			var ishigh = Jxstar.systemVar.sys__attach__use_resize;
			if (ishigh == '1') {
				url += "&is_highimage=1";
			}
		
			var html = '<img src="'+ url +'">';
			var imgbox = new Ext.BoxComponent({
				border:false,
				html: html
			});
			
			var tbar = this.imgZoomTool(imgbox);
			var cfg = {
				id:tabid,
				pagetype:'formpic',
				title:'浏览-' + attachName,
				layout:'fit',
				border:true,
				closable:true,
				autoScroll:true,
				iconCls:'tab_form',
				tbar:tbar,
				items:[imgbox]
			};
			tab = tabPanel.add(cfg);
			tabPanel.activate(tab);
		},
		//弹出窗口显示图片
		showImage: function(attachId, attachName) {
			var url = Jxstar.path;
			if (JxAttach.uploadType == '1') {
				url = JxAttach.uploadUrl;
			}
			url += "/fileAction.do?funid=sys_attach&pagetype=editgrid&eventcode=down&nousercheck=1&dataType=byte&keyid="+attachId;
			//支持查看高清图片
			var ishigh = Jxstar.systemVar.sys__attach__use_resize;
			if (ishigh == '1') {
				url += "&is_highimage=1";
			}
		
			var html = '<img src="'+ url +'">';
			var imgbox = new Ext.BoxComponent({
				border:false,
				html: html
			});
			
			var tbar = this.imgZoomTool(imgbox);
			var win = new Ext.Window({
				title: '浏览-' + attachName,
				layout: 'fit',
				width: 805,
				height: 550,
				constrainHeader: true,
				resizable: true,
				border: false,
				modal: true,
				closeAction: 'close',
				autoScroll: true,
				tbar:tbar,
				items:[imgbox]
			});
			win.show();
		},
		
		//添加在线预览菜单
		previewMenu: function(data, tabPanel) {
			var previewFn, menu;
			//word，xls有预览功能
			var appName = JxAttach.officeAppName(data.content_type);
			if (Ext.isIE && appName.length > 0) {
				//不能直接使用外部变量
				previewFn = function(obj){
					var md = obj.initialConfig.data;
					var attachId = md.attach_id;
					var attachName = md.attach_name;
					var appName = JxAttach.officeAppName(md.content_type);
					JxAttach.previewOffice(attachId, attachName, appName, tabPanel);
				};
			}
			//PDF文件有预览功能，此OCX控件不支持流文件
			if (Ext.isIE && data.content_type == 'application/pdf') {
				previewFn = function(obj){
					var md = obj.initialConfig.data;
					var attachId = md.attach_id;
					var attachName = md.attach_name;
					JxAttach.previewPDF(attachId, attachName, tabPanel);
				};
			}
			//图片文件有预览功能，在Firefox中也可以浏览
			if (data.content_type.indexOf('image') == 0) {
				previewFn = function(obj){
					var md = obj.initialConfig.data;
					var attachId = md.attach_id;
					var attachName = md.attach_name;
					JxAttach.previewImage(attachId, attachName, tabPanel);
				};
			}
			
			if (previewFn) {
				menu = {items:[{
					text:'在线浏览', 
					data:data, handler:previewFn}
				]};
			}
			return menu;
		},
		previewTran: function(data, tabPanel) {
			var previewFn, menu;
			var type = data.content_type;
			//图片文件有预览功能，在Firefox中也可以浏览
			if (type.indexOf('image') == 0) {
				previewFn = function(obj){
					var md = obj.initialConfig.data;
					var attachId = md.attach_id;
					var attachName = md.attach_name;
					JxAttach.previewImage(attachId, attachName, tabPanel);
				};
			} else if (JxAttach.isDocs(data.attach_name) || type.indexOf('text') == 0) {
				previewFn = function(obj){
					var md = obj.initialConfig.data;
					var attachId = md.attach_id;
					var attachName = md.attach_name;
					JxAttach.previewDoc(attachId, attachName, tabPanel);
				};
			}
			
			if (previewFn) {
				menu = {items:[{
					text:'在线浏览', 
					data:data, handler:previewFn}
				]};
			}
			return menu;
		},
		//是office或者pdf
		isDocs: function(fname) {
			var ext = '';
			var lasti = fname.lastIndexOf('.');
			if (lasti >= 0) ext = fname.substr(lasti+1);
			if (ext == 'pdf' || ext == 'doc' || ext == 'docx' || 
				ext == 'xls' || ext == 'xlsx' || ext == 'ppt' || ext == 'pptx') {
				return true;
			}
			return false;
		},
		
		//在附件明细表中，采用弹出窗口的方式显示文档
		showWinDoc: function(g, rowi, coli, e) {
			var cm = g.getColumnModel();
			var colname = cm.getColumnId(coli);
			if (colname.indexOf('__attach_name') < 0 && colname.indexOf('__attach_path') < 0) return;
			
			var t = e.getTarget();
			if (t.tagName.toLowerCase() != 'a') return;
			
			var rec = g.getStore().getAt(rowi);
			var attachid = rec.get('sys_attach__attach_id');
			var attachname = rec.get('sys_attach__attach_name');
			var contenttype = rec.get('sys_attach__content_type');
			
			var downfile = function(attachid) {
				var params = 'funid=sys_attach&keyid='+ attachid +'&pagetype=editgrid&eventcode=down';
				
				if (Jxstar.systemVar.uploadType == '1') {
					var url = Jxstar.systemVar.uploadUrl + '/fileAction.do?' + params + '&dataType=byte&nousercheck=1';
					Ext.fly('frmhidden').dom.src = url;
				} else {
					Request.fileDown(params);
				}
			};
			var viewfile = function(attachid, attachname, contenttype) {
				if (contenttype.indexOf('image') >= 0) {
					JxAttach.showImage(attachid, attachname);
				} else if (JxAttach.isDocs(attachname) || contenttype.indexOf('text') == 0) {
					JxAttach.showDoc(attachid, attachname);
				}
			};
			
			var usepre = Jxstar.systemVar.sys__attach__swfpre || '0';
			if (usepre == '1' && (contenttype.indexOf('image') >= 0 || 
				JxAttach.isDocs(attachname) || 
				contenttype.indexOf('text') == 0)) {
				var menu = new Ext.menu.Menu({items:[
					{text:'下载', data:attachid, handler:function(){downfile(attachid);}},
					{text:'在线浏览', data:attachid, handler:function(){viewfile(attachid, attachname, contenttype);}}
				]});
				menu.show(t);
			} else {
				downfile(attachid);
			}
		},
	
		//表格中有附件的记录，添加附件标志
		viewAttachFlag: function(grid) {
			if (grid == null) return;
			//附件管理类型与集中管理路径
			JxAttach.uploadType = Jxstar.systemVar.uploadType;
			JxAttach.uploadUrl = Jxstar.systemVar.uploadUrl;
			
			//父页面控件
			var tabPanel = grid.findParentByType('tabpanel');
			var attachColNum = JxAttach.getAttachColNum(grid);
			
			//如果定义了附件列，或者标识了需要显示附件，则处理附件标志显示
			if (!(attachColNum >= 0 || grid.isShowAttach == true)) return;
			if (attachColNum < 0) attachColNum = 0;
			
			var store = grid.getStore();
			var cnt = store.getCount();
			if (cnt == 0) return;
			
			var define = grid.gridNode.define;
			
			//组织机构与用户的附件不显示
			if (define.tablename == 'sys_dept' || define.tablename == 'sys_user') return;
			
			var pkcol = define.pkcol;
			var pks = '';
			for (var i = 0; i < cnt; i++) {
				var record = store.getAt(i);
				pks += record.get(pkcol) + ',';
			}
			pks = pks.substr(0, pks.length-1);
			//alert('pks=' + pks);
			var hdCall = function(data) {
				if (data.length == 0) return;
				
				var attachs = [], mitems = [];
				var rownum = -1;
				for (var i = 0; i < data.length; i++) {
					var row_num = parseInt(data[i].row_num);
					var data_id = data[i].data_id;
					var attach_id = data[i].attach_id;
					var attach_name = data[i].attach_name;
					var content_type = data[i].content_type;
					var is_relat = data[i].is_relat;
					
					//如果不是同一条记录的附件，则新建菜单
					if (rownum != row_num) {
						mitems = [];
					}
					
					//构建附件菜单
					var cfg = {
						id:attach_id,
						text:attach_name,
						handler:function(){
							var params = 'funid=sys_attach&keyid='+ this.id +'&pagetype=editgrid&eventcode=down';
							//发送下载请求
							if (JxAttach.uploadType == '1') {
								var url = JxAttach.uploadUrl + '/fileAction.do?' + params + '&dataType=byte&nousercheck=1';
								Ext.fly('frmhidden').dom.src = url;
							} else {
								Request.fileDown(params);
							}
						}
					};
					//如果是关联附件，则显示红色字体
					if (is_relat == '1') {
						cfg.style = {color: 'red'};
					}
					
					//处理office文件与pdf文件的预览
					var menu, useswf = Jxstar.systemVar.sys__attach__swfpre || '0';
					if (useswf == '1') {
						menu = JxAttach.previewTran(data[i], tabPanel);
					} else {
						menu = JxAttach.previewMenu(data[i], tabPanel);
					}
					if (menu) cfg.menu = menu;
					//添加附件菜单
					mitems[mitems.length] = cfg;
					//如果不是同一条记录的附件，则新建菜单
					if (rownum != row_num) {
						rownum = row_num;
						
						var td = grid.getView().getCell(row_num, attachColNum);
						Ext.fly(td.firstChild).addClass('flag_attach');
						
						//把菜单配置对象保存起来
						var tdel = Ext.get(td);
						tdel.myitems = mitems;
						
						tdel.on('click', function(){
							var menu = new Ext.menu.Menu({items:[this.myitems]});
							menu.on('hide', function(m){
								m.myitems = null;
								m.destroy();
							});
							menu.show(this);
						});
					}
				}
			};
			
			//是否添加关联附件
			var is_queryrelat = grid.isQueryRelat || '0';
			var relat = Jxstar.systemVar.sys__attach__relat || '0';
			if (relat != '1') is_queryrelat = '0';
			
			//从后台查询任务信息
			var params = 'funid=queryevent&pagetype=grid&eventcode=query_attach';
				params += '&tablename='+ define.tablename +'&keyids='+ pks + '&is_queryrelat=' + is_queryrelat;
				
			//是否只显示某类附件
			var attachtype = grid.queryAttachType;
			if (attachtype) {
				params += '&attach_type=' + attachtype;
			}
			Request.dataRequest(params, hdCall);
		},
	
		/********************下面的方法是用于表单附件字段********************/
		//public 表格提交时判断必填附件是否有上传
		checkGrid: function(grid) {
			var records = JxUtil.getSelectRows(grid);
			if (!JxUtil.selected(records)) return;
			
			var tabPanel = grid.findParentByType('tabpanel');
			if (tabPanel == null) return;
			
			var formTab = tabPanel.getComponent(1);
			if (formTab == null) return;
			var formPanel = formTab.getComponent(0);
			if (formPanel == null || formPanel.isXType('form') == false) return;
			var fields = formPanel.findByType('fileuploadfield');
			if (fields == null || fields.length == 0) return;
			
			//根据表单中的必填标记判断表格中的数据
			for(var j = 0; j < records.length; j++) {
				var data = records[j];
				for(var i = 0; i < fields.length; i++) {
					var f = fields[i];
					if (f.allowBlank == false) {
						var val = data.get(f.name);
						if (val == null || val.length == 0) {
							JxHint.alert('【' + f.fieldLabel + '】栏目没有上传附件，不能提交！');
							return false;
						}
					}
				}
			}
		},
	
		//public 检查附件字符是否必填且没有上传附件
		checkAttach: function(form) {
			var fields = form.findByType('fileuploadfield');
			if (fields == null || fields.length == 0) return true;
			
			for(var i = 0; i < fields.length; i++) {
				var f = fields[i];
				if (f.allowBlank == false) {
					var val = f.getValue();
					if (val == null || val.length == 0) {
						JxHint.alert('【' + f.fieldLabel + '】栏目没有上传附件，不能提交！');
						return false;
					}
				}
			}
			return true;
		},
		
		//public 选择附件前判断，如果是已签字的记录不能调整
		beforeChange: function(fileField) {
			if (fileField.disabled) return;
			var param = JxAttach.attachParam(fileField, '');
			if (param == null) return;
			
			var form = param.form;
			var dataId = form.get(param.define.pkcol);
			if (dataId == null || dataId.length == 0) {
				JxHint.alert(jx.event.nosave);
				return false;
			}
			
			//设置业务状态值
			var audit0 = '0', audit6 = '6';
			if (param.define.status) {
				audit0 = param.define.status['audit0'];
			}
			var audit = audit0;
			if (param.define.auditcol.length > 0) {
				audit = form.get(param.define.auditcol);
			}
			if (audit != audit0 && audit != audit6) {
				JxHint.alert('业务记录已提交，不能修改附件！');
				return false;
			}
		},
	
		//public 表单中的附件控件显示附件方法
		showAttach: function(mya) {
			if (mya == null || mya.parentNode == null) return;
			var fileField = Ext.getCmp(mya.parentNode.id);
			if (fileField == null) return;
			
			var param = JxAttach.attachParam(fileField, 'fdown');
			if (param == null) return;
			
			//发送下载请求
			if (JxAttach.uploadType == '1') {
				var url = JxAttach.uploadUrl + '/fileAction.do?' + param.params + '&dataType=byte&nousercheck=1';
				Ext.fly('frmhidden').dom.src = url;
			} else {
				Request.fileDown(param.params);
			}
		},
		
		//public 表单中的附件控件删除附件方法
		deleteAttach: function(mya) {
			if (mya == null || mya.parentNode == null) return;
			var fileField = Ext.getCmp(mya.parentNode.id);
			if (fileField == null) return;
			if (fileField.disabled) return;
			
			var hdcall = function() {
				var param = JxAttach.attachParam(fileField, 'fdelete');
				if (param == null) return;
				//设置业务状态值
				var audit0 = '0', audit6 = '6';
				if (param.define.status) {
					audit0 = param.define.status['audit0'];
				}
				var audit = audit0;
				if (param.define.auditcol.length > 0) {
					audit = param.form.get(param.define.auditcol);
				}
				if (audit != audit0 && audit != audit6) {
					JxHint.alert('业务记录已提交，不能删除附件！');
					return false;
				}
				//清除附件字段值
				var hdcall = function() {
					fileField.setValue('');
					if (!Ext.isEmpty(param.form.myRecord)) {
						param.form.myRecord.set(fileField.name, '');
						param.form.myRecord.commit();
					}
				};
				
				//发送删除请求
				if (JxAttach.uploadType == '1') {//删除远程附件
					var url = JxAttach.uploadUrl + '/fileAction.do?' + param.params + '&nousercheck=1';
					Ext.fly('frmhidden').dom.src = url;
					//延时执行回调函数，index.jsp中的frmhidden.load事件会提示执行完成！
					JxUtil.delay(800, function(){
						hdcall();
					});
				} else {
					Request.postRequest(param.params, hdcall);
				}
			};
			
			//确定删除选择的记录吗？
			Ext.Msg.confirm(jx.base.hint, jx.event.delyes, function(btn) {
				if (btn == 'yes') hdcall();
			});
		},
		
		//public 保存表单中的附件信息
		saveAttach: function(fileField) {
			if (fileField.disabled) return;
			var param = JxAttach.attachParam(fileField, 'fcreate');
			if (param == null) return;
			
			var form = param.form;
			var dataId = form.get(param.define.pkcol);
			if (dataId == null || dataId.length == 0) {
				JxHint.alert(jx.event.nosave);
				return false;
			}
			
			var hdcall = function() {
				if (!Ext.isEmpty(form.myRecord)) {
					form.myRecord.set(fileField.name, fileField.getValue());
					form.myRecord.commit();
				}
			}
			//上传附件
			var params = param.params + '&attach_name='+ encodeURIComponent(fileField.getValue());
			Request.fileRequest(form, params, hdcall, fileField);
		},
		
		//private 公共参数处理
		attachParam: function(fileField, eventCode) {
			//取到表单相关信息
			var fileForm = fileField.findParentByType('form');
			if (Ext.isEmpty(fileForm)) {
				JxHint.alert('没有找到Form表单对象，不能上传附件！');
				return;
			}
			
			var form = fileForm.getForm();
			var define = fileForm.formNode.define;
			
			var nodeId = define.nodeid;
			var tableName = define.tablename;
			var dataId = form.get(define.pkcol);
			if (Ext.isEmpty(dataId)) {
				JxHint.alert(jx.event.nosave);
				return;
			}
			var fieldName = fileField.name.split('__')[1];
			
			//上传参数
			var params = 'funid=sys_attach&pagetype=editgrid&eventcode='+ eventCode;
				params += '&attach_field='+ fieldName +'&dataid='+ dataId;
				params += '&table_name='+ tableName +'&datafunid='+ nodeId;
		
			return {form:form, params:params, define:define};
		}
		
	});//Ext.apply

})();

/**
 * 下面的处理图片浏览的工具类。
 * 
 **/
var ImageShower = function(config){
		this.config = config;
};

ImageShower.prototype = {
	lookup : {},
	
	show: function() {
		this.initTemplates();
		this.store = new Ext.data.JsonStore({
			url: this.config.url,
			root: 'data',
			fields: [
				'name', 'url', 'title'
			],
			listeners: {
				'load': {fn:function(){ this.view.select(0); }, scope:this, single:true}
			}
		});
		this.store.load();
		
		var formatData = function(data){
			data.shortName = Ext.util.Format.ellipsis(data.title, 15);
			data.sizeString = '34';//formatSize(data);
			data.dateString = new Date().format("m/d/Y g:i a");
			this.lookup[data.name] = data;
			return data;
		};
		
		this.view = new Ext.DataView({
			store: this.store,
			tpl: this.thumbTemplate,
			singleSelect: true,
			autoHeight:true,
			overClass:'x-view-over',
			itemSelector:'div.thumb-wrap',
			emptyText: 'No images to display',

			prepareData: formatData.createDelegate(this),
			
			listeners: {
				'selectionchange': {fn:this.showDetails, scope:this, buffer:100},
				'loadexception'  : {fn:this.onLoadException, scope:this},
				'beforeselect'   : {fn:function(view){
					return view.store.getRange().length > 0;
				}}
			}
		});
		
		var imgZoomTool = function(tabpanel) {
			//构建缩放比例数据
			var zooms = [];
			for (var i = 20; i <= 200; i += 20) {
				zooms[zooms.length] = [i, i];
			}
			zooms[zooms.length] = ['all', '全屏'];
			
			var tbar = new Ext.Toolbar({items:[
				{xtype:'tbtext', text:'缩放比例：'},
				{xtype:'combo', width:80, editable:false, name:'zoomvalue',
					store: new Ext.data.SimpleStore({
						fields:['value','text'], 
						data: zooms
					}),
					mode: 'local', triggerAction: 'all', valueField: 'value',
					displayField: 'text', value: 100,
					listeners:{select:function(s){
						var imgel = tabpanel.items.last().getComponent(1).body;
						var resiz = imgel.resiz;
					
						if (!resiz || resiz.oldw == 0) return;
						var v = s.getValue(), w, h;
						if (v == 'all') {
							w = imgel.getWidth();
							h = imgel.getHeight();
						} else {
							w = parseInt(resiz.oldw) * parseInt(v) / 100;
							h = parseInt(resiz.oldh) * parseInt(v) / 100;
						}
						resiz.resizeTo(w, h);
					}}},
				{xtype:'tbtext', text:' %'}]
			});
			return tbar;
		};
		var tbar = imgZoomTool(this.config.parentCtl);
		var tabid = 'images-view';
		//如果存在，则先删除
		var panel = this.config.parentCtl.getComponent(tabid);
		if (panel) {
			var dv = panel.getComponent(0);
			dv.removeAll(true);
			dv.add(this.view);
		} else {
			var cfg = {
				id:tabid,
				pagetype:'formpic',
				title:'图片浏览',
				layout: 'border',
				border:false,
				closable: true,
				iconCls:'tab_form',
				items:[{
					id: 'img-chooser-view',
					region: 'west',
					split: true,
					width: 160,
					minWidth: 160,
					maxWidth: 300,
					border:false,
					autoScroll: true,
					items: this.view
				},{
					id: 'img-detail-panel',
					border:false,
					region: 'center',
					autoScroll: true,
					tbar:tbar
				}]
			};
			panel = this.config.parentCtl.add(cfg);
		}
		
		return panel;
	},
	
	initTemplates : function(){
		this.thumbTemplate = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="thumb-wrap" id="{name}">',
				'<div class="thumb"><img src="{url}" title="{title}"></div>',
				'<span>{shortName}</span></div>',
			'</tpl>',
			'<div class="x-clear"></div>'
		);
		this.thumbTemplate.compile();

		this.detailsTemplate = new Ext.XTemplate(
			'<div class="details">',
				'<tpl for=".">',
					'<img src="{url}"> ',//style="width:100%;height:100%;" 显示原图大小
				'</tpl>',
			'</div>'
		);
		this.detailsTemplate.compile();
	},
	
	showDetails : function(){
		var selNode = this.view.getSelectedNodes();
		var imgCmp = Ext.getCmp('img-detail-panel');
		var detailEl = imgCmp.body;
		if(selNode && selNode.length > 0){
			selNode = selNode[0];
			var data = this.lookup[selNode.id];
			//支持显示高清图片
			if (data.url.indexOf('is_highimage') < 0) {
				data.url = data.url + '&is_highimage=1';
			}
			detailEl.hide();
			this.detailsTemplate.overwrite(detailEl, data);
			detailEl.slideIn('l', {stopFx:true,duration:.2});
			//设置显示比例100
			imgCmp.getTopToolbar().get(1).setValue(100);
			
			JxUtil.delay(500, function(){
				var imgel = detailEl.child('img');
				var resiz = new Ext.Resizable(imgel, {
					wrap:true,
					pinned:true,
					minWidth:200,
					minHeight:100,
					preserveRatio:true,
					dynamic:true,
					handles:'all',
					draggable:true
				});
				resiz.oldw = resiz.getEl().getWidth();
				resiz.oldh = resiz.getEl().getHeight();
				//方便工具栏取到此缩放对象
				detailEl.resiz = resiz;
			});
		}else{
			detailEl.update('');
		}
	},

	onLoadException : function(v,o){
		this.view.getEl().update('<div style="padding:10px;">Error loading images.</div>');
	}
};