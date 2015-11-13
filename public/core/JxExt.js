/*!
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
 
/**
 * 对ExtJs部分组件功能进行扩展或完善。
 * 
 * @author TonyTan
 * @version 1.0, 2010-01-01
 */
JxExt = {};
/**
 * 新增方法：在数组中插入对象
 * index -- 指要插入的位置，从0开始，如果是负数，则从尾部开始
 * item -- 指要插入的项目
 **/
Array.prototype.insert = function(index, item) {
	if (index >= this.length) {
		this[this.length] = item;
		return this;
	}
	if (index < 0) {
		index = this.length + index;
	}
	
	for(var i = this.length-1; i >= index; i--) {
		this[i+1] = this[i];
	}
	this[index] = item;
	return this;
};

/**
 * 修改属性：定期清理孤立节点
 **/
Ext.enableListenerCollection = true;

/**
 * ext-3.3.1
 * 修改方法：把Date对象格式化yyyy-mm-dd格式的字符串。
 **/
Ext.urlEncode = function(o, pre){
	var empty, buf = [], e = encodeURIComponent;
	
	Ext.iterate(o, function(key, item){
		empty = Ext.isEmpty(item);
		Ext.each(empty ? key : item, function(val){
			//Ext.encode(val).replace(/"/g, '') --> val.dateFormat('Y-m-d H:i:s') //modify by tony
			buf.push('&', e(key), '=', (!Ext.isEmpty(val) && (val != key || !empty)) ? (Ext.isDate(val) ? val.dateFormat('Y-m-d H:i:s') : e(val)) : '');
		});
	});
	if(!pre){
		buf.shift();
		pre = '';
	}
	return pre + buf.join('');
};

/**
 * ext-3.3.1
 * 修改方法：分页栏刷新数据时加上上次的参数。
 **/
Ext.PagingToolbar.prototype.doLoad = function(start){
	var o = {};
	var options = this.store.lastOptions;//---add by tony
	if (options && options.params) {
		o = options.params;
	}//---add by
	
	var pn = this.getParams();
	o[pn.start] = start;
	o[pn.limit] = this.pageSize;
	if(this.fireEvent('beforechange', this, o) !== false){
		this.store.load({params:o});
	}
	
	//---add by tony, store.load set startno = 0
	Jxstar.startNo = start;
};

/**
 * ext-3.3.1
 * 修改方法：设置表格行号列的缺省宽度为40
 **/
Ext.grid.RowNumberer.prototype.width = 40;
//通过GridView.getColumnStyle的方法会把样式添加到序号列中
var rownumwidth = (Ext.isGecko) ? 39 : 41;
Ext.grid.RowNumberer.prototype.css = 'background-color:#f0f0f0 !important; width:'+ rownumwidth +'px !important;';

/**
 * ext-3.3.1
 * 修改方法：支持设置表格头部的样式
 **/ 
Ext.grid.GridView.prototype.getColumnStyle = function(colIndex, isHeader){
	var colModel  = this.cm,
		colConfig = colModel.config,
		style     = isHeader ? colConfig[colIndex].hcss || '' : colConfig[colIndex].css || '',//添加了属性：colConfig[colIndex].hcss || 
		align     = colConfig[colIndex].align;
	
	style += String.format("width: {0};", this.getColumnWidth(colIndex));
	
	if (colModel.isHidden(colIndex)) {
		style += 'display: none; ';
	}
	
	if (align) {
		style += String.format("text-align: {0};", align);
	}
	
	return style;
};

/**
 * ext-3.3.1
 * 修改方法：修改表格单元可选择字符，1行增加：x-selectable，二行删除：unselectable="on"，原：
 * '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
 *     '<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>',
 * '</td>'
 **/ 
Ext.grid.GridView.prototype.cellTpl = new Ext.Template(
	'<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} x-selectable {css}" style="{style}" tabIndex="0" {cellAttr}>',
		'<div class="x-grid3-cell-inner x-grid3-col-{id}" {attr}>{value}</div>',
	'</td>'
);

/**
 * ext-3.3.1
 * 修改方法：去掉属性表格中按属性名排序的特性
 **/
Ext.grid.PropertyGrid.prototype.initComponent = function(){
	this.customRenderers = this.customRenderers || {};
	this.customEditors = this.customEditors || {};
	this.lastEditRow = null;
	var store = new Ext.grid.PropertyStore(this);
	this.propStore = store;
	var cm = new Ext.grid.PropertyColumnModel(this, store);
	//store.store.sort('name', 'ASC');	//delete by tony
	this.addEvents(
		'beforepropertychange',
		'propertychange'
	);
	this.cm = cm;
	this.ds = store.store;
	Ext.grid.PropertyGrid.superclass.initComponent.call(this);

	this.mon(this.selModel, 'beforecellselect', function(sm, rowIndex, colIndex){
		if(colIndex === 0){
			this.startEditing.defer(200, this, [rowIndex, 1]);
			return false;
		}
	}, this);
};

