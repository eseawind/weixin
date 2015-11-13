/*!
 * Copyright 2014 zhx.
 * 
 */
  
/**
 * 构建尺码和颜色双动态列的表格
 * 
 * @author richard
 * @version 1.0, 2014-05-20
 */
JxDynColBom = function(config){
	//当前功能ID
	//config.curfunid = 'mat_size_det';
	
	//小计列字段名
	//config.sum_colname = 'mat_appdet__mat_num';
	
	//明细主键字段名
	//config.det_keyname = 'mat_appdet__det_id';
	
	//尺码组id字段ming
	//config.size_keyname = 'mat_base__type_id';
	
	//缺省动态列数量20，一般都不需要修改
	//config.DYNNUM = 20;
	
	Ext.apply(this, config);
};

JxDynColBom.prototype = {	
	//添加20个动态列
	initDynCols: function(cols) {
		var me = this;
		//先找到要添加列的位置，根据小计列字段名
		var index = this.findIndex(cols, me.sum_colname);
		
		//添加颜色的字段名约定为：'color_num__'+i
		for (var i = 0; i < me.ColorDYNNUM; i++) {
				
			var col = {col:{header:i, width:80, sortable:false, align:'left',
						editable:true, hcss:'color:#3039b4;',hidden:true,
			            editor:new Ext.form.TriggerField({
		             	maxLength:100,
						title:'color_num__'+i,
			            allowBlank:true,
			            triggerClass:'x-form-search-trigger', 
			            onTriggerClick: function() {						
				            var selcfg = {pageType:'combogrid', nodeId:'base_mat_color_sel', layoutPage:'', sourceField:'view_base_mat_attr.color_name;', targetField:this.title, whereSql:"data_diff='0' and mat_id=?", whereValue:'[base_style_bom_det.mat_group_id]', whereType:'string', isSame:'0', isShowData:'1', isMoreSelect:'1',isReadonly:'0',queryField:'',likeType:'all',fieldName:this.title};
	  			           // alert(this.title);
						   JxSelect.createSelectWin(selcfg, this, 'node_base_style_bom_det_editgrid');
					
			           }
		             })},			
						field:{name:'color_num__'+i,type:'string'}};
           
			cols.insert(index+i, col);
		}
		//添加尺码规格列的字段名约定为：'size_num2__'+i
		for (var j = 0; j < me.DYNNUM; j++) {
				
			var col = {col:{header:j, width:25, sortable:false, align:'left',
						editable:true, hcss:'color:#3039b4;',hidden:true,
			            editor:new Ext.form.TriggerField({
		             	maxLength:20,
						title:'size_num2__'+j,
			            allowBlank:true,
			            triggerClass:'x-form-search-trigger', 
			            onTriggerClick: function() {						
				            var selcfg = {pageType:'combogrid', nodeId:'base_mat_size_sel', layoutPage:'', sourceField:'base_mat_attr.attr_name;', targetField:this.title, whereSql:"mat_id=?", whereValue:'[base_style_bom_det.mat_group_id]', whereType:'string', isSame:'0', isShowData:'1', isMoreSelect:'0',isReadonly:'0',queryField:'',likeType:'all',fieldName:this.title};
	  			            //alert(this.title);
						   JxSelect.createSelectWin(selcfg, this, 'node_dev_style_bom_det_editgrid');
					
			           }
		             })}, field:{name:'size_num2__'+j,type:'string'}};

			cols.insert(index+me.ColorDYNNUM+j, col);
			
		}
		
		//添加尺码列的字段名约定为：'size_num__'+i
		for (var j = 0; j < me.DYNNUM; j++) {
				
			var col = {col:{header:j, width:25, sortable:false, align:'right',
						editable:true, hcss:'color:#3039b4;',hidden:true,
						editor:new Ext.form.NumberField({
							decimalPrecision:4,maxLength:22
						}),renderer:JxUtil.formatNumber(4)}, field:{name:'size_num__'+j,type:'float'}};

			cols.insert(index+me.ColorDYNNUM+me.DYNNUM+j, col);
			
		}

	},
	
	//保存动态列中的数据
	saveDynData: function(grid) {
		var me = this;
		var store = grid.getStore();
		var mrow = store.getModifiedRecords();
		if (mrow.length == 0) return true;
		var keyids = '';//所有明细id，格式如：keyid,keyid,keyid...
		var sizenums = [];//所有尺码名称与尺码数量，格式如：sizename,num;sizename,num;...
		
		var params = 'funid='+me.curfunid+'&eventcode=savedata';
		
		for (var i = 0; i < mrow.length; i++) {
			var rec = mrow[i];

			var sid = rec.get(me.size_keyname);//取尺码组id
			var names = me.getColNames(sid, grid,'size_num__');//取尺码名称
		
			var sizenums = '';
			if (names.length > 0) {
				for (var j = 0; j < names.length; j++) {
					var sd = rec.get('size_num__'+j);//取各尺码的数量
					var sd2 = rec.get('size_num2__'+j);//取各尺码的数量
					if (!sd || sd.length == 0) sd ='0';
					if (!sd2 || sd2.length == 0) sd2 =' ';
					sizenums += names[j]+','+sd+','+sd2+';';
				}
				if (sizenums.length > 0) sizenums = sizenums.substr(0, sizenums.length-1);
				params += '&sizenums='+sizenums;
			} else {
				continue;
			}
			
			
			var colornames = me.getColNames(sid, grid,'color_num__');//取颜色名称
			
			var colornums = '';
			if (colornames.length > 0) {
				for (var j = 0; j < colornames.length; j++) {
					var sd = rec.get('color_num__'+j);//取各物料颜色
					if (!sd || sd.length == 0) sd ='0';
					colornums += colornames[j]+','+sd+';';
				}
				if (colornums.length > 0) colornums = colornums.substr(0, colornums.length-1);
				params += '&colornums='+colornums;
			} else {
				continue;
			}
			var did = rec.get(me.det_keyname);
			keyids += did + ',';//取明细id
		}
		if (keyids.length > 0) keyids = keyids.substr(0, keyids.length-1);
		params += '&keyids='+keyids;
		
		var hdcall = function(){
			for (var i = 0, n = mrow.length; i < n; i++) {
				if (mrow[i]) mrow[i].commit();
			}
		};
		Request.postRequest(params, hdcall);
		
		return true;
	},
	
	//加载动态列中的数据,没有调用
	loadDynData: function(grid) {
		var me = this;
		var store = grid.getStore();
		var endcall = function(data){
			//先隐藏所有动态列
			me.hideMainHeader(grid);
			
			//后台返回的标题数据，测试数据
			/*var headers = [{dataid:'1007', cols:['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']},
						{dataid:'1006', cols:['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '50', '51', '52']},
						{dataid:'1005', cols:['46', '47', '48', '49', '50', '51']}];*/
			//显示动态列与标题
			me.showMoreHeader(data.headers, grid);
			
			//后台返回的尺码数据，测试数据
			/*var datas = {'jxstar1099073':{'XS':'12', 'S':'2', 'M':'10', 'L':'22'}, 
				'jxstar2298973':{'50':'12', '51':'2', '52':'10', 'L':'22'}, 
				'jxstar6428974':{'50':'12', '51':'2', '46':'11', '47':'32'}};*/
			//显示动态列中的数据
			me.showDynData(data.datas, grid);
		};
		
		//构建明细表ID与尺码组ID，调用后台取数据
		var cnt = store.getCount();
		var detkeyids = '';//所有明细表id
		var sizeids = '';//所有尺码组id
		for (var i = 0; i < cnt; i++) {
			var rec = store.getAt(i);
			var did = rec.get(me.det_keyname);
			if (did.length > 0) {
				detkeyids += did + ',';//取明细id
			}
			var sid = rec.get(me.size_keyname);
			if (sid.length > 0 && sizeids.indexOf(sid+',') < 0) {
				sizeids += sid + ',';//取尺码组id
			}
		}
		if (detkeyids.length > 0) detkeyids = detkeyids.substr(0, detkeyids.length-1);
		if (sizeids.length > 0) sizeids = sizeids.substr(0, sizeids.length-1);
		
		var params = 'funid='+me.curfunid+'&eventcode=qrydata&pagetype=grid&detkeyids='+detkeyids+'&sizeids='+sizeids;
		Request.postRequest(params, endcall);
	},
	
	//修改数值时自动计算右边小计与底部的合计值,没有调用
	caluSumData: function(field, record, grid) {
		if (field.indexOf('size_num__') < 0) return;
		
		var me = this;
		var sum = 0;
		for (var i = 0; i < me.DYNNUM; i++) {
			var sd = record.get('size_num__'+i);
			if (!sd || sd.length == 0) sd = 0;
			sum += parseFloat(sd);
		}
		record.set(me.sum_colname, sum);
		
		//更新底部小计值
		me.updateBotValue(field, grid);
	},
	
	//private 在这个列前面添加尺码列
	findIndex: function(cols) {
		var me = this;
		for (var i = 0; i < cols.length; i++) {
			var f = cols[i].field;
			if (f && f.name.indexOf(me.sum_colname) == 0) {
				return i;
			}
		}
		return 0;
	},
	
	//添加一行标题,没有调用
	addDynHeader: function(datas, grid) {
		var v = grid.getView();
		var hrow = v.mainHd.select('tr').last();
		//直接拷贝一个新的标题tr
		var newtr = hrow.dom.cloneNode(true);
		var th = v.mainHd.select('thead').first();
		newtr = th.insertFirst(newtr);
		
		newtr.dom.dataid = datas.dataid;
		
		var cm = grid.getColumnModel();
		//找出第一个尺码列与最后一个
		var first = cm.findColumnIndex('size_num__0');
		var last = cm.findColumnIndex('size_num__19');
		
		var tds = newtr.select('td');
		var cnt = tds.getCount();
		
		//设置colspan属性的方式会造成列标题错位，所以采用下面这种虚拟合并列的方式
		//把非动态列的标题值清楚，并设置样式为没有左边border
		for (var i = 0; i < cnt; i++) {
			var el = Ext.get(tds.item(i));
			el.setStyle('border-bottom', '1px solid #C7C7C7');
			
			if (i < first || i > last) {
				el.first().dom.className = '';
				el.first().dom.innerHTML = '';
				el.setStyle('background-color', '#C7C7C7');
			} else {
				var index = i - first;
				if (index < datas.cols.length) {
					el.first().dom.innerHTML = datas.cols[index];
				} else {
					el.first().dom.className = '';
					el.first().dom.innerHTML = '';
				}
			}
		}
	},
	
	//标记当前选择的行,不会调用，因为bom没有多表头
	selectHeader: function(dataid, grid) {
		var bgcolor = function(tr, color) {//#deecfd #eeeeee
			var tds = tr.select('td');
			for (var i = 0; i < tds.getCount(); i++) {
				var el = Ext.get(tds.item(i));
				if (el.dom.className.indexOf('size_num__') >= 0) {
					el.setStyle('background-color', color);
				}
				if (el.dom.className.indexOf('size_num2__') >= 0) {
					el.setStyle('background-color', color);
				}
			}
		};
		
		var v = grid.getView();
		var hrs = v.mainHd.select('tr')
		for (var i = 0; i < hrs.getCount(); i++) {
			var el = Ext.get(hrs.item(i));
			//标记当前行
			if (dataid == el.dom.dataid) {
				bgcolor(el, '#fbec88');
			} else {
				bgcolor(el, '#eeeeee');
			}
		}
	},
	
	//显示需要的列，传入尺码值数组
	showMainHeader: function(datas,cdatas, grid) {
		var cm = grid.getColumnModel();
		
		//找出第一个尺码列，尺码用量
		var first = cm.findColumnIndex('size_num__0');
		for (var i = 0; i < datas.cols.length; i++) {
			cm.setHidden(first+i, false);
			cm.setColumnHeader(first+i, datas.cols[i]);
		}
		//找出第一个尺码列，尺码规格
		var first = cm.findColumnIndex('size_num2__0');
		for (var i = 0; i < datas.cols.length; i++) {
			cm.setHidden(first+i, false);
			cm.setColumnHeader(first+i, datas.cols[i]);
		}
		//找出颜色列
		var cfirst = cm.findColumnIndex('color_num__0');
		for (var i = 0; i < cdatas.cols.length; i++) {
			cm.setHidden(cfirst+i, false);
			cm.setColumnHeader(cfirst+i, cdatas.cols[i]);
		}
		//
		
		var v = grid.getView();
		var hrow = v.mainHd.select('tr').last();
		hrow.dom.dataid = datas.dataid;
	},
	
	//隐藏所有动态列
	hideMainHeader: function(grid) {
		var cm = grid.getColumnModel();
		
		for (var i = 19; i >= 0; i--) {
			var index = cm.findColumnIndex('size_num__'+i);
			//alert(index);
			if (!cm.isHidden(index)) {
				cm.setHidden(index, true);
				cm.setColumnHeader(index, i);
			}
		}
		for (var i = 19; i >= 0; i--) {
			var index = cm.findColumnIndex('size_num2__'+i);
			//alert(index);
			if (!cm.isHidden(index)) {
				cm.setHidden(index, true);
				cm.setColumnHeader(index, i);
			}
		}
		for (var j = 9; j >= 0; j--) {
			var index = cm.findColumnIndex('color_num__'+j);
		
			if (!cm.isHidden(index)) {
				cm.setHidden(index, true);
				cm.setColumnHeader(index, j);
			}
		}
	},
	
	//显示动态列的标题
	showMoreHeader: function(headers,cheaders, grid) {
		var me = this;
		//把标题最长的一个放在前面
		var newhs = [];
		for (var i = 0; i < headers.length; i++) {
			if (newhs.length > 0 && headers[i].cols.length > newhs[0].cols.length) {
				newhs.insert(0, headers[i]);
			} else {
				newhs[newhs.length] = headers[i];
			}
		}
        var newhc = [];
		for (var i = 0; i < cheaders.length; i++) {
			if (newhc.length > 0 && cheaders[i].cols.length > newhc[0].cols.length) {
				newhc.insert(0, cheaders[i]);
			} else {
				newhc[newhc.length] = cheaders[i];
			}
		}
		
		for (var i = 0; i < newhs.length; i++) {
			if (i == 0) {
				//显示需要的列
				me.showMainHeader(newhs[i],newhc[i], grid);
			} else {
				//添加多层标题,不会执行到这里,BOM没有多表头
				me.addDynHeader(newhs[i], grid);
			}
		}
	},
	
	//显示动态列中的数据
	showDynData: function(datas,cdatas,datas2, grid) {
		var me = this;
		var store = grid.getStore();
		var cnt = store.getCount();
		if (cnt == 0) return;
			
		//根据尺码组id与尺码值，找到是哪一列
		var getColName = function(sizeid, sizename, grid,colname) {
			var v = grid.getView();
			var hrs = v.mainHd.select('tr')
			for (var i = 0; i < hrs.getCount(); i++) {
				if (sizeid == hrs.item(i).dom.dataid) {
					var tds = hrs.item(i).select('td');
					for (var j = 0; j < tds.getCount(); j++) {
						//根据标题里面的值取字段名

						if (tds.item(j).first().dom.innerHTML.indexOf(sizename) == 0) {
							var cls = tds.item(j).first().dom.className;
							if (cls.indexOf(colname) >= 0) {
								return colname+cls.split('__')[1];
							}
						}
					}
				}
			}
			return '';
		};
		
		var sumdatas = {}, sumall = 0;
		//处理尺码的数据
		for (var i = 0; i < cnt; i++) {
			var rec = store.getAt(i);
			var detid = rec.get(me.det_keyname);//取明细id
			var sizeid = rec.get(me.size_keyname);//取尺码组id
			var ds = datas[detid];
			
			//尺码数据
			if (!Ext.isEmpty(ds)) {
				for (key in ds) {
                 
					var colname = getColName(sizeid, key, grid,'size_num__');
					//
				 
					if (colname.length > 0) {
						rec.set(colname, ds[key]);
						sumdatas[colname] = parseFloat(sumdatas[colname]||0) + parseFloat(ds[key]||0);
						sumall += parseFloat(ds[key]||0);
					}
				}
				rec.commit();
			}
			
			//尺码规格数据
			var ds2 = datas2[detid];
			if (!Ext.isEmpty(ds2)) {
				for (key in ds2) {
                 
					var colname = getColName(sizeid, key, grid,'size_num2__');
				 
					if (colname.length > 0) {
						rec.set(colname, ds2[key]);
					}
				}
				rec.commit();
			}

			 //处理颜色的数据
			 var cds = cdatas[detid];
			
			//尺码数据
			if (!Ext.isEmpty(cds)) {
				for (key in cds) {
                 
					var colname = getColName(sizeid, key, grid,'color_num__');
					//
				   // alert(colname);
					if (colname.length > 0) {
						rec.set(colname, cds[key]);
						//sumdatas[colname] = parseFloat(sumdatas[colname]||0) + parseFloat(ds[key]||0);
						//sumall += parseFloat(ds[key]||0);
					}
				}
				rec.commit();
			}
		}
	


		//更新底部的合计值
		var body = grid.getView().mainBody;
		var trs = body.select('.x-grid3-summary-table');
		if (trs && trs.getCount() > 0) {
			var tds = trs.first().select('td');
			for (key in sumdatas) {
				for (i = 0; i < tds.getCount(); i++) {
					var cls = tds.item(i).dom.className;
					if (cls.indexOf(key) >= 0) {
						tds.item(i).first().dom.innerHTML = sumdatas[key];
						break;
					}
				}
			}
			//总计赋值
			for (i = 0; i < tds.getCount(); i++) {
				var cls = tds.item(i).dom.className;
				if (cls.indexOf(me.sum_colname) >= 0) {
					tds.item(i).first().dom.innerHTML = sumall;
					break;
				}
			}
		}
	},
	
	//更新底部的合计值
	updateBotValue: function(field, grid) {
		var me = this;
		var store = grid.getStore();
		var cnt = store.getCount();
		if (cnt == 0) return;
		
		var sum = 0, sumall = 0;
		for (var i = 0; i < cnt; i++) {
			var rec = store.getAt(i);
			var num = rec.get(field);
			var nums = rec.get(me.sum_colname);
			
			sum += parseFloat(num||0);
			sumall += parseFloat(nums||0);
		}
		
		//更新底部的合计值
		var body = grid.getView().mainBody;
		var trs = body.select('.x-grid3-summary-table');
		if (trs && trs.getCount() > 0) {
			var tds = trs.first().select('td');
			for (i = 0; i < tds.getCount(); i++) {
				var cls = tds.item(i).dom.className;
				if (cls.indexOf(field) >= 0) {
					tds.item(i).first().dom.innerHTML = sum;
				}
				if (cls.indexOf(me.sum_colname) >= 0) {
					tds.item(i).first().dom.innerHTML = sumall;
				}
			}
		}
	},
	
	//判断字段列是否可编辑
	hasColName: function(sizeid, field, grid) {
		if (field.indexOf('size_num__') < 0 && field.indexOf('size_num2__') < 0) return true;
		
		var v = grid.getView();
		var hrs = v.mainHd.select('tr')
		for (var i = 0; i < hrs.getCount(); i++) {
			if (sizeid == hrs.item(i).dom.dataid) {
				var tds = hrs.item(i).select('td');
				for (var j = 0; j < tds.getCount(); j++) {
					//根据字段名标题里面的值
					var cls = tds.item(j).first().dom.className;
					if (cls.indexOf(field) >= 0) {
						var h = tds.item(j).first().dom.innerHTML;
						return (h.length > 0);
					}
				}
			}
		}
		return false;
	},
	
		//根据尺码组ID取所有尺码值
	getColNames: function(sizeid, grid,colname) {
		var me = this;
		var v = grid.getView();
		var hrs = v.mainHd.select('tr')
		for (var i = 0; i < hrs.getCount(); i++) {
			if (sizeid == hrs.item(i).dom.dataid) {
				var tds = hrs.item(i).select('td');
				var names = [];
				for (var j = 0; j < tds.getCount(); j++) {
					//取字段名标题里面的值
					var cls = tds.item(j).first().dom.className;
					if (cls.indexOf(colname) >= 0 && 
						tds.item(j).isVisible()) {
						var html = tds.item(j).first().dom.innerHTML;
						if (html.length > 0) {
							names[names.length] = html.split('<')[0];
						}
					}
				}
				return names;
			}
		}
		return [];
	}
};