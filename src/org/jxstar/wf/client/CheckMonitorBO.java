package org.jxstar.wf.client;

import java.util.Map;

import org.jxstar.dao.DaoParam;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.util.FunStatus;
import org.jxstar.util.MapUtil;
import org.jxstar.wf.invoke.StatusCode;
import org.jxstar.wf.util.ProcessUtil;

/**
 * 过程实例监控器相关处理类。
 *
 * @author TonyTan
 * @version 1.0, 2011-11-28
 */
public class CheckMonitorBO extends BusinessObject {
	private static final long serialVersionUID = 1L;

	public String exeSuspended(String[] instanceIds) {
		if (instanceIds == null || instanceIds.length == 0) return _returnSuccess;
		
		for (int i = 0; i < instanceIds.length; i++) {
			String ret = exeSuspended(instanceIds[i]);
			if (_returnFaild.equals(ret)) return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 恢复挂起状态的过程实例为初始化状态或执行状态
	 * @param instanceId
	 * @return
	 */
	public String exeSuspended(String instanceId) {
		if (instanceId == null || instanceId.length() == 0) {
			setMessage("过程实例ID为空！");
			return _returnFaild;
		}
		
		Map<String,String> data = instanceStatus(instanceId);
		String state = MapUtil.getValue(data, "run_state");
		if (!StatusCode.PROCESS_SUSPENDED.equals(state)) {
			setMessage("过程实例不是挂起状态，不能恢复！");
			return _returnFaild;
		}
		
		String status = StatusCode.PROCESS_INITIATED;
		if (hasTask(instanceId)) {
			_log.showDebug("已经产生了任务实例，将恢复为执行状态！");
			status = StatusCode.PROCESS_ACTIVE;
			
			//恢复任务与分配的状态为初始
			updateTask(instanceId);
			updateAssign(instanceId);
		}
		
		if (!updateStatus(instanceId, status)) {
			setMessage("挂起恢复为初始化状态出错！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	public String delSuspended(String[] instanceIds) {
		if (instanceIds == null || instanceIds.length == 0) return _returnSuccess;
		
		for (int i = 0; i < instanceIds.length; i++) {
			String ret = delSuspended(instanceIds[i]);
			if (_returnFaild.equals(ret)) return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 删除过程实例，如果有任务实例则不能删除；
	 * 恢复业务记录为未提交状态；
	 * @param instanceId
	 * @return
	 */
	public String delSuspended(String instanceId) {
		if (instanceId == null || instanceId.length() == 0) {
			setMessage("过程实例ID为空！");
			return _returnFaild;
		}
		
		Map<String,String> data = instanceStatus(instanceId);
		String state = MapUtil.getValue(data, "run_state");
		if (!StatusCode.PROCESS_SUSPENDED.equals(state)) {
			setMessage("过程实例不是挂起状态，不能恢复！");
			return _returnFaild;
		}
		
		if (hasTask(instanceId)) {
			setMessage("已经产生了任务实例，过程实例不能删除！");
			return _returnFaild;
		}
		
		if (deleteInstance(instanceId)) {
			setMessage("删除过程实例出错！");
			return _returnFaild;
		}
		
		String funId = MapUtil.getValue(data, "fun_id");
		String dataId = MapUtil.getValue(data, "data_id");
		//取设置的业务状态值
		String audit0 = FunStatus.getValue(funId, "audit0", "0");
		//修改功能记录状态
		boolean ret = ProcessUtil.updateFunAudit(funId, dataId, audit0);
		if (!ret) {
			setMessage("修改业务记录状态出错！");
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	//删除挂起的过程实例
	private boolean deleteInstance(String instanceId) {
		String sql = "delete from wf_instance where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		
		return _dao.update(param);
	}
	
	//取过程实例的状态
	private Map<String,String> instanceStatus(String instanceId) {
		String sql = "select run_state, data_id, fun_id from wf_instance where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		
		return _dao.queryMap(param);
	}
	
	//检查过程实例是否有任务实例
	private boolean hasTask(String instanceId) {
		String sql = "select count(*) as cnt from wf_task where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(instanceId);
		
		Map<String,String> data = _dao.queryMap(param);
		return MapUtil.hasRecord(data);
	}
	
	//修改过程实例的状态
	private boolean updateStatus(String instanceId, String status) {
		String sql = "update wf_instance set run_state = ? where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(status);
		param.addStringValue(instanceId);
		
		return _dao.update(param);
	}
	
	//修改任务实例的状态为创建
	private boolean updateTask(String instanceId) {
		String sql = "update wf_task set run_state = ? where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(StatusCode.TASK_CREATED);
		param.addStringValue(instanceId);
		
		return _dao.update(param);
	}
	
	//修改任务分配的状态为创建
	private boolean updateAssign(String instanceId) {
		String sql = "update wf_assign set run_state = ? where instance_id = ?";
		DaoParam param = _dao.createParam(sql);
		param.addStringValue(StatusCode.TASK_CREATED);
		param.addStringValue(instanceId);
		
		return _dao.update(param);
	}
}
