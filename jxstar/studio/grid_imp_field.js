Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var impsrcData = Jxstar.findComboData('impsrc');
	var datatypeData = Jxstar.findComboData('datatype');
	var yesnoData = Jxstar.findComboData('yesno');

	var cols = [
	{col:{header:'序号', width:54, sortable:true, align:'right',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.NumberField({
			maxLength:12
		}),renderer:JxUtil.formatInt()}, field:{name:'imp_field__field_no',type:'int'}},
	{col:{header:'*字段名称', width:97, sortable:true, editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.TextField({
			maxLength:50, allowBlank:false
		})}, field:{name:'imp_field__field_name',type:'string'}},
	{col:{header:'字段标题', width:111, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:50
		})}, field:{name:'imp_field__field_title',type:'string'}},
	{col:{header:'*来源', width:66, sortable:true, defaultval:'1', align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: impsrcData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: impsrcData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < impsrcData.length; i++) {
				if (impsrcData[i][0] == value)
					return impsrcData[i][1];
			}
		}}, field:{name:'imp_field__data_src',type:'string'}},
	{col:{header:'位置', width:57, sortable:true, editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.TextField({
			maxLength:20
		})}, field:{name:'imp_field__field_pos',type:'string'}},
	{col:{header:'*数据类型', width:65, sortable:true, align:'center',
		editable:true, hcss:'color:#0000ff;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: datatypeData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false, allowBlank:false,
			value: datatypeData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < datatypeData.length; i++) {
				if (datatypeData[i][0] == value)
					return datatypeData[i][1];
			}
		}}, field:{name:'imp_field__data_type',type:'string'}},
	{col:{header:'必填?', width:55, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: yesnoData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: yesnoData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < yesnoData.length; i++) {
				if (yesnoData[i][0] == value)
					return yesnoData[i][1];
			}
		}}, field:{name:'imp_field__is_must',type:'string'}},
	{col:{header:'主键', width:100, sortable:true, hidden:true}, field:{name:'imp_field__field_id',type:'string'}},
	{col:{header:'定义ID', width:100, sortable:true, hidden:true}, field:{name:'imp_field__imp_id',type:'string'}},
	{col:{header:'非新增值', width:65, sortable:true, defaultval:'0', align:'center',
		editable:true, hcss:'color:#3039b4;',
		editor:new Ext.form.ComboBox({
			store: new Ext.data.SimpleStore({
				fields:['value','text'],
				data: yesnoData
			}),
			emptyText: jx.star.select,
			mode: 'local',
			triggerAction: 'all',
			valueField: 'value',
			displayField: 'text',
			editable:false,
			value: yesnoData[0][0]
		}),
		renderer:function(value){
			for (var i = 0; i < yesnoData.length; i++) {
				if (yesnoData[i][0] == value)
					return yesnoData[i][1];
			}
		}}, field:{name:'imp_field__is_param',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '1',
		isedit: '1',
		isshow: '0',
		funid: 'imp_field'
	};
	
	
	config.initpage = function(gridNode){
		var grid = gridNode.page;
		grid.on('rowclick', function(g, rowindex, e) {
			var frm = Ext.get('frm_designer_import').dom;
			if (frm == null) return;
			var seldiv = frm.contentWindow.getSelectDiv();
			if (seldiv != null) {
				var record = g.getStore().getAt(rowindex);
				
				seldiv.oldRecord = seldiv.curRecord;
				seldiv.curRecord = record;
				seldiv.titleField = 'imp_field__field_title';
				seldiv.positionField = 'imp_field__field_pos';
			}
		});
	};
	
	config.eventcfg = {
	
		createField: function(){
			var self = this;
			var fkValue = self.grid.fkValue;
			var hdcall = function() {
				self.grid.getStore().reload();
			};
			
			var params = 'funid=imp_field&imp_id='+ fkValue +'&pagetype=editgrid&eventcode=createfield';
			
			//发送请求
			Request.postRequest(params, hdcall);
		}
	};
		
	return new Jxstar.GridNode(config);
}