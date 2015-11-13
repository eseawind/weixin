Jxstar.currentPage = function() {
	var config = {param:{},initpage:function(page, define){},eventcfg:{}};

	var cols = [
	{col:{header:'文件名称', width:246, sortable:true}, field:{name:'sys_attach__attach_name',type:'string'}},
	{col:{header:'附件ID', width:100, sortable:true, hidden:true}, field:{name:'sys_attach__attach_id',type:'string'}},
	{col:{header:'记录ID', width:100, sortable:true, hidden:true}, field:{name:'sys_attach__data_id',type:'string'}},
	{col:{header:'表名', width:100, sortable:true, hidden:true}, field:{name:'sys_attach__table_name',type:'string'}},
	{col:{header:'附件路径', width:100, sortable:true, hidden:true}, field:{name:'sys_attach__attach_path',type:'string'}}
	];
	
	config.param = {
		cols: cols,
		sorts: null,
		hasQuery: '0',
		isedit: '0',
		isshow: '1',
		funid: 'sys_docqry'
	};
	
	config.param.selectModel = 'nocheck';

	//把文件名称改为超链接	var renderDoc = function(val, metaData, record) {		JxUtil.tmpDownFile = function(attach_id){			var uploadType = Jxstar.systemVar.uploadType || '0';			var uploadUrl = Jxstar.systemVar.uploadUrl || '';						var params = 'funid=sys_attach&keyid='+ attach_id +'&pagetype=editgrid&eventcode=down&nousercheck=1';			//发送下载请求			if (uploadType == '1') {				var url = uploadUrl + '/fileAction.do?' + params + '&dataType=byte';				Ext.fly('frmhidden').dom.src = url;			} else {				Request.fileDown(params);			}		};					var attach_id = record.get('sys_attach__attach_id');		var chgcolor = 'onmouseover="this.style.color=\'#FF4400\';" onmouseout="this.style.color=\'#0080FF\';"';		var html = '<a href="#" style=\'color:#0080FF;\' '+ chgcolor +' onclick="JxUtil.tmpDownFile(\''+ attach_id +'\');">'+ val +'</a>';		return html;	};		//把第一列的值改为超链接	cols[0].col.renderer = renderDoc;
		
	return new Jxstar.GridNode(config);
}