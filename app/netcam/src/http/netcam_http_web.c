
#define _GNU_SOURCE
#include "stdio.h"
#include "string.h"
#include "unistd.h"
#include "time.h"
#include "stdlib.h"
#include "http_export.h"
#include "netcam_api.h"
#include "utility_api.h"
#include "mmc_api.h"
#include "sdk_sys.h"

#include "work_queue.h"




#define HTTP_WEB_OK "HTTP/1.1 200 OK"\
	"Server: IPC GK7101 HttpServer 1.0"\
	"Date: Sat, 19 Sep 2015 00:26:36 GMT"\
	"Content-Type: text/html"\
	"Cache-Control: no-cache"\
	"Connection: Keep-Alive"\
	"Content-Length: 19"\
	"{\"statusCode\": \"1\"}"

static int web_ptz_stop(int step, int speed);
static int web_ptz_auto(int step, int speed);
#define USER_CJSON_FILE "gk_user.cjson"

typedef struct
{
	char name[32];
	char ID[32];
}P2P_info;
static P2P_info run_p2p_id[5];

typedef struct
{
    char *action;
    int (*callBk)(int speed);
}PTZ_ActionT;

#include "ttl.h"

static PTZ_ActionT webPtzAction[]=
{
    {"stop",    web_ptz_stop},
    {"up",      pelco_set_up},
    {"up_left", pelco_set_left_top},
    {"up_right",pelco_set_right_top},
    {"left",    pelco_set_left},
    {"right",   pelco_set_right},
    {"auto",    web_ptz_auto},
    {"down",    pelco_set_down},
    {"down_left", pelco_set_left_bottom},
    {"down_right",pelco_set_right_bottom},
    {NULL,NULL},
};


static char* net_wifi_get(void)
{
	cJSON *ArrayObject = cJSON_CreateArray();
	cJSON *obj = cJSON_CreateObject();

	WIFI_SCAN_LIST_t list[20];
	int number = 20;
	int i;
	int linkIndex = -1;
	char *buffer = NULL;
	int tmp = 0;
	WIFI_LINK_INFO_t curlinkInfo;
	int linkFlag = 0;

	memset(list, 0, sizeof(list));


    if(netcam_net_wifi_get_devname() == NULL)
    {
		return NULL;
    }

	if(netcam_net_wifi_isOn() != 1)
	{
		PRINT_ERR("wifi is not start\n");
		return NULL;
	}

    netcam_net_wifi_start(runNetworkCfg.wireless.mode);

	if(netcam_net_wifi_get_scan_list(list,&number) < 0)
	{
		PRINT_INFO("wifi scan failed");

		return NULL;
	}
	PRINT_INFO("scan wifi reslut:%d",number);
	curlinkInfo.linkStatus = WIFI_CONNECT_FAIL;
	linkFlag = netcam_net_wifi_get_connect_info(&curlinkInfo);

	for(i = 0; i < number && list[i].vaild ; i++)
	{
        if(list[i].vaild == 1){
    		cJSON* Object = cJSON_CreateObject();
    		cJSON_AddItemToObject(Object, "ap_ssid", cJSON_CreateString(list[i].essid) );
    		cJSON_AddItemToObject(Object, "ap_mac", cJSON_CreateString(list[i].mac) );
			switch(list[i].security)
			{
				case WIFI_ENC_WEP_64_ASSII:
				case WIFI_ENC_WEP_128_ASSII:
				case WIFI_ENC_WEP_64_HEX:
				case WIFI_ENC_WEP_128_HEX:
					tmp = 1;
					break;
				case WIFI_ENC_WPAPSK_AES:
					tmp = 2;
					break;
				case WIFI_ENC_WPAPSK_TKIP:
					tmp = 3;
					break;
				case WIFI_ENC_WPA2PSK_AES:
					tmp = 4;
					break;
				case WIFI_ENC_WPA2PSK_TKIP:
					tmp = 5;
					break;
				default:
				case WIFI_ENC_NONE:
					tmp = 0;
					break;
			}

			cJSON_AddItemToObject(Object, "ap_security", cJSON_CreateNumber(tmp) );
            cJSON_AddItemToObject(Object, "ap_quality", cJSON_CreateNumber(list[i].quality) );
            //tmp = (list[i].mode == WIFI_MODE_INFRA) ? 0 : 1;
			tmp = 0;
			cJSON_AddItemToObject(Object, "ap_mode", cJSON_CreateNumber(tmp));
    		cJSON_AddItemToObject(Object, "ap_channel", cJSON_CreateNumber(list[i].channel) );
    		cJSON_AddItemToArray(ArrayObject, Object);
			//printf("name:%s,qua:%d,nosie:%d,level:%d\n",list[i].essid,list[i].quality,list[i].noise,list[i].level);

			if( linkFlag == 0 &&
				curlinkInfo.linkStatus == WIFI_CONNECT_OK &&
				strcmp(curlinkInfo.linkEssid,list[i].essid) == 0)
			{
				linkIndex = i;
			}
			//printf("id:%s, id2:%s,link:%d\n",curlinkInfo.linkEssid,list[i].essid,linkIndex);
		}

	}
	cJSON_AddItemToObject(obj,"list",ArrayObject);
	cJSON_AddNumberToObject(obj,"index",linkIndex);
	cJSON_AddNumberToObject(obj,"wifiEable",runNetworkCfg.wireless.enable);
	cJSON_AddNumberToObject(obj,"wifiDriverOk",runNetworkCfg.wifi.enable);

	buffer = cJSON_Print(obj);
	//printf("%s", buffer);
	cJSON_Delete(obj);

    return buffer;
}


static void *update_recv_http_body(int sockfd,int bodyLen,int *recLen)
{
	char *data;
	int reCount;
	int recvLen;
	int ret;
    PRINT_INFO("xxx BEFORE malloc for update\n");
	data = netcam_update_malloc(bodyLen);
	if(data == NULL)
	{
		PRINT_ERR("malloc,Memory is not enough, %s",strerror(errno));
		return NULL;
	}
    PRINT_INFO("xxx BEFORE malloc for update\n");

	reCount = 0;
	recvLen = 0;


	while(reCount < 700)
	{
		ret = recv(sockfd,data+recvLen,bodyLen-recvLen,0);

		if (ret <= 0)
		{
			reCount++;
			if(errno == EINTR)
			{
			  //PRINT_INFO(" send error1:%s\n",strerror(errno));
			}
			else if(errno == EAGAIN)
			{
			  //PRINT_INFO(" send error2:%s\n",strerror(errno));
				usleep(5000);
			}
			else
			{
				PRINT_INFO(" recv error3:%s\n",strerror(errno));
				reCount = 500;
			}
		}
		else
		{
			recvLen += ret;
			if(recvLen != bodyLen)
			{
				reCount = 0;
			}
		}
	}

	*recLen = recvLen;
	return data;


}
static int web_ptz_stop(int step, int speed)
{
    pelco_set_stop(); 
    return netcam_ptz_stop();
}

static int web_ptz_auto(int step, int speed)
{
	return netcam_ptz_hor_ver_cruise(speed);
}

#if 0
static char * get_method_string(int method)
{
    if(method == METHOD_GET)
    {
        return "Get";
    }
    else if(method == METHOD_PUT)
    {
        return "PUT";
    }
    else if(method == METHOD_POST)
    {
        return "POST";
    }
    {
        return "Other";
    }

}
#endif

int netcam_http_service(HTTP_OPS* ops)
{
	int authorized = 0;
	const char *prefix = "/netcam";
	const char *authTag = NULL;

	// check authorization
	authTag = ops->get_tag(ops, "Authorization");
	if(!authTag)
	{
		PRINT_INFO("No Authorization!!");
		// do something
	}
	else
	{
		prefix = "Basic ";
		if(0 == strncasecmp(prefix, authTag, strlen(prefix)))
		{
			// available base64 prefix detected
			const char *authBase64 = strdupa(authTag + strlen(prefix));
			int const authBase64Len = strlen(authBase64);
			char *authPlaint = alloca(authBase64Len);
			char *username = NULL, *password = NULL, *token = NULL;

			memset(authPlaint, 0, authBase64Len); // very important
			utility_base64_decode(authBase64, authPlaint, strlen(authBase64));

			username = strtok_r(authPlaint, ":", &token);
			if(NULL == username){
				username = "";
			}
			password = strtok_r(NULL, ":", &token);
			if(NULL == password){
				password = "";
			}
			// FIXME: freezing!!
			//PRINT_INFO("Authorization:%s<>%s\n", username, password);
			authorized = UserMatching_login( username,  password);
		}
	}

	return authorized;
}

static int web_time(HTTP_OPS* ops, void* arg)
{
    const char *buf;
    int bodyLen;
    cJSON *opt;
    int method = ops->get_method(ops);

    //PRINT_INFO("Method:%s\n",get_method_string(method));

	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
    if(method == METHOD_PUT)
    {
        char *timeString;
        cJSON *ret;
        int zone = INVALID_TIEM_ZONE;
        buf = (char *)ops->get_body(ops,&bodyLen);
        if(buf == NULL)
        {
            return HPE_RET_FAIL;
        }
        //PRINT_INFO("web content:%s",buf);
        opt = cJSON_Parse(buf);
        timeString = cJosn_Read_String(opt,"UtcTime");
        ret = cJSON_GetObjectItem(opt,"timeZone");
        if(ret != NULL)
        {
            zone = ret->valueint;
            zone *=60;
        }

		 ret = cJSON_GetObjectItem(opt,"ntpCfg");
        if(ret != NULL)
        {
		
			runSystemCfg.ntpCfg.enable = cJSON_GetObjectItem(ret,"ntpCfg_enable")->valueint;
			runSystemCfg.ntpCfg.enable485 = cJSON_GetObjectItem(ret,"switch_485")->valueint;
			runSystemCfg.ntpCfg.enableAI = cJSON_GetObjectItem(ret,"AI_enable")->valueint;
	//		runSystemCfg.ntpCfg.modelNum = cJSON_GetObjectItem(ret,"AI_ModelNum")->valuestring;
          	//	strncpy(runSystemCfg.ntpCfg.AIplat, cJSON_GetObjectItem(ret,"AI_str")->valuestring, sizeof(runSystemCfg.ntpCfg.AI_str)-1);
		//	printf("runSystemCfg.ntpCfg.AI_str ================= %s\n", runSystemCfg.ntpCfg.AI_str);


			if(runSystemCfg.ntpCfg.enable485)
			{
				printf("============485 open ===========");
			}
			strncpy(runSystemCfg.ntpCfg.serverDomain, cJSON_GetObjectItem(ret,"ntpCfg_serverDomain")->valuestring, sizeof(runSystemCfg.ntpCfg.serverDomain)-1);
			if(cJSON_GetObjectItem(ret,"plat_addr_val")->valuestring != NULL)
			{
				strncpy(runSystemCfg.ntpCfg.platurl, cJSON_GetObjectItem(ret,"plat_addr_val")->valuestring, sizeof(runSystemCfg.ntpCfg.platurl)-1);
				printf("runSystemCfg.ntpCfg.platurl ================= %s\n", runSystemCfg.ntpCfg.platurl);
			}
			if(cJSON_GetObjectItem(ret,"AI_PlatUrl")->valuestring != NULL)
			{
				strncpy(runSystemCfg.ntpCfg.AIplat, cJSON_GetObjectItem(ret,"AI_PlatUrl")->valuestring, sizeof(runSystemCfg.ntpCfg.AIplat)-1);
				printf("runSystemCfg.ntpCfg.AIplat ================= %s\n", runSystemCfg.ntpCfg.AIplat);
				strncpy(runSystemCfg.ntpCfg.modelNum, cJSON_GetObjectItem(ret,"AI_ModelNum")->valuestring, sizeof(runSystemCfg.ntpCfg.modelNum)-1);
				printf("runSystemCfg.ntpCfg.AI_ModelNum ================= %s\n", runSystemCfg.ntpCfg.modelNum);
			}
			system("pkill main");
			//new_system_call("cd /sharefs/bmp_region/Total-sock-to_1/out");
			char line[256];
			sprintf(line,"sh /sharefs/main_reboot.sh %s %s",runSystemCfg.ntpCfg.modelNum, runSystemCfg.ntpCfg.AIplat);
			system(line);
	}
	netcam_sys_set_time_zone_by_utc_string(timeString, zone);
	netcam_timer_add_task(netcam_sys_save, NETCAM_TIMER_TWO_SEC, SDK_FALSE, SDK_TRUE);
	cJSON_Delete(opt);
    }
    else
    {
        cJSON  *root = SystemCfgGetNTPJsonSting();//创建项目
        char localTime[64];
        char *sendData;

        int zone = 0;
        netcam_sys_get_local_time_string(localTime,&zone);
        //root=SystemCfgGetNTPJsonSting();
        //PRINT_INFO("zone:%d\n",zone);
        cJSON_AddNumberToObject(root, "timeZone", zone/60);
        cJSON_AddStringToObject(root, "localTime", localTime);
        sendData = cJSON_Print(root);
        //sendData = cJSON_Print(ntp);
        //PRINT_INFO("Time info:%s",sendData);
        ops->set_body_ex(ops,sendData,strlen(sendData));
        free(sendData);
        cJSON_Delete(root);

    }
    return HPE_RET_SUCCESS;
}

