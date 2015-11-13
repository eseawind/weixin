/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 公共方法工具类。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */
JxUtil = {};

(function(){

	Ext.apply(JxUtil, {
		//是否系统退出标志，防止浏览器的刷新事件
		isLogout: false,
		/**
		 * 退出系统，删除当前用户的会话
		 **/
		logout: function(isF5) {
			var hdcall = function() {
				//退出后再刷新，如果把reload放到回调函数外，IE中向后退发送的请求参数为空
				var params = 'funid=login&pagetype=login&eventcode=logout';
				Request.postRequest(params, function(){
					JxUtil.isLogout = true;
					window.location.href = Jxstar.logoutUrl || Jxstar.path;
				});
			};
			//如果是通过刷新退出系统
			if (isF5 == true) {return;}//hdcall(); 先不退出系统，影响操作
			
			//确定退出系统吗？
			Ext.Msg.confirm(jx.base.hint, jx.base.logoutok, function(btn) {
				if (btn == 'yes') hdcall();
			});
		},
		
		/**
		 * 把功能菜单添加到权限数组中
		 **/
		putRightNodes: function(menuJson) {
			for (var i = 0; i < menuJson.length; i++) {
				var oneModule = menuJson[i];
				for (var j = 0; j < oneModule.children.length; j++) {
					var towModule = oneModule.children[j];
					for (var k = 0; k < towModule.children.length; k++) {
						var threeModule = towModule.children[k];
						//保存授权的功能ID
						Jxstar.rightNodes.push(threeModule.id);
					}
				}
			}
		},
		
		/**
		* 构建新的主键值
		*/
		getId : function() {
			var t = (new Date()).getTime();
			t++;
			return 'jx-'+t;
		},
		
		/**
		 * 显示当前在线用户
		 **/
		onLineUser: function() {
			var hdcall = function(grid) {
				Jxstar.loadInitData(grid);
			};
			var define = Jxstar.findNode('sys_user_login');
			Jxstar.showData({
				filename: define.gridpage,
				title: define.nodetitle,
				//pagetype: 'notool',
				width: 360,
				height: 450,
				callback: hdcall
			});
		},
		
		/**
		 * 动态加载图表控件，如果存在就不加载了
		 **/
		loadHighCharts: function() {
			if (typeof HighchartsAdapter == 'undefined') {
				JxUtil.loadJS('/lib/highcharts/js/adapters/standalone-framework.js');
				JxUtil.loadJS('/lib/highcharts/js/highcharts.jsgz');
				JxUtil.loadJS('/lib/highcharts/js/highcharts-more.js');
				JxUtil.loadJS('/public/core/JxChart.js', true);
				//JxUtil.loadJS('/lib/highcharts/js/modules/exporting.js');
			}
		},
	
		/**
		 * 动态加载功能定义数据：
		 * 如果在网速比较慢时使用会影响加载速度，直接放到index_top中了，不使用此方法了。
		 **/
		loadJxData: function() {
			Ext.fly('loading').dom.innerHTML = '正在加载功能数据文件...';
			Ext.fly('loading').show();
			JxUtil.loadJS('/public/data/NodeDefine.js', true);
			JxUtil.loadJS('/public/data/RuleData.js', true);
			JxUtil.loadJS('/public/locale/combo-lang-'+ JxLang.type +'.js', true);
			Ext.fly('loading').hide();
		},
	
		/**
		 * 动态加载图形库文件
		 * hdcall --  加载图形库后执行的函数
		 **/
		loadJxGraph: function() {
			if (!window.mxClient) {
				var fileName = 'mxclient-ff.jsgz';
				if (Ext.isIE) {
					fileName = 'mxclient-ie.jsgz';
				} else if (Ext.isChrome) {
					fileName = 'mxclient-ch.jsgz';
				}
				//用eval方法在ie中加载报错，用execScript没问题
				JxUtil.loadJS('/lib/graph/js/' + fileName);
				window.mxClient = mxClient;
			}
		},
		
		/**
		 * 同步加载js文件，加载后的文件为全局对象；
		 * public目录中的静态文件可以缓存，通过后台类压缩管理；
		 * url --  JS文件路径
		 * nocache -- 是否不使用缓存
		 **/
		loadJS: function(url, nocache) {
			//第1一个字符应该是/
			if (url.charAt(0) != '/') url = '/' + url;
			url = Jxstar.path + url;
			
			//不使用缓存时，加唯一标志
			if (nocache === true) {
				var dc = '?dc=' + (new Date()).getTime();
				url += dc;
			}
			
			var req = new XmlRequest('GET', url, false);
			req.send();
			var js = req.getText();
			if (window.execScript) {
			   window.execScript(js);
			} else {
			   window.eval(js);
			}
		},
		
		/**
		 * 动态加载css文件
		 * url --  css文件路径
		 * nocache -- 是否不使用缓存
		 **/
		loadCss: function(url, nocache) {
			//第1一个字符应该是/
			if (url.charAt(0) != '/') url = '/' + url;
			url = Jxstar.path + url;
			
			//不使用缓存时，加唯一标志
			if (nocache === true) {
				var dc = '?dc=' + (new Date()).getTime();
				url += dc;
			}
			
			var element = document.createElement("link");   
			element.setAttribute('rel','stylesheet');   
			element.setAttribute('type','text/css');   
			element.setAttribute('href',url);   
			document.getElementsByTagName('head')[0].appendChild(element);   
		},
		
		/**
		 * 封装eval脚本方法，防止脚本崩溃；
		 * 在IE中用Request.loadJS，使用execScript加载页面文件时报错
		 * js -- 脚本代码
		 * executed -- 脚本代码是一个函数，是否需要立即执行
		 **/
		/*eval: function(js, executed) {
			var fn;
			try{
				if (window.execScript) {
					fn = window.execScript(js);
				} else {
					fn = window.eval(js);
				}
				
				if (executed) fn = fn();
			}catch(e){
				JxHint.alert(e + ':' + js);
				return;
			}
			return fn;
		},*/
		
		//当前用户是否管理员
		isAdminUser: function(){
			var roleId = Jxstar.session['role_id'];
			return (roleId.indexOf('admin') >= 0);
		},
		
		//选择第一行，并返回选择的记录，如果原来有选择记录，则返回原来选择的记录
		firstRow: function(grid) {
			if (!grid) return [];
			
			var records = JxUtil.getSelectRows(grid);
			if (records.length > 0) return records;
			
			var s = grid.getStore();
			var cnt = s.getCount();
			if (cnt == 0) return [];
			
			var sm = grid.getSelectionModel();
			if (sm.getSelections) {
				sm.selectFirstRow();
			} else {
				sm.select(0, 0);
			}
			return [s.getAt(0)];
		},
		
		//检查当前表格中选择的记录的值必填项及长度是否有效
		validateGrid: function(grid) {
			//取第二个Tab的表单
			var isReqCheck = true, myForm = null;
			if (grid.isXType('editorgrid') == false) {
				var f = JxUtil.getMyForm(grid);
				if (f) {
					myForm = f.getForm();
				} else {
					//如果是普通表格，又没有找到表单对象
					isReqCheck = false;
				}
			}
			
			if (isReqCheck == false) return true;
			
			var cm = grid.getColumnModel();
			var records = JxUtil.getSelectRows(grid);
			for (var i = 0; i < records.length; i++) {
				var record = records[i];
				var fields = record.fields.keys;
				for (var j = 0; j < fields.length; j++) {
					var name = fields[j];
					var value = record.data[name];
					if (value == null) value = '';

					//如果可编辑表格，则取表格字段，否则取表单字段
					var field = null;
					if (grid.isXType('editorgrid')) {
						var colIndex = cm.findColumnIndex(name);
						var rowIndex = grid.getStore().indexOfId(record.id);
						var editor = cm.getCellEditor(colIndex, rowIndex);
						if (editor) field = editor.field;
					} else {
						if (myForm) {
							field = myForm.findField(name);
						}
					}
					
					if (field != null && !field.validateValue(value)) {
						var index = grid.getStore().indexOf(record);
						var label = cm.getColumnHeader(cm.findColumnIndex(name));
						var hint = String.format(jx.event.auditvalid, index+1, label);
						JxHint.alert(hint);	//第【{0}】条记录的【{1}】数据不完整！
						return false;
					}
				}
			}
			return true;
		},
		
		//提交前，检查子表数据是否保存
		checkSubGrid: function(fpage) {
			//取明细表的panel
			var subps = fpage.subgrids;
			if (subps == null || subps.length == 0) return true;
			
			for (var i = 0; i < subps.length; i++) {
				var subgrid = subps[i].getComponent(0);
				if (subgrid.isXType('grid')) {
					var store = subgrid.getStore();
					var mrow = store.getModifiedRecords();
					if (mrow.length > 0) {
						JxHint.alert(subps[i].title + '：子表数据没有保存，不能执行此操作！');
						return false;
					}
				}
			}
			return true;
		},
		
		//添加附件类型控件，增加index参数方便设置初始显示类型
		addAttachCombo: function(grid, combocode, index) {
			index = index || 0;
			grid.attachTypeCombo = function() {
				var typedata = Jxstar.findComboData(combocode);
				return {
					anchor:'60%',
					xtype:'combo',
					name:'attach_type_combo',
					fieldLabel:'资料类型',
					store: new Ext.data.SimpleStore({
						fields:['value','text'],
						data: typedata
					}),
					emptyText: jx.star.select,
					mode: 'local',
					triggerAction: 'all',
					valueField: 'value',
					displayField: 'text',
					editable:false,
					value: typedata[index][0]
				};
			};
		},
		
		//根据表格取表单对象
		getMyForm: function(myGrid) {
			var tabPanel = myGrid.findParentByType('tabpanel');
			if (tabPanel == null) return null;
			if (tabPanel.getComponent(1) == null) return null;
			
			var formPanel = tabPanel.getComponent(1).getComponent(0);
			if (formPanel == null || !formPanel.isXType('form')) {
				return null;
			}
			return formPanel;
		},
		
		//根据表单取表格对象
		getMyGrid: function(myForm) {
			//取到tab控件，而后取第一个页面中的表格
			var tabPanel = myForm.findParentByType('tabpanel');
			if (!tabPanel || tabPanel.isXType('tabpanel') == false) {
				return;
			}
			
			var grid = tabPanel.getComponent(0).getComponent(0);
			if (!grid || grid.isXType('grid') == false) {
				return;
			}
			
			return grid;
		},
		
		//在功能区域的表单或子表中取得父功能的表格
		getParentGrid: function(childCmp) {
			if (!childCmp) return;
			//增加参数parentGrid，方便在复杂布局中自定义父表格
			var pg = childCmp.parentGrid;
			if (pg && pg.isXType('grid')) return pg;
			
			//取到tab控件，而后取第一个页面中的表格
			var tabPanel = childCmp.findParentByType('tabpanel');
			if (!tabPanel || tabPanel.isXType('tabpanel') == false) {
				return;
			}
			
			var grid = tabPanel.getComponent(0).getComponent(0);
			if (!grid || grid.isXType('grid') == false) {
				return;
			}
			
			return grid;
		},
		
		//根据form在的子表取到父form对象
		getParentForm: function(subGrid) {
			var form = subGrid.findParentByType('form');
			if (Ext.isEmpty(form)) {
				var tabPanel = subGrid.findParentByType('tabpanel');
				if (!tabPanel) return null;
				
				var pform = tabPanel.getComponent(1);
				if (!pform) return null;
				
				form = pform.getComponent(0);
				if (!form || form.isXType('form') == false) return null;
			}
			
			return form.getForm();
		},
		
		//在功能区域的表格或表单中取到布局页面中的树形控件
		getLayoutTree: function(childCmp) {
			//取到tab控件，再取上级容器对象
			var tabPanel = childCmp.findParentByType('tabpanel');
			if (!tabPanel || tabPanel.isXType('tabpanel') == false) return null;
			
			//左边第一个子控件是树
			var tree = tabPanel.ownerCt.ownerCt.getComponent(0).getComponent(0);
			if (!tree || tree.isXType('treepanel') == false) return null;
			
			return tree;
		},
		
		//给树形控件添加本级选项
		treeAddCheck: function(tree) {
			if (!tree) return;
			var tool = tree.getTopToolbar();
			var tools = tree.getTopToolbar().find('xtype', 'checkbox');
			if (tools.length > 0) return;
			
			tool.insert(1, '->');
			tool.insert(2, {xtype:'checkbox', boxLabel:'本级'});
			tool.doLayout();
		},
		
		//显示表格合计数据在分页工具栏中
		viewSumData: function(grid) {
			var bbar = grid.getBottomToolbar();
			if (!bbar) return;
			
			var sumdata = grid.getStore().reader.jsonData.data.sum;
			if (Ext.isEmpty(sumdata)) return;
			sumdata = sumdata[0];
			
			var cm = grid.getColumnModel();
			var sumText = '合计：';
			Ext.iterate(sumdata, function(key, value){
				var header = cm.getColumnById(key).header;
				
				sumText += header + '：' + value + ' ';
			});
			
			var sumItem = bbar.sumItem;
			if (Ext.isEmpty(sumItem)) {
				var idx = bbar.items.indexOf(bbar.refresh);
				sumItem = new Ext.Toolbar.TextItem(sumText);
				
				bbar.insert(idx + 1, new Ext.Toolbar.Separator());
				bbar.insert(idx + 2, sumItem);
				
				bbar.sumItem = sumItem;
			} else {
				sumItem.setText(sumText);
			}
			bbar.doLayout();
		},
		
		//创建查看审批单界面中的工具栏按钮
		createReportTool : function(tabPanel, iframe, tbar, funId, keyid) {
			var baseWf = function(fileName) {
				//审批确定后会刷新该审批单，在check_work.js文件中用到了这个全局变量。
				JxUtil.myCheckIframe = iframe;
				
				var appData = {funId:funId, dataId:keyid};
				JxUtil.showCheckWindow(appData, fileName);
			};
			
			
			tbar.add({text:'审批', iconCls:'eb_chkw', handler:function(){baseWf('check_work');}});
			//如果是弹出窗口，则不显示下面的按钮
			if (tabPanel.isXType('tabpanel')) {
				var tabForm = tabPanel.getComponent(1);
				var tabGrid = tabPanel.getComponent(0);
				tbar.add({text:'编辑', iconCls:'eb_form', handler:function(){tabPanel.activate(tabForm);}});
				tbar.add({text:'图文资料', iconCls:'eb_upload', handler:function(){tabGrid.getComponent(0).gridNode.event.upload();}});
			}
			tbar.add({text:'刷新', iconCls:'eb_refresh', handler:function(){var src = iframe.dom.src;iframe.dom.src = src;}});
			//'扩展操作…'
			var extMenu = new Ext.menu.Menu({items: [
				{text:'查看任务分配', handler:function(){baseWf('check_assign');}},
				{text:'查看历史审批', handler:function(){baseWf('check_his');}},
				{text:'查看流程图', handler:function(){baseWf('check_map');}},
				{text:'查看过程实例', handler:function(){baseWf('check_list');}}
			]});
			tbar.add({text: jx.node.extmenu, iconCls: 'eb_menu', menu: extMenu});
		},
		
		/**
		 * 显示审批表单的tab
		 * tabPanel -- 当前功能的tabPanel
		 * href -- 显示当前报表页面的href
		 * nodetitle -- 当前功能名称
		 * nodeid -- 当前功能ID
		 * keyid -- 当前记录主键值
		 **/
		createReportTab : function(tabPanel, href, nodetitle, nodeid, keyid) {
			var frmid = "frmHtmlReport_" + nodeid;
			var tabid = 'tab_' + frmid;
			
			var tabtitle = '';
			if (tabPanel.isXType('tabpanel')) {
				tabtitle = nodetitle + '-审批单';
			}
		
			var tbar;
			var reportTab = tabPanel.getComponent(tabid);
			if (reportTab == null) {
				var tcfg = {deferHeight:true, items:[{text:' '}]};
				if (Ext.isIE) tcfg.style = 'padding:1px;';
				tbar = new Ext.Toolbar(tcfg);
				
				var reportTab = tabPanel.add({
					id:tabid,
					pagetype:'formrpt',
					title:tabtitle,
					autoScroll:true,
					layout:'fit',
					border:false,
					tbar:tbar,
					closable:true,
					iconCls:'tab_form',
					html:'<iframe id="'+ frmid +'" frameborder="no" style="display:none;border-width:0;"></iframe>'
				});
				
				reportTab.on('beforedestroy', function(t){
					Ext.fly(frmid).remove();
					return true;
				});
			} else {
				tbar = reportTab.getTopToolbar();
				//删除所有按钮，重新处理按钮事件中的变量
				tbar.removeAll(true);
				tbar.add({text:' '});//chrome中用于布局
			}
			
			if (tabPanel.isXType('tabpanel')) {
				tabPanel.activate(reportTab);
			} else {
				tabPanel.show();
			}
			
			//IFRAME中显示表单信息
			var frm = Ext.get(frmid);
			frm.setWidth(800);
			frm.setHeight(reportTab.getHeight() - 27);
			frm.dom.src = href + '&_dc=' + (new Date()).getTime();
			frm.show();
			
			//添加审批工具栏
			JxUtil.createReportTool(tabPanel, frm, tbar, nodeid, keyid);
			
			return reportTab;
		},
		
		/**
		 * 显示FORM表单的对话框
		 * config -- 表单配置信息，参数：{items:[], width:200, height:100}
		 * okCall -- 确定的回调函数
		 **/
		formWindow: function(config, okCall) {
			var winForm = new Ext.form.FormPanel({
				layout:'form', 
				labelAlign:'left',
				border:false, 
				baseCls:'x-plain',
				autoHeight: true,
				frame: false,
				bodyStyle: 'padding:10px;',
				items: config.items
			});

			//创建对话框
			var self = this;
			var win = new Ext.Window({
				title:jx.base.inputtext,
				layout:'fit',
				width:config.width||400,
				height:config.height||160,
				resizable: false,
				modal: true,
				closeAction:'close',
				items:[winForm],

				buttons: [{
					text:jx.base.ok,	//确定
					handler:function(){
						if (okCall(winForm.getForm()) != false) {
							win.close();
						}
					}
				},{
					text:jx.base.cancel,	//取消
					handler:function(){win.close();}
				}]
			});
			win.show();
		},
		
		/**
		 * 修改密码
		 * userId -- 需要修改密码的用户ID
		 **/
		setPass : function(userId, loginFn) {
			//密码输入界面
			var passForm = new Ext.form.FormPanel({
				layout:'form', 
				labelAlign:'right',
				style: 'padding:20 20 0 0px;',
				border: false,
				frame: false,
				baseCls: 'x-plain',
				items:[//'原密码'
					{xtype:'textfield', fieldLabel:jx.sys.oldpwd, name:'modfiy_pass__old_pass', inputType: 'password', 
						allowBlank:false, labelSeparator:'*', labelStyle:'color:#0000ff;', anchor:'100%', maxLength:20},//'新密码'
					{xtype:'textfield', fieldLabel:jx.sys.newpwd, id:'modfiy_pass__new_pass', inputType: 'password', 
						allowBlank:false, labelSeparator:'*', labelStyle:'color:#0000ff;', anchor:'100%', maxLength:20},//'确认新密码'
					{xtype:'textfield', fieldLabel:jx.sys.conpwd, id:'modfiy_pass__confirm_pass', inputType: 'password', 
						allowBlank:false, labelSeparator:'*', labelStyle:'color:#0000ff;', anchor:'100%', maxLength:20}
				]
			});

			//显示修改密码的界面
			var win = new Ext.Window({
				title:jx.sys.modpwd,	//'修改密码'
				layout:'fit',
				width:300,
				height:180,
				resizable: false,
				modal: true,
				closeAction:'close',
				items:[passForm],

				buttons: [{
					text:jx.base.ok,	//'确定'
					handler:function(){
						//数据校验
						if (!passForm.getForm().isValid()) {
							JxHint.alert(jx.event.datavalid);	//'请确保输入的数据正确完整！'
							return;
						}
						
						var myform = passForm.getForm();
						var oldpass = myform.findField('modfiy_pass__old_pass').getValue();
						var newpass = myform.findField('modfiy_pass__new_pass').getValue();
						var confirmpass = myform.findField('modfiy_pass__confirm_pass').getValue();
						
						if (newpass != confirmpass) {
							JxHint.alert(jx.sys.twopwd);	//'请确保两次输入的新密码相同！'
							return;
						}
						
						//请求参数
						var params = 'funid=sys_user&oldpass='+ oldpass +'&newpass='+ newpass;
						params += '&keyid=' + userId;
						params += '&pagetype=editgrid&eventcode=setpass';
						
						//发送后台请求
						Request.postRequest(params, function(data, extd){
							win.close();
							//登录时修改密码成功，然后直接登录
							if (loginFn) loginFn();
						});
					}
				},{
					text:jx.base.cancel,	//'取消'
					handler:function(){win.close();}
				}]
			});
			win.show();
		},
		
		/**
		 * 审批过程中，显示表单中可以编辑的字段
		 * nodeId -- 功能ID
		 * dataId -- 数据ID
		 * form -- 表单对象
		 **/
		showCheckEdit: function(nodeId, dataId, form, toolBar) {
			var self = this;
			
			var hdCall = function(data) {
				//取当前申请节点可以编辑的字段
				var editFields = data.editFields;
				if (editFields.length == 0) return;
				
				var fields = editFields.split(';');
				//alert('fields=' + fields);
				for (var i = 0; i < fields.length; i++) {
					if (fields[i].length > 0) {
						//alert('replace=' + fields[i].replace('.', '__'));
						var field = form.findField(fields[i].replace('.', '__'));
						field.setReadOnly(false);
					}
				}
				
				//修改保存按钮为可编辑状态
				//var saveBtn = self.getButton(toolBar, 'save');
				//if (saveBtn != null) saveBtn.enable();
			};
			
			//从后台查询任务信息
			var params = 'funid=wf_assign&pagetype=chkgrid&eventcode=queryfield';
			params += '&check_funid='+ nodeId +'&keyid='+ dataId;
			Request.dataRequest(params, hdCall);
		},
	
		/**
		 * 显示待审批的记录
		 * nodeId -- 功能ID
		 * dataId -- 数据ID
		 * userId -- 用户ID
		 **/
		showCheckData: function(nodeId, dataId, userId) {
			//取功能对象信息
			var define = Jxstar.findNode(nodeId);
			if (define == null) {
				JxHint.alert(String.format(jx.star.nopage, nodeId));	//'没有定义【{0}】功能页面信息！'
				return false;
			}
			//缺省审批界面，如果为空则是form
			if (Ext.isEmpty(define.showform)) {
				define.showform = 'form';
			}
			//构建页面参数
			var pkcol = define.pkcol.replace('__', '.');
			var pageParam = {
				pageType: 'check', 
				whereSql: ' exists (select * from wf_assign where run_state = ? and assign_userid = ? and fun_id = ? and data_id = '+ pkcol +')',
				whereValue: '0;'+userId+';'+nodeId,
				whereType: 'string;string;string',
				showType: define.showform,	//指定缺省显示表单页面，grid, form, report，如果为空则是form
				updateId: dataId
			};
			Jxstar.createNode(nodeId, pageParam);
		},
		
		/**
		 * 显示已审批的记录
		 * nodeId -- 功能ID
		 * dataId -- 数据ID
		 * userId -- 用户ID
		 **/
		showCheckHisData: function(nodeId, dataId, userId) {
			//取功能对象信息
			var define = Jxstar.findNode(nodeId);
			if (define == null) {
				JxHint.alert(String.format(jx.star.nopage, nodeId));	//'没有定义【{0}】功能页面信息！'
				return false;
			}
			
			//构建页面参数
			var pkcol = define.pkcol.replace('__', '.');
			var pageParam = {
				pageType: 'grid', 
				whereSql: ' exists (select * from wf_assignhis where check_userid = ? and fun_id = ? and data_id = '+ pkcol +')',
				whereValue: userId+';'+nodeId,
				whereType: 'string;string',
				showType: 'grid',
				updateId: dataId
			};
			Jxstar.createNode(nodeId, pageParam);
		},
		
		/**
		 * 显示流程相关信息界面
		 * appData -- 相关数据
		 * fileName -- 相关信息界面文件
		 **/
		showCheckWindow: function(appData, fileName) {
			var hdCall = function(f) {
				f.showWindow(appData);
			};

			//加载信息界面文件
			Request.loadJS('/jxstar/studio/pub/'+ fileName +'.js', hdCall);
		},
		
		/**
		 * 显示业务表单数据界面
		 * funId -- 功能ID
		 * dataId -- 数据ID
		 **/
		showFormData: function(funId, dataId) {
			var define = Jxstar.findNode(funId);
			
			var pkcol = define.pkcol.replace('__', '.');
			var hdcall = function(page) {
				var options = {
					where_sql: pkcol + ' = ?',
					where_type: 'string',
					where_value: dataId,
					callback: function(data) {
						if (data.length == 0) {
							JxHint.alert(jx.util.nodata);	//'没有找到业务记录！'
						} else {
							var r = page.formNode.event.newRecord(data[0]);
							
							page.getForm().myRecord = r;
							page.getForm().loadRecord(r);
							//初始化事件
							page.formNode.event.initForm();
						}
					}
				};
				Jxstar.queryData(funId, options);
			};
			
			Jxstar.showData({
				filename: define.formpage,
				pagetype: 'form',
				title: define.nodetitle, 
				callback: hdcall
			});
		},
	
		/**
		 * 取工具栏中的按钮
		 * toolBar --  工具栏
		 * eventCode -- 事件代号
		 **/
		getButton: function(toolBar, eventCode) {
			return toolBar.find('eventCode', eventCode)[0];
		},
		
		/**
		 * 取当前表格每页记录数设置
		 * grid --  当前表格对象
		 **/
		getPageSize: function(grid) {
			//根据分页工具栏取每页记录数
			var pageSize = Jxstar.pageSize;
			var bbar = grid.getBottomToolbar();
			if (bbar && bbar.isXType('paging')) {
				pageSize = bbar.pageSize;
			} else {
				//如果分页工具栏放在顶部了
				var tbar = grid.getTopToolbar();
				if (tbar) {
					var pbar = tbar.findByType('paging')[0];
					if (pbar) {
						pageSize = pbar.pageSize;
					} else {
						//如果没有找到分页栏，就设置每页10000条记录
						pageSize = 10000;
					}
				}
			}
			return pageSize;
		},
		
		/**
		 * 设置编辑权限的按钮为disable状态，用于处理已复核记录设置编辑按钮为disable
		 * toolBar --  工具栏
		 * disable -- 是否不可用
		 **/
		disableButton: function(toolBar, disable) {
			var btns = toolBar.find('rightType', 'edit');
			Ext.each(btns, function(btn){btn.setDisabled(disable);});
		},
	
		/**
		 * 设置表单的字段是否为只读
		 * form --  表单对象BasicForm
		 * readOnly -- 只读：true 设置所有字段为只读，false 设置字段恢复为原状态
		 **/
		readOnlyForm: function(form, readOnly) {
			if (readOnly == true) {
				//修改所有字段为只读，不可编辑
				form.fieldItems().each(function(f){
					if (f.isXType('field')) {
						if (f.isXType('checkbox', true) || f.isXType('radio', true)) {
							f.setDisabled(true);
						} else {
							f.setReadOnly(true);
						}
					}
				});
			} else {
				//修改所有字段为非只读，但如果字段原属性为只读，则不处理
				form.fieldItems().each(function(f){
					var initReadOnly = f.initialConfig.readOnly;
					var initDisabled = f.initialConfig.disabled;

					if (f.isXType('field')) {//添加fileuploadfield，解决disable后不能enable的问题
						if (f.isXType('checkbox', true) || f.isXType('radio', true) || f.isXType('fileuploadfield', true)) {
							if (!initDisabled) {
								f.setDisabled(false);
							}
						} else {
							if (!initReadOnly) {
								f.setReadOnly(false);
							}
						}
					}
				});
			}
		},
	
		/**
		 * 格式化number(n)，处理数字的n位小数位数，用于grid.editor.renderer。
		 * 系统组件Ext.util.Format.number()也支持该功能，但性能有差异。
		 **/
		formatNumber: function(n){
			return function(v){
				if (n == null || isNaN(n)) n = 2;
				return (v !== undefined && v !== null && v !== '') ?
						parseFloat(parseFloat(v).toFixed(n)) : '';
			};
		},

		/**
		 * 格式化int整数，用于grid.editor.renderer。
		 **/
		formatInt: function(){
			return function(v){
				return (v !== undefined && v !== null && v !== '') ?
						parseInt(v) : '';
			};
		},
	
		/**
		* 表格中的数据保存为csv文件，
		* 原有一个gridToExcel.getExcelXml方法可以输出为xls文件，但它的格式是xml，在linux下无法打开，所以采用csv格式的文件。
		* grid -- 数据表格
		* includeHidden -- 是否输出隐藏字段
		*/
		gridToCSV: function(grid, includeHidden) {
			//文件内容
			var fileContent = '';
			
			//输出表格标题
			var title = '';
			var cm = grid.getColumnModel();
			var colCount = cm.getColumnCount();
			for (var i = 0; i < colCount; i++) {
				if (cm.getDataIndex(i).length > 0 && (includeHidden || !cm.isHidden(i))) {
					title += cm.getColumnHeader(i) + ',';
				}
			}
			if (title.length > 0) {
				title = title.substr(0, title.length-1);
			}
			
			//输出表格内容
			var content = '', row = '', r;
			for (var i = 0, it = grid.store.data.items, l = it.length; i < l; i++) {
				r = it[i].data;
				var k = 0;
				for (var j = 0; j < colCount; j++) {
					if ((cm.getDataIndex(j).length > 0)
						&& (includeHidden || !cm.isHidden(j))) {
						var v = r[cm.getDataIndex(j)];
						v = Ext.isDate(v) ? v.dateFormat('Y-m-d H:i:s') : v;
						k++;
						row += v + ',';
					}
				}
				if (row.length > 0) {
					row = row.substr(0, row.length-1);
				}
				//保存每行数据
				content += row + '\n';
				row = '';
			}
			
			fileContent += title + '\n';
			fileContent += content + '\n';
			
			return fileContent;
		},
	
		/**
		* 创建一个新的随机ID值
		*/
		newId: function() {
			var idval = Math.random() * 10000000;
			idval = new String(idval).split('.');
			return idval[0];
		},
	
		/**
		* 创建一条空记录
		* store -- 存储对象
		*/
		emptyRecord: function(store) {
			var record = new (store.reader.recordType)({});
			var cols = record.fields.keys;

			//给每个字段给空值
			for (var i = 0; i < cols.length; i++){
				record.set(cols[i], '');
			}
			return record;
		},
		
		/**
		* FORM中字段控件添加CTRL+F1事件查看字段帮助说明；
		* 根据字段名，分解为表名与字段名，从数据模型中取字段解释说明。
		*
		* field -- 字段控件
		* event -- 按钮事件
		*/
		specialKey: function(field, event) {
			//CTRL+F1事件
			if (event.ctrlKey && event.keyCode == event.F1) {
				//取表名与字段名
				var ft = field.name.split('__');
				
				//显示字段信息
				var showField = function(data) {
					var html = '<div style="background-color:#fff;font-size:13px;line-height:22px;padding:2px;width:100%;height:100%;overflow:auto;">'+data.info+'</div>';
					var win = new Ext.Window({
						title:jx.util.seefield,	//'查看字段信息'
						layout:'fit',
						width:450,
						height:250,
						resizable: true,
						modal: true,
						style: '',
						closeAction:'close',
						html:html,

						buttons: [{
							text:jx.base.ok,	//'确定'
							handler:function(){win.close();}
						}]
					});
					win.show();
				};
				
				//发送请求
				var params = 'funid=dm_fieldcfg&table_name=' + ft[0] + '&field_name=' + ft[1];
					params += '&eventcode=queryfield';
				Request.postRequest(params, showField);
			}
		},
		
		/**
		* FORM中字段控件值修改后触发的事件
		* 注意：TextArea控件在添加x-grid3-dirty-cell样式后无效，
		* 所以去掉了ext-all.css中的.x-form-text, textarea.x-form-field背景图片样式。
		*
		* field -- 字段控件
		* newValue -- 修改后的值
		* oldValue -- 修改前的值
		*/
		changeValue: function(field, newValue, oldValue) {
			if (field.isDirty()) {
				field.addClass('x-grid3-dirty-cell');
			} else {
				field.removeClass('x-grid3-dirty-cell');
			}
		},
		
		/**
		* 清除FORM表单中所有字段的修改标记，设置最新的原始值
		* form -- form控件
		*/
		clearDirty: function(form) {
			form.fieldItems().each(function(f){
				var name = f.name;
				if (name != null && name.length > 0) {
					f.removeClass('x-grid3-dirty-cell');
					f.originalValue = f.getValue();
				}
			});
		},
		
		/**
		* 如果字段值长度超过了field控件长度，支持显示提示信息
		* form -- formPanel
		*/
		fieldValueTip: function(formPanel) {
			var fields = formPanel.findByType('textfield');
			if (fields && fields.length > 0) {
				Ext.each(fields, function(item){
					if (item.isXType('textarea') || item.isXType('datefield') || item.isXType('numberfield')) return;
					var v = item.getValue();
					var len = JxUtil.strlen(v);//初步约定每个字符8像素
					var width = item.getWidth();
					if (item.tip || ((len*8 > width) && item.el)) {
						if (!item.tip) {
							item.tip = new Ext.ToolTip({
								target: item.el,
								html: v
							});
							//alert(len + ';' + width + ';' + item.getName());
						} else {
							if (item.tip.body) {//鼠标没提示时body=null
								item.tip.body.dom.innerHTML = v;
							} else {
								item.tip.html = v;
							}
						}
					}
				});
			}
		},
		
		/**
		* 取当前表单中的修改了值的字段名。
		* 由于保存方法经常需要取字段值做运算处理，但这些又没有修改，
		* 所以要把所有值传递到后台，同时传递哪些字段的值修改了。
		**/
		getDirtyFields: function(form) {
			var name, fields = '';
			form.fieldItems().each(function(f){
				name = f.name;
				if (name != null && name.length > 0 && f.isDirty()) {
					fields += name.replace('__', '.') + ';';
				}
			});
			if (fields.length > 1) {
				fields = fields.substr(0, fields.length - 1);
			}
			return fields;
		},
		
		/**
		* 取当前表单的值，组成URL，格式如：&name1=value1&name2=value2...
		* BasicForm.getValues(true)方法不能处理checkbox，combo的值。
		* dirtyOnly -- 是否只处理脏数据
		**/
		getFormValues: function(form, dirtyOnly) {
			var name, val, data = '', e = encodeURIComponent;
			form.fieldItems().each(function(f){
				name = f.name;
				val = f.getValue();
				val = Ext.isDate(val) ? val.dateFormat('Y-m-d H:i:s') : val;

				if (name != null && name.length > 0 && (dirtyOnly !== true || f.isDirty())) {
					data += '&' + e(name) + '=' + e(val);
				}
			});

			return data;
		},
		
		/**
		* 解析查询值中的页面参数，参数格式：[table_name.field_name]
		* whereValue -- 查询值，其中可能含页面参数
		* tagRecord -- 页面记录集，字段名格式为table_name__field_name
		* isBig -- 是否大括号 [true|false]
		**/
		parseWhereValue: function(whereValue, tagRecord, isBig) {
			if (whereValue == null || whereValue.length == 0 || 
				tagRecord == null) return whereValue;
			
			var re = /\[[^\]]+\]/g;
			if (isBig) re = /\{[^\{]+\}/g;
			//替换字符串中的字段名
			var fn = function(name, index, format, args) {
				name = name.substr(1, name.length-2);
				name = name.replace('.', '__');
				var v;
				if (tagRecord.get) {
					v = tagRecord.get(name);
				} else {
					v = tagRecord[name];
				}
				
				return v || name;
			};
			
			var value = whereValue.replace(re, fn);
			return value;
		},
		
		/**
		* 取表格中选择的记录；可编辑表格中的选择方式不同。
		*/
		getSelectRows : function(g) {
			var records = [];
			var selModel = g.getSelectionModel();
			if (selModel.getSelections) {
				records = selModel.getSelections();
			} else {
				var pos = selModel.getSelectedCell();
				if (pos == null) return records;
				
				var record = g.getStore().getAt(pos[0]);
				if (record) records = [record];
			}
			return records;
		},
	
		/**
		* 是否选择记录判断
		*/
		selected: function(records) {
			if (records == null) {
				JxHint.alert(jx.util.isnull);	//'记录对象为NULL，不能执行此操作！'
				return false;
			}
			if (records.length == 0) {
				JxHint.alert(jx.util.selectno);	//'没有选择一条记录，不能执行此操作！'
				return false;
			}
			
			return true;
		},
		
		/**
		* 是否单选记录判断
		*/
		selectone: function(records) {
			if (!this.selected(records)) return false;
			if (records.length > 1) {
				JxHint.alert(jx.util.selectone);	//'只能选择一条记录！'
				return false;
			}
			
			return true;
		},
		
		/**
		* 显示检查项执行失败的结果信息
		* 后台返回的检查项数据内容为：
		* checkMsg:[{checkName:'', result:true},
		*  {checkName:'', result:false, faildDesc:'', keyid:'', message:'', data:{}},...]
		*/
		checkResult: function(extData) {
			if (!extData || extData.length == 0) return;
			var cds = extData.checkMsg;
			//解析失败信息中的参数值
			for (var i = 0, n = cds.length; i < n; i++) {
				var data = cds[i];
				var faild = data.faildDesc;
				if (!data.result && faild.length > 0 && faild.indexOf('[') > -1) {
					faild = faild.replace(/\[/g, '{');
					faild = faild.replace(/\]/g, '}');
					var tpl = new Ext.XTemplate(faild);
					data.faildDesc = tpl.apply(data.data);
				}
			}
			
			//构建提示消息的模板
			var tpl = new Ext.XTemplate(
				'<div style="background-color:#fff;">',
				'<table style="font-size:13px;width:100%;">',
				  '<tr style="font-weight:bold;background-color:#ccc;height:28px;">'+
				    '<td style="width:150px;">检查项</td>'+
					'<td style="width:40px;">结果</td>'+
					'<td style="width:190px;">失败提示</td>'+
				  '</tr>',
				'<tpl for="checkMsg">',
				  '<tr style="background-color:#eee;height:28px;">',
					'<td>{checkName}</td>',
					'<tpl if="result == false">',
					  '<td><span class="eb_audit_cancel">&nbsp;&nbsp;&nbsp;&nbsp;</span></td>',
					'</tpl>',
					'<tpl if="result == true">',
					  '<td><span class="eb_select">&nbsp;&nbsp;&nbsp;&nbsp;</span></td>',
					'</tpl>',
					'<td>{faildDesc} {message}</td>',
				  '</tr>',
				'</tpl>',
				'</table>',
				'</div>'
			);
			
			//创建对话框
			var win = new Ext.Window({
				title:'检查项执行结果',
				layout:'fit',
				width:400,
				height:300,
				resizable: false,
				modal: true,
				autoScroll: true,
				closeAction: 'close',
				tpl: tpl,
				data: extData
			});
			win.show();
		},
		
		/**
		* 给tab控件添加快捷键，ctrl+alt+1表示第1个tab
		*/
		tabAddKey: function(tab) {
			var hd = function(tab) {
				var mappings = [], cnt = tab.items.getCount();
				for (var i = 0; i < cnt; i++) {
					//'1' = 49
					var fn = function(k, e){
						var index = k - 49;
						tab.activate(index);
					};
					var key = 49+i;
					mappings[i] = {key:key, ctrl:true, alt:true, fn:fn};
				}
				tab.keymap = new Ext.KeyMap(tab.el, mappings);
				tab.keymap.enable();
			};
			
			JxUtil.delay(1000, function(){if (this.el) hd(this);}, tab);
		},
		
		/**
		* 判断当前事件代号的按钮是否disable
		*/
		isDisableBtn: function(page, eventCode) {
			var tbar = page.getTopToolbar();
			if (tbar == null) return true;
			var btn = JxUtil.getButton(tbar, eventCode);
			if (btn == null) return true;
			return btn.disabled;
		},
		
		/**
		* 聚焦表单第一个控件，方便执行快捷键
		*/
		focusFirst: function(page) {
			if (page == null || !page.isXType('form')) return;
			
			var hd = function() {
				page.form.items.each(function(f){
					if (f.isFormField && f.rendered && f.name && !f.isXType('hidden')) {
						f.focus(true);
						return false;
					}
				});
			};
			
			JxUtil.delay(500, hd);
		},
		
		/**
		* 聚焦表格当前行，方便执行快捷键
		*/
		focusFirstRow: function(page) {
			if (page == null || !page.isXType('grid')) return;
			
			var row = JxUtil.getRowNum(page);
			page.getView().focusRow(row);
		},
		
		/**
		* 获取表格当前选择的行号
		*/
		getRowNum: function(page) {
			if (page == null || !page.isXType('grid')) return -1;
		
			var sm = page.getSelectionModel();
			if (sm.getSelectedCell) {//单元个选择模式
				var pos = sm.getSelectedCell();
				if (pos) {
					return pos[0];
				} else {
					return -1;
				}
			} else {//行选模式
				var s = page.getStore();
				var r = sm.getSelected();
				if (r) {
					return s.indexOf(r);
				} else {
					return -1;
				}
			}
		},
		
		/**
		* 获取表格第一个可编辑列的位置
		*/
		getEditCol: function(page) {
			if (page == null || !page.isXType('editorgrid')) return -1;
			
			var cm = page.getColumnModel();
			var cnt = cm.getColumnCount();
			for (var i = 0; i < cnt; i++) {
				if (cm.isCellEditable(i, 0)) return i;
			}
			return -1;
		},
	
		/**
		* 解析响应对象的错误信息
		* 参考文件：src/adapter/core/ext-base-ajax.js
		*/
		errorResponse: function(response) {
			var msg, code = response.status;
			
			if (response.isTimeout) {
				msg = jx.util.limittime;	//'请求超时，请重新操作，如果失败请联系管理员！'
			} else {
				if (code >= 200 && code < 300) {
					var result = Ext.decode(response.responseText);
					msg = result.message;
					if (msg.length == 0) {
						msg = response.statusText;
					}
				} else {
					if (response.responseText != null && response.responseText.length > 0) {
						var msg = response.responseText;
						try {
							var result = Ext.decode(response.responseText);
							msg = result.message;
						}catch(e) {}
						JxHint.alert(msg); 
						return;
					} else {
						msg = response.statusText;
					}
				}
			}
			
			if (msg.indexOf('communication') > -1) {//communication failure
				msg = '网络异常访问服务器失败，确认后重新操作！';
				/*var srcdesc = response.srcdesc || '';
				if (srcdesc.length > 0) {
					msg += '，来源：' + srcdesc;
				}*/
				//是否显示网络异常
				var show = Jxstar.systemVar.sys__show__neterror || '0';
				if (show == '1') {
					alert(msg);
				}
				return;
			} else {
				alert(msg);
			}
			//会话失效，退出系统 code <= 0 || 
			if (msg.indexOf(jx.index.login) >= 0) {//'登录'
				JxUtil.isLogout = true;	//正常退出
				window.location.href = Jxstar.logoutUrl || Jxstar.path;
			}
		},
		
		/**
		* 延迟执行指定的函数
		* time -- 延时时间，ms
		* fn -- 函数
		* scope -- 指定延时函数中的this对象
		* args -- 数组，指定fn中的参数
		*/
		delay: function(time, fn, scope, args) {
			(new Ext.util.DelayedTask()).delay(time, fn, scope, args);
		},
		
		/**
		* 递归删除DOM与子对象
		* parent -- 要删除的对象
		*/
		removeChild: function(parent){
			if (!parent) return;
			try {
				var childs = parent.childNodes || [];
				for (var i = childs.length - 1; i >= 0; i--) {
					var has = childs[i].hasChildNodes();
					if (has) {
						JxUtil.removeChild(childs[i]);
					} else {
						if (childs[i]) {
							parent.removeChild(childs[i]);
							childs[i] = null;
						}
					}
				}

				if (parent) parent.parentNode.removeChild(parent);
				parent = null;
			} catch(e){}
		},
		
		/**
		* 取字符串的长度，汉字为两个字节长度
		*/
		strlen: function(value) {
			if (value == null || value.length < 1) return 0;
			
			var len = 0;
			for (var i = 0; i < value.length; i++) {
				if (value.charCodeAt(i) < 299) {
					len++;
				} else {
					len += 2;
				}
			}
			return len;
		},
		
		/**
		* 把数字转换为金额大写
		*/
		numBigMoney: function(num) {
			var strOutput = "";   
			var strUnit = '仟佰拾亿仟佰拾万仟佰拾元角分';   
				num += "00";   
			var intPos = num.indexOf('.');
			
			if (intPos >= 0){ 
				num = num.substring(0, intPos) + num.substr(intPos + 1, 2);
			}
			
			strUnit = strUnit.substr(strUnit.length - num.length);   
			for (var i=0; i < num.length; i++){   
				strOutput += '零壹贰叁肆伍陆柒捌玖'.substr(num.substr(i,1),1) + strUnit.substr(i,1);   
			}
			
			return strOutput.replace(/零角零分$/, '整')
							.replace(/零[仟佰拾]/g, '零')
							.replace(/零{2,}/g, '零')
							.replace(/零([亿|万])/g, '$1')
							.replace(/零+元/, '元')
							.replace(/亿零{0,3}万/, '亿')
							.replace(/^元/, "零元"); 
		},
		
		/**
		* 处理IE6中不能显示PNG的透明效果
		*/
		fixPNG: function(myIMG) {
			if (!Ext.isIE6) return;

			var imgID = (myIMG.id) ? "id='" + myIMG.id + "' " : "";
			var imgTitle = (myIMG.title) ? "title='" + myIMG.title   + "' " : "title='" + myIMG.alt + "' ";
			var newHTML = "<span " + imgID + imgTitle + " style=\"width:" + myIMG.width + "px; height:" + 
				myIMG.height + "px;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + 
				myIMG.src + "', sizingMethod='scale');\"></span>";
			
			myIMG.outerHTML = newHTML;
		},
		
		/**
		* 取呈现函数中的样式：renderer:function(value) {return value ? value.format('Y-m-d') : '';}
		*/
		getDateFormat: function(renderer) {
			var ren = renderer.toString(), form = 'Y-m-d';
			if (ren.indexOf('format(\'Y-m-d') >= 0 || ren.indexOf('format(\"Y-m-d') >= 0) {
				form = 'Y-m-d';
			} else if (ren.indexOf('format(\'Y-m') >= 0 || ren.indexOf('format(\"Y-m') >= 0) {
				form = 'Y-m';
			} else if (ren.indexOf('format(\'Y') >= 0 || ren.indexOf('format(\"Y') >= 0) {
				form = 'Y';
			}
			return form;
		},
		
		/**
		* 取当前年份
		* inc -- 增减年份
		*/
		getCurYear: function(inc){
			var d = new Date();
			var y = parseInt(d.format('Y'));
			
			if (inc != null) {
				y = y + inc
			}
			return y;
		},
		
		/**
		* 取当前时间, 格式：yyyy-mm-dd hh:mm:ss
		*/
		getTodayTime: function(){
			var d = new Date();
			return d.format('Y-m-d H:i:s');
		},

		/**
		* 取当前日期, 格式：yyyy-mm-dd
		* inc -- 增减天数
		*/
		getToday: function(inc){
			var d = new Date();
			if (inc != null) {
				d = d.add(Date.DAY, inc);
			}
			return d.format('Y-m-d');
		},

		/**
		* 取当前月份, 格式：yyyy-mm
		* inc -- 增减月份
		*/
		getMonth: function(inc){
			var d = new Date();
			if (inc != null) {
				d = d.add(Date.MONTH, inc);
			}
			return d.format('Y-m');
		},

		/**
		* 取间隔月份, 格式：yyyy-mm
		*/
		getNextMonth: function(smonth, num){
			if (smonth == null) return '';
			smonth = smonth.split(' ')[0];
			
			var sd = smonth.split('-');
			if (sd.length == 2) {
				smonth = smonth + '-01';
			} else if (sd.length == 1) {
				smonth = smonth + '-01-01';
			}
			var dt = Date.parseDate(smonth, "Y-m-d");

			dt = dt.add(Date.MONTH, num);
			return dt.format('Y-m');
		},

		/**
		* 取指定日期间隔值的日期, 格式：yyyy-mm-dd
		*/
		getNextDate: function (sdate, num){
			if (sdate == null) return '';
			sdate = sdate.split(' ')[0];
			
			var sd = sdate.split('-');
			if (sd.length == 2) {
				sdate = sdate + '-01';
			} else if (sd.length == 1) {
				sdate = sdate + '-01-01';
			}
			var dt = Date.parseDate(sdate, "Y-m-d");

			dt = dt.add(Date.DAY, num);
			return dt.format('Y-m-d');
		},

		/**
		* 取本周的开始与结束日期，星期日是一周的第一天, 开始日期为本周日，结束日期为下周期日, 格式：yyyy-mm-dd
		*/
		getWeekDates: function(){
			var d = new Date();
			var w = d.getDay();//0是星期日，6是星期六

			var sd = this.getNextDate(this.getToday(), -w);
			var ed = this.getNextDate(this.getToday(), 7-w);

			return [sd, ed];
		},

		/**
		* 取上周的开始与结束日期，星期日是一周的第一天, 开始日期为本周日，结束日期为下周期日, 格式：yyyy-mm-dd
		*/
		getPreWeekDates: function(){
			var d = new Date();
			var w = d.getDay();//0是星期日，6是星期六

			var sd = this.getNextDate(this.getToday(), -w-7);
			var ed = this.getNextDate(this.getToday(), -w);

			return [sd, ed];
		},

		/**
		* 取本月的开始与结束日期，结束日期为下月第一天, 格式：yyyy-mm-dd
		*/
		getMonthDates: function(){
			var smonth = this.getMonth();

			var sd = smonth + '-01';
			var ed = this.getNextMonth(smonth, 1) + '-01';

			return [sd, ed];
		},

		/**
		* 取上月的开始与结束日期，结束日期为本月第一天, 格式：yyyy-mm-dd
		*/
		getPreMonthDates: function(){
			var smonth = this.getNextMonth(this.getMonth(), -1);

			var sd = smonth + '-01';
			var ed = this.getNextMonth(smonth, 1) + '-01';

			return [sd, ed];
		},
		
		/**
		* 保留f小数位，做四舍五入处理；JavaScript原生toFixed在有些浏览器中没有做四舍五入
		*/
		toFixed: function(v, f) {
			with(Math) {
				return round(v * pow(10, f)) / pow(10, f);
			}
		},
		
		/**
		* 乘法运算，rec可以是record、form，a是参数1的字段名，b是参数2的字段名，c是结果的字段名，
		* 如：a * b = c
		*/
		multiply: function(rec, a, b, c) {
			var va = rec.get(a);
			var vb = rec.get(b);
			var vc = (parseFloat(va) * 100) * (parseFloat(vb) * 100);
			vc = vc / 10000;//防止乘法结果本来是1.4，结果为1.39999999999992
			if (isNaN(vc)) {
				vc = 0;
			} else {
				vc = JxUtil.toFixed(vc, 2);
			}
			rec.set(c, vc);
		},
		
		//显示流程导航图标；parentNode -- 父级树节点; moduleLevel -- 显示模块级别，填写1或2
		viewNavIcon: function(parentNode, moduleLevel) {
			if (!moduleLevel || moduleLevel < 1) moduleLevel = 1;
			
			var hdCall = function(data) {
				if (data != null) data = data.root; 
				if (data == null || data.length == 0) return;
				for (var i = 0, n = data.length; i < n; i++) {
					var moduleId = data[i].wfnav_graph__module_id;
					if (moduleId.length == 0 || moduleId.length != moduleLevel*4) continue;
					
					var oneNode = parentNode.findChild('id', moduleId);
					if (Ext.isEmpty(oneNode)) continue;
					
					var graphId = data[i].wfnav_graph__graph_id;
					var graphTitle = data[i].wfnav_graph__graph_name;
					if (graphId.length == 0) continue;
					
					var anchor = oneNode.getUI().getAnchor();
					var cls = 'wfnav-icon';
					if (Ext.isChrome) cls += ' wfnav-icon-chrome';
					//删除以前创建图标，二级模块显示用，否则会重复创建
					var wfnav = Ext.fly(anchor).next('.wfnav-icon');
					if (wfnav) wfnav.remove();
					
					var chg = 'onmouseover="this.style.marginRight=\'3px\';" onmouseout="this.style.marginRight=\'4px\';"';
					var navIcon = Ext.fly(anchor).insertHtml('afterEnd', 
						'<span '+ chg +' class="'+ cls +'" graphid="'+ graphId +'" title="'+ graphTitle +'" graphtitle="'+ graphTitle +'"></span>', true);
					navIcon.on('click', function(e, t){
						e.stopEvent();
						JxWfGraph.showGraphFun(t.getAttribute('graphid'), null, false, t.getAttribute('graphtitle'));
					});
				}
			};
			var where_sql = encodeURIComponent('auditing = 1');
			var params = 'eventcode=query_data&funid=queryevent&pagetype=grid'+
				'&query_funid=wfnav_graph&where_sql=' + where_sql;
			Request.dataRequest(params, hdCall);
		}
	});//Ext.apply

})();
