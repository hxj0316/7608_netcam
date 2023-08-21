//initial
var g_usr;
var	g_pwd;
var player = undefined;
var dvr_url;
var _obj;
var dvr_ajax;
var view_main,view_image_basic,view_image_adv, view_video_privacy_mask,video_video_overlayer,view_yuntai;
var serverIp;
var control=['Set_Image','Set_Video','Net_Access','Platform_Access','UserManage','SystemSetting','gb28181'];
var ieActivex;
var rate;
var _resolution=0;
var show_delay_ms = 2000;
var hide_delay_ms = 2000;
var update_one_second_timer;
var default_ip;
var default_gw;
var default_mask;
var _userid;
var _menucontrol=0;
var userright='';
var iCount;//码率循环获取开关
var timer;
var _ocx_check=true;
var onOroff=false;//声音开关标志:true为开,false为关;
var talkOnOroff=false;//对讲开关标志:true为开,false为关;
var pcRecOnOroff=false;//PC录像开关标志:true为开,false为关;
var pcRecFmt=0;//PC录像格式:0：AVI,1：原始数据;
var pcRecAudio=false;//PC录像音频开关标志:true为开,false为关;
var pcRecPath="D:\gk_recorder";//PC录像路径;
var filter  	=	/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
var _cbrbpsMax=0;
var _cbrbpsMin=0;
var _format_fpsMax=0;
var _format_fpsMin=0;
var swfu;


//初始化二维数组
var wifi_info=new Array();
for (var i=0;i<50;i++)
{
	wifi_info[i]=new Array();
	for(var j=0;j<6;j++)
	{
		wifi_info[i][j]="";
	}
}
var _copy=new Array();
for (var i=0;i<7;i++)
{
	_copy[i]=new Array();
	for(var j=0;j<8;j++)
	{
		_copy[i][j]="";
	}
}
//Overlay
//var nowChannl = 101;  //默认当前通道为101;
var dateX,dateY,nameX,nameY,deviceX ,deviceY;      //获取Overlay当前百分比
var device_time = "2015/10/12 12:00:00";
var device_week = "星期一";
var daX,daY,naX,naY,deX,deY;
var da_enabled,na_enabled,de_enabled,display_week;
var O_channelName,O_channelID;
var time_format,date_format;
//cover
var oWarp,oMove_view;
var oMove = [];
var P_id, P_enabled, P_X, P_Y, P_W, P_H, P_color;
var P1_id, P1_enabled, P1_X, P1_Y, P1_W, P1_H, P1_color;
var P2_id, P2_enabled, P2_X, P2_Y, P2_W, P2_H, P2_color;
var P3_id, P3_enabled, P3_X, P3_Y, P3_W, P3_H, P3_color;
var ocx=0;
var _menuctr=0;
var _view_ctr=true;
var base64 = new Base64();
var w=(0.8*window.screen.width).toFixed(0);
var h=(0.8*window.screen.height).toFixed(0);

var _view_main=false;
//动态添加语言js文件
var language=Cookies.get("language");
switch(language)
{
	case '0':
		document.write('<script src="js/simple_chinese.js"><\/script>');
		//language_select();
		break;
	case '1':
		//document.write('<script src="js/spanish.js"><\/script>');
		break;
	case '2':
		//document.write('<script src="js/Deutsch.js"><\/script>');
		break;
	case '3':
		//document.write('<script src="js/french.js"><\/script>');
		break;
	case '4':
		//document.write('<script src="js/Italian.js"><\/script>');
		break;
	case '5':
		//document.write('<script src="js/Polski.js"><\/script>');
		break;
	case '6':
		//document.write('<script src="js/Korean.js"><\/script>');
		break;
	case '7':
		document.write('<script src="js/english.js"><\/script>');
		//language_select();
		break;
	case '8':
		//document.write('<script src="js/traditional_chinese.js"><\/script>');
		break;
	default:
		language=0;
		setCookie30Days("language",language);
		//alert(document.cookie);
		document.write('<script src="js/simple_chinese.js"><\/script>');
		language_select();
		break;
}
function logout()
{
	Cookies.clear("username");
	Cookies.clear("userpwd");
	Cookies.clear("language");
	var url='http://'+serverIp;
	window.location.href=dvr_url;
}
$(document).ready(function()
{
	var soft_ver=Cookies.get("softverison");
	//alert(soft_ver);
	//alert(document.cookie);
	serverIp =window.location.host;
	dvr_url = "http://" + serverIp;
	var auth = "Basic " + base64.encode(Cookies.get("username")+':'+Cookies.get("userpwd"));
	var str='{"username":"'+Cookies.get("username")+'","password":"'+Cookies.get("userpwd")+'"}';
	$.ajax({
		type:"GET",
		url:dvr_url+"/cgi-bin/sys_info",
		dataType:"json",
		beforeSend:function(req)
		{
			//req.setRequestHeader('Authorization', auth);
		},
		error:function(){},
		success:function(data)
		{

			if(data.softwareVersion != soft_ver)
			{
				setCookie30Days("softverison",data.softwareVersion);
				window.location.reload();
			}

		}
	});
	$.ajax({
			type:"GET",
			url:dvr_url+"/language",
			dataType:"json",
			beforeSend : function(req){
				req.setRequestHeader('Authorization', auth);
			},
			error:function(){},
			success:function(data)
			{
				if(data.language != language)
				{
					$("language_select").val(data.language);
					setCookie30Days("language",data.language);
					window.location.href=dvr_url+'/view.html';
				}
			}
		})
		$.ajax({
			type:"PUT",
			url:dvr_url+"/login",
			dataType:"json",
			data:str,
			beforeSend : function(req){
				req.setRequestHeader('Authorization', auth);
				},
			error:function(){
				//alert("error!");
				window.location.href=dvr_url+'/view.html';
			},
			success:function(data){
				//alert("1");
				g_usr = Cookies.get("username");
				g_pwd = Cookies.get("userpwd");
				if(data.statusCode==0){
					//alert(str_logininfo);
					window.location.href=dvr_url;
				}
				else{
					userright=data.statusCode;
					//alert(userright);
					var Sys={};
					var ua=navigator.userAgent.toLowerCase();
					if(window.ActiveXObject){
						Sys.ie=ua.match(/msie ([\d.]+)/)[1];
					}
					if(Sys.ie&&(Sys.ie.substring(0,1)=="8")){
						//$(".content").css("behavior","url(js/ie-css3.htc)");
						//$(".content").css("background-color","#ededef");
					}
					document.getElementById("Video").style.width=918+'px';
					document.getElementById("View_object").style.width=910+'px';
					if(!_view_ctr){
						$("#view_ctr").hide();
						$("#view_ctr").attr("title",str_hide);
						_view_ctr=!_view_ctr;
					}
					$('#language_select').val(language);
					$('#wireless_control').attr("checked",true);
					$("#wpa_psk_text").hide();
					$('#img_snashot').attr("title",str_snapshot);
					$("#img_record").attr("title",str_record_server);
					$('#con_minus').attr("title",str_con_minus);
					$('#con_add').attr("title",str_con_add);
					$('#bgt_minus').attr("title",str_bgt_minus);
					$('#bgt_add').attr("title",str_bgt_add);
					$('#hue_minus').attr("title",str_hue_minus);
					$('#hue_add').attr("title",str_hue_add);
					$('#stt_minus').attr("title",str_stt_minus);
					$('#stt_add').attr("title",str_stt_add);
					$('#sharpen_minus').attr("title",str_sharpen_minus);
					$('#sharpen_add').attr("title",str_sharpen_add);
					$('#wide_dynamic_range_minus').attr("title",str_wdr_minus);
					$('#wide_dynamic_range_add').attr("title",str_wdr_add);
					$('#denosis3dStrength_minus').attr("title",str_3dds_minus);
					$('#denosis3dStrength_add').attr("title",str_3dds_add);
					$("#view_con").attr("title",str_contrast);
					$("#view_bgt").attr("title",str_brightness);
					$("#view_chorma").attr("title",str_chroma);
					$("#view_saturation").attr("title",str_aturation);
					$("#view_sharpen").attr("title",str_sharpen);
					$('#ptz_leftup').attr("title",str_ptz_leftup);
					$('#ptz_up').attr("title",str_ptz_up);
					$('#ptz_rightup').attr("title",str_ptz_rightup);
					$('#ptz_left').attr("title",str_ptz_left);
					$('#ptz_center').attr("title",str_ptz_reset);
					$('#ptz_right').attr("title",str_ptz_right);
					$('#ptz_leftdown').attr("title",str_ptz_leftdown);
					$('#ptz_down').attr("title",str_ptz_down);
					$('#ptz_rightdown').attr("title",str_ptz_rightdown);
					$("#img_view").attr("title",str_preview);
					$("#img_set").attr("title",str_setting);
					$("#img_ptz").attr("title",str_ptz);
					$("#img_logout").attr("title",str_logout);
					$("#view_ctr_reset").attr("title",str_view_reset);
					$("#menu_logout").attr("title",str_logout);
					$("#img_voice_close").attr("title",str_voice_close);
					$("#img_voice_on").attr("title",str_voice_on);
					$("#img_pcrecord_on").attr("title",str_record_on);
					$("#img_pcrecord_off").attr("title",str_record_off);
					$("#img_voicetalk_on").attr("title",str_voicetalk_on);
					$("#img_voicetalk_off").attr("title",str_voicetalk_off);
					document.getElementById("wireless_apchannel").style.display="none";
					document.getElementById("wireless_encryption").style.display="none";
					document.getElementById("wireless_keytype").style.display="none";
					document.getElementById("wireless_tr_key1").style.display="none";
					document.getElementById("wireless_tr_key2").style.display="none";
					document.getElementById("wireless_tr_key3").style.display="none";
					document.getElementById("wireless_tr_key4").style.display="none";
					document.getElementById("wireless_key_index").style.display="none";
					$("#motion_enable").attr("checked",false);
					$("#extern_enable").attr("checked",false);
					$("#linkage_enable").attr("checked",false);
					$("#mail_enable").attr("checked",false);
					$("#ftp_enable").attr("checked",false);
					$("#schedule_enable").attr("checked",false);
					$("#select_all").attr("checked",false);
					$("#tr_motion_sensitivity").hide();
					$("#tr_triger_level").hide();
					$("#tr_motion_preset").hide();
					$("#tr_linkage_enable").hide();
					$("#tr_output_level").hide();
					$("#tr_mail_enable").hide();
					$("#tr_ftp_enable").hide();
					$("#tr_ftp_interval").hide();
					$("#tr_schedule_enable").hide();
					$("#tr_select_all").hide();
					$("#tr_schedule").hide();
          var ais = $("#aiModel_select").select2();
					if(document.getElementById("wireless_control").checked){
						document.getElementById("wireless_networktype").style.display="";
						document.getElementById("wireless_authtype").style.display="";
						document.getElementById("wireless_wpa_psk").style.display="";
					}
					if(_view_main==false){
						if(isIE())
							var str='<object width=\"100%\" height=\"100%\" id=\"ActiveX\" name=\"test\" classid=\"CLSID:02A9E28E-AE20-4692-A22B-C1113730F769\"></object>';
						else
							var str='<EMBED id=\"ActiveX\" type=\"application/x-itst-activex\" progid=\"GKWEBPLUGIN.GKWebPluginCtrl.1\" width=\"100%\" height=\"100%\" > </EMBED>';
						document.getElementById("View_object").innerHTML=str;
						_view_main = true;
					}
					ocx_check();
					view_load_basic_data();
					for(var i=0;i<7;i++){
						var test=control[i];
						document.getElementById(test).style.display="none";
					}
					//时间同步
					sync_pc_time();
					pzt_control_init();
					setInterval("func_update_one_second_timer()",1000);
					// swfupload_init();
					var settings = {
						upload_url:dvr_url+"/web_upgrade",
						button_width: "80",
						button_height: "25",
						button_cursor : SWFUpload.CURSOR.HAND,
						button_placeholder_id: "swfupload",
						button_image_url:"image/upload.png",
						file_dialog_complete_handler:fileDialogComplete,
						upload_error_handler : uploadError,
						//上传过程事件——获取上传进度和升级进度
						upload_progress_handler : uploadProgress,
						upload_success_handler : uploadSuccess,
					};
					swfu = new SWFUpload(settings);

					try{
						var _voice=_obj.AudioSwitch(onOroff);
					}
					catch(e){}
					// PC录像音频初始化	
					try{
						if(pcRecAudio)
						{
							document.getElementById("rec_select_audio").value = 1;
						}
						else
						{
							document.getElementById("rec_select_audio").value = 0;
						}
					}
					catch(e){}
					// PC录像格式初始化	
					try{
						document.getElementById("rec_select_fmt").value=pcRecFmt;
					}
					catch(e){}
					// PC录像路径初始化	
					try{
						//document.getElementById("rec_by_pc_audio").=pcRecPath;
					}
					catch(e){}
					// 原始数据：无音频选择，AVI：有音频选择
					rec_fmt_change();
					// 录像设定
					if(document.getElementById("select_reclocation").value == 0){
						document.getElementById("rec_by_pc_audio").style.display="none";
						document.getElementById("rec_by_pc_loc").style.display="none";
						document.getElementById("rec_by_pc_submit").style.display="none";
						document.getElementById("rec_by_pc_fmt").style.display="none";
					} else{
						document.getElementById("rec_by_sd_name").style.display="none";
						document.getElementById("rec_by_sd_mem").style.display="none";
						document.getElementById("rec_by_sd_available").style.display="none";
						document.getElementById("rec_by_sd_reset").style.display="none";
					}
				}
			}
		})
})
//判断浏览器是否为IE
function isIE()
{
	if(!!window.ActiveXObject || "ActiveXObject" in window)
		return true;
	else
		return false;
}
function ocx_check()
{
	ieActivex =document.getElementById("ActiveX");
	var isInit=true;
	try{
		//var ocx_obj=new ActiveXObject("GKWEBPLUGIN.GKWebPluginCtrl.1");
		var _version=ieActivex.GetVersion();
	}
	catch(e){
		isInit=false;
	}
	if(!isInit)
	{
		document.getElementById("View_Tips").style.display="";
		document.getElementById("View_object").style.display="none";
		document.getElementById("Tips").innerText=str_tip;
		$("#Video").css("background-color","#40474f");
		var btn=false;
		timer=setInterval(function(){
			if(!btn){
				$('#Tips').css('color','#E6AF14');
				btn=true;
			}
			else{
				$('#Tips').css('color','#666');
				btn=false;
			}
		},500);
		_ocx_check=false;
	}
	else if(_version<'1902211020'){
		document.getElementById("View_Tips").style.display="";
		document.getElementById("View_object").style.display="none";
		document.getElementById("Tips").innerText=str_tips;
		$("#Video").css("background-color","#40474f");
		var btn=false;
		timer=setInterval(function(){
			if(!btn){
				$('#Tips').css('color','#F00');
				btn=true;
			}
			else{
				$('#Tips').css('color','#666');
				btn=false;
			}
		},500);
		_ocx_check= false;
	}
	else{
		document.getElementById("View_Tips").style.display="none";
		document.getElementById("View_object").style.display="";
		$("#Video").css("background-color","#FFF");
		show_main_preview();
		_ocx_check= true;
	}
}
//预览页面load
function viewload()
{  
   net_local_get('auto');
   rtsp_set();
}
var isshow=false;

/*
function ai_result()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);

	$.ajax({
			type:"GET",
			url:dvr_url + '/cgi-bin/settime',
			dataType:"json",
			beforeSend : function(req){
				req .setRequestHeader('Authorization', auth);
    		},
			error:function(){},
		        success:function(data){
			        $('#AI_str').val(data.AI_str);
                                 console.log('AI_str:%s\n',data.AI_str);

				
			}        
		});
}
*/

