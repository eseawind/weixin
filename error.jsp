<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page import="org.jxstar.util.resource.JsMessage" %>
<%
	String errorCode = request.getParameter("errorCode");
	String errorInfo = JsMessage.getValue(errorCode);
%>
<html>
<head>
	<title>JXstar软件开发平台</title>
</head>
<body>
<div style='margin-top:10px;margin-left:10px;'>
<div style='font-size:12px;color:red;'><%=errorInfo%></div>
<div style='margin-top:4px;'><a style='font-size:12px;color:green;' href='index.jsp'>返回首页</a></div>
</div>
</body>
</html>
