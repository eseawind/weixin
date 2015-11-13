<%@ page contentType="text/html; charset=UTF-8"%>
<%
	String contextpath = request.getContextPath();
	String printparam = request.getParameter("printparam");
	if (printparam == null) printparam = "";
	String printurl = contextpath + "/reportAction.do?" + printparam;
%>
<html>
<head>
<title>打印窗口</title>
<style media="print">
.noprint {
	display:none;
}
</style>

<style type="text/css">
body {
	font-size:14px; text-align:left; margin:0px; background-color:#fafdff;
}
.printDiv {
	border-bottom:#336699 2px solid; padding:10px 0 2px 0; text-align:center; background-color:#deecfd;
}
.printBody {
	padding:10px 0 0 0; text-align:center; 
}
</style>

<script type="text/javascript">
function isIE(){
	var ua = navigator.userAgent.toLowerCase();
	return ua.indexOf('msie') > 0;
}
function $(id){
	return document.getElementById(id);
}
function printReport(){
	if (isIE()) {
		//用$("printIframe").focus();方式也会打印iframe边框
		printIframe.focus();   
  		window.print();
	} else {
		$("printIframe").contentWindow.print();
	}
}
function loadIframeDiv(){
	var ifbody = $("printIframe").contentWindow.document.body;
	if(ifbody){
		//alert(ifbody);
		//printIframe初始隐藏会造成报表中图片不能显示
		$("waitdiv").style.display = 'none';
		resizeIframe();
	}else{
		setTimeout("loadIframeDiv()", 100);
	}
}
function resizeIframe(){
	var ifrm = $("printIframe");
	var ifbody = ifrm.contentWindow.document.body;
	
	var width = ifbody.scrollWidth;
	var height = ifbody.scrollHeight;
	//alert(width+';'+height);
	ifrm.width = width;
	ifrm.height = height;
}
</script>
</head>
<!--
<OBJECT id="mywb" height=0 width=0 classid="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2" name="mywb"></OBJECT>
<CENTER>
1、打印 onclick=window.print() 
2、打印预览 onclick=mywb.execwb(7,1)
3、打印页面设置 onclick=mywb.execwb(8,1) 
打印前把不需要打印的页面设置为隐藏
-->
<body onload="loadIframeDiv();">
	<div class="printDiv noprint">
		<input onclick="printReport();" type="button" value="打印" name="button_print">
		<input onclick="javascript:window.close();" type="button" value="关闭窗口">
	</div>
	<div id="waitdiv" style="padding:10px 0 0 0; text-align:center;">正在加载，请稍后......</div>
	<div id="iframediv" class="printBody">
		<iframe id="printIframe" 
		style="background-color:#ffffff; border:#336699 1px solid;" frameborder=0 scrolling="no" name="printIframe" 
		src="<%=printurl%>">
		</iframe>
	</div>
</body>
</html>
