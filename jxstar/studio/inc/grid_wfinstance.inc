	config.eventcfg = {
		baseWf: function(fileName) {
			var self = this;
			var records = self.grid.getSelectionModel().getSelections();
			if (!JxUtil.selectone(records)) return;
			
			var funId =  records[0].get('wf_instance__fun_id');
			var dataId = records[0].get('wf_instance__data_id');
			
			var appData = {funId:funId, dataId:dataId};
			JxUtil.showCheckWindow(appData, fileName);
		}
	};
	

	config.initpage = function(gridNode){
		var event = gridNode.event;
		event.on('beforecustom', function(ge) {
			var records = ge.grid.getSelectionModel().getSelections();
			
			for (var i = 0; i < records.length; i++) {
				var state = records[i].get('wf_instance__run_state');
				if (state.length > 0 && state != '4') {
					JxHint.alert('您选择的过程实例不是挂起状态，不能操作！');	
					return false;
				}
			}
		});
	};