/**
 * ext-3.3.1
 * 修改方法：取checkbox的值时取 0 或 1，而不是true false。
 **/
Ext.form.Checkbox.prototype.getValue = function(){
	if(this.rendered && this.el){
		return this.el.dom.checked ? '1' : '0';
	}
	return this.checked ? '1' : '0';
};

/**
 * ext-3.3.1
 * 修改方法：把返回结果中的树形数据作为响应数据
 **/
Ext.tree.TreeLoader.prototype.handleResponse = function(response){
	this.transId = false;
	var a = response.argument;
	var d = Ext.decode(response.responseText).data;//---add by tony
	if (d != null) {
		response.responseText = Ext.encode(d);
	}//----add by
	
	this.processResponse(response, a.node, a.callback, a.scope);
	this.fireEvent("load", this, a.node, response);
};

/**
 * 新增方法：模拟record的set/get方法，在JxSelect.setSelectData中使用。
 **/
Ext.form.BasicForm.prototype.set = function(name, value) {
	var f = this.findField(name);
	if(f){
		var oldValue = f.getValue();
		f.setValue(value);
		//处理字段值修改标记
		f.fireEvent('change', f, oldValue, value);
	}
	return this;
};

/**
 * 新增方法：模拟record的set/get方法，在JxSelect.setSelectData中使用。
 **/
Ext.form.BasicForm.prototype.get = function(name) {
	var f = this.findField(name);
	if(f){
		return f.getValue();
	}
	return '';
};

/**
 * 新增方法：取数值。
 **/
Ext.form.BasicForm.prototype.getNum = function(name) {
	var value = '';
	var f = this.findField(name);
	if(f){
		value = f.getValue();
	}
	if (value == null || value.length == 0) return 0;
		
	return parseFloat(value);
};

/**
 * 新增方法：保证修改字段值后不标记为脏数据。
 **/
Ext.form.BasicForm.prototype.oset = function(name, value) {
	var f = this.findField(name);
	if(f){
		var oldValue = f.getValue();
		f.setValue(value);
		//取消字段修改痕迹，设置修改值为原值
		f.originalValue = value;
	}
	return this;
};

/**
* 新增方法：取当前表单的所有字段，含组合字段内的字段
**/
Ext.form.BasicForm.prototype.fieldItems = function() {
	var fields = new Ext.util.MixedCollection(false, function(o){
		return o.getItemId();
	});
	this.items.each(function(field){
		if (field.isComposite) {
			field.items.each(function(f){
				fields.add(f.getItemId(), f);
			});
		} else {
			fields.add(field.getItemId(), field);
		}
	});
	
	return fields;
};

/**
* ext-3.3.1 
* 修改方法：必须有name属性的字段才判断是否有值修改
**/
Ext.form.BasicForm.prototype.isDirty = function() {
	var dirty = false;
	this.items.each(function(f){
	   if(!Ext.isEmpty(f.name) && f.isDirty()){
		   dirty = true;
		   return false;
	   }
	});
	return dirty;
};

/**
 * 新增方法：保证修改字段值后不标记为脏数据。
 **/
Ext.form.ComboBox.prototype.restrictHeight = function(){
	this.innerList.dom.style.height = '';
	var inner = this.innerList.dom,
		pad = this.list.getFrameWidth('tb') + (this.resizable ? this.handleHeight : 0) + this.assetHeight,
		h = Math.max(inner.clientHeight, inner.offsetHeight, inner.scrollHeight),
		ha = this.getPosition()[1]-Ext.getBody().getScroll().top,
		hb = Ext.lib.Dom.getViewHeight()-ha-this.getSize().height,
		space = Math.max(ha, hb, this.minHeight || 0)-this.list.shadowOffset-pad-5;

	h = Math.min(h, space, this.maxHeight);
	
	//如果是IE，当有X方向的滚动条时显示不全了，则添加高度18，其它浏览器添加1
	if (Ext.isIE) {
		var cw = inner.clientWidth, ow = inner.offsetWidth;
		if (cw < ow) {
			h += 18;
		}
	} else {
		h += 1;
	}
	//add by tony.tan

	this.innerList.setHeight(h);
	this.list.beginUpdate();
	this.list.setHeight(h+pad);
	this.list.alignTo.apply(this.list, [this.el].concat(this.listAlign));
	this.list.endUpdate();
};

