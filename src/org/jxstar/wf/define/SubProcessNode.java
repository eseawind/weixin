/*
 * SubProcessNode.java 2011-1-28
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.define;

import java.util.List;
import java.util.Map;

import org.jxstar.util.MapUtil;
import org.jxstar.util.config.SystemVar;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.engine.ProcessContext;
import org.jxstar.wf.engine.ProcessInstance;
import org.jxstar.wf.engine.ProcessInstanceManager;
import org.jxstar.wf.engine.Token;
import org.jxstar.wf.engine.TokenDao;

/**
 * 子过程节点，将启动子过程实例，不会立即向下流转，
 * 要等到子过程执行完成后，重新回到当前节点才能继续向下流转。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-28
 */
public class SubProcessNode extends Node {

	/**
	 * 执行子过程节点。
	 * @param context -- 过程上下文对象
	 * @throws WfException
	 */
	public void execute(ProcessContext context) throws WfException {
		_log.showDebug(JsMessage.getValue("node.donode"), getNodeTitle());
		
		//取当前节点ID
		String parentNodeId = getNodeId();
		
		//取子过程ID
		WfDefineDao defineDao = WfDefineDao.getInstance();
		String subProcessId = defineDao.querySubProcessId(getProcessId(), parentNodeId);
		if (subProcessId == null || subProcessId.length() == 0) {
			//"找不到【{0}】子过程节点的子过程ID！"
			throw new WfException(JsMessage.getValue("subpronode.nonode"), getNodeTitle());
		}
		
		//取子过程定义信息
		Map<String,String> mpDefine = defineDao.queryProcess(subProcessId);
		if (mpDefine.isEmpty()) {//"找不到【{0}】子过程定义信息！"
			throw new WfException(JsMessage.getValue("subpronode.noprocess"), subProcessId);
		}

		//创建初始化的子过程实例
		ProcessInstanceManager manager = ProcessInstanceManager.getInstance();
		ProcessInstance subInstance = manager.createSubProcess(parentNodeId, 
												context.getProcessInstance(), mpDefine);
		//执行子过程的创建方法，保存实例到数据库中
		subInstance.create();
		
		//取过程定义中是否延时启动，缺省是直接启动
		String exeDelay = MapUtil.getValue(mpDefine, "exe_delay", "0");
		//是否创建后直接启动，缺省是直接启动
		String isDelay = SystemVar.getValue("wf.instance.delay");
		if (isDelay.equals("0") || exeDelay.equals("0")) {
			ProcessContext subContext = manager.createInitContext(subInstance);
			subInstance.startup(subContext);
		}
	}
	
	/**
	 * 恢复父过程上下文对象，继续向下流转。
	 * @param subContext -- 子过程上下文对象
	 * @throws WfException
	 */
	public void leave(ProcessContext subContext) throws WfException {
		//取子过程实例
		ProcessInstance subInstance = subContext.getProcessInstance();
		
		//取父过程信息
		String parentNodeId = subInstance.getParentNodeId();
		String parentInstanceId = subInstance.getParentInstanceId();
		
		//构建父过程上下文对象
		ProcessContext parentContext = new ProcessContext();
		
		//恢复父过程实例
		ProcessInstanceManager manager = ProcessInstanceManager.getInstance();
		ProcessInstance parentInstance = manager.restoreInstance(parentInstanceId);
		parentContext.setProcessInstance(parentInstance);
		
		//恢复父过程的标记对象
		TokenDao tokenDao = TokenDao.getInstance();
		Token parentToken = tokenDao.restoreToken(parentInstanceId, parentNodeId);
		if (parentToken == null) {//"创建【{0}】子过程节点的父标记对象失败！"
			throw new WfException(JsMessage.getValue("subpronode.parenterror"), getNodeTitle());
		}
		parentContext.setToken(parentToken);
		
		//取子过程的流出路径
		List<Line> lsLine = queryOutLine();
		if (lsLine.isEmpty()) {//"【{0}】子过程节点没有定义流出路径！"
			throw new WfException(JsMessage.getValue("subpronode.noout"), getNodeTitle());
		}
		
		leave(parentContext, lsLine.get(0));
	}

}
