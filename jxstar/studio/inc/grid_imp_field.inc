
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