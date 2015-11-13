/**
 * 审批工作界面
 * 审批工作界面中是根据功能ID与数据ID找到当前审批taskId；
 * 提交到工作流客户端时，也是根据taskId构建任务实例继续流程执行；
 * 改进：
 * 如果在表格中选择多条记录批量审批时，同时也需要填写审批意见，这种情况就
 * 根据第一条记录ID找taskId与历史审批意见，
 * 当提交后台时就不提交taskId，而是提交多个dataId。
 * 
 **/
Jxstar.currentPage = {
	//当前任务分配信息
	assignData: null,
	//操作类型描述
	typeLabel: jx.wf.advok,	//'同意。',
	//操作FORM控件
	taskForm: null,
	
	/**
	* public 显示审批工作对话框。
	* assignData -- 当前任务分配数据，包含参数：
	* 	taskId --  任务ID
	*	funId -- 功能ID
	*	dataId -- 数据ID
	*   dataIds -- 多个数据ID，用,分隔，在表格中批量审批多条记录时用
	*	在grid_wfassign.inc中只有前两个参数，在GridEvent.js, FormEvent.js中只有后两个参数。
	**/
	showWindow: function(assignData) {
		var self = this;
		self.assignData = assignData;
		if (assignData.taskId == null) assignData.taskId = '';
		
		var hdCall = function(nodeAttr) {
			//从功能中打开的界面需要给实例ID，从待办任务中打开的界面不需要给值
			if (assignData.taskId.length == 0) {
				assignData.taskId = nodeAttr.taskId;
			}
			//操作选项
			var typeConfig = self.showCheckType(nodeAttr);
			//取当前部门ID
			var curDeptId = JxDefault.getDeptId() + '%';
			
			var taskForm = new Ext.form.FormPanel({
				id: 'check_work_form',
				border: false,
				height: 120,
				region: 'north',
				baseCls: 'x-plain',
				items: [typeConfig, 
					{xtype:'textarea', fieldLabel:jx.wf.advice, name:'wf_task__check_desc', value:jx.wf.advok,	//'审批意见' //'同意',
						width:'100%', labelStyle:'color:#0000FF;', labelSeparator:'*', height:60, maxLength:500},
					{xtype:'trigger', fieldLabel:jx.wf.nextuser, name:'wf_task__next_user',//'重新分配人'
						readOnly:false, triggerClass:'x-form-search-trigger',
						maxLength:20, editable:false, 
						onTriggerClick: function() {
							var selcfg = {pageType:'combogrid', nodeId:'sys_user', layoutPage:'/public/layout/layout_tree.js', sourceField:'sys_user.user_name;user_id', targetField:'wf_task.next_user;next_userid', whereSql:"sys_user.is_novalid = '0' and (sys_user.dept_id like ? or sys_user.is_leader = '1')", whereValue:curDeptId, whereType:'string', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'1',fieldName:'wf_user.user_name'};
							JxSelect.createSelectWin(selcfg, this, 'check_work_form');
						}},
					{xtype:'hidden', fieldLabel:'next_userid', name:'wf_task__next_userid'}
				]
			});
			
			self.taskForm = taskForm;
			self.showCheckHis(assignData.funId, assignData.dataId, taskForm);
		};
		
		//检查任务执行状况，并从后台查询当前节点设置信息
		var params = 'funid=wf_assign&pagetype=chkgrid&eventcode=querywork&taskid='+ assignData.taskId;
		params += '&check_funid='+ assignData.funId +'&keyid='+ assignData.dataId;
		Request.dataRequest(params, hdCall);
	},
	
	/**
	* private 确定，完成任务
	* taskForm -- 任务意见表单
	**/
	executeCheck: function(taskForm) {
		var self = this;
		taskForm = taskForm.getForm();
		
		//操作类型
		var checkType = taskForm.findField('checkType').getGroupValue();
		//意见内容
		var checkDesc = taskForm.findField('wf_task__check_desc').getValue();
		
		if (checkDesc.length == 0) {//'审批意见为空，不能执行！'
			JxHint.alert(jx.wf.emptyadv);
			return false;
		}
		
		//重新分配审批人
		var nextUserId = taskForm.findField('wf_task__next_userid').getValue();
		var nextUserName = taskForm.findField('wf_task__next_user').getValue();
		
		//缺省提醒信息
		var shint = String.format(jx.wf.seltype, self.typeLabel);	//'您选择的操作类型是“'+ self.typeLabel +'”，';
		if (nextUserId.length > 0 && nextUserName.length > 0) {
			shint += String.format(jx.wf.assign, nextUserName);		//'并且把任务重新分配给“'+ nextUserName +'”，';
		}
		
		//否决终止
		if (checkType == 'N') {
			var ret = confirm(shint + jx.wf.stopyes);	//'流程将被终止，确定执行吗？'
		} else 
		//完成
		if (checkType == 'C') {
			var ret = confirm(shint + jx.wf.endyes);	//'流程将直接完成，确定执行吗？'
		} else {
			var ret = confirm(shint + jx.wf.doyes);		//'确定执行吗？'
		}
		if (!ret) return false;
		
		var e = encodeURIComponent;
		//执行后台请求
		var params = 'funid=wf_assign&pagetype=chkgrid&eventcode=execheck'+
					 '&check_type='+ checkType +'&check_desc='+ e(checkDesc) +
					 '&next_userid='+ nextUserId +'&next_user='+ e(nextUserName);
		
		//如果是表格中批量审批多条记录，则采用批量审批方式
		var dataIds = self.assignData.dataIds;
		if (dataIds != null && dataIds.length > 0) {
			params += '&check_funid='+ self.assignData.funId;
			var ids = dataIds.split(',');
			for (var i = 0; i < ids.length; i++) {
				params += '&keyid=' + ids[i];
			}
		} else {
		//单条记录审批
			params += '&taskid='+ self.assignData.taskId;
		}
		
		//提交审批后，刷新数据，如果是采用异步执行，下面的方法将没有效果
		var endcall = function() {
			//刷新审批数据表格，在GridEvent.check方法中赋值
			var mygrid = JxUtil.myCheckGrid;
			if (mygrid) {
				mygrid.getStore().reload();
				JxUtil.myCheckGrid = null;
			}
			//刷新表单数据，在FormEvent.check方法中赋值
			var myform = JxUtil.myCheckForm;
			if (myform) {
				var mygrid = JxUtil.getMyGrid(myform);
				if (mygrid) {
					var fevent = myform.formNode.event;
					var store = mygrid.getStore();
					var cnt = store.getCount();
					if (cnt == 1) {//一条记录审批后，切换到grid界面
						var tab = mygrid.findParentByType('tabpanel');
						if (tab) {
							tab.activate(tab.getComponent(0));
						}
					} else {
						fevent.nextRecord();
					}
					store.reload();
					JxUtil.myCheckForm = null;
				}
			}
			//刷新审批单报表，在JxUtil.createReportTool方法中赋值的
			if (JxUtil.myCheckIframe) {
				var src = JxUtil.myCheckIframe.dom.src;JxUtil.myCheckIframe.dom.src = src;
				JxUtil.myCheckIframe = null;
			}
		};
		
		Request.postRequest(params, endcall);
		
		return true;
	},
	
	/**
	* private 创建完成分配任务的对话框
	* taskForm -- 输入审批意见的表单
	* taskGrid -- 显示历史审批意见的表格
	**/
	createWindow: function(taskForm, taskGrid) {
		taskGrid.region = 'center';
		var self = this;
		var taskPanel = new Ext.Panel({
			style: 'padding:10px;',
			baseCls: 'x-plain',
			layout: 'border',
			border: false,
			items: [taskForm, {
				region:'center', 
				layout:'border',
				border: false,
				items:[{xtype:'box', html:'<div style="background-color:#B8CCE4;color:#15428b;margin-bottom:2px;height:18px;padding-left:2px;">'+jx.wf.hisadv+'</div>', region:'north'},taskGrid]//历史审批意见
			}]
		});
		
		//创建对话框
		var win = new Ext.Window({
			title:jx.wf.endass,		//'完成分配任务',
			layout:'fit',
			width:650,
			height:400,
			resizable: false,
			modal: true,
			closeAction:'close',
			items:[taskPanel],

			buttons: [{
				text:jx.base.ok,	//'确定',
				handler:function(){
					var ret = self.executeCheck(taskForm);
					if (ret) {
						win.close();
					}
				}
			},{
				text:jx.base.cancel,	//'取消',
				handler:function(){win.close();}
			}]
		});
		win.show();
	},
	
	/**
	* private 创建审批操作选项的config
	* nodeAttr -- 任务节点的设置信息，包含参数：
	*	hasNo -- 是否可以否决
	*	hasComplete -- 是否可以完成
	*   mustAgreeNum -- 必须审批通过人数
	**/
	showCheckType: function(nodeAttr) {
		var self = this;
		//设置选择事件
		var onSelect = function(radio, checked) {
			if (checked) {
				self.typeLabel = radio.boxLabel;
				
				var type = radio.inputValue;
				var form = self.taskForm.getForm();
				var descField = form.findField('wf_task__check_desc');				
				if (type == 'Y') {
					descField.setValue(jx.wf.advok);	//'同意。'
				} else if (type == 'R') {
					descField.setValue(jx.wf.advret);	//'不同意，退回上一人。'
				} else if (type == 'E') {
					descField.setValue(jx.wf.advnew);	//'不同意，退回编辑人重新提交。'
				} else if (type == 'N') {
					descField.setValue(jx.wf.advnot);	//'否决，取消任务。'
				} else if (type == 'C') {
					descField.setValue(jx.wf.advend);	//'同意，审批通过。'
				} else if (type == 'M') {
					descField.setValue(jx.wf.nagree);	//'不同意'
				}
				
				//只有同意才可以选择：重新分配人
				var reUser = form.findField('wf_task__next_user');	
				reUser.setReadOnly(type != 'Y');
				if (type != 'Y') {
					reUser.setValue('');
					form.findField('wf_task__next_userid').setValue('');
				}
			}
		};
		var ltr = {check: onSelect};

		//操作选项
		var typeItems = [
				{xtype:'radio', boxLabel:jx.wf.agree, name:'checkType', inputValue:'Y', checked:true, listeners: ltr},//'同意'
				{xtype:'radio', boxLabel:jx.wf.ret, name:'checkType', inputValue:'R', listeners: ltr},	//'退回'
				{xtype:'radio', boxLabel:jx.wf.retman, name:'checkType', inputValue:'E', listeners: ltr}//'退回编辑人'
			];
		//是否可以否决
		var hasno = Jxstar.systemVar.wf__check__hasno || '0';//是否所有审批都支持否决
		if (nodeAttr.hasNo == '1' || hasno == '1') {
			typeItems[typeItems.length] = 
				{xtype:'radio', boxLabel:jx.wf.stop, name:'checkType', inputValue:'N', listeners: ltr};//'否决终止'
		}
		//是否可以完成
		var hascomp = Jxstar.systemVar.wf__check__hascomp || '0';//是否所有审批都支持完成
		if (nodeAttr.hasComplete == '1' || hascomp == '1') {
			typeItems[typeItems.length] = 
				{xtype:'radio', boxLabel:jx.wf.end, name:'checkType', inputValue:'C', listeners: ltr};//'完成'
		}
		
		//如果是多人审批节点，则只有同意与不同意两个节点，M不同意用于多人节点，统计同意人数
		if (nodeAttr.mustAgreeNum > '0') {
			typeItems = [
				{xtype:'radio', boxLabel:jx.wf.agree, name:'checkType', inputValue:'Y', checked:true, listeners: ltr},//'同意'
				{xtype:'radio', boxLabel:jx.wf.nagree, name:'checkType', inputValue:'M', listeners: ltr}	//'不同意'
			];
			//隐藏重新分配人
			JxUtil.delay(1000, function(){
				var form = self.taskForm.getForm();
				var reUser = form.findField('wf_task__next_user');	
					reUser.hide();
			});
		}
	
		var typePanel = {
			xtype:'compositefield',
			fieldLabel:jx.wf.dotype,	//'操作选项',
			labelStyle:'color:#0000FF;',
			labelSeparator:'*',
			items: typeItems
		};
		
		return typePanel;
	},
	
	/**
	* private 显示历史审批意见的grid
	* funId -- 功能ID
	* dataId -- 数据ID
	* taskForm -- 表单控件
	**/
	showCheckHis: function(funId, dataId, taskForm) {
		var self = this;
		var taskDefine = Jxstar.findNode('wf_taskhis');
		
		var hdCall = function(f) {
			var page = f();
			if (typeof page.showPage == 'function') {
				page.selectModel = 'row';
				page = page.showPage('notoolgrid');
			}
			//显示审批界面
			self.createWindow(taskForm, page);
			
			//显示当前数据的所有历史审批意见，包括子过程与父过程，如果采用过程实例ID查询会非常复杂，不能兼顾子过程的历史记录
			var whereSql = 'wf_taskhis.fun_id = ? and wf_taskhis.data_id = ?';
			var whereValue = funId+ ';' +dataId;
			var whereType = 'string;string';
			Jxstar.loadData(page, {where_sql:whereSql, where_value:whereValue, where_type:whereType});
		};

		//加载任务历史gridpage
		Request.loadJS(taskDefine.gridpage, hdCall);
	}
	
};