/*!
*****************************************************************************
** \file        src/algo/af_params/Foctek_D14_02812IR_af_param.c
**
** \brief
**
** \attention   THIS SAMPLE CODE IS PROVIDED AS IS. GOKE MICROELECTRONICS
**              ACCEPTS NO RESPONSIBILITY OR LIABILITY FOR ANY ERRORS OR
**              OMMISSIONS
**
** (C) Copyright 2012-2015 by GOKE MICROELECTRONICS CO.,LTD
**
*****************************************************************************
*/

#include "basetypes.h"
#include "gk_isp.h"
#include "gk_isp3a_api.h"
#include "isp3a_lens.h"
#include "isp3a_af.h"

//*****************************************************************************
//*****************************************************************************
//** Local Defines
//*****************************************************************************
//*****************************************************************************

//*****************************************************************************
//*****************************************************************************
//** Local structures
//*****************************************************************************
//*****************************************************************************

//*****************************************************************************
//*****************************************************************************
//** Global Data
//*****************************************************************************
//*****************************************************************************
af_param_t YuTong_YT30021FB_af_param = {
    /*init pps */
    300,
    /*zoom_thread_sleep_time*/ 
    1000,
    /*init zoom index */
    0,
    /*start_zoom_idx*/
    1,
    /*begin_zoom_idx*/
    1,
    /*end_zoom_idx*/
    17,
	/*zoom_reverse_idx*/
    2,
	/*z_inbd*/
    500,
    /*z_outbd*/
    242,
    /*zoom_reverse_after_z*/
    80,
    /*zoom_reverse_after_f*/
    70,
    /*f_nbd*/
    15000,
    /*f_fbd*/
    -9623,
    /*calib_saf_step*/
    0,
    /*calib_saf_b*/
    0,
    /*zoom_enhance_enable*/
    0,
    /*dist_idx_init*/
    35,
    /*zoom_dir,in 1, out 2*/
    1,
    /*zoom_break_idx*/
    13,
    /*manual_focus_step*/
    160,
    /*manual_zoom_step*/
    0.05,
    /*spacial_fir */
    {{0, -1, 0,
                    -1, 4, -1,
            0, -1, 0}
        }
    ,
    /*Depth of field parameter */
    128,
    //pps max, fv3 enable, wait interval, ev_idx_TH, CStep, FStep, CThrh, FThrh
    {
            {50000, 0, 31, 5, 160, 160, 10, 10}
            ,                   // zp0
            {50000, 0, 32, 5, 160, 160, 10, 10}
            ,                   // zp1
            {50000, 0, 32, 5, 160, 160, 10, 10}
            ,                   // zp2
            {50000, 0, 32, 5, 160, 160, 10, 10}
            ,                   // zp3
            {50000, 0, 32, 5, 160, 160, 10, 10}
            ,                   // zp4
            {50000, 0, 32, 5, 160, 160, 10, 10}
            ,                   // zp5
            {50000, 0, 32, 5, 160, 160, 10, 10}
            ,                   // zp6
            {50000, 0, 32, 5, 160, 160, 10, 10}
            ,                   // zp7
            {50000, 0, 64, 9, 160, 160, 10, 10}
            ,                   // zp8
            {50000, 0, 64, 9, 160, 160, 15, 15}
            ,                   // zp9
            {50000, 0, 64, 9, 160, 160, 15, 15}
            ,                   // zp10
            {50000, 0, 64, 9, 160, 160, 15, 15}
            ,                   // zp11
            {50000, 0, 64, 13, 160, 160, 15, 15}
            ,                   // zp12
            {50000, 0, 64, 13, 160, 160, 20, 20}
            ,                   // zp13
            {50000, 0, 64, 13, 160, 160, 20, 20}
            ,                   // zp14
            {50000, 0, 128, 13, 160, 160, 20, 20}
            ,                   // zp15
            {50000, 0, 128, 13, 160, 160, 20, 20}
            ,                   // zp16
            {50000, 0, 128, 13, 160, 160, 20, 20}
            ,                   // zp17
            {50000, 0, 128, 13, 160, 160, 20, 20}
            ,                   // zp18
            {50000, 0, 128, 13, 160, 160, 20, 20}
        }                       // zp19
    ,
    /*dist index reverse err min*/
    0, 
    /*dist index reverse err max 40*32768/920,title delay must be precise 2 tested*/
    1425,
	/*zoom_reverse_err_min*/
    0,
	/*zoom_reverse_err_max*/
    50,
    /*saf_dist_index_reverse_err_max*/
    1000,
    /*saf_f_nbd*/
    9000,
    /*saf_f_fbd*/
    -9000,
	/*saf_optical_pos_offset*/
    5,
	/*optical_focus_length*/
    2334,
    /*zoom_slope*/
	0.0012254902,
	/*zoom_offset*/
	0.8333333328
};

//*****************************************************************************
//*****************************************************************************
//** Local Data
//*****************************************************************************
//*****************************************************************************

//*****************************************************************************
//*****************************************************************************
//** Local Functions Declaration
//*****************************************************************************
//*****************************************************************************

//*****************************************************************************
//*****************************************************************************
//** API Functions
//*****************************************************************************
//*****************************************************************************

//*****************************************************************************
//*****************************************************************************
//** Local Functions
//*****************************************************************************
//*****************************************************************************