function view_ctr_tab()
{
	if(isshow){
		$("#view_ctr_tab").show();
	}
	else{
		$("#view_ctr_tab").hide();
	}
	isshow=!isshow;
}
function view_ctr()
{
	if(_view_ctr){
		$("#view_ctr").hide();
		$("#view_control").attr('src','image/show.png');
		var wid=document.getElementById("View_object").style.width;
		var wid1=document.getElementById("Video").style.width;
		$("#view_control").attr('title',str_show);
		wid=parseInt(wid);
		wid1=parseInt(wid1);
		wid=wid+160;
		wid1=wid1+160;
		document.getElementById("View_object").style.width=wid+'px';
		document.getElementById("Video").style.width=wid1+'px';
	}
	else{
		$("#view_ctr").show();
		$("#view_control").attr('src','image/display.png');
		$("#view_control").attr('title',str_hide);
		var wid=document.getElementById("View_object").style.width;
		var wid1=document.getElementById("Video").style.width;
		wid=parseInt(wid);
		wid1=parseInt(wid1);
		wid=wid-160;
		wid1=wid1-160;
		document.getElementById("View_object").style.width=wid+'px';
		document.getElementById("Video").style.width=wid1+'px';
	}
	_view_ctr=!_view_ctr;
}
function voice_ctr(id)
{
	if(id=='img_voice_on'){
		document.getElementById("img_voice_on").style.display="none";
		document.getElementById("img_voice_close").style.display="";
		onOroff=false;
	}
	else{
		document.getElementById("img_voice_on").style.display="";
		document.getElementById("img_voice_close").style.display="none";
		onOroff=true;
	}
	try{
		var _voice=_obj.AudioSwitch(onOroff);
	}
	catch(e){}
}
// 对讲
function voicetalk_ctr(id)
{
	if(id=='img_voicetalk_on'){
		document.getElementById("img_voicetalk_on").style.display="none";
		document.getElementById("img_voicetalk_off").style.display="";
		talkOnOroff=false;
	}
	else{
		document.getElementById("img_voicetalk_on").style.display="";
		document.getElementById("img_voicetalk_off").style.display="none";
		talkOnOroff=true;
	}
	try{
		if(talkOnOroff)
		{
			var _voicetalk=_obj.StartTalk();
		}
		else{
			var _voicetalk=_obj.StopTalk();
		}
	}
	catch(e){}
}
// PC录像
function pcrecord_ctr(id)
{
	if(id=='img_pcrecord_on'){
		document.getElementById("img_pcrecord_on").style.display="none";
		document.getElementById("img_pcrecord_off").style.display="";
		pcRecOnOroff=false;
	}
	else{
		document.getElementById("img_pcrecord_on").style.display="";
		document.getElementById("img_pcrecord_off").style.display="none";
		pcRecOnOroff=true;
		// set rec fmt
		if(pcRecFmt==0)
		{
			var _pcrecord_fmt=_obj.SetRecordType(20);
		}
		else
		{
			var _pcrecord_fmt=_obj.SetRecordType(1);
		}
		// set rec audio
		var _pcrecord_audio=_obj.SetRecordAudioOnOff(pcRecAudio);
		// set rec path
		//pcRecPath
	}
	try{
		var _pcrecord=_obj.Record(pcRecOnOroff);
	}
	catch(e){}
}
//鉴权
function checkright()
{
	for(var i=0;i<userright.length;i++){
		if(check_right[i]=='1'){
			switch(i){
				case 0:
					$('#img_view')[0].disabled=false;
					break;
				case 1:
					$('#btn_setting')[0].disabled=false;
					break;
				case 2:
					$('#img_ptz')[0].disabled=false;
					break;
				case 3:
					$('#user_manage')[0].disabled=false;
					break;
				default:
					break;
			}
		}
		else{
			switch(i){
				case 0:
					$('#img_view')[0].disabled=true;
					break;
				case 1:
					$('#btn_setting')[0].disabled=true;
					break;
				case 2:
					$('#img_ptz')[0].disabled=true;
					break;
				case 3:
					$('#user_manage')[0].disabled=true;
					break;
				default:
					break;
			}
		}
	}
}
//关闭播放插件
function close_all_view()
{
	try{
		if(view_main!=undefined){
			view_main.DeinitPlugin();
			delete view_main;
			view_main=undefined;
			clearInterval(iCount);
		}
		if(view_image_basic!=undefined){
			view_image_basic.DeinitPlugin();
			delete view_image_basic;
			view_image_basic=undefined;
			image_basic_oxc_isshow = false;
		}
	}catch(e){}
}
//加载插件
function CONNECT()
{
	try{
		var ret=_obj.InitPlugin();
		var ret1=_obj.ConnectToBoard(serverIp, 1234);
		if(_obj.id=='ActiveX')
			ret1=_obj.SetIpcStreamId(0);
		else
			ret1=_obj.SetIpcStreamId(1);
	}catch(e){}
}
function Set_ocx_language()
{
	try
	{
		switch(language)
		{
			case '0':
				var ret=_obj.SetLanguageFileName("chinese.json");
				break;
			case '7':
				var ret=_obj.SetLanguageFileName("english.json");
				break;
			default:
				var ret=_obj.SetLanguageFileName("chinese.json");
				break;
		}
	}
	catch(e){}
}
//预览
function show_main_preview()
{
	close_all_view();
	$("#select_view_stream").val("0");
	//$("#img_snashot").show();
	view_main=document.getElementById("ActiveX");
	if(view_main != undefined){
		_obj=view_main;
		Set_ocx_language();
		setTimeout("CONNECT()",100);
	}
	_resolution=0
	_menuctr=0;
	Rate();
	getresolution();
}
//动态创建图像基本参数页面视频播放插件并加载
var _view_image_basic = true;
var image_basic_oxc_isshow = false;
function show_view_image_basic()
{
	close_all_view();
	if(_view_image_basic==false){
		if(isIE())
			var str='<object height = "100%" width = "100%" id="View_basic" name="testR1" classid="clsid:02A9E28E-AE20-4692-A22B-C1113730F769" ></object>';
		else
			var str='<EMBED id=\"View_basic\" type=\"application/x-itst-activex\" progid=\"GKWEBPLUGIN.GKWebPluginCtrl.1\" width=\"100%\" height=\"100%\" > </EMBED>';
		document.getElementById("View_Image_Basic").innerHTML=str;
		_view_image_basic = true;
	}
	view_image_basic=document.getElementById("View_basic");
	if(view_image_basic!=undefined){
		_obj=view_image_basic;
		Set_ocx_language();
		setTimeout("CONNECT()",100);
		image_basic_oxc_isshow =true;
	}
	_menuctr=1;
};
//预览、设置、云台、注销页面跳转
function menucontrol(id)
{
	var i,test;
	ieActivex = document.getElementById("ActiveX");
	for(i=0;i<7;i++){
		test=control[i];
		document.getElementById(test).style.display="none";
	}
	switch(id){
		case "View":
			document.getElementById("View").style.display="";
			document.getElementById("view_ctr_ctr").style.display="";
			document.getElementById("Setting").style.display="none";
			if(_ocx_check){
				if(_obj==view_image_basic||view_main==undefined)
					show_main_preview();
			}
			view_load_basic_data();
			break;
		case "Setting":
			document.getElementById("Setting").style.display="";
			document.getElementById("Set_Menu").style.display="";
			document.getElementById("View").style.display="none";
			document.getElementById("Set_Image").style.display="";
			document.getElementById("view_ctr_ctr").style.display="none";
			document.getElementById("img_voice_on").style.display="none";
			document.getElementById("img_voice_close").style.display="";
			document.getElementById("img_voicetalk_on").style.display="none";
			document.getElementById("img_voicetalk_off").style.display="";
			document.getElementById("img_pcrecord_on").style.display="none";
			document.getElementById("img_pcrecord_off").style.display="";
			TabbedPanels1.showPanel(0);
			$(".ny_zblb1 ul li ul").prev("a").removeClass("cur");
			$('#a_first').addClass("cur");
			$('li.li_first').children("ul").slideDown("fast");
			$('li.li_first').siblings().children("ul").slideUp("fast");
			if(_ocx_check){
				if((_obj==view_main||view_image_basic==undefined)&&!image_basic_oxc_isshow)
					show_view_image_basic();
			}
			image_data_load_basic();
			autolight_data_load_basic();
            check_gb28181_status();
			break;
		case "Cradle_Head":
			document.getElementById("yt_left").style.display="";
			document.getElementById("View").style.display="none";
			document.getElementById("Setting").style.display="none";
			show_view_yuntai();
			break;
		default:
			break;
	}
}
//动态控制页面div显示
function Div_ShoworHidden(id)
{
	var i,div;
	document.getElementById("Setting").style.display="";
	document.getElementById("Set_Menu").style.display="";
	for(i=0;i<7;i++){
		if(control[i]!=id){
			var divx=document.getElementById(control[i]);
			document.getElementById(control[i]).style.display="none";
		}
		else{
			var divx=document.getElementById(control[i]);
			document.getElementById(control[i]).style.display="";
		}
	}
	switch(id){
		case "Set_Image":
			TabbedPanels1.showPanel(0);
			if(_ocx_check&&!image_basic_oxc_isshow)
				show_view_image_basic();
			image_data_load_basic();
			autolight_data_load_basic();
			break;
		case "Set_Video":
			close_all_view();
			TabbedPanels2.showPanel(0);
			video_stream_get();
			break;
		case "Net_Access":
			close_all_view();
			TabbedPanels3.showPanel(0);
			net_local_get('auto');
			break;
		case "Platform_Access":
			close_all_view();
			TabbedPanels4.showPanel(0);
			net_enten_onvif_get();
			break;
		case "UserManage":
			close_all_view();
			TabbedPanels5.showPanel(0);
			sys_user_info_get();
			break;
		case "SystemSetting":
			close_all_view();
			TabbedPanels6.showPanel(0);
			sys_manage_time();
			break;
                 case "AI_str":
                        close_all_view();
			TabbedPanels8.showPanel(0);
                        ai_result();
                        break;

        case "gb28181":
			close_all_view();
			TabbedPanels7.showPanel(0);
			sys_gb28181_info();
			break;
	}
}
function bitRate_select_change(){}
function view_load_basic_data()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		url:dvr_url + '/image',
		dataType:"json",
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
		},
		success:function(data){
			$("#slider_con_view").slider("value",data.contrast);
			$("#slider_bgt_view").slider("value",data.brightness);
			$("#slider_hue_view").slider("value",data.hue);
			$("#slider_saturation_view").slider("value",data.saturation);
			$("#slider_sharpen_view").slider("value",data.sharpness);
		},
		error:function(){}
	});
}
function image_data_load_basic(id)
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		url:dvr_url + '/image',
		dataType:"json",
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
		},
		success:function(data){
			$("#slider_con").slider("value",data.contrast);
			$("#slider_bgt").slider("value",data.brightness);
			$("#slider_hue").slider("value",data.hue);
			$("#slider_saturation").slider("value",data.saturation);
			$("#slider_sharpen").slider("value",data.sharpness);
			$("#sliderValue_con").val(data.contrast);
			$("#sliderValue_bgt").val(data.brightness);
			$("#sliderValue_hue").val(data.hue);
			$("#sliderValue_saturation").val(data.saturation);
			$("#sliderValue_sharpen").val(data.sharpness);
			$('#select_power_frequency').val(data.antiFlickerFreq);
			$('#select_scen_mode').val(data.sceneMode);
			$('#select_pic_style').val(data.imageStyle);
			$('#select_awb_mode').val(data.wbMode);
			$('#select_ircut_mode').val(data.irCutMode);
			$('#select_ircut_control_mode').val(data.irCutControlMode);
			var trid_3d = document.getElementById("tr_3d_denoise_control");
			var trid_wdr = document.getElementById("tr_wide_dynamic_range");
			if(data.enabledWDR == 0){
				$('#wide_dynamic_0').attr("checked","true");
			}
			else{
				$('#wide_dynamic_1').attr("checked","true");
			}

			if(data.enableDenoise3d == 0){
				$('#denosis3d_control_0').attr("checked","true");
			}
			else{
				$('#denosis3d_control_1').attr("checked","true");
			}
			$('#select_low_light_mode').val(data.lowlightMode);
			if(data.flipEnabled == 1){
				$('#Flip').prop('checked',true);
			}
			else{
				$('#Flip').prop('checked',false);
			}
			if(data.mirrorEnabled == 1){
				$('#Mirror').prop('checked',true);
			}
			else{
				$('#Mirror').prop('checked',false);
			}
            if(data.led1 == 1){
				$('#led1').prop('checked',true);
			}
			else{
				$('#led1').prop('checked',false);
			}
            if(data.led2 == 1){
				$('#led2').prop('checked',true);
			}
			else{
				$('#led2').prop('checked',false);
			}
		},
		error:function(a,b,c)
		{
			if(a.status == 401){}
			else{}
		}
	});
}
function autolight_data_load_basic(id)
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		url:dvr_url + '/autolight',
		dataType:"json",
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
		},
		success:function(data){
			$('#select_pwm_control').val(data.pwm_mode);
			$('#select_pwm_iso').val(data.level);
			$("#slider_pwm_duty").slider("value",data.pwm_duty);
			$("#sliderValue_pwm_duty").val(data.pwm_duty);
			if(data.pwm_mode == 0){
				$("#select_pwm_iso")[0].disabled = true;
			}
			else{
				$("#select_pwm_iso")[0].disabled = false;
			}
		},
		error:function(a,b,c)
		{
			if(a.status == 401){}
			else{}
		}
	});
}

function check_gb28181_status()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		url:dvr_url + '/gb28181_status',
		dataType:"json",
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
		},
		success:function(data){
			if(data.statusCode==0){
                //gb28181_li
                console.log("not support gb28181");
                $("#gb28181_li").hide();
            }
            else if(data.statusCode==1){
                console.log("support gb28181");
                $("#gb28181_li").show();
            }
		},
		error:function(a,b,c)
		{
			if(a.status == 401){}
			else{}
		}
	});
}
function denosis3d_radio_change(id)
{
	var trid = document.getElementById("tr_3d_denoise_control");
	if(id == 'denosis3d_control_0' ){
		trid.style.display = "none";
	}
	else{
		trid.style.display = "";
	}
	image_content_change(id);
}
function wide_dynamic_radio_change(id)
{
	var trid = document.getElementById("tr_wide_dynamic_range");
	if(id == 'wide_dynamic_0' ){
		trid.style.display = "none";
	}
	else{
		trid.style.display = "";
	}
	image_content_change(id);
}

