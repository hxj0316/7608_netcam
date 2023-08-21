#!/bin/bash

#SDK_VER: v2.1.0, v3.0.0; 
#BOARD  : hzd_jxh42_v1.0,sc4236_v1.0 ov4689_v1.0 gk7202_evb_v1.0 gk7205_evb_v1.0 gk7202_gc2053_v2.0 gk7205_gc4623_v1.0 gk7202_sc4236_aijia
#BOARD  : gk7205_mn168_v1 gk7205_os04b10_v1 gk7202_gc2053_tb gk7202_gc2053_tb_38 gk7205_gc2053_face 
#BOARD  : gk7202_gc2053_tb_38_v2 gk7202_gc2053_tb_v2 gk7202_gc2053_tb_38_big_v2 gk7202_gc2053_tb_38_big_v3 gk7202_gc2053_tb_38_big_v4 gk7202_gc2053_38_big_v4_wifi
#BOARD  : gk7202_gc2053_elife_38 gk7202_gc2053_hc_v1.0 gk7205_jxq03_ipc20 gk7205s_gc4653_ipc20 gk7202_gc2053_tb_v3 tb_38_c142v3 gk7202_gc2053_tb_38_big_v2_v4
#PROJECT: 可选配置（快速自动化部署使用相同硬件配置时，区分不同项目软件版本类型控制, eg: NEWLAND )
######################## config
#goke   
#his
#gk
#hgk
PLATFORM=hgk
#goke v3.0.0
#his his3516ev300
#gk gk7205v300
#his3516ev300
SDK_VER=
#BOARD  : his3516ev300_imx335
#BOARD  : gk7205v300_imx335
#his3516ev300_imx335
# gk7205v200_gc2053_38m_com gk7205v200_gc2053_1916m_com
# gk7205v300_gc4653_38m_com gk7205v300_gc4653_1916m_com
# gk7605v100_gc4653_38m_com  gk7605v100_gc4653_1916m_com 
# gk7205v200_232v5_scmj gk7605v100_142v5_scmj gk7205v300_442v5_scmj gk7205v300_232v5_scmj
# gk7205v200_gc2053_38m_v2_com gk7205v200_gc2053_38m_v3_com gk7205v200_gc2053_1916m_v2_com gk7605v100_gc4653_38m_v2_com gk7605v100_gc4653_1916m_v2_com
USER_PWD=123456
#USER_PWD=Amg@0731
#BOARD=gk7205v200_gc2053_38m_v3_com
BOARD=gk7605v100_gc4653_1916m_v2_com
DO_FAST_PACKAGE_FLAGE=0
ROOTFS_PATH=/home/huxinjie/nfs_7608
PROJECT=
#TOOLCHAIN_PATH=/home/gk_sdk/GKIPCLinuxV100R001C00SPC020/Software/GKIPCLinuxV100R001C00SPC020/tools/toolchains/arm-gcc6.3-linux-uclibceabi
#TOOLCHAIN_PATH=/home/ginger/sdk/goke-sdk-master/GKIPCLinuxV100R001C00SPC030/tools/toolchains/arm-gcc6.3-linux-uclibceabi
TOOLCHAIN_PATH=/opt/linux/x86-arm/aarch64-mix210-linux/bin
######################### auto generated
#PWD=$(cd `dirname $0`; pwd)
TOP_PATH=${PWD}
SDK_VER_DIR=platform
SDK_DIR=${SDK_VER_DIR}/sdk
SDK_API_DIR=${SDK_VER_DIR}/api
BOARD_DIR=${SDK_VER_DIR}/board
######################### fixed tools
TOOLS_DIR=$TOP_PATH/tools
PACK_DIR=$TOOLS_DIR/pack
UPDATA_DIR=$PACK_DIR/upgrade

######################### OSD path
OSD_PATH=$TOP_PATH/subsystem/osd

FAST_PACKAGE_DIR=$PACK_DIR/fast_make_package
PACK_UPGRADE_TOOL=$UPDATA_DIR/bin/pack_upgrade_tool
######################### package output
PACKAGE_DIR=$TOOLS_DIR/release
APP_IMAGE_DIR=$PACK_DIR/bin
######################### temp variables
RET=0
CHIP=
CHIP_FAMILY=
OS_MEM=50
PHY_TYPE="in ext"
SENSOR=
APP=
APP_RESOURCE=
APP_RESOURCE_SPECIAL=""
APP_PROJECT=
#WiFi:"rtl8188eu rtl8188fu"
WiFi=""

