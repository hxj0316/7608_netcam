/*!
*****************************************************************************
** FileName     : cfg_system.c
**
** Description  : system infomation config api.
**
** Author       : Bruce <zhaoquanfeng@gokemicro.com>
** Create Date  : 2015-8-4
**
** (C) Copyright 2013-2014 by GOKE MICROELECTRONICS CO.,LTD
**
*****************************************************************************
*/

#include <ctype.h>
#include "cfg_system.h"
#include "sdk_sys.h"
#include "sdk_debug.h"
#include "cfg_store.h"

extern int copy_file(char *src_name, char *des_name);


GK_SYSTEM_INFO g_systemInfo;
GK_NET_SYSTEM_CFG runSystemCfg;

#if USE_DEFAULT_PARAM
GK_CFG_MAP deviceInfoMap[] = {
    {"deviceName",        &(runSystemCfg.deviceInfo.deviceName),        GK_CFG_DATA_TYPE_STRING, "GKIPC",      1, 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"description",       &(runSystemCfg.deviceInfo.manufacturer),      GK_CFG_DATA_TYPE_STRING, "GOKE",     1, 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"deviceType",       &(runSystemCfg.deviceInfo.deviceType),         GK_CFG_DATA_TYPE_STRING, "IPC_A1",   1, 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"sensorType",        &(runSystemCfg.deviceInfo.sensorType),        GK_CFG_DATA_TYPE_S32,    "0",        1, 0, 10, "0: IMX222; 1 OV9710 2 ..."},
    {"languageType",      &(runSystemCfg.deviceInfo.languageType),      GK_CFG_DATA_TYPE_S32,    "0",        1, 0, 18, "0: chiness; 1 english 2 japanese; 3 ..."},
    {"videoType",         &(runSystemCfg.deviceInfo.videoType),         GK_CFG_DATA_TYPE_S32,    "0",        1, 0, 1, "0 pal, 1 ntsc"},

    {"serialNumber",        &(runSystemCfg.deviceInfo.serialNumber),        GK_CFG_DATA_TYPE_STRING,  "000000000000", "ro", 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"softwareVersion",     &(runSystemCfg.deviceInfo.softwareVersion),     GK_CFG_DATA_TYPE_STRING,  "S-1.230.586",     "ro", 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"softwareBuildDate",   &(runSystemCfg.deviceInfo.softwareBuildDate),   GK_CFG_DATA_TYPE_STRING,  "20150928", "ro", 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"firmwareVersion",     &(runSystemCfg.deviceInfo.firmwareVersion),     GK_CFG_DATA_TYPE_STRING,  "F-1.0",     "ro", 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"firmwareReleaseDate", &(runSystemCfg.deviceInfo.firmwareReleaseDate), GK_CFG_DATA_TYPE_STRING,  "20150928", "ro", 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"hardwareVersion",     &(runSystemCfg.deviceInfo.hardwareVersion),     GK_CFG_DATA_TYPE_STRING,  "H-1.1.1",     "ro", 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"hardwareBuildDate",   &(runSystemCfg.deviceInfo.hardwareBuildDate),   GK_CFG_DATA_TYPE_STRING,  "20150928", "ro", 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"webVersion",          &(runSystemCfg.deviceInfo.webVersion),          GK_CFG_DATA_TYPE_STRING,  "W-1.0",     "ro", 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"webBuildDate",        &(runSystemCfg.deviceInfo.webBuildDate),        GK_CFG_DATA_TYPE_STRING,  "20150928", "ro", 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"odmId",               &(runSystemCfg.deviceInfo.odmId),               GK_CFG_DATA_TYPE_S32,    "10",        1, 0, 30, "1: ds; 10: goke "},
    {"model",               &(runSystemCfg.deviceInfo.model),               GK_CFG_DATA_TYPE_STRING,  "GOKE_YTJ_AP_001",     1, 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"devType",             &(runSystemCfg.deviceInfo.devType),             GK_CFG_DATA_TYPE_S32,    "1",        1, 0, 10, "0:kjp, 1:ytj, 2:allview,3:single door ring,4:dual door ring，5: 38 model"},

    {NULL,},
};

GK_CFG_MAP timezoneCfgMap[] = {
    {"timeZone", &(runSystemCfg.timezoneCfg.timezone), GK_CFG_DATA_TYPE_S32, "480", 1, -720, 720,  NULL},
	{"timeZone_Desc", &(runSystemCfg.timezoneCfg.time_desc), GK_CFG_DATA_TYPE_STRING, "People's Republic of China", 1, 1, 256,  NULL},
    {NULL,},
};