#ifdef MODULE_SUPPORT_GB28181
static int get_gb28181(HTTP_OPS* ops, void* arg)
{
    const char *buf;
    int bodyLen;
    cJSON *opt;
    int method = ops->get_method(ops);

    //PRINT_INFO("Method:%s\n",get_method_string(method));

	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
    if(method == METHOD_PUT)
    {
        char *ServerIP;
    	int  ServerPort;
    	char *ServerUID;
    	char *ServerPwd;
    	char *ServerDomain;
    	int  DevicePort;
    	char *DeviceUID;
    	int  Expire;
    	int  DevHBCycle;
    	int  DevHBOutTimes;
        char retData[256];
        GK_NET_GB28181_CFG gb28181Cfg;

        memset(&gb28181Cfg, 0, sizeof(gb28181Cfg));
        cJSON *ret;
        int zone = INVALID_TIEM_ZONE;
        buf = (char *)ops->get_body(ops,&bodyLen);
        if(buf == NULL)
        {
            return HPE_RET_FAIL;
        }
        //PRINT_INFO("web content:%s",buf);
        opt = cJSON_Parse(buf);
        ServerIP = cJosn_Read_String(opt,"ServerIP");
    	ServerPort = cJosn_Read_Int(opt,"ServerPort");
    	ServerUID = cJosn_Read_String(opt,"ServerUID");
    	ServerPwd = cJosn_Read_String(opt,"ServerPwd");
    	ServerDomain = cJosn_Read_String(opt,"ServerDomain");
        DevicePort = cJosn_Read_Int(opt,"DevicePort");
    	DeviceUID = cJosn_Read_String(opt,"DeviceUID");
    	Expire = cJosn_Read_Int(opt,"Expire");
    	DevHBCycle = cJosn_Read_Int(opt,"DevHBCycle");
    	DevHBOutTimes = cJosn_Read_Int(opt,"DevHBOutTimes");

        PRINT_INFO("get gb info:\nserverip:%s\nserverPort:%d\nserverUid:%s\n\
            serverPwd:%s\nserverDomain:%s\ndeviceId:%s\ndevicePort:%d\n\
            expire:%d\nheartbeat cycle:%d\nheartbeat times:%d\n", ServerIP,
    	ServerPort, ServerUID, ServerPwd, ServerDomain, DeviceUID, DevicePort,
    	Expire, DevHBCycle, DevHBOutTimes);
        sprintf(retData,"{\"statusCode\": \"%d\"}",1);
        ops->set_body_ex(ops,retData,strlen(retData));

        strcpy(gb28181Cfg.ServerIP, ServerIP);
        gb28181Cfg.ServerPort = ServerPort;
        strcpy(gb28181Cfg.ServerUID, ServerUID);
        strcpy(gb28181Cfg.ServerPwd, ServerPwd);
        strcpy(gb28181Cfg.ServerDomain, ServerDomain);
        gb28181Cfg.DevicePort = DevicePort;
        strcpy(gb28181Cfg.DeviceUID, DeviceUID);
        gb28181Cfg.Expire = Expire;
        gb28181Cfg.DevHBCycle = DevHBCycle;
        gb28181Cfg.DevHBOutTimes = DevHBOutTimes;

        GB28181CfgCheckSave(gb28181Cfg);
        cJSON_Delete(opt);
    }
    else
    {
        cJSON  *root = GB28181CfgGetJsonSting();//创建项目
        char *sendData;

        cJSON_SetItemValue(root, "ServerPwd", "*******");
        cJSON_SetItemValue(root, "ServerIP", "*******");
        sendData = cJSON_Print(root);
        ops->set_body_ex(ops,sendData,strlen(sendData));
        free(sendData);
        cJSON_Delete(root);

    }
    return HPE_RET_SUCCESS;
}
#endif

static int get_gb28181_status(HTTP_OPS* ops, void* arg)
{
    //const char *buf;
    //int bodyLen;
    //cJSON *opt;
    char retData[256];
    //int method = ops->get_method(ops);

    //PRINT_INFO("Method:%s\n",get_method_string(method));

	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
#ifdef MODULE_SUPPORT_GB28181
    sprintf(retData,"{\"statusCode\": \"%d\"}",1);
#else
    sprintf(retData,"{\"statusCode\": \"%d\"}",0);
#endif
    ops->set_body_ex(ops,retData,strlen(retData));

    return HPE_RET_SUCCESS;
}

static int web_image_basic(HTTP_OPS* ops, void* arg)
{
    char *buf; //[] = "{\"contrast\": \"10\",\"brigtness\": \"20\",\"hue\": \"30\",\"saturation\": \"40\",\"sharpen\": \"50\",\"statusCode\": \"0\"}";
    int method = ops->get_method(ops);
    int ret = 1;
    char retData[256];
    int bodyLen;
    //PRINT_INFO("Method:%s\n",get_method_string(method));

	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
    if(method == METHOD_GET)
    {
        int valu = 1;
        if(sdk_cfg.gpio_red_led != -1 ) 
        {
            sdk_gpio_get_output_value(sdk_cfg.gpio_red_led, &valu);
            runImageCfg.led1 = (valu == sdk_cfg.gpio_red_led_on_value) ? 1:0;
        }

        
        if(sdk_cfg.gpio_color_led != -1 ) 
        {
            sdk_gpio_get_output_value(sdk_cfg.gpio_color_led, &valu);
            runImageCfg.led2 = (valu == sdk_cfg.gpio_color_led_on_value) ? 1:0;
        }

        buf = ImageCfgGetJosnString();
        if(buf != NULL)
        {
            ops->set_body_ex(ops,buf,strlen(buf));
            free(buf);
        }

        return HPE_RET_SUCCESS;

    }
    else
    {
        GK_NET_IMAGE_CFG    imagJsonAttr;
        GK_NET_IMAGE_CFG    imagJsonAttrBak;
        cJSON *opt;

        int value;
        buf = (char *)ops->get_body(ops,&bodyLen);
        if(buf != NULL)
        {
            buf[bodyLen]= '\0';
            //printf("PUT :%s\n",buf);
        }

        ret = 0;
        //PRINT_INFO("receive json data:%s\n",buf);
        opt = cJSON_Parse(buf);
        if(opt == NULL)
        {
            PRINT_ERR("http body json error\n");
            return HPE_RET_FAIL;
        }
        netcam_image_get(&imagJsonAttr);
        imagJsonAttrBak = imagJsonAttr;
        value = cJosn_Read_Int(opt,"sceneMode");
        if(value != -1)
            imagJsonAttr.sceneMode = value;

        value = cJosn_Read_Int(opt,"imageStyle");
        if(value != -1)
            imagJsonAttr.imageStyle = value;

        value = cJosn_Read_Int(opt,"wbMode");
        if(value != -1)
            imagJsonAttr.wbMode = value;

        value = cJosn_Read_Int(opt,"irCutControlMode");
        if(value != -1)
            imagJsonAttr.irCutControlMode = value;

        value = cJosn_Read_Int(opt,"irCutMode");
        if(value != -1)
            imagJsonAttr.irCutMode = value;

        value = cJosn_Read_Int(opt,"enabledWDR");
        if(value != -1)
            imagJsonAttr.enabledWDR = value;

        value = cJosn_Read_Int(opt,"strengthWDR");
        if(value != -1)
            imagJsonAttr.strengthWDR = value;

        value = cJosn_Read_Int(opt,"enableDenoise3d");
        if(value != -1)
            imagJsonAttr.enableDenoise3d = value;

        value = cJosn_Read_Int(opt,"strengthDenoise3d");
        if(value != -1)
            imagJsonAttr.strengthDenoise3d = value;

        value = cJosn_Read_Int(opt,"antiFlickerFreq");
        if(value != -1)
            imagJsonAttr.antiFlickerFreq = value;

        value = cJosn_Read_Int(opt,"brightness");
        if(value != -1)
            imagJsonAttr.brightness = value;

        value = cJosn_Read_Int(opt,"saturation");
        if(value != -1)
            imagJsonAttr.saturation = value;

        value = cJosn_Read_Int(opt,"contrast");
        if(value != -1)
           imagJsonAttr.contrast = value;

        value = cJosn_Read_Int(opt,"hue");
        if(value != -1)
            imagJsonAttr.hue = value;

        value = cJosn_Read_Int(opt,"sharpness");
        if(value != -1)
            imagJsonAttr.sharpness = value;

        value = cJosn_Read_Int(opt,"flipEnabled");
        if(value != -1)
            imagJsonAttr.flipEnabled = value;

        value = cJosn_Read_Int(opt,"mirrorEnabled");
        if(value != -1)
        imagJsonAttr.mirrorEnabled = value;

        value = cJosn_Read_Int(opt,"lowlightMode");
        if(value != -1)
            imagJsonAttr.lowlightMode = value;

        
        value = cJosn_Read_Int(opt,"led1");
        if(value != -1)
        {
            if(sdk_cfg.gpio_red_led != -1 && value != imagJsonAttr.led1) 
            {
                imagJsonAttr.led1 = value;
                sdk_gpio_set_output_value(sdk_cfg.gpio_red_led, value);
            }
        }
        
        value = cJosn_Read_Int(opt,"led2");
        if(value != -1)
        {
            if(sdk_cfg.gpio_color_led != -1 && value != imagJsonAttr.led2) 
            {
                imagJsonAttr.led2 = value;
                sdk_gpio_set_output_value(sdk_cfg.gpio_color_led, value);
            }
        }

        value = cJosn_Read_Int(opt,"reset_default");
        if(value != -1)
        {
            netcam_image_reset_default();
        }
        else
        {
            netcam_image_set(imagJsonAttr);
        }
        if (memcmp(&imagJsonAttrBak, &imagJsonAttr, sizeof(imagJsonAttrBak)) != 0)
            netcam_timer_add_task(netcam_image_cfg_save, NETCAM_TIMER_TWO_SEC, SDK_FALSE, SDK_TRUE);
        ret = 0;
        sprintf(retData,"{\"statusCode\": \"%d\"}",ret);
        ops->set_body_ex(ops,retData,strlen(retData));
        cJSON_Delete(opt);

    }
    return HPE_RET_SUCCESS;
}

static int web_autolight(HTTP_OPS* ops, void* arg)
{
    char *buf;
    int method = ops->get_method(ops);
    int ret = 1;
    char retData[256];
    int bodyLen;
    //PRINT_INFO("Method:%s\n",get_method_string(method));

	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
    if(method == METHOD_GET)
    {
        buf = pwmCfgGetJosnString();
        if(buf != NULL)
        {
            ops->set_body_ex(ops,buf,strlen(buf));
            free(buf);
        }
        return HPE_RET_SUCCESS;
    }
    else
    {
        GK_AUTO_LIGHT_CFG autolightJsonAttr;
        cJSON *opt;

        int value;
        buf = (char *)ops->get_body(ops,&bodyLen);
        if(buf != NULL)
        {
            buf[bodyLen]= '\0';
            //printf("PUT :%s\n",buf);
        }
        //PRINT_INFO("receive json data:%s\n",buf);
        opt = cJSON_Parse(buf);
        if(opt == NULL)
        {
            PRINT_ERR("http body json error\n");
            return HPE_RET_FAIL;
        }
        netcam_autolight_get(&autolightJsonAttr);
		value = cJosn_Read_Int(opt,"pwm_mode");
        if(value != -1)
            autolightJsonAttr.pwm_mode = value;

        value = cJosn_Read_Int(opt,"pwm_duty");
        if(value != -1)
            autolightJsonAttr.pwm_duty = value;

        value = cJosn_Read_Int(opt,"pwm_iso");
        if(value != -1)
            autolightJsonAttr.level = value;

        autolightJsonAttr.autolight[autolightJsonAttr.level].pwm_duty = autolightJsonAttr.pwm_duty;
		netcam_autolight_set(autolightJsonAttr);
        netcam_timer_add_task(netcam_autolight_cfg_save, NETCAM_TIMER_TWO_SEC, SDK_FALSE, SDK_TRUE);
        ret = 0;
        sprintf(retData,"{\"statusCode\": \"%d\"}",ret);
        ops->set_body_ex(ops,retData,strlen(retData));
        cJSON_Delete(opt);
    }
    return HPE_RET_SUCCESS;
}

static int web_wifi_enable(HTTP_OPS* ops,void* arg)
{
	int method=ops->get_method(ops);
	char *buffer;
	int bodyLen=0;
	int ret=0;
	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
	if(method==METHOD_PUT)
	{
		cJSON* Object;
		int enable=0;
		char retData[256];
		buffer = (char *)ops->get_body(ops,&bodyLen);
		if(buffer != NULL)
		{
			//printf("web :%s \n",buffer);
			Object = cJSON_Parse(buffer);
		    	if(Object  == NULL)
		    	{
					PRINT_ERR("json parse fail\n");
					ret = -2;
			}
			else
			{
				enable = cJSON_GetObjectItem(Object,"enable")->valueint;
				PRINT_INFO("Enable is:%d",enable);
				if(enable) {
					ret = netcam_net_wifi_on();
					if(ret == 0)
						ret=-8010;
					else
						ret=-8011;
				} else {
					ret = netcam_net_wifi_off();
					if(ret == 0)
						ret=-8000;
					else
						ret=-8001;
				}
			}
		}
		else
		{
			ret=-2;
		}
		sprintf(retData,"{\"statusCode\": \"%d\"}",ret);
		ops->set_body_ex(ops,retData,strlen(retData));
	}
	return HPE_RET_SUCCESS;
}

