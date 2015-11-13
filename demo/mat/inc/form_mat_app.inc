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