//pwm iso auto
function pwm_iso_control(id)
{
	if(id == 'select_pwm_control'){
		var pwm_control = $('#select_pwm_control :selected').val();
		if(pwm_control == '0')
		{
			$("#select_pwm_iso")[0].disabled = true;
		}
		else
		{
			$("#select_pwm_iso")[0].disabled = false;
		}
	}
	pwm_iso_change(id);
}
function pwm_iso_change(id)
{
	if(id == 'sl12slider' || id == slider_motion){}
	else{
		tipInfoShow(updateParmeter);
		var data;
		if(id == 'select_pwm_control'){
			var pwm_control = $('#select_pwm_control :selected').val();
			data = '{ "pwm_mode": '+pwm_control+' }';
		}
		else if(id=='slider_pwm_duty'){
			var pwm_duty = $("#sliderValue_pwm_duty")[0].value;
			data = '{"pwm_duty": '+pwm_duty+'}';
		}
		else if(id=='select_pwm_iso'){
			var pwm_iso = $('#select_pwm_iso :selected').val();
			data = '{"pwm_iso": '+pwm_iso+'}';
		}
		var url = dvr_url + '/autolight';
		var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
		$.ajax({
			type:'PUT',
			url:url,
			dataType:'json',
			data:data,
			async:false,
			beforeSend : function(req ){
				req .setRequestHeader('Authorization', auth);
			},
			success:function(data){
				if(data.statusCode == 0){
					tipInfoShow(updateSuccess);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
			},
			error:function(a,b,c){
				if(a.status == 401){}
				else{}
				setTimeout("tipInfoHide()",500);
			}
		});
	}
}

function image_content_change(id)
{
	if(id == 'sl12slider' || id == slider_motion){}
	else{
		tipInfoShow(updateParmeter);
		var data;
		var resetAll = 0;
		if(id == 'select_power_frequency'){
			var antiFlickerFreq = $('#select_power_frequency :selected').val();
			data = '{ "antiFlickerFreq": '+antiFlickerFreq+' }';
		}
		else if(id=='slider_con_view'){
			var con_view = $("#slider_con_view")[0].value;
			data = '{"contrast": '+con_view+'}';
		}
		else if(id=='slider_bgt_view'){
			var bgt_view = $("#slider_bgt_view")[0].value;
			data = '{"brightness": '+bgt_view+'}';
		}
		else if(id=='slider_hue_view'){
			var hue_view = $("#slider_hue_view")[0].value;
			data = '{"hue": '+hue_view+'}';
		}
		else if(id=='slider_saturation_view'){
			var saturation_view = $("#slider_saturation_view")[0].value;
			data = '{"saturation": '+saturation_view+'}';
		}
		else if(id=='slider_sharpen_view'){
			var sharpness_view = $("#slider_sharpen_view")[0].value;
			data = '{"sharpness": '+sharpness_view+'}';
		}
		else if(id=='slider_con'){
			var con = $("#sliderValue_con")[0].value;
			data = '{"contrast": '+con+'}';
		}
		else if(id=='slider_bgt'){
			var bgt = $("#sliderValue_bgt")[0].value;
			data = '{"brightness": '+bgt+'}';
		}
		else if(id=='slider_hue'){
			var hue = $("#sliderValue_hue")[0].value;
			data = '{"hue": '+hue+'}';
		}
		else if(id=='slider_saturation'){
			var sat = $("#sliderValue_saturation")[0].value;
			data = '{ "saturation": '+sat+' }';
		}
		else if(id=='slider_sharpen'){
			var sharp = $("#sliderValue_sharpen")[0].value;
			data = '{ "sharpness": '+sharp+' }';
		}
		else if(id == 'select_scen_mode'){
			var sceneMode = $('#select_scen_mode :selected').val();
			data = '{ "sceneMode": '+sceneMode+' }';
		}
		else if(id == 'select_pic_style'){
			var imageStyle = $('#select_pic_style :selected').val();
			data = '{ "imageStyle": '+imageStyle+' }';
		}
		else if(id == 'select_awb_mode'){
			var wbMode = $('#select_awb_mode :selected').val();
			data = '{ "wbMode": '+wbMode+' }';
		}
		else if(id == 'select_ircut_control_mode'){
			var irCutControlMode = $('#select_ircut_control_mode :selected').val();
			data = '{ "irCutControlMode": '+irCutControlMode+' }';
		}
		else if(id == 'select_ircut_mode'){
			var irCutMode = $('#select_ircut_mode :selected').val();
			data = '{ "irCutMode": '+irCutMode+' }';
		}
		else if(id == 'select_low_light_mode'){
			var lowlightMode = $("#select_low_light_mode")[0].value;
			data = '{"lowlightMode": '+lowlightMode+'}';
		}
		else if(id == 'wide_dynamic_1'|| id =='wide_dynamic_0'||id=='slider_wide_dynamic_range'){
			var strengthWDR = $("#sliderValue_wide_dynamic_range")[0].value;
			var chkObjs = document.getElementsByName("wide_dynamic");
			var enabledWDR;
			for(var i=0;i<chkObjs.length;i++){
				if(chkObjs[i].checked){
					enabledWDR = chkObjs[i].value;
					break;
				}
			}
			data = '{"enabledWDR": '+enabledWDR+',"strengthWDR": '+strengthWDR+'}';
		}
		else if(id == 'denosis3d_control_0' || id == 'denosis3d_control_1' ||id=='slider_denosis3dStrength'){
			var strengthDenoise3d = $("#sliderValue_denosis3dStrength")[0].value;
			var chkObjs = document.getElementsByName("denosis3d_control");
			var enableDenoise3d ;
			for(var i=0;i<chkObjs.length;i++){
				if(chkObjs[i].checked){
					enableDenoise3d = chkObjs[i].value;
					break;
				}
			}
			data = '{"enableDenoise3d": '+enableDenoise3d+',"strengthDenoise3d": '+strengthDenoise3d+'}';
		}
		else if(id == 'Flip'){
			var flip = $('#Flip').prop('checked') ?1:0;
			data = '{ "flipEnabled": '+flip+' }';
		}
		else if(id == 'Mirror'){
			var mirror = $('#Mirror').prop('checked') ? 1:0;
			data = '{ "mirrorEnabled": '+mirror+' }';
		}
		else if(id == 'led1'){
			var led1 = $('#led1').prop('checked') ?1:0;
			data = '{ "led1": '+led1+' }';
		}
		else if(id == 'led2'){
			var led2 = $('#led2').prop('checked') ? 1:0;
			data = '{ "led2": '+led2+' }';
		}
		else if(id == 'btn_reset_default'||id=='view_ctr_reset'){
			data = '{"reset_default": 1}';
			resetAll = 1;
		}
		var url = dvr_url + '/image';
		var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
		$.ajax({
			type:'PUT',
			url:url,
			dataType:'json',
			data:data,
			async:false,
			beforeSend : function(req ){
				req .setRequestHeader('Authorization', auth);
			},
			success:function(data){
				if(data.statusCode == 0){
					tipInfoShow(updateSuccess);
					setTimeout("tipInfoHide()",hide_delay_ms);
					if(resetAll == 1){
						image_data_load_basic();
						view_load_basic_data();
					}
				}
			},
			error:function(a,b,c){
				if(a.status == 401){}
				else{}
				setTimeout("tipInfoHide()",500);
			}
		});
	}
}
function image_data_save_basic(id)
{
	tipInfoShow(saveParmeter);
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var con = $('#sliderValue_con')[0].value,
	bright = $('#sliderValue_bgt')[0].value,
	sat = $('#sliderValue_saturation')[0].value,
	hue = $('#sliderValue_hue')[0].value,
	sharpen = $('#sliderValue_hue')[0].value;
	var upData = '{ "contrast": '+con+', "brigtness": '+bright+', "hue": '+hue+', "saturation": '+sat+',"sharpness:"'+ sharpen+'}';
	$.ajax({
		type:'PUT',
		url:dvr_url + '/image',
		dataType:'json',
		data:upData,
		async:false,
		beforeSend : function(req ){
			req .setRequestHeader('Authorization', auth);
		},
		success:function(data){
			if(data.statusCode == 0){
				tipInfoShow(saveSuccess);
				setTimeout("tipInfoHide()",hide_delay_ms);
			}
		},
		error:function(a,b,c){
			if(a.status == 401){}
			else{}
			setTimeout("tipInfoHide()",500);
		}
	})
}
function image_data_adv_to_ui(data)
{
	slider_denosis3dStrength.f_setValue(data.denosis3dStrength,0);
	slider_wide_dynamic_range.f_setValue(data.widye_dynamic_range,0);
	$("#select_scen_mode")[0].selectedIndex = data.sceneMode;
	$("#select_awb_mode")[0].selectedIndex = data.awbMode;
	$("#select_pic_style")[0].selectedIndex = data.picStyle;
	$("#select_ircut_mode")[0].selectedIndex = data.ircutMode;
	$("#select_low_light_mode")[0].selectedIndex = data.lowLihtMode;
}
function image_data_load_advance()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		url:dvr_url + '/image',
		dataType:"json",
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
		},
		success:function(data){
			image_data_adv_to_ui(data);
		},
		error:function(a,b,c){
			if(a.status == 401){}
			else{}
		}
	});
}
Date.prototype.toFormatString=function()
{
	var op;
	var strYear,strMonth,strDate,strHour,strMin,strSen;
	strYear=this.getUTCFullYear().toString();
	if (strYear.length<4){
		var i = 4-strYear.length;
		for (var j = 0; j < i; j++){
			strYear = "0" + strYear;
		}
	}
	strMonth=(this.getUTCMonth()+parseInt(1)).toString();
	strMonth=(strMonth.length==1)?("0"+strMonth):strMonth;
	strDate=this.getUTCDate().toString();
	strDate=(strDate.length==1)?("0"+strDate):strDate;
	strHour=this.getUTCHours().toString();
	strHour=(strHour.length==1)?("0"+strHour):strHour;
	strMin=this.getUTCMinutes().toString();
	strMin=(strMin.length==1)?("0"+strMin):strMin;
	strSen=this.getUTCSeconds().toString();
	strSen=(strSen.length==1)?("0"+strSen):strSen;
	op = strYear+"-"+strMonth+"-"+strDate+" "+strHour+":"+strMin+":"+strSen;
	return op;
}
function savetime()
{
	var op =  (new Date()).toFormatString();
	var sendData = '{ "UtcTime":"' + op +'"}';
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	dvr_ajax = $.ajax({
		type:"PUT",
		url: dvr_url + "/cgi-bin/settime",
		processData: false,
		cache: false,
		data: sendData,
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
		},
		success: function(data, textStatus, xmlhttp){},
		complete: function(XMLHttpRequest, textStatus){},
		error: function(XMLHttpRequest, textStatus, errorThrown){}
	});
}
//滑动条单步操作(+)
function slider_singleStep_add(id)
{
	switch(id){
		case "pwm_duty_add":
			var temp=$("#sliderValue_pwm_duty").val();
			if(temp<100)
				temp++;
			else
				temp=100;
			$("#slider_pwm_duty").slider("value",temp);
			$("#sliderValue_pwm_duty").val(temp);
			pwm_iso_change('slider_pwm_duty');
			break;
		case "con_add":
			var temp=$("#sliderValue_con").val();
			if(temp<100)
				temp++;
			else
				temp=100;
			$("#slider_con").slider("value",temp);
			$("#sliderValue_con").val(temp);
			image_content_change('slider_con');
			break;
		case "bgt_add":
			var temp=$("#sliderValue_bgt").val();
			if(temp<100)
				temp++;
			else
				temp=100;
			$("#slider_bgt").slider("value",temp);
			$("#sliderValue_bgt").val(temp);
			image_content_change('slider_bgt');
			break;
		case "hue_add":
			var temp=$("#sliderValue_hue").val();
			if(temp<100)
				temp++;
			else
				temp=100;
			$("#slider_hue").slider("value",temp);
			$("#sliderValue_hue").val(temp);
			image_content_change('slider_hue');
			break;
		case "stt_add":
			var temp=$("#sliderValue_saturation").val();
			if(temp<100)
				temp++;
			else
				temp=100;
			$("#slider_saturation").slider("value",temp);
			$("#sliderValue_saturation").val(temp);
			image_content_change('slider_saturation');
			break;
		case "sharpen_add":
			var temp=$("#sliderValue_sharpen").val();
			if(temp<100)
				temp++;
			else
				temp=100;
			$("#slider_sharpen").slider("value",temp);
			$("#sliderValue_sharpen").val(temp);
			image_content_change('slider_sharpen');
			break;
		case "wide_dynamic_range_add":
			break;
		case "denosis3dStrength_add":
			break;
		default:
			break;
	}
}
//滑动条单步操作(-)
function slider_singleStep_minus(id)
{
	switch(id){
		case "pwm_duty_minus":
			var temp=$("#sliderValue_pwm_duty").val();
			if(temp>0)
				temp=temp-1;
			else
				temp=0;
			$("#slider_pwm_duty").slider("value",temp);
			$("#sliderValue_pwm_duty").val(temp);
			pwm_iso_change('slider_pwm_duty');
			break;
		case "con_minus":
			var temp=$("#sliderValue_con").val();
			if(temp>0)
				temp=temp-1;
			else
				temp=0;
			$("#slider_con").slider("value",temp);
			$("#sliderValue_con").val(temp);
			image_content_change('slider_con');
			break;
		case "bgt_minus":
			var temp=$("#sliderValue_bgt").val();
			if(temp>0)
				temp=temp-1;
			else
				temp=0;
			$("#slider_bgt").slider("value",temp);
			$("#sliderValue_bgt").val(temp);
			image_content_change('slider_bgt');
			break;
		case "hue_minus":
			var temp=$("#sliderValue_hue").val();
			if(temp>0)
				temp=temp-1;
			else
				temp=0;
			$("#slider_hue").slider("value",temp);
			$("#sliderValue_hue").val(temp);
			image_content_change('slider_hue');
			break;
		case "stt_minus":
			var temp=$("#sliderValue_saturation").val();
			if(temp>0)
				temp=temp-1;
			else
				temp=0;
			$("#slider_saturation").slider("value",temp);
			$("#sliderValue_saturation").val(temp);
			image_content_change('slider_saturation');
			break;
		case "sharpen_minus":
			var temp=$("#sliderValue_sharpen").val();
			if(temp>0)
				temp=temp-1;
			else
				temp=0;
			$("#slider_sharpen").slider("value",temp);
			$("#sliderValue_sharpen").val(temp);
			image_content_change('slider_sharpen');
			break;
		case "wide_dynamic_range_minus":
			break;
		case "denosis3dStrength_minus":
			break;
		default:
			break;
	}
}
//时间同步
function sync_pc_time()
{
	savetime();
}
//获取视频流
function view_stream_get()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		url:dvr_url+'',
		data:"",
		dataType:"json",
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
    	},
		success:function(data){}
	})
}
//根据码流码率检测函数
function check_rate(id)
{
	bitrate_change_stream(id,_cbrbpsMin,_cbrbpsMax);
	/*
	var streamId=$('#select_stream').val();
	var resolution_select=$("#select_Stream_Resolution option:first").val();
	if(streamId==0){
		if(resolution_select == '1920x1080'){
			bitrate_change_stream(id,100,8096);
		}
		else if(resolution_select == '1280x720'){
			bitrate_change_stream(id,50,4096);
		}
		else{
			bitrate_change_stream(id,100,8096);
		}
	}
	else if(streamId==1)
		bitrate_change_stream(id,200,3000);
	else
		bitrate_change_stream(id,10,400);*/
}
//码率检测函数
function bitrate_change_stream(id,min_,max_)
{
	var inbox=document.getElementById(id);
	var str=inbox.value;
	if(str=="")
		inbox.value=min_;
	else if(Number(str)>max_){
		inbox.value=max_;
		document.getElementById("rate_check_result").innerText='码率范围为：'+min_+'~'+max_;
	}
	else if(Number(str)<min_){
		inbox.value=min_;
		document.getElementById("rate_check_result").innerText='码率范围为：'+min_+'~'+max_;
	}
	else{
		document.getElementById("rate_check_result").innerText="";
	}
}
//预览页面码流切换
function view_stream_change(id)
{
	id='#'+id;
	var streamId=$(id).val();
	_resolution=streamId;
	try
	{
		if(_obj.object != null||_obj.nodeName=='EMBED'){
			_obj.InitPlugin();
			_obj.ConnectToBoard(serverIp, 1234);
			_obj.SetIpcStreamId(streamId);
			getresolution();
			if(pcRecOnOroff)
			{
				document.getElementById("img_pcrecord_on").style.display="none";
				document.getElementById("img_pcrecord_off").style.display="";
				pcRecOnOroff=false;
			}
		}
	}
	catch(e)
	{
		alert("请确认网页播放插件成功安装！！！");
	}
}
//帧率变化
function frameRateChange()
{
	var fps =$('#text_fps').val();
	if(isNaN(fps)==true){
		$('#text_fps').val(_format_fpsMax);
	}
	if(fps > _format_fpsMax){
			$('#text_fps').val(_format_fpsMax);
	}
	else if(fps < _format_fpsMin){
		$('#text_fps').val(_format_fpsMin);
	}
}
//码流信息获取
function video_stream_get()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var id =$('#select_stream').val();
	var svem=["none","H264","MJPEG","H265"]
	$.ajax({
		type:"GET",
		url:dvr_url + '/video',
		data: "streamId=" + id,
		dataType:"json",
		beforeSend : function(req){
        	req .setRequestHeader('Authorization', auth);
    	},
		success:function(data){
			$('#select_code_Type').val(data.avStream);
			$('#text_Stream_Name').val(data.name);
			$('#select_h264_profile').val(data.profile);
			$('#select_rate_format').val(data.rc_mode);
			$('#text_fps').val(data.fps);
			document.getElementById("vbr").style.display="none";
			document.getElementById("cbr").style.display="";
			$('#text_vbr_max_bps').val(data.bpsProperty.max);
		    $('#text_vbr_min_bps').val(data.bpsProperty.min);
		    $('#text_cbr_bps').val(data.bps);
			$('#select_Stream_Resolution').find('option').remove();
			for(i=0;i<data.resloution_opt.length;i++){
				$("#select_Stream_Resolution").append('<option  >' +data.resloution_opt[i]+'</option>');
			}
			$("#select_Stream_Resolution").val(data.width+'x'+data.height);
			
			$('#select_Stream_video_encode_mode').find('option').remove();
			for(i=1;i<svem.length;i++){
				if(2!=i)
					$("#select_Stream_video_encode_mode").append($('<option>').val(i).text(svem[i]));
			}
			if(data.enctype==2)
				data.enctype=0;
			$("#select_Stream_video_encode_mode").val(data.enctype);
			_cbrbpsMax=data.bpsProperty.max;
			_cbrbpsMin=data.bpsProperty.min;
			if(_cbrbpsMin<=0)
				_cbrbpsMin=10;
			_format_fpsMax=data.fpsProperty.max;
			_format_fpsMin=data.fpsProperty.min;
			}
		});
}
//码流信息设置
function video_stream_set()
{
	tipInfoShow(saveParmeter);
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var id =$('#select_stream').val();
	var streamName = $('#text_Stream_Name').val();
	var resolution =$('#select_Stream_Resolution :selected').html();
	var rc_mode =$('#select_rate_format :selected').val();
	var bps = $('#text_cbr_bps').val();
	var fps = $('#text_fps').val();
	var profile = $('#select_h264_profile :selected').val();
	var avType = $('#select_code_Type :selected').val();
	var enctype =$('#select_Stream_video_encode_mode :selected').val();
	var stream_data = '{"name": "'+ streamName+'","profile":'+profile+',"resolution":"'+resolution+	'","rc_mode":'+rc_mode+
						',"bps":'+ bps +',"fps":'+ fps +',"avStream":'+ avType + ',"id":'+ id +',"enctype":'+ enctype +'}';
	$.ajax({
			type:'PUT',
			url:dvr_url + '/video',
			dataType:'json',
			data:stream_data,
			async:false,
			beforeSend : function(req ){
				req .setRequestHeader('Authorization', auth);
    		},
			success:function(data){
				if(data.statusCode == 0){
					tipInfoShow(saveSuccess);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
			},
			error:function(a,b,c){
				if(a.status == 401){}
				else{}
				setTimeout("tipInfoHide()",500);
			}
		})
}
//Cover
function video_privacy_mask_get()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		url:dvr_url + '/cover',
		data: "channelId=0",
		dataType:"json",
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
		},
		error:function(XMLHttpRequest, textStatus, errorThrown){},
		success:function(data){
			P_id = 0;
			P_enabled = data[0].shelterRect_enable;
			P_X = data[0].shelterRect_x;
			P_Y = data[0].shelterRect_y;
			P_W = data[0].shelterRect_width;
			P_H = data[0].shelterRect_height;
			switch(data[0].shelterRect_color){
				case 0xFFFFFF: P_color = "FFFFFF";break;
				case 0x5AAF5A: P_color = "5AAF5A";break;
				case 0x006ECF: P_color = "006ECF";break;
				default:P_color = "FFFFFF";break;
			}
			$('#Cover_bgColor').val(P_color);
			//id=2
			P1_id = 1;
			P1_enabled = data[1].shelterRect_enable;
			P1_X = data[1].shelterRect_x;
			P1_Y = data[1].shelterRect_y;
			P1_W = data[1].shelterRect_width;
			P1_H = data[1].shelterRect_height;
			P1_color = data[1].shelterRect_color;
			//id=3
			P2_id = 2;
			P2_enabled = data[2].shelterRect_enable;
			P2_X = data[2].shelterRect_x;
			P2_Y = data[2].shelterRect_y;
			P2_W = data[2].shelterRect_width;
			P2_H = data[2].shelterRect_height;
			P2_color = data[2].shelterRect_color;
			//id=4
			P3_id = 3;
			P3_enabled = data[3].shelterRect_enable;
			P3_X = data[3].shelterRect_x;
			P3_Y = data[3].shelterRect_y;
			P3_W = data[3].shelterRect_width;
			P3_H = data[3].shelterRect_height;
			P3_color = data[3].shelterRect_color;
			cover_data2ui();
		}
	});
}
//
function video_privacy_mask_set()
{
	tipInfoShow(saveParmeter);
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var c_width = 640;
	var c_height = 480;
	var cover_enabled,Cover_bgColor;
	var cover_data,cover_data1,cover_data2,cover_data3,cover_data4;
	switch($("#Cover_bgColor").val()){
		case "FFFFFF": Cover_bgColor = 0xFFFFFF;break;
		case "5AAF5A": Cover_bgColor = 0x5AAF5A;break;
		case "006ECF": Cover_bgColor = 0x006ECF;break;
		default:Cover_bgColor = 0xFFFFFF;break;
	}
	cover_enabled = $('input#cover_enabled:checked').val() == 'on' ? 1:0;
	if( ($('#Move1').width() != null) || ($('#Move2').width() != null) || ($('#Move3').width() != null) || ($('#Move4').width() != null) ){
		P_enabled  = 0;
		P1_enabled = 0;
		P2_enabled = 0;
		P3_enabled = 0;
		if($('#Move1').width() != null){
			P_enabled = cover_enabled;
			P_X = ( ($('#Move1').offset().left-oWarp.offset().left)/c_width ).toFixed(5);
			P_Y = (($('#Move1').offset().top-oWarp.offset().top)/c_height).toFixed(5);
			P_W = (($('#Move1').width())/c_width).toFixed(5);
			P_H = (($('#Move1').height())/c_height).toFixed(5);
			P_color = Cover_bgColor;
		}
		if($('#Move2').width() != null){
			P1_enabled = cover_enabled;
			P1_X = ( ($('#Move2').offset().left-oWarp.offset().left)/c_width ).toFixed(5);
			P1_Y = (($('#Move2').offset().top-oWarp.offset().top)/c_height).toFixed(5);
			P1_W = (($('#Move2').width())/c_width).toFixed(5);
			P1_H = (($('#Move2').height())/c_height).toFixed(5);
			P1_color = Cover_bgColor;
		}
		if($('#Move3').width() != null){
			P2_enabled = cover_enabled;
			P2_X = ( ($('#Move3').offset().left-oWarp.offset().left)/c_width ).toFixed(5);
			P2_Y = (($('#Move3').offset().top-oWarp.offset().top)/c_height).toFixed(5);
			P2_W = (($('#Move3').width())/c_width).toFixed(5);
			P2_H = (($('#Move3').height())/c_height).toFixed(5);
			P2_color = Cover_bgColor;
		}
		if($('#Move4').width() != null){
			P3_enabled = cover_enabled;
			P3_X = ( ($('#Move4').offset().left-oWarp.offset().left)/c_width ).toFixed(5);
			P3_Y = (($('#Move4').offset().top-oWarp.offset().top)/c_height).toFixed(5);
			P3_W = (($('#Move4').width())/c_width).toFixed(5);
			P3_H = (($('#Move4').height())/c_height).toFixed(5);
			P3_color = Cover_bgColor;
		}
	}
	else{
		P_enabled  = cover_enabled;
		P1_enabled = cover_enabled;
		P2_enabled = cover_enabled;
		P3_enabled = cover_enabled;

	}
	cover_data1 = '"shelterRect_enable":'+P_enabled+',"shelterRect_x":'+P_X+',"shelterRect_y":'+P_Y+',"shelterRect_width":'+P_W+',"shelterRect_height":'+P_H+',"shelterRect_color":'+Cover_bgColor+'';
	cover_data2 = '"shelterRect_enable":'+P1_enabled+',"shelterRect_x":'+P1_X+',"shelterRect_y":'+P1_Y+',"shelterRect_width":'+P1_W+',"shelterRect_height":'+P1_H+',"shelterRect_color":'+Cover_bgColor+'';
	cover_data3 = '"shelterRect_enable":'+P2_enabled+',"shelterRect_x":'+P2_X+',"shelterRect_y":'+P2_Y+',"shelterRect_width":'+P2_W+',"shelterRect_height":'+P2_H+',"shelterRect_color":'+Cover_bgColor+'';
	cover_data4 = '"shelterRect_enable":'+P3_enabled+',"shelterRect_x":'+P3_X+',"shelterRect_y":'+P3_Y+',"shelterRect_width":'+P3_W+',"shelterRect_height":'+P3_H+',"shelterRect_color":'+Cover_bgColor+'';
	cover_data ='[{'+cover_data1+'},{'+cover_data2+'},{'+cover_data3+'},{'+cover_data4+'}]';
	$.ajax({
		type:'PUT',
		url:dvr_url + '/cover',
		dataType:'json',
		data:cover_data,
		async:false,
		beforeSend : function(req ){
			req .setRequestHeader('Authorization', auth);
		},
		success:function(data){
			if(data.statusCode == 0){
				tipInfoShow(saveSuccess);
				setTimeout("tipInfoHide()",hide_delay_ms);
				video_privacy_mask_get();
			}
		},
		error:function(a,b,c){
			if(a.status == 401){}
			else{}
			setTimeout("tipInfoHide()",500);
		}
	})
}
//Cover
function cover_data2ui()
{
	var snap = Math.random();
	var X, Y, W, H, L, T;
	var Bgcolor = '#' + P_color;
	$('#Video_Cover').find('div').remove();
	var coverBack = $('<div class="cover_bg" style=" width: 640px; position: relative; z-index: 1;"><img src="http://'+serverIp+'/snapshot?r='+ snap +'" style="width:640px; height:480px;"/></div>').appendTo($('#Video_Cover'));
	$('div.cover_bg').height(480);
	$('div.cover_bg').find('div').remove();
	if(P3_enabled == true||P2_enabled == true||P1_enabled == true||P_enabled == true){
		$('#cover_enabled').prop('checked',true);
	}
	else{
		$('#cover_enabled').prop('checked',false);
	}
	var i =0;
	$('div.cover_bg').mousedown(function(e){
		var ev = e || window.event;
		if(i>3){
			oWarp.find('div').remove();
			i=0;
		}
		i+=1;
		oWarp = $(this);
		X = ev.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
		Y = ev.clientY+document.body.scrollTop+document.documentElement.scrollTop;
		oMove = $('<div id="Move'+i+'" style="height:1px; width:1px; border:1px solid red; background-color:'+ Bgcolor +'; position:absolute; left:'+(X - oWarp.offset().left)+'px; top:'+(Y - oWarp.offset().top)+'px"></div>').appendTo(oWarp);
		ev.stopPropagation();
		$(document).mousemove(function(e){
			var ev = e || window.event;
			var x = ev.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;;
			x = x > oWarp.offset().left + oWarp.width() ? oWarp.offset().left + oWarp.width() : x;
			var y = ev.clientY+document.body.scrollTop+document.documentElement.scrollTop;
			y = y > oWarp.offset().top + oWarp.height() ? oWarp.offset().top + oWarp.height() : y;
			var W = Math.abs(x - X);
			var H = Math.abs(y - Y);
			var L = x - X < 0 ? x - oWarp.offset().left : parseInt(oMove.css('left'));
			if(L < 0){
				L = 0;
				W = Math.abs(X - oWarp.offset().left)
			}
			var T = y - Y < 0 ? y - oWarp.offset().top : parseInt(oMove.css('top'));
			if(T < 0){
				T = 0;
				H = Math.abs(Y - oWarp.offset().top)
			}
			$('.test1').html(W+':'+H);
			oMove.css({
				width:W,
				height:H,
				top:T,
				left:L
				})
		}).mouseup(function(){
			$(document).off();
		})
		return false;
	})
}
//强制保留1为小数
function toDecimal(x)
{
	var f = parseFloat(x);
	if (isNaN(f)){
		return false;
	}
	var f = Math.round(x*10)/10;
	var s = f.toString();
	var rs = s.indexOf('.');
	if (rs < 0){
		rs = s.length;
		s += '.';
	}
	while (s.length <= rs + 1){
		s += '0';
	}
	return s;
}
//
function video_overlayer_get()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
			type:"GET",
			url:dvr_url + '/overlayer',
			data: "channelId=1",
			dataType:"json",
			beforeSend : function(req){
				req .setRequestHeader('Authorization', auth);
    		},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				//alert("e="+textStatus);
				//alert("dd="+errorThrown);
			},
			success:function(data){
				$('#osddate_enable').attr('checked',data.osdDatetime_enable);
				$("#osddate_dateFormat").val(data.osdDatetime_dateFormat);
				$("#osddate_timeFormat").val(data.osdDatetime_timeFmt);
				$('#osddate_week').attr('checked',data.osdDatetime_displayWeek);
				$('#osdCh_name_enable').attr('checked',data.osdChannelName_enable);
				$("#channel_name").val(data.osdChannelName_text);
				$("#osdCH_ID_enable").attr('checked',data.osdChannelID_enable);
				$("#osdCH_ID_text").val(data.osdChannelID_text);
				daX = data.osdDatetime_x;
				daY = data.osdDatetime_y;
				naX = data.osdChannelName_x;
				naY = data.osdChannelName_y;
				deX = data.osdChannelID_x;
				deY = data.osdChannelID_y;
				da_enabled = data.osdDatetime_enable;
				na_enabled = data.osdChannelName_enable;
				de_enabled = data.osdChannelID_enable;
				display_week = data.osdDatetime_displayWeek;
				O_channelName = data.osdChannelName_text;
				O_channelID = data.osdChannelID_text;
				time_format = data.osdDatetime_timeFmt;
				date_format = data.osdDatetime_dateFormat;
				device_time = data.dev_time;
				device_week = data.dev_week;
				overlay_data2ui();
				$('input[id^="overlay1_"]').each(function(index){
					$(this)[0].onclick = function(){
						var obj = $('div.overlay_bg div').eq(index);
						obj.is(':visible') ? obj.hide() : obj.show();
					}
				})
				$('#osddate_week')[0].onclick = function(){
					var obj = $('#displayweek');
					obj.is(':visible') ? obj.hide() : obj.show();
				}
				osddate_enable();
			}
		});
}
//
function video_overlayer_set()
{
	tipInfoShow(saveParmeter);
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var osdDatetime_enable,osdDatetime_displayWeek,osdChannelName_enable,osdChannelID_enable;
	var osdDatetime_dateFormat=$("#osddate_dateFormat").val();
	var osdDatetime_timeFmt = $("#osddate_timeFormat").val();
	var osdChannelName_text = $("#channel_name").val();
	var osdChannelID_text = $("#osdCH_ID_text").val();
	if(osdChannelID_text==""){
		osdChannelID_text='ID';
	}
	osdDatetime_enable = $('input#osddate_enable:checked').val() == 'on' ? 1:0;
	osdDatetime_displayWeek = $('input#osddate_week:checked').val() == 'on' ? 1:0;
	osdChannelName_enable = $('input#osdCh_name_enable:checked').val() == 'on' ? 1:0;
	osdChannelID_enable = $('input#osdCH_ID_enable:checked').val() == 'on' ? 1:0;
	var overlay_data = '{"id":'+0+',"osdChannelName_enable": '+ osdChannelName_enable+
	',"osdChannelName_text":"'+osdChannelName_text+'","osdChannelName_x":'+nameX.toFixed(5)+',"osdChannelName_y":'+nameY.toFixed(5)+
	',"osdDatetime_enable":'+ osdDatetime_enable +',"osdDatetime_dateFormat":'+ osdDatetime_dateFormat +
	',"osdDatetime_dateSprtr":'+0+',"osdDatetime_timeFmt":'+osdDatetime_timeFmt+',"osdDatetime_x":'+dateX.toFixed(5)+
	',"osdDatetime_y":'+dateY.toFixed(5)+
	',"osdDatetime_displayWeek":'+ osdDatetime_displayWeek +
	',"osdChannelID_enable":'+ osdChannelID_enable + ',"osdChannelID_text":"'+ osdChannelID_text +
	'","osdChannelID_x":'+deviceX.toFixed(5)+ ',"osdChannelID_y":'+deviceY.toFixed(5)+ '}';
	$.ajax({
			type:'PUT',
			url:dvr_url + '/overlayer',
			dataType:'json',
			data:overlay_data,
			async:false,
			beforeSend : function(req ){
				req .setRequestHeader('Authorization', auth);
			},
			success:function(data){
				if(data.statusCode == 0){
					tipInfoShow(saveSuccess);
					setTimeout("tipInfoHide()",hide_delay_ms);
					video_overlayer_get();
				}
			},
			error:function(a,b,c){
				if(a.status == 401){}
				else{}
				setTimeout("tipInfoHide()",500);
			}
		})
}
function _length(str)
{
	var len=0;
	for(var i=0; i<str.length;i++){
		if(str.charAt(i)>'~'){
			len+=2;
		}
		else{
			len++;
		}
	}
	return len;
}
//
function overlay_data2ui()
{
	var o_width = 640;
	var o_height = 480;
	var snap = Math.random();
	$('#Video_OSD').find('div').remove();
	var overlayBack = $('<div class="overlay_bg" style=" width: 640px; position: relative; z-index: 1;"><img src="http://'+serverIp+'/snapshot?r='+ snap +'" style="width:640px; height:480px;"/></div>').appendTo($('#Video_OSD'));
	$('div.overlay_bg').height(480);
	$('div.overlay_bg').find('div').remove();
	var nowtime =device_time;
	if($("#language_select").val()==0){
		var dayC=["星期天","星期一","星期二","星期三","星期四","星期五","星期六",]
		var Week = dayC[device_week];
	}
	else{
		var day=["SUN","MON","TUE","WED","THU","FRI","SAT",]
		var Week = day[device_week];
	}
	if(_length(O_channelName)==0)
		O_channelName="&nbsp";
	if(_length(O_channelID)==0)
		O_channelID="&nbsp";
		var time_len = (_length(nowtime) + _length(Week))*8;
		var name_len = _length(O_channelName)*8;
		var id_len = _length(O_channelID)*8;
		name_len = name_len<16?16:name_len;
		id_len = id_len<16?16:id_len;
		var _height=18;
		var oFix1Left = parseInt((daX*o_width));
		var oFix1Top = parseInt((daY*o_height));
		var oFix2Left = parseInt((naX*o_width));
		var oFix2Top = parseInt((naY*o_height));
		var oFix3Left = parseInt((deX*o_width));
		var oFix3Top = parseInt((deY*o_height));
		oFix1Left	= oFix1Left+time_len > o_width	?	o_width	-time_len	:oFix1Left;
		oFix1Top 	= oFix1Top+_height	 > o_height ?	o_height-_height	:oFix1Top;
		oFix2Left = oFix2Left+name_len > o_width	?	o_width	-name_len	:oFix2Left;
		oFix2Top 	= oFix2Top+_height	 > o_height ?	o_height-_height	:oFix2Top;
		oFix3Left = oFix3Left+id_len	 > o_width	?	o_width	-id_len		:oFix3Left;
		oFix3Top 	= oFix3Top+_height	 > o_height ?	o_height-_height	:oFix3Top;
		dateX = daX;
		dateY = daY;
		nameX = naX;
		nameY = naY;
		deviceX = deX;
		deviceY = deY;
		var oFix1 = $('<div id="datetime" style="display:none; font-size:16px; color:grey; border:1px solid Yellow; position:absolute; left:'+oFix1Left+'px; top:'+ oFix1Top +'px"><span style="  float:left; margin-left:1px;">'+nowtime+'</span><span id="displayweek" style=" float:right; margin-right:1px; margin-left:8px; display:none;  border:0px solid red;">'+Week+'</span></div>').appendTo($('div.overlay_bg'));
		var oFix2 = $('<div id="channelName" style="display:none; font-size:16px; color:grey; border:1px solid Yellow; position:absolute; left:'+oFix2Left+'px; top:'+ oFix2Top +'px">'+ O_channelName +'</div>').appendTo($('div.overlay_bg'));
		var oFix3 = $('<div id="play_id" style="display:none; font-size:16px; color:grey; border:1px solid Yellow; position:absolute; left:'+oFix3Left+'px; top:'+ oFix3Top +'px">'+O_channelID+'</div>').appendTo($('div.overlay_bg'));
		$('#osddate_dateFormat').val(date_format);
		$('#osddate_timeFormat').val(time_format);
		$('#osddate_week').prop('checked', display_week?true:false);
		$('#displayweek')[0].style.display = display_week?'block':'none';
		$('#osddate_enable').prop('checked', da_enabled?true:false);
		oFix1[0].style.display = da_enabled?'block':'none';
		$('#osdCh_name_enable').prop('checked', na_enabled?true:false);
		oFix2[0].style.display = na_enabled?'block':'none';
		$('#osdCH_ID_enable').prop('checked', de_enabled?true:false);
		oFix3[0].style.display = de_enabled?'block':'none';
		var X,Y,T,L,t,l;
		var oFix;
		fix(oFix1),fix(oFix2),fix(oFix3);
		function fix(oFix){
			oFix.mousedown(function(e){
				if(oFix[0].setCapture){
					oFix[0].setCapture();
				}
				else if(window.captureEvents)
					window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
				var ev = e || window.event;
				X = ev.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
				Y = ev.clientY+document.body.scrollTop+document.documentElement.scrollTop;
				T = parseInt(oFix.css('top'));
				L = parseInt(oFix.css('left'));
				//Overlay_region();
				$(document).mousemove(function(e){
					var ev = e || window.event;
					t = ev.clientY+document.body.scrollTop+document.documentElement.scrollTop - Y + T;
					t = t > $('div.overlay_bg').height() - oFix.height() - 2 ? $('div.overlay_bg').height() - oFix.height() -2 : t;
					t = t < 0 ? 0 : t;
					l = ev.clientX+document.body.scrollLeft+document.documentElement.scrollLeft - X + L
					l = l > $('div.overlay_bg').width() - oFix.width() - 2 ?	$('div.overlay_bg').width() - oFix.width() -2  : l;
					l = l < 0 ? 0 : l;
					oFix.css({
						top: t,
						left: l
					})
					if(oFix == oFix1){
						dateX = l/o_width;
						dateY = t/o_height;
					}
					else if(oFix == oFix2){
						nameX = l/o_width;
						nameY = t/o_height;
					}
					else if(oFix == oFix3){
						deviceX = l/o_width;
						deviceY = t/o_height;
					}
					//Overlay_region();
				}).mouseup(function(){
						if(oFix[0].releaseCapture){
							oFix[0].releaseCapture();
						}
						else if(window.captureEvents)
							window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
						$(document).off();
						if(oFix == oFix1){
							dateX = l/o_width;
							dateY = t/o_height;
						}
						else if(oFix == oFix2){
							nameX = l/o_width;
							nameY = t/o_height;
						}
						else if(oFix == oFix3){
							deviceX = l/o_width;
							deviceY = t/o_height;
						}
						//Overlay_region();
					})
			})
		}
}