/**
 * 修改方法：如果值为'请选择'，则为空。
 **/
Ext.form.ComboBox.prototype.getValue = function(){
	var v = '';
	if(this.valueField){
		v = Ext.isDefined(this.value) ? this.value : '';
	}else{
		v = Ext.form.ComboBox.superclass.getValue.call(this);
	}
	if(v == jx.star.select) {//添加这个判断，this.emptyText为空了
		v = '';
		this.value = '';
		this.originalValue = '';
	}
	return v;
};

/**
 * 新增方法：保证修改字段值后不标记为脏数据。
 **/
Ext.form.Field.prototype.osetValue = function(value){
	this.setValue(value);
	this.originalValue = value;
};

/**
 * ext-3.3.1
 * 修改方法：支持在选择日期的时候，自动带上时间值，设置样式：Y-m-d H:i，就支持显示时间。
 **/
Ext.form.DateField.prototype.onSelect = function(m, d){
	if (Ext.isDate(d)) {//---add by tony
		var curd = new Date();
		d.setHours(curd.getHours(), curd.getMinutes(), curd.getSeconds());
	}//---add by
	this.setValue(d);
	this.fireEvent('select', this, d);
	this.menu.hide();
};

/**
 * ext-3.3.1
 * 修改方法：如果是样式Y-m，在显示日期值取的是当前日，应该取1号
 **/
Ext.form.DateField.prototype.parseDate = function(value) {
	if(!value || Ext.isDate(value)){
		return value;
	}
	
	if (!Ext.isEmpty(value) && value.length == 7 && this.format == 'Y-m') {//---add by tony
		return Date.parseDate(value+'-01', 'Y-m-d');
	}//---add by

	var v = this.safeParse(value, this.format),
		af = this.altFormats,
		afa = this.altFormatsArray;

	if (!v && af) {
		afa = afa || af.split("|");

		for (var i = 0, len = afa.length; i < len && !v; i++) {
			v = this.safeParse(value, afa[i]);
		}
	}
	return v;
},

/**
 * 修改属性：FormLayout的标签描述不添加':'符号。
 **/
Ext.layout.FormLayout.prototype.labelSeparator = '';

/**
 * 修改属性：NumberField缺省不允许输入负数。
 **/
//Ext.form.NumberField.prototype.allowNegative = false;

/**
 * 修改属性：NumberField聚焦则全选。
 **/
Ext.form.NumberField.prototype.selectOnFocus = true;

/**
 * 修改属性：TextField聚焦则全选。
 **/
Ext.form.TextField.prototype.selectOnFocus = true;

/**
 * 修改属性：BasicForm加载数据后设置为初始值。
 **/
Ext.form.BasicForm.prototype.trackResetOnLoad = true;

/**
 * 修改属性：Component状态支持缺省值为否，设置所有控件都不保存状态。
 **/
Ext.Component.prototype.stateful = false;

/**
 * 修改属性：对话框的缺省标题。
 **/
/*Ext.Window.prototype.iconCls = 'eb_win';*/

/**
 * 修改属性：对话框的缺省不带阴影。
 **/
Ext.Window.prototype.shadow = false;

/**
 * ext-3.3.1
 * 修改方法：处理重复打开combogrid页面时报下面的错误。
 **/
Ext.layout.MenuLayout.prototype.isValidParent = function(c, target) {
	var el = c.el.up('li.x-menu-list-item', 5);
	if (Ext.isEmpty(el)) return false;//add by tony
	return el.dom.parentNode === (target.dom || target);
};

/**
 * ext-3.3.1
 * 修改方法：如果是只读，则需要添加只读样式。
 **/
Ext.form.Field.prototype.setReadOnly = function(readOnly){
	if(this.rendered && this.el){
		this.el.dom.readOnly = readOnly;
		if (readOnly) {//---add by tony
			this.el.addClass('x-field-only');
		} else {
			this.el.removeClass('x-field-only');
		}//---add by
	}
	this.readOnly = readOnly;
};
Ext.form.TriggerField.prototype.setReadOnly = function(readOnly){
	if(readOnly != this.readOnly && this.el){
		if (readOnly) {//---add by tony
			this.el.addClass('x-field-only');
		} else {
			this.el.removeClass('x-field-only');
		}//---add by
		this.readOnly = readOnly;
		this.updateEditState();
	}
};

/**
 * ext-3.3.1
 * 修改方法：如果是只读，则需要添加只读样式。
 **/
