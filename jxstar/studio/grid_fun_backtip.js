Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var texttypeData = Jxstar.findComboData('texttype');

	var cols = [
	{col:{header:'*键值', width:185, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'funall_stext__prop_key',type:'string'}},
	{col:{header:'*文字描述', width:391, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:100, allowBlank:false
		})}, field:{name:'funall_stext__prop_value',type:'string'}},
	{col:{header:'类型', width:100, sortable:true, defaultval:'sys', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: texttypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: texttypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < texttypeData.length; i++) {
				if (texttypeData[i][0] == value)
					return texttypeData[i][1];
			}
		}}, field:{name:'funall_stext__sys_type',type:'string'}},
	{col:{header:'属性ID', width:100, sortable:true, colindex:10000, hidden:true}, field:{name:'funall_stext__prop_id',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '1',
		funid: 'fun_backtip'
	};
	
	
	config.eventcfg = {
		createfile: function(){			var self = this;
			var params = 'funid=fun_backtip&pagetype=editgrid&eventcode=createfile&projectpath=' + 							Jxstar.session['project_path'];

			
			var hdcall = function() {				self.grid.getStore().reload();
			};

			//发送请求
			Request.postRequest(params, hdcall);
		}
	};		config.initpage = function(gridNode){		var event = gridNode.event;		event.on('beforesave', function(event) {			var grid = event.grid;			var store = grid.getStore();			var mrow = store.getModifiedRecords();						for (var i = 0, n = mrow.length; i < n; i++) {				var record = mrow[i];				var propkey = record.get('funall_stext__prop_key');				propkey = propkey.trim();				//键值【{0}】不合格，必需且只能有一个“.”，如aaa.bbb！				var hint = String.format(jx.fun.novalidkey, propkey);				var keys = propkey.split('.');				if (keys.length != 2) {					JxHint.alert(hint); return false;				} else {					if (keys[0].length == 0 || keys[1].length == 0) {						JxHint.alert(hint); return false;					}				}			}			return true;		});	};
		
	return new Jxstar.GridNode(config);
}