GK_CFG_MAP netDstCfgCfgMap[] = {
    {"netDstCfg.enableDST",  &(runSystemCfg.netDstCfg.enableDST),  GK_CFG_DATA_TYPE_S32,     "0",         1, 0, 1,  NULL},
    {"netDstCfg.dSTBias",    &(runSystemCfg.netDstCfg.dSTBias),    GK_CFG_DATA_TYPE_S32,     "0",         1, 0, 360,  NULL},
    {"netDstCfg.beginTime",  &(runSystemCfg.netDstCfg.beginTime),  GK_CFG_DATA_TYPE_STRING,  "2015.8.30", 1, 1, MAX_TIME_STR_SIZE,  NULL},
    {"netDstCfg.endTime",    &(runSystemCfg.netDstCfg.endTime),    GK_CFG_DATA_TYPE_STRING,  "2015.8.30", 1, 1, MAX_TIME_STR_SIZE,  NULL},
    {NULL,},
};

GK_CFG_MAP ntpCfgMap[] = {
    {"ntpCfg_enable",        &(runSystemCfg.ntpCfg.enable),        GK_CFG_DATA_TYPE_S32,     "1",               1, 0, 1,  NULL},
    {"ntpCfg_serverDomain",  &(runSystemCfg.ntpCfg.serverDomain),  GK_CFG_DATA_TYPE_STRING,  "time-a.nist.gov", 1, 1, MAX_URL_STR_SIZE, NULL},
    {"ntpCfg_synctime",      &(runSystemCfg.ntpCfg.sync_time),     GK_CFG_DATA_TYPE_S32,     "43200",           1, 0, 100000,  NULL},
    {"ntpCfg_port",          &(runSystemCfg.ntpCfg.port),          GK_CFG_DATA_TYPE_S32,     "123",             1, 0, 65535,  NULL},
    {"plat_addr_val",       &(runSystemCfg.ntpCfg.platurl),       GK_CFG_DATA_TYPE_STRING,   "http://192.168.20.109:8080/reportAlarmData",1,1,64,NULL},
    {"switch_485",	    &(runSystemCfg.ntpCfg.enable485),	GK_CFG_DATA_TYPE_S32,     "1",               1, 0, 1,  NULL},
    {"AI_enable",          &(runSystemCfg.ntpCfg.enableAI),   GK_CFG_DATA_TYPE_S32,     "1",               1, 0, 1,  NULL},
    {"AI_ModelNum",          &(runSystemCfg.ntpCfg.modelNum),   GK_CFG_DATA_TYPE_STRING,     "1",               1, 1, 100,  NULL},
    {"AI_PlatUrl",       &(runSystemCfg.ntpCfg.AIplat),       GK_CFG_DATA_TYPE_STRING,   "http://192.168.20.109:8080/reportAlarmData",1,1,64,NULL},
    {"AI_str",       &(runSystemCfg.ntpCfg.AI_str),       GK_CFG_DATA_TYPE_STRING,   "test",1,1,64,NULL},
    {NULL,},
};


GK_CFG_MAP maintainCfgMap[] = {
    {"enable",   &(runSystemCfg.maintainCfg.enable),  GK_CFG_DATA_TYPE_U8,    "0",  1, 0, 1,  NULL},
    {"index",    &(runSystemCfg.maintainCfg.index),   GK_CFG_DATA_TYPE_U8,    "2",  1, 0, 7,  NULL},
    {"hour",     &(runSystemCfg.maintainCfg.hour),    GK_CFG_DATA_TYPE_U8,    "3",  1, 0, 23,   NULL},
    {"minute",   &(runSystemCfg.maintainCfg.minute),  GK_CFG_DATA_TYPE_U8,    "0",  1, 0, 59,   NULL},
    {"second",   &(runSystemCfg.maintainCfg.second),  GK_CFG_DATA_TYPE_U8,    "0",  1, 0, 59,   NULL},

    {"newest_time",   &(runSystemCfg.maintainCfg.newest_time),  GK_CFG_DATA_TYPE_S32,    "0",  1, 0, 2147483647,   NULL},

    {NULL,},
};
GK_CFG_MAP systemInfoMap[] = {
    {"device_name",        &(g_systemInfo.device_name),        GK_CFG_DATA_TYPE_STRING, "gkipc",      1, 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"device_type",        &(g_systemInfo.device_type),        GK_CFG_DATA_TYPE_STRING, "ipc_a1",      1, 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"chip_type",        &(g_systemInfo.chip_type),        GK_CFG_DATA_TYPE_STRING, "gk7101",      1, 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"sensor_type",       &(g_systemInfo.sensor_type),     GK_CFG_DATA_TYPE_STRING, "ov2710_v10",     1, 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"svn_version",       &(g_systemInfo.svn_version),     GK_CFG_DATA_TYPE_STRING, "1110",   1, 1, MAX_SYSTEM_STR_SIZE, NULL},
    {"make_date",        &(g_systemInfo.make_date),        GK_CFG_DATA_TYPE_STRING,    "0",        1, 0, MAX_SYSTEM_STR_SIZE, NULL},
    {NULL,},
};

