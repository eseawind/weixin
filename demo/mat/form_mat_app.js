Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};
	
	var Dataaudit = Jxstar.findComboData('audit');
	var Dataapptype = Jxstar.findComboData('apptype');
	var items = [{
		width:'97%',
		border:false,
		layout:'form',
		autoHeight:true,
		style:'padding:5 10 5 10;',
		items:[{
			anchor:'100%',
			border:false,
			layout:'column',
			border:true,
			xtype:'fieldset',
			title:'采购信息',
			collapsible:false,
			collapsed:false,
			autoHeight:true,
			items:[{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'textfield', fieldLabel:'申请单号', name:'mat_app__app_code', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'textfield', fieldLabel:'申请人', name:'mat_app__app_user', defaultval:'fun_getUserName()', readOnly:true, anchor:'100%', maxLength:20},
					{xtype:'textfield', fieldLabel:'项目名称', name:'mat_app__project_name', anchor:'100%', maxLength:50},
					{xtype:'combo', fieldLabel:'记录状态', name:'mat_app__auditing', defaultval:'0',
						anchor:'100%', readOnly:true, editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Dataaudit
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Dataaudit[0][0]},
					{xtype:'numberfield', decimalPrecision:6, format:'numdyn', fieldLabel:'采购数量', name:'mat_app__app_num', defaultval:'0', anchor:'100%', maxLength:22},
					{xtype:'hidden', fieldLabel:'主键', name:'mat_app__app_id', anchor:'100%'},
					{xtype:'hidden', fieldLabel:'申请部门ID', name:'mat_app__dept_id', defaultval:'fun_getDeptId()', anchor:'100%'},
					{xtype:'textarea', fieldLabel:'效益分析', name:'mat_app__app_analyse', width:'100%', height:72, maxLength:200}
				]
			},{
				border:false,
				columnWidth:0.495,
				layout:'form',
				style: 'padding-left:10px;',
				items:[
					{xtype:'datefield', fieldLabel:'申请日期', name:'mat_app__app_date', defaultval:'fun_getToday()', format:'Y-m-d', anchor:'100%', readOnly:true},
					{xtype:'trigger', fieldLabel:'申请部门', name:'mat_app__dept_name', defaultval:'fun_getDeptName()',
						anchor:'100%', triggerClass:'x-form-search-trigger',
						maxLength:50, editable:false,
						onTriggerClick: function() {
							var selcfg = {pageType:'combogrid', nodeId:'sys_dept', layoutPage:'/public/layout/layout_tree.js', sourceField:'sys_dept.dept_name;sys_dept.dept_code;sys_dept.dept_id;', targetField:'mat_app.dept_name;mat_app.dept_code;mat_app.dept_id;', whereSql:"is_novalid = ?", whereValue:'0', whereType:'string', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'1',queryField:'sys_dept.dept_name',likeType:'all',fieldName:'mat_app.dept_name'};
							JxSelect.createSelectWin(selcfg, this, 'node_mat_app_form');
						}},
					{xtype:'textfield', fieldLabel:'采购负责人', name:'mat_app__stock_user', anchor:'100%', maxLength:20},
					{xtype:'numberfield', decimalPrecision:6, format:'numset', fieldLabel:'预算金额万', name:'mat_app__app_money', defaultval:'0', anchor:'100%', maxLength:22},
					{xtype:'combo', fieldLabel:'申请类型', name:'mat_app__app_type', defaultval:'1',
						anchor:'100%', editable:false,
						store: new Ext.data.SimpleStore({
							fields:['value','text'],
							data: Dataapptype
						}),
						emptyText: jx.star.select,
						mode: 'local',
						triggerAction: 'all',
						valueField: 'value',
						displayField: 'text',
						value: Dataapptype[0][0]},
					{xtype:'hidden', fieldLabel:'申请人ID', name:'mat_app__app_userid', defaultval:'fun_getUserId()', anchor:'100%'},
					{xtype:'imagefield', fieldLabel:'申请理由', name:'mat_app__app_cause', width:'100%', height:72, maxLength:200}
				]
			}
			]
		}]
	}];
	
	config.param = {
		items: items,
		funid: 'mat_app'
	};

	JxFormSub.formAddSub(config);

	config.initpage = function(formNode){
		var page = formNode.page;
		
		//在顶部添加描述div
		var myDiv = new Ext.form.FieldSet({
			height: 50,
			html: '<div style="font-size:12px; color:red; line-height:20px;">描述信息：这是一个三列式布局的表单界面；<br>'+
			      'Form页面设计器中可以添加许多扩展属性，用来设计不同的Form页面布局效果</div>'
		});
		page.getComponent(0).insert(0, myDiv);
	};
	
	return new Jxstar.FormNode(config);
}