//osddate使能
function osddate_enable()
{
	var _osddate_enable=document.getElementById("osddate_enable");
	if(!_osddate_enable.checked){
		$("#osddate_dateFormat")[0].disabled = true;
		$("#osddate_timeFormat")[0].disabled = true;
		$("#osddate_week")[0].disabled		 = true;
	}
	else{
		$("#osddate_dateFormat")[0].disabled = false;
		$("#osddate_timeFormat")[0].disabled = false;
		$("#osddate_week")[0].disabled		 = false;
	}
}
//snapshot
function Snapshot()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:'GET',
		url:dvr_url + '/snapshotjpg',
		dataType:'json',
		data: "snapshotjpg",
		async:false,
		beforeSend : function(req ) {
			req .setRequestHeader('Authorization', auth);
		},
		success:function(data){
			var url = "http://" + serverIp + "/snapshot_dir/web.jpg";
			window.location.href=url;
		},
		error:function(a,b,c){
		if(a.status == 401){}
		else{}
		setTimeout("hideInfo()",500);
		}
	})
}
//本地网络信息获取
function net_local_get(id)
{
		var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
		$.ajax({
			type:'GET',
			url:dvr_url + '/NetSetting',
			dataType:'json',
			data: "type="+id,
			async:false,
			beforeSend : function(req ) {
				req .setRequestHeader('Authorization', auth);
			},
			success:function(data){
				$('#textLocalMac').val(data.mac);
				if(data.netName=='eth0'){
					$('#RadioLocalNet').attr("checked","true");
				}
				else{
					$('#RadioWifiNet').attr("checked","true");
				}
				if(data.dhcpEnable == 1){
					$('#RadioLocalDhcpEnable').attr("checked","true");
				}
				else{
					$('#RadioLocalDhcpDisable').attr("checked","true");
				}
				if(data.IPAutoTrack == 1){
					$('#IPAutoTrack').prop('checked',true);
				}
				else{
					$('#IPAutoTrack').prop('checked',false);
				}				
				local_dhcp_config_change('RadioLocalDhcpDisable');
				if(data.upnpEnable == 1){
					$('#RadioLocalUpnpEnable').attr("checked","true");
				}
				else{
					$('#RadioLocalUpnpDisable').attr("checked","true");
				}
				default_ip	=	data.ip;
				default_gw	=	data.gateway;
				default_mask=	data.netmask;
				var _ip		=	new Array("","","","");
				var _gw		=	new Array("","","","");
				var _mask	=	new Array("","","","");
				_ip			=	get_data(data.ip);
				_gw			=	get_data(data.gateway);
				_mask		=	get_data(data.netmask);
				_DNS_1		=	get_data(data.dns1);
				_DNS_2		=	get_data(data.dns2);
				$('#ip_1').val(_ip[1]);
				$('#ip_2').val(_ip[2]);
				$('#ip_3').val(_ip[3]);
				$('#ip_4').val(_ip[4]);
				$('#gw_1').val(_gw[1]);
				$('#gw_2').val(_gw[2]);
				$('#gw_3').val(_gw[3]);
				$('#gw_4').val(_gw[4]);
				$("#mask_1").val(_mask[1]);
				$("#mask_2").val(_mask[2]);
				$("#mask_3").val(_mask[3]);
				$("#mask_4").val(_mask[4]);
				$("#DNS_f_1").val(_DNS_1[1]);
				$("#DNS_f_2").val(_DNS_1[2]);
				$("#DNS_f_3").val(_DNS_1[3]);
				$("#DNS_f_4").val(_DNS_1[4]);
				$("#DNS_b_1").val(_DNS_2[1]);
				$("#DNS_b_2").val(_DNS_2[2]);
				$("#DNS_b_3").val(_DNS_2[3]);
				$("#DNS_b_4").val(_DNS_2[4]);
				$('#textLocalIp').val( data.ip);
				$('#textLocalGateway').val(data.gateway);
				$('#textLocalMask').val(data.netmask);
				$('#textLocalDns1').val(data.dns1);
				$('#textLocalDns2').val(data.dns2);
			},
			error:function(a,b,c){
				if(a.status == 401){}
				else{}
				setTimeout("hideInfo()",500);
			}
		})
}
function get_data(data)
{
	var re=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;//正则表达示
	var v=new Array("","","","");
	if(re.test(data)){
		v[1]	=	RegExp.$1;
		v[2]	=	RegExp.$2;
		v[3]	=	RegExp.$3;
		v[4]	=	RegExp.$4;
	}
	return v;
}
//保存当前IP
function save_current_ipaddr(id)
{
	var ipaddr_obj=document.getElementById(id);
	default_ip=ipaddr_obj.value;
}
//检测IP地址是否正确
function check_ip_is_valid(id)
{
	var ip_obj=document.getElementById(id);
	var re=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;//正则表达示
	if(re.test(ip_obj.value)){
	   if( RegExp.$1<256 && RegExp.$2<256 && RegExp.$3<256 && RegExp.$4<256)
	   return true;
	}
	tipInfoShow(str_IP_check);
	setTimeout("tipInfoHide()",hide_delay_ms);
	ip_obj.value=default_ip;
	return false;
}
//本地Dhcp变化
function local_dhcp_config_change(id)
{
	var _IP	=	document.getElementsByName("IP");
	var _GW	=	document.getElementsByName("GW");
	var _MASK	=	document.getElementsByName("MASK");
	var _DNF_F	=	document.getElementsByName("DNS_F");
	var _DNS_B	=	document.getElementsByName("DNS_B");
	if($("#RadioLocalDhcpEnable")[0].checked ==1)
	{
		$("#ip")[0].disabled = true;
		$("#gw")[0].disabled = true;
		$("#mask")[0].disabled = true;
		$("#DNS_f")[0].disabled = true;
		$("#DNS_b")[0].disabled = true;
		for(var i=0; i<_IP.length;i++){
			_IP[i].disabled				=	true;
		}
		for(var i=0; i<_GW.length;i++){
			_GW[i].disabled				=	true;
		}
		for(var i=0; i<_MASK.length;i++){
			_MASK[i].disabled				=	true;
		}
		for(var i=0; i<_DNF_F.length;i++){
			_DNF_F[i].disabled				=	true;
		}
		for(var i=0; i<_DNS_B.length;i++){
			_DNS_B[i].disabled				=	true;
		}
		document.getElementById("ip").style.backgroundColor="#F0F0F0";
		document.getElementById("gw").style.backgroundColor="#F0F0F0";
		document.getElementById("mask").style.backgroundColor="#F0F0F0";
		document.getElementById("DNS_f").style.backgroundColor="#F0F0F0";
		document.getElementById("DNS_b").style.backgroundColor="#F0F0F0";
	}
	else{
		$("#ip")[0].disabled = false;
		$("#gw")[0].disabled = false;
		$("#mask")[0].disabled = false;
		$("#DNS_f")[0].disabled = false;
		$("#DNS_b")[0].disabled = false;
		for(var i=0; i<_IP.length;i++){
			_IP[i].disabled				=	false;
		}
		for(var i=0; i<_GW.length;i++){
			_GW[i].disabled				=	false;
		}
		for(var i=0; i<_MASK.length;i++){
			_MASK[i].disabled				=	false;
		}
		for(var i=0; i<_DNF_F.length;i++){
			_DNF_F[i].disabled				=	false;
		}
		for(var i=0; i<_DNS_B.length;i++){
			_DNS_B[i].disabled				=	false;
		}
		document.getElementById("ip").style.backgroundColor="#FFF";
		document.getElementById("gw").style.backgroundColor="#FFF";
		document.getElementById("mask").style.backgroundColor="#FFF";
		document.getElementById("DNS_f").style.backgroundColor="#FFF";
		document.getElementById("DNS_b").style.backgroundColor="#FFF";
	}
}
function ip_checke_first(id)
{
	var _id		=	"#"+id;
	var ipvalue	=	$(_id).val();
	if(ipvalue==""||ipvalue>223||ipvalue==127||ipvalue==0){
		var str	=	ipvalue +'不是有效值,请指定一个介于1和223的值。';
		tipInfoShow(str);
		setTimeout("tipInfoHide()",hide_delay_ms);
		if(ipvalue=="")
			$(_id).val(1);
		else
			$(_id).val(223);
	}
	else
		$(_id).val(parseInt(ipvalue));
}
function ip_checke(id)
{
	var _id		=	"#"+id;
	var ipvalue	=	$(_id).val();
	if(ipvalue==""||ipvalue>255){
		var str	=	ipvalue +'不是有效值,请指定一个介于0和255的值。';
		tipInfoShow(str);
		setTimeout("tipInfoHide()",hide_delay_ms);
		if(id=='gw_1')
			$(_id).val(255);
		else {
			if(ipvalue=="")
				$(_id).val(0);
			else
				$(_id).val(255);
		}
	}
	else {
		if(id=='gw_1'&&ipvalue==0)
			$(_id).val(255);
		else
			$(_id).val(parseInt(ipvalue));
	}
}
function check_net(ipAddress,gwAddress,maskAddress)
{
	var ipArray		=	ipAddress.split(".");
	var gwArray		=	gwAddress.split(".");
	var maskArray	=	maskAddress.split(".");
	var ipstr		=	IPAddresstostring(ipArray);
	var gwstr		=	IPAddresstostring(gwArray);
	var maskstr		=	IPAddresstostring(maskArray);
	var s1			=	"";
	var s2			=	"";
	for(var i=0;i<4;i++){
		s1	+=	parseInt(ipArray[i]) & parseInt(maskArray[i]);
		if(i!=3)
			s1+=".";
	}
	for(var i=0;i<4;i++){
		s2	+=	parseInt(gwArray[i]) & parseInt(maskArray[i]);
		if(i!=3)
			s2+=".";
	}
	if(s1==s2)
		return true;
	else
		return false;
}
function IPAddresstostring(IPAddress)
{
	var IPstr	=	"";
	for(var i = 0; i < 4; i ++){
		var curr	=	parseInt(IPAddress[i]);
		var nun_str	=	curr.toString(2);
		var count	=	8 - nun_str.length;
		for(var j = 0; j < count; j ++){
			nun_str	=	"0" + nun_str;
		}
		IPstr	+=	nun_str;
	}
	return IPstr;
}
//本地网络设置
function net_local_set()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var dhcpEnable	=	$('#RadioLocalDhcpEnable').prop('checked') ?1:0;
	var upnpEnable 	=	$('#RadioLocalUpnpEnable').prop('checked') ?1:0;
	var IPAutoTrackEnable 	=	$('#IPAutoTrack').prop('checked')  ?1:0;
	var active_net	=	$('#RadioLocalNet').prop('checked')			?	'local'	:	'wifi';
	var ip			=	$("#ip_1").val()	+ '.' +	$("#ip_2").val()	+ '.' +	$("#ip_3").val()	+ '.' +	$("#ip_4").val();
	var mask		=	$("#mask_1").val()	+ '.' +	$("#mask_2").val()	+ '.' +	$("#mask_3").val()	+ '.' +	$("#mask_4").val();
	var gw			=	$("#gw_1").val()	+ '.' +	$("#gw_2").val()	+ '.' +	$("#gw_3").val()	+ '.' +	$("#gw_4").val();
	var DNS_1		=	$("#DNS_f_1").val()	+ '.' + $("#DNS_f_2").val()	+ '.' + $("#DNS_f_3").val()	+ '.' + $("#DNS_f_4").val();
	var DNS_2		=	$("#DNS_b_1").val()	+ '.' + $("#DNS_b_2").val()	+ '.' + $("#DNS_b_3").val()	+ '.' + $("#DNS_b_4").val();
	var check_result=	check_net(ip,gw,mask);
	var local_data = '{ "type": "'+active_net+'" ,  "dhcpEnable": '+dhcpEnable+',  "upnpEnable": '+upnpEnable+
					',  "ip": "'+ip+'", "netmask": "'+mask+'", "gateway": "'+gw+ '", "dns1": "'+DNS_1+'", "dns2": "'
					+DNS_2+'", "IPAutoTrack": '+IPAutoTrackEnable+'}';
	if(!check_result){
		tipInfoShow(str_IPmodify_result);
		setTimeout("tipInfoHide()",hide_delay_ms);
	}
	else {
		var Set_local = $.ajax({
			type:'PUT',
			url:dvr_url + "/NetSetting",
			dataType:'json',
			timeout:2000,
			data: local_data,
			beforeSend : function(req ) {
				req.setRequestHeader('Authorization', auth);
			},
			success:function(data){
					if(data.statusCode==1)
					{
						var ip_exist	=	'IP:'+ip+str_ip_exist;
						tipInfoShow(ip_exist);
						setTimeout("tipInfoHide()",hide_delay_ms);
					}
					else
					{
						var dvr_url_edit='http://'+ip+'/view.html';
						window.location.href=dvr_url_edit;
						tipInfoShow(saveSuccess);
						setTimeout("tipInfoHide()",hide_delay_ms);
					}
			},
			error:function(a,b,c){
				if(a.status == 401){}
				else{}
				setTimeout("tipInfoHide()",500);
                
                if (a.status == 12031 || a.status == 0) {//FIXME(heyong): ERROR_INTERNET_CONNECTION_RESET: The connection with the server has been reset. 
                    alert(ip_change_prompt_relogin);
                    var dvr_url_edit='http://'+ip+'/view.html';
                    window.location.href=dvr_url_edit;
                    tipInfoShow(saveSuccess);
                } else {
                    var wr='ERROR: NetSetting status = '+a.status;
                    tipInfoShow(wr);
                    setTimeout("tipInfoHide()",hide_delay_ms);
                }
			},
			complete:function(XMLHttpRequest,status)
			{
                //var wr='NetSetting status = '+status +' '+ ip_change_prompt_relogin;
				if(status == 'timeout') {
                    //alert(ip_change_prompt_relogin);
                    //var dvr_url_edit='http://'+ip+'/view.html';
                    //window.location.href=dvr_url_edit;
                    //tipInfoShow(saveSuccess);
					//Set_local.abort();
                }
			}
		})
	}
}