IPC_UPGRADE_DATE=$(date +"%Y%m%d%H%M%S")
########################
DATE=$(date +"%Y-%m-%d %H:%M:%S")
SVN_VER=

FLASH_BIN_NAME=
FLASH_BURN_NAME=
APP_BIN_NAME=
IMAGE_DIR_NAME=
IMAGE_DIR_DATE=$(date +"%Y%m%d")
IPC_UPGRADE_VERSION=

FLASH_MAP_CFG=
UBOOT_IMAGE=
UBOOT_ENV=
KERNEL_IMAGE=
USER_BIN=user.bin
CUSTOM_BIN=custom.jffs2
ROOTFS_APP=rootfs.squashfs
RESOURCE_BIN=resource.squashfs

build_updata_pack_tool()
{
	cd $UPDATA_DIR/code
	make -s -f Makefile
	cd $TOP_PATH
}

get_build_board_cfg()
{
	case $1 in
	hzd_jxh42_v1.0)
		CHIP=gk7102
		CHIP_FAMILY=GK710X
		SENSOR=jxh42
		APP=netcam
		APP_RESOURCE=CUS_HZD_OJT_JXH42
		OS_MEM=36
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-${CHIP}-${1}-${SDK_VER}.bin
		KERNEL_IMAGE=zImage-gk710x-${SDK_VER}.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg_wifi_sd.ini
		;;
	sc4236_v1.0)
		CHIP=gk7205
		CHIP_FAMILY=GK720X
		SENSOR=sc4236_mipi
		APP=netcam
		APP_RESOURCE=CUS_GK_SC4236
		OS_MEM=30
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7205-SC4236_V_1_0.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	ov4689_v1.0)
		CHIP=gk7205
		CHIP_FAMILY=GK720X
		SENSOR=ov4689_mipi
		APP=netcam
		APP_RESOURCE=CUS_GK_OV4689
		OS_MEM=30
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-${CHIP}-${1}.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7202_evb_v1.0)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=sc2232
		APP=netcam
		APP_RESOURCE=CUS_GK_SC2232
		OS_MEM=32
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-devkit-v1.1.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188eu"
		;;
	gk7205_evb_v1.0)
		CHIP=gk7205
		CHIP_FAMILY=GK720X
		SENSOR="ov4689_mipi sc4236_mipi"
		APP=netcam
		APP_RESOURCE=CUS_GK_EVB_ALL
		OS_MEM=30
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7205-devkit-v1.1.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7202_gc2053_hc_v1.0)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_HC_GK7202_GC2053_V10
		OS_MEM=41
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-devkit-v1.1.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
	gk7202_gc2053_v2.0)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_GK_GC2053
		OS_MEM=32
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-devkit-v1.1.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7205_gc4623_v1.0)
		CHIP=gk7205
		CHIP_FAMILY=GK720X
		SENSOR=gc4623_mipi
		APP=netcam
		APP_RESOURCE=CUS_GK_GC4623
		OS_MEM=30
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7205-devkit-v1.1.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7205_os04b10_v1)
		CHIP=gk7205
		CHIP_FAMILY=GK720X
		SENSOR=os04b10_mipi
		APP=netcam
		APP_RESOURCE=CUS_GG_OS04B10_V1
		OS_MEM=30
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7205_os04b10_v1.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;		
	gk7205_mn168_v1)
		CHIP=gk7205
		CHIP_FAMILY=GK720X
		SENSOR=mn168_mipi
		APP=netcam
		APP_RESOURCE=CUS_GG_MN168_V1
		OS_MEM=30
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7205_mn168_v1.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7202_sc4236_aijia)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=sc4236
        #SENSOR=sc3235
		APP=netcam
		APP_RESOURCE=CUS_7202_SC4236_AIJIA
		OS_MEM=37
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202_sc4236_aj.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
	gk7202_gc2053_tb)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_GC2053
		OS_MEM=40
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
	gk7202_gc2053_tb_38)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_38_GC2053
		OS_MEM=40
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb-38.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
    gk7205_gc2053_face)
		CHIP=gk7205s
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_GK_FACE_GC2053
		OS_MEM=90
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7205S-gc2053-face.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	ipmt01_v1.0)
		CHIP=gk7205s
		CHIP_FAMILY=GK720X
		SENSOR=imx291
		APP=haqc
		APP_RESOURCE=CUS_HA_IMX291
		OS_MEM=96
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7205s-ha-v1.1.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7202_gc2053_tb_v2)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_GC2053_V20
		OS_MEM=40
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
	gk7202_gc2053_tb_v3)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_GC2053_V30
		OS_MEM=36
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
    tb_38_c142v3)
		CHIP=gk7205s
		CHIP_FAMILY=GK720X
		SENSOR=os04b10_mipi
		APP=netcam
		APP_RESOURCE=CUS_TB_C142V3
		OS_MEM=70
		PHY_TYPE=in
		#UBOOT_IMAGE=uboot-gk7205S_os04b10-tb-38.bin
		UBOOT_IMAGE=uboot-gk7205S_os04b10-tb-38-v22.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;		
        
	gk7202_gc2053_tb_38_v2)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_38_GC2053_V20
		OS_MEM=40
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb-38.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
    gk7202_gc2053_tb_38_big_v2)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_38_BIG_GC2053_V20
		OS_MEM=41
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb-38.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
    gk7202_gc2053_tb_38_big_v2_v4)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_38_BIG_GC2053_V20_V4 
		OS_MEM=36
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb-38.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
        #WiFi="rtl8188fu"
		;;
    gk7202_gc2053_tb_38_big_v3)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_38_BIG_GC2053_V30        
		APP_RESOURCE_SPECIAL=CUS_TB_38_BIG_GC2053_V20
		OS_MEM=41
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb-38.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
        #WiFi="rtl8188fu"
		;;
    gk7202_gc2053_tb_38_big_v4)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_38_BIG_GC2053_V40 
		OS_MEM=36
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb-38.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
        #WiFi="rtl8188fu"
		;;
    gk7202_gc2053_38_big_v4_wifi)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_TB_38_BIG_GC2053_V40_W 
		OS_MEM=40
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb-38.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
        WiFi="rtl8188fu"
		;;
    gk7205_jxq03_ipc20)
		CHIP=gk7205
		CHIP_FAMILY=GK720X
		SENSOR=jxq03
		APP=netcam
		APP_RESOURCE=CUS_GK7205_JXQ03_IPC_20      
		OS_MEM=37
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7205-ipc20.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
    gk7205s_gc4653_ipc20)
		CHIP=gk7205s
		CHIP_FAMILY=GK720X
		SENSOR=gc4653_mipi
		APP=netcam
		APP_RESOURCE=CUS_GK7205S_GC4653_IPC_20   
		OS_MEM=70
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7205s-ipc20.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7202_gc2053_elife_38)
		CHIP=gk7202
		CHIP_FAMILY=GK720X
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_ELIFE_38_GC2053
		OS_MEM=40
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-gk7202-gc2053-tb-38.bin
		KERNEL_IMAGE=zImage-gk720x.bin
		UBOOT_ENV=uboot_env_${OS_MEM}_${PHY_TYPE}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
    his3516ev300_imx335)
		CHIP=HI3516EV300
		CHIP_FAMILY=HI3516EV300
        SENSOR=imx335
		APP=netcam
		APP_RESOURCE=CUS_HI3516EV300_IMX335
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot-hi3516ev300.bin
		KERNEL_IMAGE=zImage-hi3516ev300.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7605v100rb)
		CHIP=gk7605v100
		CHIP_FAMILY=gk7605v100
		SENSOR=imx335
		APP=netcam
		APP_RESOURCE=CUS_GK7605V100RB_IMX335
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=u-boot-gk7605v100.bin
		KERNEL_IMAGE=uImage_gk7605v100.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7205v200rb)
		CHIP=gk7205v200
		CHIP_FAMILY=gk7205v200
		SENSOR=imx307
		APP=netcam
		APP_RESOURCE=CUS_GK7205V200_IMX335
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v200.bin
		KERNEL_IMAGE=uImage_gk7205v200.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7205v200_gc2053_38m_com)
		CHIP=gk7205v200
		CHIP_FAMILY=gk7205v200
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_GK7205V200_GC2053_38M
		OS_MEM=37
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v200.bin
		KERNEL_IMAGE=uImage_gk7205v200.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7205v200_gc2053_38m_v2_com)
		CHIP=gk7205v200
		CHIP_FAMILY=gk7205v200
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_GK7205V200_GC2053_38M_V2
		OS_MEM=37
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v200.bin
		KERNEL_IMAGE=uImage_gk7205v200.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7205v200_gc2053_38m_v3_com)
		CHIP=gk7205v200
		CHIP_FAMILY=gk7205v200
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_GK7205V200_GC2053_38M_V3
		OS_MEM=37
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v200.bin
		KERNEL_IMAGE=uImage_gk7205v200.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7205v200_gc2053_1916m_com)
		CHIP=gk7205v200
		CHIP_FAMILY=gk7205v200
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_GK7205V200_GC2053_1916M
		OS_MEM=37
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v200.bin
		KERNEL_IMAGE=uImage_gk7205v200.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
	gk7205v200_gc2053_1916m_v2_com)
		CHIP=gk7205v200
		CHIP_FAMILY=gk7205v200
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_GK7205V200_GC2053_1916M_V2
		OS_MEM=37
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v200.bin
		KERNEL_IMAGE=uImage_gk7205v200.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
	gk7205v200_232v5_scmj)
		CHIP=gk7205v200
		CHIP_FAMILY=gk7205v200
		SENSOR=gc2053
		APP=netcam
		APP_RESOURCE=CUS_GK7205V200_232V5_SCMJ
		OS_MEM=37
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v200.bin
		KERNEL_IMAGE=uImage_gk7205v200.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;
	gk7605v100_gc4653_1916m_com)
		CHIP=gk7605v100
		CHIP_FAMILY=gk7605v100
		SENSOR=gc4653_2l
		APP=netcam
		APP_RESOURCE=CUS_GK7605V100_GC4653_1916M
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7605v100.bin
		KERNEL_IMAGE=uImage_gk7605v100.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;    
	gk7605v100_gc4653_1916m_v2_com)
		CHIP=gk7605v100
		CHIP_FAMILY=gk7605v100
		#SENSOR=os02c	#change sensor type?
		SENSOR=gc4653
		APP=netcam
		APP_RESOURCE=CUS_GK7605V100_GC4653_1916M_V2
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7605v100.bin
		KERNEL_IMAGE=uImage_gk7605v100.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;    
	gk7605v100_gc4653_38m_com)
		CHIP=gk7605v100
		CHIP_FAMILY=gk7605v100
		SENSOR=gc4653_2l
		APP=netcam
		APP_RESOURCE=CUS_GK7605V100_GC4653_38M
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7605v100.bin
		KERNEL_IMAGE=uImage_gk7605v100.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;      
	gk7605v100_gc4653_38m_v2_com)
		CHIP=gk7605v100
		CHIP_FAMILY=gk7605v100
		SENSOR=gc4653_2l
		APP=netcam
		APP_RESOURCE=CUS_GK7605V100_GC4653_38M_V2
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7605v100.bin
		KERNEL_IMAGE=uImage_gk7605v100.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;    
	gk7205v300_gc4653_38m_com)
		CHIP=gk7205v300
		CHIP_FAMILY=gk7205v300
		SENSOR=gc4653_2l
		APP=netcam
		APP_RESOURCE=CUS_GK7205V300_GC4653_38M
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v300.bin
		KERNEL_IMAGE=uImage_gk7205v300.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	gk7205v300_gc4653_1916m_com)
		CHIP=gk7205v300
		CHIP_FAMILY=gk7205v300
		SENSOR=gc4653_2l
		APP=netcam
		APP_RESOURCE=CUS_GK7205V300_GC4653_1916M
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v300.bin
		KERNEL_IMAGE=uImage_gk7205v300.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;    
	gk7205v300_232v5_scmj)
		CHIP=gk7205v300
		CHIP_FAMILY=gk7205v300
		SENSOR=gc4653_2l
		APP=netcam
		APP_RESOURCE=CUS_GK7205V300_232V5_SCMJ
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v300.bin
		KERNEL_IMAGE=uImage_gk7205v300.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		WiFi="rtl8188fu"
		;;    
	gk7605v100_142v5_scmj)
		CHIP=gk7605v100
		CHIP_FAMILY=gk7605v100
		SENSOR=gc4653_2l
		APP=netcam
		APP_RESOURCE=CUS_GK7605V100_142V5_SCMJ
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7605v100.bin
		KERNEL_IMAGE=uImage_gk7605v100.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
        USER_PWD=Amg@0731
		;;
	gk7205v300_442v5_scmj)
		CHIP=gk7205v300
		CHIP_FAMILY=gk7205v300
		SENSOR=gc4653_2l
		APP=netcam
		APP_RESOURCE=CUS_GK7205V300_442V5_SCMJ
		OS_MEM=64
		PHY_TYPE=in
		UBOOT_IMAGE=uboot_gk7205v300.bin
		KERNEL_IMAGE=uImage_gk7205v300.bin
		UBOOT_ENV=uboot_env_${OS_MEM}.bin
		FLASH_MAP_CFG=flashmap_cfg.ini
		;;
	*)
		echo "board not support:${1}"
		RET=1;
		return 1;
		;;
	esac

	echo "get_build_board_cfg--${CHIP_FAMILY} ${SENSOR}"
	APP_PROJECT=${APP_RESOURCE}$(if [ -z $PROJECT ];then echo ""; else echo "_$PROJECT"; fi;)

	RET=0
}