static int web_wirelessmode(HTTP_OPS* ops, void* arg)
{
	int method=ops->get_method(ops);
	char buffer[64];
	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(method == METHOD_GET)
   	{
		int ret = netcam_net_wifi_getWorkMode();
		if(ret == NETCAM_WIFI_AP)
			ret = 0;
		else
			ret = 1;
		snprintf(buffer, sizeof(buffer),"{\"wirelessMode\": \"%d\"}", ret);
		if(buffer != NULL)
		{
			ops->set_body_ex(ops,buffer,strlen(buffer));
		}
	}
	else
	{
		char retData[256];
		int bodyLen = 0;
		int ret = 0;
		cJSON *Object;
		int mode = 0;
		char *buff = NULL;
		buff = (char *)ops->get_body(ops,&bodyLen);
		if(buff == NULL)
		{
			PRINT_ERR("No http body\n");
			return HPE_RET_FAIL;
		}
		if(buff != NULL)
		{
			//printf("web :%s \n",buff);
			Object = cJSON_Parse(buff);
    		if(Object  == NULL)
    		{
				PRINT_ERR("json parse fail\n");
				ret = -1;
			}
			else
			{
				mode = cJSON_GetObjectItem(Object,"wirelessMode")->valueint;
				if(mode == 0)
					ret = netcam_net_wifi_switchWorkMode(NETCAM_WIFI_AP);
				else
					ret = netcam_net_wifi_switchWorkMode(NETCAM_WIFI_STA);
			}
		}
		else
		{
			ret= -10;
		}
		sprintf(retData,"{\"statusCode\": \"%d\"}",ret);
		ops->set_body_ex(ops,retData,strlen(retData));
	}
	return HPE_RET_SUCCESS;
}

static char *get_apInfo(void)
{
	char *buffer = NULL;
	NETCAM_WIFI_HostAPConfigT apCfg;
	cJSON *obj = cJSON_CreateObject();
	memset(&apCfg, 0, sizeof(NETCAM_WIFI_HostAPConfigT));
	netcam_net_wifi_getConfigHostAP(&apCfg);
//	cJSON_AddItemToObject(obj, "ap_ssid", cJSON_CreateString(list[i].essid));
	cJSON_AddItemToObject(obj, "ap_ssid", cJSON_CreateString(apCfg.ssid));
	cJSON_AddItemToObject(obj, "ap_pwd", cJSON_CreateString(apCfg.pwd));
	if(apCfg.encrypt == NETCAM_HOST_WPA_TKIP || apCfg.encrypt == NETCAM_HOST_WPA_AES)
		cJSON_AddItemToObject(obj, "ap_auth", cJSON_CreateNumber(1));
	else if(apCfg.encrypt == NETCAM_HOST_WPA2_TKIP || apCfg.encrypt == NETCAM_HOST_WPA2_AES)
		cJSON_AddItemToObject(obj, "ap_auth", cJSON_CreateNumber(2));
	else
		cJSON_AddItemToObject(obj, "ap_auth", cJSON_CreateNumber(0));
	cJSON_AddItemToObject(obj, "ap_ip", cJSON_CreateString(apCfg.ip));
	cJSON_AddItemToObject(obj, "ap_start", cJSON_CreateString(apCfg.startLoop));
	cJSON_AddItemToObject(obj, "ap_end", cJSON_CreateString(apCfg.endLoop));
	buffer = cJSON_Print(obj);
	//printf("%s", buffer);
	cJSON_Delete(obj);
	return buffer;
}

static int web_ap_wireless(HTTP_OPS* ops, void* arg)
{
	int method=ops->get_method(ops);
	char *buffer = NULL;
	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(method == METHOD_GET)
   	{
		buffer = get_apInfo();
		if(buffer != NULL)
		{
			ops->set_body_ex(ops,buffer,strlen(buffer));
			free(buffer);
		}
	}
	else
	{
		char retData[256];
		int bodyLen = 0;
		cJSON *Object;
		int ret = 0;
		char *ssid = NULL;
		char *pwd = NULL;
		int auth = 0;
		NETCAM_WIFI_HostAPConfigT apCfg;
		memset(&apCfg, 0, sizeof(NETCAM_WIFI_HostAPConfigT));
		buffer = (char *)ops->get_body(ops,&bodyLen);
		if(buffer == NULL)
		{
			PRINT_ERR("No http body\n");
			return HPE_RET_FAIL;
		}
		if(buffer != NULL)
		{
			//printf("web :%s \n",buffer);
			Object = cJSON_Parse(buffer);
    		if(Object  == NULL)
    		{
				PRINT_ERR("json parse fail\n");
				ret = -1;
			}
			else
			{
				//printf("json parse complied\n");
				ssid = cJSON_GetObjectItem(Object,"ap_ssid")->valuestring;
				if(ssid != NULL)
					strncpy(apCfg.ssid, ssid, sizeof(apCfg.ssid));
				pwd = cJSON_GetObjectItem(Object,"ap_pwd")->valuestring;
				if(pwd != NULL)
					strncpy(apCfg.pwd, pwd, sizeof(apCfg.pwd));
				auth = cJSON_GetObjectItem(Object,"ap_auth")->valueint;
				if(auth == 1)
					apCfg.encrypt = NETCAM_HOST_WPA_TKIP;
				else
					apCfg.encrypt = NETCAM_HOST_WPA2_TKIP;
				if(ssid != NULL) {
					ret = netcam_net_wifi_setConfigHostAP(&apCfg);
				}
			}
		}
		else
		{
			ret = -10;
		}
		sprintf(retData,"{\"statusCode\": \"%d\"}",ret);
		ops->set_body_ex(ops,retData,strlen(retData));
	}
	return HPE_RET_SUCCESS;
}

static int web_wireless(HTTP_OPS* ops, void* arg)
{
	int method=ops->get_method(ops);
	char *buffer;
	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(method == METHOD_GET)
   	{
		buffer = net_wifi_get();
		if(buffer != NULL)
		{
			ops->set_body_ex(ops,buffer,strlen(buffer));
			free(buffer);
		}
	}
	else
	{
		char retData[256];
		int ret = 0;
		int bodyLen = 0;
		cJSON *Object ;
		WIFI_LINK_INFO_t linkInfo;
		char *ssid;
        char *psd;
		buffer = (char *)ops->get_body(ops,&bodyLen);
		if(buffer ==NULL)
		{
			PRINT_ERR("No http body\n");
			return HPE_RET_FAIL;
		}
		if(buffer != NULL)
		{
			//PRINT_INFO("web :%s \n",buffer);
			Object = cJSON_Parse(buffer);
    		if(Object  == NULL)
    		{
				PRINT_ERR("json parse fail\n");
				ret = -1;
			}
			else
			{
				memset(&linkInfo,0,sizeof(linkInfo));
				//printf("WiFi enable:%d\n", linkInfo.enable);
				linkInfo.isConnect = cJSON_GetObjectItem(Object,"ap_connet")->valueint;

				//PRINT_INFO("AP_connet is %d",linkInfo.isConnect);
				ssid = cJSON_GetObjectItem(Object,"ap_ssid")->valuestring;
				if(ssid != NULL)
				{
					strncpy(linkInfo.linkEssid, ssid, sizeof(linkInfo.linkEssid)-1);
				}

				psd = cJSON_GetObjectItem(Object,"ap_password")->valuestring;
				if(psd != NULL)
				{
					strncpy(linkInfo.linkPsd,psd, sizeof(linkInfo.linkPsd)-1);
				}
                linkInfo.linkScurity =  cJSON_GetObjectItem(Object,"wifi_authtype")->valueint;

				//PRINT_INFO("SSID is:>%s<, PWD is :>%s<, enctype:<%d>",ssid,psd,linkInfo.linkScurity);

				if(netcam_net_wifi_isOn())
				{
					ret = netcam_net_wifi_set_connect_info(&linkInfo);
					//PRINT_INFO("RET IS:%d",ret);
					if( ret == 0 &&  linkInfo.linkStatus == WIFI_CONNECT_OK )
					{
						#if 1
						char *wifiNmae = netcam_net_wifi_get_devname();
						ST_SDK_NETWORK_ATTR net_attr;
						strcpy(net_attr.name, wifiNmae);
						netcam_net_get(&net_attr);
						netcam_net_set(&net_attr);
						#else
						char *wifiNmae = netcam_net_wifi_get_devname();
						if(wifiNmae != NULL){
							netcam_net_reset_net_ip(netcam_net_wifi_get_devname(),NULL);
						} else {
							ret = -10;
						}
                        #endif
					}
				}
				else
				{
					ret = -10;
				}
			}
		}
		else
		{
			ret = -10;
		}
		sprintf(retData,"{\"statusCode\": \"%d\"}",ret);
		ops->set_body_ex(ops,retData,strlen(retData));
	}
	return HPE_RET_SUCCESS;
}

static int web_stream_control(HTTP_OPS* ops, void* arg)
{
    int method = ops->get_method(ops);
    char  *buf;
    int streamId;
	char buffer[9096]={0};
    memset(buffer,0,sizeof(buffer));

    //PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
    if(method == METHOD_GET)
    {
        char *jsonBuf;
        buf =  (char *)ops->get_param_string(ops,"streamId");
        if(buf == NULL)
        {
            return HPE_RET_FAIL;
        }
        streamId = atoi(buf);

        if(streamId < 0 || streamId >4 )
        {
            PRINT_ERR("steamid error:%d",streamId);
            return HPE_RET_FAIL;
        }

        jsonBuf = netcam_video_get_cfg_json_string(streamId);
        if( jsonBuf == NULL)
        {
            return HPE_RET_FAIL;
        }
		//gbk => utf8
	    //PRINT_INFO("jsonbuf:%s\n",jsonBuf);
	    utility_gbk_to_utf8(jsonBuf, buffer, sizeof(buffer));
        ops->set_body_ex(ops,buffer,strlen(buffer));
        free(jsonBuf);
    }
    else
    {
        cJSON *opt;
        char retData[256];
        int ret = 0;
        int streamId ;
        int bodyLen = 0;
        char *resolution;
        ST_GK_ENC_STREAM_H264_ATTR h264Attr;
        buf = (char *)ops->get_body(ops,&bodyLen);
        if(buf ==NULL)
        {
            PRINT_ERR("No http body\n");
            return HPE_RET_FAIL;

        }
        //get json data
        // set_stream_parameter
		//utf-8 => gbk

		utility_utf8_to_gbk(buf,buffer,sizeof(buffer));
        opt = cJSON_Parse(buffer);
        if(opt == NULL)
        {
            PRINT_ERR("http body json error\n");
            return HPE_RET_FAIL;
        }
		//PRINT_INFO("json:%s",buf);

        streamId = cJosn_Read_Int(opt,"id");
        netcam_video_get(0, streamId, &h264Attr);
        resolution = cJosn_Read_String(opt,"resolution");

        sscanf(resolution,"%dx%d",&h264Attr.width,&h264Attr.height);
		runVideoCfg.vencStream[streamId].avStream = cJosn_Read_Int(opt,"avStream");

	printf("===========resolution==========%s\n", resolution);
	printf("==============h264Attr.width = %d======\n", h264Attr.width);
        h264Attr.profile = cJosn_Read_Int(opt,"profile");
        h264Attr.fps= cJosn_Read_Int(opt,"fps");
        h264Attr.rc_mode = cJosn_Read_Int(opt,"rc_mode");
        h264Attr.bps = cJosn_Read_Int(opt,"bps");
        h264Attr.enctype = cJosn_Read_Int(opt,"enctype");

        //h264Attr.h264_brcMode = cJosn_Read_Int(opt,"h264_brcMode");
        //h264Attr.h264_brcMode = cJosn_Read_Int(opt,"h264_brcMode");
		strncpy(runVideoCfg.vencStream[streamId].h264Conf.name, cJosn_Read_String(opt,"name"), sizeof(runVideoCfg.vencStream[streamId].h264Conf.name)-1);
		//strcpy((char *) runChannelCfg.channelInfo[streamId].osdChannelName.text, (char*)runVideoCfg.vencStream[streamId].streamFormat.streamName );
        netcam_osd_set_title(streamId, runVideoCfg.vencStream[streamId].h264Conf.name);

        cJSON_Delete(opt);

        ret =netcam_video_set(0, streamId, &h264Attr);

        if(ret == 0)
        {
            netcam_osd_update_title();
            netcam_osd_update_id();
            netcam_timer_add_task(netcam_osd_pm_save, NETCAM_TIMER_ONE_SEC, SDK_FALSE, SDK_TRUE);
            netcam_timer_add_task(netcam_video_cfg_save, NETCAM_TIMER_ONE_SEC, SDK_FALSE, SDK_TRUE);
        }
	sleep(3);
	rtsp_reboot();
	printf("==============web_rtsp_reboot=================\n");
        sprintf(retData,"{\"statusCode\": \"%d\"}",ret);
        ops->set_body_ex(ops,retData,strlen(retData));
    }

    return HPE_RET_SUCCESS;
}