//rtsp流设置

function rtsp_set()
{
        alert(window.location.hostname);
        var rtsp_url='rtsp://'+window.location.hostname+'/stream0';
        console.log('url: %s\n', rtsp_url);
        window.vxgplayer('vxg_media_player1').stop();
        window.vxgplayer('vxg_media_player1').src(rtsp_url);
        window.vxgplayer('vxg_media_player1').play();
}


function wireless_mode()
{
	$("#wireless_mode")[0].disabled	=	true;
	//var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	tipInfoShow(str_wirelessmode);
	var wifi_mode	=	$("#wireless_mode").val();
	var str			=	'{"wirelessMode":'+wifi_mode+'}';
	$.ajax({
		type:'PUT',
		url:dvr_url + '/wireless_mode',
		dataType:'json',
		data:str,
		beforeSend:function(req){
			//req.setRequestHeader('Authorization', auth);
		},
		error:function(){
			$("#wireless_mode")[0].disabled	=	false;
		},
		success:function(data)
		{
			if(wifi_mode==0){
				$("#sta").hide();
				$("#acc").show();
				ap_wifi_get();
			}
			else {
				$("#sta").show();
				$("#acc").hide();
				net_wifi_get();
			}
			$("#wireless_mode")[0].disabled	=	false;
			setTimeout("tipInfoHide()",1000);
		}
	})
}
function ap_wifi_get()
{
	//var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:'GET',
		url:dvr_url + '/ap_wireless',
		dataType:'json',
		beforeSend:function(req){
			//req.setRequestHeader('Authorization', auth);
		},
		error:function(){
			$("#wireless_mode")[0].disabled	=	false;
		},
		success:function(data){
			$("#wirelessApEssId_acc").val(data.ap_ssid);
			$("#wirelessApPsk_acc").val(data.ap_pwd);
			$("#wirelessWpaMode_acc").val(data.ap_auth);
			$("#wlan0_staticIP_ap").val(data.ap_ip);
			$("#dhcpIpNumber").val(data.ap_start);
		}
	})
}
function wifi_info_get()
{
	//var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$("#wireless_mode")[0].disabled	=	true;
	$.ajax({
		type:'GET',
		url:dvr_url + '/wireless_mode',
		dataType:'json',
		beforeSend:function(req){
			//req.setRequestHeader('Authorization', auth);
		},
		error:function(){
			$("#wireless_mode")[0].disabled	=	false;
			tipInfoShow(str_wifi_get_error);
			setTimeout("tipInfoHide()",1000);
		},
		success:function(data){
			$("#wireless_mode").val(data.wirelessMode);
			if(data.wirelessMode	==	0){
				$("#sta").hide();
				$("#acc").show();
				ap_wifi_get();
			}
			else {
				$("#sta").show();
				$("#acc").hide();
				net_wifi_get();
			}
			$("#wireless_mode")[0].disabled	=	false;
		}
	})
}
function ap_wifi_edit()
{
	//var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var ap_ssid		=	$("#wirelessApEssId_acc").val();
	var ap_pwd		=	$("#wirelessApPsk_acc").val();
	var authmode	=	$("#wirelessWpaMode_acc").val();
	var wifi_ap='{"ap_ssid":"'+ap_ssid+'","ap_pwd":"'+ap_pwd+'","ap_auth":'+authmode+'}';
	$.ajax({
		type:'PUT',
		url:dvr_url + '/ap_wireless',
		dataType:'json',
		data:wifi_ap,
		beforeSend:function(req){
			//req.setRequestHeader('Authorization', auth);
		},
		error:function(){
			tipInfoShow(str_ap_edit_fail);
			setTimeout("tipInfoHide()",1000);
		},
		success:function(data){
			if(data.statusCode==0){
				tipInfoShow(str_ap_edit_success);
				setTimeout("tipInfoHide()",1000);
			}
			else {
				tipInfoShow(str_ap_edit_fail);
				setTimeout("tipInfoHide()",1000);
			}
		}
	})
}
var _type_change=true;
var _wpa_psk_check=document.getElementById("wpa_psk_type");
function type_change()
{
	if(_type_change){
		$("#wpa_psk").hide();
		$("#wpa_psk_text").show();
		$("#wpa_psk_text").focus();
		$("#wpa_psk_text").val($("#wpa_psk").val());
	}
	else{
		$("#wpa_psk").show();
		$("#wpa_psk_text").hide();
		$("#wpa_psk").focus();
		$("#wpa_psk").val($("#wpa_psk_text").val());
	}
	_type_change=!_type_change;
}
function nochinese()
{
	var _pwd;
	if(!_type_change)
	{
		_pwd=$("#wpa_psk_text").val();
		$("#wpa_psk").val(_pwd);
	}
	else
	{
		_pwd=$("#wpa_psk").val()
		$("#wpa_psk_text").val(_pwd);
	}
}
//wifi信息获取
function net_wifi_get()
{
	var tab=document.getElementById("wifi_list");
	var rowNum=tab.rows.length;
	$("#wifi_search")[0].disabled=true;
	for(var i=rowNum-1;i>=0;i--){
		tab.deleteRow(i);
	}
	//var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:'GET',
		url:dvr_url + '/wireless',
		dataType:'json',
		beforeSend:function(req){
			//req.setRequestHeader('Authorization', auth);
		},
		success:function(data){
			try{
				var _index=data.index;
				var _list=data.list;
				if(_list.length>0){
					$("#div_wifi_show").css("height","200px");
					$("#div_wifi_show").css("overflow-y","scroll");
					for(var i=0;i<_list.length;i++){
						id=i+1;
						wifi_info[i][0]=_list[i].ap_ssid;
						wifi_info[i][1]=_list[i].ap_mac;
						wifi_info[i][2]=_list[i].ap_security;
						wifi_info[i][3]=_list[i].ap_quality;//level
						wifi_info[i][4]=_list[i].ap_mode;
						wifi_info[i][5]=_list[i].ap_channel;
						var qua = _list[i].ap_quality;
						var image_num = 1;
						if(qua >= 80){
							image_num = 5;
						}
						else if(qua >= 67){
							image_num = 4;
						}
						else if(qua >= 46){
							image_num = 3;
						}
						else if(qua >= 33){
							image_num = 2;
						}
						else{
							image_num = 1;
						}
						var strimg='../image/signal_16px_'+image_num+'.png';
						if(i==_index)
							$("#wifi_list").append("<tr style=\"cussor: hand; color:#F00; font-weight:bold;\" align=\"center\" onclick=\"wifiinfo_show("+i+")\"><td width=\"28px\">"+id+"</td><td width=\"97px\">"+_list[i].ap_ssid+"</td><td width=\"195px\">"+_list[i].ap_mac+"</td><td><img src=\""+strimg+"\"/></td></tr>");
						else
							$("#wifi_list").append("<tr style=\"cussor: hand\" align=\"center\" onclick=\"wifiinfo_show("+i+")\"><td width=\"28px\">"+id+"</td><td width=\"97px\">"+_list[i].ap_ssid+"</td><td width=\"195px\">"+_list[i].ap_mac+"</td><td><img src=\""+strimg+"\"/></td></tr>");
					}
				}
				else{
					$("#div_wifi_show").removeAttr("style");
				}
			}
			catch(e){
				$("#div_wifi_show").removeAttr("style");
				tipInfoShow(str_wifiinfo_getfail);
				setTimeout("tipInfoHide()",1000);
			}
			$("#wifi_search")[0].disabled=false;
		},
		error:function(){}
	});
}
//列表显示wifi信息
function wifiinfo_show(i)
{
	var wireless_ctr=document.getElementById("wireless_control");
	if(!wireless_ctr.checked){
		tipInfoShow(str_wifi_openenable);
		setTimeout("tipInfoHide()",1000);
	}
	else{
		$("#wireless_SSID").show();
		$("#wireless_networktype").show();
		$("#wireless_authtype").show();
		$("#wireless_wpa_psk").show();
		$('#wifi_SSID').val(wifi_info[i][0]);
		$('#wifi_networktype').val(wifi_info[i][4]);
		$('#wifi_authtype').val(wifi_info[i][2]);
		$('#wifi_MacAddr').val(wifi_info[i][1]);
		//show_mac=wifi_info[i][1];
	}
}
//wifi信息显示控制
function wireless_control()
{
	var wireless_ctr=document.getElementById("wireless_control");
	var _wirrless_ctr=wireless_ctr.checked?1:0;
	if(_wirrless_ctr){
		document.getElementById("wireless_SSID").style.display="";
		document.getElementById("wireless_networktype").style.display="";
		document.getElementById("wireless_authtype").style.display="";
		document.getElementById("wireless_wpa_psk").style.display="";
	}
	else{
		document.getElementById("wireless_SSID").style.display="none";
		document.getElementById("wireless_networktype").style.display="none";
		document.getElementById("wireless_authtype").style.display="none";
		document.getElementById("wireless_encryption").style.display="none";
		document.getElementById("wireless_wpa_psk").style.display="none";
	}
	wireless_enable(_wirrless_ctr);
}
function wireless_enable(enable)
{
	var wireless_enable='{"enable":'+enable+'}';
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"PUT",
		url:dvr_url + '/wireless_enable',
		dataType:'json',
		data:wireless_enable,
		beforeSend:function(req){
			req.setRequestHeader('Authorization', auth);
		},
		success:function(data){
			if(data.statusCode==-8010){
				tipInfoShow(str_wifi_up);
				setTimeout("tipInfoHide()",1000);
			}
			else if(data.statusCode==-8000){
				tipInfoShow(str_wifi_down);
				setTimeout("tipInfoHide()",1000);
			}
			else{
				tipInfoShow(str_wifi_enbalefial);
				setTimeout("tipInfoHide()",1000);

			}
		}
	})
}
//
function net_wifi_set(enable)
{
	var ap_ssid,ap_password,wifi_authtype;
	//var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	ap_ssid = $('#wifi_SSID').val();
	ap_password = $('#wpa_psk').val();
	wifi_authtype = $('#wifi_authtype').val();
	var ap_enable=$("#wireless_control").checked?1:0;
	var ap_mac=$("#wifi_MacAddr").val();
	var ap_connect = enable;
	var ap_enable = document.getElementById("wireless_control").checked==false?0:1;
	if(ap_enable==0){
		tipInfoShow(str_wifi_openenable);
		setTimeout("tipInfoHide()",1000);
	}
	else{
		var wifi_data = '{"ap_ssid":"'+ap_ssid+'","ap_password":"'+ap_password+'","ap_connet":'+ap_connect+',"wifi_authtype":'+wifi_authtype+',"ap_mac":"'+ap_mac+'"}';
		$.ajax({
			type:'PUT',
			url:dvr_url + '/wireless',
			dataType:'json',
			data:wifi_data,
			beforeSend:function(req){
				//req.setRequestHeader('Authorization', auth);
			},
			success:function(data){
					if(data.statusCode == 0){
						tipInfoShow(str_wifi_linkok);
						setTimeout("tipInfoHide()",1000);
					}
					else if(data.statusCode==-1){
						tipInfoShow(str_wifi_linkfail);
						setTimeout("tipInfoHide()",1000);
					}
					else if(data.statusCode == -2){
						tipInfoShow(str_wifi_linkouttime);
						setTimeout("tipInfoHide()",1000);
					}
					else if(data.statusCode == -3){
						var wifi_tips=str_wifi_Noid+ap_ssid+'!';
						tipInfoShow(wifi_tips);
						setTimeout("tipInfoHide()",1000);
					}
					else if(data.statusCode == -4){
						tipInfoShow(str_wifi_Pwdwrong);
						setTimeout("tipInfoHide()",1000);
					}
					else if(data.statusCode==-8000){
						tipInfoShow(str_wifi_disconnectok);
						setTimeout("tipInfoHide()",1000);
					}
					else if(data.statusCode==-8001){
						tipInfoShow(str_wifi_disconnectfail);
						setTimeout("tipInfoHide()",1000);
					}
					else{
							tipInfoShow(str_wifi_linkfail);
							setTimeout("tipInfoHide()",hide_delay_ms);
					}
					if(ap_enable!=0)
						net_wifi_get();
			},
			error:function(){}
		})
	}
}
//
function net_enten_onvif_get()
{
	var tab=document.getElementById("p2p_qr_tb");
	var rowNum=tab.rows.length;
	for(var i=rowNum-1;i>=0;i--)
	{
		tab.deleteRow(i);
	}
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		url:dvr_url + '/cgi-bin/sys_onvif',
		dataType:"json",
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
  		},
		error:function(XMLHttpRequest, textStatus, errorThrown){},
		success:function(data){
			$('#textOnvifVersion').val(data.onvifVersion);
		}
	});
	$.ajax({
			type:"GET",
			url:dvr_url+"/qrcode",
			dataType:"json",
			beforeSend : function(req){
				//req.setRequestHeader('Authorization', auth);
				},
			error:function()
			{
				//alert("error!");
				//window.location.href=dvr_url;
			},
			success:function(data)
			{
				if(data.qr.length==0)
				{
					$("#p2p_info").hide();
					$("#hr1").hide();
					$("#hr2").hide();
				}
				else
				{
					$("#p2p_info").show();
					$("#hr1").show();
					$("#hr2").show();
				}
				var str="";
				str+="<tr>";
				for(var i=0;i<data.qr.length;i++)
				{
					if(data.qr[i].name!="")
						str+="<td align=\"center\">"+data.qr[i].name+"</td>";
				}
				str+="</tr>";
				str+="<tr>";
				for(var i=0;i<data.qr.length;i++)
				{
					if(data.qr[i].name!="")
					{
						str+="<td align=\"center\"><div id=\""+data.qr[i].name+"\"></div></td>";
					}
				}
				str+="</tr>";
				$("#p2p_qr_tb").append(str);
				for(var j=0;j<data.qr.length;j++)
				{
					//var userAgent = navigator.userAgent;
					//var isOpera = userAgent.indexOf("Opera")>-1;
					//var _isIE = userAgent.indexOf("compatible")>-1&&userAgent.indexOf("MSIE")&&!isOpera;
					var Sys={};
					var ua=navigator.userAgent.toLowerCase();
					if(window.ActiveXObject)
					{
						Sys.ie=ua.match(/msie ([\d.]+)/)[1];
					}
					if(Sys.ie&&(Sys.ie.substring(0,1)=="8"))
					/*if(_isIE)
					{
						var IE5=IE55=IE6=IE7=IE8=IE9=false;
						var reIE=new RegExp("MSIE(\\d+\\.\\d+);");
						reIE.test(userAgent);
						var fIEVersion = parseFloat(RegExp["$1"]);
						IE5=fIEVersion==5.5;
						IE6=fIEVersion==6.0;
						IE7=fIEVersion==7.0;
						IE8=fIEVersion==8.0;
						IE9=fIEVersion==9.0;
					}
					if(IE5||IE6||IE7||IE8||IE9)	*/

						generateQRCode(data.qr[j].name,"table",100,100,toUtf8(data.qr[j].ID));
					else if(Sys.ie&&((Sys.ie.substring(0,1)=="6")||(Sys.ie.substring(0,1)=="7")))
						generateQRCode(data.qr[j].name,"table",100,100,toUtf8(data.qr[j].ID));
					else
						generateQRCode(data.qr[j].name,"canvas",100,100,toUtf8(data.qr[j].ID));
				}
				/*
				if(data.ulucu_id==""&&data.yunni_id=="")
				{
					$("#p2p_info").hide();
					$("#p2p_qr_tb").hide();
				}
				else
				{
					$("#p2p_info").show();
					//$("#p2p_qr_tb").show();
				}
				if(data.ulucu_id!=""&&data.yunni_id=="")
				{
					$("#qr_yn").hide();
					$("#qrc_yn").hide();
					$("#qr_ulk").show();
					generateQRCode("p2p_ulk","table",100,100,data.ulucu_id);

				}
				if(data.yunni_id!=""&&data.ulucu_id=="")
				{
					$("#qr_ulk").hide();
					$("#qrc_ulk").hide();
					$("#qr_yn").show();
					generateQRCode("p2p_yn","table",100,100,data.yunni_id);
				}*/
			}
		});
}

