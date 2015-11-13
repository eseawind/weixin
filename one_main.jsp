<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page import="org.jxstar.util.config.SystemVar,
				 org.jxstar.security.LicenseVar,
				 java.util.Map,
				 org.jxstar.util.factory.FactoryUtil,
				 org.jxstar.control.login.OneLoginUtil" %>
<%
	String contextpath = request.getContextPath();
	String curLangType = "zh";//java.util.Locale.getDefault().getLanguage();
	String supLangType = SystemVar.getValue("sys.lang.type");
	String dbType = org.jxstar.dao.util.DBTypeUtil.getDbmsType();
	
	String svnNum = SystemVar.getValue("index.svn", "");
	String indexType = SystemVar.getValue("index.type", "0");
	String indexName = SystemVar.getValue("index.name", "JXstar软件开发平台");
	String indexBottom = SystemVar.getValue("index.bottom", "");
	String useMinJs = SystemVar.getValue("index.useminjs", "0");//开启可以提高文件加载效率
	
	String verNo = SystemVar.getValue("sys.version.no", "");
	String verType = LicenseVar.getValue(LicenseVar.VERSION_TYPE, "SE");
	String useCase = SystemVar.getValue("page.query.case", "0");
	boolean connValid = org.jxstar.dao.util.ConnValid.hasValid();
	
	if ((svnNum.length() == 0 && verNo.length() == 0) || !connValid) {
		response.sendRedirect(contextpath+"/error.jsp?errorCode=index.dbnostart");
	}
	
	String loginCss = "resources/css/login.css?verno=" + svnNum;
	if (indexType.equals("1")) loginCss = "resources/project/css/login.css?verno=" + svnNum;
	
	String uploadType = SystemVar.getValue("upload.server.type", "0");
	String uploadUrl = SystemVar.getValue("upload.server.url");
	
	String allVarJs = SystemVar.getVarJs();
	
	//获取会话信息
	String sessionData = OneLoginUtil.getSessionData(request);
	if (sessionData.length() == 0) {
		response.sendRedirect(contextpath+"/index.jsp");
	}
%>
<html>
<head>
	<title id='product_name'><%=indexName%>-<%=verType%>-<%=verNo%></title>
	<link rel="stylesheet" type="text/css" href="<%=loginCss%>" />
</head>
<body scroll="no">
	<div id="loading" class="login_loading">
		<img src="resources/images/jxstar32.gif" width="32" height="32"
		style="margin-right:8px;float:left;vertical-align:bottom;"/>
		<span id="loading-msg">正在加载样式文件...</span>
	</div>
	<iframe id="frmhidden" name="frmhidden" style="display:none;"></iframe>
	<link rel="stylesheet" type="text/css" href="lib/ext/resources/css/ext-all.cssgz" />
	<link rel="stylesheet" type="text/css" href="resources/css/main.css" />
	<link rel="stylesheet" type="text/css" href="public/coremin/ext-ux-min.css" />
	
	<script type="text/javascript">
		document.getElementById('loading-msg').innerHTML = '正在加载系统文件...';
	</script>

	<script type="text/javascript" src="lib/ext/adapter/ext-base.js"></script>
	<script type="text/javascript" src="lib/ext/ext-all.jsgz"></script>
	<script type="text/javascript" src="public/coremin/ext-ux-min.js"></script>
	<script type="text/javascript" src="lib/ext/locale/ext-lang-<%=curLangType%>.js"></script>
	
	<script type="text/javascript" src="public/locale/jxstar-lang-<%=curLangType%>.js"></script>
	<script type="text/javascript" src="public/coremin/jxstar-core-min.js"></script>
	
	<script type="text/javascript">
		document.getElementById('loading-msg').innerHTML = '正在加载功能数据...';
	</script>
	<script type="text/javascript" src="public/locale/combo-lang-<%=curLangType%>.js"></script>
	<script type="text/javascript" src="public/data/NodeDefine.js"></script>
	<script type="text/javascript" src="public/data/RuleData.js"></script>
	
	<script type="text/javascript">Ext.fly('loading').hide();</script>
</body>
<script type="text/javascript">
Ext.onReady(function() {
	Jxstar.isone = '1';//标识此请求是来自集成页面
	
	Jxstar.path = '<%=contextpath%>';
	Jxstar.systemVar.indexType = '<%=indexType%>';
	Jxstar.systemVar.verType = '<%=verType%>';
	Jxstar.systemVar.useCase = '<%=useCase%>';
	//支持集中附件管理模式
	Jxstar.systemVar.uploadUrl = '<%=uploadUrl%>';
	Jxstar.systemVar.uploadType = '<%=uploadType%>';
	Jxstar.systemVar.dbType = '<%=dbType%>';
	//把所有用于页面的系统变量附加到对象中
	Ext.apply(Jxstar.systemVar, Ext.decode("<%=allVarJs%>"));
	//设置EXT的常量
	Ext.BLANK_IMAGE_URL = Jxstar.path + '/lib/ext/resources/images/default/s.gif';
	Ext.chart.Chart.CHART_URL = Jxstar.path + '/lib/ext/resources/charts.swf';
	//显示系统支持的语言版本
	JxLang.showLang('<%=curLangType%>', '<%=supLangType%>');
	
	//登陆成功
	var f_success = function(data) {
		Jxstar.session = data;
		Jxstar.session.maxInterval = <%=session.getMaxInactiveInterval()%>;
		Jxstar.session.sessionId = '<%=session.getId()%>';

		Request.loadJS('/public/core/JxBody.js');
	};
	
	//集成直接登录
	if (Jxstar.isone == '1') {
		var data = Ext.decode("<%=sessionData%>");
		if (!Ext.isEmpty(data)) {
			f_success(data);
		}
	}
	
	//添加frmhidden的响应事件，用于处理文件下载的错误消息
	Ext.fly('frmhidden').on('load', function(event, dom){
		var doc = null;
		try {doc = dom.contentWindow.document;} catch(e) {}
		
		if (doc) {
			var text = doc.body.innerHTML;
			if (text == null || text.length == 0) {
				text = jx.index.downerror;
			}
			JxHint.alert(text);
		} else {
			JxHint.alert('执行完成！');
		}
	});
});
</script>
<script type="text/javascript">
var doKey = function(e){//用ExtJs的事件注册时无效
	var ev = e || window.event;
	var obj = ev.target || ev.srcElement;
	var t = obj.type || obj.getAttribute('type');//获取事件源类型
	if(ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea"){
		return false;
	}
};
//禁止后退键 作用于Firefox、Opera
document.onkeypress=doKey;
//禁止后退键  作用于IE、Chrome
document.onkeydown=doKey;
</script>
</html>
