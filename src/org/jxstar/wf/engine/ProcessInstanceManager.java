/*
 * ProcessInstanceManager.java 2011-1-27
 * 
 * Copyright 2010 Guangzhou Donghong Software Technology Inc.
 * Licensed under the www.jxstar.org
 */
package org.jxstar.wf.engine;

import java.util.List;
import java.util.Map;

import org.jxstar.util.DateUtil;
import org.jxstar.util.factory.FactoryUtil;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.WfException;
import org.jxstar.wf.define.Node;
import org.jxstar.wf.define.WfDefineDao;
import org.jxstar.wf.define.WfDefineManager;
import org.jxstar.wf.invoke.StatusCode;
import org.jxstar.wf.util.ProcessUtil;

/**
 * 过程实例管理类：
 * 负责过程实例的创建、查询、恢复，负责构建过程运行上下文对象，是单例对象。
 *
 * @author TonyTan
 * @version 1.0, 2011-1-27
 */
public class ProcessInstanceManager {
	//定义信息DAO
	private WfDefineDao _defineDao = WfDefineDao.getInstance();
	//过程实例DAO
	private ProcessInstanceDao _instanceDao = ProcessInstanceDao.getInstance();
	private static ProcessInstanceManager _instance = new ProcessInstanceManager();

	private ProcessInstanceManager(){}
	/**
	 * 构建单例对象。
	 * @return
	 */
	public static ProcessInstanceManager getInstance() {
		return _instance;
	}
	
	/**
	 * 根据过程定义信息、应用数据创建初始化的过程实例。
	 * 
	 * @param dataId -- 应用数据主键
	 * @param mpUser -- 当前用户
	 * @param appData -- 应用数据
	 * @param mpDefine -- 过程定义信息
	 * @throws WfException
	 */
	public ProcessInstance createProcess(String dataId, Map<String,String> mpUser, 
			Map<String,String> appData, Map<String,String> mpDefine) {
		ProcessInstance instance = new ProcessInstance();
		instance.setAppData(appData);
		
		//过程定义ID
		String processId = mpDefine.get("process_id");
		//取开始节点ID
		String startNodeId = _defineDao.queryStartNodeId(processId);
		
		instance.setProcessId(processId);
		instance.setProcessName(mpDefine.get("process_name"));
		instance.setFunId(mpDefine.get("fun_id"));
		instance.setDataId(dataId);
		instance.setStartDate(DateUtil.getTodaySec());
		instance.setStartUserId(mpUser.get("user_id"));
		instance.setStartUserName(mpUser.get("user_name"));
		instance.setStartNodeId(startNodeId);
		instance.setRunState(StatusCode.PROCESS_INITIATED);
		
		return instance;
	}
	
	/**
	 * 根据父过程的上下文创建子过程实例。
	 * @param parentNodeId -- 父节点ID
	 * @param parentInstance -- 父过程实例
	 * @param mpDefine -- 子过程定义
	 * @throws WfException
	 */
	public ProcessInstance createSubProcess(String parentNodeId, ProcessInstance parentInstance, 
					Map<String,String> mpDefine) throws WfException {
		ProcessInstance instance = new ProcessInstance();
		instance.setAppData(parentInstance.getAppData());
		
		//过程定义ID
		String processId = mpDefine.get("process_id");
		//取开始节点ID
		String startNodeId = _defineDao.queryStartNodeId(processId);
		//设置基础信息
		instance.setProcessId(processId);
		instance.setProcessName(mpDefine.get("process_name"));
		instance.setFunId(mpDefine.get("fun_id"));
		instance.setDataId(parentInstance.getDataId());
		instance.setStartDate(DateUtil.getTodaySec());
		instance.setStartUserId(parentInstance.getStartUserId());
		instance.setStartUserName(parentInstance.getStartUserName());
		instance.setStartNodeId(startNodeId);
		instance.setRunState(StatusCode.PROCESS_INITIATED);
		//设置父过程信息
		instance.setParentNodeId(parentNodeId);
		instance.setParentProcessId(parentInstance.getProcessId());
		instance.setParentInstanceId(parentInstance.getInstanceId());
		
		return instance;
	}
	
