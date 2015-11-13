for (var i = 0; i < cols.length; i++) {
	if (cols[i].field.name.indexOf('__syn_info') > 0 ) {
		cols[i].col.renderer = JxUtil.wordWrap;
		cols[i].col.editor=new Ext.form.TextArea({
			maxLength:1000,grow:true
		});
		break;
	}
}