function generateQRCode(name,rendermethod,picwidth,picheight,url)
{
	var _name='#'+name;
		$(_name).empty();

		$(_name).qrcode({
			render: rendermethod,//"table",
			width: picwidth,
			height:picheight,
			text: url
		});
}
function toUtf8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for(i = 0; i < len; i++) {
    	c = str.charCodeAt(i);
    	if ((c >= 0x0001) && (c <= 0x007F)) {
        	out += str.charAt(i);
    	} else if (c > 0x07FF) {
        	out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
        	out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
        	out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
    	} else {
        	out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
        	out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
    	}
    }
    return out;
}
//用户信息获取
function sys_user_info_get()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var str;
	$.ajax({
		type:"GET",
		url:dvr_url+'/user',
		data:"",
		dataType:"json",
		beforeSend:function(req){
			req .setRequestHeader('Authorization', auth);
		},
		success:function(data){
			str='<table><tr><th>'+str_username+'</th><th>'+str_userpwd+'</th><th style="display:none;">'+str_userright+'</th><th>'+str_operation+'</th></tr>';
			for(var i=0;i<data.length;i++){
				str+='<tr><td>';
				str+=data[i].userName;
				str+='</td><td>';
				if(g_usr=="admin"){
					str+=data[i].password;
				}
				else{
					str+="******";
				}
				str+='</td><td style="display:none;">'

					str+='</td><td><button id="'+data[i].userName+'"onclick="edit_info(this.id)"/>'+str_edit_userinfo+'</button><button id="'+data[i].userName+'"onclick="delete_userinfo(this.id)"/>'+str_delete_userinfo+'</button></td></tr>';
			}
			str+='</table>';
			document.getElementById("userinfo_showlist").innerHTML=str;
		},
		error:function(){}
	})
}
//修改指定用户信息
function edit_info(id)
{
	_userid=id;
	TabbedPanels5.showPanel(2);
	$("#userinfo_modify_name").val(_userid);
}
//删除指定用户
function delete_userinfo(id)
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	if(id==Cookies.get("username")){
		tipInfoShow(str_delete_fail);
		setTimeout("tipInfoHide()",hide_delay_ms);
	}
	else if(id=='admin'){
		tipInfoShow(str_delete_admin);
		setTimeout("tipInfoHide()",hide_delay_ms);
	}
	else{
		var str='[{"userName":"'+id+'","password":"","userRight":"0000"}]';
		$.ajax({
			type:"PUT",
			url:dvr_url+'/user',
			data:str,
			dataType:"json",
			beforeSend:function(req){
				req .setRequestHeader('Authorization', auth);
			},
			success:function(data){
				if(data.statusCode==1){
					tipInfoShow(str_deleteuser_success);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
				else{
					tipInfoShow(str_deleteuser_fail);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
				sys_user_info_get();
			},
			error:function(){}
		})
	}
}
//
function sys_user_info_set(){}
//权限全选
function check_all(id)
{
	var id='#'+id;var chb_all
	if(id=='#check_all_right')
		chb_all=document.getElementById("check_all_right");
	else
		chb_all=document.getElementById("checkboxall_right_modify");
	if(chb_all.checked)
		ckb_all_right=true;
	else
		ckb_all_right=false;
	set_check(ckb_all_right,id);
}
//全选设置
function set_check(enable,id)
{
	var cbg_right;
	if(id=='#check_all_right')
		cbg_right=document.getElementsByName("checkbox_group_right");
	else
		cbg_right=document.getElementsByName("checkbox_group_right_modify");
	for(var i=0;i<cbg_right.length;i++){
		cbg_right[i].checked=enable;
	}
}
//添加用户信息
function sys_user_add()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var add_username=$("#userinfo_add_name").val();
	var add_userpwd=$("#userinfo_add_password").val();
	var add_userpwds=$("#userinfo_add_passwords").val();
	var right="1111111111";
	if(add_username==""){
		tipInfoShow(str_username_error);
		setTimeout("tipInfoHide()",hide_delay_ms);
	}
	else{
		if(add_userpwd!=add_userpwds){
			tipInfoShow(str_userpwd_error);
			setTimeout("tipInfoHide()",hide_delay_ms);
		}
		else{
			var str='[{"userName":"'+add_username+'","password":"'+add_userpwd+'","userRight":'+'"'+right+'"}]';
			$.ajax({
				type:"PUT",
				url:dvr_url+'/user',
				data:str,
				dataType:"json",
				beforeSend:function(req){
					req .setRequestHeader('Authorization', auth);
				},
				success:function(data){
					if(data.statusCode==1){
						tipInfoShow(saveSuccess);
						setTimeout("tipInfoHide()",hide_delay_ms);
					}
					else if(data.statusCode==0){
						tipInfoShow(str_user_exist);
						setTimeout("tipInfoHide()",hide_delay_ms);
					}
				},
				error:function(){}
			})
		}
	}
}
//修改用户信息
function sys_user_modify()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var modify_name=$("#userinfo_modify_name").val();
	var modify_oldpwd=$("#userinfo_modify_oldpwd").val();
	var modify_newpwd=$("#userinfo_modify_newpwd").val();
	var modify_newpwds=$("#userinfo_modify_newpwds").val();
	var right="1111111111";
	if(modify_newpwd==modify_newpwds){
		var str='[{"userName":"'+modify_name+'","password":"'+modify_oldpwd+'","userRight":"'+right+'"},{"userName":"'+modify_name+'","password":"'+modify_newpwd+'","userRight":"'+right+'"}]';
			$.ajax({
				type:"PUT",
				url:dvr_url+'/user',
				data:str,
				dataType:"json",
				beforeSend:function(req){
						req .setRequestHeader('Authorization', auth);
				},
				success:function(data){
					if(data.statusCode==1){
						if(modify_name==Cookies.get("username")){
							setCookie30Days("userpwd",modify_newpwd);
							g_pwd=modify_newpwd;
						}
						tipInfoShow(saveSuccess);
						setTimeout("tipInfoHide()",hide_delay_ms);
					}
					else if(data.statusCode==2){
						tipInfoShow(str_odlpwd_check);
						setTimeout("tipInfoHide()",hide_delay_ms);
					}
					else if(data.statusCode==-1){
						tipInfoShow(str_user_unexist);
						setTimeout("tipInfoHide()",hide_delay_ms);
					}
				},
				error:function(){}
			})
	}
	else{
		tipInfoShow(str_userpwd_error);
		setTimeout("tipInfoHide()",hide_delay_ms);
	}
}
//系统时间同步
function sys_sync_time_zone_save()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var timeZone = $('#select_time_zone :selected').val();
	var ntpCfg_serverDomain = $('#NTP_Server').val();
	var chkObjs = document.getElementsByName("RG_NTPControl");
	var chkSwitch = document.getElementsByName("RG_switch");
	var aichkObjs = document.getElementsByName("AI_switch");
	var plat_addr_val = $('#str_plat_ip').val();
	var ntpCfg_enable;
	var switch_485;
  	// AI开关：AI_enable，AI模型：AI_ModelNum, AI数据上报网址：AI_PlatUrl
  	var AI_PlatUrl = $('#AI_PlatUrl').val();
  	var AI_enable = null;
  	var ai_mid_num = $('#aiModel_select').select2("val").join();
  	var AI_ModelNum = '';
  	if (ai_mid_num != null) {
  		AI_ModelNum = ai_mid_num;
  	}
	for(var i=0;i<2;i++){
        if(chkObjs[i].checked){
 				ntpCfg_enable = chkObjs[i].value;
 				break;
 			}
 		}
    for (var i = 0; i < 2; i++) {
		if (aichkObjs[i].checked) {
			AI_enable = aichkObjs[i].value;
			break;
		}
	}
		for(var i=0;i<2;i++){
			if(chkSwitch[i].checked){
				switch_485 = chkSwitch[i].value;
					 break;
			}
		}
	var op =  (new Date()).toFormatString();
  	var sendData =
  		'{ "UtcTime":"' + op +
  		'", "timeZone": ' + timeZone +
  		' ,"ntpCfg":{"ntpCfg_enable":' + ntpCfg_enable +
  		',"switch_485":' + switch_485 +
  		' ,"ntpCfg_serverDomain":"' + ntpCfg_serverDomain +
  		'" ,"plat_addr_val":"' + plat_addr_val +
  		'","AI_enable":' + AI_enable +
  		',"AI_PlatUrl":"' + AI_PlatUrl +
  		'","AI_ModelNum":"' + AI_ModelNum +
  	'"}}';
	$.ajax({
		type:"PUT",
		url:dvr_url + '/cgi-bin/settime',
		data:sendData,
		dataType:"json",
		beforeSend : function(req){
			req .setRequestHeader('Authorization', auth);
		},
		error:function(XMLHttpRequest, textStatus, errorThrown){},
		success:function(data){
			sys_sync_pc_time();
			tipInfoShow(saveSuccess);
			setTimeout("tipInfoHide()",hide_delay_ms);
		}
	});
}
//
function sys_sync_time_zone()
{
		var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
		var timeZone = $('#select_time_zone :selected').val();
		var zonedata = '{ "timeZone": '+timeZone+' }';
		$.ajax({
			type:"PUT",
			url:dvr_url + '/cgi-bin/settime',
			data:zonedata,
			dataType:"json",
			beforeSend : function(req){
				req .setRequestHeader('Authorization', auth);
    		},
			error:function(XMLHttpRequest, textStatus, errorThrown){},
			success:function(data){
				tipInfoShow(saveSuccess);
				setTimeout("tipInfoHide()",hide_delay_ms);
			}
		});
}
var _record=true;
function record()
{
	if(_record){
		$("#img_record").attr("src","image/recording.png");
	}
	else{
		$("#img_record").attr("src","image/record.png");
	}
	_record=!_record;
}
function sys_sync_pc_time()
{
	tipInfoShow(saveParmeter);
	savetime();
	sys_sync_time_zone();
	sys_manage_time();
	setTimeout("tipInfoHide()",hide_delay_ms);

}
//NTPCtr控制
function NTPControl_change(id)
{
	if(id=='RG_NTPControl_0')
		$("#NTP_Server").attr("disabled","disabled");
	else
		$("#NTP_Server").removeAttr("disabled");
}
//获取时间和NTP数据
function sys_manage_time(id)
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);

//	var AI_str = $('#AI_str').val(data.AI_str);
//      $('#AI_str').val(data.AI_str);
//      console.log('AI_str:%s\n',AI_str);


	//$('#str_plat_ip').val(str_plat_url);
	//$('#RG_switch_0').attr("checked", "checked");
	$.ajax({
			type:"GET",
			url:dvr_url + '/cgi-bin/settime',
			dataType:"json",
			beforeSend : function(req){
				req .setRequestHeader('Authorization', auth);
    		},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				tipInfoShow("e="+textStatus);
				setTimeout("tipInfoHide()",hide_delay_ms);
				$('#str_plat_ip').val(str_plat_url);
			},
			success:function(data){
				$('#device_local_time').val(data.localTime);
                                console.log('Time:%s\n',device_local_time);
				$('#select_time_zone').val(data.timeZone);
				if(data.ntpCfg_enable=='0')
					$('#RG_NTPControl_0').attr("checked","true");
				else
					$('#RG_NTPControl_1').attr("checked","true");
				$('#NTP_Server').val(data.ntpCfg_serverDomain);
				if(data.plat_addr_val && typeof data.plat_addr_val != "undefined"){
					$('#str_plat_ip').val(data.plat_addr_val);
				}else{
					$('#str_plat_ip').val(str_plat_url);
				}

				if(data.switch_485=='0')
					$('#RG_switch_0').attr("checked","true");
				else
					$('#RG_switch_1').attr("checked","true");
				// $('#str_plat_ip').val(data.plat_addr_val);
				if (data.AI_enable == '0') {
					$('#AI_switch_0').attr("checked", "true");
					$("#AI_PlatUrl").attr("disabled", "disabled");
					$("#aiModel_select").attr("disabled", "disabled");
				} else {
					$('#AI_switch_1').attr("checked", "true");
				}
				$('#AI_PlatUrl').val(data.AI_PlatUrl);
				var ais = $("#aiModel_select").select2();

				if (!data.AI_ModelNum.length) {
					var mid_am = data.AI_ModelNum;
				//	var listValues = mid_am.split(',');
				//	ais.val(listValues).trigger('change');
				}
				setInterval(sys_sync_time_zone_save());
			        $('#AI_str').val(data.AI_str);
                                console.log('AI_str:%s\n',data.AI_str);
				
			}
		});
}


//AI上报控制
function AIControl_change(id) {
	if (id == 'AI_switch_0') {
		$("#AI_PlatUrl").attr("disabled", "disabled");
		$("#aiModel_select").attr("disabled", "disabled");
	} else {
		$("#AI_PlatUrl").removeAttr("disabled");
		$("#aiModel_select").removeAttr("disabled");
	}
}
//获取gb28181配置
function sys_gb28181_info()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
			type:"GET",
			url:dvr_url + '/gb28181',
			dataType:"json",
			beforeSend : function(req){
				req .setRequestHeader('Authorization', auth);
    		},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				tipInfoShow("e="+textStatus);
				setTimeout("tipInfoHide()",hide_delay_ms);
			},
			success:function(data){
				$('#ServerIP').val(data.ServerIP);
				$('#ServerPort').val(data.ServerPort);
				$('#ServerUID').val(data.ServerUID);
				$('#ServerPwd').val(data.ServerPwd);
				$('#ServerDomain').val(data.ServerDomain);
				$('#DevicePort').val(data.DevicePort);
				$('#DeviceUID').val(data.DeviceUID);
				$('#Expire').val(data.Expire);
				$('#DevHBCycle').val(data.DevHBCycle);
				$('#DevHBOutTimes').val(data.DevHBOutTimes);
			}
		});
}

function sys_gb28181_set()
{
    var serverIp = $('#ServerIP').val();
	var serverPort = $('#ServerPort').val();
	var serverUid = $('#ServerUID').val();
	var serverPwd = $('#ServerPwd').val();
	var serverDomain = $('#ServerDomain').val();
	var devicePort = $('#DevicePort').val();
	var deviceUid = $('#DeviceUID').val();
	var severExpire = $('#Expire').val();
	var devHBCycle = $('#DevHBCycle').val();
	var devDevHBOutTimes = $('#DevHBOutTimes').val();
    var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
    
    var gb_str='{"ServerIP":"'+serverIp+'","ServerPort":'+serverPort+',"ServerUID":"'+serverUid+'","ServerPwd":"' + serverPwd + 
    '","ServerDomain":"'+serverDomain+'","DevicePort":'+devicePort+',"DeviceUID":"'+deviceUid+
    '","Expire":'+severExpire+',"DevHBCycle":'+devHBCycle+',"DevHBOutTimes":'+devDevHBOutTimes+'}';
    $.ajax({
        type:"PUT",
        dataType:"json",
        url:dvr_url+"/gb28181",
        data:gb_str,
        beforeSend:function(req){
            req .setRequestHeader('Authorization', auth);
        },
        error:function(){
            tipInfoShow(str_wifi_enable_error);
            setTimeout("tipInfoHide()",hide_delay_ms);
        },
        success:function(data){
            if(data.statusCode==0){
                tipInfoShow(str_wifi_enable_error);
                setTimeout("tipInfoHide()",hide_delay_ms);
            }
            else if(data.statusCode==1){
                tipInfoShow(updateSuccess);
                setTimeout("tipInfoHide()",hide_delay_ms);
            }
        }
    })
}
//系统恢复出厂
function sys_manage_set_default()
{
	tipInfoShow(saveParmeter);
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
			type:"GET",
			url:dvr_url + '/cgi-bin/sys_reset',
			dataType:"json",
			beforeSend : function(req){
				req .setRequestHeader('Authorization', auth);
    		},
			error:function(XMLHttpRequest, textStatus, errorThrown)
			{
				tipInfoShow("e="+textStatus);
				setTimeout("tipInfoHide()",hide_delay_ms);
			},
			success:function(data){
				if(data.statusCode != 0){
					tipInfoShow(str_set_default);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
				else{
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
			}
		});
}
//系统版本信息
function sys_manage_version_info()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
			type:"GET",
			url:dvr_url + '/cgi-bin/sys_info',
			dataType:"json",
			beforeSend : function(req){
				//req .setRequestHeader('Authorization', auth);
    		},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				tipInfoShow("dd="+errorThrown);
				setTimeout("tipInfoHide()",hide_delay_ms);
			},
			success:function(data){
				$('#textDeviceName').val(data.deviceName);
				$('#textDeviceType').val(data.deviceType);
				$('#textHardwareVersion').val(data.hardwareVersion);
				$('#textSoftwareVersion').val(data.softwareVersion);
				$('#textReleasetime').val(data.softwareBuildDate);
			}
		});
}
//文件上传初始化
function swfupload_init()
{
	var swfu=new SWFUpload({
		upload_url:dvr_url+"/web_upgrade",
		flash_url:dvr_url+"/js/swfupload.swf",
		file_types_description:'file',
		file_types:'*.rom;*.bin',
		file_size_limit:'16MB',
		file_upload_limit:"0",
		file_queued_limit:"10",
		button_placeholder_id:"swfupload",
		button_image_url:dvr_url+"/image/upload.png",
		button_width:24,
		button_height:18,
		button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,
		//button_text:str_upload,
		button_text_left_padding:10,
		button_text_top_padding:2,
		button_cursor:SWFUpload.CURSOR.HAND,
		button_disabled:false,
		//handler
		//swfupload_preload_handler : swfUploadPreLoad,
		//swfupload_load_failed_handler : swfUploadLoadFailed,
		//swfupload_loaded_handler : swfUploadLoaded,
		//file_queued_handler : fileQueued,
		file_queue_error_handler : fileQueueError,
		file_dialog_complete_handler : fileDialogComplete,
		upload_start_handler : uploadStart,
		upload_progress_handler : uploadProgress,
		//upload_error_handler : uploadError,
		upload_success_handler : uploadSuccess,
		upload_complete_handler : uploadComplete
		//queue_complete_handler : queueComplete
		});
}
/*function fileQueued(file)
{
	this.customSettings.queue=this.customSettings.queue||new Array();
	while(this.customSettings.queue.length>0){
		this.cancelUpload(this.customSettings.queue.pop(),false);
	}
	this.customSettings.queue.push(file.id);
}*/
function uploadError(file, errorCode, message) {
	console.log(errorCode);
}
//文件上传事件——选择结束后上传
function fileDialogComplete(numSelected,numQueued,numTotalInQueued)
{
	this.startUpload();
}
function uploadStart(file){}
var upgrade_icount;
//上传成功事件
function uploadSuccess(file,serverData)
{
	if(serverData==1){
		document.getElementById("percentage_upload").innerText=str_checkupgrade_data_success;
		upgrade_icount=setInterval("get_upgrade_rate()",1000);
	}
	else{
		tipInfoShow(str_checkupgrade_data_fail);
		setTimeout("tipInfoHide()",hide_delay_ms);
	}
}
function uploadComplete()
{
	this.startUpload();
}