	/**
	 * 根据数据库中的实例数据恢复为实例对象。
	 * @param instanceId -- 实例ID
	 * @return
	 */
	public ProcessInstance restoreInstance(String instanceId) throws WfException {
		Map<String,String> mpInstance = _instanceDao.queryProcess(instanceId);
		if (mpInstance.isEmpty()) {//"没有找到数据库中的【{0}】实例数据！"
			throw new WfException(JsMessage.getValue("processmng.nostance"), instanceId);
		}
		
		return restoreInstance(mpInstance);
	}
	
	/**
	 * 创建初始化状态的过程上下文对象，
	 * 包括过程实例对象、过程标记对象，不需要创建任务实例。
	 * @param mpInstance -- 过程实例数据。
	 * @return ProcessContext
	 * @throws WfException
	 */
	public ProcessContext createInitContext(Map<String,String> mpInstance) throws WfException {
		//创建过程实例对象
		ProcessInstance instance = restoreInstance(mpInstance);
		
		return createInitContext(instance);
	}
	
	/**
	 * 根据初始化的过程实例创建上下文对象。
	 * @param instance -- 过程实例
	 * @return
	 * @throws WfException
	 */
	public ProcessContext createInitContext(ProcessInstance instance) throws WfException {
		//取过程定义ID与开始节点ID
		String processId = instance.getProcessId();
		String startNodeId = instance.getStartNodeId();
		//创建标记对象
		Token token = new Token();
		//取开始节点对象
		WfDefineManager manager = WfDefineManager.getInstance();
		Node startNode = manager.createNode(processId, startNodeId);
		token.setNode(startNode);
		
		//创建上下文对象
		ProcessContext context = new ProcessContext();
		context.setToken(token);
		context.setProcessInstance(instance);
		
		return context;
	}
	
	/**
	 * 查询所有初始化状态的过程实例，并立即修改状态为运行，避免重复查询；
	 * 创建的对象是过程上下文，包含过程实例、过程标记对象，暂时不能创建任务实例。
	 * @return List<ProcessContext>
	 * @throws WfException
	 */
	public List<ProcessContext> queryInitProcess() throws WfException {
		List<ProcessContext> lsContext = FactoryUtil.newList();
		
		List<Map<String,String>> lsData;
		//采用类锁，保证查询与更新是同时完成
		synchronized(ProcessInstanceManager.class) {
			//查询初始化的过程实例数据，只查询需要异步执行的过程实例
			lsData = _instanceDao.queryInitProcess();
			if (lsData.isEmpty()) {
				return lsContext;
			}
			
			//修改初始化的过程实例状态为“运行”，避免重复查询
			if (!_instanceDao.updateRun(lsData)) {
				//"更新初始化的实例状态为“运行”失败！"
				throw new WfException(JsMessage.getValue("processmng.uperror"));
			}
		}
		
		//根据过程实例数据创建上下文对象
		for (int i = 0, n = lsData.size(); i < n; i++) {
			Map<String,String> mpData = lsData.get(i);
			
			lsContext.add(createInitContext(mpData));
		}
		
		return lsContext;
	}
	
	/**
	 * 恢复过程实例对象，只设置属性信息。
	 * @param mpInstance -- 实例数据
	 * @return
	 */
	private ProcessInstance restoreInstance(Map<String,String> mpInstance) {
		//创建过程实例对象
		ProcessInstance instance = new ProcessInstance();
		String processId = mpInstance.get("process_id");
		String startNodeId = mpInstance.get("start_nodeid");
		String funId = mpInstance.get("fun_id");
		String dataId = mpInstance.get("data_id");
		//恢复实例的基础信息
		instance.setProcessId(processId);
		instance.setProcessName(mpInstance.get("process_name"));
		instance.setFunId(funId);
		instance.setDataId(dataId);
		instance.setInstanceId(mpInstance.get("instance_id"));
		instance.setStartDate(mpInstance.get("start_date"));
		instance.setStartUserId(mpInstance.get("start_userid"));
		instance.setStartUserName(mpInstance.get("start_user"));
		instance.setStartNodeId(startNodeId);
		instance.setRunState(mpInstance.get("run_state"));
		
		//恢复子过程的父过程相关信息
		instance.setParentNodeId(mpInstance.get("parent_nid"));
		instance.setParentProcessId(mpInstance.get("parent_pid"));
		instance.setParentInstanceId(mpInstance.get("parent_sid"));
		
		//恢复应用数据
		Map<String,String> mpData = ProcessUtil.queryFunData(funId, dataId);
		instance.setAppData(mpData);
		
		return instance;
	}
}
