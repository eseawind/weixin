/*
 * AssignCustom.java 2012-2-20
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.engine;

import java.util.List;
import java.util.Map;

/**
 * 任务分配规则自定义扩展类接口。
 * 一般用于根据业务单据中的主表信息或明细表信息取当前节点的分配用户信息。
 *
 * @author TonyTan
 * @version 1.0, 2012-2-20
 */
public interface AssignCustom {

	/**
	 * 取分配的用户信息，MAP对象中只需要保存user_id, user_name两个键值；
	 * 要确保返回的用户对当前审批功能有操作权限。
	 * @param task -- 任务实例对象
	 * @return
	 */
	public List<Map<String,String>> getAssignUser(TaskInstance task);
}