static int web_overlayer_control(HTTP_OPS* ops, void* arg)
{
    int method = ops->get_method(ops);
    char  *buf;
    int channelId;
	char buffer[4096]={0};

    //PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

    if(method == METHOD_GET)
    {
        char *jsonBuf;
        buf =  (char *)ops->get_param_string(ops,"channelId");
		buf[1]='\0';
        if(buf == NULL)
        {
            return HPE_RET_FAIL;
        }
        channelId = atoi(buf);

        if(channelId < 0 || channelId >4 )
        {
            PRINT_ERR("channelId error:%d",channelId);
            return HPE_RET_FAIL;
        }

        jsonBuf = netcam_osd_cfg_json_string(channelId);
        if( jsonBuf == NULL)
        {
            return HPE_RET_FAIL;
        }
		//gbk => utf8
		utility_gbk_to_utf8(jsonBuf, buffer, 4096);
		//PRINT_INFO("strlen(buffer):%d\n%s\n",strlen(buffer),buffer);

		ops->set_body_ex(ops,buffer,strlen(buffer));
        free(jsonBuf);
    }
    else
    {
        cJSON *opt;
        char retData[256];
        int bodyLen = 0;
        GK_NET_OSD_CHANNEL_NAME osdChannelName[4];
		GK_NET_OSD_DATETIME osdDatetime;
		GK_NET_OSD_CHANNEL_ID osdChannelID;
        buf = (char *)ops->get_body(ops,&bodyLen);
        if(buf ==NULL)
        {
            PRINT_ERR("No http body\n");
            return HPE_RET_FAIL;

        }
        //get json data
        buf[bodyLen] = 0;
        //PRINT_INFO("receive json data:%s\n",buf);

		//utf-8 => gbk
		utility_utf8_to_gbk(buf,buffer,4096);

        //opt = cJSON_Parse(buf);
        opt = cJSON_Parse(buffer);
        if(opt == NULL)
        {
            PRINT_ERR("http body json error\n");
            return HPE_RET_FAIL;
        }

        channelId = cJosn_Read_Int(opt,"id");

		osdChannelName[0].enable = cJSON_GetObjectItem(opt,"osdChannelName_enable")->valueint;
		//strcpy(osdChannelName.text, cJosn_Read_String(opt,"osdChannelName_text"));//cJSON_GetObjectItem(opt,"osdChannelName_text")->valuestring);
		strcpy((char *)osdChannelName[0].text, (char *)runVideoCfg.vencStream[0].h264Conf.name);
		osdChannelName[0].x = cJSON_GetObjectItem(opt,"osdChannelName_x")->valuedouble;
		osdChannelName[0].y = cJSON_GetObjectItem(opt,"osdChannelName_y")->valuedouble;

		for(bodyLen=1; bodyLen<4;bodyLen++)
		{
			osdChannelName[bodyLen].enable = osdChannelName[0].enable;
			strncpy(osdChannelName[bodyLen].text, (char *)runVideoCfg.vencStream[bodyLen].h264Conf.name, sizeof(osdChannelName[bodyLen].text)-1);
			osdChannelName[bodyLen].x = osdChannelName[0].x;
			osdChannelName[bodyLen].y = osdChannelName[0].y;
		}

		osdDatetime.dateFormat = cJosn_Read_Int(opt,"osdDatetime_dateFormat");
		osdDatetime.dateSprtr = cJosn_Read_Int(opt,"osdDatetime_dateSprtr");
		osdDatetime.displayWeek = cJosn_Read_Int(opt,"osdDatetime_displayWeek");
		osdDatetime.enable = cJosn_Read_Int(opt,"osdDatetime_enable");
		osdDatetime.timeFmt = cJosn_Read_Int(opt,"osdDatetime_timeFmt");
		osdDatetime.x = cJSON_GetObjectItem(opt,"osdDatetime_x")->valuedouble;//cJosn_Read_Int(opt,"osdDatetime_x");
		osdDatetime.y = cJSON_GetObjectItem(opt,"osdDatetime_y")->valuedouble;//cJosn_Read_Int(opt,"osdDatetime_y");

		osdChannelID.enable = cJosn_Read_Int(opt,"osdChannelID_enable");
		strncpy(osdChannelID.text, cJosn_Read_String(opt,"osdChannelID_text"), sizeof(osdChannelID.text)-1);
		osdChannelID.x = cJSON_GetObjectItem(opt,"osdChannelID_x")->valuedouble;//cJosn_Read_Int(opt,"osdChannelID_x");
		osdChannelID.y = cJSON_GetObjectItem(opt,"osdChannelID_y")->valuedouble;//cJosn_Read_Int(opt,"osdChannelID_y");

		for(bodyLen=0; bodyLen<4;bodyLen++)
		{
		    memcpy(&runChannelCfg.channelInfo[bodyLen].osdChannelName, &osdChannelName[bodyLen], sizeof(GK_NET_OSD_CHANNEL_NAME));
			memcpy(&runChannelCfg.channelInfo[bodyLen].osdDatetime, &osdDatetime, sizeof(GK_NET_OSD_DATETIME));
			memcpy(&runChannelCfg.channelInfo[bodyLen].osdChannelID, &osdChannelID, sizeof(GK_NET_OSD_CHANNEL_ID));
		}
		netcam_osd_update_clock();
        netcam_osd_update_title();
        netcam_osd_update_id();

        netcam_timer_add_task(netcam_osd_pm_save, NETCAM_TIMER_TWO_SEC, SDK_FALSE, SDK_TRUE);
        sprintf(retData,"{\"statusCode\": \"%d\"}",0);
        ops->set_body_ex(ops,retData,strlen(retData));
        cJSON_Delete(opt);
    }


    return HPE_RET_SUCCESS;

}

static int web_cover_control(HTTP_OPS* ops, void* arg)
{
	int method = ops->get_method(ops);
	char  *buf;
	int channelId;

	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

	if(method == METHOD_GET)
	{

		char *jsonBuf;
		buf =  (char *)ops->get_param_string(ops,"channelId");
		if(buf == NULL)
		{
			return HPE_RET_FAIL;
		}
		channelId = atoi(buf);

		if(channelId < 0 || channelId >4 )
		{
			PRINT_ERR("channelId error:%d",channelId);
			return HPE_RET_FAIL;
		}

		jsonBuf = netcam_pm_get_cfg_json_string(channelId);
		if( jsonBuf == NULL)
		{
			return HPE_RET_FAIL;
		}
		//PRINT_INFO("strlen(jsonBuf):%d\n%s\n",strlen(jsonBuf),jsonBuf);
		ops->set_body_ex(ops,jsonBuf,strlen(jsonBuf));
		free(jsonBuf);
	}
	else
	{
		cJSON *Item, *ArrayItem;
		int index = 0;// ArraySize = 0;
		int bodyLen = 0;
		char retData[256];
		GK_NET_SHELTER_RECT cover={0,0,0,0,0,0};

		buf = (char *)ops->get_body(ops,&bodyLen);
		if(buf ==NULL)
		{
			PRINT_ERR("No http body\n");
			return HPE_RET_FAIL;

		}
		//get json data
		buf[bodyLen] = 0;
		//PRINT_INFO("receive json data:%s\n",buf);

		ArrayItem = cJSON_Parse(buf);
		if(ArrayItem == NULL)
		{
			PRINT_ERR("http body json error\n");
			return HPE_RET_FAIL;
		}

		//ArraySize = cJSON_GetArraySize(ArrayItem);
		for(index=0; index < 4; index++)
		{
			Item = cJSON_GetArrayItem(ArrayItem, index);
			cover.enable = cJSON_GetObjectItem(Item,"shelterRect_enable")->valueint;
			cover.color= cJSON_GetObjectItem(Item,"shelterRect_color")->valueint;
			if(cover.enable)
			{
				cover.x = cJSON_GetObjectItem(Item,"shelterRect_x")->valuedouble;
				cover.y = cJSON_GetObjectItem(Item,"shelterRect_y")->valuedouble;
				cover.width= cJSON_GetObjectItem(Item,"shelterRect_width")->valuedouble;
				cover.height= cJSON_GetObjectItem(Item,"shelterRect_height")->valuedouble;
			}
			/*if(index < ArraySize)
			{
				Item = cJSON_GetArrayItem(ArrayItem, index);
				cover.enable = cJSON_GetObjectItem(Item,"shelterRect_enable")->valueint;
				cover.x = cJSON_GetObjectItem(Item,"shelterRect_x")->valuedouble;
				cover.y = cJSON_GetObjectItem(Item,"shelterRect_y")->valuedouble;
				cover.width= cJSON_GetObjectItem(Item,"shelterRect_width")->valuedouble;
				cover.height= cJSON_GetObjectItem(Item,"shelterRect_height")->valuedouble;
				cover.color= cJSON_GetObjectItem(Item,"shelterRect_color")->valueint;
			}
			else
				cover.enable = 0;*/

			netcam_pm_set_cover( 0, index, cover );
		}

		cJSON_Delete(ArrayItem);
        netcam_timer_add_task(netcam_osd_pm_save, NETCAM_TIMER_TWO_SEC, SDK_FALSE, SDK_TRUE);

		sprintf(retData,"{\"statusCode\": \"%d\"}",0);
		ops->set_body_ex(ops,retData,strlen(retData));
	}


	return HPE_RET_SUCCESS;

}

static int web_login(HTTP_OPS* ops, void* arg)
{
	//int method = ops->get_method(ops);
	int bodyLen=0;
	char retData[256];
	//PRINT_INFO("Method:%s\n",get_method_string(method));
	bodyLen=netcam_http_service(ops);
	sprintf(retData,"{\"statusCode\": %d}",bodyLen);
	ops->set_body_ex(ops,retData,strlen(retData));
	return HPE_RET_SUCCESS;
}

static int web_check_login(HTTP_OPS* ops, void* arg)
{
	//int method = ops->get_method(ops);
	//PRINT_INFO("Method:%s\n",get_method_string(method));
	char retData[256];
	/*cJSON *opt;
	char retData[256];
	int bodyLen = 0;
	char *buf;
	char path[64]={0};
	sprintf(path, "%s%s", CFG_DIR, USER_CJSON_FILE);
	cJSON* ArrayObject = cJSON_ReadFile(path);
	int ArraySize = cJSON_GetArraySize(ArrayObject);
	int i=0;
	char right[32]={0};
	buf = (char *)ops->get_body(ops,&bodyLen);
	if(buf ==NULL)
	{
		PRINT_ERR("No http body\n");
		return HPE_RET_FAIL;
	}
	buf[bodyLen] = 0;
	PRINT_INFO("receive json data:%s\n",buf);
	opt = cJSON_Parse(buf);
	if(opt == NULL)
	{
		PRINT_ERR("http body json error\n");
		return HPE_RET_FAIL;
	}

	for(i=0;i<ArraySize;i++)
	{
		if(strcmp(cJSON_GetObjectItem(opt,"username")->valuestring, cJSON_GetObjectItem(cJSON_GetArrayItem(ArrayObject,i),"userName")->valuestring) == 0
		&&strcmp(cJSON_GetObjectItem(opt,"password")->valuestring, cJSON_GetObjectItem(cJSON_GetArrayItem(ArrayObject,i),"password")->valuestring) == 0)
		{
			strcpy(right,cJSON_GetObjectItem(cJSON_GetArrayItem(ArrayObject,i),"userRight")->valuestring);
			break;
		}
	}
	sprintf(retData,"{\"statusCode\": \"%s\"}",right);
	ops->set_body_ex(ops,retData,strlen(retData));
	cJSON_Delete(opt);
	cJSON_Delete(ArrayObject);*/
	sprintf(retData,"{\"statusCode\": \"%s\"}","1111");
	ops->set_body_ex(ops,retData,strlen(retData));
	return HPE_RET_SUCCESS;
}


static int web_user_control(HTTP_OPS* ops, void* arg)
{
	int method = ops->get_method(ops);
	char  *buf;

	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

	if(method == METHOD_GET)
	{
		char *jsonBuf = UserCfgLoadJson();
		if( jsonBuf == NULL)
		{
			return HPE_RET_FAIL;
		}
		//PRINT_INFO("strlen(jsonBuf):%d\n%s\n",strlen(jsonBuf),jsonBuf);

		ops->set_body_ex(ops,jsonBuf,strlen(jsonBuf));
		free(jsonBuf);
	}
	else
	{
		int bodyLen = 0;
		char retData[256];

		buf = (char *)ops->get_body(ops,&bodyLen);
		if(buf ==NULL)
		{
			PRINT_ERR("No http body\n");
			return HPE_RET_FAIL;
		}
		//get json data
		buf[bodyLen] = 0;
		//PRINT_INFO("receive json data:%s\n",buf);
		bodyLen = UserCfgSaveJson(buf);
        //netcam_timer_add_task(UserCfgSaveJson, 8, SDK_FALSE, SDK_TRUE);

		sprintf(retData,"{\"statusCode\": \"%d\"}",bodyLen);
		ops->set_body_ex(ops,retData,strlen(retData));
	}

	return HPE_RET_SUCCESS;

}

