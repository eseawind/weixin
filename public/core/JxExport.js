/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 导出数据窗口控件。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */

JxExport = {};
(function(){

	Ext.apply(JxExport, {
	/**
	* 显示导出数据的字段对话框
	* pageNode -- 当前功能的表格定义对象，用于取表格字段对象
	**/
	showWindow: function(pageNode) {
		var colm = pageNode.page.getColumnModel();
		//取字段信息
		var fieldNames = [], mycols = colm.config;
		for (var i = 0, c = 0, n = mycols.length; i < n; i++) {
			var col = mycols[i], fn = col.dataIndex;
			console.log(col);
			if (fn && fn.length > 0) {
				var h = col.header;
				if(Ext.isNumber(h)) continue ;
					/*系统升级需修改  begin*/
				//如果字段标题包含HID 则不在导出EXCEL中显示该字段
				if(h.indexOf('HID')>=0)  continue ;
					/*系统升级需修改  end*/	
				if (h.charAt(0) == '*') h = h.substr(1);
				fieldNames[c++] = [fn, h];
			}
		}
		
		var jxLists = new JxLists({leftData:fieldNames});
		var listPanel = jxLists.render();
		
		//创建对话框
		var win = new Ext.Window({
			title:jx.base.seltitle,	//选择导出字段
			layout:'fit',
			width:400,
			height:500,
			resizable: false,
			modal: true,
			closeAction:'close',
			items:[listPanel],

			buttons: [{
				text:jx.base.ok,	//确定
				handler:function(){
					var selfields = jxLists.getSelectData();
					if (selfields.length == 0) {
						JxHint.alert(jx.base.nofield);	//没有选择要导出数据的字段，不能导出！
						return false;
					}
		
					JxExport.executeExp(pageNode, selfields);
					win.close();
				}
			},{
				text:jx.base.cancel,	//取消
				handler:function(){win.close();}
			}]
		});
		win.show();
	},
	
	/**
	* 向后台发出导出数据请求
	* pageNode -- 当前功能的表格定义对象，用于取表格字段对象
	* selfields -- 选择字段的数据
	**/
	executeExp: function(pageNode, selfields) {
		var st = pageNode.page.getStore();
		var dsOption = st.lastOptions.params || {};
		var funid = pageNode.nodeId;
		
		//请求参数
		var params = 'funid=sysevent&query_funid='+ funid;
		params += '&pagetype=grid&eventcode=expxls&dataType=xls';
		params += '&selfield='+selfields+'&zerotonull=0';
		if(st.sortInfo && st.remoteSort){//添加当前排序字段
			params += '&sort='+st.sortInfo.field+'&dir='+st.sortInfo.direction;
		}
		//导出xls文件
		Request.expFile(params, dsOption);
	}

	});//Ext.apply

})();