#else
GK_CFG_MAP systemInfoMap[] = {
    {"device_name",        &(g_systemInfo.device_name),    },
    {"device_type",        &(g_systemInfo.device_type),    },
    {"chip_type",        &(g_systemInfo.chip_type),        },
    {"sensor_type",       &(g_systemInfo.sensor_type),     },
    {"svn_version",       &(g_systemInfo.svn_version),     },
    {"make_date",        &(g_systemInfo.make_date),        },
    {"upgrade_version",        &(g_systemInfo.upgrade_version),        },
    {NULL,},
};

GK_CFG_MAP deviceInfoMap[] = {
    {"deviceName",        &(runSystemCfg.deviceInfo.deviceName),            },
    {"description",       &(runSystemCfg.deviceInfo.manufacturer),          },
    {"deviceType",        &(runSystemCfg.deviceInfo.deviceType),            },
    {"sensorType",        &(runSystemCfg.deviceInfo.sensorType),            },
    {"languageType",      &(runSystemCfg.deviceInfo.languageType),          },
    {"videoType",         &(runSystemCfg.deviceInfo.videoType),             },

    {"serialNumber",        &(runSystemCfg.deviceInfo.serialNumber),        },
    {"softwareVersion",     &(runSystemCfg.deviceInfo.softwareVersion),     },
    {"softwareBuildDate",   &(runSystemCfg.deviceInfo.softwareBuildDate),   },
    {"firmwareVersion",     &(runSystemCfg.deviceInfo.firmwareVersion),     },
    {"firmwareReleaseDate", &(runSystemCfg.deviceInfo.firmwareReleaseDate), },
    {"hardwareVersion",     &(runSystemCfg.deviceInfo.hardwareVersion),     },
    {"hardwareBuildDate",   &(runSystemCfg.deviceInfo.hardwareBuildDate),   },
    {"webVersion",          &(runSystemCfg.deviceInfo.webVersion),          },
    {"webBuildDate",        &(runSystemCfg.deviceInfo.webBuildDate),        },
    {"odmId",               &(runSystemCfg.deviceInfo.odmId),               },
    {"model",               &(runSystemCfg.deviceInfo.model),               },
    {"devType",             &(runSystemCfg.deviceInfo.devType),             },

    {NULL,},
};

GK_CFG_MAP timezoneCfgMap[] = {
    {"timeZone",          &(runSystemCfg.timezoneCfg.timezone),             },
    //{"timeZone_Desc", &(runSystemCfg.timezoneCfg.time_desc), GK_CFG_DATA_TYPE_STRING, "People's Republic of China", 1, 1, 256,  NULL},
    {"timeZone_Desc", &(runSystemCfg.timezoneCfg.time_desc),                },

    {NULL,},
};

GK_CFG_MAP netDstCfgCfgMap[] = {
    {"netDstCfg.enableDST",  &(runSystemCfg.netDstCfg.enableDST),  },
    {"netDstCfg.dSTBias",    &(runSystemCfg.netDstCfg.dSTBias),    },
    {"netDstCfg.beginTime",  &(runSystemCfg.netDstCfg.beginTime),  },
    {"netDstCfg.endTime",    &(runSystemCfg.netDstCfg.endTime),    },
    {NULL,},
};

GK_CFG_MAP ntpCfgMap[] = {
    {"ntpCfg_enable",        &(runSystemCfg.ntpCfg.enable),        },
    {"ntpCfg_serverDomain",  &(runSystemCfg.ntpCfg.serverDomain),  },
    {"ntpCfg_synctime",      &(runSystemCfg.ntpCfg.sync_time),     },
    {"ntpCfg_port",          &(runSystemCfg.ntpCfg.port),          },
    {"plat_addr_val",       &(runSystemCfg.ntpCfg.platurl),       },
    {"switch_485",          &(runSystemCfg.ntpCfg.enable485),	},
    {"AI_enable",	    &(runSystemCfg.ntpCfg.enableAI),   },
    {"AI_ModelNum",         &(runSystemCfg.ntpCfg.modelNum),   },
    {"AI_PlatUrl",          &(runSystemCfg.ntpCfg.AIplat),     },
    {"AI_str",              &(runSystemCfg.ntpCfg.AI_str),     },
    {NULL,},
};