Ext.form.TriggerField.prototype.updateEditState = function(){
	if(this.rendered && this.el){
		if (this.readOnly) {
			this.el.dom.readOnly = true;
			this.el.addClass('x-field-only');//add by tony.tan
			this.el.addClass('x-trigger-noedit');
			this.mun(this.el, 'click', this.onTriggerClick, this);
			//this.trigger.setDisplayed(false);
			this.emptyText = '';//add by tony.tan
		} else {
			if (!this.editable) {
				this.el.dom.readOnly = true;
				this.el.addClass('x-trigger-noedit');
				this.mon(this.el, 'click', this.onTriggerClick, this);
			} else {
				this.el.dom.readOnly = false;
				this.el.removeClass('x-field-only');//add by tony.tan
				this.el.removeClass('x-trigger-noedit');
				this.mun(this.el, 'click', this.onTriggerClick, this);
			}
			//this.trigger.setDisplayed(!this.hideTrigger);
		}
		//del by tony.tan 它会造成控件很窄
		//this.onResize(this.width || this.wrap.getWidth());
	}
};

/**
 * ext-3.3.1
 * 修改方法：处理日期控件的按钮只读后还可以选择的问题
 **/
Ext.form.DateField.prototype.onTriggerClick = function(){
	if(this.readOnly || this.disabled){//modify by tony.tan add 'this.readOnly || '
		return;
	}
	if(this.menu == null){
		this.menu = new Ext.menu.DateMenu({
			hideOnClick: false,
			focusOnSelect: false
		});
	}
	this.onFocus();
	Ext.apply(this.menu.picker,  {
		minDate : this.minValue,
		maxDate : this.maxValue,
		disabledDatesRE : this.disabledDatesRE,
		disabledDatesText : this.disabledDatesText,
		disabledDays : this.disabledDays,
		disabledDaysText : this.disabledDaysText,
		format : this.format,
		showToday : this.showToday,
		startDay: this.startDay,
		minText : String.format(this.minText, this.formatDate(this.minValue)),
		maxText : String.format(this.maxText, this.formatDate(this.maxValue))
	});
	this.menu.picker.setValue(this.getValue() || new Date());
	this.menu.show(this.el, "tl-bl?");
	this.menuEvents('on');
};

/**
 * 修改日期字段控件的样式，显示居中。
 **/
Ext.form.DateField.prototype.fieldClass = 'x-field-d';

/**
 * 修改数字字段控件的样式，显示居右。
 **/
Ext.form.NumberField.prototype.fieldClass = 'x-field-n';

/**
 * ext-3.3.1
 * 修改方法：添加F1 -- F12为特殊键，用于处理字段的帮助信息CTRL+F1。
 **/
Ext.EventObjectImpl.prototype.isSpecialKey = function(){
   var k = this.normalizeKey(this.keyCode);
   return (this.type == 'keypress' && this.ctrlKey) ||
   this.isNavKeyPress() ||
   (k == this.BACKSPACE) || // Backspace
   (k >= 16 && k <= 20) ||	// Shift, Ctrl, Alt, Pause, Caps Lock
   (k >= 44 && k <= 46) ||	// Print Screen, Insert, Delete
   (k >= 112 && k <= 123);	// F1 -- F12
};
	
/**
 * 新增方法：用来解决RowEditor类中这行ed = c.getEditor(); is not a function的错误
 **/
Ext.grid.RowSelectionModel.prototype.getEditor = Ext.emptyFn;

/**
 * ext-3.3.1
 * 问题：如果int，float类型的值为null时，在record中取到后为0；
 * 分析：在Ext.data.JsonReader.extractValues中转换值时改变了，分析是Types.INT FLOAT的两个方法转换了，增加了this.useNull判断
 *       实际上是判断field对象的属性useNull，所以增加下面的一行，保留数值可以显示null
 *		 如果设置useNull值，会造成输出值为null，在grid编辑中还会出现异常，所以直接替换INT\FLOAT这两个方法
 **/
//Ext.data.Field.prototype.useNull = true;
Ext.data.Types.INT = {
	convert: function(v){
		return v !== undefined && v !== null && v !== '' ?
			parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : '';//(this.useNull ? null : 0) --> ''
	},
	sortType: Ext.data.SortTypes.none,
	type: 'int'
};
		
Ext.data.Types.FLOAT = {
	convert: function(v){
		return v !== undefined && v !== null && v !== '' ?
			parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : '';//(this.useNull ? null : 0) --> ''
	},
	sortType: Ext.data.SortTypes.none,
	type: 'float'
};
//在editgrid，如果可编辑字段为date类型，且值为空，则点击可编辑单元，光标离开时会给脏标记，
//是因为startValue=null，而当前值为空，所以值改变了。特修改如下：如果值为空，则返回''
Ext.data.Types.DATE = {
	convert: function(v){
		var df = this.dateFormat;
		if(!v){
			return '';//null -->''
		}
		if(Ext.isDate(v)){
			return v;
		}
		if(df){
			if(df == 'timestamp'){
				return new Date(v*1000);
			}
			if(df == 'time'){
				return new Date(parseInt(v, 10));
			}
			return Date.parseDate(v, df);
		}
		var parsed = Date.parse(v);
		return parsed ? new Date(parsed) : '';//null -->''
	},
	sortType: Ext.data.SortTypes.asDate,
	type: 'date'
};

