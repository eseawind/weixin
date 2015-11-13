/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
  
/**
 * 表格页面常用事件实现类。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

Ext.ns('Jxstar');
Jxstar.GridEvent = function(define) {
	this.define = define;
	this.grid = null;
	//设置业务状态值
	this.audit0 = '0';
	this.audit1 = '1';
	this.audit2 = '2';
	this.audit6 = '6';
	this.audit_b = '';
	this.audit_e = '7';//可以用于终止与注销
	if (this.define.status) {
		this.audit0 = this.define.status['audit0'];
		this.audit1 = this.define.status['audit1'];
		this.audit_b = this.define.status['audit_b'];
		this.audit_e = this.define.status['audit_e'];
	}
	this.addEvents(
		/**
		* @param {Jxstar.GridEvent} this
		**/
		'beforecreate', 
		/**
		* @param {Jxstar.GridEvent} this
		**/
		'beforesave', 
		/**
		* @param {Jxstar.GridEvent} this
		* @param {JSON[]} data
		**/
		'aftersave', 
		/**
		* @param {Jxstar.GridEvent} this
		* @param {Ext.data.Record[]} records
		**/
		'beforedelete', 
		/**
		* @param {Jxstar.GridEvent} this
		* @param {JSON[]} data
		**/
		'afterdelete', 
		/**
		* @param {Jxstar.GridEvent} this
		**/
		'beforeaudit', 
		/**
		* @param {Jxstar.GridEvent} this
		* @param {JSON[]} data
		**/
		'afteraudit', 
		/**
		* @param {Jxstar.GridEvent} this
		**/
		'beforecopy', 
		/**
		* @param {Jxstar.GridEvent} this
		* @param {JSON[]} data
		**/
		'aftercopy',
		/**
		* @param {Jxstar.GridEvent} this
		* @param eventcode
		**/
		'beforecustom', 
		/**
		* @param {Jxstar.GridEvent} this
		* @param {JSON[]} data
		* @param eventcode
		**/
		'aftercustom',
		/**
		* @param {Jxstar.GridEvent} this
		**/
		'beforeimport',
		/**
		* @param {Jxstar.GridEvent} this
		* @param {srcFunId:'', destFunId:'', data:[{impKeyId:'', newKeyId:''}...]} data
		**/
		'afterimport',
		/**
		* @param {Jxstar.GridEvent} this
		* @param {{reportId:'', printType:'', printScope:'', printMode:''}} data
		**/
		'beforeprint',
		/**
		* @param {Jxstar.GridEvent} this
		* @param {{reportId:'', printType:'', printScope:'', printMode:''}} data
		**/
		'afterprint'
	);

	Jxstar.GridEvent.superclass.constructor.call(this, define);
};

