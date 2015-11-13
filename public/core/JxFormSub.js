/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
  
/**
 * 构建表单中的明细表
 * 
 * @author TonyTan
 * @version 1.0, 2012-04-16
 */
JxFormSub = {};
(function(){

	Ext.apply(JxFormSub, {
	
	//添加tabpanel
	formAddTab: function(config) {
		var fm = config.param;
		//添加一个tabpanel对象
		var subcfg = {xtype:'tabpanel', cls:'sub_tab', style:'padding:5px 10px 5px 10px;', activeTab:0, 
			border:true, anchor:'100%', height:330, items:[], 
			//选择其他子表时要刷新数据
			listeners:{tabchange: function(tab, cmp){
				var sgrid = cmp.getComponent(0);
				if (sgrid && sgrid.fkValue) {
					Jxstar.loadSubData(sgrid, sgrid.fkValue);
				}
			}}
		};
		
		var define = Jxstar.findNode(fm.funid);
		var sid = define.subfunid;
		if (Ext.isEmpty(sid)) return;
		//如果设置不显示在tab的子功能ID，则form中只显示这些子功能ID
		var notTabFunId = define.notTabFunId || '';
		if (notTabFunId.length > 0) {
			sid = notTabFunId;
		}
		
		var j = 0;
		var sids = sid.split(',');
		for (var i = 0, n = sids.length; i < n; i++) {
			var subid = sids[i];
			if (subid.length == 0) continue;
			
			var sd = Jxstar.findNode(subid);
			sd.showInForm = true;
			
			subcfg.items[j++] = {title:sd.nodetitle, data:subid, layout:'fit'};
		}
		if (j > 0) {
			Ext.apply(subcfg, fm.subConfig);
			fm.items[fm.items.length] = subcfg;
		}
	},
	
	//添加显示明细表的panel
	formAddSub: function(config) {
		var fm = config.param;
		var define = Jxstar.findNode(fm.funid);
		var subfunid = define.subfunid;
		if (subfunid == null || subfunid.length == 0) return;
		//如果设置不显示在tab的子功能ID，则form中只显示这些子功能ID
		var notTabFunId = define.notTabFunId || '';
		if (notTabFunId.length > 0) {
			subfunid = notTabFunId;
		}
		//是否缺省展开form中的所有子功能
		var subExpand = define.subExpand || false;
		
		var cfgitems = fm.items;
		var subfunids = subfunid.split(',');
		for (var i = 0, n = subfunids.length; i < n; i++) {
			var subid = subfunids[i];
			if (subid.length == 0) continue;
			
			var subdefine = Jxstar.findNode(subid);
			var subtitle = subdefine.nodetitle;
			
			//标志此功能在form中显示
			//在GridNode.js中构建表格时不带边框，而且分页工具栏显示在顶部。
			subdefine.showInForm = true;
			//第一个子表展开，后面的子表折叠
			var csed = (i > 0);
			//缺省展开form中的所有子功能
			if (subExpand) csed = false;
			
			var subcfg = {
				title:subtitle, baseCls:'xs-panel', data:subid, 
				cls:'sub_panel', border:true, layout:'fit', collapsible:true, 
				collapsed:csed, anchor:'100%', height:230
			};
			Ext.apply(subcfg, fm.subConfig);
			cfgitems[cfgitems.length] = subcfg;
		}
	},
	
	//显示明细表格，添加相关事件
	formShowSub: function(formNode) {
		var fevent = formNode.event;
		var page = formNode.page;
		var fm = formNode.param;
		
		//子表是否显示在tab中
		var isInTab = false;
		var subtab = null;
		
		//取明细表的panel
		var subps = page.find('cls', 'sub_panel');
		if (subps == null || subps.length == 0) {
			var tabs = page.find('cls', 'sub_tab');
			if (tabs == null || tabs.length == 0) return;
			//取tab中的所有子控件
			subtab = tabs[0];
			subps = tabs[0].items.getRange();
			if (subps == null || subps.length == 0) return;
			isInTab = true;
		}
		//保存明细表，用于检查子表数据状况
		page.subgrids = subps;
		
		//创建明细表对象
		for (var i = 0, n = subps.length; i < n; i++) {
			var subParam = {pageType:'subgrid', parentNodeId:formNode.nodeId};
			Jxstar.createPage(subps[i].data, 'gridpage', subps[i], subParam);
		}
		
		//每次改变form记录时重新加载明细表记录
		fevent.on('initother', function(event) {
			if (subps == null || subps.length == 0) return;
			
			var define = event.define;
			var form = event.form;
			
			var pkcol = define.pkcol;
			var pkvalue = form.get(pkcol);
			
			var showsub = function(){
				for (var i = 0, n = subps.length; i < n; i++) {
					var subp = subps[i];
					var subgrid = subp.getComponent(0);
					if (pkvalue == null || pkvalue.length == 0) {
						subgrid.getStore().removeAll();
						subgrid.fkValue = '';
						subgrid.disable();
					} else {
						subgrid.enable();
						subgrid.fkValue = pkvalue;
						if (isInTab) {//如果是显示在tab中，且是后面的子表则先不显示数据
							if (subtab && (subtab.getActiveTab() ==  subp)) {
								Jxstar.loadSubData(subgrid, pkvalue);
							}
						} else {
							Jxstar.loadSubData(subgrid, pkvalue);
						}
					}
					
					//设置子表标题栏的点击事件
					if (subp.header) {
						subp.header.setStyle('cursor', 'pointer');
						subp.header.on('click', function(){
							if (this.collapsed) {
								this.expand(true);
							} else {
								this.collapse(true);
							}
						}, subp);
					}
					
					//可以调整明细表的大小
					if (fm.subResizable && subp.el && (subp.outRe == null)) {
						var re = new Ext.Resizable(subp.el, {
							minHeight: 180, minWidth: 600,
							listeners:{resize:function(r, w, h){
								r.innerCmp.setWidth(w);
								r.innerCmp.setHeight(h);
							}}
						});
						re.innerCmp = subp;
						subp.outRe = re;
						subp.on('destroy', function(sp){
							sp.outRe.destroy(true); sp.outRe = null; delete sp.outRe;
						});
					}
					
					//如果主记录已提交，则明细表的按钮不能使用
					if (define.auditcol.length > 0) {
						//设置业务状态值
						var audit0 = '0', audit2 = '2', audit6 = '6';
						if (define.status) {
							audit0 = define.status['audit0'];
							audit2 = define.status['audit2'];
						}
						
						var state = form.get(define.auditcol);
						if (state == null || state.length == 0) state = audit0;
						var disable = (state != audit0 && state != audit6);
						
						//工具按钮是异步加载，需要延时执行
						JxUtil.delay(500, function(sg){
							var tools = sg.getTopToolbar();
							JxUtil.disableButton(tools, disable);
							
							//设置子表在审批过程中保存按钮是否可用
							var subdef = sg.gridNode.define;
							var subEdit = subdef.subChkEdit||false;
							if (formNode.pageType == 'chkform' && subEdit && state == audit2) {
								var btn = JxUtil.getButton(tools, 'save_eg');
								if (btn) btn.enable();
							}
						}, this, [subgrid]);
					}
				}
			};
			//打开form审批界面时subgrid is null，需要延时处理
			var tmpg = subps[0].getComponent(0);
			if (tmpg) {
				showsub();
			} else {
				JxUtil.delay(500, showsub);
			}
		});
		
		fevent.on('beforecreate', function(event) {
			fevent.fireEvent('initother', fevent);
		});
		fevent.on('aftercreate', function(event) {
			fevent.fireEvent('initother', fevent);
		});
		fevent.on('afteraudit', function(event) {
			fevent.fireEvent('initother', fevent);
		});
		fevent.on('aftercustom', function(event) {
			fevent.fireEvent('initother', fevent);
		});
	}
	
	});//Ext.apply

})();