static char *netcam_net_convert_json(ST_SDK_NETWORK_ATTR net_attr)
{
    cJSON *item = cJSON_CreateObject();
    char *out=NULL;

    cJSON_AddItemToObject(item, "enable", cJSON_CreateNumber(net_attr.enable));
    cJSON_AddItemToObject(item, "netName", cJSON_CreateString(net_attr.name));
    cJSON_AddItemToObject(item, "ipVersion", cJSON_CreateNumber(runNetworkCfg.lan.ipVersion));
    cJSON_AddItemToObject(item, "mac", cJSON_CreateString((char *)net_attr.mac));
    cJSON_AddItemToObject(item, "dhcpEnable", cJSON_CreateNumber(net_attr.dhcp));
    cJSON_AddItemToObject(item, "upnpEnable", cJSON_CreateNumber(runNetworkCfg.lan.upnpEnable));
    cJSON_AddItemToObject(item, "ip", cJSON_CreateString(net_attr.ip));
    cJSON_AddItemToObject(item, "netmask", cJSON_CreateString(net_attr.mask));
    cJSON_AddItemToObject(item, "gateway", cJSON_CreateString(net_attr.gateway));
    cJSON_AddItemToObject(item, "multicast", cJSON_CreateString(runNetworkCfg.lan.multicast));
    cJSON_AddItemToObject(item, "dhcpDns", cJSON_CreateNumber(runNetworkCfg.lan.dhcpDns));
    cJSON_AddItemToObject(item, "dns1", cJSON_CreateString(net_attr.dns1));
    cJSON_AddItemToObject(item, "dns2", cJSON_CreateString(net_attr.dns2));
    cJSON_AddItemToObject(item, "IPAutoTrack", cJSON_CreateNumber(runNetworkCfg.lan.autotrack));

    out = cJSON_Print(item);
    cJSON_Delete(item);
    return out;
}

static int web_local_eth_control(HTTP_OPS* ops, void* arg)
{
    int method = ops->get_method(ops);
    char  *buf;
    ST_SDK_NETWORK_ATTR net_attr;
	int ret=0;
    //PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

    if(method == METHOD_GET)
    {
        char *jsonBuf;
        buf =  (char *)ops->get_param_string(ops,"type");
        if(buf == NULL)
        {
            return HPE_RET_FAIL;
        }
    	if(strcmp(buf,"auto")==0)
    	{
    		ret = netcam_net_get_detect("eth0");
    		if(ret==0)
    		{
    			strcpy(buf,"local");
    		}
    		else
    		{
    			strcpy(buf,"wifi");
    		}
    	}
        if(strcmp(buf,"local") == 0)
        {
            bzero(&net_attr, sizeof(net_attr));
            strcpy(net_attr.name,"eth0");
            netcam_net_get(&net_attr);
            jsonBuf = netcam_net_convert_json(net_attr);
            //jsonBuf = NetworkCfgGetJosnString(0);
        }
        else if(strcmp(buf,"wifi") == 0)
        {
            char *WifiName = netcam_net_wifi_get_devname();
            if(WifiName != NULL) {
                bzero(&net_attr, sizeof(net_attr));
                snprintf(net_attr.name,sizeof(net_attr.name), WifiName);
                netcam_net_get(&net_attr);
                jsonBuf = netcam_net_convert_json(net_attr);
            }
            else
            {
                jsonBuf = NetworkCfgGetJosnString(1);
            }
        }
        else
        {
            return HPE_RET_FAIL;
        }

        ops->set_body_ex(ops,jsonBuf,strlen(jsonBuf));
        free(jsonBuf);
    }
    else
    {
        cJSON *opt;
        char retData[256];
        int ret = 0;

        int bodyLen = 0;

        //int uPnpEnable ;
        ST_SDK_NETWORK_ATTR net_attr;

        buf = (char *)ops->get_body(ops,&bodyLen);
        if(buf ==NULL)
        {
            PRINT_ERR("No http body\n");
            return HPE_RET_FAIL;

        }
        //get json data
        // set_stream_parameter

        //PRINT_INFO("receive json data:%s\n",buf);
        opt = cJSON_Parse(buf);
        if(opt == NULL)
        {
            PRINT_ERR("http body json error\n");
            return HPE_RET_FAIL;
        }
        buf = cJosn_Read_String(opt,"type");
        if(buf == NULL)
        {
            PRINT_ERR("No netwrok type\n");
            cJSON_Delete(opt);
            return HPE_RET_FAIL;
        }
        //PRINT_INFO("net type:%s\n", buf);
        if(strcmp(buf,"local") == 0 )
        {
            strcpy(net_attr.name,"eth0");
        }
        else if( strcmp(buf,"wifi") == 0)
        {
			char *WifiName = netcam_net_wifi_get_devname();
			if(WifiName != NULL) {
				snprintf(net_attr.name,sizeof(net_attr.name), WifiName);
			}
        }
        else
        {
            cJSON_Delete(opt);
            return HPE_RET_FAIL;
        }

        netcam_net_get(&net_attr);
        net_attr.dhcp = cJosn_Read_Int(opt, "dhcpEnable");
        //uPnpEnable = cJosn_Read_Int(opt, "upnpEnable");
        runNetworkCfg.lan.autotrack = cJosn_Read_Int(opt, "IPAutoTrack");
        //PRINT_INFO("uPnpEnable:%d\n", uPnpEnable);

        if(net_attr.dhcp == 0)
        {
            strcpy(net_attr.ip, cJosn_Read_String(opt,"ip"));
            strcpy(net_attr.mask, cJosn_Read_String(opt,"netmask"));
            strcpy(net_attr.gateway, cJosn_Read_String(opt,"gateway"));
            strcpy(net_attr.dns1, cJosn_Read_String(opt,"dns1"));
            strcpy(net_attr.dns2, cJosn_Read_String(opt,"dns2"));
        }

        ret = netcam_net_set(&net_attr);
        cJSON_Delete(opt);
        sprintf(retData,"{\"statusCode\": \"%d\"}",ret);
        ops->set_body_ex(ops,retData,strlen(retData));
        //netcam_timer_add_task(netcam_net_cfg_save, 8, SDK_TRUE, SDK_TRUE);
        if(ret==0)
        netcam_net_cfg_save();
		//use task to delay restart app
        //netcam_timer_add_task2(netcam_sys_operation,1,SDK_FALSE,SDK_FALSE,0,(void *)SYSTEM_OPERATION_RESTART_APP);
	}

    return HPE_RET_SUCCESS;
}

static int web_reset_default(HTTP_OPS* ops, void* arg)
{
    char retData[256];
    //int method = ops->get_method(ops);
    //PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

    PRINT_INFO("Reset to factory default\n");
    //CfgLoadDefValueAll();
    //netcam_timer_add_task(netcam_net_cfg_save(), 8, SDK_FALSE, SDK_TRUE);

    sprintf(retData,"{\"statusCode\": \"%d\"}",0);
    ops->set_body_ex(ops,retData,strlen(retData));
    netcam_timer_add_task2(netcam_sys_operation,1,SDK_FALSE,SDK_FALSE,0,(void *)SYSTEM_OPERATION_HARD_DEFAULT);
    return HPE_RET_SUCCESS;
}

static int web_sys_reboot(HTTP_OPS* ops, void* arg)
{
    char retData[256];
    //int method = ops->get_method(ops);
    //PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

    sprintf(retData,"{\"statusCode\": \"%d\"}",0);
    ops->set_body_ex(ops,retData,strlen(retData));
    PRINT_INFO("Reboot system\n");
	//netcam_exit(90);
    netcam_timer_add_task2(netcam_sys_operation,1,SDK_FALSE,SDK_FALSE,0,(void *)SYSTEM_OPERATION_REBOOT);
    return HPE_RET_SUCCESS;
}

static int web_sys_info(HTTP_OPS* ops, void* arg)
{
    //int method = ops->get_method(ops);
    //PRINT_INFO("Method:%s\n",get_method_string(method));

	//if(netcam_http_service(ops)==0)
	//	return HPE_RET_UNAUTHORIZED;
    char *buf = SytemCfgGetCjsonString();

    if(buf != NULL)
    {
        ops->set_body_ex(ops,buf,strlen(buf));
        free(buf);
        return HPE_RET_SUCCESS;
    }
    else
    {
        return HPE_RET_FAIL;
    }
}

static int web_sys_onvif(HTTP_OPS* ops, void* arg)
{
    char retData[256];
    //int method = ops->get_method(ops);
    //PRINT_INFO("Method:%s\n",get_method_string(method));

	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
    char onvifVersion[32]="2.4.1";

    sprintf(retData,"{\"onvifVersion\": \"%s\"}",onvifVersion);
    ops->set_body_ex(ops,retData,strlen(retData));

    //PRINT_INFO("Onvif version\n");
    return HPE_RET_SUCCESS;

}

static int web_ptz_control(HTTP_OPS* ops, void* arg)
{
    int method = ops->get_method(ops);
    char *ptzStep;
    char *ptzAct;
    char *ptzSpeed;
    int step,speed;
    int i;
    //PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

    if(method == METHOD_PUT)
    {
        ptzStep =  (char *)ops->get_param_string(ops,"step");
        ptzAct =  (char *)ops->get_param_string(ops,"action");
        ptzSpeed =  (char *)ops->get_param_string(ops,"speed");
        if(ptzStep == NULL || ptzAct == NULL || ptzSpeed == NULL )
        {
            PRINT_ERR("PTZ parameter format error");
            return HPE_RET_FAIL;
        }
        step = atoi(ptzStep)*10;
        //speed = atoi(ptzSpeed);
        //step = 22;
        speed = -1;
	   //PRINT_INFO("step:%d,speed:%d,act:%s\n",step,speed,ptzAct);

        for(i = 0; webPtzAction[i].action != NULL; i++)
        {
            if(strcmp(ptzAct,webPtzAction[i].action) == 0)
            {
                if(webPtzAction[i].callBk)
                {
                    // when ptz is ok, it can use this code
                    //webPtzAction[i].callBk(step,speed);
                    webPtzAction[i].callBk(0xFF);
                    break;
                }
            }
        }

    }

    return HPE_RET_SUCCESS;
}

static int web_upgrade_read_cb(HTTP_OPS* ops, void* arg)
{
	int data = 1;
	char retData[12];
	sprintf(retData,"%d",data);

	//PRINT_INFO();
	ops->set_body_ex(ops,(char*)retData,strlen(retData));
	return HPE_RET_DISCONNECT;
}

static int web_upgrade_read(HTTP_OPS* ops, void* arg)
{
	//int method = ops->get_method(ops);
	char *data = NULL;
	char *tag;
	int bodyLen;
	int fd;
	int recvLen = 0;

    if(netcam_get_update_status() < 0)
    {
	    PRINT_ERR("is updating..............\n");
	    return	HPE_RET_OUTOF_MEMORY;
    }
	//PRINT_INFO("Method:%s\n",get_method_string(method));

	tag = (char *)ops->get_tag(ops,(char *)"Content-Length");
	bodyLen = atoi(tag);


	//PRINT_INFO("body Len:%d",bodyLen);
	if(bodyLen <= 0 || bodyLen > (16*1024*1024+4*1024))
	{
		goto ERROR_EXIT;
	}

	fd = ops->get_connection_fd(ops);
	if(fd > 0  )
	{
		netcam_update_relase_system_resource();

        //netcam_video_exit();

		recvLen = 0;
		data = update_recv_http_body(fd,bodyLen,&recvLen);
		if(recvLen == bodyLen && data != NULL)
		{
			if(netcam_update_mail_style(data,bodyLen,NULL) == 0)
			{
				return HPE_RET_KEEP_ALIVE;
			}
			else
			{
				PRINT_ERR(" update package check error");
			}
		}
		else
		{
			PRINT_ERR(" recv date package error,recv:%d,all:%d\n",recvLen,bodyLen);
		}


	}


ERROR_EXIT:
	if(data)
		free(data);
	//netcam_exit(90);
    //new_system_call("reboot -f");//force REBOOT
	netcam_sys_operation(NULL,(void *)SYSTEM_OPERATION_RESTART_APP); //force restart app

	return  HPE_RET_OUTOF_MEMORY;

}

static int device_upgrade_cb(HTTP_OPS* ops, void* arg)
{
	//PRINT_INFO();
	ops->set_body_ex(ops,HTTP_WEB_OK,strlen(HTTP_WEB_OK));
	return HPE_RET_DISCONNECT;

}