GK_CFG_MAP maintainCfgMap[] = {
    {"enable",   &(runSystemCfg.maintainCfg.enable),  },
    {"index",    &(runSystemCfg.maintainCfg.index),   },
    {"hour",     &(runSystemCfg.maintainCfg.hour),    },
    {"minute",   &(runSystemCfg.maintainCfg.minute),  },
    {"second",   &(runSystemCfg.maintainCfg.second),  },

    //{"newest_time",   &(runSystemCfg.maintainCfg.newest_time),  GK_CFG_DATA_TYPE_S32,    "0",  1, 0, 2147483647,   NULL},
    {"newest_time",  &(runSystemCfg.maintainCfg.newest_time), },
    {NULL,},
};
#endif

void SystemCfgPrint()
{
    printf("*************** System **************\n");

    printf("device info:\n");
    CfgPrintMap(deviceInfoMap);
    printf("\n");

    printf("timezone:\n");
    CfgPrintMap(timezoneCfgMap);
    printf("\n");

    printf("netDST:\n");
    CfgPrintMap(netDstCfgCfgMap);
    printf("\n");

    printf("ntp:\n");
    CfgPrintMap(ntpCfgMap);
    printf("\n");

	printf("maintain:\n");
    CfgPrintMap(maintainCfgMap);
    printf("\n");

    printf("*************** System **************\n\n");
}

static int parseSysCjsonToDataByMap(GK_CFG_MAP *mapArray, char* str,cJSON *json)
{
    int i =0;
    cJSON *tmp = NULL;

    json = cJSON_GetObjectItem(json, str);
    if (!json) {
        //PRINT_ERR("Error before: [%s]\n", cJSON_GetErrorPtr());
        return -1;
    }

    while (mapArray[i].stringName != NULL) {
        tmp = cJSON_GetObjectItem(json, mapArray[i].stringName);
        if (tmp) {
				strncpy(mapArray[i].dataAddress,tmp->valuestring,MAX_SYSTEM_STR_SIZE-1);
        } else {
            //从配置文件解析cjson失败，则使用默认参数
            PRINT_INFO("[%s] cjson get failed. use default parameter\n", mapArray[i].stringName);
            //CfgLoadDefValueItem(&mapArray[i]);
        }
        i++;
    }

    return 0;
}


int LoadSystemInfo()
{
    char *data = NULL;
    data = CfgReadJsonFile(SYSTEM_INFO_FILE);
    if (data == NULL) {
        PRINT_INFO("load %s error, so to load default cfg param.\n", SYSTEM_INFO_FILE);
        return -1;
    }

    cJSON *json = NULL;
    json = cJSON_Parse(data);
    if (!json){
        PRINT_ERR("Error before: [%s]\n", cJSON_GetErrorPtr());
        free(data);
        return -1;
    }

    parseSysCjsonToDataByMap(systemInfoMap,"sys_info",json);

    cJSON_Delete(json);
    free(data);

    //printf(">>>>>>sys_info:\n");
   // CfgPrintMap(systemInfoMap);
   // printf("\n");

    return 0;
}
static void y_toupper(char* s)
{
   int i;
   char* p = (char*)s;

   for (i = 0; i < strlen(s); i++)
   {
           p[i] = toupper(p[i]);
   }
}
void loadSpecialInfo()
{
    LoadSystemInfo();
    sprintf(runSystemCfg.deviceInfo.deviceName,"%s",g_systemInfo.device_name);
    sprintf(runSystemCfg.deviceInfo.deviceType,"%s",g_systemInfo.device_type);
    y_toupper(runSystemCfg.deviceInfo.deviceName);
    y_toupper(runSystemCfg.deviceInfo.deviceType);
    if (strcmp(runSystemCfg.deviceInfo.deviceType, "GK7202_GC2053_TB_38_BIG_V2") == 0
        && access("/tmp/nowifi", F_OK) == 0)
    {
        strcpy(runSystemCfg.deviceInfo.deviceType, "GK7202_GC2053_TB_38_BIG_V3");
    }
        
    sprintf(runSystemCfg.deviceInfo.softwareVersion,"V%s",g_systemInfo.svn_version);
    sprintf(runSystemCfg.deviceInfo.hardwareVersion,"%s_%s",g_systemInfo.chip_type,g_systemInfo.sensor_type);
    y_toupper(runSystemCfg.deviceInfo.hardwareVersion);
    sprintf(runSystemCfg.deviceInfo.softwareBuildDate,"%s",g_systemInfo.make_date);

    sprintf(runSystemCfg.deviceInfo.upgradeVersion,"%s",g_systemInfo.upgrade_version);
}
/*
  add end.
*/

