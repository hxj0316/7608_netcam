var base64 = new Base64();
var serverIp;
var dvr_url;
window.onload=function()
{
	serverIp=window.location.host;
	dvr_url='http://'+serverIp;
	var soft_ver=Cookies.get("softverison");
	//alert(soft_ver);
	$.ajax({
		type:"GET",
		url:dvr_url+"/cgi-bin/sys_info",
		dataType:"json",
		error:function(){},
		success:function(data)
		{
			//var soft_ver=Cookies.get("softverison");
			//alert(data.softwareVersion);
			if(data.softwareVersion != soft_ver)
			{
				setCookie30Days("softverison",data.softwareVersion);
				window.location.reload();
			}
		}
	});
	var Sys={};
	var ua=navigator.userAgent.toLowerCase();
	if(window.ActiveXObject)
	{
		Sys.ie=ua.match(/msie ([\d.]+)/)[1];
	}
	if(Sys.ie&&(Sys.ie.substring(0,1)=="8"))
	{	
		$("#login_div").css("behavior","url(js/ie-css3.htc)");
	}
	var user_name=document.getElementById("login_username");
	if(Cookies.get("username")!=null)
	{
		user_name.value=Cookies.get("username");
	}
	else
	{
		user_name.value='admin';
	}
	$("#login_userpwd").focus();
}
function login()
{
	var user_name=document.getElementById("login_username").value;
	var user_pwd=document.getElementById("login_userpwd").value;
	if(user_name==null||user_name=="")
	{
		alert("请输入用户名！");
	}
	else
	{
		var auth = "Basic " + base64.encode(user_name+':'+user_pwd);
		$.ajax({
			type:"PUT",
			url:dvr_url+"/login",
			dataType:"json",
			beforeSend : function(req){ 
				req.setRequestHeader('Authorization', auth);
				},
			error:function()
			{
				alert("error!");
			},
			success:function(data)
			{	
				if(data.statusCode!=0)
				{
					setCookie30Days("userpwd",escape(user_pwd));
					setCookie30Days("username",user_name);
					//alert(Cookies.get("username"));
					
					var url='http://'+serverIp+'/view.html';//'http://192.168.10.63/view.html'
					window.location.href=url;
				}
				else
				{
					alert("用户名或密码不匹配！");
				}
			}
		})/*
			alert('登录成功！');
			Cookies.set("username",user_name);
			//alert(Cookies.get("username"));
			Cookies.set("userpwd",escape(user_pwd));
			serverIp=window.location.host;
			var url='http://'+serverIp+'/view.html';//'http://192.168.10.63/index.html'
			self.location=url;
			*/
	}
}
function reset()
{
	document.getElementById("login_username").value="";
	document.getElementById("login_userpwd").value="";
}