/**
 * ext-3.3.1
 * 新增属性：添加24小时制时间格式校验
 **/
Ext.apply(Ext.form.VTypes, {
	//24小时制时间格式校验
    time24: function(val, field) {
		var time24Test = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/i;
        return time24Test.test(val);
    },
    //错误提示
    time24Text: jx.base.timetext	//'无效时间格式，格式如："22:34"'
});

/**
 * 新增方法：给Record对象添加一个取数字的方法。
 **/
Ext.data.Record.prototype.getNum = function(name){
	var value = this.data[name];
	if (value == null || value.length == 0) return 0;
		
	return parseFloat(value);
};

/**
 * ext-3.3.1
 * 修改方法：修改取字符长度的方法，如果是汉字则是两个字节。
 **/
Ext.form.TextField.prototype.getErrors = function(value) {
	var errors = Ext.form.TextField.superclass.getErrors.apply(this, arguments);
	
	value = Ext.isDefined(value) ? value : this.processValue(this.getRawValue());        
	
	if (Ext.isFunction(this.validator)) {
		var msg = this.validator(value);
		if (msg !== true) {
			errors.push(msg);
		}
	}
	
	if (value.length < 1 || value === this.emptyText) {
		if (this.allowBlank) {
			//if value is blank and allowBlank is true, there cannot be any additional errors
			return errors;
		} else {
			if (!this.isBlankCheck) {//add by tony.tan
				errors.push(this.blankText);
			}
		}
	}
	//modify by Tony.Tan
	if (!this.isBlankCheck && !this.allowBlank && (value.length < 1 || value === this.emptyText)) { // if it's blank
		errors.push(this.blankText);
	}
	
	//modify by Tony.Tan
	if (JxUtil.strlen(value) < this.minLength) {
		errors.push(String.format(this.minLengthText, this.minLength));
	}
	
	//modify by Tony.Tan
	if (JxUtil.strlen(value) > this.maxLength) {
		errors.push(String.format(this.maxLengthText, this.maxLength));
	}
	
	if (this.vtype) {
		var vt = Ext.form.VTypes;
		if(!vt[this.vtype](value, this)){
			errors.push(this.vtypeText || vt[this.vtype +'Text']);
		}
	}
	
	if (this.regex && !this.regex.test(value)) {
		errors.push(this.regexText);
	}
	
	return errors;
};

/**
 * ext-3.3.1
 * 增加方法：增加一种不检查必填项的校验方法
 **/
Ext.form.BasicForm.prototype.isValidBlank = function(){
	var valid = true;
	this.items.each(function(f){
		f.isBlankCheck = true; //add by tony.tan
	   if(!f.validate()){
		   valid = false;
	   }
	   delete f.isBlankCheck; //add by tony.tan
	});
	return valid;
};

/**
 * ext-3.3.1
 * 修改方法：在导航图设计器中添加“提交”事件，JxAttach.js
 * var formPanel = formTab.getComponent(0);执行时报items is null的错误
 **/
Ext.Container.prototype.getComponent = function(comp){
	if(Ext.isObject(comp)){
		comp = comp.getItemId();
	}
	//add by tony.tan
	if (this.items == null) return null;
	return this.items.get(comp);
};

/**
 * ext-3.3.1
 * 修改方法：设置form中的字段，回车跳转到下一个控件的效果
 **/
Ext.form.Field.prototype.afterRender = function(){
	Ext.form.Field.superclass.afterRender.call(this);
	this.initEvents();
	this.initValue();
	//add by tony.tan
	var fn = function(e, t){
		if (e.getKey() == e.ENTER) {
			var me = this;
			var fp = me.findParentByType('form');
			if (Ext.isEmpty(fp)) return;
			
			var items = fp.form.items;
			//记录第一个有效字段的位置、当前字段的位置、当前字段的下一个位置
			//必须记录位置，而不能记录控件f，不然循环结束后取不到真实控件
			var i = 0, first = -1, index = -1, next = -1;
			items.each(function(f){
				//textarea控件中回车是文字换行
				if (f.isFormField && f.rendered && f.name && 
					!f.isXType('hidden') && !f.isXType('textarea')) {
					if (first < 0) first = i;
					if (f.name == me.name) {
						index = i;
					} else {
						if (index >= 0) {
							next = i;
							return false;
						}
					}
				}
				i++;
			});
			//JxHint.hint(index+';'+next+';'+first);
			//如果找到了当前位置，当没有找到下一个有效位置，则取第一个位置
			if (index >= 0 && next < 0) next = first;
			if (next >= 0) {
				var fn = items.get(next);
				if (fn) fn.focus(true);
			}
		}
	};
	//回车进入下一控件的开关
	var isEnter = Jxstar.systemVar.edit__field__next;
	if (isEnter == '1') {
		this.mon(this.el, Ext.EventManager.getKeyEvent(), fn, this);
	}
};