int SystemCfgSave()
{
    #if 0
    //保存到store cfg
    runStoreCfg.enable = 1;
    runStoreCfg.timezone = runSystemCfg.timezoneCfg.timezone;
    runStoreCfg.languageType = runSystemCfg.deviceInfo.languageType;
    StoreCfgSave();
#endif
    cJSON *root;
    char *out;

    root = cJSON_CreateObject();//创建项目

    CfgAddCjson(root, "deviceinfo", deviceInfoMap);
    CfgAddCjson(root, "timezone", timezoneCfgMap);
    CfgAddCjson(root, "netDST", netDstCfgCfgMap);
    CfgAddCjson(root, "NTP", ntpCfgMap);
	CfgAddCjson(root, "Maintain", maintainCfgMap);

    out = cJSON_Print(root);

    int ret = CfgWriteToFile(SYSTEM_CFG_FILE, out);
    if (ret != 0) {
        PRINT_ERR("CfgWriteToFile %s error.", SYSTEM_CFG_FILE);

		if(out)
			free(out);
		
		cJSON_Delete(root);
        return -1;
    }

    free(out);
    cJSON_Delete(root);

    return 0;
}

int SystemCfgLoadDefValue()
{
    CfgLoadDefValue(deviceInfoMap);
    CfgLoadDefValue(timezoneCfgMap);
    CfgLoadDefValue(netDstCfgCfgMap);
    CfgLoadDefValue(ntpCfgMap);
	CfgLoadDefValue(maintainCfgMap);

    loadSpecialInfo();
    return 0;
}

#include "sdk_cfg.h"
extern SDK_CFG_S sdk_cfg;
int SystemCfgLoad()
{
    int load_def_config = 0;
    char *data = NULL;

start_load:
    data = CfgReadFromFile(SYSTEM_CFG_FILE);
    if (data == NULL) {
        //从配置文件读取失败，则使用默认参数
        PRINT_INFO("load %s error, so to load default cfg param.\n", SYSTEM_CFG_FILE);
        goto err;
    }

    cJSON *json = NULL;
    json = cJSON_Parse(data);
    if (!json){
        //从配置文件解析cjson失败，则使用默认参数
        PRINT_ERR("Error before: [%s]\n", cJSON_GetErrorPtr());
        free(data);
        goto err;
    }

    CfgParseCjson(json, "deviceinfo", deviceInfoMap);
    CfgParseCjson(json, "timezone", timezoneCfgMap);
    CfgParseCjson(json, "netDST", netDstCfgCfgMap);
    CfgParseCjson(json, "NTP", ntpCfgMap);
	CfgParseCjson(json, "Maintain", maintainCfgMap);
    CfgPrintMap(ntpCfgMap);
    printf("wwwwhs print is %s\n", runSystemCfg.ntpCfg.AI_str);

    loadSpecialInfo();

    cJSON_Delete(json);
    free(data);


#ifdef MODULE_SUPPORT_GOKE_UPGRADE
    char cmds[64] = {0};
    if (access("/tmp/devid", F_OK) != 0)
    {
        sprintf(cmds, "echo -n %s > %s ", runSystemCfg.deviceInfo.serialNumber, "/tmp/devid");
        new_system_call(cmds);
    }
#endif


    //PRINT_INFO("SystemCfgLoad success\n");
    return 0;

err:
    if(!load_def_config)
    {

        PRINT_INFO("SystemCfgLoad failed 1\n");
        load_def_config = 1;
        char src_name[64], des_name[64];
        memset(src_name, 0, sizeof(src_name));
        snprintf(src_name,sizeof(src_name), "%s%s", DEFCFG_DIR, SYSTEM_CFG_FILE);
        memset(des_name, 0, sizeof(des_name));
        snprintf(des_name,sizeof(des_name), "%s%s", CFG_DIR, SYSTEM_CFG_FILE);
        if(!copy_file(src_name, des_name))
            goto start_load;
    }

    PRINT_ERR("SystemCfgLoadDefValue failed 2\n");

    SystemCfgLoadDefValue();
    SystemCfgSave();
    return 0;
}


cJSON *SystemCfgGetNTPJsonSting()
{
     cJSON *json = CfgDataToCjsonByMap(ntpCfgMap);
    return json;
}


char *SytemCfgGetCjsonString()
{
    cJSON *json = NULL;
    char *buf;
    json = CfgDataToCjsonByMap(deviceInfoMap);
    buf = cJSON_Print(json);
    cJSON_Delete(json);

    return buf;
}
