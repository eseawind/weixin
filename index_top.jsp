<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page import="org.jxstar.util.config.SystemVar" %>
<%@ page import="org.jxstar.security.LicenseVar" %>
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
	
	String loginCss = "resources/css/login.css";
	if (indexType.equals("1")) loginCss = "resources/project/css/login.css";
	
	String uploadType = SystemVar.getValue("upload.server.type", "0");
	String uploadUrl = SystemVar.getValue("upload.server.url");
	
	String allVarJs = SystemVar.getVarJs();
%>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8" />
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
	<%if (useMinJs.equals("1")){%>
		<link rel="stylesheet" type="text/css" href="lib/ext/ux/css/ext-ux-min.css" />
	<%} else {%>
		<link rel="stylesheet" type="text/css" href="lib/ext/ux/css/portal.css" />
		<link rel="stylesheet" type="text/css" href="lib/ext/ux/css/RowEditor.css" />
		<link rel="stylesheet" type="text/css" href="lib/ext/ux/css/fileuploadfield.css" />
		<link rel="stylesheet" type="text/css" href="lib/ext/ux/css/data-view.css" />
	<%}%>
	<script type="text/javascript">
		document.getElementById('loading-msg').innerHTML = '正在加载系统文件...';
	</script>

	<script type="text/javascript" src="lib/ext/adapter/ext-base.js"></script>
	<script type="text/javascript" src="lib/ext/ext-all.jsgz"></script>
	<script type="text/javascript" src="lib/ext/locale/ext-lang-<%=curLangType%>.js"></script>
	
	<%if (useMinJs.equals("1")){%>
		<script type="text/javascript" src="public/coremin/ext-ux-min.js"></script>
	<%} else {%>
		<script type="text/javascript" src="lib/ext/ux/RowExpander.js"></script>
		<script type="text/javascript" src="lib/ext/ux/Portal.js"></script>
		<script type="text/javascript" src="lib/ext/ux/PortalColumn.js"></script>
		<script type="text/javascript" src="lib/ext/ux/Portlet.js"></script>
		<script type="text/javascript" src="lib/ext/ux/RowEditor.js"></script>
		<script type="text/javascript" src="lib/ext/ux/Emptybox.js"></script>
		<script type="text/javascript" src="lib/ext/ux/FileUploadField.js"></script>
		<script type="text/javascript" src="lib/ext/ux/DateTimeField.js"></script>
	<%}%>
	<script type="text/javascript" src="public/locale/jxstar-lang-<%=curLangType%>.js"></script>
	<%if (useMinJs.equals("1")){%>
		<script type="text/javascript" src="public/coremin/jxstar-core-min.js"></script>
	<%} else {%>
		<script type="text/javascript" src="public/core/JxLang.js"></script>
		<script type="text/javascript" src="public/core/SessionTimer.js"></script>
		<script type="text/javascript" src="public/core/GridNode.js"></script>
		<script type="text/javascript" src="public/core/FormNode.js"></script>
		<script type="text/javascript" src="public/core/JxUtil.js"></script>
		<script type="text/javascript" src="public/core/JxAttach.js"></script>
		<script type="text/javascript" src="public/core/JxDefault.js"></script>
		<script type="text/javascript" src="public/core/JxLists.js"></script>
		<script type="text/javascript" src="public/core/JxGroup.js"></script>
		<script type="text/javascript" src="public/core/JxSum.js"></script>
		<script type="text/javascript" src="public/core/JxQuery.js"></script>
		<script type="text/javascript" src="public/core/JxExport.js"></script>
		<script type="text/javascript" src="public/core/JxPrint.js"></script>
		<script type="text/javascript" src="public/core/JxHint.js"></script>
		<script type="text/javascript" src="public/core/JxSelect.js"></script>
		<script type="text/javascript" src="public/core/JxFormSub.js"></script>
		<script type="text/javascript" src="public/core/JxQueryExt.js"></script>
		<script type="text/javascript" src="public/core/JxGroupExt.js"></script>
		<script type="text/javascript" src="public/core/JxSender.js"></script>
		<script type="text/javascript" src="public/core/JxMainTab.js"></script>
		
		<script type="text/javascript" src="public/portlet/PortletFun.js"></script>
		<script type="text/javascript" src="public/portlet/PortletMsg.js"></script>
		<script type="text/javascript" src="public/portlet/PortletWarn.js"></script>
		<script type="text/javascript" src="public/portlet/PortletBoard.js"></script>
		<script type="text/javascript" src="public/portlet/PortletResult.js"></script>
		<script type="text/javascript" src="public/portlet/PortletResultG.js"></script>
		<script type="text/javascript" src="public/portlet/PortletAssign.js"></script>
		<script type="text/javascript" src="public/portlet/PortletIcon.js"></script>
		<script type="text/javascript" src="public/portlet/PortletNews.js"></script>
		<script type="text/javascript" src="public/portlet/PortletSend.js"></script>
		
		<script type="text/javascript" src="public/core/JxMenu.js"></script>
		<script type="text/javascript" src="public/core/JxPortal.js"></script>
		<script type="text/javascript" src="public/core/JxPortalExt.js"></script>
		<script type="text/javascript" src="public/core/JxPagerTool.js"></script>
		<script type="text/javascript" src="public/core/JxImageField.js"></script>

		<script type="text/javascript" src="public/core/Request.js"></script>
		<script type="text/javascript" src="public/core/XmlRequest.js"></script>

		<script type="text/javascript" src="public/core/GridEvent.js"></script>
		<script type="text/javascript" src="public/core/FormEvent.js"></script>

		<script type="text/javascript" src="public/core/JxExt.js"></script>
		<script type="text/javascript" src="public/core/Jxstar.js"></script>
		
		<script type="text/javascript" src="public/core/JxWfGraph.js"></script>
		<script type="text/javascript" src="public/core/JxLabelPrint.js"></script>
		<script type="text/javascript" src="lib/graph/js/mxCanvas.js"></script>
	<%}%>
	
	<script type="text/javascript" src="public/data/NodeDefine.js"></script>
	<script type="text/javascript" src="public/data/RuleData.js"></script>
	<script type="text/javascript" src="public/locale/combo-lang-<%=curLangType%>.js"></script>
	
	<script type="text/javascript">Ext.fly('loading').hide();</script>
