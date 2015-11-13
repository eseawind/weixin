/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/**
 * 可以上传图片、删除图片、显示图片的控件
 */
Ext.ux.form.JxImageField = Ext.extend(Ext.form.DisplayField, {
	//附件管理模式设置、及URL设置
	uploadType: '0',
	uploadUrl: '',
    /**
     * @cfg {String} addbtnCls
     */
	addbtnCls: 'x-tool-plus',
    /**
     * @cfg {String} delbtnCls
     */
	delbtnCls: 'x-tool-minus',
    /**
     * @cfg {String} addbtnCfg
     */
    /**
     * @cfg {String} delbtnCfg
     */
    /**
     * @cfg {String} readOnly
     */
	 
	 blankText : 'This field is required',
	 
	 allowBlank : true,
	 
	 value : '',
	 
    // private
    initComponent: function(){
        Ext.ux.form.JxImageField.superclass.initComponent.call(this);

        this.addEvents(
		/**
		* @param {Jxstar.GridEvent} this
		**/
		'beforesave', 
		/**
		* @param {Jxstar.GridEvent} this
		**/
		'aftersave',
		/**
		* @param {Jxstar.GridEvent} this
		* @param {Ext.data.Record[]} records
		**/
		'beforedelete', 
		/**
		* @param {Jxstar.GridEvent} this
		* @param {JSON[]} data
		**/
		'afterdelete'
		);
    },

    // private
    onRender : function(ct, position){
		//附件管理类型与集中管理路径
		this.uploadType = Jxstar.systemVar.uploadType;
		this.uploadUrl = Jxstar.systemVar.uploadUrl;
			
		Ext.ux.form.JxImageField.superclass.onRender.call(this, ct, position);
		
        this.wrap = this.el.wrap({cls:'x-form-field-wrap x-form-image-wrap'});
        this.el.hide();
		this.el.dom.removeAttribute('name');
        this.createImage();

		this.addbtn = this.wrap.createChild(this.addbtnCfg ||
                {tag: "img", src: Ext.BLANK_IMAGE_URL, alt: "", cls: "x-form-image-btn x-tool " + this.addbtnCls, title: '上传图片', style:'right:20px;'});
		this.delbtn = this.wrap.createChild(this.delbtnCfg ||
                {tag: "img", src: Ext.BLANK_IMAGE_URL, alt: "", cls: "x-form-image-btn x-tool " + this.delbtnCls, title: '删除图片', style:'right:2px;'});				
		this.initBtn();
		
		this.resizeEl = this.positionEl = this.wrap;
    },
	
	// private
    afterRender : function(){
        Ext.ux.form.JxImageField.superclass.afterRender.call(this);
		if(this.rendered){
			JxUtil.delay(500, function() {//在fieldset中计算宽度不准，要加延时
				this.imageEl.setWidth(this.imageEl.getWidth() - 2);
				//this.imageEl.setHeight(this.imageEl.getHeight() - 20);
			}, this);
			this.loadImage(Ext.BLANK_IMAGE_URL);
		}
    },
	
    getErrors: function(value) {
        var errors = [];
        if (this.allowBlank == false && (value.length < 1 || value === this.emptyText)) {
            errors.push(this.blankText);
        }
		return errors;
	},
    isValid : function(){
        var valid = Ext.form.DisplayField.superclass.isValid.call(this);
		return valid;
    },
    validate : function(){
		var valid =  Ext.form.DisplayField.superclass.validate.call(this);
		return valid;
    },
	getRawValue : function() {
		return this.value;
	},
	getValue : function(){
        return this.getRawValue();
    },
    setValue : function(v){
		this.value = v;
        return this;
    },

    createImage : function() {
        this.imageEl = this.wrap.createChild({
            id: this.getImageId(),
            name: this.name||this.getId(),
            cls: 'x-form-image',
            tag: 'img',
            src: this.getImageUrl()
        });
    },
	
    getImageId : function(){
        return this.id + '-img';
    },
	
	getImageUrl : function(){
		return this.imageUrl;
	},
	
    initBtn : function(){
        this.mon(this.addbtn, 'click', this.onAddClick, this);
        this.addbtn.addClassOnOver(this.addbtnCls + '-over');
		
		this.mon(this.delbtn, 'click', this.onDelClick, this);
        this.delbtn.addClassOnOver(this.delbtnCls + '-over');
    },
	
    // private
    onDestroy : function(){
		Ext.destroy(this.imageEl, this.addbtn, this.delbtn, this.wrap);
		Ext.ux.form.JxImageField.superclass.onDestroy.call(this);
    },
	
    onDisable: function(){
        Ext.ux.form.JxImageField.superclass.onDisable.call(this);
        this.doDisable(true);
    },
    
    onEnable: function(){
        Ext.ux.form.JxImageField.superclass.onEnable.call(this);
        this.doDisable(false);
    },
	
    setReadOnly : function(readOnly){
		Ext.ux.form.JxImageField.superclass.setReadOnly.call(this, readOnly);
        this.doDisable(readOnly);
    },
    
    // private
    doDisable: function(disabled){
		if (this.addbtn && this.delbtn) {
			if (disabled) {
				this.addbtn.addClass(this.disabledClass);
				this.delbtn.addClass(this.disabledClass);
			} else {
				this.addbtn.removeClass(this.disabledClass);
				this.delbtn.removeClass(this.disabledClass);
			}
		}
		this.disabled = disabled;
    },
	
	// 加载附件中的图片
	loadImage : function(imageUrl){
		if (imageUrl) {
			this.imageUrl = imageUrl;
		} else {
			var param = JxAttach.attachParam(this, 'fdown');
			if (param == null) return;
			
			var url = Jxstar.path;
			if (this.uploadType == '1') {
				url = this.uploadUrl;
			}
			
			param = param.params;
			//加载图片前的事件
			if (this.loadImageParam) {
				param = this.loadImageParam(this);
			}
			
			this.imageUrl = url + '/fileAction.do?' + param + '&dataType=byte&&nousercheck=1&dc=' + (new Date()).getTime();
		}
		this.imageEl.dom.src = this.imageUrl;
	},
	
	clearImage : function() {
		this.setValue('');
		if (this.imageEl) {
			this.imageUrl = Ext.BLANK_IMAGE_URL;
			this.imageEl.dom.src = this.imageUrl;
		}
	},
	
	//删除附件中的图片，并清空此控件中的图片
	onDelClick : function(){
		if (this.disabled) return;
		var self = this;
		
		var hdcall = function() {
			var param = JxAttach.attachParam(self, 'fdelete');
			if (param == null) return;
			//删除附件前事件
			if (self.fireEvent('beforedelete', self, param) == false) return;
			
			//设置业务状态值
			var audit0 = '0', audit6 = '6';
			if (param.define.status) {
				audit0 = param.define.status['audit0'];
			}
			var audit = audit0;
			if (param.define.auditcol.length > 0) {
				audit = param.form.get(param.define.auditcol);
			}
			if (audit != audit0 && audit != audit6) {
				JxHint.alert('业务记录已提交，不能删除附件！');
				return;
			}
			
			//清除附件字段值
			var hdcall = function() {
				//删除附件后事件
				self.fireEvent('afterdelete', self, param);
				
				self.loadImage();
			};
			
			//发送删除请求
			if (self.uploadType == '1') {//删除远程附件
				var url = self.uploadUrl + '/fileAction.do?' + param.params + '&nousercheck=1';
				Ext.fly('frmhidden').dom.src = url;
				//延时执行回调函数，index.jsp中的frmhidden.load事件会提示执行完成！
				JxUtil.delay(800, function(){
					hdcall();
				});
			} else {
				Request.postRequest(param.params, hdcall);
			}
		};
		
		//确定删除选择的记录吗？
		Ext.Msg.confirm(jx.base.hint, '确定删除当前图片附件吗？', function(btn) {
			if (btn == 'yes') hdcall();
		});
	},
	
	//如果是集中附件管理，则采用跨域上传的方式
	onRemoteAdd : function() {
		var self = this;
		var url = self.uploadUrl;
		var ifrHtml = '<iframe frameborder="no" style="display:none;border-width:0;width:100%;height:100%;"></iframe>';
		var win = new Ext.Window({
			title:'上传附件', layout:'fit', width:400, height:160,
			modal: true, closeAction:'close', html: ifrHtml,
			listeners: {show:function(cmp){
				var param = JxAttach.attachParam(self, 'fcreate');
				var href = url + "/jxstar/other/jsp/uploadfield.jsp?" + param.params + '&user_id=' + Jxstar.session['user_id'];

				var frm = cmp.getEl().child('iframe');
				frm.dom.src = href + '&_dc=' + (new Date()).getTime();//避免缓存
				frm.show();
			}}
		});
		win.on('close', function(){
			self.setValue('remote.gif');
			self.loadImage();
		});
		win.show();
	},
	
	//上传图片，并显示在此控件中
	onAddClick : function(){
		if (this.disabled) return;
		//远程上传附件
		if (this.uploadType == '1') {
			this.onRemoteAdd();
			return;
		}
		
		var imageField = this;
		var imageName = this.name;
		var queryForm = new Ext.form.FormPanel({
				layout:'form', 
				labelAlign:'right',
				labelWidth:80,
				border:false, 
				baseCls:'x-plain',
				autoHeight: true,
				bodyStyle: 'padding: 20px 10px 0 10px;',
				items: [{
					anchor: '95%',
					allowBlank: false,
					xtype: 'fileuploadfield',
					useType: 'file',
					fieldLabel: jx.event.selfile,	//选择文件
					name: imageName,
					labelSeparator:'*', 
					buttonText: '',
					buttonCfg: {
						iconCls: 'upload_icon'
					}
				}]
			});

		//创建对话框
		var self = this;
		var win = new Ext.Window({
			title:jx.event.uptitle,	//上传附件
			layout:'fit',
			width:400,
			height:130,
			resizable: false,
			modal: true,
			closeAction:'close',
			items:[queryForm],

			buttons: [{
				text:jx.base.ok,	//确定
				handler:function(){
					var form = queryForm.getForm();
					if (!form.isValid()) return;
					var imageValue = form.get(imageName);
					
					var param = JxAttach.attachParam(imageField, 'fcreate');
					if (param == null) return;
					//上传附件前事件
					if (self.fireEvent('beforesave', self, param) == false) return;
					
					//上传参数
					var params = param.params + '&attach_name='+ encodeURIComponent(imageValue);
					
					//上传成功后关闭窗口并显示图片
					var hdCall = function() {
						win.close();
						//上传附件后事件
						self.fireEvent('aftersave', self, param);
						//设置文件名，并标记不修改
						imageField.setValue(imageValue);
						imageField.originalValue = imageValue;
						//把文件名写入记录对象，防止刷新界面时不加载图片
						if (param.form && param.form.myRecord) {
							var record = param.form.myRecord;
							record.set(imageName, imageValue);
							record.commit();
						}
						
						imageField.loadImage();
					};
					//上传附件
					Request.fileRequest(form, params, hdCall);
				}
			},{
				text:jx.base.cancel,	//取消
				handler:function(){win.close();}
			}]
		});
		win.show();
	}
});

Ext.reg('imagefield', Ext.ux.form.JxImageField);