check_file_state()
{
	if [ ! -f "${BOARD_DIR}/${BOARD}/${1}" ]; then
        echo "check_file_state--${BOARD_DIR}/${BOARD}/${1}  don't exist!  return!";
		RET=1;
		return 1;
	fi
	
	if [ ! -f "${BOARD_DIR}/${BOARD}/${2}" ]; then
        echo "${BOARD_DIR}/${BOARD}/${2}  don't exist!";
		RET=1;
		return 1;
	fi

	if [ ! -f "${BOARD_DIR}/${BOARD}/${3}" ]; then
        echo "check_file_state--${BOARD_DIR}/${BOARD}/${3}  don't exist!  return!"
		RET=1;
		return 1;
	fi

	echo "check_file_state -------- ${1} ${2} ${3}"

	RET=0
}

build_sys_info_file() 
{
	BOARD_TYPE=${BOARD}$(if [ -z $PROJECT ];then echo ""; else echo "_$PROJECT"; fi;)
	echo "{"                                                    > sys_info
	echo "    \"sys_info\": {"                                 >> sys_info
	echo "        \"device_name\":  \"gkipc\","                >> sys_info
	echo "        \"device_type\":  \"${BOARD_TYPE}\","        >> sys_info
	echo "        \"chip_type\":    \"${1}\","                 >> sys_info
	echo "        \"sensor_type\":  \"${2}\","                 >> sys_info
	echo "        \"svn_version\":  \"${SVN_VER}\","           >> sys_info
	echo "        \"make_date\":    \"${DATE}\","              >> sys_info
	echo "        \"upgrade_version\":    \"${IPC_UPGRADE_VERSION}\","              >> sys_info
	echo "        \"author\":       \"${USER}\" "              >> sys_info
	echo "    }"                                               >> sys_info
	echo "}"                                                   >> sys_info

	chmod  777  sys_info
	cp -rf sys_info  ${PACK_DIR}/
	rm -rf sys_info
}