(function(){

Ext.extend(Jxstar.GridEvent, Ext.util.Observable, {
	/**
	* public 销毁事件对象
	**/
	myDestroy : function() {
		this.define = null;		delete this.define;
		this.grid = null;		delete this.grid;
	},

	/**
	* public
	* 设置事件对象操作的表格
	**/
	setPage : function(page) {
		this.grid = page;
	},
	
	/**
	* public
	* 导入数据权限类别值
	**/
	impType: function() {
		var self = this;
		var records = JxUtil.getSelectRows(self.grid);
		if (!JxUtil.selected(records)) return;
		
		//取数据类别ID
		var rightTypeId = self.grid.rightTypeId;
		//取数据权限表格
		var rightGrid = self.grid.rightGrid;
		//选择的用户ID
		var selUserIds = self.grid.selUserIds;
		if (!rightGrid || !rightTypeId || !selUserIds) {
			JxHint.alert(jx.event.noqxbg);
			return;
		}

		//回调函数，刷新权限数据，并关闭对话框
		var endcall = function(data) {
			rightGrid.getStore().reload();
			self.grid.rightGrid = null;			delete self.grid.rightGrid;
			self.grid.rightTypeId = null;		delete self.grid.rightTypeId;
			self.grid.selUserIds = null;		delete self.grid.selUserIds;

			var win = self.grid.findParentByType('window');
			if (win) win.close();
		};
		
		//构建请求参数
		var params = 'funid='+ self.define.nodeid + '&userids=' + selUserIds;
		for (var i = 0; i < records.length; i++) {
			params += '&keyid=' + records[i].get(self.define.pkcol);
		}
		params += '&pagetype=imptype&eventcode=imptype&typeid='+rightTypeId;
		Request.postRequest(params, endcall);
	},
	
	/**
	* public
	* 自定义通用事件
	**/
	customEvent : function(eventCode) {	
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selected(records)) return;
		
		if (this.fireEvent('beforecustom', this, eventCode) == false) return;
		
		var self = this;
		var hdcall = function() {
			//取选择记录的主键值
			var params = 'funid='+ self.define.nodeid;
			for (var i = 0; i < records.length; i++) {
				params += '&keyid=' + records[i].get(self.define.pkcol);
			}

			//设置请求的参数
			params += '&pagetype=grid&eventcode='+eventCode;

			//执行处理的内容
			var endcall = function(data) {
				//统计主表中的统计字段值
				if (self.grid.gridNode.param.substat) {
					self.substat(self.grid);
				}
				self.fireEvent('aftercustom', self, data, eventCode);
				//重新加载数据
				self.grid.getStore().reload();
			};

			//发送请求
			Request.postRequest(params, endcall);
		};
		//确定执行当前操作吗？
		Ext.Msg.confirm(jx.base.hint, jx.event.doyes, function(btn) {
			if (btn == 'yes') hdcall();
		});
	},

	/**
	* public
	* 显示表单，表格记录双击时执行
	**/
	showForm : function() {
		var store = this.grid.getStore();
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selectone(records)) return;

		//显示表单数据
		Jxstar.showForm({define:this.define, grid:this.grid, record:records[0], store:store});
	},

	/**
	* public
	* 显示子表单
	**/
	showSubForm : function() {
		var self = this;
		var url = self.define.formpage;
		if (url == null || url.length == 0) return;
		
		var store = this.grid.getStore();
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selectone(records)) return;

		//显示表单数据
		Jxstar.openSubForm({
			filename: url,
			title: self.define.nodetitle, 
			grid: self.grid,
			pagetype: 'subform',
			parentNodeId: self.grid.gridNode.parentNodeId,
			record: records[0], store: store
		});
	},

	/**
	* public
	* 新增事件
	**/
	create : function() {
		var self = this;
		var store = this.grid.getStore();

		//显示表单数据
		Jxstar.showForm({define:self.define, grid:self.grid, record:null, store:store});
	},

	/**
	* public
	* 子表新增事件
	**/
	subcreate : function() {
		var self = this;
		var store = this.grid.getStore();

		//显示表单数据
		Jxstar.openSubForm({
			filename: self.define.formpage,
			title: self.define.nodetitle, 
			grid: self.grid,
			pagetype: 'subform',
			parentNodeId: self.grid.gridNode.parentNodeId,
			record: null, store: store
		});
	},

	/**
	* private
	* 提交时：检查是否存在已复核的记录；取消时：检查是否存在未复核记录
	* auditval -- 1 表示删除、保存、提交检查；0 表示反提交检查
	**/
	checkAudit: function(auditval) {
		if (Ext.isEmpty(auditval)) auditval = this.audit1;
		
		var records = JxUtil.getSelectRows(this.grid);
		for (var i = 0; i < records.length; i++) {
			var auditcol = this.define.auditcol;
			if (Ext.isEmpty(auditcol)) return false;
			
			var state = records[i].get(auditcol);
			if (Ext.isEmpty(state)) state = this.audit0;
			
			if (auditval == this.audit0) {
				if (state != this.audit1){
					JxHint.alert(jx.event.selaudit0);	//选择的记录不是已提交的记录，不能操作！
					return true;
				}
			} else if (auditval == this.audit1) {
				if (state != this.audit0 && state != this.audit6){
					JxHint.alert(jx.event.selaudit1);	//选择的记录中存在已提交的记录，不能操作！
					return true;
				}
			}
		}

		return false;
	},

	/**
	* public
	* 删除事件
	**/
	del : function() {
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selected(records)) return;

		if (this.checkAudit()) return;
		if (this.fireEvent('beforedelete', this, records) == false) return;

		var self = this;
		var hdcall = function() {
			//取选择记录的主键值
			var params = 'funid='+ self.define.nodeid;
			for (var i = 0; i < records.length; i++) {
				params += '&keyid=' + records[i].get(self.define.pkcol);
			}

			//设置请求的参数
			params += '&pagetype=grid&eventcode=delete';

			//删除后要处理的内容
			var endcall = function(data) {
				//统计主表中的统计字段值
				if (self.grid.gridNode.param.substat) {
					self.substat(self.grid);
				}
				self.fireEvent('afterdelete', self, data);
				//重新加载数据
				self.grid.getStore().reload();
			};

			//发送请求
			Request.postRequest(params, endcall);
		};
		//确定删除选择的记录吗？
		Ext.Msg.confirm(jx.base.hint, jx.event.delyes, function(btn) {
			if (btn == 'yes') hdcall();
		});
	},

	/**
	* public
	* 提交事件
	**/
	audit : function() {
		this.baseAudit(this.audit1, 'audit');
	},

	/**
	* public
	* 取消提交事件
	**/
	unaudit : function() {
		this.baseAudit(this.audit0, 'unaudit');
	},
	
	/**
	* public
	* 退回事件
	**/
	auditBack : function() {
		if (Ext.isEmpty(this.audit_b)) {
			JxHint.alert(jx.event.auditbe);		//退回状态值为空，不能操作！
			return;
		}
		this.baseAudit(this.audit_b, 'audit_back');
	},
	
	/**
	* public
	* 注销事件
	**/
	auditCancel : function() {
		if (Ext.isEmpty(this.audit_e)) {
			JxHint.alert(jx.event.auditee);		//注销或终止状态值为空，不能操作！
			return;
		}
		this.baseAudit(this.audit_e, 'audit_cancel');
	},

	/**
	* private
	* 基础提交事件
	**/
	baseAudit : function(auditval, eventcode) {
		var store = this.grid.getStore();
		var mrow = store.getModifiedRecords();
		if (mrow.length > 0) {
			//记录已被修改，是否需要先保存？
			if (confirm(jx.event.saveyes)) {
				this.editSave();
				return false;
			} else {
				store.rejectChanges();
			}
		}
	
		var keyids = [];
		var cm = this.grid.getColumnModel();
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selected(records)) return;
		
		//检查必填附件字段的值
		if (JxAttach.checkGrid(this.grid) == false) return;
		
		//检查数据是否有效
		if (JxUtil.validateGrid(this.grid) == false) return;

		//复核事件代码
		if (Ext.isEmpty(eventcode)) eventcode = 'audit';
		//取复核值
		if (Ext.isEmpty(auditval)) auditval = this.audit1;

		if (this.checkAudit(auditval)) return;
		if (this.fireEvent('beforeaudit', this) == false) return;
		
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
				self.fireEvent('afteraudit', self, data);
				
				//重新加载数据
				self.grid.getStore().reload();
			};
			
			//处理检查项提示信息
			//result:{success:false, message:'', data:{}, extData:{}}
			var errorcall = function(result) {
				var extd = result.extData;
				if (extd && extd.checkMsg) {
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

		var shint = '';
 		if (auditval == self.audit0) {
			shint = jx.event.auditno;		//确定反复核当前记录吗？
 		} else if (auditval == self.audit_b) {
			shint = jx.event.auditback;		//确定退回当前记录吗？
 		} else if (auditval == self.audit_e) {
			shint = jx.event.auditcancel;	//确定注销当前记录吗？
 		} else {
			shint = jx.event.audityes;		//确定复核当前记录吗？
		}
		Ext.Msg.confirm(jx.base.hint, shint, function(btn) {
			if (btn == 'yes') hdcall();
		});
	},

	/**
	* public
	* GRID编辑新增事件
	**/
	editCreate : function() {
		//新建一个初始化的记录对象
		var g = this.grid;
		var record = this.createRecord();
		var store = g.getStore();

		//添加记录
		g.stopEditing();
		store.insert(0, record);
		
		//第一个可编辑列的位置
		var col = JxUtil.getEditCol(g);
		g.startEditing(0, col);
		//标记新增的记录为选择记录，不然表格编辑中取不到当前选择的tagRecord
		var sm = g.getSelectionModel();
		if (sm.selectRow) {
			sm.selectFirstRow();
		} else {
			sm.select(0, col);
		}
		
		if (this.fireEvent('beforecreate', this) == false) return;
	},

	/**
	* private
	* 新增一个数据记录对象。
	**/
	createRecord : function() {
		//列模型
		var cm = this.grid.getColumnModel();
		//数据存储
		var store = this.grid.getStore();
		var record = new (store.reader.recordType)({});
		var cols = record.fields.keys;

		//给每个字段给缺省值
		for (var i = 0; i < cols.length; i++){
			var colobj = cm.getColumnById(cols[i]);
			var defaultval = (colobj) ? colobj.defaultval : '';
			if (typeof defaultval == 'string' && defaultval.indexOf('fun_') == 0) {
				var val = eval('JxDefault.' + defaultval.split('fun_')[1]);
				record.set(cols[i], val);
			} else if (typeof defaultval == 'undefined') {
				record.set(cols[i], '');
			} else {
				record.set(cols[i], defaultval);
			}
		}

		return record;
	},
	
	/**
	* private
	* 明细表格删除、保存记录后统计子表数据更新到主表中。
	* 工具方法，与GridEvent类无关。
	**/
	substat : function(subGrid) {
		var params = 'funid=sysevent&pagetype=subgrid&eventcode=substat';
		//取外键值
		var fkv = subGrid.fkValue ? subGrid.fkValue : '';
		if (Ext.isEmpty(fkv)) return;
		params += '&fkValue=' + fkv;
		
		//添加主功能ID
		var pfunId = subGrid.gridNode.parentNodeId;
		if (Ext.isEmpty(pfunId)) return;
		params += '&pfunid=' + pfunId;
		
		//把统计结果写到主表单中
		var endcall = function(data) {
			if (Ext.isEmpty(data)) return;
			
			//取到主表单对象；如果直接切换到明细表，则myRecord还是空
			var form = JxUtil.getParentForm(subGrid);
			if (!Ext.isEmpty(form) && form.myRecord) {
				var record = form.myRecord;
				Ext.iterate(data, function(key, value){
					form.oset(key, value);
					record.set(key, value);
				});
				record.commit();
			} else {
			//如果没有Form表单页面，则直接取Grid中的记录修改
				var mGrid = JxUtil.getParentGrid(subGrid);
				if (mGrid) {
					var records = JxUtil.getSelectRows(mGrid);
					if (records && records.length > 0) {
						var record = records[0];
						Ext.iterate(data, function(key, value){
							record.set(key, value);
						});
						record.commit();
					}
				}
			}
		};
		
		//发送请求
		Request.postRequest(params, endcall);
	},

	/**
	* public
	* GRID编辑删除事件
	**/
	editDelete : function() {
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selected(records)) return;

		if (this.checkAudit()) return;
		if (this.fireEvent('beforedelete', this, records) == false) return;

		var self = this;
		var pkcol = self.define.pkcol;
		var store = self.grid.getStore();
		var hdcall = function() {
			//取选择记录的主键值
			var keys = '';
			for (var i = 0; i < records.length; i++) {
				//如果是一条空记录，直接删除
				var k = records[i].get(pkcol);
				if (k == null || k.length == 0) {
					store.remove(records[i]);
				} else {
					keys += '&keyid=' + records[i].get(pkcol);
				}
			}
			//如果是空记录，不需要复核后台
			if (keys.length == 0) return true;

			//设置请求的参数
			var params = 'funid='+ self.define.nodeid + keys;
			params += '&pagetype=editgrid&eventcode=delete_eg';

			//删除后要处理的内容
			var endcall = function(data) {
				//统计主表中的统计字段值
				if (self.grid.gridNode.param.substat) {
					self.substat(self.grid);
				}
				self.fireEvent('afterdelete', self, data);
				
				//重新加载数据
				self.grid.getStore().reload();
			};

			//发送请求
			Request.postRequest(params, endcall);
		};
		//确定删除选择的记录吗？
		Ext.Msg.confirm(jx.base.hint, jx.event.delyes, function(btn) {
			if (btn == 'yes') hdcall();
		});
	},

	/**
	* public
	* GRID编辑复制事件
	**/
	editCopy : function() {
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selected(records)) return;

		if (this.fireEvent('beforecopy', this) == false) return;

		//取选择记录的主键值
		var keys = '';
		var pkcol = this.define.pkcol;
		for (var i = 0; i < records.length; i++) {
			keys += '&keyid=' + records[i].get(pkcol);
		}

		var self = this;
		var hdcall = function(text) {
			//取选择记录的主键值
			var params = 'funid='+ self.define.nodeid;
			params += keys + '&copynum='+text;
			
			//添加树型参数
			var attr = self.grid.treeNodeAttr;
			if (attr) {
				var parentId = attr.id;
				var levelCol = attr.node_level;
				params += '&parentId=' + parentId + '&levelCol=' + levelCol;
			}
			
			//设置请求的参数
			params += '&pagetype=grid&eventcode=copy_eg';

			//复制后刷新数据
			var endcall = function(data) {
				//统计主表中的统计字段值
				if (self.grid.gridNode.param.substat) {
					self.substat(self.grid);
				}
				self.fireEvent('aftercopy', self, data);
				
				self.grid.getStore().reload();
			};

			//发送请求
			Request.postRequest(params, endcall);
		};
		//请输入复制记录条数
		Ext.MessageBox.prompt(jx.base.hint, jx.event.copynum, function(btn, text) {
			if (btn != 'ok') return;
			if (text.length == 0 || isNaN(text)) {
				JxHint.alert(jx.event.nocopynum);
				return;
			}
			
			if (text < 1) text = '1';
			hdcall(text);
		},null,null,'1');
	},

	/**
	* public
	* GRID编辑保存事件
	**/
	editSave : function() {
		var cm = this.grid.getColumnModel();
		var store = this.grid.getStore();
		var mrow = store.getModifiedRecords();
		if (mrow.length == 0) {
			//JxHint.alert(jx.event.nomodify);	//没有修改记录，不需要保存！
			return;
		}
		if (this.fireEvent('beforesave', this) == false) return;

		//取选择记录的主键值
		var keys = '';
		var pkcol = this.define.pkcol;

		var self = this;
		for (var i = 0, n = mrow.length; i < n; i++) {
			var record = mrow[i];
			var fields = record.fields.keys;
			//取选择记录的主键值
			keys += '&keyid=' + record.get(pkcol);

			for (var j = 0; j < fields.length; j++) {
				var name = fields[j];
				var value = record.data[name];
				if (value == null) value = '';

				var colIndex = cm.findColumnIndex(name);
				var rowIndex = store.indexOfId(record.id);
				var editor = cm.getCellEditor(colIndex, rowIndex);
				//隐藏字段为空
				if (editor == null) continue;

				var field = editor.field;
				if (field != null && !field.validateValue(value)) {
					JxHint.alert(jx.event.datavalid);	//请确保输入的数据正确完整。
					self.grid.startEditing(rowIndex, colIndex);
					return;
				}
			}
		}
		
		var params = 'funid='+ this.define.nodeid;
		//添加外键值
		var fkn = this.grid.fkName;
		if (fkn && fkn.length > 0) {
			var fkv = this.grid.fkValue ? this.grid.fkValue : '';
			if (fkv.length == 0) {
				JxHint.alert(jx.event.nofkv);	//当前记录没有外键值，不能保存！
				return;
			}
			params += '&fkValue=' + fkv;
		}
		//添加主功能ID
		var pfunId = this.grid.gridNode.parentNodeId;
		if (!Ext.isEmpty(pfunId)) {
			params += '&pfunid=' + pfunId;
		}
		
		//添加树型参数
		var attr = self.grid.treeNodeAttr;
		if (attr) {
			var parentId = attr.id;
			var levelCol = attr.node_level;
			params += '&parentId=' + parentId + '&levelCol=' + levelCol;
		}

		//设置请求的参数
		params += keys + '&pagetype=editgrid&eventcode=save_eg';
		Ext.each(mrow, function(item) {
			params += '&' + Ext.urlEncode(item.data);
		});

		//保存后要处理的内容
		var self = this;
		var endcall = function(data) {
			//复核数据修改
			store.commitChanges();
			//统计主表中的统计字段值
			if (self.grid.gridNode.param.substat) {
				self.substat(self.grid);
			}
			self.fireEvent('aftersave', self, data);

			//重新加载数据
			self.grid.getStore().reload();
		};

		//发送请求
		Request.postRequest(params, endcall);
	},
	
	/**
	* public
	* 显示html样式的审批表单
	**/
	viewHtmlReport : function() {
		var self = this;
		var funid = self.define.nodeid;
		var records = JxUtil.getSelectRows(self.grid);
		if (!JxUtil.selectone(records)) return;
		
		var keyid = records[0].get(self.define.pkcol);
		var viewReport = function (reportId) {
			var pk = self.define.pkcol.replace('__', '.');
			var whereSql = pk + ' = ?';
			
			//jxstar66328
			var params = 'funid='+ funid +'&reportId='+ reportId +'&isCheck=true&printType=html&whereSql='+
						 whereSql +'&whereValue='+ keyid +'&whereType=string';
			params += '&user_id=' + Jxstar.session['user_id'];
			//发送后台请求
			var href = Jxstar.path + "/reportAction.do?" + params;
			
			var tabPanel = self.grid.findParentByType('tabpanel');
			if (tabPanel == null || !tabPanel.isXType(Ext.TabPanel)) {
				tabPanel = new Ext.Window({
					title:'显示审批表单',
					layout:'fit',
					width:820,
					height:600,
					resizable:false,
					modal:true,
					closeAction:'close',
					items:[]
				});
			}
			
			var title = self.define.nodetitle;
			JxUtil.createReportTab(tabPanel, href, title, funid, keyid);
		};
	
		var hdCall = function(data) {
			if (data == null || data.length == 0) {
				JxHint.alert('当前功能没有审批单定义！');//没有报表定义信息！
				return;
			}
			
			viewReport(data[0].report_id);
		};
		
		//从后台取报表定义信息
		var params = 'funid=rpt_list&pagetype=grid&eventcode=checkrpt&selfunid='+ funid +'&dataid='+ keyid +'&repttype=form&wheresql=';
		Request.dataRequest(params, hdCall);
	},

	/**
	* public
	* 打开数据导入窗口；支持导入多个来源功能的数据
	**/
	dataImport : function() {
		var self = this;
		if (this.fireEvent('beforeimport', this) == false) return;
		
		//取路由定义信息，格式：{srcNodeId:"sys_event",whereSql:"fun_id='sysevent'",whereType:"",whereValue:""}
		var routes = RuleData[self.define.nodeid];
		if (!routes || routes.length == 0) { 
			JxHint.alert('没有定义导入SQL、或者没有生成SQL规则文件！');
			return false;
		}
		
		//创建并显示对话框
		var endcall = function(page, srcnode, win) {
			var title = jx.base.imp+'--'+srcnode.nodetitle;
			if (win == null) {
				win = new Ext.Window({
					tbar: tbar,
					title: title, 
					layout: 'fit',
					width: 750,
					height: 500,
					constrainHeader: true,
					resizable: true,
					border: false,
					modal: true,
					closeAction: 'close',
					autoScroll: true,
					style: 'padding: 5px;',
					items: [page]
				});
				win.show();
			} else {
				win.setTitle(title);
				win.remove(0);
				win.add(page);
				win.doLayout();
			}
		};
		
		//如果有多个来源功能，则构建一个单选栏，作为工具栏
		var tbar = null;
		if (routes.length > 1) {
			var items = [];
			var showSrcFun = function(radio) {
				if (radio.getValue() == '0') return;
				//取到来源功能ID
				var srcId = radio.inputValue;
				var win = radio.findParentByType('window');
				if (win == null) return;
				//找到来源定义对象，显示新的表格
				for (var i = 0, n = routes.length; i < n; i++) {
					if (routes[i].srcNodeId == srcId) {
						self.showImpGrid(routes[i], endcall, win);
						break;
					}
				}
			};
				
			for (var i = 0, n = routes.length; i < n; i++) {
				var srcId = routes[i].srcNodeId;//来源功能ID
				var srcnode = Jxstar.findNode(srcId);//来源功能定义
				var srcName = srcnode ? srcnode.nodetitle : srcId;//来源功能名称

				var item = {xtype:'radio', boxLabel:srcName, name:'impSrcNodeId', inputValue:srcId, handler:showSrcFun};
				if (i == 0) {
					item.checked = true;
				}
				items[i] = item;
			}
			//构建多个来源功能的工具栏
			tbar = new Ext.Toolbar({deferHeight:true, style:'border-bottom-width:0;', items:items});
		}
		
		self.showImpGrid(routes[0], endcall);
	},
	
	//private 构建一个数据导入的Grid
	//回调方法是处理表格页面加载后的回调
	showImpGrid : function(route, endcall, win) {
		var self = this;
		var fkValue = self.grid.fkValue; 
		var srcNodeId = route.srcNodeId;
		var layout = route.layout;
		var whereSql = route.whereSql||'';
		var whereType = route.whereType||'';
		var whereValue = route.whereValue||'';
		
		//添加括弧
		if (whereSql.length > 0) {
			whereSql = '(' + whereSql + ')';
		}
		
		//解析过滤语句中的外键值，在导入明细记录时有用，注意{FKEYID}必须是第一参数；
		if (whereSql.indexOf('{FKEYID}') >= 0) {
			whereSql = whereSql.replace('\{FKEYID\}', '?');
			whereType = whereType.length == 0 ? 'string' : 'string;'+whereType;
			whereValue = whereValue.length == 0 ? fkValue : fkValue+';'+whereValue;
		}
		
		//扩展过滤语句与参数
		if (typeof self.dataImportParam == 'function') {
			var options = self.dataImportParam(srcNodeId);
			if (!options) return;
			
			if (options.whereSql != null && options.whereSql.length > 0) {
				if (whereSql.length > 0) {
					whereSql += ' and (' + options.whereSql + ')';
				} else {
					whereSql = options.whereSql;
				}
			}
			
			if (options.whereType != null && options.whereType.length > 0) {
				if (whereType.length > 0) whereType += ';';
				whereType += options.whereType;
			}
			
			if (options.whereValue != null && options.whereValue.length > 0) {
				if (whereValue.length > 0) whereValue += ';';
				whereValue += options.whereValue;
			}
		}
		//JxHint.alert(whereSql);
		//加载数据
		var loaddata = function(grid) {
			//显示数据
			JxUtil.delay(500, function(){
				//如果自定义了查找导入数据表格的方法，则采用自定义方法
				if (typeof self.dataImportGrid == 'function') {
					grid = self.dataImportGrid(grid, srcNodeId);
				} else {
					//如果采用了导入布局页面
					if(!grid.isXType('grid')){
						var tree = grid.getComponent(0).getComponent(0);
						//如果左边是树形页面
						if(tree.isXType('treepanel')){
							//如果右边是表格页面，处理tree-grid布局
							if (grid.getComponent(1).getComponent(0).isXType('grid')) {
								grid = grid.getComponent(1).getComponent(0);
							}else if(grid.getComponent(1).getComponent(0).isXType('tabpanel')){
							//如果右边是tabpanel页面，处理tree-grid+from布局
								grid = grid.getComponent(1).getComponent(0).getComponent(0).getComponent(0);
							}else{
								JxHint.alert('找不到表格页面！');
							}
						}
						//如果左边不是树形页面
						else{
							//如果是tabpanel页面，处理grid-from布局
							if(grid.isXType('tabpanel')){
								grid = grid.getComponent(0).getComponent(0);
							}else{
							//处理grid-grid布局
								grid = grid.getComponent(1).getComponent(0);
								if(!grid.isXType('grid')){
									grid = grid.getComponent(0).getComponent(0);
									if(!grid.isXType('grid'))
										JxHint.alert('找不到表格页面！');
								}
							}
						}
					}
				}

				//设置外键值与目标功能ID
				grid.destParentId = fkValue;
				grid.destNodeId = self.define.nodeid;
				grid.destGrid = self.grid;
				//删除GRID的自定义参数
				grid.on('beforedestroy', function(gp){
					gp.destParentId = null;		delete gp.destParentId;
					gp.destNodeId = null;		delete gp.destNodeId;
					gp.destGrid = null;			delete gp.destGrid;
					gp = null;
					return true;
				});

				Jxstar.loadData(grid, {where_sql:whereSql, where_value:whereValue, where_type:whereType});
			});
		};
		
		var srcnode = Jxstar.findNode(srcNodeId);
		if (layout == null || layout.length == 0) {
			layout = srcnode.gridpage;
		}
		
		//异步加载功能对象后再显示
		var hdcall = function(f) {
			var pagetype = 'import';
			var page = f(srcnode, {pageType:pagetype});
			if (typeof page.showPage == 'function') {
				page = page.showPage(pagetype);
			}
			
			endcall(page, srcnode, win);
			loaddata(page);
		};

		//异步从JS文件加载功能对象
		Request.loadJS(layout, hdcall);
	},

	/**
	* public
	* 执行数据导入事件
	**/
	imp : function() {
		var self = this;
		var tb = self.grid.getTopToolbar();
		//如果没有导入按钮，则不执行；因为有时用导入数据窗口做自定义事件
		if (!JxUtil.getButton(tb, 'import')) return;
		
		var records = JxUtil.getSelectRows(self.grid);
		if (!JxUtil.selected(records)) return;

		//按钮不可用
		JxUtil.disableButton(tb, true);
		
		//取选择记录的主键值
		var keys = '';
		var pkcol = self.define.pkcol;
		for (var i = 0; i < records.length; i++) {
			keys += '&keyid=' + records[i].get(pkcol);
		}

		//目标功能外键值
		var parentId = self.grid.destParentId;
		//目标功能ID
		var destFunId = self.grid.destNodeId;
		//设置请求的参数
		var params = 'funid='+ self.define.nodeid + '&destfunid=' + destFunId + keys;
		params += '&parentId='+ parentId +'&pagetype=import&eventcode=import';
		
		//导入后刷新数据
		var endcall = function(data) {
			//按钮可用
			JxUtil.disableButton(self.grid.getTopToolbar(), false);
			
			//反馈数据的格式为：{srcFunId:'', destFunId:'', data:[{impKeyId:'', newKeyId:''}...]}
			self.fireEvent('afterimport', self, 
				{srcFunId:self.define.nodeid, destFunId:destFunId, data:data});
				
			self.grid.getStore().reload();
			
			var destGrid = self.grid.destGrid;
			if (destGrid != null) {
				//统计主表中的统计字段值
				if (destGrid.gridNode.param.substat) {
					self.substat(destGrid);
				}
				destGrid.getStore().reload();
			}
		};

		//发送请求
		Request.postRequest(params, endcall);
	},
	
	/**
	* public
	* 清除选择记录，创建一条空记录执行双击事件，
	**/
	clearRecord: function() {
		this.grid.getSelectionModel().clearSelections();
		
		this.grid.fireEvent('rowclick', this.grid);
		this.grid.fireEvent('rowdblclick', this.grid);
	},
	
	/**
	* public
	* 选择记录，执行双击事件
	**/
	selRecord: function() {
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selected(records)) return;
		
		this.grid.fireEvent('rowclick', this.grid);
		this.grid.fireEvent('rowdblclick', this.grid);
	},
	
	/**
	* public
	* 直接添加附件，需要指定附件所属的字段名
	* attachField -- 缺省情况Ext会把当前按钮作为参数传递过来；
	*                此字段的用途是标示当前附件需要上传到哪个字段中，
	*                通过该字段可以在报表中定义输出，一般是用于图片输出
	**/
	addAttach: function(attachField) {
		//缺省是当前按钮
		if (attachField != null && attachField.isXType && attachField.isXType('button')) attachField = null;
		//需要传递到后台的参数值
		var dataId, dataFunId, dataField, tableName;
		//是否保存缩略图
		var is_imageresize = Jxstar.systemVar.sys__attach__img_resize||'0';
		
		//取当前功能ID
		var nodeid = this.define.nodeid;
		var isAttach = this.define.isAttach;
		//如果是图文附件功能的新增按钮
		if (nodeid == 'sys_attach' || nodeid == 'project_attach' || isAttach) {
			//取来源数据记录ID
			dataId = this.grid.attachDataId || '';
			//取来源数据功能ID
			dataFunId = this.grid.attachFunId || '';
			//取来源数据字段名称，如图片字段
			dataField = attachField || '';
		} else {
			var records = JxUtil.getSelectRows(this.grid);
			if (!JxUtil.selectone(records)) return;
			var pkcol = this.define.pkcol;
			
			dataId = records[0].get(pkcol);
			dataFunId = nodeid;
			dataField = attachField || '';
			tableName = this.define.tablename;
		}
		if (dataId.length == 0) {
			JxHint.alert(jx.event.noup);	//没有选择上传附件的记录
			return;
		}
		if (dataFunId.length == 0) {
			JxHint.alert(jx.event.noupfun);	//无法识别上传附件的功能！
			return;
		}
		//-----------------传递参数的判断-------------------
		var self = this;
		//-----------------如果是集中附件管理，则采用跨域上传的方式------------------
		if (Jxstar.systemVar.uploadType == '1') {
			var url = Jxstar.systemVar.uploadUrl;
			var showIframe = function() {
				var ifrHtml = '<iframe frameborder="no" style="display:none;border-width:0;width:100%;height:100%;"></iframe>';
				var win = new Ext.Window({
					title:'上传附件', layout:'fit', width:400, height:160,
					modal: true, closeAction:'close', html: ifrHtml,
					listeners: {show:function(cmp){
						var href = url + "/jxstar/other/jsp/uploadfield.jsp?dataid=" + dataId + "&datafunid=" + dataFunId + 
							"&is_imageresize="+ is_imageresize +"&attach_field=" + dataField + '&user_id=' + Jxstar.session['user_id'];
						if (dataField && dataField.length > 0) {
							href += '&eventcode=fcreate&table_name=' + tableName;
						}

						var frm = cmp.getEl().child('iframe');
						frm.dom.src = href + '&_dc=' + (new Date()).getTime();//避免缓存
						frm.show();
					}}
				});
				win.on('close', function(){
					if (nodeid == 'sys_attach' || nodeid == 'project_attach' || isAttach) {
						self.grid.getStore().reload();
					}
				});
				win.show();
			};
			showIframe();

			return;
		}
		
		//表单参数
		var formItems = [{
			xtype: 'fileuploadfield',
			useType: 'file',
			maxLength: 200,
			fieldLabel: jx.event.selfile,	//选择文件
			name: attachField || 'attach_path',
			labelSeparator:'*', 
			buttonText: '',
			buttonCfg: {
				iconCls: 'upload_icon'
			},
			listeners:{
				fileselected: function(f, path) {
					var len = path.length;
					if (len > 0) {
						var pos = path.lastIndexOf('\\');
						if (pos >= 0) {
							path = path.substr(pos+1, len);
						}
					}
					queryForm.getForm().findField('attach_name').setValue(path);
				}
			}
		},{
			xtype: 'textfield',
			fieldLabel: jx.event.upname,	//附件名称
			name: 'attach_name',
			labelSeparator:'*', maxLength:200
		}];
		var formHeight = 160;
		//自定义资料类型控件
		var comboType = this.grid.attachTypeCombo;
		if (comboType) {
			if (typeof comboType == 'function') {
				comboType = comboType();
			}
			formHeight = 190;
			formItems.insert(0, comboType);
		};
		
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
				items: formItems
			});

		//创建对话框
		var win = new Ext.Window({
			title:jx.event.uptitle,	//上传附件
			layout:'fit',
			width:400,
			height:formHeight,
			resizable: false,
			modal: true,
			closeAction:'close',
			items:[queryForm],

			buttons: [{
				text:jx.base.ok,	//确定
				handler:function(){
					var form = queryForm.getForm();
					if (!form.isValid()) return;
					
					//上传参数
					var params = 'funid=sys_attach&pagetype=editgrid&is_imageresize='+ is_imageresize;
						params += '&attach_field='+ dataField +'&dataid='+ dataId +'&datafunid='+ dataFunId;
					//针对字段保存附件
					if (dataField && dataField.length > 0) {
						params += '&eventcode=fcreate&table_name=' + tableName;
					} else {
						params += '&eventcode=create';
					}
					//因为form发送post请求时取的显示值，所以要转换一下
					var attach_type = form.get('attach_type_combo');
					if (attach_type.length > 0) {
						params += '&attach_type=' + attach_type;
					}
					
					//上传成功后关闭窗口并刷新数据
					var hdCall = function() {
						win.close();
						if (nodeid == 'sys_attach' || nodeid == 'project_attach' || attachField || isAttach) {
							self.grid.getStore().reload();
						}
					};
					//上传附件
					Request.fileRequest(form, params, hdCall);
				}
			},{
				text:jx.base.cancel,	//取消
				handler:function(){win.close();}
			}]
		});
		win.show();
	}, 

	/**
	* public
	* 管理图文资料
	**/
	upload : function() {
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selectone(records)) return;
		
		var self = this;
		var pkcol = this.define.pkcol;
		var nodeid = this.define.nodeid;
		var keyid = records[0].get(pkcol);
		//标示附件是否可删除，有audit字段，则根据audit值判断，否则根据attachDeled属性判断
		var deled = false, acol = self.define.auditcol;
		if (!Ext.isEmpty(acol)) {
			var audit = records[0].get(acol);
			if (audit == self.audit0 || audit == self.audit6) {
				deled = true;
			}
		} else {
			var attr = self.define.attachDeled;
			deled = (Ext.isEmpty(attr)) ? false : attr;
		}
		
		if (keyid == null || keyid.length == 0) {
			JxHint.alert(jx.event.nosave);
			return;
		}
		
		//过滤条件，支持扩展方法（个人消息查看功能）
		var options = {};
		if (typeof self.uploadWhereParam == 'function') {
			options = self.uploadWhereParam();
		} else {
			var tablename = self.define.tablename;
			options.where_sql = 'sys_attach.data_id = ? and sys_attach.table_name = ?';
			options.where_type = 'string;string';
			options.where_value = keyid+';'+tablename;
		}
		//扩展资料类型控件
		var comboType = null;
		if (typeof self.grid.attachTypeCombo == 'function') {
			comboType = self.grid.attachTypeCombo();
		}
		
		//加载数据
		var hdcall = function(grid) {
			//显示数据
			//JxUtil.delay(500, function(){//加延时后，在网络慢时attachDataId没赋值
				//设置目标功能信息
				grid.attachDataId = keyid;
				grid.attachFunId = nodeid;
				grid.attachDeled = deled;
				if (comboType) {//如果有自定义类型，则覆盖
					grid.attachTypeCombo = comboType;
				}
				//删除GRID的自定义参数
				grid.on('beforedestroy', function(gp){
					gp.attachDataId = null;		delete gp.attachDataId;
					gp.attachFunId = null;		delete gp.attachFunId;
					gp.attachDeled = null;		delete gp.attachDeled;
					gp.attachTypeCombo = null;	delete gp.attachTypeCombo;
					gp = null;
					return true;
				});
				Jxstar.loadData(grid, options);
			//});
		};

		var srcDefine = Jxstar.findNode('sys_attach');
		//显示数据
		Jxstar.showData({
			filename: srcDefine.gridpage,
			title: srcDefine.nodetitle, 
			pagetype: 'editgrid',
			nodedefine: srcDefine,
			callback: hdcall
		});
	},

	/**
	* public
	* 另存结果集为xls文件
	**/
	expxls : function() {
		JxExport.showWindow(this.grid.gridNode);
	},

	/**
	* public
	* 打印当前记录
	**/
	print : function() {
		JxPrint.showWindow(this.grid.gridNode);
	},
	/*系统升级需修改  begin*/
	/**
	 * 自定义添加 huan add
	 */
	printHtmlCus:function (reportId){
		var reportId=Jxstar.systemVar[reportId.replace(/(\.)/g,'__')];
		var funId = this.grid.gridNode.nodeId;
		var printType='html';//'输出HTML',
		var printScope='select';	//'输出选择的记录'
		JxPrint.exePrint(this.grid.gridNode, funId, reportId, printType, printScope, '0');
	},
	/**
	 * 导出相关SQL
	 */
	exportRelatSql:function(){
		var self=this;
		var records = JxUtil.getSelectRows(self.grid);
		if (!JxUtil.selected(records)) return;
		var hdcall = function() {
			var params = 'funid='+self.define.nodeid+'&pagetype=grid&eventcode=exportRelatSql';
			for (var i = 0; i < records.length; i++) {
				params += '&keyid=' + records[i].get(self.define.pkcol);
			}
			var endcall = function(data) {
				var url=data.url;
				window.open(Jxstar.path+url);
			};
			Request.postRequest(params, endcall);
		};
		 hdcall();
	},
	
	/**
	 * 自定义添加结束 huan add
	 */
	/*系统升级需修改  end*/	
	/**
	* public 
	* 批量审批同意选择的记录。
	**/
	agree: function() {
		this.basecheck('Y');
	},
	/**
	* public 
	* 退回编制人。
	**/
	chkback: function() {
		this.basecheck('E');
	},
	//基础审批方法
	basecheck: function(checkType) {
		var store = this.grid.getStore();
		var mrow = store.getModifiedRecords();
		if (mrow.length > 0) {
			//记录已被修改，是否需要先保存？
			if (confirm(jx.event.saveyes)) {
				this.editSave();
				return false;
			} else {
				store.rejectChanges();
			}
		}
		
		var self = this;
		var records = JxUtil.getSelectRows(self.grid);
		if (!JxUtil.selected(records)) return;

		var hdcall = function() {
			var params = 'funid=wf_assign&pagetype=chkgrid&eventcode=execheck&check_funid='+ self.define.nodeid;
			for (var i = 0; i < records.length; i++) {
				params += '&keyid=' + records[i].get(self.define.pkcol);
			}
			//缺省审批同意
			var checkDesc = jx.event.agree;	//同意
			if (checkType == 'E') checkDesc = jx.wf.advnew; //退回编制人
			params += '&check_type='+ checkType +'&check_desc='+ encodeURIComponent(checkDesc);
			
			var endcall = function(data) {
				//重新加载数据
				self.grid.getStore().reload();
			};
			
			Request.postRequest(params, endcall);
		};
		//确定审批同意选择的记录吗？
		var hintDesc = jx.event.agreeyes;
		if (checkType == 'E') hintDesc = jx.event.auditback;
		Ext.Msg.confirm(jx.base.hint, hintDesc, function(btn) {
			if (btn == 'yes') hdcall();
		});	
	},
	
	/**
	* public 
	* 弹出完成分配任务界面。
	**/
	check: function() {
		var store = this.grid.getStore();
		var mrow = store.getModifiedRecords();
		if (mrow.length > 0) {
			//记录已被修改，是否需要先保存？
			if (confirm(jx.event.saveyes)) {
				this.editSave();
				return false;
			} else {
				store.rejectChanges();
			}
		}
	
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selected(records)) return;
		
		//审批确定后会刷新该表格，在check_work.js文件中用到了这个全局变量。
		JxUtil.myCheckGrid = this.grid;
		
		if (records.length > 1) {
			this.checkMore(records);
		} else {
			this.baseWf('check_work');
		}
	},
	
	//批量审批多条记录
	checkMore: function(records) {
		var self = this;
		var dataId = records[0].get(self.define.pkcol);
		var dataIds = '';
		for (var i = 0, n = records.length; i < n; i++) {
			dataIds += records[i].get(self.define.pkcol);
			if (i < n-1) dataIds += ',';
		}
		
		var appData = {funId:self.define.nodeid, dataId:dataId, dataIds:dataIds};
		JxUtil.showCheckWindow(appData, 'check_work');
	},
	
	/**
	* public 
	* 弹出查看分配任务表格界面。
	**/
	showassign: function() {
		this.baseWf('check_assign');
	},
	
	/**
	* public 
	* 弹出查看流程执行历史表格界面。
	**/
	showhis: function() {
		this.baseWf('check_his');
	},
	
	/**
	* public 
	* 弹出查看流程图界面。
	**/
	showmap: function() {
		this.baseWf('check_map');
	},
	
	/**
	* public 
	* 查看当前有哪些过程实例。
	**/
	showlist: function() {
		var dataId = '';
		var records = JxUtil.getSelectRows(this.grid);
		if (records.length > 0) {
			var pkcol = this.define.pkcol;
			dataId = records[0].get(pkcol) || '';
		}
	
		var funId =  this.define.nodeid;
		var appData = {funId:funId, dataId:dataId};
		JxUtil.showCheckWindow(appData, 'check_list');
	},
	
	/**
	* private 
	* 查看流程信息的基础函数。
	**/
	baseWf: function(fileName) {
		var funId =  this.define.nodeid;
		this.showWorkFlow(funId, fileName);
	},
	
	/**
	* public 
	* 查看数据修改日志。
	**/
	editLog: function() {
		var records = JxUtil.getSelectRows(this.grid);
		if (!JxUtil.selectone(records)) return;
		
		var pkcol = this.define.pkcol;
		var nodeid = this.define.nodeid;
		var keyid = records[0].get(pkcol);
		if (keyid == null || keyid.length == 0) {
			JxHint.alert(jx.event.nosave);
			return;
		}
		
		//过滤条件
		var options = {};
			options.where_sql = '(fun_id = ? and data_id = ?) or (pfun_id = ? and pdata_id = ?)';
			options.where_type = 'string;string;string;string';
			options.where_value = nodeid+';'+keyid+';'+nodeid+';'+keyid;
		
		//加载数据
		var hdcall = function(grid) {
			JxUtil.delay(500, function(){Jxstar.loadData(grid, options);});
		};

		var df = Jxstar.findNode('sys_log_edit');
		//显示数据
		Jxstar.showData({
			filename: df.gridpage,
			title: df.nodetitle, 
			pagetype: 'editgrid',
			nodedefine: df,
			pagetype: 'query',
			callback: hdcall
		});
	},
	
	/**
	* private 
	* 查看流程信息的基础函数，支持查询功能中查看业务功能的审批信息。
	**/
	showWorkFlow: function(funId, fileName) {
		var self = this;
		var records = JxUtil.getSelectRows(self.grid);
		if (!JxUtil.selected(records)) return;//如果选择了多条，缺省取第1条记录
		
		var dataId = records[0].get(self.define.pkcol);
		
		var appData = {funId:funId, dataId:dataId};
		JxUtil.showCheckWindow(appData, fileName);
	},
	
	/**
	* public 
	* 处理附件中的图片浏览功能
	**/
	showPicture: function() {
		var self = this;
		var records = JxUtil.getSelectRows(self.grid);
		if (!JxUtil.selected(records)) return;
		
		var funId = self.define.nodeid;
		//从附件目录中取图片文件
		var url = Jxstar.path + '/commonAction.do?funid=sys_attach&pagetype=editgrid&eventcode=showpic&selfunid='+ funId;
		url += '&dataType=json&user_id='+Jxstar.session['user_id'];
		
		for (var i = 0, n = records.length; i < n; i++) {
			var keyid = records[i].get(self.define.pkcol);
			url += '&keyid=' + keyid;
		}
		
		var viewPicture = function (url) {
			var tabPanel = self.grid.findParentByType('tabpanel');
			
			var shower = new ImageShower({parentCtl:tabPanel, url:url});
			var tab = shower.show();
			tabPanel.activate(tab);
		};
		viewPicture(url);
	},
	
	/**
	* public 
	* 导入excel数据
	**/
	impExcel: function(imp_index) {
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
				text:'下载模板',
				handler:function(){
					var params = 'funid=imp_list&impFunId='+ nodeid +'&pagetype=grid&eventcode=downtpl&impIndex='+ impIndex;
					Request.fileDown(params);
				}
			},{
				text:jx.base.ok,
				handler:function(){
					var form = queryForm.getForm();
					if (!form.isValid()) return;
					
					//当前功能外键值
					var fkValue = self.grid.fkValue;
					//上传参数
					var params = 'funid='+ nodeid +'&pagetype=grid&eventcode=impexcel&fkValue='+ fkValue +'&impFunId='+ nodeid + '&impIndex='+ impIndex;
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
	
	/**
	* public 
	* 直接打印
	* printMode -- 输出模式：0 预览，1 直接打印
	* printType -- 输出类型：html|xls
	* printScope -- 输出范围：select 选择，query 当前查询结果
	* reportId -- 报表定义ID：空表示取缺省报表，非空表示取指定报表
	**/
	dirPrint: function(printMode, printScope, printType, reportId) {
		if (!Ext.isString(printMode)) {
			printMode = '0'
		}
		
		printMode = printMode||'0';
		printScope = printScope||'select';
		printType = printType||'html';
		reportId = reportId||'';
		
		var pageNode = this.grid.gridNode;
		var funId = this.define.nodeid;
		//pageNode, funId, reportId, printType, printScope, printMode
		JxPrint.exePrint(pageNode, funId, reportId, printType, printScope, printMode);
	},
	
	/**
	* public 
	* 批量显示选择记录的图片
	**/
	showPic: function() {
		var self = this;
		var records = JxUtil.getSelectRows(self.grid);
		if (!JxUtil.selected(records)) return;
		
		//从附件目录中取图片文件
		var pkcol = self.define.pkcol;
		var funId = self.define.nodeid;
		var tablename = self.define.tablename;
		var url = Jxstar.path + '/commonAction.do?funid='+ funId +'&pagetype=grid&eventcode=showpic&tablename='+ tablename;
		url += '&dataType=json&user_id='+Jxstar.session['user_id'];
		for (var i = 0, n = records.length; i < n; i++) {
			var keyid = records[i].get(pkcol);
			url += '&keyid=' + keyid;
		}
		
		var viewPicture = function (url) {
			var tabPanel = self.grid.findParentByType('tabpanel');
			if (tabPanel) {
				var shower = new ImageShower({parentCtl:tabPanel, url:url});
				var tab = shower.show();
				tabPanel.activate(tab);
			}
		};
		viewPicture(url);
	},
	
	/**
	* public 
	* 刷新数据
	**/
	refresh: function() {
		this.grid.getStore().reload();
	}
});

})();