static int device_upgrade(HTTP_OPS* ops, void* arg)
{
	//int method = ops->get_method(ops);
	char *data;
	char *tag;
	int bodyLen;
	int fd;
	int recvLen = 0;

	//PRINT_INFO("Method:%s\n",get_method_string(method));

    if(netcam_get_update_status() < 0)
    {
	    PRINT_ERR("is updating..............\n");
	    return	HPE_RET_OUTOF_MEMORY;
    }
	tag = (char *)ops->get_tag(ops,"Content-Length");
	bodyLen = atoi(tag);

	//PRINT_INFO("body Len:%d",bodyLen);
	if(bodyLen <= 0 || bodyLen > (16*1024*1024+4*1024))
	{
		goto ERROR_EXIT;
	}

	fd = ops->get_connection_fd(ops);
	if(fd > 0  )
	{
		netcam_update_relase_system_resource();
        //netcam_video_exit();

		recvLen = 0;

		data = update_recv_http_body(fd,bodyLen,&recvLen);
		if(recvLen == bodyLen && data != NULL)
		{
			if(netcam_update(data,bodyLen,NULL) == 0)
			{
				return HPE_RET_KEEP_ALIVE;
			}
			else
			{
				PRINT_ERR(" update package check error");
			}
		}
		else
		{
			if(data)
				free(data);
			PRINT_INFO(" recv date package error,recv:%d,all:%d\n",recvLen,bodyLen);
		}

	}
	ERROR_EXIT:

	netcam_sys_operation(NULL,(void *)SYSTEM_OPERATION_RESTART_APP); //force restart app
	return	HPE_RET_OUTOF_MEMORY;

}

static int device_upgrade_state(HTTP_OPS* ops, void* arg)
{
	char retData[256];
	int rate;
	memset(retData, 0, 256);
	//int method = ops->get_method(ops);
	//PRINT_INFO("Method:%s\n",get_method_string(method));

	rate = netcam_update_get_process();

	//sprintf(retData,"Update: \"%d\"",rate);
	sprintf(retData,"{\"upgrade_state\": \"%d\"}",rate);
	//PRINT_INFO("Web update process: %d\n", rate );

	ops->set_body_ex(ops,retData,strlen(retData));

	return HPE_RET_SUCCESS;
}

static int web_snapshot(HTTP_OPS* ops, void* arg)
{
	FILE *f;
	long len;
	char *data;
	int ret;
	//PRINT_INFO("netcam_video_snapshot:width:%d, height:%d\n",runVideoCfg.vencStream[1].h264Conf.width, runVideoCfg.vencStream[1].h264Conf.height);
	ret=netcam_video_snapshot(runVideoCfg.vencStream[1].h264Conf.width, runVideoCfg.vencStream[1].h264Conf.height, "/tmp/web_snapshot1.jpg", GK_ENC_SNAPSHOT_QUALITY_MEDIUM);

	if(ret != 0)
	{
    	PRINT_INFO("snapshot timeout: %d\n", ret );
    	return HPE_RET_FAIL;
	}

   	f=fopen("/tmp/web_snapshot1.jpg","rb");
	if(f==NULL)
		return HPE_RET_FAIL;
	fseek(f,0,SEEK_END);
	len=ftell(f);
	fseek(f,0,SEEK_SET);
	data=(char*)malloc(len);
	fread(data,1,len,f);
	fclose(f);
	delete_path("/tmp/web_snapshot1.jpg");
	ops->add_tag(ops, "Content-Type", "image/jpeg");
	//ops->add_tag(ops, "Cache-Control", "no-cache");

	ops->set_body_ex(ops,data,len);
	free(data);
    return HPE_RET_SUCCESS;
}

static int web_snapshotjpg(HTTP_OPS* ops, void* arg)
{
	netcam_video_snapshot(GK_ENC_SNAPSHOT_SIZE_MAX, GK_ENC_SNAPSHOT_SIZE_MAX, "/tmp/web_snapshot2.jpg", GK_ENC_SNAPSHOT_QUALITY_MEDIUM);

    return HPE_RET_SUCCESS;
}

static int web_language(HTTP_OPS* ops, void* arg)
{
	int method = ops->get_method(ops);
	int language = 0;
	char *buf;
	int bodyLen=0;
	char retData[256];
	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
	if(method == METHOD_GET)
	{
		switch(runSystemCfg.deviceInfo.languageType)
		{
			case 0:
				language = 0;
				break;
			case 1:
				language = 7;
			default:
				break;
		}
		sprintf(retData,"{\"language\": \"%d\"}",language);
		ops->set_body_ex(ops,retData,strlen(retData));
	}
	else
	{
		buf = (char *)ops->get_body(ops,&bodyLen);
		if(buf == NULL)
		{
			PRINT_ERR("No http body\n");
			return HPE_RET_FAIL;
		}
		//PRINT_ERR("language buf is %s\n ",buf);

		cJSON* Object = cJSON_Parse(buf);
		language = cJSON_GetObjectItem(Object,"language")->valueint;

		if(language == 0)
		{
			//_overlay_chs=true;
            runSystemCfg.deviceInfo.languageType = 0;
		}
		else
		{
			//_overlay_chs = false;
            runSystemCfg.deviceInfo.languageType = 1;
		}
		SystemCfgSave();
        netcam_osd_update_title();
        netcam_osd_update_id();
	}
	return HPE_RET_SUCCESS;
}

static int web_sdinfo_get(HTTP_OPS* ops, void* arg)
{
	int method=ops->get_method(ops);
	int status=0,freespace=0,totalspace=0,ret=0,ismount=0;
	char retData[256];
	memset(retData, 0, 256);
	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;
	if(method==METHOD_GET)
	{
		ismount=grd_sd_is_mount();
		if(ismount==0)
		{
			 status=0;
			 PRINT_ERR("SD Card is not mount!");
		}
		else
		{
			status=1;
			totalspace = grd_sd_get_all_size();
			freespace = grd_sd_get_free_size();
		}
	sprintf(retData,"{\"status\": \"%d\",\"totalspace\":\"%d\",\"freespace\":\"%d\"}",status,totalspace,freespace);
	ops->set_body_ex(ops,retData,strlen(retData));

	}
	else
	{
		ismount=grd_sd_is_mount();
		if(ismount==0)
		{
			 status=0;
			 PRINT_ERR("SD Card is not mount,No format!");
		}
		else
		{
			status=1;
			ret=grd_sd_format();
		}
		sprintf(retData,"{\"status\":%d,\"ret\":%d}",status,ret);
		ops->set_body_ex(ops,retData,strlen(retData));
	}
	return HPE_RET_SUCCESS;
}

static int web_ftp(HTTP_OPS* ops, void* arg)
{
	cJSON *Item;
	int method = ops->get_method(ops);
	char  *ftpbuf = NULL;

	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

	if(method == METHOD_GET)
	{
		Item = cJSON_CreateObject();

		cJSON_AddItemToObject(Item, "ftp_enable", cJSON_CreateNumber(runNetworkCfg.ftp.enableFTP));
		cJSON_AddItemToObject(Item, "ftp_server", cJSON_CreateString(runNetworkCfg.ftp.address));
		cJSON_AddItemToObject(Item, "ftp_port", cJSON_CreateNumber(runNetworkCfg.ftp.port));
		cJSON_AddItemToObject(Item, "ftp_user", cJSON_CreateString(runNetworkCfg.ftp.userName));
		cJSON_AddItemToObject(Item, "ftp_pwd", cJSON_CreateString(runNetworkCfg.ftp.password));
		cJSON_AddItemToObject(Item, "ftp_dir", cJSON_CreateString(runNetworkCfg.ftp.datapath));

		ftpbuf = cJSON_Print(Item);
		if( ftpbuf == NULL)
		{
			cJSON_Delete(Item);
			return HPE_RET_FAIL;
		}
		//PRINT_INFO("strlen(ftpbuf):%d\n%s\n",strlen(ftpbuf),ftpbuf);
		ops->set_body_ex(ops,ftpbuf,strlen(ftpbuf));
	}
	else
	{
		GK_NET_FTP_PARAM ftpcfg;
		int bodyLen = 0;
		char retData[256]={0};

		ftpbuf = (char *)ops->get_body(ops,&bodyLen);
		if(ftpbuf ==NULL)
		{
			PRINT_ERR("No http body\n");
			return HPE_RET_FAIL;

		}
		//get json data
		ftpbuf[bodyLen] = 0;
		//PRINT_INFO("receive json data:%s\n",ftpbuf);

		Item = cJSON_Parse(ftpbuf);
		if(Item == NULL)
		{
			PRINT_ERR("http body json error\n");
			return HPE_RET_FAIL;
		}
		ftpcfg.enableFTP = cJSON_GetObjectItem(Item,"ftp_enable")->valueint;
		strcpy(ftpcfg.address, cJSON_GetObjectItem(Item,"ftp_server")->valuestring);
		ftpcfg.port = cJSON_GetObjectItem(Item,"ftp_port")->valueint;
		strcpy(ftpcfg.userName, cJSON_GetObjectItem(Item,"ftp_user")->valuestring);
		strcpy(ftpcfg.password, cJSON_GetObjectItem(Item,"ftp_pwd")->valuestring);
		strcpy(ftpcfg.datapath, cJSON_GetObjectItem(Item,"ftp_dir")->valuestring);
		strcpy(ftpcfg.filename, runNetworkCfg.ftp.filename);
		ftpcfg.interval = runNetworkCfg.ftp.interval;
		if(cJSON_GetObjectItem(Item,"ftp_test_en")->valueint)
		{
            #ifdef MODULE_SUPPORT_FTP
			bodyLen = netcam_ftp_check(ftpcfg.address, ftpcfg.port, ftpcfg.userName, ftpcfg.password);
            #endif
        }
		else
		{
			memcpy(&runNetworkCfg.ftp, &ftpcfg, sizeof(GK_NET_FTP_PARAM));
            //netcam_timer_add_task(NetworkCfgSave, NETCAM_TIMER_TWO_SEC, SDK_FALSE, SDK_TRUE);
            //CREATE_WORK(NetWorkSave, EVENT_TIMER_WORK, (WORK_CALLBACK)NetworkCfgSave);
            //INIT_WORK(NetWorkSave, COMPUTE_TIME(0,0,0,1,0), NULL);
            //SCHEDULE_DEFAULT_WORK(NetWorkSave);
			CRTSCH_DEFAULT_WORK(EVENT_TIMER_WORK, COMPUTE_TIME(0,0,0,1,0), (WORK_CALLBACK)NetworkCfgSave);
			bodyLen = 1;
		}

		sprintf(retData,"{\"statusCode\": \"%d\"}",bodyLen);
		ops->set_body_ex(ops,retData,strlen(retData));
	}

	cJSON_Delete(Item);
	return HPE_RET_SUCCESS;
}

