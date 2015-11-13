RuleData = {
'acc_mat_approve_fl':[
	{srcNodeId:'base_mat_code_flz',destNodeId:'acc_mat_approve_fl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'acc_mat_approve_ml':[
	{srcNodeId:'base_mat_code_mlz',destNodeId:'acc_mat_approve_ml',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'acc_mat_quote_fl':[
	{srcNodeId:'base_mat_code_flz',destNodeId:'acc_mat_quote_fl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'acc_mat_quote_fl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'acc_mat_quote_ml':[
	{srcNodeId:'base_mat_code_mlz',destNodeId:'acc_mat_quote_ml',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'acc_mat_quote_ml',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'acc_price_solution':[
	{srcNodeId:'base_mat_code_flz',destNodeId:'acc_price_solution',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'acc_price_solution2':[
	{srcNodeId:'base_mat_code_flz',destNodeId:'acc_price_solution2',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'acc_process_approve':[
	{srcNodeId:'base_archdata',destNodeId:'acc_process_approve',layout:'/public/layout/layout_main.js',whereSql:'exists(select 1 from base_archive t_a where t_a.arch_code=\'gylxi\' and t_a.arch_id=base_archive.parent_id)',whereType:'',whereValue:''}
],
'acc_process_quote':[
	{srcNodeId:'base_archdata',destNodeId:'acc_process_quote',layout:'/public/layout/layout_main.js',whereSql:'exists(select 1 from base_archive t_a where t_a.arch_code=\'gylxi\' and t_a.arch_id=base_archive.parent_id)',whereType:'',whereValue:''}
],
'acc_salary_det':[
	{srcNodeId:'prod_sheet',destNodeId:'acc_salary_det',layout:'',whereSql:'prod_sheet.auditing=\'1\' and\nnot exists(select * from acc_salary_det where acc_salary_det.salary_id={FKEYID} and acc_salary_det.prod_id=prod_sheet.prod_id)',whereType:'',whereValue:''}
],
'acc_season_analyst':[
	{srcNodeId:'splan_season_ana_sel',destNodeId:'acc_season_analyst',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''}
],
'acc_season_budget':[
	{srcNodeId:'splan_season',destNodeId:'acc_season_budget',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''}
],
'acc_style_approve':[
	{srcNodeId:'base_sel_style',destNodeId:'acc_style_approve',layout:'/public/layout/layout_tree.js',whereSql:'{VALIDDATA}',whereType:'',whereValue:''}
],
'acc_style_cost_cal':[
	{srcNodeId:'base_sel_style_cost_cal',destNodeId:'acc_style_cost_cal',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''}
],
'acc_style_fobprice':[
	{srcNodeId:'base_sel_style',destNodeId:'acc_style_fobprice',layout:'/public/layout/layout_tree.js',whereSql:'{VALIDDATA}',whereType:'',whereValue:''}
],
'acc_style_quote':[
	{srcNodeId:'base_sel_style',destNodeId:'acc_style_quote',layout:'/public/layout/layout_tree.js',whereSql:'{VALIDDATA}',whereType:'',whereValue:''}
],
'acc_vouch_det':[
	{srcNodeId:'acc_subject',destNodeId:'acc_vouch_det',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select * from acc_vouch_det where acc_vouch_det.subject_id = acc_subject.subject_id and acc_vouch_det.vouch_id = {FKEYID})',whereType:'',whereValue:''}
],
'base_arch_opr_type':[
	{srcNodeId:'base_archname_tree',destNodeId:'base_arch_opr_type',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''}
],
'base_bom_out_tech':[
	{srcNodeId:'base_archdata',destNodeId:'base_bom_out_tech',layout:'',whereSql:'exists(select 1 from base_archive t_a where t_a.arch_code=\'gylxi\' and t_a.arch_id=base_archive.parent_id) and not exists(select 1 from base_bom_out_tech where style_bom_id={FKEYID} and tech_code=arch_code)',whereType:'',whereValue:''}
],
'base_group_matf2':[
	{srcNodeId:'base_mat_code_flz',destNodeId:'base_group_matf2',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.data_diff = \'1\' and not exists (select * from base_group_set, base_group where base_group_set.group_id = base_group.group_id and base_group.parent_id in (select parent_id from base_group where group_id = {FKEYID}) and base_mat_code.mat_id = base_group_set.data_id)',whereType:'',whereValue:''}
],
'base_group_matm2':[
	{srcNodeId:'base_mat_code_mlz',destNodeId:'base_group_matm2',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.data_diff = \'0\' and not exists (select * from base_group_set, base_group where base_group_set.group_id = base_group.group_id and base_group.parent_id in (select parent_id from base_group where group_id = {FKEYID}) and base_mat_code.mat_id = base_group_set.data_id)',whereType:'',whereValue:''}
],
'base_group_menu2':[
	{srcNodeId:'sel_fun',destNodeId:'base_group_menu2',layout:'/public/layout/layout_tree.js',whereSql:'reg_type in (\'main\', \'treemain\') and fun_id not in (select data_id from base_group_set where group_id = {FKEYID})',whereType:'',whereValue:''}
],
'base_group_pro2':[
	{srcNodeId:'base_provider',destNodeId:'base_group_pro2',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select * from base_group_set, base_group where base_group_set.group_id = base_group.group_id and base_group.parent_id in (select parent_id from base_group where group_id = {FKEYID}) and base_group_set.data_id = base_provider.provider_id)',whereType:'',whereValue:''}
],
'base_mat_attr':[
	{srcNodeId:'base_sel_color',destNodeId:'base_mat_attr',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from base_mat_attr where base_mat_color.color_id = base_mat_attr.attr_id and mat_id = {FKEYID} )',whereType:'',whereValue:''}
],
'base_mat_attr2':[
	{srcNodeId:'base_mat_wash',destNodeId:'base_mat_attr2',layout:'',whereSql:'auditing = \'1\' and not exists (select * from base_mat_attr where base_mat_wash.wash_id = base_mat_attr.attr_id and mat_id = {FKEYID} )',whereType:'',whereValue:''}
],
'base_mat_attr3':[
	{srcNodeId:'base_sel_size',destNodeId:'base_mat_attr3',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from base_mat_attr where base_mat_size.size_id = base_mat_attr.attr_id and mat_id = {FKEYID} )',whereType:'',whereValue:''}
],
'base_mat_bom':[
	{srcNodeId:'base_mat_bom_mlz',destNodeId:'base_mat_bom',layout:'/public/layout/layout_tree.js',whereSql:'not exists(select mat_grp_id from  base_mat_bom where base_mat_bom.mat_grp_id=base_mat_code.mat_id and auditing in(\'0\',\'1\'))',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_bom_flz',destNodeId:'base_mat_bom',layout:'/public/layout/layout_tree.js',whereSql:'not exists(select mat_grp_id from  base_mat_bom where base_mat_bom.mat_grp_id=base_mat_code.mat_id and auditing in(\'0\',\'1\'))',whereType:'',whereValue:''}
],
'base_mat_bom_det':[
	{srcNodeId:'base_mat_bom_sel_flz',destNodeId:'base_mat_bom_det',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_bom_mlz',destNodeId:'base_mat_bom_det',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''}
],
'base_mat_color_sel':[
	{srcNodeId:'base_sel_color',destNodeId:'base_mat_color_sel',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from base_mat_attr where base_mat_color.color_id = base_mat_attr.attr_id and mat_id = {FKEYID} )',whereType:'',whereValue:''}
],
'base_mat_gset':[
	{srcNodeId:'base_sel_matg',destNodeId:'base_mat_gset',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select * from base_group_set where base_group_set.data_id = {FKEYID} and base_group.group_id = base_group_set.group_id)',whereType:'',whereValue:''}
],
'base_mat_gset1':[
	{srcNodeId:'base_sel_matgf',destNodeId:'base_mat_gset1',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select * from base_group_set where base_group_set.data_id = {FKEYID} and base_group.group_id = base_group_set.group_id)',whereType:'',whereValue:''}
],
'base_mat_prop_chg':[
	{srcNodeId:'base_mat_bom_flz',destNodeId:'base_mat_prop_chg',layout:'',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_bom_mlz',destNodeId:'base_mat_prop_chg',layout:'',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'base_mat_provider':[
	{srcNodeId:'base_provider',destNodeId:'base_mat_provider',layout:'',whereSql:'auditing = \'1\' and not exists (select * from base_mat_provider where mat_id = {FKEYID} and base_mat_provider.provider_id = base_provider.provider_id)',whereType:'',whereValue:''}
],
'base_mat_size_sel':[
	{srcNodeId:'base_sel_size',destNodeId:'base_mat_size_sel',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from base_mat_attr where base_mat_size.size_id = base_mat_attr.attr_id and mat_id = {FKEYID} )',whereType:'',whereValue:''}
],
'base_plate_size':[
	{srcNodeId:'base_style_size',destNodeId:'base_plate_size',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'base_provider_pay':[
	{srcNodeId:'base_clause',destNodeId:'base_provider_pay',layout:'',whereSql:'auditing = \'1\'',whereType:'',whereValue:''}
],
'base_style_attr_color':[
	{srcNodeId:'base_sel_color',destNodeId:'base_style_attr_color',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from base_style_attr where base_mat_color.color_id = base_style_attr.attr_id and style_id = {FKEYID} )',whereType:'',whereValue:''}
],
'base_style_attr_color_sel':[
	{srcNodeId:'base_sel_color',destNodeId:'base_style_attr_color_sel',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from base_style_attr where base_mat_color.color_id = base_style_attr.attr_id and style_id = {FKEYID} )',whereType:'',whereValue:''}
],
'base_style_attr_size':[
	{srcNodeId:'base_style_size_sel',destNodeId:'base_style_attr_size',layout:'/public/layout/layout_main.js',whereSql:'auditing = \'1\' and not exists (select 1 from base_style_attr where base_mat_size.size_id = base_style_attr.attr_id and style_id = {FKEYID} )',whereType:'',whereValue:''}
],
'base_style_attr_tech':[
	{srcNodeId:'base_archdata',destNodeId:'base_style_attr_tech',layout:'/public/layout/layout_main.js',whereSql:'exists(select * from base_archive b where b.arch_code =\'gysm\' and base_archive.parent_id =b.arch_id) and not exists (select * from base_style_attr where base_archive.arch_id = base_style_attr.attr_id and style_id = {FKEYID} )',whereType:'',whereValue:''}
],
'base_style_bom':[
	{srcNodeId:'base_sel_style4bom',destNodeId:'base_style_bom',layout:'/public/layout/layout_tree.js',whereSql:'not exists(select style_id from  base_style_bom where base_style_bom.style_id=base_style.style_id and data_diff=\'1\' and auditing in(\'0\',\'1\'))',whereType:'',whereValue:''}
],
'base_style_bom_des_sel':[
	{srcNodeId:'base_sel_style4bom',destNodeId:'base_style_bom_des_sel',layout:'/public/layout/layout_tree.js',whereSql:'not exists(select style_id from  base_style_bom where base_style_bom.style_id=base_style.style_id and auditing in(\'0\',\'1\'))',whereType:'',whereValue:''}
],
'base_style_bom_det':[
	{srcNodeId:'base_mat_bom_mlz',destNodeId:'base_style_bom_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_bom_flz',destNodeId:'base_style_bom_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'base_style_bom_sel':[
	{srcNodeId:'base_sel_style4bom',destNodeId:'base_style_bom_sel',layout:'/public/layout/layout_tree.js',whereSql:'not exists(select style_id from  base_style_bom where base_style_bom.style_id=base_style.style_id and auditing in(\'0\',\'1\'))',whereType:'',whereValue:''}
],
'base_style_label':[
	{srcNodeId:'base_mat_wash',destNodeId:'base_style_label',layout:'',whereSql:'base_mat_wash.auditing=\'1\'',whereType:'',whereValue:''}
],
'base_style_out_proc':[
	{srcNodeId:'base_archdata',destNodeId:'base_style_out_proc',layout:'',whereSql:'exists(select * from base_archive b where b.arch_code =\'gylxi\' and base_archive.parent_id =b.arch_id) and not exists (select 1 from base_style_proc where base_archive.arch_id = base_style_proc.process_id and style_id = {FKEYID} and base_style_proc.data_diff=\'01\' )',whereType:'',whereValue:''}
],
'base_style_part_size':[
	{srcNodeId:'base_stype_part',destNodeId:'base_style_part_size',layout:'/public/layout/layout_tree.js',whereSql:'auditing=\'1\' and not exists(select 1 from base_style_part where base_stype_part.stype_part_id=base_style_part.stype_part_id and base_style_part.style_id={FKEYID})',whereType:'',whereValue:''}
],
'base_style_proc':[
	{srcNodeId:'base_process',destNodeId:'base_style_proc',layout:'',whereSql:'auditing = \'1\' and data_diff=\'00\' and not exists (select 1 from base_style_proc where base_process.process_id = base_style_proc.process_id and style_id = {FKEYID} and base_style_proc.data_diff=\'00\')',whereType:'',whereValue:''}
],
'check_dev_yl':[
	{srcNodeId:'store_indet_query',destNodeId:'check_dev_yl',layout:'',whereSql:'store_in.auditing = \'1\'  and base_mat_code.data_diff = \'2\'',whereType:'',whereValue:''},
	{srcNodeId:'pur_order_query',destNodeId:'check_dev_yl',layout:'',whereSql:'pur_order.auditing = \'1\' and pur_order.order_status  <>  \'30\'',whereType:'',whereValue:''}
],
'check_dev_ylsq':[
	{srcNodeId:'pur_order_query',destNodeId:'check_dev_ylsq',layout:'',whereSql:'pur_order.auditing = \'1\' and pur_order.order_status  <>  \'30\'',whereType:'',whereValue:''},
	{srcNodeId:'store_indet_query',destNodeId:'check_dev_ylsq',layout:'',whereSql:'store_in.auditing = \'1\'  and base_mat_code.data_diff = \'2\'',whereType:'',whereValue:''}
],
'check_order':[
	{srcNodeId:'pur_order_query',destNodeId:'check_order',layout:'',whereSql:'pur_order.auditing = \'1\' and pur_order.order_status  <>  \'30\'',whereType:'',whereValue:''},
	{srcNodeId:'store_indet_query',destNodeId:'check_order',layout:'',whereSql:'store_in.auditing = \'1\'  and base_mat_code.data_diff = \'2\'',whereType:'',whereValue:''}
],
'check_order_det_fl':[
	{srcNodeId:'store_indet_query',destNodeId:'check_order_det_fl',layout:'',whereSql:'',whereType:'',whereValue:''},
	{srcNodeId:'pur_order_query',destNodeId:'check_order_det_fl',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'check_order_det_fl_qry':[
	{srcNodeId:'store_indet_query',destNodeId:'check_order_det_fl_qry',layout:'',whereSql:'',whereType:'',whereValue:''},
	{srcNodeId:'pur_order_query',destNodeId:'check_order_det_fl_qry',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'check_order_det_ml_qry':[
	{srcNodeId:'pur_order_query',destNodeId:'check_order_det_ml_qry',layout:'',whereSql:'',whereType:'',whereValue:''},
	{srcNodeId:'store_indet_query',destNodeId:'check_order_det_ml_qry',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'check_order_ww':[
	{srcNodeId:'pur_order_query',destNodeId:'check_order_ww',layout:'',whereSql:'pur_order.auditing = \'1\' and pur_order.order_status  <>  \'30\'',whereType:'',whereValue:''},
	{srcNodeId:'store_indet_query',destNodeId:'check_order_ww',layout:'',whereSql:'store_in.auditing = \'1\'  and base_mat_code.data_diff = \'2\'',whereType:'',whereValue:''}
],
'check_prod_cy':[
	{srcNodeId:'pur_order_query',destNodeId:'check_prod_cy',layout:'',whereSql:'pur_order.auditing = \'1\' and pur_order.order_status  <>  \'30\'',whereType:'',whereValue:''},
	{srcNodeId:'store_indet_query',destNodeId:'check_prod_cy',layout:'',whereSql:'store_in.auditing = \'1\'  and base_mat_code.data_diff = \'2\'',whereType:'',whereValue:''}
],
'check_prod_cysq':[
	{srcNodeId:'store_indet_query',destNodeId:'check_prod_cysq',layout:'',whereSql:'store_in.auditing = \'1\'  and base_mat_code.data_diff = \'2\'',whereType:'',whereValue:''},
	{srcNodeId:'pur_order_query',destNodeId:'check_prod_cysq',layout:'',whereSql:'pur_order.auditing = \'1\' and pur_order.order_status  <>  \'30\'',whereType:'',whereValue:''}
],
'check_prod_log_user':[
	{srcNodeId:'base_style',destNodeId:'check_prod_log_user',layout:'',whereSql:'not exists (select 1 from check_prod_log_user st1 where st1.style_id=base_style.style_id)',whereType:'',whereValue:''}
],
'dev_cost_tech':[
	{srcNodeId:'base_archdata',destNodeId:'dev_cost_tech',layout:'',whereSql:'exists(select * from base_archive b where b.arch_code =\'gylxi\' and base_archive.parent_id =b.arch_id) and\nnot exists(select dev_cost_id from dev_cost_tech where dev_cost_tech.dev_cost_id= {FKEYID} and dev_cost_tech.tech_name=base_archive.arch_name)',whereType:'',whereValue:''}
],
'dev_mat_cost':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'dev_mat_cost',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select 1 from dev_cost_mat where dev_cost_id = {FKEYID} AND dev_cost_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'dev_mat_cost',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select 1 from dev_cost_mat where dev_cost_id = {FKEYID} AND dev_cost_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''}
],
'dev_mat_sel':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'dev_mat_sel',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select * from dev_task_mat where task_id = {FKEYID} AND dev_task_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'dev_mat_sel',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select * from dev_task_mat where task_id = {FKEYID} AND dev_task_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''}
],
'dev_order_det':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'dev_order_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'dev_order_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''}
],
'dev_order_dets':[
	{srcNodeId:'pur_refer_planyl',destNodeId:'dev_order_dets',layout:'',whereSql:'v_pur_plan_det_style.is_over<>\'1\'',whereType:'',whereValue:''}
],
'dev_order_pay':[
	{srcNodeId:'base_clause',destNodeId:'dev_order_pay',layout:'',whereSql:'auditing = \'1\' and not exists (select * from pur_order_pay where pur_order_pay.clause_id = base_clause.clause_id and order_id = {FKEYID})',whereType:'',whereValue:''}
],
'dev_order_yl':[
	{srcNodeId:'store_indet_query',destNodeId:'dev_order_yl',layout:'',whereSql:'store_in.auditing = \'1\'  and base_mat_code.data_diff = \'2\'',whereType:'',whereValue:''},
	{srcNodeId:'pur_order_query',destNodeId:'dev_order_yl',layout:'',whereSql:'pur_order.auditing = \'1\' and pur_order.order_status  <>  \'30\'',whereType:'',whereValue:''}
],
'dev_out_det':[
	{srcNodeId:'base_archdata',destNodeId:'dev_out_det',layout:'',whereSql:'exists(select * from base_archive b where b.arch_code =\'gylxi\' and base_archive.parent_id =b.arch_id) not exists (select 1 from dev_out_det where base_archive.arch_name = dev_out_det.out_code and task_id = {FKEYID} )',whereType:'',whereValue:''}
],
'dev_prod_cost':[
	{srcNodeId:'dev_prod_chkin',destNodeId:'dev_prod_cost',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''}
],
'dev_prod_process':[
	{srcNodeId:'base_process',destNodeId:'dev_prod_process',layout:'',whereSql:'{VALIDDATA} and\nnot exists(select dev_cost_id from dev_task_process where dev_task_process.dev_cost_id= {FKEYID} and dev_task_process.process_id=base_process.process_id)',whereType:'',whereValue:''}
],
'dev_store_in':[
	{srcNodeId:'dev_des_sel',destNodeId:'dev_store_in',layout:'',whereSql:'chk_status in (\'41\',\'42\',\'43\') and not exists (select * from dev_store_rec where rec_type like \'1%\' and auditing = \'0\' and dev_store_rec.task_id = dev_task.task_id)',whereType:'',whereValue:''},
	{srcNodeId:'dev_store_sel',destNodeId:'dev_store_in',layout:'',whereSql:'borr_num > 0 and not exists (select * from dev_store_rec where rec_type = \'11\' and auditing = \'0\' and dev_store_rec.task_id = dev_store.task_id )',whereType:'',whereValue:''},
	{srcNodeId:'dev_style_sel',destNodeId:'dev_store_in',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'dev_store_out':[
	{srcNodeId:'dev_store_sel',destNodeId:'dev_store_out',layout:'',whereSql:'store_num > 0 and  not exists (select * from dev_store_rec where dev_store_rec.auditing = \'0\' and dev_store_rec.rec_type like \'2%\' and dev_store_rec.dev_storeid = dev_store.dev_storeid)',whereType:'',whereValue:''}
],
'dev_style_bom':[
	{srcNodeId:'dev_des_sel',destNodeId:'dev_style_bom',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'dev_style_bom_det':[
	{srcNodeId:'base_mat_bom_mlz',destNodeId:'dev_style_bom_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_bom_flz',destNodeId:'dev_style_bom_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'dev_bom_tem',destNodeId:'dev_style_bom_det',layout:'',whereSql:'base_style_type.auditing=\'1\'',whereType:'',whereValue:''}
],
'dev_style_bom_tem':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'dev_style_bom_tem',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'dev_style_bom_tem',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'dev_style_color':[
	{srcNodeId:'base_sel_color',destNodeId:'dev_style_color',layout:'',whereSql:'auditing = \'1\' and not exists (select * from dev_style_attr where base_mat_color.color_id = dev_style_attr.attr_id and dev_style_id = {FKEYID} )',whereType:'',whereValue:''}
],
'dev_style_mat':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'dev_style_mat',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select dev_style_id from dev_style_mat where dev_style_id = {FKEYID} AND dev_style_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'dev_style_mat',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select dev_style_id from dev_style_mat where dev_style_id = {FKEYID} AND dev_style_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''}
],
'dev_style_out_tech':[
	{srcNodeId:'base_archdata',destNodeId:'dev_style_out_tech',layout:'',whereSql:'exists(select 1 from base_archive t_a where t_a.arch_code=\'gylxi\' and t_a.arch_id=base_archive.parent_id)\nand not exists(select 1 from dev_style_out_tech where dev_style_id={FKEYID} and tech_code=arch_code)',whereType:'',whereValue:''}
],
'dev_task_mat':[
	{srcNodeId:'base_mat_code_mlz',destNodeId:'dev_task_mat',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from dev_task_mat where task_id = {FKEYID} AND dev_task_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'dev_task_mat',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from dev_task_mat where task_id = {FKEYID} AND dev_task_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_flz',destNodeId:'dev_task_mat',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from dev_task_mat where task_id = {FKEYID} AND dev_task_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'dev_task_mat',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from dev_task_mat where task_id = {FKEYID} AND dev_task_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''}
],
'dev_task_tech':[
	{srcNodeId:'base_archdata',destNodeId:'dev_task_tech',layout:'',whereSql:'exists(select * from base_archive b where b.arch_code =\'gysm\' and base_archive.parent_id =b.arch_id) and not exists (select * from dev_task_tech where dev_task_tech.tech_id = base_archive.arch_id and dev_task_tech.task_id = {FKEYID})',whereType:'',whereValue:''}
],
'dev_tech':[
	{srcNodeId:'dev_style_sel',destNodeId:'dev_tech',layout:'/public/layout/layout_tree.js',whereSql:'not exists(select 1 from dev_style_tech where dev_style_tech.dev_style_id=dev_style.dev_style_id)',whereType:'',whereValue:''}
],
'dev_tech_process':[
	{srcNodeId:'base_process',destNodeId:'dev_tech_process',layout:'',whereSql:'not exists(select 1 from dev_style_process where dev_style_process.task_tech_id= {FKEYID} and dev_style_process.process_id=base_process.process_id)',whereType:'',whereValue:''}
],
'dev_tem_mat':[
	{srcNodeId:'base_mat_code_mlz',destNodeId:'dev_tem_mat',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select * from dev_task_mat where task_id = {FKEYID} AND dev_task_mat.mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''}
],
'dm_fieldcfg':[
	{srcNodeId:'sel_fieldcfg',destNodeId:'dm_fieldcfg',layout:'',whereSql:'dm_fieldcfg.field_type = \'0\'',whereType:'',whereValue:''}
],
'event_domain_det':[
	{srcNodeId:'sys_event',destNodeId:'event_domain_det',layout:'',whereSql:'fun_id = \'sysevent\' and event_index < 10000',whereType:'',whereValue:''}
],
'fun_attrdes':[
	{srcNodeId:'fun_attr',destNodeId:'fun_attrdes',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'fun_event':[
	{srcNodeId:'sys_event',destNodeId:'fun_event',layout:'',whereSql:'fun_id = \'sysevent\' and event_index < 10000',whereType:'',whereValue:''}
],
'fun_tree':[
	{srcNodeId:'fun_tree',destNodeId:'fun_tree',layout:'',whereSql:'tree_id not in (select tree_id from fun_tree where fun_id = {FKEYID})',whereType:'',whereValue:''}
],
'mat_appdet':[
	{srcNodeId:'mat_base',destNodeId:'mat_appdet',layout:'/public/layout/layout_tree.js',whereSql:'mat_id not in (select mat_id from mat_appdet where app_id = {FKEYID})',whereType:'',whereValue:''}
],
'op_contract':[
	{srcNodeId:'op_contract_ref_prod',destNodeId:'op_contract',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'op_contract_mat':[
	{srcNodeId:'op_contract_mat_ref',destNodeId:'op_contract_mat',layout:'',whereSql:'v_op_contract_bom_ref.contract_id={FKEYID}',whereType:'',whereValue:''}
],
'op_contract_pay':[
	{srcNodeId:'base_clause',destNodeId:'op_contract_pay',layout:'',whereSql:'auditing = \'1\' and not exists (select * from op_contract_pay where op_contract_pay.clause_id = base_clause.clause_id and contract_id = {FKEYID})',whereType:'',whereValue:''}
],
'op_contract_tech':[
	{srcNodeId:'base_style_attr_tech',destNodeId:'op_contract_tech',layout:'',whereSql:'exists (select 1 from op_contract where contract_id={FKEYID} and op_contract.style_id=base_style_attr.style_id)',whereType:'',whereValue:''}
],
'op_fine':[
	{srcNodeId:'op_fine_ref_contract',destNodeId:'op_fine',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''}
],
'op_fine_ref_contract':[
	{srcNodeId:'op_contract_ref_prod',destNodeId:'op_fine_ref_contract',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'op_issue':[
	{srcNodeId:'op_issue_ref_contract',destNodeId:'op_issue',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''}
],
'op_issue_ref_contract':[
	{srcNodeId:'op_contract_ref_prod',destNodeId:'op_issue_ref_contract',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'op_qc':[
	{srcNodeId:'op_qc_ref_contract',destNodeId:'op_qc',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''}
],
'op_qc_ref_contract':[
	{srcNodeId:'op_contract_ref_prod',destNodeId:'op_qc_ref_contract',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'op_return':[
	{srcNodeId:'op_return_ref_contract',destNodeId:'op_return',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''}
],
'op_return_ref_contract':[
	{srcNodeId:'op_contract_ref_prod',destNodeId:'op_return_ref_contract',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'op_stockin':[
	{srcNodeId:'op_stockin_ref_contract',destNodeId:'op_stockin',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''}
],
'op_stockin_ref_contract':[
	{srcNodeId:'op_contract_ref_prod',destNodeId:'op_stockin_ref_contract',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'op_wastage':[
	{srcNodeId:'op_wastage_ref_contract',destNodeId:'op_wastage',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''}
],
'op_wastage_ref_contract':[
	{srcNodeId:'op_contract_ref_prod',destNodeId:'op_wastage_ref_contract',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'opr_status':[
	{srcNodeId:'base_archdata',destNodeId:'opr_status',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'ott_adminKey':[
	{srcNodeId:'ott_point',destNodeId:'ott_adminKey',layout:'',whereSql:'not exists(select * from ott_role_point where ott_role_point.point_id=ott_point.point_id and ott_role_point.role_id=\'adminKey\')',whereType:'',whereValue:''}
],
'ott_role_point':[
	{srcNodeId:'ott_point2',destNodeId:'ott_role_point',layout:'',whereSql:'not exists(select * from ott_role_point where ott_role_point.point_id=ott_point.point_id and ott_role_point.role_id={FKEYID})',whereType:'',whereValue:''}
],
'ott_role_user':[
	{srcNodeId:'sys_role',destNodeId:'ott_role_user',layout:'',whereSql:'not exists(select 1 from ott_role_user where ott_role_user.role_id={FKEYID} and ott_role_user.sys_role_id=sys_role.role_id)',whereType:'',whereValue:''}
],
'pay_month_dets_cg':[
	{srcNodeId:'store_indet_ml',destNodeId:'pay_month_dets_cg',layout:'',whereSql:'store_indet.in_detid in (select order_detid   from v_js_order_det  where exists (select 1   from pay_month  where v_js_order_det.post_date >= begin_date  and v_js_order_det.post_date < end_date + 1   and month_id = {FKEYID}  and pay_month.provider_id = v_js_order_det.provider_id  and pay_month.data_diff=v_js_order_det.jsd_type) and cjs_money>0 and order_type=\'rk\')',whereType:'',whereValue:''}
],
'pay_month_dets_fy':[
	{srcNodeId:'pur_cost_det',destNodeId:'pay_month_dets_fy',layout:'',whereSql:'pur_fine_det.fine_detid in (select v_js_order_det.order_detid   from v_js_order_det   where exists (select 1           from pay_month           where v_js_order_det.post_date >= pay_month.begin_date            and v_js_order_det.post_date < pay_month.end_date + 1            and pay_month.month_id = {FKEYID}            and pay_month.provider_id = v_js_order_det.provider_id)            and v_js_order_det.cjs_money>0 and v_js_order_det.order_type=\'fy\' )',whereType:'',whereValue:''}
],
'pay_month_dets_kk':[
	{srcNodeId:'pur_fine_det',destNodeId:'pay_month_dets_kk',layout:'',whereSql:'pur_fine_det.fine_detid in (select order_detid   from v_js_order_det  where exists (select 1   from pay_month  where post_date >= begin_date  and post_date < end_date + 1   and month_id = {FKEYID}  and pay_month.provider_id = v_js_order_det.provider_id  and pay_month.data_diff=v_js_order_det.jsd_type ) and cjs_money>0 and order_type=\'kk\')',whereType:'',whereValue:''}
],
'pay_month_dets_th':[
	{srcNodeId:'store_order_det_cp',destNodeId:'pay_month_dets_th',layout:'',whereSql:'store_order_det.order_detid in (select order_detid   from v_js_order_det  where exists (select 1   from pay_month  where post_date >= begin_date  and post_date < end_date + 1   and month_id = {FKEYID}  and pay_month.provider_id = v_js_order_det.provider_id  and pay_month.data_diff=v_js_order_det.jsd_type ) and cjs_money>0 and order_type=\'th\')',whereType:'',whereValue:''}
],
'pic_dtl':[
	{srcNodeId:'pic_type',destNodeId:'pic_dtl',layout:'',whereSql:'not exists(select * from pic_arch where pic_arch.pic_id={FKEYID} and pic_arch.arch_type_id=base_archive.arch_id)',whereType:'',whereValue:''}
],
'plate_arch_data':[
	{srcNodeId:'plate_arch_type',destNodeId:'plate_arch_data',layout:'',whereSql:'not exists(select * from pic_arch where pic_arch.pic_id={FKEYID} and pic_arch.arch_type_id=base_archive.arch_id)',whereType:'',whereValue:''}
],
'plet_fun':[
	{srcNodeId:'sel_fun',destNodeId:'plet_fun',layout:'/public/layout/layout_tree.js',whereSql:'reg_type in (\'main\',\'treemain\')',whereType:'',whereValue:''}
],
'plet_portlet':[
	{srcNodeId:'sel_plettype',destNodeId:'plet_portlet',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_bom':[
	{srcNodeId:'base_sel_style4bom',destNodeId:'prod_bom',layout:'/public/layout/layout_tree.js',whereSql:'not exists(select style_id from  base_style_bom where base_style_bom.style_id=base_style.style_id and data_diff=\'2\' and auditing in(\'0\',\'1\'))',whereType:'',whereValue:''}
],
'prod_bom1':[
	{srcNodeId:'base_sel_style4bom',destNodeId:'prod_bom1',layout:'/public/layout/layout_tree.js',whereSql:'not exists(select style_id from  base_style_bom where base_style_bom.style_id=base_style.style_id and data_diff=\'2\' and auditing in(\'0\',\'1\'))',whereType:'',whereValue:''}
],
'prod_bom_bak':[
	{srcNodeId:'prod_sheet',destNodeId:'prod_bom_bak',layout:'',whereSql:'not exists(select  1 from base_style_bom where base_style_bom.data_diff=\'4\' and base_style_bom.des_code =prod_sheet.prod_id)',whereType:'',whereValue:''}
],
'prod_bom_det':[
	{srcNodeId:'base_mat_bom_mlz',destNodeId:'prod_bom_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_bom_flz',destNodeId:'prod_bom_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'prod_bom_det1':[
	{srcNodeId:'base_mat_bom_mlz',destNodeId:'prod_bom_det1',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_bom_flz',destNodeId:'prod_bom_det1',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'prod_cost':[
	{srcNodeId:'prod_cost_ref_unover',destNodeId:'prod_cost',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'prod_cut':[
	{srcNodeId:'prod_cut_ref_unover',destNodeId:'prod_cut',layout:'',whereSql:'v_prod_ref_sheet_unovercut.prod_id not in (select prod_id from prod_cut)\n    or exists (select 1 from sys_var st1 where st1.var_code=\'opr.prod.cutref.onlyone\' and st1.var_value=\'0\')',whereType:'',whereValue:''}
],
'prod_cut_det':[
	{srcNodeId:'prod_cut_det_imp',destNodeId:'prod_cut_det',layout:'/public/layout/layout_main.js',whereSql:'exists(select 1 from prod_cut where prod_cut.cut_id={FKEYID} and prod_cut.prod_id=prod_sheet_det.prod_id)',whereType:'',whereValue:''}
],
'prod_final_qc':[
	{srcNodeId:'prod_final_qc_ref_unover',destNodeId:'prod_final_qc',layout:'',whereSql:'v_prod_ref_sheet_unovercut.prod_id not in  (select st2.ref_id from prod_qc st2 where st2.data_diff=\'14\')\n    or exists (select 1 from sys_var st1 where st1.var_code=\'opr.prod.finalqcref.onlyone\' and st1.var_value=\'0\')',whereType:'',whereValue:''}
],
'prod_get_notify':[
	{srcNodeId:'prod_get_notify_ref',destNodeId:'prod_get_notify',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_issue':[
	{srcNodeId:'prod_issue_ref_unover',destNodeId:'prod_issue',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'prod_issue_det':[
	{srcNodeId:'prod_issue_hd_ref_book',destNodeId:'prod_issue_det',layout:'',whereSql:'not exists  (select 1 from prod_order_det where order_id = {FKEYID}  and prod_order_det.clothing_id= prod_book.clothing_id) and prod_book.store_num>0',whereType:'',whereValue:''}
],
'prod_issue_hd':[
	{srcNodeId:'prod_issue_ref_stockin_hd',destNodeId:'prod_issue_hd',layout:'',whereSql:'prod_stockin.auditing = \'1\'',whereType:'',whereValue:''}
],
'prod_issue_ref_stockin_hd':[
	{srcNodeId:'prod_hd_ref_unover',destNodeId:'prod_issue_ref_stockin_hd',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_mat_add_det':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'prod_mat_add_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'prod_mat_add_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'prod_sheet_ml',destNodeId:'prod_mat_add_det',layout:'',whereSql:'prod_sheet_mat_usage.prod_id=(select prod_mat_add.prod_id from prod_mat_add where prod_mat_add.add_id={FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'prod_sheet_fl',destNodeId:'prod_mat_add_det',layout:'',whereSql:'prod_sheet_mat_usage.prod_id=(select prod_mat_add.prod_id from prod_mat_add where prod_mat_add.add_id={FKEYID})',whereType:'',whereValue:''}
],
'prod_notify':[
	{srcNodeId:'prod_notify_ref_plan',destNodeId:'prod_notify',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''}
],
'prod_notify_det':[
	{srcNodeId:'prod_plan_det',destNodeId:'prod_notify_det',layout:'',whereSql:'exists(select 1 from prod_plan where prod_plan.plan_id={FKEYID} and prod_plan_row_det.plan_id=prod_plan.ref_plan_id)',whereType:'',whereValue:''}
],
'prod_pack':[
	{srcNodeId:'prod_pack_ref_unover',destNodeId:'prod_pack',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_pack_scan_dtl':[
	{srcNodeId:'prod_pack_det',destNodeId:'prod_pack_scan_dtl',layout:'',whereSql:'exists(select 1 from prod_box where prod_box.ref_id=prod_packing_det.pack_id and prod_box.box_id={FKEYID})',whereType:'',whereValue:''}
],
'prod_plan_det':[
	{srcNodeId:'base_sel_style',destNodeId:'prod_plan_det',layout:'/public/layout/layout_tree_main.js',whereSql:'{VALIDDATA}',whereType:'',whereValue:''}
],
'prod_plan_det_confirm':[
	{srcNodeId:'base_sel_style',destNodeId:'prod_plan_det_confirm',layout:'/public/layout/layout_tree_main.js',whereSql:'{VALIDDATA}',whereType:'',whereValue:''}
],
'prod_plan_status_cutd':[
	{srcNodeId:'prod_cut_det_imp',destNodeId:'prod_plan_status_cutd',layout:'/public/layout/layout_main.js',whereSql:'exists(select 1 from prod_cut where prod_cut.cut_id={FKEYID} and prod_cut.prod_id=prod_sheet_det.prod_id)',whereType:'',whereValue:''}
],
'prod_plan_status_in':[
	{srcNodeId:'prod_stockin_ref_unover',destNodeId:'prod_plan_status_in',layout:'',whereSql:'',whereType:'',whereValue:''},
	{srcNodeId:'prod_pack',destNodeId:'prod_plan_status_in',layout:'',whereSql:'prod_packing.auditing=\'1\' and not exists(Select * from prod_stockin where prod_stockin.pack_id=prod_packing.pack_id  )',whereType:'',whereValue:''}
],
'prod_plan_status_tget':[
	{srcNodeId:'prod_temp_get_ref_unover',destNodeId:'prod_plan_status_tget',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_plan_status_tqc':[
	{srcNodeId:'prod_temp_get_qc_ref',destNodeId:'prod_plan_status_tqc',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_qc_other':[
	{srcNodeId:'base_archdata',destNodeId:'prod_qc_other',layout:'',whereSql:'exists(select 1 from base_archive b where b.arch_code=\'cjzjnr\' and b.arch_id=base_archive.parent_id)',whereType:'',whereValue:''}
],
'prod_qc_summary':[
	{srcNodeId:'base_archdata',destNodeId:'prod_qc_summary',layout:'',whereSql:'exists(select * from BASE_ARCHIVE b where b.ARCH_CODE =\'zjxm\' and BASE_ARCHIVE.PARENT_ID =b.ARCH_ID) and\nnot exists(select * from prod_qc_summary where prod_qc_summary.qc_item=base_archive.arch_name and prod_qc_summary.qc_id={FKEYID})',whereType:'',whereValue:''}
],
'prod_refund':[
	{srcNodeId:'prod_refund_ref_unover',destNodeId:'prod_refund',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'prod_return':[
	{srcNodeId:'prod_return_ref_unover',destNodeId:'prod_return',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'prod_return_hd':[
	{srcNodeId:'prod_hd_ref_unover',destNodeId:'prod_return_hd',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_sheet':[
	{srcNodeId:'prod_sheet_ref_plan',destNodeId:'prod_sheet',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_sheet_fl':[
	{srcNodeId:'base_mat_code_fl',destNodeId:'prod_sheet_fl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'prod_sheet_ml':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'prod_sheet_ml',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'prod_sheet_out_proc':[
	{srcNodeId:'base_archdata',destNodeId:'prod_sheet_out_proc',layout:'',whereSql:'exists(select * from base_archive b where b.arch_code =\'gylxi\' and base_archive.parent_id =b.arch_id) and not exists (select 1 from prod_sheet_out_proc where base_archive.arch_id = prod_sheet_out_proc.tech_id and prod_id = {FKEYID} )',whereType:'',whereValue:''}
],
'prod_sheet_part':[
	{srcNodeId:'base_stype_part',destNodeId:'prod_sheet_part',layout:'',whereSql:'auditing=\'1\' and not exists(select 1 from prod_sheet_part where base_stype_part.stype_part_id=prod_sheet_part.stype_part_id and prod_sheet_part.prod_id={FKEYID})',whereType:'',whereValue:''}
],
'prod_sheet_pay':[
	{srcNodeId:'base_clause',destNodeId:'prod_sheet_pay',layout:'',whereSql:'auditing = \'1\' and not exists (select * from prod_sheet_pay where prod_sheet_pay.clause_id = base_clause.clause_id and prod_id = {FKEYID})',whereType:'',whereValue:''}
],
'prod_sheet_proc':[
	{srcNodeId:'base_process',destNodeId:'prod_sheet_proc',layout:'',whereSql:'auditing = \'1\' and data_diff=\'00\'  and not exists (select 1 from prod_sheet_proc where base_process.process_id = prod_sheet_proc.process_id and prod_id = {FKEYID} )',whereType:'',whereValue:''}
],
'prod_sheet_tech':[
	{srcNodeId:'base_style_attr_tech',destNodeId:'prod_sheet_tech',layout:'',whereSql:'exists (select 1 from prod_sheet where prod_id={FKEYID} and prod_sheet.style_id=base_style_attr.style_id)',whereType:'',whereValue:''}
],
'prod_stockin':[
	{srcNodeId:'prod_stockin_ref_unover',destNodeId:'prod_stockin',layout:'',whereSql:'',whereType:'',whereValue:''},
	{srcNodeId:'prod_pack',destNodeId:'prod_stockin',layout:'',whereSql:'prod_packing.auditing=\'1\' and not exists(Select * from prod_stockin where prod_stockin.pack_id=prod_packing.pack_id  )',whereType:'',whereValue:''}
],
'prod_stockin_hd':[
	{srcNodeId:'prod_hd_ref_unover',destNodeId:'prod_stockin_hd',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_task_row':[
	{srcNodeId:'base_sel_style',destNodeId:'prod_task_row',layout:'/public/layout/layout_tree_main.js',whereSql:'{VALIDDATA}',whereType:'',whereValue:''}
],
'prod_temp_get':[
	{srcNodeId:'prod_temp_get_ref_unover',destNodeId:'prod_temp_get',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_temp_get_qc':[
	{srcNodeId:'prod_temp_get_qc_ref',destNodeId:'prod_temp_get_qc',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_temp_ret_ref_tget':[
	{srcNodeId:'prod_temp_get_ref_unover',destNodeId:'prod_temp_ret_ref_tget',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_temp_return':[
	{srcNodeId:'prod_temp_ret_ref_tget',destNodeId:'prod_temp_return',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'prod_wastage':[
	{srcNodeId:'prod_wastage_ref_unover',destNodeId:'prod_wastage',layout:'/public/layout/layout_main.js',whereSql:'',whereType:'',whereValue:''}
],
'prod_wip_qc':[
	{srcNodeId:'prod_wip_qc_ref_unover',destNodeId:'prod_wip_qc',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'provider_level_pay':[
	{srcNodeId:'base_clause',destNodeId:'provider_level_pay',layout:'',whereSql:'auditing = \'1\' and not exists (select * from provider_level_pay where provider_level_pay.clause_id = base_clause.clause_id and level_id = {FKEYID})',whereType:'',whereValue:''}
],
'pur_ask_check_det':[
	{srcNodeId:'base_provider',destNodeId:'pur_ask_check_det',layout:'',whereSql:'auditing = \'1\' and not exists (select * from pur_ask_det where pur_ask_det.provider_id = base_provider.provider_id and ask_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_ask_det':[
	{srcNodeId:'base_provider',destNodeId:'pur_ask_det',layout:'',whereSql:'auditing = \'1\' and not exists (select * from pur_ask_det where pur_ask_det.provider_id = base_provider.provider_id and ask_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_ask_price':[
	{srcNodeId:'base_provider',destNodeId:'pur_ask_price',layout:'',whereSql:'auditing = \'1\' and not exists (select * from pur_ask_det where pur_ask_det.provider_id = base_provider.provider_id and ask_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_estneeds_det_total':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_estneeds_det_total',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_estneeds_det_total',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_fine_det':[
	{srcNodeId:'store_arrdet_query',destNodeId:'pur_fine_det',layout:'',whereSql:'not exists (select 1 from pur_fine_det where pur_fine_det.fine_id = {FKEYID} and pur_fine_det.order_detid =store_arrdet.order_detid)',whereType:'',whereValue:''},
	{srcNodeId:'pur_order_det',destNodeId:'pur_fine_det',layout:'',whereSql:'not exists (select * from pur_fine_det where pur_fine_det.fine_id = {FKEYID} and pur_fine_det.order_detid = pur_order_det.order_detid)',whereType:'',whereValue:''}
],
'pur_fine_det_ww':[
	{srcNodeId:'pur_order_det_ww',destNodeId:'pur_fine_det_ww',layout:'',whereSql:'not exists (select * from pur_fine_det where pur_fine_det.fine_id = {FKEYID} and pur_fine_det.order_detid = pur_order_det.order_detid)',whereType:'',whereValue:''}
],
'pur_needs_det_chg':[
	{srcNodeId:'pur_needs_det',destNodeId:'pur_needs_det_chg',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'pur_needs_det_chg_total':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_needs_det_chg_total',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_needs_det_chg_total',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_needs_det_imp':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_needs_det_imp',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_needs_det_imp',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_needs_det_total':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_needs_det_total',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_needs_det_total',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_needs_ext_det':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_needs_ext_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_needs_ext_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_needs_ly_det':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_needs_ly_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_needs_ly_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select needs_id from pur_needs_det where pur_needs_det.mat_id = base_mat_code.mat_id and needs_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_order_achg_det':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_order_achg_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_order_achg_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_order_achg_dets':[
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_order_achg_dets',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_order_achg_dets',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_order_chg_det':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_order_chg_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_order_chg_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_order_chg_dets':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_order_chg_dets',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_order_chg_dets',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_order_det':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_order_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_order_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_order_det_sel':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_order_det_sel',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_order_det_sel',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_order_det_ww':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_order_det_ww',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_order_det_ww',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_order_det_ww_sel':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_order_det_ww_sel',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} ) and mat_feature = \'1\' and exists (select * from base_mat_bom_usage where base_mat_bom_usage.dest_mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_order_det_ww_sel',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_order_det where pur_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID} ) and mat_feature = \'1\' and exists (select * from base_mat_bom_usage where base_mat_bom_usage.dest_mat_id = base_mat_code.mat_id)',whereType:'',whereValue:''}
],
'pur_order_dets':[
	{srcNodeId:'pur_refer_planstyle',destNodeId:'pur_order_dets',layout:'',whereSql:'v_pur_plan_det_style.is_over<>\'1\'',whereType:'',whereValue:''}
],
'pur_order_dets_tz':[
	{srcNodeId:'pur_order_dets',destNodeId:'pur_order_dets_tz',layout:'',whereSql:'pur_order_dets.order_id in (select src_order_id from pur_order_chg st1 where st1.order_id={FKEYID}) and not exists (select 1 from pur_order_dets_chg st2 where st2.src_order_id=pur_order_dets.order_id and st2.src_order_detsid=pur_order_dets.order_detsid)',whereType:'',whereValue:''}
],
'pur_order_pay':[
	{srcNodeId:'base_clause',destNodeId:'pur_order_pay',layout:'',whereSql:'auditing = \'1\' and not exists (select * from pur_order_pay where pur_order_pay.clause_id = base_clause.clause_id and order_id = {FKEYID})',whereType:'',whereValue:''}
],
'pur_order_pay_sel':[
	{srcNodeId:'base_clause',destNodeId:'pur_order_pay_sel',layout:'',whereSql:'auditing = \'1\' and not exists (select * from pur_order_pay where pur_order_pay.clause_id = base_clause.clause_id and order_id = {FKEYID})',whereType:'',whereValue:''}
],
'pur_plan':[
	{srcNodeId:'pur_needs',destNodeId:'pur_plan',layout:'',whereSql:'(pur_needs.auditing = \'1\' or pur_needs.auditing = \'3\')   and  exists (select pur_needs_det.det_status  from pur_needs_det where pur_needs_det.det_status = \'10\' and  pur_needs_det.needs_id = pur_needs.needs_id )',whereType:'',whereValue:''},
	{srcNodeId:'pur_needs_ext',destNodeId:'pur_plan',layout:'',whereSql:'(pur_needs.auditing = \'1\' or pur_needs.auditing = \'3\') \n and  exists (select pur_needs_det.det_status  from pur_needs_det where pur_needs_det.det_status = \'10\' and  pur_needs_det.needs_id = pur_needs.needs_id )',whereType:'',whereValue:''}
],
'pur_plan_chg':[
	{srcNodeId:'pur_needs',destNodeId:'pur_plan_chg',layout:'',whereSql:'(pur_needs.auditing = \'1\' or pur_needs.auditing = \'3\')   and  exists (select * from pur_needs_det where pur_needs_det.det_status = \'10\' and  pur_needs_det.needs_id = pur_needs.needs_id )',whereType:'',whereValue:''},
	{srcNodeId:'pur_needs_ext',destNodeId:'pur_plan_chg',layout:'',whereSql:'(pur_needs.auditing = \'1\' or pur_needs.auditing = \'3\') \n and  exists (select * from pur_needs_det where pur_needs_det.det_status = \'10\' and  pur_needs_det.needs_id = pur_needs.needs_id )',whereType:'',whereValue:''}
],
'pur_plan_convert_log':[
	{srcNodeId:'pur_refer_planstyle_sel',destNodeId:'pur_plan_convert_log',layout:'',whereSql:'not exists (select 1 from pur_plan_convert_log where pur_plan_convert_log.src_key_id=v_pur_plan_det_style.key_id)',whereType:'',whereValue:''}
],
'pur_plan_det':[
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_plan_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_plan_det where pur_plan_det.mat_id = base_mat_code.mat_id and plan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_plan_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_plan_det where pur_plan_det.mat_id = base_mat_code.mat_id and plan_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_plan_det_chg':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'pur_plan_det_chg',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_plan_det where pur_plan_det.mat_id = base_mat_code.mat_id and plan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'pur_plan_det_chg',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from pur_plan_det where pur_plan_det.mat_id = base_mat_code.mat_id and plan_id = {FKEYID} )',whereType:'',whereValue:''}
],
'pur_plan_detchg':[
	{srcNodeId:'pur_plan_det',destNodeId:'pur_plan_detchg',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'rpt_detailwf':[
	{srcNodeId:'rpt_wfnode',destNodeId:'rpt_detailwf',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'send_user':[
	{srcNodeId:'sys_user',destNodeId:'send_user',layout:'',whereSql:'sys_user.user_id not in (select user_id from plet_msg_user where plet_msg_user.msg_id = {FKEYID})',whereType:'',whereValue:''}
],
'splan_period':[
	{srcNodeId:'splan_wave_qry',destNodeId:'splan_period',layout:'',whereSql:'parent_id = (select arch_id from base_archive where data_diff = \'1\' and arch_name = \'上货期\') and not exists (select period_name from splan_period where splan_period.wave_setid = {FKEYID} and splan_period.period_name = base_archive.arch_name)',whereType:'',whereValue:''}
],
'splan_ptype':[
	{srcNodeId:'base_style_type',destNodeId:'splan_ptype',layout:'',whereSql:'not exists (select splan_ptype.ptype_id ,count(*) from splan_ptype where serial_setid = {FKEYID} AND splan_ptype.ptype_id = base_style_type.style_type_id group by splan_ptype.ptype_id having count(*)>1 )',whereType:'',whereValue:''}
],
'splan_theme_color':[
	{srcNodeId:'base_sel_color',destNodeId:'splan_theme_color',layout:'',whereSql:'auditing = \'1\' and  not exists (select * from splan_theme_color where splan_theme_color.theme_id = {FKEYID}  and splan_theme_color.color_id = base_mat_color.color_id )',whereType:'',whereValue:''}
],
'splan_theme_mat':[
	{srcNodeId:'base_mat_code_mlz',destNodeId:'splan_theme_mat',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists (select theme_matid from splan_theme_mat where theme_id = {FKEYID} AND splan_theme_mat.mat_id = base_mat_code.mat_id )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_type',destNodeId:'splan_theme_mat',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select theme_matid from splan_theme_mat where theme_id = {FKEYID} AND splan_theme_mat.mat_id = base_mat_type.mat_type_id )',whereType:'',whereValue:''}
],
'store_arrdet':[
	{srcNodeId:'pur_order_det',destNodeId:'store_arrdet',layout:'',whereSql:'not exists ( select * from store_indet where store_indet.order_detid = pur_order_det.order_detid and  in_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_arrdet',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from store_indet where store_indet.mat_id = base_mat_code.mat_id and  in_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_arrdet',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from store_indet where store_indet.mat_id = base_mat_code.mat_id and  in_id = {FKEYID} )',whereType:'',whereValue:''}
],
'store_arrdet_ww':[
	{srcNodeId:'pur_order_det',destNodeId:'store_arrdet_ww',layout:'',whereSql:'not exists ( select * from store_indet where store_indet.order_detid = pur_order_det.order_detid and  in_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_arrdet_ww',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from store_indet where store_indet.mat_id = base_mat_code.mat_id and  in_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_arrdet_ww',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from store_indet where store_indet.mat_id = base_mat_code.mat_id and  in_id = {FKEYID} )',whereType:'',whereValue:''}
],
'store_consume':[
	{srcNodeId:'store_consume_ref_prod',destNodeId:'store_consume',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''},
	{srcNodeId:'store_consume_ref_op',destNodeId:'store_consume',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''}
],
'store_consume_det':[
	{srcNodeId:'base_mat_code_mlz',destNodeId:'store_consume_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_flz',destNodeId:'store_consume_det',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_in_acccheck':[
	{srcNodeId:'pur_order_query',destNodeId:'store_in_acccheck',layout:'',whereSql:'pur_order.data_diff = \'1\' and pur_order.order_status = \'10\'  and not exists (select * from store_in where store_in.order_id = pur_order.order_id)',whereType:'',whereValue:''}
],
'store_in_direct':[
	{srcNodeId:'pur_order_query',destNodeId:'store_in_direct',layout:'',whereSql:'pur_order.data_diff in(\'0\', \'1\') and pur_order.order_status in (\'10\',\'20\')',whereType:'',whereValue:''}
],
'store_in_ml':[
	{srcNodeId:'pur_order_query',destNodeId:'store_in_ml',layout:'',whereSql:'pur_order.data_diff = \'1\' and pur_order.order_status = \'10\' and exists (select 1 from pur_order_det where nvl(pur_order_det.instore_num,0)-nvl(pur_order_det.back_num,0)<nvl(pur_order_det.pur_num,0) and pur_order_det.order_id=pur_order.order_id)',whereType:'',whereValue:''},
	{srcNodeId:'pur_order_det_query',destNodeId:'store_in_ml',layout:'',whereSql:'pur_order.data_diff = \'1\' and pur_order.order_status = \'10\' and nvl(pur_order_det.instore_num,0)-nvl(pur_order_det.back_num,0)<nvl(pur_order_det.pur_num,0)',whereType:'',whereValue:''}
],
'store_in_ww':[
	{srcNodeId:'pur_order_ww_qry',destNodeId:'store_in_ww',layout:'',whereSql:'pur_order.data_diff = \'3\'  and pur_order.order_status = \'10\'',whereType:'',whereValue:''}
],
'store_in_yl':[
	{srcNodeId:'pur_order_query',destNodeId:'store_in_yl',layout:'',whereSql:'pur_order.data_diff = \'4\' and pur_order.order_status = \'10\'',whereType:'',whereValue:''},
	{srcNodeId:'pur_order_det_ylqry',destNodeId:'store_in_yl',layout:'',whereSql:'pur_order.data_diff = \'4\' and pur_order.order_status = \'10\' and pur_order_det.instore_num<pur_order_det.pur_num',whereType:'',whereValue:''}
],
'store_indet_acccheck':[
	{srcNodeId:'pur_order_det',destNodeId:'store_indet_acccheck',layout:'',whereSql:'not exists ( select * from store_indet where store_indet.order_detid = pur_order_det.order_detid and  in_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_indet_acccheck',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from store_indet where store_indet.mat_id = base_mat_code.mat_id and  in_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_indet_acccheck',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from store_indet where store_indet.mat_id = base_mat_code.mat_id and  in_id = {FKEYID} )',whereType:'',whereValue:''}
],
'store_indet_direct':[
	{srcNodeId:'pur_order_det',destNodeId:'store_indet_direct',layout:'',whereSql:'not exists ( select * from store_indet where store_indet.order_detid = pur_order_det.order_detid and  in_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_indet_direct',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from store_indet where store_indet.mat_id = base_mat_code.mat_id and  in_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_indet_direct',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select * from store_indet where store_indet.mat_id = base_mat_code.mat_id and  in_id = {FKEYID} )',whereType:'',whereValue:''}
],
'store_indet_ml':[
	{srcNodeId:'pur_order_det_sel',destNodeId:'store_indet_ml',layout:'',whereSql:'(not exists ( select * from store_indet where store_indet.order_detid = pur_order_det.order_detid )\nand exists (select * from store_in where store_in.order_id=pur_order.order_id and store_in.in_id={FKEYID}))',whereType:'',whereValue:''}
],
'store_order_db_fl':[
	{srcNodeId:'store_order_db',destNodeId:'store_order_db_fl',layout:'',whereSql:'auditing = \'1\' and not exists (select * from store_order  a where a.data_diff = \'11\' and a.src_order_id = store_order.order_id)',whereType:'',whereValue:''}
],
'store_order_db_sl':[
	{srcNodeId:'store_order_db_fl',destNodeId:'store_order_db_sl',layout:'',whereSql:'auditing = \'1\' and not exists (select * from store_order  a where a.data_diff = \'12\' and a.src_order_id = store_order.order_id)',whereType:'',whereValue:''}
],
'store_order_det_bf':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_bf',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''}
],
'store_order_det_cp':[
	{srcNodeId:'pur_order_det',destNodeId:'store_order_det_cp',layout:'',whereSql:'',whereType:'',whereValue:''},
	{srcNodeId:'store_indet_qry',destNodeId:'store_order_det_cp',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'store_order_det_cp_qry':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_cp_qry',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_cp_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_cp_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_order_det_cp_ww':[
	{srcNodeId:'pur_order_det_ww',destNodeId:'store_order_det_cp_ww',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'store_order_det_cp_ww_qry':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_cp_ww_qry',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_cp_ww_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_cp_ww_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_order_det_db':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_db',layout:'',whereSql:'not exists (select book_id from store_order_det where store_order_det.book_id = store_book.book_id and store_order_det.order_id = {FKEYID})',whereType:'',whereValue:''}
],
'store_order_det_db_fl':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_db_fl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_db_fl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'store_book',destNodeId:'store_order_det_db_fl',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''}
],
'store_order_det_db_qry':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_db_qry',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_db_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_db_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_order_det_db_sl':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_db_sl',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''}
],
'store_order_det_fl':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_fl',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_fl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_fl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_order_det_pl':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_pl',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_pl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_pl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'store_order_pl_srcdet',destNodeId:'store_order_det_pl',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'store_order_det_pl_qry':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_pl_qry',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_pl_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_pl_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_order_det_tld':[
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_tld',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_tld',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'store_book',destNodeId:'store_order_det_tld',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''}
],
'store_order_det_tld_qry':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_tld_qry',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_tld_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_tld_qry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_order_det_tlsq':[
	{srcNodeId:'store_order_tl_src_det',destNodeId:'store_order_det_tlsq',layout:'',whereSql:'not exists (select mat_id from store_order_det where store_order_det.src_order_detid = view_store_order_tlsrc_det.mat_usage_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_tlsq',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select  mat_id from store_order_det where store_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_tlsq',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select  mat_id from store_order_det where store_order_det.mat_id = base_mat_code.mat_id and order_id = {FKEYID})',whereType:'',whereValue:''}
],
'store_order_det_yl':[
	{srcNodeId:'store_book_yl',destNodeId:'store_order_det_yl',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_yl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_yl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_order_det_ylfl':[
	{srcNodeId:'store_book_yl',destNodeId:'store_order_det_ylfl',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_ylfl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_ylfl',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_order_det_ylqry':[
	{srcNodeId:'store_book',destNodeId:'store_order_det_ylqry',layout:'',whereSql:'not exists (select * from store_order_det where store_order_det.book_id = store_book.book_id and order_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_order_det_ylqry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_order_det_ylqry',layout:'/public/layout/layout_tree.js',whereSql:'base_mat_code.auditing=\'1\'',whereType:'',whereValue:''}
],
'store_order_fl':[
	{srcNodeId:'store_order_pl',destNodeId:'store_order_fl',layout:'',whereSql:'auditing = \'1\' and not exists (select * from store_order  a where data_diff = \'01\' and a.src_order_id = store_order.order_id)',whereType:'',whereValue:''}
],
'store_order_tld':[
	{srcNodeId:'store_order_tlsq',destNodeId:'store_order_tld',layout:'',whereSql:'auditing = \'1\' and not exists (select * from store_order  a where data_diff = \'21\' and a.src_order_id = store_order.order_id)',whereType:'',whereValue:''}
],
'store_order_ylfl':[
	{srcNodeId:'store_order_pl',destNodeId:'store_order_ylfl',layout:'',whereSql:'auditing = \'1\' and not exists (select * from store_order  a where data_diff = \'01\' and a.src_order_id = store_order.order_id)',whereType:'',whereValue:''}
],
'store_pi_out':[
	{srcNodeId:'store_pi_acc',destNodeId:'store_pi_out',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'store_pi_out2':[
	{srcNodeId:'store_pi_acc',destNodeId:'store_pi_out2',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'store_scan_cy_qry':[
	{srcNodeId:'store_book',destNodeId:'store_scan_cy_qry',layout:'',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = store_book.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_scan_cy_qry',layout:'/public/layout/layout_tree.js',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = base_mat_code.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_scan_cy_qry',layout:'/public/layout/layout_tree.js',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = base_mat_code.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''}
],
'store_scan_det':[
	{srcNodeId:'store_book',destNodeId:'store_scan_det',layout:'',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = store_book.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_scan_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = base_mat_code.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_scan_det',layout:'/public/layout/layout_tree.js',whereSql:'auditing = \'1\' and not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = base_mat_code.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''}
],
'store_scan_det_cy':[
	{srcNodeId:'store_book',destNodeId:'store_scan_det_cy',layout:'',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = store_book.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_scan_det_cy',layout:'/public/layout/layout_tree.js',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = base_mat_code.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_scan_det_cy',layout:'/public/layout/layout_tree.js',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = base_mat_code.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''}
],
'store_scan_det_ylcy':[
	{srcNodeId:'store_book_yl',destNodeId:'store_scan_det_ylcy',layout:'',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = store_book.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_ml',destNodeId:'store_scan_det_ylcy',layout:'/public/layout/layout_tree.js',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = base_mat_code.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''},
	{srcNodeId:'base_mat_code_fl',destNodeId:'store_scan_det_ylcy',layout:'/public/layout/layout_tree.js',whereSql:'not exists ( select mat_id  from store_scan_det where store_scan_det.mat_id = base_mat_code.mat_id and scan_id = {FKEYID} )',whereType:'',whereValue:''}
],
'store_usage':[
	{srcNodeId:'store_consume_ref_ww',destNodeId:'store_usage',layout:'/public/layout/layout_grid_tb.js',whereSql:'',whereType:'',whereValue:''}
],
'sys_colcode':[
	{srcNodeId:'sel_fun_col',destNodeId:'sys_colcode',layout:'',whereSql:'fun_col.fun_id={FKEYID} and fun_col.data_type=\'string\' and fun_col.is_update=\'1\' and fun_col.col_index<10000 and fun_col.col_control=\'text\' and \nexists(select 1 from dm_field join dm_table on dm_table.table_id=dm_field.table_id where dm_table.table_name||\'.\'||dm_field.field_name=fun_col.col_code and dm_field.data_type=\'varchar\' and dm_field.data_size>1)',whereType:'',whereValue:''}
],
'sys_colcode_det':[
	{srcNodeId:'sel_fun_col',destNodeId:'sys_colcode_det',layout:'',whereSql:'exists(select 1 from sys_colcode where sys_colcode.rule_id={FKEYID} and sys_colcode.fun_id=fun_col.fun_id and sys_colcode.col_code<>fun_col.col_code) and fun_col.data_type=\'string\' and fun_col.is_update=\'1\' and fun_col.col_index<10000 and fun_col.col_control=\'text\' and\nexists(select 1 from dm_field join dm_table on dm_table.table_id=dm_field.table_id where dm_table.table_name||\'.\'||dm_field.field_name=fun_col.col_code and dm_field.data_type=\'varchar\' and dm_field.data_size>1)',whereType:'',whereValue:''}
],
'sys_fun_col':[
	{srcNodeId:'sel_field',destNodeId:'sys_fun_col',layout:'/jxstar/studio/pub/layout_selfield.js',whereSql:'',whereType:'',whereValue:''}
],
'sys_fun_customization':[
	{srcNodeId:'sys_fun_base',destNodeId:'sys_fun_customization',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''}
],
'sys_fun_det_qry':[
	{srcNodeId:'sel_fun',destNodeId:'sys_fun_det_qry',layout:'/public/layout/layout_tree.js',whereSql:'reg_type in (\'main\', \'treemain\', \'selfun\', \'result\') and module_id not like \'1010%\'',whereType:'',whereValue:''}
],
'sys_msg_obj':[
	{srcNodeId:'sys_user',destNodeId:'sys_msg_obj',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select * from sys_news_obj where obj_type = \'1\' and obj_id = user_id and news_id = {FKEYID})',whereType:'',whereValue:''}
],
'sys_msguser':[
	{srcNodeId:'sys_user',destNodeId:'sys_msguser',layout:'/public/layout/layout_tree.js',whereSql:'sys_user.is_novalid = \'0\' and not exists (select * from warn_msg_user where sys_user.user_id = warn_msg_user.user_id and warn_id = {FKEYID})',whereType:'',whereValue:''}
],
'sys_news_obj':[
	{srcNodeId:'sys_dept',destNodeId:'sys_news_obj',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select * from sys_news_obj where obj_type = \'0\' and obj_id = dept_id and news_id = {FKEYID})',whereType:'',whereValue:''},
	{srcNodeId:'sys_user',destNodeId:'sys_news_obj',layout:'/public/layout/layout_tree.js',whereSql:'not exists (select * from sys_news_obj where obj_type = \'1\' and obj_id = user_id and news_id = {FKEYID})',whereType:'',whereValue:''}
],
'sys_qrydet':[
	{srcNodeId:'sel_fun_col',destNodeId:'sys_qrydet',layout:'',whereSql:'fun_col.col_index < 10000',whereType:'',whereValue:''}
],
'sys_reg_module':[
	{srcNodeId:'sys_module',destNodeId:'sys_reg_module',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''}
],
'sys_role_data':[
	{srcNodeId:'sys_datatype',destNodeId:'sys_role_data',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'sys_role_field':[
	{srcNodeId:'sel_fun_col',destNodeId:'sys_role_field',layout:'',whereSql:'col_code not like \'%id\'',whereType:'',whereValue:''}
],
'sys_role_fun':[
	{srcNodeId:'sel_fun',destNodeId:'sys_role_fun',layout:'/public/layout/layout_tree.js',whereSql:'reg_type in (\'main\', \'treemain\', \'selfun\', \'result\') and module_id not like \'1010%\'',whereType:'',whereValue:''}
],
'sys_role_user':[
	{srcNodeId:'sys_user',destNodeId:'sys_role_user',layout:'/public/layout/layout_tree.js',whereSql:'sys_user.is_novalid = \'0\'',whereType:'',whereValue:''}
],
'sys_rpt_customization':[
	{srcNodeId:'rpt_list',destNodeId:'sys_rpt_customization',layout:'/public/layout/layout_tree.js',whereSql:'',whereType:'',whereValue:''}
],
'sys_select_field':[
	{srcNodeId:'sel_fun_col',destNodeId:'sys_select_field',layout:'',whereSql:'fun_col.col_code not like \'%id\'',whereType:'',whereValue:''}
],
'sys_user_data':[
	{srcNodeId:'sys_datatype',destNodeId:'sys_user_data',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'sys_user_funx':[
	{srcNodeId:'sel_fun',destNodeId:'sys_user_funx',layout:'/public/layout/layout_tree.js',whereSql:'reg_type in (\'main\', \'treemain\', \'selfun\')',whereType:'',whereValue:''}
],
'sys_user_role':[
	{srcNodeId:'sys_role',destNodeId:'sys_user_role',layout:'',whereSql:'',whereType:'',whereValue:''}
],
'sys_warnuser':[
	{srcNodeId:'sys_user',destNodeId:'sys_warnuser',layout:'/public/layout/layout_tree.js',whereSql:'sys_user.is_novalid = \'0\' and not exists (select * from warn_user where sys_user.user_id = warn_user.user_id and warn_id = {FKEYID})',whereType:'',whereValue:''}
],
'wf_user':[
	{srcNodeId:'sys_user',destNodeId:'wf_user',layout:'/public/layout/layout_tree.js',whereSql:'sys_user.is_novalid = \'0\' and not exists (select * from wf_user where sys_user.user_id = wf_user.user_id and nodeattr_id = {FKEYID})',whereType:'',whereValue:''}
]
};