<%@ page contentType="text/html; charset=UTF-8"%>
<%@ include file="index_top.jsp"%>
	<div id="body_div" class="body_div">
	<%if (indexType.equals("1")) {%>
	<div id="login_body" class="login_body"><a style="top:10px;left:10px;font-size:9pt;color:#fff;" href="#" onclick="down_firfox();">下载Firefox浏览器</a>
		<div class="login_div">
		<table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
		  <tr>
			<th>用户名：</th>
			<td><input type="text" style="width:150px;height:20px;" tabindex=1 name="user_code" id="user_code"></td>
		  </tr>
		  <tr>
			<th>密－码：</th>
			<td><input type="password" style="width:150px;height:20px;" tabindex=2 name="user_pass" id="user_pass" onfocus="this.select()"></td>
		  </tr>
		  <tr>
			<td></td>
			<td>
			<input type="button" class="iput_bnt" id="loginbtn" 
				onmouseover="this.className='iput_bnt_hover';" onmouseout="this.className='iput_bnt';" value="登录"/>
			<input type="button" class="iput_bnt" style="margin-left:8px;" id="returnbtn" 
				onmouseover="this.className='iput_bnt_hover';" onmouseout="this.className='iput_bnt';" value="取消"/></td>
		  </tr>
		</table>
		</div>
		<div class="cpr_div"><%=indexBottom%></div>
	</div>
	<%} else {%>
	<div id="login_body" class="login_body">
		<div class="login_div">
		<table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
		  <tr>
			<td width="50">账号：</td>
			<td width="130"><input type="text" class="iput_text" tabindex=1 name="user_code" id="user_code"></td>
		  </tr>
		  <tr>
			<td>密码：</td>
			<td><input type="password" class="iput_text" tabindex=2 name="user_pass" id="user_pass" onfocus="this.select()"></td>
		  </tr>
		  <tr>
			<td height="80" colspan="2">
			<input type="button" class="iput_bnt" id="loginbtn" 
				onmouseover="this.className='iput_bnt_hover';" onmouseout="this.className='iput_bnt';" value="登录"/>
			<input type="button" class="iput_bnt" style="margin-left:20px;" id="returnbtn" 
				onmouseover="this.className='iput_bnt_hover';" onmouseout="this.className='iput_bnt';" value="取消"/></td>
		  </tr>
		</table>
		</div>
		<div class="cpr_div">
		<a href="http://www.jxstar.org" style="left:10px;color:#0085CF;text-decoration:none;" target="_blank"><%=indexBottom%></a>&nbsp;编制
		<a style="left:10px;color:#0085CF;text-decoration:none;display:none;" href="#" onclick="down_firfox();">下载Firefox8浏览器</a>
		</div>
	</div>
	<%}%>
	</div>
<%@ include file="index_bottom.jsp"%>
