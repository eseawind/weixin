<%@ page language="java" contentType="text/html; charset=UTF-8"  
    pageEncoding="UTF-8"%>  
<%@ page import="org.jxstar.util.config.SystemVar" %>
<%@ page import="org.jxstar.security.LicenseVar" %>

<html>
<head>
	<link rel="stylesheet" type="text/css" href="resources/project/css/sys_reg.css" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<body scroll="no">
	<div id="loading" class="reg_loading">
		<img src="resources/images/jxstar32.gif" width="32" height="32"
		style="margin-right:8px;float:left;vertical-align:bottom;"/>
		<span id="loading-msg">正在加载样式文件...</span>
	</div>
	<iframe id="frmhidden" name="frmhidden" style="display:none;"></iframe>
	<link rel="stylesheet" type="text/css" href="lib/ext/resources/css/ext-all.css" />
	<link rel="stylesheet" type="text/css" href="resources/css/main.css" />
	<link rel="stylesheet" type="text/css" href="public/coremin/ext-ux-min.css" />
	<script type="text/javascript">
		document.getElementById('loading-msg').innerHTML = '正在加载系统文件...';
	</script>
	<script type="text/javascript" src="zhx/demo/js/jquery-min.js"></script>
	<script type="text/javascript" src="lib/ext/adapter/ext-base.js"></script>
	<script type="text/javascript" src="lib/ext/ext-all.js"></script>
	<script type="text/javascript" src="lib/ext/locale/ext-lang-zh.js"></script>
	<script type="text/javascript" src="public/locale/jxstar-lang-zh.js"></script>
	<script type="text/javascript" src="public/coremin/ext-ux-min.js"></script>
	<script type="text/javascript" src="public/coremin/jxstar-core-min.js"></script>
	<script type="text/javascript" src="public/data/NodeDefine.js"></script>
	<script type="text/javascript" src="public/data/RuleData.js"></script>

	<script type="text/javascript">Ext.fly('loading').hide();</script>

	<div id="body_div" class="body_div">
	
	<div id="reg_body" class="reg_body">
		<div class='c17_div'></div>
		<div class="reg_div">
		<form id="form1" name="form1" method="post" action="sysregServlet" enctype="multipart/form-data">
			<table width="100%" class="mytable" border="0" cellspacing="0" cellpadding="0" align="center">
			  <tr>
				<th><span>客户注册文件：</span></th>
					
				<td>
					<div class="uploader white">
					<input type="text" class="filename" readonly="readonly"/>
					<input type="button" name="file" class="button" value="  浏览 ...  "/>
					<input name="license" id="license"  type="file" size="30"/>
					</div>
				<!-- input type="file" style="width:200px;height:25px;"  name="license" id="license"> -->
				</td>
			  </tr>
			  <tr>
				<th><span>客户许可模块文件：</span></th>
				<td>
					<div class="uploader white">
					<input type="text" class="filename" readonly="readonly"/>
					<input type="button" name="file" class="button" value="  浏览 ...  "/>
					<input name="regModule" id="regModule"  type="file" size="30"/>
					</div>
				
				<!-- input type="file" style="width:200px;height:25px;"  name="regModule" id="regModule" ></td> -->
			  </tr>
			  <tr>
				
				<td colspan="2" >
				<div class="white" align="center">
				<input type="button" class="buttonfull"  id="regbtn" 
					 value="注册"/>
				</div>
			  </tr>
			</table>
		</form>
		</div>
	
	</div>
	
	</div>
</body>
<script type="text/javascript">
	Ext.onReady(function() {
	//console.log(jx);
	//提交表单	
	var f_reg=function() { 
		var licenseFile= Ext.get('license');
		if(licenseFile.dom.value==""){
			JxHint.hint('请选择客户注册文件！');
			return false;
		}
		var regModuleFile= Ext.get('regModule');
		if(regModuleFile.dom.value==""){
			JxHint.hint('请选择客户许可模块文件！');
			return false;
		}
		var url='sysregServlet?licenseFileName='+licenseFile.dom.value+"&regModuleFileName="+regModuleFile.dom.value;
		Ext.Ajax.request({    
			url:url,  
			method: "POST",  
			form : 'form1',
			success: function (response, option) { 
				//alert(response.responseText);
				response =  Ext.util.JSON.decode(response.responseText); 
				console.log(response);
				if (response.success == true) {      
					JxHint.hint(response.msg );    
				}else{
					JxHint.alert('<span style="color:red">'+response.msg+'</span>'); 
				}    
			}
        });    
    };  
	//注册按钮
	Ext.fly('regbtn').on('click', f_reg);
}); 

$(function(){
	$("input[type=file]").change(function(){$(this).parents(".uploader").find(".filename").val($(this).val());});
	$("input[type=file]").each(function(){
	if($(this).val()==""){$(this).parents(".uploader").find(".filename").val("请选择文件");}
	});
});

</script>


</html>
