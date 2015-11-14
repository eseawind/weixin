package org.jxstar.wf.client;

import org.jxstar.control.action.RequestContext;
import org.jxstar.service.BusinessObject;
import org.jxstar.service.util.FunStatus;
import org.jxstar.util.resource.JsMessage;
import org.jxstar.wf.define.TaskNode;
import org.jxstar.wf.util.ProcessUtil;

/**
 * 是工作流实例与任务实例触发事件时的处理类，在系统事件注册中需要使用。
 *
 * @author TonyTan
 * @version 1.0, 2011-11-16
 */
public class ProcessEvent extends BusinessObject {
	private static final long serialVersionUID = 1L;

	/**
	 * 任务实例完成，在task_3事件中调用。
	 * @param request
	 * @return
	 */
	public String completeTask(RequestContext request) {//"开始执行【{0}】事件"
		_log.showDebug(JsMessage.getValue("processclientbo.doevent", "task_3"));
		String funId = request.getRequestValue("check_funid");
		String dataId = request.getRequestValue("data_id");
		String taskId = request.getRequestValue("task_id");
		String checkType = request.getRequestValue("check_type");
		//"审批意见："
		_log.showDebug(JsMessage.getValue("processclientbo.advice") + 
				checkType + ";" + funId + ";" + dataId + ";" + taskId);
		
		//正常退回进入了上一节点，需要在此修改业务记录状态为“5 审批退回”
		//如果退回到了编辑人，在其他方法中记录状态又会改为“6 退回编辑”
		if (checkType.equals(TaskNode.RETURN)) {
			String audit = FunStatus.getValue(funId, "audit2", "5");
			
			ProcessUtil.updateFunAudit(funId, dataId, audit);
		} else if (checkType.equals(TaskNode.AGREE) || checkType.equals(TaskNode.GETBACK)) {
		//正常同意、取回时记录状态还是2
			String audit = FunStatus.getValue(funId, "audit2", "2");
			
			ProcessUtil.updateFunAudit(funId, dataId, audit);
		} 
		
		return _returnSuccess;
	}
	
	/**
	 * 启动过程实例，在process_1事件中调用。
	 * @param request -- 请求对象
	 * @return
	 */
	public String startupProcess(RequestContext request) {//"开始执行【{0}】事件"
		_log.showDebug(JsMessage.getValue("processclientbo.doevent", "process_1"));
		//修改记录状态为审批中
		String funId = request.getRequestValue("check_funid");
		String dataId = request.getRequestValue("data_id");
		//取设置的业务状态值
		String audit = FunStatus.getValue(funId, "audit2", "2");
		//修改功能记录状态
		if (!ProcessUtil.updateFunAudit(funId, dataId, audit)) {
			//"更新【{0}】的【{1}】记录的状态为【{2}】失败！"
			setMessage(JsMessage.getValue("processclientbo.uperror"), 
					funId, dataId, audit);
			return _returnFaild;
		}
		
		return _returnSuccess;
	}
	
	/**
	 * 正常完成过程实例，在process_3事件中调用。
	 * @param request -- 请求对象
	 * @return
	 */
	public String completeProcess(RequestContext request) {//"开始执行【{0}】事件"
		_log.showDebug(JsMessage.getValue("processclientbo.doevent", "process_3"));
		//修改记录状态为审批通过
		String funId = request.getRequestValue("check_funid");
		String dataId = request.getRequestValue("data_id");
		//取设置的业务状态值
		String audit = FunStatus.getValue(funId, "audit3", "3");
		//修改功能记录状态
		if (!ProcessUtil.updateFunAudit(funId, dataId, audit)) {
			//"更新【{0}】的【{1}】记录的状态为【{2}】失败！"
			setMessage(JsMessage.getValue("processclientbo.uperror"), 
					funId, dataId, audit);
			return _returnFaild;
		}
		
		//给编辑人发消息通知
		
		
		return _returnSuccess;
	}
	
	/**
	 * 终止过程实例，在process_7事件中调用。
	 * @param request -- 请求对象
	 * @return
	 */
	public String terminateProcess(RequestContext request) {//"开始执行【{0}】事件"
		_log.showDebug(JsMessage.getValue("processclientbo.doevent", "process_7"));
		//根据审批意见，修改记录状态
		String funId = request.getRequestValue("check_funid");
		String dataId = request.getRequestValue("data_id");
		String checkType = request.getRequestValue("check_type");
		
		if (!updateAudit(funId, dataId, checkType)) {
			//"更新【{0}】的【{1}】记录的状态失败！"
			setMessage(JsMessage.getValue("processclientbo.staterror"), 
					funId, dataId);
			return _returnFaild;
		}
		
		//根据审批意见，给历史审批人发送通知消息
		
		
		return _returnSuccess;
	}
	
	/**
	 * 修改业务记录状态值，在过程实例结束时调用。
	 * @param funId
	 * @param dataId
	 * @param checkType
	 * @return
	 */
	private boolean updateAudit(String funId, String dataId, String checkType) {
		//已注销，发生异常了
		String audit = FunStatus.getValue(funId, "audit_e", "7");
		if (checkType.equals(TaskNode.RETURNEDIT)) {
		//退回编辑人
			audit = FunStatus.getValue(funId, "audit0", "6");
		} else if (checkType.equals(TaskNode.DISAGREE)) {
		//已否决
			audit = FunStatus.getValue(funId, "audit4", "4");
		} else if (checkType.equals(TaskNode.RETURN)) {
		//退回
			audit = FunStatus.getValue(funId, "audit2", "5");
		}
		
		return ProcessUtil.updateFunAudit(funId, dataId, audit);
	}
}