build_app_image()
{
	build_img=build_img_${PLATFORM}.sh;
	echo "build_app_image----------${CHIP}--${SENSOR}"

	cd ${PACK_DIR}
	echo "====================================================================="
	mkdir -p ${APP_IMAGE_DIR}
	rm -rf ${APP_IMAGE_DIR}/*

	chmod 777 ${build_img}

	echo "./${build_img} --sensor ${SENSOR} -d ${CHIP} --board ${BOARD} --osmem ${OS_MEM} --wifi ${WiFi}"
	./${build_img} --sensor ${SENSOR} -d ${CHIP} --board ${BOARD} --osmem ${OS_MEM} --pwd ${USER_PWD} --wifi ${WiFi} 

	echo "====================================================================="
	cd ${TOP_PATH}

	if [ ! -f "${APP_IMAGE_DIR}/custom.jffs2" ]; then
        echo "${APP_IMAGE_DIR}/custom.jffs2  don't exist!";
		RET=1;
		return 1;
	fi
	
	if [ ! -f "${APP_IMAGE_DIR}/rootfs.squashfs" ]; then
        echo "${APP_IMAGE_DIR}/rootfs.squashfs  don't exist!";
		RET=1;
		return 1;
	fi
	
	if [ ! -f "${APP_IMAGE_DIR}/resource.squashfs" ]; then
        echo "${APP_IMAGE_DIR}/resource.squashfs  don't exist!";
		RET=1;
		return 1;
	fi

	RET=0
}

clean_package_image()
{
	rm -rf ${APP_IMAGE_DIR}
}

make_package_image()
{
	cp -rf ${BOARD_DIR}/${BOARD}/$1    ${APP_IMAGE_DIR}/uboot.bin ;
	cp -rf ${BOARD_DIR}/${BOARD}/$2    ${APP_IMAGE_DIR}/uboot_env.bin ;
	cp -rf ${BOARD_DIR}/${BOARD}/$3    ${APP_IMAGE_DIR}/zImage ;
	cp -rf ${BOARD_DIR}/${BOARD}/$4    ${APP_IMAGE_DIR}/user.bin ;
	cp -rf ${BOARD_DIR}/${BOARD}/$5    ${APP_IMAGE_DIR}/flashmap_cfg.ini ;
	RET=0;
}

make_flashmap_cfg()
{
	echo "-------- ${CHIP}  ${APP_PROJECT}"
	
	sed -i "s/CHIP_NAME/${CHIP}/g"                      ${APP_IMAGE_DIR}/flashmap_cfg.ini > ./tmp.sh
    if [ ${APP_RESOURCE_SPECIAL} != "" ];then
        sed -i "s/MACHINE_NAME/${APP_RESOURCE_SPECIAL}/g"           ${APP_IMAGE_DIR}/flashmap_cfg.ini > ./tmp.sh
    else
	sed -i "s/MACHINE_NAME/${APP_PROJECT}/g"           ${APP_IMAGE_DIR}/flashmap_cfg.ini > ./tmp.sh
	fi
	sed -i "s/UPGRADE_VERSION/${IPC_UPGRADE_VERSION}/g" ${APP_IMAGE_DIR}/flashmap_cfg.ini > ./tmp.sh
	rm -rf ./tmp.sh

	RET=0
}

fast_make_package()
{
	cd ${FAST_PACKAGE_DIR}

	rm -rf fast_make_package_*.bin
	rm -rf fast_make_package_${phy_i}_V${SVN_VER}_${IMAGE_DIR_DATE}_app.bin
	rm -rf fast_make_package_${phy_i}_V${SVN_VER}_${IMAGE_DIR_DATE}_flash.bin
	rm -rf fast_make_package_${phy_i}_V${SVN_VER}_${IMAGE_DIR_DATE}_flash_big.bin

	$PACK_UPGRADE_TOOL -p flashmap_cfg.ini fast_make_package_${phy_i}_V${SVN_VER}_${IMAGE_DIR_DATE}_app.bin
	$PACK_UPGRADE_TOOL -m flashmap_cfg.ini fast_make_package_${phy_i}_V${SVN_VER}_${IMAGE_DIR_DATE}_flash.bin


	chmod 777 *
	
	#### produce big-endia bin, avoid use error bin to factory
	$PACK_UPGRADE_TOOL -e fast_make_package_${phy_i}_V${SVN_VER}_${IMAGE_DIR_DATE}_flash.bin
	#### delete little-endia bin,avoid use error bin to factory
	rm -f ${IMAGE_DIR_NAME}/${FLASH_BIN_NAME} 
	
	#./big_little_switchTool.switchTool fast_make_package_${phy_i}_V${SVN_VER}_${IMAGE_DIR_DATE}_flash.bin fast_make_package_${phy_i}_V${SVN_VER}_${IMAGE_DIR_DATE}_flash_big.bin
	
	chmod 777 *
}

readIni()
{
    file=$1;section=$2;item=$3;
    val=$(awk -F '=' '/\['${section}'\]/{a=1} (a==1 && "'${item}'"==$1){a=0;print $2}' ${file}) 
    #echo ${val}
	echo ${val} | sed 's/\r//'
}

creat_gkipc_image_sd_update()
{
	echo "--------------- creat_gkipc_image_sd_update ------------------"
	cd ${IMAGE_DIR_NAME}
	SD_UPDATE_BIN_NAME="gkipc_image.bin"
	SD_UPDATE_CFD_DIR_NAME="sd_update_cfg"
	SD_UPDATE_CFG_DIR=${SD_UPDATE_CFD_DIR_NAME}
	mkdir -p ${SD_UPDATE_CFG_DIR}
	cp ${FLASH_BIN_NAME} ${SD_UPDATE_CFG_DIR}/${SD_UPDATE_BIN_NAME}
	crc=$(crc32 ${SD_UPDATE_CFG_DIR}/${SD_UPDATE_BIN_NAME})
	echo "${FLASH_BIN_NAME} crc32: $crc"
	
	FLASH_MAP_CFG_DIR=$TOP_PATH/${BOARD_DIR}/${BOARD}/${FLASH_MAP_CFG}
	flash_size_hex=$(readIni ${FLASH_MAP_CFG_DIR} FIRMWARE flash_size)
	upgrade_num=$(readIni ${FLASH_MAP_CFG_DIR} FIRMWARE upgrade_num)
	let "flash_size=${flash_size_hex}/(1024*1024)"
	
	#echo "------------------ deploy cfg ------------------"
	echo "flash_size  ${flash_size}M"         >  ${SD_UPDATE_CFG_DIR}/gkipc_image_sd_update.cfg
	for((i=0;i<upgrade_num;i++));
	do
	flash_name="FLASH$i"
	flash_upgrade_flag=$(readIni ${FLASH_MAP_CFG_DIR} ${flash_name} upgrade_flag)
	flash_addr=$(readIni ${FLASH_MAP_CFG_DIR} ${flash_name} mtd_addr)
	flash_mtd_part=$(readIni ${FLASH_MAP_CFG_DIR} ${flash_name} mtd_part)
	echo "${flash_addr}  ${flash_mtd_part}"  >> ${SD_UPDATE_CFG_DIR}/gkipc_image_sd_update.cfg
	let "a+=flash_upgrade_flag <<(${i})"
	done

	update_zone=$(echo "obase=2;$a"|bc)
	echo "crc=${crc}"                        >> ${SD_UPDATE_CFG_DIR}/gkipc_image_sd_update.cfg
	echo "update_zone=${update_zone}"        >> ${SD_UPDATE_CFG_DIR}/gkipc_image_sd_update.cfg
	echo "board=${BOARD}"                    >> ${SD_UPDATE_CFG_DIR}/gkipc_image_sd_update.cfg
}

make_package()
{
	echo ""
	echo "--------------------------------------------------------------"
	echo "------------------ Start package -----------------------------"
	echo "--------------------------------------------------------------"

	echo ""
	echo -n "Please input SVN version NUM: "
	read SVN_VER
	echo "--SVN_VER:${SVN_VER}"
	IPC_UPGRADE_VERSION="v1.0.${SVN_VER}.${IPC_UPGRADE_DATE}"
	echo "--IPC_UPGRADE_VERSION:${IPC_UPGRADE_VERSION}"
	
	#IMAGE_DIR_NAME=${BOARD}_${CHIP}_V${SVN_VER}_${IMAGE_DIR_DATE}
	IMAGE_DIR_NAME=${PACKAGE_DIR}/${BOARD}_V${SVN_VER}_${IMAGE_DIR_DATE}

	#FLASH_BIN_NAME=${BOARD}_${CHIP}_${os_i}M_${PHY_TYPE}_V${SVN_VER}_${IMAGE_DIR_DATE}_flash.bin
	FLASH_BIN_NAME=${BOARD}_${CHIP}_${PHY_TYPE}_V${SVN_VER}_f.bin

	FLASH_BURN_NAME=${BOARD}_${CHIP}_${PHY_TYPE}_V${SVN_VER}_fb.bin

	#APP_BIN_NAME=${BOARD}_${CHIP}_${PHY_TYPE}_V${SVN_VER}_${IMAGE_DIR_DATE}_app.bin
	APP_BIN_NAME=${BOARD}_${CHIP}_${PHY_TYPE}_V${SVN_VER}_app.bin
	
	chmod 755 tools -R
	build_updata_pack_tool

	if [ $DO_FAST_PACKAGE_FLAGE -ne 0 ]
	then
		#fast_make_package
		exit;
	fi
	
	#check_file_state ${UBOOT_IMAGE} ${UBOOT_ENV} ${KERNEL_IMAGE}
	if [ $RET -ne 0 ]
	then
		continue
	fi

	build_sys_info_file ${CHIP} ${SENSOR} ${SVN_VER} ${DATE} ${IPC_UPGRADE_VERSION} ${USER}
	
	clean_package_image
   echo "-------------cd sdk_api_dir--------------" 
	cd $SDK_API_DIR
	make clean && make
    
    #osd support freetype or dot. so make clean
    cd $OSD_PATH
	make clean && make
    
	build_app_image ${CHIP} ${SENSOR}
	if [ $RET -ne 0 ]
	then
		continue
	fi

	#make_package_image ${UBOOT_IMAGE} ${UBOOT_ENV} ${KERNEL_IMAGE} ${USER_BIN} ${FLASH_MAP_CFG}
	if [ $RET -ne 0 ]
	then
		continue
	fi
	
	#make_flashmap_cfg ${CHIP} ${SENSOR}
	if [ $RET -ne 0 ]
	then
		continue
	fi

	cd ${APP_IMAGE_DIR}
	rm -rf ${FLASH_BIN_NAME} ${APP_BIN_NAME} ${FLASH_BURN_NAME}
	#echo ${FLASH_BIN_NAME}
	mkdir -p ${IMAGE_DIR_NAME}
	#$PACK_UPGRADE_TOOL -m flashmap_cfg.ini ${IMAGE_DIR_NAME}/${FLASH_BIN_NAME}
	#$PACK_UPGRADE_TOOL -p flashmap_cfg.ini ${IMAGE_DIR_NAME}/${APP_BIN_NAME}
	
	chmod 777 -R ${IMAGE_DIR_NAME}
	#### produce big-endia bin, avoid use error bin to factory
	#$PACK_UPGRADE_TOOL -e ${IMAGE_DIR_NAME}/${FLASH_BIN_NAME}  ${IMAGE_DIR_NAME}/${FLASH_BURN_NAME}
	#### delete little-endia bin,avoid use error bin to factory

#	../big_little_switchTool.switchTool  ${IMAGE_DIR_NAME}/${FLASH_BIN_NAME}  ${IMAGE_DIR_NAME}/${FLASH_BURN_NAME}

	clean_package_image
	#echo "*****************************************"
}

deploy_env()
{
	echo "------------------ deploy env ------------------"
	rm -rf env Config.mak Config.mak.$USER app/${APP}/module_config
	
	echo "SDK_TOP     = ${TOP_PATH}/${SDK_DIR}"  >  ${SDK_DIR}/Config.mak.$USER
	echo "ROOTFS_PARENT_DIRECTORY = ${ROOTFS_PATH}" >>  ${SDK_DIR}/Config.mak.$USER
	echo "TOOLCHAIN_PARENT_DIRECTORY = ${TOOLCHAIN_PATH}" >>  ${SDK_DIR}/Config.mak.$USER
	echo "INSTALL_DIR = ${TOP_PATH}/install"     >> ${SDK_DIR}/Config.mak.$USER
	echo "DECODER     = ${CHIP_FAMILY}"          >> ${SDK_DIR}/Config.mak.$USER
	echo "CHIP        = ${CHIP}"                 >> ${SDK_DIR}/Config.mak.$USER
	echo "CUSTOM_BOARD_SENSOR = ${APP_RESOURCE}" >> ${SDK_DIR}/Config.mak.$USER
	echo "CUSTOM_BOARD_PROJECT = ${APP_PROJECT}"     >> ${SDK_DIR}/Config.mak.$USER
	echo "SENSOR      = ${SENSOR}"               >> ${SDK_DIR}/Config.mak.$USER
	echo "PLATFORM    = ${PLATFORM}"             >> ${SDK_DIR}/Config.mak.$USER
	echo "SDK_VER     = ${SDK_VER}"              >> ${SDK_DIR}/Config.mak.$USER
	echo "APP         = ${APP}"                  >> ${SDK_DIR}/Config.mak.$USER
	
	ln -s ${SDK_DIR}/env env
	ln -s ${SDK_DIR}/Config.mak Config.mak
	ln -s ${SDK_DIR}/Config.mak.$USER Config.mak.$USER
	ln -s ../../${BOARD_DIR}/${BOARD}/module_config app/${APP}/module_config
	
	echo "------------------------------------------------"
	cat Config.mak.$USER
	echo "------------------------------------------------"
	source env/build_env.sh
}

get_build_board_cfg ${BOARD}
if [ $RET -ne 0 ]
then
	exit;
fi

deploy_env
echo "----------after deploy env-----------------"
make_package

#creat_gkipc_image_sd_update