/**
 * ext-3.3.1
 * 修改方法：修改表格行选状态时，回车跳转到下一个控件的效果
 **/
Ext.grid.RowSelectionModel.prototype.onEditorKey = function(field, e){
	var k = e.getKey(), 
		newCell, 
		g = this.grid, 
		last = g.lastEdit,
		ed = g.activeEditor,
		shift = e.shiftKey,
		ae, last, r, c;
	
	//回车键开关
	var isEnter = (Jxstar.systemVar.edit__field__next == '1');
	//针对单个表格可以关闭此效果
	if (g.isNextField != null) isEnter = g.isNextField;
	
	if (isEnter) {//is enter
		if(k == e.ENTER){//modify, ed.row --> last.row, last.col
			//e.stopEvent();
			//ed.completeEdit(); //ENTER is completeEdited
			if(shift){
				newCell = g.walkCells(last.row, last.col-1, -1, this.acceptsNav, this);
			}else{
				newCell = g.walkCells(last.row, last.col+1, 1, this.acceptsNav, this);
			}
		}else if(k == e.TAB){//modify
			e.stopEvent();//add
			ed.completeEdit();//add
			if(this.moveEditorOnEnter !== false){
				if(shift){
					newCell = g.walkCells(last.row - 1, last.col, -1, this.acceptsNav, this);
				}else{
					newCell = g.walkCells(last.row + 1, last.col, 1, this.acceptsNav, this);
				}
			}
		}
	} else {//is old
        if(k == e.TAB){
            e.stopEvent();
            ed.completeEdit();
            if(shift){
                newCell = g.walkCells(ed.row, ed.col-1, -1, this.acceptsNav, this);
            }else{
                newCell = g.walkCells(ed.row, ed.col+1, 1, this.acceptsNav, this);
            }
        }else if(k == e.ENTER){
            if(this.moveEditorOnEnter !== false){
                if(shift){
                    newCell = g.walkCells(last.row - 1, last.col, -1, this.acceptsNav, this);
                }else{
                    newCell = g.walkCells(last.row + 1, last.col, 1, this.acceptsNav, this);
                }
            }
        }
	}
	if(newCell){
		r = newCell[0];
		c = newCell[1];

		this.onEditorSelect(r, last.row);

		if(g.isEditor && g.editing){ // *** handle tabbing while editorgrid is in edit mode
			ae = g.activeEditor;
			if(ae && ae.field.triggerBlur){
				// *** if activeEditor is a TriggerField, explicitly call its triggerBlur() method
				ae.field.triggerBlur();
			}
		}
		g.startEditing(r, c);
	}
	
	//add by tony 按下ctrl+alt键则完成编辑状态，用于执行表格快捷键
	if (e.ctrlKey && e.altKey && ed) {
		ed.completeEdit();
	}
};

/**
 * ext-3.3.1
 * 添加控件：工具栏中的支持快捷键设置的控件
 **/
Ext.ux.ToolbarKeyMap = Ext.extend(Object, (function() {
    var kb, owner, mappings;

    var addKeyBinding = function(c) {
        if (kb = c.keyBinding) {
            delete c.keyBinding;
            if (!kb.fn && c.handler) {
                kb.fn = function(k, e) {
                    e.preventDefault();
                    e.stopEvent();
                    c.handler.call(c.scope, c, e);
                }
            }
            mappings.push(kb);
        }
        if ((c instanceof Ext.Button) && c.menu) {
            c.menu.cascade(addKeyBinding);
        }
    };

    var findKeyNavs = function() {
        delete this.onRender;
        if (owner = this.ownerCt) {
            mappings = [];
            this.cascade(addKeyBinding);
            if (!owner.menuKeyMap) {
                owner.menuKeyMap = new Ext.KeyMap(owner.el, mappings);
                owner.el.dom.tabIndex = 0;
            } else {
                owner.menuKeyMap.addBinding(mappings);
            }
        }
    };

    return {
        init: function(toolbar) {
            toolbar.onRender = toolbar.onRender.createSequence(findKeyNavs);
            toolbar.doLayout = toolbar.doLayout.createSequence(findKeyNavs);
        }
    };
})());

