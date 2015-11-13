/*
 * Copyright(c) 2013 DongHong Inc.
 */
package org.jxstar.service.studio;

import java.util.List;
import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;

/**
 * 
 *
 * @author TonyTan
 * @version 1.0, 2013-10-25
 */
public class MyAttachRelatBO extends BusinessObject implements AttachRelatI {
	private static final long serialVersionUID = 1L;

	public String[] queryDataId(String dataId) {
		String[] ret = new String[0];
		
		String sql = "select mat_id from dev_task_mat where task_matid = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(dataId);
		
		List<Map<String,String>> ls = _dao.query(param);
		if (ls.isEmpty()) {
			return ret;
		}
		
		ret = new String[ls.size()];
		for (int i = 0, n = ls.size(); i < n; i++) {
			Map<String,String> mp = ls.get(i);
			
			ret[i] = mp.values().iterator().next();
		}
		return ret;
	}

}
