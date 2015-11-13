/*
 * Copyright 2011 Guangzhou Donghong Software Technology Inc. Licensed under the
 * www.jxstar.org
 */
Jxstar.currentPage = {
	nodeId : "",
	target : "",
	createDesign : function(nodeId, target) {
		if (nodeId == null || nodeId.length == 0) {
			JxHint.alert(jx.star.noid);
			return
		}
		this.nodeId = nodeId;
		this.target = target;
		var a = (new Date()).getTime();
		var self = this;
		var hdCall = function(f) {
			var node = (eval(f))();
			node.config.eventcfg = self.createEventCfg(nodeId);
			node.setState("1");
			/**
			 * 自定义修改，添加node.config.param.replace 属性控制功能设计器表格设计页面的表格不会被
			 * 自定义表格设计保存的设计文件覆盖
			 */
			node.config.param.replace=false;
			var page = node.showPage();
			if (page == null) {
				return
			}
			var subpage = target.getComponent(0);
			if (subpage != null) {
				target.remove(subpage, true)
			}
			var store = page.getStore();
			var record = new (store.reader.recordType)({});
			store.add(record);
			target.add(page);
			target.doLayout();
			var b = (new Date()).getTime();
			JxHint.hint("use time(ms): " + (b - a))
		};
		var params = "funid=sys_fun_base&eventcode=query_griddes&projectpath="
				+ Jxstar.session.project_path;
		params += "&selfunid=" + nodeId;
		Request.dataRequest(params, hdCall, {
					type : "xml",
					wait : true
				})
	},
	createEventCfg : function(e) {
		var c = this;
		var a = function() {
			var g = function() {
				var i = "funid=sys_fun_base&eventcode=deletegd";
				i += "&selfunid=" + e + "&selpagetype=grid";
				var h = function() {
					c.createDesign(c.nodeId, c.target)
				};
				Request.postRequest(i, h)
			};
			Ext.Msg.confirm(jx.base.hint, jx.fun.delyes, function(h) {
						if (h == "yes") {
							g()
						}
					})
		};
		var b = function() {
			var h = "funid=sys_fun_base&eventcode=savegd";
			h += "&selfunid=" + e + "&selpagetype=grid";
			var g = this.grid.getState();
			var o = this.grid.colModel;
			var k = g.columns;
			var m = "";
			if (k) {
				for (var j = 0, l = k.length; j < l; j++) {
					var p = k[j];
					var n = o.getColumnById(p.id);
					if (n) {
						if (!(n.dataIndex) || n.dataIndex.length == 0) {
							continue
						}
						m += "{";
						m += "n:" + n.dataIndex + ",";
						m += "w:" + p.width + ",";
						m += "h:" + (p.hidden ? "true" : "false");
						m += "}-"
					}
				}
				if (k.length > 0) {
					m = m.substring(0, m.length - 1)
				}
			}
			h += "&content=" + m;
			Request.postRequest(h, null)
		};
		var f = function() {
			var g = "funid=sys_fun_base&eventcode=creategd";
			g += "&selfunid=" + e + "&selpagetype=grid&projectpath="
					+ Jxstar.session.project_path;
			Request.postRequest(g, null)
		};
		var d = function() {
			var g = {
				where_sql : "fun_attr.attr_type = ? and fun_attr.fun_id = ?",
				where_type : "string;string",
				where_value : "grid;" + e
			};
			var h = function(j) {
				JxUtil.delay(500, function() {
							j.fkValue = e;
							j.attr_type = "grid";
							Jxstar.loadData(j, g)
						})
			};
			var i = Jxstar.findNode("fun_attrdes");
			Jxstar.showData({
						filename : i.gridpage,
						title : i.nodetitle,
						width : 760,
						height : 350,
						nodedefine : i,
						callback : h
					})
		};
		return {
			deletegd : a,
			savegd : b,
			creategd : f,
			setattr : d
		}
	}
};