//获取数量字段的小数长度，它的长度是根据计量单位中设置的保留小数位来确定的；
//设计思路是：先根据当前字段控件找到父容器(form|grid)；然后从其扩展属性中取数量字段与单位字段对应关系；
//根据计量单位的值找到其保留小数位；
//此数据是在custom.js中从计量单位功能加载的；
//Jxstar.UnitData = [{unit_name:'米', keep_num:5}, {unit_name:'袋', keep_num:6}];
JxUtil.getDecimalPrecision = function(field) {
	var form = field.ownerCt;//不为空说明是form，为空说明是grid
	var precfg, tagRecord, prelen;//数量与单位字段名称、当前数据记录、获取的数值精度
	if (form) {
		if (form.isXType('form') == false) {
			form = form.findParentByType('form');
		}
		if (form) {
			tagRecord = form.getForm();
			precfg = form.formNode.param.precisionField;
		}
	} else {
		var gdom = field.el.findParentNode('div.x-grid-panel');
		var grid = Ext.getCmp(gdom.id);
		if (grid) {
			var last = grid.lastEdit;
			if (last) {//防止标记到了下一行，实际触发原记录
				tagRecord = grid.getStore().getAt(last.row);
			} else {
				var selRecord = JxUtil.getSelectRows(grid);
				if (selRecord && selRecord.length > 0) {
					tagRecord = selRecord[0];
				}
			}
			precfg = grid.gridNode.param.precisionField;
		}
	}
	//找到目标记录且有数值、单位字段设置
	if (tagRecord && precfg) {
		var unitName, unitValue, unitLen;
		if (field.name) unitName = precfg[field.name];
		if (unitName) unitValue = tagRecord.get(unitName);
		if (unitValue && (typeof(Jxstar.UnitData) != 'undefined')) {
			for (var i = 0; i < Jxstar.UnitData.length; i++) {
				if (Jxstar.UnitData[i].unit_name == unitValue) {
					unitLen = Jxstar.UnitData[i].keep_num;
					break;
				}
			}
		}
		if (unitLen != null) prelen = unitLen;
		//JxHint.hint('unitName=' + unitName + ';unitValue=' + unitValue + ';unitLen=' + unitLen);
	}
	if (prelen == null) {
		var len = parseInt(Jxstar.systemVar.sys__numdyn__len);
		prelen = isNaN(len) ? 2 : len;
	}
	//JxHint.hint('prelen=' + prelen);
	return prelen;
};

/**
 * ext-3.3.1
 * 修改方法：NumberField处理小数位精度，beforeBlur方法只调用一次，fixPrecision方法要调用很多次
 **/
Ext.form.NumberField.prototype.beforeBlur = function() {
	var v = this.parseValue(this.getRawValue());
	//------------add by tony
	if (this.format == 'numset') {
		var len = parseInt(Jxstar.systemVar.sys__numset__len);
		this.decimalPrecision = isNaN(len) ? 2 : len;
	}
	if (this.format == 'numdyn') {
		if (Jxstar.systemVar.sys__numdyn__use == '1') {
			var len = parseInt(Jxstar.systemVar.sys__numdyn__len);
			this.decimalPrecision = isNaN(len) ? 2 : len;
		} else {
			if (JxUtil.getDecimalPrecision) {
				this.decimalPrecision = JxUtil.getDecimalPrecision(this);
			}
		}
	}
	//------------end
	
	if (!Ext.isEmpty(v)) {
		this.setValue(v);
	}
};


//
//
////ZhiHua添加：避免鼠标移到number对象时取了前一个number对象的精度
//Ext.form.NumberField.prototype.focus = function(selectText, delay){
//	alert(Ext.form.NumberField.prototype.setValue);
//	//------------add by tony
//	if (this.format == 'numset') {
//		var len = parseInt(Jxstar.systemVar.sys__numset__len);
//		this.decimalPrecision = isNaN(len) ? 2 : len;
//	}
//	if (this.format == 'numdyn') {
//		if (Jxstar.systemVar.sys__numdyn__use == '1') {
//			var len = parseInt(Jxstar.systemVar.sys__numdyn__len);
//			this.decimalPrecision = isNaN(len) ? 2 : len;
//		} else {
//			if (JxUtil.getDecimalPrecision) {
//				this.decimalPrecision = JxUtil.getDecimalPrecision(this);
//			}
//		}
//	}
//	//------------end
//
//	if(delay){
//		this.focusTask = new Ext.util.DelayedTask(this.focus, this, [selectText, false]);
//		this.focusTask.delay(Ext.isNumber(delay) ? delay : 10);
//		return this;
//	}
//	if(this.rendered && !this.isDestroyed){
//		this.el.focus();
//		if(selectText === true){
//			this.el.dom.select();
//		}
//	}
//	return this;
//};