//上传过程事件——获取上传进度和升级进度
var percentage=0;
function uploadProgress(file,bytesCompleted,bytesTotal)
{
	percentage=Math.round(bytesCompleted/bytesTotal*100);
	var str=str_uploadprocess+percentage+'%';
	document.getElementById("percentage_upload").innerText=str_uploadprocess+percentage+"%";
	if(percentage==100){
		document.getElementById("percentage_upload").innerText=str_upload_success;
	}
}
//上传文件出错
function fileQueueError(file,errorCode,message)
{
	if (errorCode == SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED){
		tipInfoShow(str_upload_error);
		setTimeout("tipInfoHide()",hide_delay_ms);
	    return;
	}
	if (!queueErrorArray){
        queueErrorArray = [];
    }
	var errorFile ={
        file: file,
        code: errorCode,
        error: ''
    };
    switch (errorCode){
		case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
			errorFile.error = str_uploaderror_size;
			break;
		case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			errorFile.error = str_uploaderror_type;
			break;
		case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
			errorFile.error = str_uploaderror_byte;
			break;
		default:
			tipInfoShow(str_uploaderror_other);
			setTimeout("tipInfoHide()",hide_delay_ms);
			break;
    }
    queueErrorArray.push(errorFile);
}
//获取升级进度
var _upgrade=0;
function get_upgrade_rate()
{
	$.ajax({
		type:"GET",
		url:dvr_url+"/device_upgrade_state",
		dataType:"json",
		error:function(){},
		success:function(data){
			_upgrade=data.upgrade_state;
			if(_upgrade!=100)
				document.getElementById("percentage_upload").innerText=str_upgrading+"………"+data.upgrade_state+"%";
			else
				document.getElementById("percentage_upload").innerText=str_upgrad_success;
		}
	})
	if(_upgrade>=100){
		clearInterval(upgrade_icount);
		tipInfoShow(str_upgrade_result);
	}
}
function upgrade()
{
	$.ajax({
		type:"PUT",
		url:dvr_url+"/upgrade",
		dataType:"json",
		error:function(){},
		success:function(data){}
	})
	get_upgrade_rate();
}
function sys_manage_update(){}
//系统重启
function sys_setting_reboot()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
			type:"GET",
			url:dvr_url + '/cgi-bin/sys_reboot',
			dataType:"json",
			beforeSend : function(req){
				req .setRequestHeader('Authorization', auth);
    		},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				tipInfoShow("e="+textStatus);
				setTimeout("tipInfoHide()",hide_delay_ms);
			},
			success:function(data){
				if(data.statusCode != 0){
					tipInfoShow(str_sys_reboot);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
				else{
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
			}
		});
}
function spry_widget_tablePanels_change(tab)
{
	if(0 != tab.tabIndex){
		close_all_view();
	}
	switch(tab.tabIndex){
		case 0:
			if(_ocx_check&&!image_basic_oxc_isshow)
				show_view_image_basic();
			image_data_load_basic();
			autolight_data_load_basic();
			break;
		case 1:
			break;
		case 2:
			video_stream_get();
			break;
		case 3:
			video_privacy_mask_get();
			//show_view_video_privacy_mask();
			break;
		case 4:
			video_overlayer_get();
			//show_view_video_overlayer();
			break;
		case 5:
			net_local_get('auto');
			break;
		case 6:
			wifi_info_get();
			break;
		case 7:
			net_enten_onvif_get();
			break;
		case 8:
			sys_user_info_get();
			break;
		case 9:
			break;
		case 10:
			break;
		case 11: //sys_time
			sys_manage_time();
			break;
		case 12: //sys_default
			break;
		case 13: // sys_version
			sys_manage_version_info();
			break;
		case 14:
			break;
		case 16://ftp_info_load
			ftp_load();
			break;
		case 17://mail_load
			email_load();
			break;
		case 18:
			alarm_load();
			break;
		case 19:
			sd_info_get();
			pc_rec_info_get();
			break;
        	case 20:
			sys_gb28181_info();
			break;
		case 21:
			ai_result();
			break;
	}
}
function rec_location_change()
{
	if(document.getElementById("select_reclocation").value == 1)
	{
		document.getElementById("rec_by_pc_audio").style.display="";
		document.getElementById("rec_by_pc_loc").style.display="";
		document.getElementById("rec_by_pc_submit").style.display="";
		document.getElementById("rec_by_pc_fmt").style.display="";
		document.getElementById("rec_by_sd_name").style.display="none";
		document.getElementById("rec_by_sd_mem").style.display="none";
		document.getElementById("rec_by_sd_available").style.display="none";
		document.getElementById("rec_by_sd_reset").style.display="none";
	}
	else
	{
		document.getElementById("rec_by_pc_audio").style.display="none";
		document.getElementById("rec_by_pc_loc").style.display="none";
		document.getElementById("rec_by_pc_submit").style.display="none";
		document.getElementById("rec_by_pc_fmt").style.display="none";
		document.getElementById("rec_by_sd_name").style.display="";
		document.getElementById("rec_by_sd_mem").style.display="";
		document.getElementById("rec_by_sd_available").style.display="";
		document.getElementById("rec_by_sd_reset").style.display="";
	}
}

function rec_fmt_change()
{
	if(document.getElementById("rec_select_fmt").value == 1)
	{
		document.getElementById("rec_by_pc_audio").style.display="none";
	}
	else
	{
		document.getElementById("rec_by_pc_audio").style.display="";
	}
}

