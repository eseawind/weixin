/*
 * Copyright 2011 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
Jxstar.currentPage={verno:"1",parentEl:null,layoutEl:null,nodeId:"",compnum:0,colnums:parseInt(Jxstar.systemVar.fun__design__cols)||2,designItems:null,designDDs:[],designResizes:[],initpos:{formx:10,formy:35,formi:10,colx:2,coly:5,coli:8,fieldx:2,fieldy:5,fieldi:8},initsize:{formw:720,formh:380,colw:220,colh:360,fieldw:200,fieldh:22},bgsize:{cols:24,rows:50,width:40,height:30,left:10,top:10},destroy:function(){var a=this;Ext.each(a.designDDs,function(b){b.unreg();b=null});Ext.each(a.designResizes,function(b){b.destroy(true);b=null});a.designDDs=[];a.designResizes=[]},initWidth:function(c){var b=this;b.colnums=c;var a=b.bgsize.cols*b.bgsize.width;b.initsize.formw=a;b.initsize.colw=a/c-8;b.initsize.fieldw=a/c-15},render:function(d,q){var r=this;r.nodeId=d;r.initWidth(r.colnums);var f=q.getTopToolbar();var l=q.getComponent(0);if(l){l.removeAll(true);l.destroy();l=null;f.removeAll(true);f.add({text:" "})}l=new Ext.Panel({id:"des_form_panel",border:false});q.add(l);l.on("beforedestroy",function(){r.destroy();return true});var k=[{text:jx.fun.addrow,iconCls:"eb_add",handler:function(){r.createComponent("fdes-formitem")}},{text:jx.fun.addcol,iconCls:"eb_add",handler:function(){r.createComponent("fdes-columnitem")}},{text:jx.fun.addfld,iconCls:"eb_add",handler:function(){r.createComponent("fdes-fielditem")}}];var o=function(j){var i=j.text.split(" ")[0];r.initWidth(i)};var a=[{text:jx.fun.ctlprop,handler:function(){r.updateProp()}},{text:jx.fun.delctl,handler:function(){r.deleteComponent()}},{text:jx.fun.colnums,id:"menu_colnums",menu:{items:[{text:"2 cols",checked:true,group:"colsnum",checkHandler:o},{text:"3 cols",checked:false,group:"colsnum",checkHandler:o},{text:"4 cols",checked:false,group:"colsnum",checkHandler:o},{text:"5 cols",checked:false,group:"colsnum",checkHandler:o},{text:"6 cols",checked:false,group:"colsnum",checkHandler:o}]}},"-",{text:jx.wfx.exp,iconCls:"eb_exp",handler:function(){r.exportDesign()}}];f.add({text:jx.base.save,iconCls:"eb_save",handler:function(){r.saveDesign()}},{text:jx.fun.pub,iconCls:"eb_change",handler:function(){r.createPage()}},{text:jx.base.del,iconCls:"eb_delete",handler:function(){r.deleteDesign()}},{xtype:"tbseparator"},{text:jx.fun.synprop,iconCls:"eb_refresh",handler:function(){r.updateDesign()}},{text:jx.fun.setfld,iconCls:"eb_empty",handler:function(){r.selectField()}},{text:jx.fun.addlay,iconCls:"eb_form",handler:function(){r.createLayout(4,r.colnums)}},{text:jx.fun.setattr,iconCls:"eb_setattr",handler:function(){r.setattr()}},{xtype:"tbfill"},{xtype:"tbseparator"},{text:jx.fun.addctl,iconCls:"eb_menu",menu:k},{text:jx.wfx.extdo,iconCls:"eb_menu",menu:a});q.doLayout();r.parentEl=l.el;r.layoutEl=Ext.get(l.el.findParent("div.x-panel-body",2));var p=r.bgsize.width*r.bgsize.cols;var b=r.bgsize.height*r.bgsize.rows;r.parentEl.insertHtml("beforeEnd",'<div id="maincanvas" class="fdes-canvas x-unselectable" style="width:'+p+"px; height:"+b+'px;"></div>');var c="";for(var h=0;h<r.bgsize.cols;h++){for(var g=0;g<r.bgsize.rows;g++){var n=r.bgsize.top+g*r.bgsize.height;var e=r.bgsize.left+h*r.bgsize.width;c+='<div class="fdes-grid x-unselectable" style="top:'+n+"px;left:"+e+"px;width:"+r.bgsize.width+"px;height:"+r.bgsize.height+'px;"></div>'}}r.parentEl.insertHtml("beforeEnd",c);var m=r.parentEl.getWidth();r.parentEl.insertHtml("beforeEnd",'<div id="maincanvas_tmp" class="fdes-canvas-bg x-unselectable" style="width:'+m+"px;height:"+b+'px;"></div>');r.initDd();r.readDesign()},createPage:function(){var a="funid=sys_fun_base&eventcode=createfd";a+="&selfunid="+this.nodeId+"&selpagetype=form&projectpath="+Jxstar.session.project_path;Request.postRequest(a,null)},setattr:function(){var a=this;var b={where_sql:"fun_attr.attr_type = ? and fun_attr.fun_id = ?",where_type:"string;string",where_value:"form;"+a.nodeId};var c=function(e){JxUtil.delay(500,function(){e.fkValue=a.nodeId;e.attr_type="form";Jxstar.loadData(e,b)})};var d=Jxstar.findNode("fun_attrdes");Jxstar.showData({filename:d.gridpage,title:d.nodetitle,width:760,height:350,nodedefine:d,callback:c})},saveDesign:function(){var a=this;a.clearSelectDivs();a.designItems=a.queryDesignItems();var g="";var b=Ext.get("maincanvas");var d=this.formItemToXML(b);if(d.length==0){return}if(a.hasNoSaveItem(a.designItems)){JxHint.alert(jx.fun.tip01);return}g="<?xml version='1.0' encoding='utf-8'?>\r";g+="<page state='design' colnums='"+a.colnums+"' verno='"+a.verno+"'>\r";g+=d;g+="</page>";var c=encodeURIComponent;var f="funid=sys_fun_base&eventcode=savefd";f+="&selfunid="+this.nodeId+"&selpagetype=form";f+="&content="+c(g);Request.postRequest(f,null)},exportDesign:function(){var a=Jxstar.path+"/jxstar/studio/pub/exp_form_design.jsp?funid="+this.nodeId;document.getElementById("frmhidden").src=a},reloadDesign:function(){var a=this;var b=function(){a.parentEl.select("div.fdes-fielditem, div.fdes-columnitem, div.fdes-formitem").remove();a.readDesign()};Ext.Msg.confirm(jx.base.hint,jx.fun.tip02,function(c){if(c=="yes"){b()}})},readDesign:function(){var b=(new Date()).getTime();var c=this;var d=function(j){if(j==null||j.length==0){JxHint.alert(jx.fun.tip03);return false}var f=Request.loadXML(j);var h=f.getElementsByTagName("page").item(0);var l=c.readAttrVal(h,"state","default");c.verno=c.readAttrVal(h,"verno","0");var k=Ext.get("maincanvas");k.dom.innerHTML='<span style="color:#ff0000;font-size:12px;font-weight:bold;">version:'+c.verno+"</span>";var g=parseInt(c.readAttrVal(h,"colnums","2"));if(g<2){g=2}c.initWidth(g);var i=Ext.getCmp("menu_colnums").menu;i.get(g-2).setChecked(true);c.compnum=0;c.parseFormXML(h,l);c.insertCompHtml();var a=(new Date()).getTime();JxHint.hint("use time(ms): "+(a-b))};var e="funid=sys_fun_base&eventcode=query_formdes";e+="&selfunid="+this.nodeId+"&colnums="+this.colnums;Request.dataRequest(e,d,{type:"xml",wait:true})},deleteDesign:function(){var a=this;var b=function(){a.destroy();var c="funid=sys_fun_base&eventcode=deletefd";c+="&selfunid="+a.nodeId+"&selpagetype=form";Request.postRequest(c,function(){a.parentEl.select("div.fdes-fielditem, div.fdes-columnitem, div.fdes-formitem").remove();a.readDesign()})};Ext.Msg.confirm(jx.base.hint,jx.fun.tip04,function(c){if(c=="yes"){b()}})},updateDesign:function(){var a=this;var d=0;var b=function(j){var l=a.parentEl.query("div.fdes-fielditem");for(var k=0,e=l.length;k<e;k++){var p=l[k];var m=a.readAttrVal(p,"colcode","");if(m.length==0){continue}var h=j[m];if(h==null&&m.length>0){Ext.fly(p).remove();continue}var g=a.readAttrVal(p,"xtype","");if(h.xtype!=g&&g!="hidden"){if(!(h.xtype=="text"&&g=="area")){p.setAttribute("xtype",h.xtype);d++}}var o=a.readAttrVal(p,"title","");if(h.title!=o){p.setAttribute("title",h.title);p.innerHTML=h.title;d++}var f=a.readAttrVal(p,"visible","");if(h.visible=="false"&&f=="true"){p.setAttribute("visible",h.visible);Ext.fly(p).addClass("fdes-fieldhidden");d++}}JxHint.hint(String.format(jx.fun.syntip,d))};var c="funid=sys_fun_base&eventcode=query_field";c+="&selfunid="+a.nodeId;Request.dataRequest(c,b)},updateProp:function(){var j=this;if(j.selectDivs.length==0){JxHint.alert(jx.fun.tip05);return}if(j.selectDivs.length>1){JxHint.alert(jx.fun.tip06);return}var d=j.selectDivs[0];var c=Ext.fly(d);var e={};var g=jx.fun.setprop;var a=c.hasClass("fdes-formitem");if(a){g=jx.fun.setset;e={title:j.readAttrVal(d,"title",""),border:j.readAttrVal(d,"border","true")=="true",collapsible:j.readAttrVal(d,"collapsible","false")=="true",collapsed:j.readAttrVal(d,"collapsed","false")=="true"}}var h=c.hasClass("fdes-columnitem");if(h){return}var i=c.hasClass("fdes-fielditem");if(i){e={xtype:j.readAttrVal(d,"xtype",""),title:j.readAttrVal(d,"title",""),colcode:j.readAttrVal(d,"colcode",""),visible:j.readAttrVal(d,"visible","true")=="true"}}var f=new Ext.grid.PropertyGrid({border:false,width:300,source:e});f.getColumnModel().setColumnWidth(0,30);var b=new Ext.Window({title:g,layout:"fit",width:300,height:250,modal:true,closeAction:"close",items:[f],buttons:[{text:jx.base.ok,handler:function(){var k=f.getSource();if(i||a){d.setAttribute("title",k.title)}if(a){d.setAttribute("border",k.border.toString())}if(a){d.setAttribute("collapsible",k.collapsible.toString())}if(a){d.setAttribute("collapsed",k.collapsed.toString())}if(i){d.setAttribute("xtype",k.xtype)}if(i){d.setAttribute("colcode",k.colcode)}if(i){d.setAttribute("visible",k.visible.toString())}if(i){if(d.innerHTML!=k.title){d.innerHTML=k.title}if(k.visible==true||k.visible=="true"){Ext.fly(d).removeClass("fdes-fieldhidden")}else{Ext.fly(d).addClass("fdes-fieldhidden")}}b.close()}},{text:jx.base.cancel,handler:function(){b.close()}}]});b.show()},selectField:function(){var b=this;var a=function(j,i){var h=j.getStore();var g=h.getAt(i);var f=g.get("colcode");if(j.isSelected(i)){j.deselect(i);b.parentEl.select("div.fdes-fielditem[colcode="+f+"]").remove()}else{j.select(i);b.createComponent("fdes-fielditem",{colcode:f,xtype:g.get("xtype"),title:g.get("title"),visible:g.get("visible")})}};var e=function(k){var h=k.getStore();var g=b.parentEl.query("div.fdes-fielditem");for(var j=0,l=g.length;j<l;j++){var f=b.readAttrVal(g[j],"colcode");if(f.length>0){h.each(function(i){if(i.get("colcode")==f){k.select(i);return false}return true})}}};var c=function(h){var j=[];for(key in h){var g=h[key];if(g!==undefined){j[j.length]=[key,g.xtype,g.title,g.visible]}}var f=new Ext.data.ArrayStore({data:j,fields:["colcode","xtype","title","visible"]});var i=new Ext.ListView({store:f,style:"background-color:#fff;",hideHeaders:true,columns:[{header:jx.fun.name,dataIndex:"title",width:0.4},{header:jx.fun.code,dataIndex:"colcode",width:0.6}],listeners:{click:a,afterrender:e}});var k=new Ext.Window({title:jx.fun.selfld,layout:"fit",width:250,height:400,modal:true,closeAction:"close",items:[i]});k.show()};var d="funid=sys_fun_base&eventcode=query_field";d+="&selfunid="+b.nodeId;Request.dataRequest(d,c)},createLayout:function(m,k){var l=this;var e=l.initpos.formx;var c=l.getFormBottom()+l.initpos.formy;var n=m*l.bgsize.height+20;var g=l.initsize.formw;var b=l.createComponent("fdes-formitem",{left:e,top:c,width:g,height:n});for(var j=0;j<k;j++){var f=e+j*l.initsize.colw+j*l.initpos.coli+l.initpos.colx;var d=c+l.initpos.coly;var h=l.initsize.colw;var a=m*l.bgsize.height;var b=l.createComponent("fdes-columnitem",{left:f,top:d,width:h,height:a})}},getFormBottom:function(){var d=this;var b=d.parentEl.query("div.fdes-formitem");var a=0;for(var e=0,h=b.length;e<h;e++){var f=Ext.fly(b[e]);var c=f.getY()+f.getHeight();if(c>a){a=c}}if(a==0){a=25}else{a=a-d.parentEl.getY()}var g=Math.round(a/d.bgsize.height);a=g*d.bgsize.height;return a},createComponent:function(h,d){var g=this,d=d||{};var c="cust-comp"+g.compnum;var j=";top:"+(d.top||45)+"px;left:"+(d.left||750)+"px;";var b="",f="",a="",i=c;if(h=="fdes-formitem"){b="width:"+(d.width||g.initsize.formw)+";height:"+(d.height||g.initsize.formh)}else{if(h=="fdes-columnitem"){b="width:"+(d.width||g.initsize.colw)+";height:"+(d.height||g.initsize.colh)}else{if(d.title&&d.title.length>0){i=d.title;if(d.visible=="false"){f=" fdes-fieldhidden"}a+=' title="'+d.title+'"';a+=' colcode="'+d.colcode+'"';a+=' visible="'+d.visible+'"';a+=' xtype="'+d.xtype+'"'}b="width:"+g.initsize.fieldw+";height:"+g.initsize.fieldh}}var e="<div id="+c+' class="'+h+f+' x-unselectable" style="'+b+j+'"'+a+">"+i+"</div>";return g.createComponentByHtml(c,e)},createComponentByHtml:function(d,c){var a=this;a.compnum++;var b=a.parentEl.insertHtml("beforeEnd",c,true);a.addCompDD(b);return b},addCompHtml:function(b,a){this.compnum++;if(this.compHtml==undefined){this.compHtml=""}this.compHtml+=a},insertCompHtml:function(){var b=this;b.parentEl.insertHtml("beforeEnd",b.compHtml);var a="div.fdes-fielditem, div.fdes-columnitem, div.fdes-formitem";b.parentEl.select(a,true).each(b.addCompDD,b);b.compHtml=null;delete b.compHtml},addCompDD:function(c){var b=this;var a=new Ext.dd.DD(c.dom.id);a.setXConstraint(800,800,5);a.setYConstraint(1500,1500,5);b.designDDs.push(a);c.on("click",function(){var e=this,d=false;Ext.each(b.designResizes,function(g){if(g.getEl().id==e.id){d=true;return}});if(d){return}var f=new Ext.Resizable(e,{minWidth:40,minHeight:22});b.resizeForm(f);b.resizeColumn(f);b.designResizes.push(f)});c.on("dblclick",function(){b.updateProp()});b.initClickEl(c)},resizeForm:function(c){var a=this;var b=c.getEl();if(b.hasClass("fdes-formitem")){c.on("beforeresize",function(e){var d=e.getEl();e.childCols=a.findChilds(d.dom,"div.fdes-columnitem");return true},a);c.on("resize",function(f,d,e){Ext.each(f.childCols,function(g){Ext.fly(g).setHeight(e-18)});f.childCols=null;return true},a)}},resizeColumn:function(c){var a=this;var b=c.getEl();if(b.hasClass("fdes-columnitem")){c.on("beforeresize",function(e){var d=e.getEl();e.childFields=a.findChilds(d.dom,"div.fdes-fielditem");return true},a);c.on("resize",function(f,d,e){Ext.each(f.childFields,function(g){Ext.fly(g).setWidth(d-15)});f.childFields=null;return true},a)}},deleteComponent:function(){var a=this;if(a.selectDivs.length==0){JxHint.alert(jx.fun.tip07);return}Ext.each(a.selectDivs,function(b){Ext.fly(b).remove()});a.selectDivs=[]},parseFormXML:function(d,c){var k=this;var p=d.getElementsByTagName("formitem");var v=k.initpos.formx;var u=k.initpos.formy,a=u;for(var r=0,m=p.length;r<m;r++){if(c=="default"){u=(k.initsize.formh)*r+r*(k.initpos.formi)+a}var o=p.item(r);var f=k.readAttrVal(o,"x",v);var e=k.readAttrVal(o,"y",u);var j=k.readAttrVal(o,"width",k.initsize.formw);var t=k.readAttrVal(o,"height",k.initsize.formh);var l="form-comp"+k.compnum;var z=k.readAttrVal(o,"title","");var q=k.readAttrVal(o,"border","");var s=k.readAttrVal(o,"collapsible","");var b=k.readAttrVal(o,"collapsed","");var g='<div id="'+l+'" class="fdes-formitem x-unselectable" style="top:'+e+";left:"+f+";width:"+j+";height:"+t+';" title="'+z+'" border="'+q+'" collapsible="'+s+'" collapsed="'+b+'">F</div>';k.addCompHtml(l,g);k.parseColumnXML(o,c,f,e)}},parseColumnXML:function(r,e,b,a){var l=this;var d=r.getElementsByTagName("columnitem");var v=b+l.initpos.colx,c=v;var u=a+l.initpos.coly;for(var s=0,o=d.length;s<o;s++){if(e=="default"){v=(l.initsize.colw)*s+s*(l.initpos.coli)+c}var q=d.item(s);var g=l.readAttrVal(q,"x",v);var f=l.readAttrVal(q,"y",u);var k=l.readAttrVal(q,"width",l.initsize.colw);var t=l.readAttrVal(q,"height",l.initsize.colh);var m="col-comp"+l.compnum;var p=l.readAttrVal(q,"colwidth","0.33");var j='<div id="'+m+'" class="fdes-columnitem x-unselectable" style="top:'+f+";left:"+g+";width:"+k+";height:"+t+';" colwidth="'+p+'">C</div>';l.addCompHtml(m,j);l.parseFieldXML(q,e,g,f)}},parseFieldXML:function(d,f,k,j){var r=this;var a=d.getElementsByTagName("fielditem");var B=k+r.initpos.fieldx;var A=j+r.initpos.fieldy,b=A;for(var v=0,t=a.length;v<t;v++){if(f=="default"){A=(r.initsize.fieldh)*v+v*(r.initpos.fieldi)+b}var u=a.item(v);var o=r.readAttrVal(u,"x",B);var m=r.readAttrVal(u,"y",A);var q=r.readAttrVal(u,"width",r.initsize.fieldw);var z=r.readAttrVal(u,"height",r.initsize.fieldh);var s="field-comp"+r.compnum;var C=r.readAttrVal(u,"title");var l=r.readAttrVal(u,"colcode");var c=r.readAttrVal(u,"visible");var e=r.readAttrVal(u,"xtype");var g="";if(c=="false"){g="fdes-fieldhidden"}var p='<div id="'+s+'" class="fdes-fielditem x-unselectable '+g+'" style="top:'+m+";left:"+o+";width:"+q+";height:"+z+';" title="'+C+'" colcode="'+l+'" visible="'+c+'" xtype="'+e+'">'+C+"</div>";r.addCompHtml(s,p)}},queryDesignItems:function(){var c=this;var a=c.parentEl.query("div.fdes-formitem");var d=c.parentEl.query("div.fdes-columnitem");var b=c.parentEl.query("div.fdes-fielditem");return{form:a,column:d,field:b}},hasNoSaveItem:function(a){if(a.form.length>0){return true}if(a.column.length>0){return true}if(a.field.length>0){return true}return false},formItemToXML:function(e){var l=this;var o="";var b=l.findChilds(e,"div.fdes-formitem");if(b.length==0){JxHint.alert(jx.fun.tip08);return o}l.orderComponent(b,"y");if(!l.validCompRegion(b)){JxHint.alert(jx.fun.tip09);return o}for(var r=0,p=b.length;r<p;r++){var k=Ext.fly(b[r]);var g=k.getX()-l.parentEl.getX();var f=k.getY()-l.parentEl.getY();var j=k.getWidth();var t=k.getHeight();var m=l.readAttrVal(b[r],"id");var v=l.readAttrVal(b[r],"title");var q=l.readAttrVal(b[r],"border");var s=l.readAttrVal(b[r],"collapsible");var d=l.readAttrVal(b[r],"collapsed");var a=Math.round(j/l.bgsize.width);var c=l.verno;if(c=="0"){if(a>18){JxHint.alert("0版设计器的form布局不能超过18个背景格子！");return""}}else{if(c=="1"){if(a>24){JxHint.alert("1版设计器的form布局不能超过24个背景格子！");return""}}}var u=l.columnItemToXML(b[r]);if(u.length==0){return""}o+="\t<formitem x='"+g+"' y='"+f+"' width='"+j+"' height='"+t+"' id='"+m+"' title='"+v+"' border='"+q+"' collapsible='"+s+"' collapsed='"+d+"'>\r";o+=u;o+="\t</formitem>\r";l.designItems.form.remove(b[r])}return o},columnItemToXML:function(q){var r=this;var j="";var d=r.findChilds(q,"div.fdes-columnitem");if(d.length==0){JxHint.alert(jx.fun.tip10);return j}r.orderComponent(d,"x");if(!r.validCompRegion(d)){JxHint.alert(jx.fun.tip11);return j}for(var k=0,e=d.length;k<e;k++){var c=Ext.fly(d[k]);var o=c.getX()-r.parentEl.getX();var m=c.getY()-r.parentEl.getY();var p=c.getWidth();var l=c.getHeight();var b=r.readAttrVal(d[k],"id");var f=0.33;var g=r.verno;if(g=="0"){var a=Math.round(p/120);f=((a/6)*0.99).toFixed(3)}else{if(g=="1"){var a=Math.round(p/r.bgsize.width);f=((a/r.bgsize.cols)*0.99).toFixed(4)}}f=parseFloat(f);j+="\t\t<columnitem x='"+o+"' y='"+m+"' width='"+p+"' height='"+l+"' id='"+b+"' colwidth='"+f+"'>\r";j+=r.fieldItemToXML(d[k]);j+="\t\t</columnitem>\r";r.designItems.column.remove(d[k])}return j},fieldItemToXML:function(f){var o=this;var a="";var u=o.findChilds(f,"div.fdes-fielditem");o.orderComponent(u,"y");for(var r=0,q=u.length;r<q;r++){var l=Ext.fly(u[r]);var j=l.getX()-o.parentEl.getX();var g=l.getY()-o.parentEl.getY();var k=l.getWidth();var s=l.getHeight();var p=o.readAttrVal(u[r],"id");var t=o.readAttrVal(u[r],"title");var e=o.readAttrVal(u[r],"colcode");var b=o.readAttrVal(u[r],"visible","true");var c=o.readAttrVal(u[r],"xtype");var d=100;var m=Ext.fly(f).getWidth();if(k<m*0.8){d=parseInt(k*100/m)}if(c=="text"&&s>(o.initsize.fieldh*1.5)){c="area"}if(b!="true"){c="hidden"}else{if(c=="hidden"){c="text"}}a+="\t\t\t<fielditem x='"+j+"' y='"+g+"' width='"+k+"' height='"+s+"' id='"+p+"' title='"+t+"' colcode='"+e+"' visible='"+b+"' xtype='"+c+"' anchor='"+d+"'/>\r";o.designItems.field.remove(u[r])}return a},readAttrVal:function(c,b,a){var d=c.getAttribute(b)||"";if(d.length==0){d=a||""}return d},orderComponent:function(a,h){var e,b,k=0;for(var g=0,c=a.length;g<c;g++){if(h=="x"){k=Ext.fly(a[g]).getX()}else{k=Ext.fly(a[g]).getY()}for(var f=g+1,d=a.length;f<d;f++){if(h=="x"){b=Ext.fly(a[f]).getX()}else{b=Ext.fly(a[f]).getY()}if(k>b){e=a[g];a[g]=a[f];a[f]=e;k=b}}}},validCompRegion:function(d){for(var l=0,e=d.length;l<e;l++){var s=Ext.fly(d[l]);var b=s.getX();var q=s.getY();var f=b+s.getWidth();var r=q+s.getHeight();for(var k=l+1,g=d.length;k<g;k++){var h=Ext.fly(d[k]);var a=h.getX();var p=h.getY();var c=a+h.getWidth();var o=p+h.getHeight();if((b<a&&f>a)&&(q<p&&r>p)){return false}if((q<p&&r>p)&&(b<c&&f>c)){return false}if((b<c&&f>c)&&(q<o&&r>o)){return false}if((q<o&&r>o)&&(b<a&&f>a)){return false}}}return true},findChilds:function(l,u){var r=this;var w=[],t=0;var j=Ext.fly(l);var o=j.getY();var q=o+j.getHeight();var a=j.getX();var b=a+j.getWidth();var h=r.parentEl.query(u);for(var v=0,s=h.length;v<s;v++){var f=Ext.fly(h[v]);var d=f.getX();var c=f.getY();var e=f.getWidth();var p=f.getHeight();var k=d+e/2;var g=c+p/2;if(k>=a&&k<=b&&g>=o&&g<=q){w[t++]=h[v]}}return w},selectDivs:[],selectDowned:false,selectOldXY:[],moveDowned:false,moveDownEl:null,moveOldX:0,moveOldY:0,moreDivPos:null,initDd:function(){var a=this;a.parentEl.on("mousedown",a.moreMouseDown,a);a.parentEl.on("mouseup",a.moreMouseUp,a);a.parentEl.on("mousemove",a.moreMouseMove,a)},moreMouseDown:function(f){var c=this;c.parentEl.select("#select_flag_div").remove();c.selectDowned=true;if(Ext.isIE){c.parentEl.dom.onselectstart=function(){return false}}var d=f.getXY();var b=c.parentEl.getXY();var a=d[0]-b[0];var g=d[1]-b[1];c.selectOldXY=[a,g];c.parentEl.insertHtml("afterBegin",'<div id="select_flag_div" class="fdes-selectdiv" style="left:'+a+"px;top:"+g+'px;"></div>')},moreMouseUp:function(d){var a=this;if(!a.selectDowned){return}a.clearSelectDivs();if(Ext.isIE){a.parentEl.dom.onselectstart=null}var c=a.parentEl.first("#select_flag_div");var b=a.findChilds(c,"div.fdes-fielditem, div.fdes-columnitem, div.fdes-formitem");a.flagSelectDivs(b);c.remove()},moreMouseMove:function(g){var l=this;if(!l.selectDowned){return}var c=l.parentEl.first("#select_flag_div");var m=g.getXY();var d=l.parentEl.getXY();var j=m[0]-d[0],i=m[1]-d[1];var b=l.selectOldXY[0],a=l.selectOldXY[1];var k=Math.abs(j-b);var f=Math.abs(i-a);c.setWidth(k);c.setHeight(f);if(j>b&&i<a){c.setTop(i)}else{if(j<b&&i<a){c.setTop(i);c.setLeft(j)}else{if(j<b&&i>a){c.setLeft(j)}}}},selectCss:function(d){var c=this.selectDivs;for(var b=0,e=c.length;b<e;b++){var a=Ext.fly(c[b]);if(d){a.addClass("fdes-selectcomp")}else{a.removeClass("fdes-selectcomp")}}},flagSelectDivs:function(b){if(b==null||b.length==0){return}var a=this;a.selectCss(false);a.selectDivs=b;a.selectCss(true);a.selectXY();a.moreDivPos=a.getMoreDivPos()},clearSelectDivs:function(){var a=this;a.selectCss(false);a.selectDivs=[];a.moreDivPos=null;a.selectDowned=false},isSelectDiv:function(c){var b=this.selectDivs;for(var a=0,e=b.length;a<e;a++){var d=b[a];if(c.id==d.id){return true}}return false},selectXY:function(){var a=this;var c=a.selectDivs;for(var b=0,d=c.length;b<d;b++){a.saveOldXY(c[b])}},saveOldXY:function(e){var b=Ext.fly(e);var a=this.layoutEl.getScroll();if(a.top!=0){var d=b.getX()+a.left;var c=b.getY()+a.top;e.oldXY=[d,c]}else{e.oldXY=b.getXY()}},initClickEl:function(b){var a=this;b.on("mousedown",function(c){a.oneMouseDown(b,c)});b.on("mousemove",function(c){a.oneMouseMove(c)});b.on("mouseup",function(c){a.oneMouseUp(c)})},oneMouseDown:function(d,c){var a=this;var b=a.isSelectDiv(d.dom,a.selectDivs);if(b){if(c.ctrlKey){d.removeClass("fdes-selectcomp");a.selectDivs.remove(d.dom);a.moreDivPos=a.getMoreDivPos()}else{if(a.selectDivs.length>1){a.moveOldX=d.getX();a.moveOldY=d.getY();a.moveDowned=true;a.moveDownEl=d}}}else{a.oneClickEl(d,c)}},oneMouseMove:function(d){var m=this;if(!m.moveDowned){return}var j=m.layoutEl.getScroll();var l=m.moveDownEl;var p=l.getX()-m.moveOldX-j.left;var o=l.getY()-m.moveOldY-j.top;var g=m.validMoreDivX(p);var f=m.validMoreDivY(o);for(var c=0,a=m.selectDivs.length;c<a;c++){var k=m.selectDivs[c];var h=Ext.fly(k);var b=k.oldXY;if(g){h.setX(b[0]+p)}if(f){h.setY(b[1]+o)}}},oneMouseUp:function(b){var a=this;if(!a.moveDowned){return}a.selectXY();a.moreDivPos=a.getMoreDivPos();a.moveOldX=0;a.moveOldY=0;a.moveDownEl=null;a.moveDowned=false},oneClickEl:function(d,c){var b=this;if(!c.ctrlKey){b.clearSelectDivs()}var a=b.selectDivs.length;b.selectDivs[a]=d.dom;d.addClass("fdes-selectcomp");b.saveOldXY(d.dom);b.moreDivPos=b.getMoreDivPos()},getMoreDivPos:function(){var q=this;var o=1000000;for(var e=0,c=q.selectDivs.length;e<c;e++){var j=Ext.fly(q.selectDivs[e]);if(j.getX()<o){o=j.getX()}}var l=1000000;for(var e=0,c=q.selectDivs.length;e<c;e++){var j=Ext.fly(q.selectDivs[e]);if(j.getY()<l){l=j.getY()}}var p=0;for(var e=0,c=q.selectDivs.length;e<c;e++){var j=Ext.fly(q.selectDivs[e]);var k=j.getX()+j.getWidth();if(k>p){p=k}}var f=0;for(var e=0,c=q.selectDivs.length;e<c;e++){var j=Ext.fly(q.selectDivs[e]);var a=j.getY()+j.getHeight();if(a>f){f=a}}var b=p-o;var m=f-l;var d=q.parentEl.getXY();var h=o-d[0];var g=l-d[1];return{x:h,y:g,width:b,height:m}},validMoreDivX:function(e){var b=this;var c=0;var d=b.parentEl.getWidth();var f=b.moreDivPos.x;var a=b.moreDivPos.width;if((f+e)<c){return false}if((f+a+e)>(c+d)){return false}return true},validMoreDivY:function(d){var a=this;var b=0;var f=a.parentEl.getHeight()-20;var e=a.moreDivPos.y;var c=a.moreDivPos.height;return true}};