/**
 * 修改setValue方法，不进行格式化
 * @param {} v huan@2015.05.11
 */
 Ext.form.NumberField.prototype.setValue = function(v){
        Ext.form.NumberField.superclass.setValue.call(this, String(v).replace(".", this.decimalSeparator));
    }


JxExt.bbsurl = function(keyid) {
	var imgurl = '.';
	if (Jxstar.systemVar.uploadType == '1') {
		imgurl = Jxstar.systemVar.uploadUrl;
	}
	imgurl += "/fileAction.do?funid=sys_attach&pagetype=editgrid&eventcode=down&nousercheck=1&dataType=byte&keyid="+keyid;
	return imgurl;
};

//不用超链接的href，则采用click是防止页面跳转，退出系统
JxExt.bbsfile = function(a) {
	var iframe = document.getElementById('frmhidden');
	iframe.src = JxExt.bbsurl(a.id);
};

//给HtmlEditor控件添加图片的方法
ImgHtmlEditor = Ext.extend(Ext.form.HtmlEditor, {
	//fileType 文件类型：1 图片、0 文件
	addImage : function(fileType) {
		var editor = this;
		var fileForm = editor.findParentByType('form');
		if (Ext.isEmpty(fileForm)) {
			return;
		}
		var form = fileForm.getForm();
		var define = fileForm.formNode.define;
		var dataFunId = define.nodeid;
		var tableName = define.tablename;
		var dataId = form.get(define.pkcol);
		
		var formItems = [{
			xtype: 'fileuploadfield',
			useType: 'file',
			labelWidth: 50,
			maxLength: 50,
			fieldLabel: '选择文件',
			name: 'attach_path',
			labelSeparator:'*', 
			buttonText: '',
			buttonCfg: {
				iconCls: 'upload_icon'
			},
			listeners:{
				fileselected: function(f, path) {
					var len = path.length;
					if (len > 0) {
						var pos = path.lastIndexOf('\\');
						if (pos >= 0) {
							path = path.substr(pos+1, len);
						}
					}
					imgform.getForm().findField('attach_name').setValue(path);
				}
			}
		},{
			xtype: 'hidden',
			fieldLabel: '附件名称',
			name: 'attach_name',
			labelSeparator:'*', maxLength:50
		}];
		var imgform = new Ext.FormPanel({
			region : 'center',
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			border : false,
			items : formItems,
			buttons : [{
				text : '上传',
				type : 'submit',
				handler : function() {
					var form = imgform.form;
					//上传参数
					var params = 'funid=sys_attach&pagetype=editgrid';
						params += '&attach_field=&dataid='+ dataId +'&datafunid='+ dataFunId;
						params += '&eventcode=create';
					
					//上传成功后关闭窗口并刷新数据
					var hdCall = function(data) {
						if (Ext.isEmpty(data)) {
							JxHint.alert('文件上传失败！');
							return;
						}
						var html;
						if (fileType == '1') {//上传图片
							html = '<img src="'+ JxExt.bbsurl(data.attachId) +'">';
						} else {//上传文件
							html = '<a href="#" id="'+ data.attachId +'" onclick="return JxExt.bbsfile(this);">'+ form.get('attach_name') +'</a>';
						}
						editor.insertAtCursor(html);
						
						win.close();
					};
					//上传附件
					Request.fileRequest(form, params, hdCall);
				}
			}, {
				text : '关闭',
				type : 'submit',
				handler : function() {
					win.close(this);
				}
			}]
		});

		var win = new Ext.Window({
					title : "上传文件",
					width : 300,
					height : 105,
					modal : true,
					border : false,
					icon : "./resources/images/icons/button/upload.gif",
					layout : "fit",
					items : imgform

				});
		win.show();
	},
	
	createToolbar : function(editor) {
        ImgHtmlEditor.superclass.createToolbar.call(this, editor);
        this.tb.insertButton(16, {
                    cls : "x-btn-icon",
					tooltip:'添加图片',
                    icon : "./resources/images/icons/button/upload.gif",
                    handler : function(){this.addImage('1');},
                    scope : this
                });
		 this.tb.insertButton(17, {
                    cls : "x-btn-icon",
					tooltip:'添加文件',
                    icon : "./resources/images/icons/button/change.gif",
                    handler : function(){this.addImage('0');},
                    scope : this
                });
    }
});
Ext.reg('imghtmleditor', ImgHtmlEditor);