static int web_email(HTTP_OPS* ops, void* arg)
{
	cJSON *Item;
	int method = ops->get_method(ops);
	char  *emailbuf = NULL;
	char AddrList[256]={0};

	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

	if(method == METHOD_GET)
	{
		Item = cJSON_CreateObject();

		cJSON_AddItemToObject(Item, "mail_enable", cJSON_CreateNumber(runNetworkCfg.email.enableEmail));
		cJSON_AddItemToObject(Item, "pic_ck", cJSON_CreateNumber(runNetworkCfg.email.attachPicture));
		cJSON_AddItemToObject(Item, "smtpServerVerify", cJSON_CreateNumber(runNetworkCfg.email.smtpServerVerify));
		cJSON_AddItemToObject(Item, "mailInterval", cJSON_CreateNumber(runNetworkCfg.email.mailInterval));
		cJSON_AddItemToObject(Item, "mail_sender", cJSON_CreateString(runNetworkCfg.email.eMailUser));
		cJSON_AddItemToObject(Item, "mail_pwd", cJSON_CreateString(runNetworkCfg.email.eMailPass));
		cJSON_AddItemToObject(Item, "mail_encrypt", cJSON_CreateNumber(runNetworkCfg.email.encryptionType));
		cJSON_AddItemToObject(Item, "mail_svr", cJSON_CreateString(runNetworkCfg.email.smtpServer));
		cJSON_AddItemToObject(Item, "smtp_port", cJSON_CreateNumber(runNetworkCfg.email.smtpPort));
		cJSON_AddItemToObject(Item, "pop3Server", cJSON_CreateString(runNetworkCfg.email.pop3Server));
		cJSON_AddItemToObject(Item, "pop3Port", cJSON_CreateNumber(runNetworkCfg.email.pop3Port));
		cJSON_AddItemToObject(Item, "sender", cJSON_CreateString(runNetworkCfg.email.fromAddr));
		if(strcmp(runNetworkCfg.email.toAddrList0, "")!=0)
		{
			sprintf(AddrList, "%s", runNetworkCfg.email.toAddrList0);
			if(strcmp(runNetworkCfg.email.toAddrList1, "")!=0)
			{
				sprintf(AddrList, "%s;%s", AddrList,runNetworkCfg.email.toAddrList1);
				if(strcmp(runNetworkCfg.email.toAddrList2, "")!=0)
				{
					sprintf(AddrList, "%s;%s", AddrList,runNetworkCfg.email.toAddrList2);
					if(strcmp(runNetworkCfg.email.toAddrList3, "")!=0)
						sprintf(AddrList, "%s;%s", AddrList,runNetworkCfg.email.toAddrList3);
				}
			}
		}
		else
			strcpy(AddrList, "");
		cJSON_AddItemToObject(Item, "receiver", cJSON_CreateString(AddrList));

		if(strcmp(runNetworkCfg.email.ccAddrList0, "")!=0)
		{
			sprintf(AddrList, "%s", runNetworkCfg.email.ccAddrList0);
			if(strcmp(runNetworkCfg.email.ccAddrList1, "")!=0)
			{
				sprintf(AddrList, "%s;%s", AddrList,runNetworkCfg.email.ccAddrList1);
				if(strcmp(runNetworkCfg.email.ccAddrList2, "")!=0)
				{
					sprintf(AddrList, "%s;%s", AddrList,runNetworkCfg.email.ccAddrList2);
					if(strcmp(runNetworkCfg.email.ccAddrList3, "")!=0)
						sprintf(AddrList, "%s;%s", AddrList,runNetworkCfg.email.ccAddrList3);
				}
			}
		}
		else
			strcpy(AddrList, "");
		cJSON_AddItemToObject(Item, "rec_cc", cJSON_CreateString(AddrList));

		if(strcmp(runNetworkCfg.email.bccAddrList0, "")!=0)
		{
			sprintf(AddrList, "%s", runNetworkCfg.email.bccAddrList0);
			if(strcmp(runNetworkCfg.email.bccAddrList1, "")!=0)
			{
				sprintf(AddrList, "%s;%s", AddrList,runNetworkCfg.email.bccAddrList1);
				if(strcmp(runNetworkCfg.email.bccAddrList2, "")!=0)
				{
					sprintf(AddrList, "%s;%s", AddrList,runNetworkCfg.email.bccAddrList2);
					if(strcmp(runNetworkCfg.email.bccAddrList3, "")!=0)
						sprintf(AddrList, "%s;%s", AddrList,runNetworkCfg.email.bccAddrList3);
				}
			}
		}
		else
			strcpy(AddrList, "");
		cJSON_AddItemToObject(Item, "rec_bcc", cJSON_CreateString(AddrList));
		//sprintf(AddrList, "%s;%s;%s;%s", runNetworkCfg.email.toAddrList0, runNetworkCfg.email.toAddrList1, runNetworkCfg.email.toAddrList2, runNetworkCfg.email.toAddrList3);
		//cJSON_AddItemToObject(Item, "receiver", cJSON_CreateString(AddrList));
		//sprintf(AddrList, "%s;%s;%s;%s", runNetworkCfg.email.ccAddrList0, runNetworkCfg.email.ccAddrList1, runNetworkCfg.email.ccAddrList2, runNetworkCfg.email.ccAddrList3);
		//cJSON_AddItemToObject(Item, "rec_cc", cJSON_CreateString(AddrList));
		//sprintf(AddrList, "%s;%s;%s;%s", runNetworkCfg.email.bccAddrList0, runNetworkCfg.email.bccAddrList1, runNetworkCfg.email.bccAddrList2, runNetworkCfg.email.bccAddrList3);
		//cJSON_AddItemToObject(Item, "rec_bcc", cJSON_CreateString(AddrList));

		emailbuf = cJSON_Print(Item);
		if( emailbuf == NULL)
		{
			cJSON_Delete(Item);
			return HPE_RET_FAIL;
		}
		//PRINT_INFO("strlen(emailbuf):%d\n%s\n",strlen(emailbuf),emailbuf);
		ops->set_body_ex(ops,emailbuf,strlen(emailbuf));
	}
	else
	{
		GK_NET_EMAIL_PARAM emailcfg;
		int bodyLen = 0;
		char retData[256]={0};
		char *separate = ";,";
		char *Addr=NULL;

		emailbuf = (char *)ops->get_body(ops,&bodyLen);
		if(emailbuf ==NULL)
		{
			PRINT_ERR("No http body\n");
			return HPE_RET_FAIL;

		}
		//get json data
		emailbuf[bodyLen] = 0;
		//PRINT_INFO("receive json data:%s\n",emailbuf);

		Item = cJSON_Parse(emailbuf);
		if(Item == NULL)
		{
			PRINT_ERR("http body json error\n");
			return HPE_RET_FAIL;
		}
		//memcpy(&emailcfg, &runNetworkCfg.email, sizeof(GK_NET_EMAIL_PARAM));
		memset(&emailcfg, 0, sizeof(GK_NET_EMAIL_PARAM));
		emailcfg.enableEmail   = cJSON_GetObjectItem(Item,"mail_enable")->valueint;
		emailcfg.attachPicture = cJSON_GetObjectItem(Item,"mail_pic_ck")->valueint;
		//emailcfg.smtpServerVerify = runNetworkCfg.email.smtpServerVerify;
		//emailcfg.mailInterval = runNetworkCfg.email.mailInterval;
		strcpy(emailcfg.eMailUser, cJSON_GetObjectItem(Item,"mail_sender")->valuestring);
		strcpy(emailcfg.eMailPass, cJSON_GetObjectItem(Item,"mail_pwd")->valuestring);
		emailcfg.encryptionType = cJSON_GetObjectItem(Item,"mail_encrypt")->valueint;
		strcpy(emailcfg.smtpServer, cJSON_GetObjectItem(Item,"mail_server")->valuestring);
		emailcfg.smtpPort = cJSON_GetObjectItem(Item,"mail_port")->valueint;
		//strcpy(emailcfg.pop3Server, runNetworkCfg.email.pop3Server);
		//emailcfg.pop3Port = runNetworkCfg.email.pop3Port;
		strcpy(emailcfg.fromAddr, cJSON_GetObjectItem(Item,"mail_sender")->valuestring);

		strcpy(AddrList, cJSON_GetObjectItem(Item,"mail_receiver")->valuestring);

		if(strcmp(AddrList, "")!=0)
		{
			Addr = strtok(AddrList, separate);
			if(Addr!=NULL)
			{
				strcpy(emailcfg.toAddrList0, Addr);
				Addr = strtok(NULL, separate);
				if(Addr!=NULL)
				{
					strcpy(emailcfg.toAddrList1, Addr);
					Addr = strtok(NULL, separate);
					if(Addr!=NULL)
					{
						strcpy(emailcfg.toAddrList2, Addr);
						Addr = strtok(NULL, separate);
						if(Addr!=NULL)
						{
							strcpy(emailcfg.toAddrList3, Addr);
							Addr = strtok(NULL, separate);
						}
					}
				}
			}
		}
		//strcpy(emailcfg.toAddrList0, strtok(AddrList, separate));
		//strcpy(emailcfg.toAddrList1, strtok(NULL, separate));
		//strcpy(emailcfg.toAddrList2, strtok(NULL, separate));
		//strcpy(emailcfg.toAddrList3, strtok(NULL, separate));


		strcpy(AddrList, cJSON_GetObjectItem(Item,"mail_rec_cc")->valuestring);

		if(strcmp(AddrList, "")!=0)
		{
			Addr = strtok(AddrList, separate);
			if(Addr!=NULL)
			{
				strcpy(emailcfg.ccAddrList0, Addr);
				Addr = strtok(NULL, separate);
				if(Addr!=NULL)
				{
					strcpy(emailcfg.ccAddrList1, Addr);
					Addr = strtok(NULL, separate);
					if(Addr!=NULL)
					{
						strcpy(emailcfg.ccAddrList2, Addr);
						Addr = strtok(NULL, separate);
						if(Addr!=NULL)
						{
							strcpy(emailcfg.ccAddrList3, Addr);
							Addr = strtok(NULL, separate);
						}
					}
				}
			}
		}

		//strcpy(emailcfg.ccAddrList0, strtok(AddrList, separate));
		//strcpy(emailcfg.ccAddrList1, strtok(NULL, separate));
		//strcpy(emailcfg.ccAddrList2, strtok(NULL, separate));
		//strcpy(emailcfg.ccAddrList3, strtok(NULL, separate));


		strcpy(AddrList, cJSON_GetObjectItem(Item,"mail_rec_bcc")->valuestring);

		if(strcmp(AddrList, "")!=0)
		{
			Addr = strtok(AddrList, separate);
			if(Addr!=NULL)
			{
				strcpy(emailcfg.bccAddrList0, Addr);
				Addr = strtok(NULL, separate);
				if(Addr!=NULL)
				{
					strcpy(emailcfg.bccAddrList1, Addr);
					Addr = strtok(NULL, separate);
					if(Addr!=NULL)
					{
						strcpy(emailcfg.bccAddrList2, Addr);
						Addr = strtok(NULL, separate);
						if(Addr!=NULL)
						{
							strcpy(emailcfg.bccAddrList3, Addr);
							Addr = strtok(NULL, separate);
						}
					}
				}
			}
		}
		//strcpy(emailcfg.bccAddrList0, strtok(AddrList, separate));
		//strcpy(emailcfg.bccAddrList1, strtok(NULL, separate));
		//strcpy(emailcfg.bccAddrList2, strtok(NULL, separate));
		//strcpy(emailcfg.bccAddrList3, strtok(NULL, separate));

		memcpy(&runNetworkCfg.email, &emailcfg, sizeof(GK_NET_EMAIL_PARAM));
		//netcam_timer_add_task(NetworkCfgSave, NETCAM_TIMER_TWO_SEC, SDK_FALSE, SDK_TRUE);
    	//CREATE_WORK(NetWorkSave, EVENT_TIMER_WORK, (WORK_CALLBACK)NetworkCfgSave);
    	//INIT_WORK(NetWorkSave, COMPUTE_TIME(0,0,0,1,0), NULL);
    	//SCHEDULE_DEFAULT_WORK(NetWorkSave);
		CRTSCH_DEFAULT_WORK(EVENT_TIMER_WORK, COMPUTE_TIME(0,0,0,1,0), (WORK_CALLBACK)NetworkCfgSave);
        bodyLen = 1;


		sprintf(retData,"{\"statusCode\": \"%d\"}",bodyLen);
		ops->set_body_ex(ops,retData,strlen(retData));

	}

	cJSON_Delete(Item);
	return HPE_RET_SUCCESS;

}

