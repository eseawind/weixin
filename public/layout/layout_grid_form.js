/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
  
/**
 * 把明细表显示在form中的布局，在layout_main.js的基础上去掉了显示明细表、切换明细表的代码。
 * 将来可以在页面设计器中优化，与layout_main.js采用统一布局。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

Jxstar.currentPage = function(define, pageParam) {
	if (define == null) {
		JxHint.alert('layout_main define param define is null!');
		return;
	}

	var funid = define.nodeid;
	var pkcol = define.pkcol;
	var title = define.nodetitle;

	//创建标准GridForm布局
	var tabGridForm = new Ext.TabPanel({
		border:true,
		closeAction:'close',
		activeTab:0,
		items:[{
			pagetype:'grid',
			title: title+'-'+jx.layout.grid,	//列表
			autoScroll:true,
			layout:'fit',
			border:false,
			iconCls:'tab_grid'
		}]
	});
	
	//处理审批页面类型
	var isCheck = (pageParam && pageParam.pageType && pageParam.pageType == 'check');
	if (isCheck) pageParam.pageType = 'chkgrid';
	
	//添加grid页面
	Jxstar.createPage(funid, 'gridpage', tabGridForm.getComponent(0), pageParam);
	//添加form页面
	var formpage = define.formpage;
	if (formpage != null && formpage.length > 0) {
		var newtab = tabGridForm.add({
			pagetype:'form',
			title: title+'-'+jx.layout.form,	//表单
			autoScroll:true,
			layout:'fit',
			border:false,
			iconCls:'tab_form'
		});
		
		var fpageType = isCheck ? 'chkform' : 'form';
		Jxstar.createPage(funid, 'formpage', newtab, {pageType:fpageType, showSub:true});
	}

	tabGridForm.on('beforetabchange', function(tabPanel, newTab, currentTab){
		//取列表
		var fgp = tabPanel.getComponent(0);
		if (fgp == null) return false;
		//tab打开时为空
		if (fgp.items == null) return true;
		var fgrid = fgp.getComponent(0);
		if (fgrid == null) return false;
		
		var pagetype = newTab.pagetype;
		var records = JxUtil.getSelectRows(fgrid);
		if (records.length == 0 && pagetype != 'grid') {
			//如果点击grid的新增按钮则可以打开form界面
			var form = newTab.getComponent(0);
			if (pagetype != 'form'  || (pagetype == 'form' && form.getForm().srcEvent != 'create')) {
				records = JxUtil.firstRow(fgrid);
				if (records.length == 0) {
					JxHint.alert(jx.layout.nodata);
					return false;
				}
			}
		}
		var curPage = currentTab.getComponent(0);
		if (curPage != null && curPage.isXType('form') && curPage.getForm().isDirty()) {
			if (confirm(jx.layout.modify)) {	//'记录已被修改，是否需要先保存？'
				curPage.formNode.event.save();
				return false;
			}
		}
		
		return true;
	});

	tabGridForm.on('tabchange', function(tabPanel, activeTab){
		//取当前激活的Tab页面类型
		var pagetype = activeTab.pagetype;
		//处理有些页面没有自动显示的问题
		activeTab.doLayout();
		//取主界面的功能列表
		var fgp = tabPanel.getComponent(0);
		if (fgp == null) return false;
		//tab打开时为空
		if (fgp.items == null) return false;
		var fgrid = fgp.getComponent(0);
		if (fgrid == null) return false;
		
		var curPage = activeTab.getComponent(0);
		if (curPage == null) return true;
		
		//取选择记录的主键值
		var pkvalue = '';
		var records = JxUtil.getSelectRows(fgrid);
		if (records.length >= 1) {
			pkvalue = records[0].get(pkcol);
		} else {
			if ((pagetype != 'grid' && pagetype != 'form') || 
			    (pagetype == 'form' && curPage.getForm().srcEvent != 'create')) {
				JxHint.alert(jx.layout.selmain);
				return false;
			}
		}
		
		//显示表单数据
		if (pagetype == 'form') {
			var form = curPage.getForm();
			if (form.srcEvent != 'create') {
				var record = records[0];
				form.myGrid = fgrid;
				form.myStore = fgrid.getStore();
				form.myRecord = record;
				form.loadRecord(record);
			}
			//显示FORM时，执行初始化事件
			curPage.formNode.event.initForm();
			//清除打开form的来源事件
			delete form.srcEvent;
		}
	});

	return tabGridForm;
};
