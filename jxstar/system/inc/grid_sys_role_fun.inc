﻿	
		dataImportParam: function() {
			var roleId = this.grid.fkValue;

		setData: function(){
			var records = this.grid.getSelectionModel().getSelections();
			if (!JxUtil.selectone(records)) return;

		},
	};