static int web_alarm(HTTP_OPS* ops, void* arg)
{
	cJSON *Item;
	int method = ops->get_method(ops);
	int i=0;
	char  *alarmbuf = NULL;

	//PRINT_INFO("Method:%s\n",get_method_string(method));
	if(netcam_http_service(ops)==0)
		return HPE_RET_UNAUTHORIZED;

	if(method == METHOD_GET)
	{
		Item = cJSON_CreateObject();
		cJSON_AddItemToObject(Item, "alarm_enable", cJSON_CreateNumber(runMdCfg.enable));
		cJSON_AddItemToObject(Item, "sensitivity", cJSON_CreateNumber(runMdCfg.sensitive));
		cJSON_AddItemToObject(Item, "alarm_interval", cJSON_CreateNumber(runMdCfg.handle.intervalTime));
		cJSON_AddItemToObject(Item, "Linkage_mail", cJSON_CreateNumber(runMdCfg.handle.is_email));

		cJSON_AddItemToObject(Item, "linkage_record", cJSON_CreateNumber(runMdCfg.handle.is_rec));
		//cJSON_AddItemToObject(Item, "recTime", cJSON_CreateNumber(runMdCfg.handle.recTime));
		//cJSON_AddItemToObject(Item, "recStreamNo", cJSON_CreateNumber(runMdCfg.handle.recStreamNo));

		cJSON_AddItemToObject(Item, "linkage_capture", cJSON_CreateNumber(runMdCfg.handle.isSnapSaveToSd));

		cJSON_AddItemToObject(Item, "Linkage_ftp", cJSON_CreateNumber(runMdCfg.handle.isSnapUploadToFtp));
		//cJSON_AddItemToObject(Item, "isSnapUploadToWeb", cJSON_CreateNumber(runMdCfg.handle.isSnapUploadToWeb));
		//cJSON_AddItemToObject(Item, "isSnapUploadToCms", cJSON_CreateNumber(runMdCfg.handle.isSnapUploadToCms));
		//cJSON_AddItemToObject(Item, "isSnapSaveToSd", cJSON_CreateNumber(runMdCfg.handle.isSnapSaveToSd));
		//cJSON_AddItemToObject(Item, "snapNum", cJSON_CreateNumber(runMdCfg.handle.snapNum));
		//cJSON_AddItemToObject(Item, "interval", cJSON_CreateNumber(runMdCfg.handle.interval));

		cJSON_AddItemToObject(Item, "Alarm_IO", cJSON_CreateNumber(runMdCfg.handle.is_alarmout));
		//cJSON_AddItemToObject(Item, "duration", cJSON_CreateNumber(runMdCfg.handle.duration));
		cJSON_AddItemToObject(Item, "linkage_buzzing", cJSON_CreateNumber(runMdCfg.handle.is_beep));
		//cJSON_AddItemToObject(Item, "beepTime", cJSON_CreateNumber(runMdCfg.handle.beepTime));
		//cJSON_AddItemToObject(Item, "is_ptz", cJSON_CreateNumber(runMdCfg.handle.is_ptz));
		//cJSON_AddItemToObject(Item, "ptzLink_type", cJSON_CreateNumber(runMdCfg.handle.ptzLink.type));
		//cJSON_AddItemToObject(Item, "ptzLink_value", cJSON_CreateNumber(runMdCfg.handle.ptzLink.value));


		//cJSON_AddItemToObject(Item, "schedule_mode", cJSON_CreateNumber(runMdCfg.schedule_mode));
		cJSON *Array = cJSON_CreateArray();
		for(i=0;i<7;i++)
		{
			cJSON *Object = cJSON_CreateObject();
			cJSON_AddItemToObject(Object, "starthour1", cJSON_CreateNumber(runMdCfg.scheduleTime[i][0].startHour));
			cJSON_AddItemToObject(Object, "startmin1", cJSON_CreateNumber(runMdCfg.scheduleTime[i][0].startMin));
			cJSON_AddItemToObject(Object, "endhour1", cJSON_CreateNumber(runMdCfg.scheduleTime[i][0].stopHour));
			cJSON_AddItemToObject(Object, "endmin1", cJSON_CreateNumber(runMdCfg.scheduleTime[i][0].stopMin));

			cJSON_AddItemToObject(Object, "starthour2", cJSON_CreateNumber(runMdCfg.scheduleTime[i][1].startHour));
			cJSON_AddItemToObject(Object, "startmin2", cJSON_CreateNumber(runMdCfg.scheduleTime[i][1].startMin));
			cJSON_AddItemToObject(Object, "endhour2", cJSON_CreateNumber(runMdCfg.scheduleTime[i][1].stopHour));
			cJSON_AddItemToObject(Object, "endmin2", cJSON_CreateNumber(runMdCfg.scheduleTime[i][1].stopMin));
			cJSON_AddItemToArray(Array, Object);
		}
		cJSON_AddItemToObject(Item, "set_time", Array);
		//cJSON_AddItemToObject(Item, "pop3Server", cJSON_CreateString(runMdCfg.scheduleSlice[0][0]));

		alarmbuf = cJSON_Print(Item);
		if( alarmbuf == NULL)
		{
			cJSON_Delete(Item);
			return HPE_RET_FAIL;
		}
		//PRINT_INFO("strlen(alarmbuf):%d\n%s\n",strlen(alarmbuf),alarmbuf);
		ops->set_body_ex(ops,alarmbuf,strlen(alarmbuf));
	}
	else
	{
		int bodyLen = 0;
		char retData[256]={0};

		alarmbuf = (char *)ops->get_body(ops,&bodyLen);
		if(alarmbuf ==NULL)
		{
			PRINT_ERR("No http body\n");
			return HPE_RET_FAIL;

		}
		//get json data
		alarmbuf[bodyLen] = 0;
		//PRINT_INFO("receive json data:%s\n",alarmbuf);

		Item = cJSON_Parse(alarmbuf);
		if(Item == NULL)
		{
			PRINT_ERR("http body json error\n");
			return HPE_RET_FAIL;
		}

		runMdCfg.enable = cJSON_GetObjectItem(Item,"alarm_enable")->valueint;
		runMdCfg.sensitive = cJSON_GetObjectItem(Item,"sensitivity")->valueint;
		runMdCfg.handle.intervalTime = cJSON_GetObjectItem(Item,"alarm_interval")->valueint;
		runMdCfg.handle.is_email = cJSON_GetObjectItem(Item,"Linkage_mail")->valueint;
		runMdCfg.handle.is_rec = cJSON_GetObjectItem(Item,"linkage_record")->valueint;
		//runMdCfg.handle.recTime = cJSON_GetObjectItem(Item,"recTime")->valueint;
		//runMdCfg.handle.recStreamNo = cJSON_GetObjectItem(Item,"recStreamNo")->valueint;

		runMdCfg.handle.isSnapSaveToSd = cJSON_GetObjectItem(Item,"linkage_capture")->valueint;
		runMdCfg.handle.isSnapUploadToFtp = cJSON_GetObjectItem(Item,"Linkage_ftp")->valueint;
		//runMdCfg.handle.isSnapUploadToWeb = cJSON_GetObjectItem(Item,"isSnapUploadToWeb")->valueint;
		//runMdCfg.handle.isSnapUploadToCms = cJSON_GetObjectItem(Item,"isSnapUploadToCms")->valueint;
		//runMdCfg.handle.isSnapSaveToSd = cJSON_GetObjectItem(Item,"isSnapSaveToSd")->valueint;
		//runMdCfg.handle.snapNum = cJSON_GetObjectItem(Item,"snapNum")->valueint;
		//runMdCfg.handle.interval = cJSON_GetObjectItem(Item,"interval")->valueint;

		runMdCfg.handle.is_alarmout = cJSON_GetObjectItem(Item,"Alarm_IO")->valueint;
		//runMdCfg.handle.duration = cJSON_GetObjectItem(Item,"duration")->valueint;
		runMdCfg.handle.is_beep = cJSON_GetObjectItem(Item,"linkage_buzzing")->valueint;
		//runMdCfg.handle.beepTime = cJSON_GetObjectItem(Item,"beepTime")->valueint;
		//runMdCfg.handle.is_ptz = cJSON_GetObjectItem(Item,"is_ptz")->valueint;
		//runMdCfg.handle.ptzLink.type = cJSON_GetObjectItem(Item,"ptzLink_type")->valueint;
		//runMdCfg.handle.ptzLink.value = cJSON_GetObjectItem(Item,"ptzLink_value")->valueint;

		//runMdCfg.schedule_mode = cJSON_GetObjectItem(Item,"schedule_mode")->valueint;
		if (runMdCfg.handle.isSnapSaveToSd ||runMdCfg.handle.isSnapUploadToFtp ||
			runMdCfg.handle.is_beep ||	runMdCfg.handle.is_email)
		{
			runMdCfg.handle.is_snap = 1;
		}
		else
		{
			runMdCfg.handle.is_snap = 0;
		}

		cJSON *Array = cJSON_GetObjectItem(Item, "set_time");
		for(i=0;i<7;i++)
		{
			cJSON *Object = cJSON_GetArrayItem(Array, i);
			runMdCfg.scheduleTime[i][0].startHour = cJSON_GetObjectItem(Object, "starthour1")->valueint;
			runMdCfg.scheduleTime[i][0].startMin = cJSON_GetObjectItem(Object, "startmin1")->valueint;
			runMdCfg.scheduleTime[i][0].stopHour = cJSON_GetObjectItem(Object, "endhour1")->valueint;
			runMdCfg.scheduleTime[i][0].stopMin = cJSON_GetObjectItem(Object, "endmin1")->valueint;
			runMdCfg.scheduleTime[i][1].startHour = cJSON_GetObjectItem(Object, "starthour2")->valueint;
			runMdCfg.scheduleTime[i][1].startMin = cJSON_GetObjectItem(Object, "startmin2")->valueint;
			runMdCfg.scheduleTime[i][1].stopHour = cJSON_GetObjectItem(Object, "endhour2")->valueint;
			runMdCfg.scheduleTime[i][1].stopMin = cJSON_GetObjectItem(Object, "endmin2")->valueint;
		}
		//runMdCfg.scheduleSlice[0][0]

		//netcam_timer_add_task(MdCfgSave, NETCAM_TIMER_TWO_SEC, SDK_FALSE, SDK_TRUE);

    	//CREATE_WORK(SetAlarm1, EVENT_TIMER_WORK, (WORK_CALLBACK)MdCfgSave);
    	//INIT_WORK(SetAlarm1, COMPUTE_TIME(0,0,0,1,0), NULL);
    	//SCHEDULE_DEFAULT_WORK(SetAlarm1);
    	netcam_md_set_sensitivity_percentage(0, runMdCfg.sensitive);
		CRTSCH_DEFAULT_WORK(EVENT_TIMER_WORK, COMPUTE_TIME(0,0,0,1,0), (WORK_CALLBACK)MdCfgSave);
        bodyLen = 1;
		sprintf(retData,"{\"statusCode\": \"%d\"}",bodyLen);
		ops->set_body_ex(ops,retData,strlen(retData));
	}

	cJSON_Delete(Item);
	return HPE_RET_SUCCESS;
}


void add_p2p_info(char *name,char *ID)
{
	int i=0;
	if(ID==NULL||name==NULL)
		return;
	for(i=0;i<5;i++)
	{
		if(strcmp(run_p2p_id[i].name,"")==0)
		{
			strcpy(run_p2p_id[i].name,name);
			strcpy(run_p2p_id[i].ID,ID);
			break;
		}
	}

}


static int web_qrcode(HTTP_OPS* ops, void* arg)
{
	char *qrbuf;
	//struct device_info_mtd pinfo = {0};
	cJSON *Item;
	cJSON *obj;
	Item = cJSON_CreateArray();

	int i=0;
    for(i=0;i<5;i++)
    {
    	if(strcmp(run_p2p_id[i].name,"")!=0)
    	{
    		cJSON *_Item;
	    	_Item = cJSON_CreateObject();
    		cJSON_AddItemToObject(_Item, "name", cJSON_CreateString(run_p2p_id[i].name));
		cJSON_AddItemToObject(_Item, "ID", cJSON_CreateString(run_p2p_id[i].ID));
		 cJSON_AddItemToArray(Item, _Item);
	}
    }
	obj=cJSON_CreateObject();
	cJSON_AddItemToObject(obj,"qr",Item);
	qrbuf = cJSON_Print(obj);

	//printf("qrbuf is %s",qrbuf);
	if( qrbuf == NULL)
	{
		cJSON_Delete(obj);
		return HPE_RET_FAIL;
	}
	ops->set_body_ex(ops,qrbuf,strlen(qrbuf));
	cJSON_Delete(obj);
	return HPE_RET_SUCCESS;
}
void netcam_http_web_init()
{

	http_mini_add_cgi_callback("/cgi-bin/settime", web_time, METHOD_GET|METHOD_PUT, (void *)0);
	http_mini_add_cgi_callback("/image", web_image_basic, METHOD_GET|METHOD_PUT, (void *)0);
	//http_mini_add_cgi_callback("/image/slider", web_image_slider, METHOD_GET|METHOD_PUT, (void *)0);
	http_mini_add_cgi_callback("/video", web_stream_control, METHOD_GET|METHOD_PUT, (void *)0);
	http_mini_add_cgi_callback("/overlayer", web_overlayer_control, METHOD_GET|METHOD_PUT, (void *)0);
	http_mini_add_cgi_callback("/cgi-bin/sys_reset", web_reset_default, METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/cover", web_cover_control, METHOD_GET|METHOD_PUT, (void *)0);
	http_mini_add_cgi_callback("/cgi-bin/sys_reboot", web_sys_reboot, METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/cgi-bin/sys_info", web_sys_info, METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/NetSetting", web_local_eth_control, METHOD_GET|METHOD_PUT, (void *)0);
	http_mini_add_cgi_callback("/user", web_user_control, METHOD_GET|METHOD_PUT, (void *)0);
	http_mini_add_cgi_callback("/cgi-bin/sys_onvif", web_sys_onvif, METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/cgi-bin/ptz_control", web_ptz_control, METHOD_PUT, (void *)0);
	http_mini_add_cgi_callback("/device_upgrade_state", device_upgrade_state, METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/login", web_login, METHOD_PUT|METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/wireless", web_wireless, METHOD_PUT|METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/wireless_enable",web_wifi_enable, METHOD_PUT|METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/snapshot", web_snapshot, METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/snapshotjpg", web_snapshotjpg, METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/language",web_language,METHOD_PUT|METHOD_GET,(void *)0);
	//the format of http body is mail style updating package, it add mail information.
	http_mini_add_cgi_callback("/sd", web_sdinfo_get,METHOD_GET|METHOD_PUT, (void *)0);
	http_mini_add_cgi_callback("/web_upgrade", web_upgrade_read_cb, METHOD_PUT|METHOD_POST, (void *)0);
	http_mini_add_read_callback("/web_upgrade", web_upgrade_read);
	http_mini_add_cgi_callback("/check_login",web_check_login,METHOD_GET|METHOD_PUT, (void *)0);
	//the format of http body is updating package
	http_mini_add_cgi_callback("/device_upgrade", device_upgrade_cb, METHOD_PUT|METHOD_POST, (void *)0);
	http_mini_add_read_callback("/device_upgrade", device_upgrade);
	http_mini_add_cgi_callback("/ftp", web_ftp, METHOD_PUT|METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/email", web_email, METHOD_PUT|METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/alarm", web_alarm, METHOD_PUT|METHOD_GET, (void *)0);
	http_mini_add_cgi_callback("/wireless_mode",web_wirelessmode,METHOD_GET|METHOD_PUT,(void *)0 );
	http_mini_add_cgi_callback("/ap_wireless",web_ap_wireless,METHOD_GET|METHOD_PUT,(void *)0 );
	http_mini_add_cgi_callback("/qrcode",web_qrcode,METHOD_GET,(void *)0 );
	http_mini_add_cgi_callback("/autolight", web_autolight, METHOD_GET|METHOD_PUT, (void *)0);

#ifdef MODULE_SUPPORT_GB28181
	http_mini_add_cgi_callback("/gb28181", get_gb28181, METHOD_GET|METHOD_PUT, (void *)0);
#endif
	http_mini_add_cgi_callback("/gb28181_status", get_gb28181_status, METHOD_GET|METHOD_PUT, (void *)0);
    memset(&run_p2p_id[0], 0, sizeof(run_p2p_id));

}

