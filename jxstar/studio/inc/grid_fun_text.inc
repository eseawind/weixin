﻿	
		createjs: function(){
			var params = 'funid=fun_text&pagetype=editgrid&eventcode=createjs&projectpath=' + 

			//生成文件后自动加载该文件
			var hdcall = function() {
				Request.loadJS('/public/locale/jxstar-lang-zh.js');
			};

			//发送请求
			Request.postRequest(params, hdcall);
		}
	};