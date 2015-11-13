Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'功能ID', width:123, sortable:true}, field:{name:'plet_fun__fun_id',type:'string'}},
	{col:{header:'功能名称', width:178, sortable:true}, field:{name:'plet_fun__fun_name',type:'string'}},
	{col:{header:'序号', width:79, sortable:true, defaultval:'10', align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			decimalPrecision:0, maxLength:22
		}),renderer:JxUtil.formatInt()}, field:{name:'plet_fun__fun_no',type:'int'}},
	{col:{header:'栏目ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'plet_fun__portlet_id',type:'string'}},
	{col:{header:'明细ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'plet_fun__det_id',type:'string'}},
	{col:{header:'设置类型', width:100, sortable:true, hidden:true}, field:{name:'plet_fun__set_type',type:'string'}},
	{col:{header:'个人ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'plet_fun__owner_user_id',type:'string'}},
	{col:{header:'角色ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'plet_fun__role_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '1',
		isshow: '1',
		funid: 'plet_fun'
	};
	
	
	config.eventcfg = {		getfun: function() {			var self = this;			var pfunid = self.grid.fkFunId;			if (pfunid != 'sys_user') {				JxHint.alert('只有个人才可以读取角色的常用功能设置！');				return;			}						//设置请求的参数			var params = 'funid='+ self.define.nodeid;			params += '&pagetype=editgrid&eventcode=getfun';						var endcall = function(data) {				self.grid.getStore().reload();			};						//发送请求			Request.postRequest(params, endcall);		},				showfun: function() {			var self = this;			var pfunid = self.grid.fkFunId;			var dataId = self.grid.fkValue;						var wheresql = '';			if (pfunid == 'sys_role') {				wheresql = 'reg_type in (\'main\', \'treemain\') and fun_id not in (select fun_id from plet_fun where role_id = ?)';			} else if (pfunid == 'sys_user') {				wheresql = 'reg_type in (\'main\', \'treemain\') and fun_id not in (select fun_id from plet_fun where owner_user_id = ?)';			} else {				wheresql = 'reg_type in (\'main\', \'treemain\') and fun_id not in (select fun_id from plet_fun where portlet_id = ?)';			}			var where_type = 'string';			var where_value = dataId;						//如果不是管理员，则只能选择授权的功能			if (!JxUtil.isAdminUser()) {				wheresql += ' and fun_id in (select distinct sys_role_fun.fun_id from sys_user_role, sys_role_fun where sys_user_role.role_id = sys_role_fun.role_id and sys_user_role.user_id = ? )';				where_type += ';string';				where_value += ';'+JxDefault.getUserId();			}						//显示数据			var hdcall = function(grid) {				JxUtil.delay(500, function(){					//处理树形页面的情况					if (!grid.isXType('grid')) {						grid = grid.getComponent(1).getComponent(0);					}										grid.fkGrid = self.grid;					grid.fkFunId = pfunid;					grid.fkValue = dataId;					Jxstar.loadData(grid, {where_sql:wheresql, where_value:where_value, where_type:where_type});				});			};					var define = Jxstar.findNode('sel_fun');			//显示数据			Jxstar.showData({				filename: define.layout,				title: define.nodetitle, 				pagetype: 'addgrid',				nodedefine: define,				callback: hdcall			});		}
	};
		
	return new Jxstar.GridNode(config);
}