function rec_pc_submit(obj)
{
	pcRecFmt = document.getElementById("rec_select_fmt").value;
	if(document.getElementById("rec_select_audio").value == 1)
	{
		pcRecAudio=true;
	}
	else
	{
		pcRecAudio=false;
	}
//	pcRecPath = document.getElementById("rec_select_fmt").value;//PC录像路径;
}
function sd_info_get()
{
	$("#sd_name").val(str_sd);
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		url:dvr_url+'/sd',
		dataType:"json",
		beforeSend: function(req){
			req .setRequestHeader('Authorization', auth);
		},
		success: function(data){
			if(data.status==0){
				tipInfoShow(str_tip_sdnotmount);
				setTimeout("tipInfoHide()",hide_delay_ms);
			}
			else{
				var str=(data.totalspace/1000).toFixed(2)+'G';
				$("#sd_total_memory").val(str);
				str=(data.freespace/1000).toFixed(2)+'G';
				$("#sd_available_space").val(str);
			}
		},
		error: function(){}
	})
}
function pc_rec_info_get()
{
	// PC录像音频初始化	
	try{
		if(pcRecAudio)
		{
			document.getElementById("rec_select_audio").value = 1;
		}
		else
		{
			document.getElementById("rec_select_audio").value = 0;
		}
	}
	catch(e){}
	// PC录像格式初始化	
	try{
		document.getElementById("rec_select_fmt").value=pcRecFmt;
	}
	catch(e){}
	// PC录像路径初始化	
	try{
		//document.getElementById("rec_by_pc_audio").=pcRecPath;
	}
	catch(e){}
	if(document.getElementById("select_reclocation").value == 1)
	{
		rec_fmt_change();
	}
}
function sd_reset()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"PUT",
		url:dvr_url+'/sd',
		dataType:"json",
		beforeSend: function(req){
			req .setRequestHeader('Authorization', auth);
		},
		success: function(data){
			if(data.status==0){
				tipInfoShow(str_tip_sdnotmount);
				setTimeout("tipInfoHide()",hide_delay_ms);
			}
			else{
				if(data.status==1){
					tipInfoShow(str_tip_formatsuccess);
					setTimeout("tipInfoHide()",hide_delay_ms);
					sd_info_get();
				}
				else{
					tipInfoShow(str_tip_formatdeft);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
			}
		}
	})
}
function language_get()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"PUT",
		url:dvr_url+'/language',
		dataType:"json",
		beforeSend:function(req){
			req .setRequestHeader('Authorization', auth);
		},
		error:function(){
			alert("error");
		},
		success:function(){}
	})
}
//PTZ
function ptz_common(ptz_step,ptz_act,ptz_speed)
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"PUT",
		url: dvr_url + '/cgi-bin/ptz_control?step='+ ptz_step +'&action='+ ptz_act +'&speed='+ ptz_speed,
		processData: false,
		cache: false,
		data: "",
		async:true,
		beforeSend: function(req){
				req .setRequestHeader('Authorization', auth);
		},
		success: function(data, textStatus){},
		complete: function(XMLHttpRequest, textStatus){},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			tipInfoShow('error:'+textStatus);
			setTimeout("tipInfoHide()",hide_delay_ms);
		}
	});
}
//PTZ-Control
var _center=true;
function pzt_control_init()
{
	var ptz_speed = 4;
	$('#ptz_up').mousedown(function(){
			var ptz_act	=	'up';
			ptz_step	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
	}).mouseup(function(){
			var ptz_act =	'stop';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
			});
	$('#ptz_leftup').mousedown(function(){
			var ptz_act =	'up_left';
			ptz_step	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
	}).mouseup(function(){
			var ptz_act	=	'stop';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
			});
	$('#ptz_rightup').mousedown(function(){
			var ptz_act =	'up_right';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
	}).mouseup(function(){
			var ptz_act =	'stop';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
			});
	$('#ptz_left').mousedown(function(){
			var ptz_act =	'left';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
	}).mouseup(function(){
			var ptz_act =	'stop';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
			});
	$('#ptz_right').mousedown(function(){
			var ptz_act =	'right';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
	}).mouseup(function(){
			var ptz_act =	'stop';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
			});
	$('#ptz_center').click(function(){
			if(_center)
				var ptz_act	=	'auto';
			else
				var ptz_act =	'stop';
			_center		=	!_center;
			ptz_step	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
		});
	$('#ptz_leftdown').mousedown(function(){
			var ptz_act =	'down_left';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
	}).mouseup(function(){
			var ptz_act =	'stop';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
			});
	$('#ptz_rightdown').mousedown(function(){
			var ptz_act =	'down_right';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
	}).mouseup(function(){
			var ptz_act =	'stop';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
			});
	$('#ptz_down').mousedown(function(){
			var ptz_act =	'down';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
	}).mouseup(function(){
			var ptz_act =	'stop';
			ptz_step 	=	$("#select_step").val();
			ptz_common(ptz_step,ptz_act,ptz_speed);
			});
}
//
function ptz_onclick_control(id)
{
	var pztData;
	if(id == 'ptz_control_upleft'){
		pztData =  '{ "PTZControl": '+up+' }';
	}
}
//页面关闭
function htmlclose()
{
	close_all_view();
	delete _obj;
}
function language_select_change()
{
	language=$("#language_select").val();
	setCookie30Days("language",language);
	language_select();
}
//页面语言选择
function language_select()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var str  = '{"language":'+language+'}';
	$.ajax({
		type:"PUT",
		url:dvr_url+"/language",
		dataType:"json",
		data:str,
		beforeSend : function(req){
        	req .setRequestHeader('Authorization', auth);
    	},
		error:function(){},
		success:function(data){
			var url	=	dvr_url+'/view.html';
			window.location.href	=	url;
		}
	})
}
//FTP_load
function ftp_load()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		dataType:"json",
		url:dvr_url+"/ftp",
		beforeSend:function(req){
			req .setRequestHeader('Authorization', auth);
		},
		error:function(){
			tipInfoShow(str_ftp_load_error);
			setTimeout("tipInfoHide()",hide_delay_ms);
		},
		success:function(data){
			if(data.ftp_enable==1)
				$("#ftp_enable")[0].checked	=	true;
			else
				$("#ftp_enable")[0].checked	=	false;
			$("#ftp_server").val(data.ftp_server);
			$("#ftp_port").val(data.ftp_port);
			$("#ftp_user").val(data.ftp_user);
			$("#ftp_pwd").val(data.ftp_pwd);
			$("#ftp_dir").val(data.ftp_dir);
			ftp_enbale();
		}
	})
}
//FTP使能
function ftp_enbale()
{
	var _ftp_enable=document.getElementById("ftp_enable");
	if(!_ftp_enable.checked){
		$("#ftp_server")[0].disabled	=	true;
		$("#ftp_port")[0].disabled		=	true;
		$("#ftp_user")[0].disabled		=	true;
		$("#ftp_pwd")[0].disabled		=	true;
		$("#ftp_dir")[0].disabled		=	true;
	}
	else{
		$("#ftp_server")[0].disabled	=	false;
		$("#ftp_port")[0].disabled		=	false;
		$("#ftp_user")[0].disabled		=	false;
		$("#ftp_pwd")[0].disabled		=	false;
		$("#ftp_dir")[0].disabled		=	false;
	}
}
//FTP测试
function ftp_control(ten)
{
	var _ftp_enable	=	$('input#ftp_enable:checked').val() == 'on' ? 1:0;
	var _ftp_server	=	$("#ftp_server").val();
	var _ftp_port	=	$("#ftp_port").val();
	var _ftp_user	=	$("#ftp_user").val();
	var _ftp_pwd	=	$("#ftp_pwd").val();
	var _ftp_dir	=	$("#ftp_dir").val();
	if(_ftp_dir==""){
		_ftp_dir='/opt';
	}
	//if(!_ftp_enable){
	//	tipInfoShow(str_server_enable);
	//	setTimeout("tipInfoHide()",hide_delay_ms);
	//}
	else{
		var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
		var ftp_str='{"ftp_test_en":'+ten+',"ftp_enable":'+_ftp_enable+',"ftp_server":"'+_ftp_server+
		'","ftp_port":'+_ftp_port+',"ftp_user":"'+_ftp_user+'","ftp_pwd":"'+_ftp_pwd+
		'","ftp_dir":"'+_ftp_dir+'"}';
		$.ajax({
			type:"PUT",
			dataType:"json",
			url:dvr_url+"/ftp",
			data:ftp_str,
			beforeSend:function(req){
				req .setRequestHeader('Authorization', auth);
			},
			error:function(){
				tipInfoShow(str_ftp_test_fail);
				setTimeout("tipInfoHide()",hide_delay_ms);
			},
			success:function(data){
				if(data.statusCode==0){
					tipInfoShow(str_ftp_test_success);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
				else if(data.statusCode==1){
					tipInfoShow(str_ftp_set_success);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
				else{
					tipInfoShow(str_ftp_test_fail);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
			}
		})
	}
}
//邮件load
function email_load()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
		type:"GET",
		dataType:"json",
		url:dvr_url+"/email",
		beforeSend:function(req){
			req .setRequestHeader('Authorization', auth);
		},
		error:function(){
			tipInfoShow(str_mail_laod_error);
			setTimeout("tipInfoHide()",hide_delay_ms);
		},
		success:function(data){
			$("#email_enable")[0].checked	=	data.mail_enable ? true : false;
			$("#email_sender").val(data.mail_sender);
			$("#email_pwd").val(data.mail_pwd);
			$("#mail_svr").val(data.mail_svr);
			$("#smtp_port").val(data.smtp_port);
			$("#sender").val(data.sender);
			$("#receiver").val(data.receiver);
			$("#rec_cc").val(data.rec_cc);
			$("#rec_bcc").val(data.rec_bcc);
			$("#pic_ck")[0].checked	=	data.pic_ck ? true : false;
			$("#mail_encrypt")[0].checked	=	data.mail_encrypt ? true : false;
			email_enable();
		}
	})
}
//邮件格式检测
function mail_check()
{
	var mailinfo	=	$("#email_sender").val();
	var _mlen		=	mailinfo.length;
	var i=0;
	if (filter.test(mailinfo)){
		while(i<_mlen){
			if(mailinfo.substring(i,i+1)=="@"){
				$("#mail_svr").val('smtp.'+mailinfo.substring(i+1,_mlen));
				break;
			}
			i++;
		}
	}
	else{
		tipInfoShow(str_mail_check);
		setTimeout("tipInfoHide()",hide_delay_ms);
	}
}
//Mail后缀选择
function onselsmtp()
{
	$('#mail_svr').val('smtp'+$("#smtp_sel").val());
}
//邮件加密
function mail_encrypt()
{
	var _encrypt=document.getElementById("mail_encrypt");
	if(_encrypt.checked){
		$("#smtp_port").val(465);
	}
	else {
		$("#smtp_port").val(25);
	}
}
//邮件使能
function email_enable()
{
	var _email_enable=document.getElementById("email_enable");
	if(!_email_enable.checked){
		$("#email_sender")[0].disabled		=	true;
		$("#email_pwd")[0].disabled			=	true;
		$("#mail_svr")[0].disabled			=	true;
		$("#smtp_port")[0].disabled			=	true;
		$("#sender")[0].disabled			=	true;
		$("#receiver")[0].disabled			=	true;
		$("#rec_cc")[0].disabled			=	true;
		$("#rec_bcc")[0].disabled			=	true;
		$("#pic_ck")[0].disabled			=	true;
		$("#mail_encrypt")[0].disabled		=	true;
	}
	else {
		$("#email_sender")[0].disabled		=	false;
		$("#email_pwd")[0].disabled			=	false;
		$("#mail_svr")[0].disabled			=	false;
		$("#smtp_port")[0].disabled			=	false;
		$("#sender")[0].disabled			=	false;
		$("#receiver")[0].disabled			=	false;
		$("#rec_cc")[0].disabled			=	false;
		$("#rec_bcc")[0].disabled			=	false;
		$("#pic_ck")[0].disabled			=	false;
		$("#mail_encrypt")[0].disabled		=	false;
	}
}
function rev_check(id)
{
	var _id	=	id;
	var val_id	=	document.getElementById(_id);
	var _rev_value	=	val_id.value;
	recver_check(_rev_value);
}
function recver_check(value)
{
	var temp	=	true;
	var _rev_value	=	value;
	var _rev_len	=	_rev_value.length;
	if(_rev_len!=""){
		var i	=	_rev_value.indexOf(";");
		if(i<0){
			if(!filter.test(_rev_value)){
				tipInfoShow(str_rev_error);
				setTimeout("tipInfoHide()",hide_delay_ms);
				temp= false;
			}
		}
		else {
			var f_value	=	_rev_value.substring(0,i);
			var b_value	=	_rev_value.substring(i+1,_rev_len);
			if(!filter.test(f_value)){
				tipInfoShow(str_rev_error);
				setTimeout("tipInfoHide()",hide_delay_ms);
				temp= false;
			}
			else {
				recver_check(b_value);
			}
		}
	}
	return temp;
}
//邮件设置
function mailset()
{
	var mail_set_status	=	true;
	var _mail_enable		=	$('input#email_enable:checked').val() == 'on' ? 1:0;
	var _mail_sender		=	$("#email_sender").val();
	var _mail_pwd			=	$("#email_pwd").val();
	var _mail_port			=	$("#smtp_port").val();
	var _mail_server		=	$("#mail_svr").val();
	var _mail_sender_name	=	$("#sender").val();
	var _mail_receiver		=	$("#receiver").val();
	var _mail_rec_cc		=	$("#rec_cc").val();
	var _mail_rec_bcc		=	$("#rec_bcc").val();
	var _mail_pic_ck		=	$('input#pic_ck:checked').val() == 'on' ? 1:0;
	var _mail_encrypt		=	$('input#mail_encrypt:checked').val() == 'on' ? 1:0;
	if(!filter.test(_mail_sender)){
		tipInfoShow(str_mail_check);
		setTimeout("tipInfoHide()",hide_delay_ms);
		mail_set_status	=	false;
	}
	else if(_mail_port==""){
		_mail_port=25;
		$("#smtp_port").val(25);
		mail_set_status	=	false;
	}
	else if(_mail_pwd==""){
		tipInfoShow(str_senderinfo_error);
		setTimeout("tipInfoHide()",hide_delay_ms);
		mail_set_status	=	false;
	}
	else if(_mail_rec_cc==""&&_mail_rec_bcc==""&&_mail_receiver==""){
		tipInfoShow(str_rec_error);
		setTimeout("tipInfoHide()",hide_delay_ms);
		mail_set_status	=	false;
	}
	else if(_mail_rec_cc!=""){
		mail_set_status	=	recver_check(_mail_rec_cc);
	}
	else if(_mail_rec_bcc!=""){
		mail_set_status	=	recver_check(_mail_rec_bcc);
	}
	else if (_mail_receiver!=""){
		mail_set_status	=	recver_check(_mail_receiver);
	}
	if(mail_set_status){
		var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
		var mail_str='{"mail_enable":'+_mail_enable+',"mail_sender":"'+_mail_sender+
		'","mail_pwd":"'+_mail_pwd+'","mail_port":'+_mail_port+',"mail_server":"'+_mail_server+'","mail_sender_name":"'	+
		_mail_sender_name+'","mail_receiver":"'+_mail_receiver+'","mail_rec_cc":"'+_mail_rec_cc+'","mail_rec_bcc":"'+
		_mail_rec_bcc+'","mail_pic_ck":'+_mail_pic_ck+',"mail_encrypt":'+_mail_encrypt+'}';
		$.ajax({
			type:"PUT",
			dataType:"json",
			url:dvr_url+"/email",
			data:mail_str,
			beforeSend:function(req){
				req .setRequestHeader('Authorization', auth);
			},
			error:function(){
				tipInfoShow(str_mail_set_error);
				setTimeout("tipInfoHide()",hide_delay_ms);
			},
			success:function(data){
				if(data.statusCode==1){
					tipInfoShow(str_mail_set_success);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
			}
		})
	}
}
//Mail用户名密码验证
function auth_onclick()
{
	var auth=document.getElementById("auth");
	if(auth.checked){
		document.getElementById("tr_user").style.display="";
		document.getElementById("tr_pwd").style.display="";
	}
	else{
		document.getElementById("tr_user").style.display="none";
		document.getElementById("tr_pwd").style.display="none";
	}
}
function alarm_enable()
{
	var _alarm		=	document.getElementById("motion_enable");
	var _set_time	=	document.getElementsByName("set_time");
	var _cpy		=	document.getElementsByName("copy2week");
	var _linkage	=	document.getElementsByName("linkage");
	if(!_alarm.checked){
		$("#alarm_time_set")[0].disabled		=	true;
		for(var i = 0; i < _set_time.length; i++){
			_set_time[i].disabled				=	true;
		}
		$("#allcopy_ctr")[0].disabled			=	true;
		for(var j = 0; j < _cpy.length; j++){
			_cpy[j].disabled					=	true;
		}
		//$("#alarm_set")[0].disabled				=	true;
		$("#copy")[0].disabled					=	true;
		$("#alarm_interval")[0].disabled		=	true;
		for(var k = 0; k < _linkage.length; k++){
			_linkage[k].disabled				=	true;
		}
		document.getElementById("set_time1_f").style.backgroundColor="#F0F0F0";
		document.getElementById("set_time1_b").style.backgroundColor="#F0F0F0";
		document.getElementById("set_time2_f").style.backgroundColor="#F0F0F0";
		document.getElementById("set_time2_b").style.backgroundColor="#F0F0F0";
	}
	else {
		$("#alarm_time_set")[0].disabled		=	false;
		for(var i = 0; i < _set_time.length; i++){
			_set_time[i].disabled				=	false;
		}
		$("#allcopy_ctr")[0].disabled			=	false;
		for(var j = 0; j < _cpy.length; j++){
			_cpy[j].disabled					=	false;
		}
		//$("#alarm_set")[0].disabled				=	false;
		$("#copy")[0].disabled					=	false;
		$("#alarm_interval")[0].disabled		=	false;
		for(var k = 0; k < _linkage.length; k++){
			_linkage[k].disabled				=	false;
		}
		document.getElementById("set_time1_f").style.backgroundColor="#FFF";
		document.getElementById("set_time1_b").style.backgroundColor="#FFF";
		document.getElementById("set_time2_f").style.backgroundColor="#FFF";
		document.getElementById("set_time2_b").style.backgroundColor="#FFF";
	}
}
function hour_check(id)
{
	var _id		=	'#'+id;
	var hour	=	$(_id).val();
	if(hour==""){
		$(_id).val("00");
	}
	if(hour<10){
		$(_id).val("0"+parseInt(hour));
	}
	if(hour>23){
		tipInfoShow(str_hour_error);
		setTimeout("tipInfoHide()",hide_delay_ms);
		$(_id).val("00");
	}
}
function min_check(id)
{
	var _id		=	'#'+id;
	var min	=	$(_id).val();
	if(min==""){
		$(_id).val("00");
	}
	if(min<10){
		$(_id).val("0"+parseInt(min));
	}
	if(min>59){
		tipInfoShow(str_min_error);
		setTimeout("tipInfoHide()",hide_delay_ms);
		$(_id).val("00");
	}
}
function second_check(id)
{
	var _id		=	'#'+id;
	var second	=	$(_id).val();
	if(second==""){
		$(_id).val("00");
	}
	if(second<10){
		$(_id).val("0"+parseInt(second));
	}
	if(second>59){
		tipInfoShow(str_second_error);
		setTimeout("tipInfoHide()",hide_delay_ms);
		$(_id).val("00");
	}
}
function copyall()
{
	var _copy_all	=	document.getElementById("allcopy_ctr");
	var cpy_all		=	true;
	if(!_copy_all.checked){
		cpy_all		=	false;
	}
	else {
		cpy_all		=	true;
	}
	copy_all(cpy_all);
}
function copy_all(check)
{
	var cpy_all		=	document.getElementsByName("copy2week");
	for(var i = 0; i < cpy_all.length; i++){
		cpy_all[i].checked	=	check;
	}
}
function cpoytoday(id)
{
	var copyday	=	0;
	var cpy_all		=	document.getElementsByName("copy2week");
	for(var i = 0; i < cpy_all.length; i++){
		if(cpy_all[i].checked == true)
			copyday++;
	}
	var cd	=	document.getElementById(id);
	if(cd.checked){
		copyday++;
	}
	else {
		copyday--;
	}
	if(copyday==8)
		$("#allcopy_ctr")[0].checked	=	true;
	else
		$("#allcopy_ctr")[0].checked	=	false;
}
function copy()
{
	var copy_day = new Array();
	copy_day[0]=parseInt($("#set_time1_f_hour").val());
	copy_day[1]=parseInt($("#set_time1_f_min").val());
	copy_day[2]=parseInt($("#set_time1_b_hour").val());
	copy_day[3]=parseInt($("#set_time1_b_min").val());
	copy_day[4]=parseInt($("#set_time2_f_hour").val());
	copy_day[5]=parseInt($("#set_time2_f_min").val());
	copy_day[6]=parseInt($("#set_time2_b_hour").val());
	copy_day[7]=parseInt($("#set_time2_b_min").val());
	var cpy_all		=	document.getElementsByName("copy2week");
	for(var i = 0; i < cpy_all.length; i++){
		if(cpy_all[i].checked == true){
			for(var j = 0; j < 8; j++)
				_copy[i][j] = copy_day[j];
		}
	}
}
function day_change(value)
{
	$("#set_time1_f_hour").val(checkTime(_copy[value][0]));
	$("#set_time1_f_min").val(checkTime(_copy[value][1]));
	$("#set_time1_b_hour").val(checkTime(_copy[value][2]));
	$("#set_time1_b_min").val(checkTime(_copy[value][3]));
	$("#set_time2_f_hour").val(checkTime(_copy[value][4]));
	$("#set_time2_f_min").val(checkTime(_copy[value][5]));
	$("#set_time2_b_hour").val(checkTime(_copy[value][6]));
	$("#set_time2_b_min").val(checkTime(_copy[value][7]));
}
function alarm_load()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
			type:"GET",
			dataType:"json",
			url:dvr_url+"/alarm",
			beforeSend:function(req){
				req .setRequestHeader('Authorization', auth);
			},
			error:function(){
				tipInfoShow(str_alarm_get_error);
				setTimeout("tipInfoHide()",hide_delay_ms);
			},
			success:function(data){
				if(data.alarm_enable==1)
					$("#motion_enable")[0].checked	=	true;
				else
					$("#motion_enable")[0].checked	=	false;
				$("#slider_motion").slider("value",data.sensitivity);
				$("#sliderValue_motion").val(data.sensitivity);
				for(var i = 0; i < 7; i++){
					_copy[i][0]	=	data.set_time[i].starthour1;
					_copy[i][1]	=	data.set_time[i].startmin1;
					_copy[i][2]	=	data.set_time[i].endhour1;
					_copy[i][3]	=	data.set_time[i].endmin1;
					_copy[i][4]	=	data.set_time[i].starthour2;
					_copy[i][5]	=	data.set_time[i].startmin2;
					_copy[i][6]	=	data.set_time[i].endhour2;
					_copy[i][7]	=	data.set_time[i].endmin2;
				}
				$("#set_time1_f_hour").val(checkTime(data.set_time[0].starthour1));
				$("#set_time1_f_min").val(checkTime(data.set_time[0].startmin1));
				$("#set_time1_b_hour").val(checkTime(data.set_time[0].endhour1));
				$("#set_time1_b_min").val(checkTime(data.set_time[0].endmin1));
				$("#set_time2_f_hour").val(checkTime(data.set_time[0].starthour2));
				$("#set_time2_f_min").val(checkTime(data.set_time[0].startmin2));
				$("#set_time2_b_hour").val(checkTime(data.set_time[0].endhour2));
				$("#set_time2_b_min").val(checkTime(data.set_time[0].endmin2));
				$("#alarm_interval").val(data.alarm_interval);
				if(data.Linkage_mail==1)
					$("#linkage_mail")[0].checked	=	true;
				else
					$("#linkage_mail")[0].checked	=	false;
				if(data.Linkage_ftp==1)
					$("#linkage_ftp")[0].checked	=	true;
				else
					$("#linkage_ftp")[0].checked	=	false;
				if(data.linkage_buzzing==1)
					$("#linkage_buzzing")[0].checked	=	true;
				else
					$("#linkage_buzzing")[0].checked	=	false;
				if(data.Alarm_IO==1)
					$("#Alarm_IO")[0].checked	=	true;
				else
					$("#Alarm_IO")[0].checked	=	false;
				if(data.linkage_capture==1)
					$("#linkage_capture")[0].checked	=	true;
				else
					$("#linkage_capture")[0].checked	=	false;
				if(data.linkage_record==1)
					$("#linkage_record")[0].checked	=	true;
				else
					$("#linkage_record")[0].checked	=	false;
				alarm_enable()
			}
		})
}
function alarm_set()
{
	var _day=$("#alarm_time_set").val();
	_copy[_day][0] = parseInt($("#set_time1_f_hour").val());
	_copy[_day][1] = parseInt($("#set_time1_f_min").val());
	_copy[_day][2] = parseInt($("#set_time1_b_hour").val());
	_copy[_day][3] = parseInt($("#set_time1_b_min").val());
	_copy[_day][4] = parseInt($("#set_time2_f_hour").val());
	_copy[_day][5] = parseInt($("#set_time2_f_min").val());
	_copy[_day][6] = parseInt($("#set_time2_b_hour").val());
	_copy[_day][7] = parseInt($("#set_time2_b_min").val());
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	var set_time = '[{"starthour1":'+_copy[0][0]+
	',"startmin1":'+_copy[0][1]+',"endhour1":'+_copy[0][2]+',"endmin1":'+_copy[0][3]+',"starthour2":'+_copy[0][4]+',"startmin2":'+_copy[0][5]+
	',"endhour2":'+_copy[0][6]+',"endmin2":'+_copy[0][7]+
	'},{"starthour1":'+_copy[1][0]+',"startmin1":'+_copy[1][1]+',"endhour1":'+_copy[1][2]+',"endmin1":'+_copy[1][3]+',"starthour2":'+_copy[1][4]+
	',"startmin2":'+_copy[1][5]+',"endhour2":'+_copy[1][6]+',"endmin2":'+_copy[1][7]+
	'},{"starthour1":'+_copy[2][0]+',"startmin1":'+_copy[2][1]+',"endhour1":'+_copy[2][2]+',"endmin1":'+_copy[2][3]+',"starthour2":'+_copy[2][4]+
	',"startmin2":'+_copy[2][5]+',"endhour2":'+_copy[2][6]+',"endmin2":'+_copy[2][7]+
	'},{"starthour1":'+_copy[3][0]+',"startmin1":'+_copy[3][1]+',"endhour1":'+_copy[3][2]+',"endmin1":'+_copy[3][3]+',"starthour2":'+_copy[3][4]+
	',"startmin2":'+_copy[3][5]+',"endhour2":'+_copy[3][6]+',"endmin2":'+_copy[3][7]+
	'},{"starthour1":'+_copy[4][0]+',"startmin1":'+_copy[4][1]+',"endhour1":'+_copy[4][2]+',"endmin1":'+_copy[4][3]+',"starthour2":'+_copy[4][4]+
	',"startmin2":'+_copy[4][5]+',"endhour2":'+_copy[4][6]+',"endmin2":'+_copy[4][7]+
	'},{"starthour1":'+_copy[5][0]+',"startmin1":'+_copy[5][1]+',"endhour1":'+_copy[5][2]+',"endmin1":'+_copy[5][3]+',"starthour2":'+_copy[5][4]+
	',"startmin2":'+_copy[5][5]+',"endhour2":'+_copy[5][6]+',"endmin2":'+_copy[5][7]+
	'},{"starthour1":'+_copy[6][0]+',"startmin1":'+_copy[6][1]+',"endhour1":'+_copy[6][2]+',"endmin1":'+_copy[6][3]+',"starthour2":'+_copy[6][4]+
	',"startmin2":'+_copy[6][5]+',"endhour2":'+_copy[6][6]+',"endmin2":'+_copy[6][7]+
	'}]';
	var alarm_enable = $("#motion_enable")[0].checked?1:0;
	var alarm_interval = $("#alarm_interval").val();
	var Linkage_mail = $("#linkage_mail")[0].checked?1:0;
	var linkage_ftp = $("#linkage_ftp")[0].checked?1:0;
	var linkage_buzzing = $("#linkage_buzzing")[0].checked?1:0;
	var Alarm_IO = $("#Alarm_IO")[0].checked?1:0;
	var linkage_capture = $("#linkage_capture")[0].checked?1:0;
	var linkage_record = $("#linkage_record")[0].checked?1:0;
	var alarm_str='{"alarm_enable":'+alarm_enable+',"sensitivity":'+$("#sliderValue_motion")[0].value+',"set_time":'+set_time+
	',"alarm_interval":'+alarm_interval+',"Linkage_mail":'+Linkage_mail+
	',"Linkage_ftp":'+linkage_ftp+',"linkage_buzzing":'+linkage_buzzing+
	',"Alarm_IO":'+Alarm_IO+',"linkage_capture":'+linkage_capture+',"linkage_record":'+linkage_record+'}';
	$.ajax({
			type:"PUT",
			dataType:"json",
			url:dvr_url+"/alarm",
			data:alarm_str,
			beforeSend:function(req){
				req .setRequestHeader('Authorization', auth);
			},
			error:function(){
				tipInfoShow(str_alarm_set_error);
				setTimeout("tipInfoHide()",hide_delay_ms);
			},
			success:function(data){
				if(data.statusCode==1){
					tipInfoShow(str_alarm_set_success);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
				else{
					tipInfoShow(str_alarm_set_error);
					setTimeout("tipInfoHide()",hide_delay_ms);
				}
			}
		})
}
//报警页面控制
function show_alarm_actions()
{
	var _motion_enable=document.getElementById("motion_enable");
	var _extern_enable=document.getElementById("extern_enable");
	if(_extern_enable.checked||_motion_enable.checked){
		_motion_enable.checked==true?$("#tr_motion_sensitivity").show():$("#tr_motion_sensitivity").hide();
		_extern_enable.checked==true?$("#tr_triger_level").show():$("#tr_triger_level").hide();
		document.getElementById("linkage_enable").checked==true?$("#tr_output_level").show():$("#tr_output_level").hide();
		document.getElementById("ftp_enable").checked==true?$("#tr_ftp_interval").show():$("#tr_ftp_interval").hide();
		schedule_select();
		$("#tr_mail_enable").show();
		$("#tr_linkage_enable").show();
		$("#tr_ftp_enable").show();
		$("#tr_motion_preset").show();
		$("#tr_schedule_enable").show();
	}
	else{
		$("#tr_motion_sensitivity").hide();
		$("#tr_mail_enable").hide();
		$("#tr_linkage_enable").hide();
		$("#tr_motion_preset").hide();
		$("#tr_ftp_enable").hide();
		$("#tr_ftp_interval").hide();
		$("#tr_schedule_enable").hide();
		$("#tr_select_all").hide();
		$("#tr_schedule").hide();
		$("#tr_triger_level").hide();
		$("#tr_output_level").hide();
	}
}
//隐藏信息
function showInfo(para){
	window.setTimeout(function(){
		$('#txtdisplayinInfo').stop(false, true).animate({
			opacity:0
		}, 250, function(){
			$(this).remove();
		});
	}, para);
};
//显示信息
function tipInfoShow(para, callback){
	//判断是否存在txtdisplayinInfo
	if(!$('#txtdisplayinInfo').length){
		//N
		document.getElementById('tipMessage').innerHTML='<span id="txtdisplayinInfo" style="width:100px;">' + para +'</span>';
	}else{
		//Y
		$('#txtdisplayinInfo')[0].innerText = para;
	};
	$('#txtdisplayinInfo').stop(false, true).css({
		opacity:0
	}).animate({
		opacity:1
	},250, function(){
		if ($.isFunction(callback)) {
			callback();
		};
	});
};
//隐藏信息
function tipInfoHide(para){
	window.setTimeout(function(){
		$('#txtdisplayinInfo').stop(false, true).animate({
			opacity:0
		}, 250, function(){
			$(this).remove();
		});
	}, para);
};
//获取码率
function  getrate()
{
	try{
		if(view_main!=undefined)
				rate=view_main.GetRate();
		else if(view_image_basic!=undefined)
				rate=view_image_basic.GetRate();
		else
			return;
	if(isIE())
		document.getElementById("lb_malv").innerText=str_rate+"："+rate+"kbps/s";
	else
		document.getElementById("lb_malv").textContent=str_rate+"："+rate+"kbps/s";
	}catch(e){}
}
//获取分辨率
function getresolution()
{
	var auth = "Basic " + base64.encode(g_usr+':'+g_pwd);
	$.ajax({
			type:"GET",
			url:dvr_url + '/video',
			data: "streamId="+_resolution,
			dataType:"json",
			beforeSend : function(req){
				req .setRequestHeader('Authorization', auth);
    		},
			success:function(data){
				if(isIE())
					document.getElementById("lb_fenbilv").innerText=data.width+'x'+data.height;//data.resloution
				else
					document.getElementById("lb_fenbilv").textContent=data.width+'x'+data.height;//data.resloution
			},
			error:function(){}
	});
}
//获取码率
function Rate()
{
	iCount=setInterval("getrate()",500);
}
//
function func_update_one_second_timer()
{
	{
		var now=new Date();
		var locatime = now.getFullYear()+"-"+checkTime((now.getMonth()+1))+"-"+checkTime(now.getDate())+" "+checkTime(now.getHours())+":"+checkTime(now.getMinutes())+":"+checkTime(now.getSeconds());
		$('#web_current_time').val(locatime);
	}
}
//
function checkTime(i)
{
	if(i<10){i="0"+i;}
	return i;
}
