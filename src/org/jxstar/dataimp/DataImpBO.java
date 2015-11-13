/*
 * Copyright(c) 2012 Donghong Inc.
 */
package org.jxstar.dataimp;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.text.MessageFormat;
import java.util.List;
import java.util.Map;

import org.apache.commons.fileupload.FileItem;
import org.jxstar.control.action.RequestContext;
import org.jxstar.dao.DaoParam;
import org.jxstar.dataimp.parse.DataParser;
import org.jxstar.dataimp.parse.TxtDataParser;
import org.jxstar.dataimp.parse.XlsDataParser;
import org.jxstar.service.BusinessObject;
import org.jxstar.util.MapUtil;
import org.jxstar.util.StringValidator;
import org.jxstar.util.factory.FactoryUtil;

/**
 * 公共数据导入处理类。
 *
 * @author TonyTan
 * @version 1.0, 2012-6-11
 */
public class DataImpBO extends BusinessObject {
	private static final long serialVersionUID = 1L;
	//返回到环境变量中的导入数据的主键值队列
	private static final String IMP_KEYIDS = "imp_keyids";
	
	//返回到前台的不合格数据信息，已经新增的数据不做回滚
	private StringBuilder _validInfo = new StringBuilder();

	/**
	 * 根据功能ID找到数据导入定义信息：构建表头数据定义对象、表格数据定义对象、关联关系定义对象、新增数据SQL对象；
	 * 读取请求对象的中xls文件；
	 * 解析xls文件中的数据；
	 * 如果有表头字段：获取模板表头数据集；
	 * 如果有表格字段：获取一行表格数据集；
	 * 如果有关系字段：根据上面两个数据集中的值作为参数，解析关系SQL，获取关联数据集；
	 * 判断必填，如果没有则不导入；
	 * 调用新增SQL，新增一条记录；
	 * 循环所有表格数据新增。
	 * @param request
	 * @return
	 */
	public String onDataImp(RequestContext request) {
		//当前功能ID
		String impFunId = request.getRequestValue("impFunId");
		//当前导入定义序号，处理一个功能有多个数据导入模板的问题
		String impIndex = request.getRequestValue("impIndex");
		//上传的导入数据文件
		FileItem impFile = (FileItem) request.getRequestObject("import_file");
		if (impFile == null) {
			setMessage("没有找到上传的数据文件！");
			return _returnFaild;
		}
		InputStream ins;
		try {
			ins = impFile.getInputStream();
		} catch (IOException e) {
			_log.showError(e);
			setMessage("解析上传的数据文件出错：" + e.getMessage());
			return _returnFaild;
		}
		
		//取外键值
		String fkValue = request.getRequestValue("fkValue");
		//当前用户信息
		Map<String,String> userInfo = request.getUserInfo();
		
		//解析数据，执行导入
		List<String> lsImpKeys = dataImp(ins, impFunId, impIndex, fkValue, userInfo);
		if (lsImpKeys == null || lsImpKeys.isEmpty()) return _returnFaild;
		
		_log.showDebug("..........all lsImpKeys:" + lsImpKeys.toString());
		_log.showDebug("..........all valid info:" + _validInfo.toString());
		//把校验信息返回到前台
		if (_validInfo.length() > 0) {
			setReturnData("{valueInfo:'" + _validInfo.toString() + "'}");
		}
		
		request.getRequestMap().put(IMP_KEYIDS, lsImpKeys);
		return _returnSuccess;
	}
	
	/**
	 * 执行数据导入，方便测试。
	 * @param ins
	 * @param impFunId
	 * @param impIndex
	 * @param fkValue
	 * @param userInfo
	 * @return
	 */
	public List<String> dataImp(InputStream ins, String impFunId, String impIndex, 
			String fkValue, Map<String,String> userInfo) {
		Map<String,String> mpImp = DataImpUtil.queryImp(impFunId, impIndex);
		if (mpImp.isEmpty()) {
			setMessage("没有找到【{0}】功能的数据导入定义！", impFunId);
			return null;
		}
		//模板文件类型：xls, csv
		String tplType = mpImp.get("tpl_type");
		//定义ID
		String impId = mpImp.get("imp_id");
		//检查是否有没有定义数据来源位置的字段
		if (DataImpUtil.hasNoPos(impId)) {
			setMessage("“数据字段定义”明细中，来源是“表头”“表格”的字段中有些没有定义“位置”");
			return null;
		}
		
		//第一行数据的位置
		int firstRow = DataImpUtil.getFirstRow(impId); 
		if (firstRow < 0) {
			setMessage("第一行数据位置为【{0}】，不正确！", firstRow);
			return null;
		}
		
		//解析上传的文件
		DataParser parser = null;
		if (tplType.equals("xls")) {
			parser = new XlsDataParser();
		} else if (tplType.equals("txt") || tplType.equals("csv")) {
			parser = new TxtDataParser();
		} else {
			setMessage("没有找到解析上传文件的对象！");
			return null;
		}
		parser.init(ins, firstRow);
		
		//新增SQL对象
		String insertSql = mpImp.get("insert_sql");
		//解析目标SQL中的常量
		insertSql = DataImpUtil.parseConstant(insertSql, userInfo);
		//解析目标SQL中的外键值
		insertSql = insertSql.replaceFirst(DataImpUtil.FKEYID_REGEX, DataImpUtil.addChar(fkValue));
		
		//解析数据，执行导入
		List<String> lsImpKeys = importData(parser, impId, insertSql, impFunId);
		if (lsImpKeys == null || lsImpKeys.isEmpty()) {
			setMessage("执行数据导入操作失败！");
			return null;
		}
		
		return lsImpKeys;
	}
	
	/**
	 * 返回导入数据过程中数据校验错误
	 * @return
	 */
	public String getValidInfo() {
		return _validInfo.toString();
	}
	
	/**
	 * 解析数据，根据定义，执行导入
	 * @return
	 */
	private List<String> importData(DataParser parser, String impId, String insertSql, String funId) {
		List<String> lsImpKeys = FactoryUtil.newList();
		//表头定义
		List<Map<String,String>> formField = DataImpUtil.queryDataField(impId, "2");
		//解析表头中的数据
		Map<String,String> formData = parseForm(parser, formField);
		
		//表格定义
		List<Map<String,String>> lsGfield = DataImpUtil.queryDataField(impId, "1");
		//解析表格中的数据
		List<Map<String,String>> gridData = parseGrid(parser, lsGfield);
		
		//关系SQL定义
		List<Map<String,String>> lsRelatSql = DataImpUtil.queryRelatSql(impId);
		//是否有关系数据字段
		boolean hasRelat = DataImpUtil.hasRelatField(impId);
		
		//新增SQL的参数
		List<Map<String,String>> lsField = DataImpUtil.queryField(impId);
		
		//取导入字段的长度
		Map<String,String> mpFieldLen = DataImpUtil.queryFieldLen(funId, impId);
		
		//判断是否有主键标志与编码标志
		boolean isNewKeyId = (insertSql.indexOf(DataImpUtil.NEW_KEYID) >= 0);
		if (isNewKeyId) {
			insertSql = insertSql.replaceFirst(DataImpUtil.NEW_KEYID_REGEX, "?");
		}
		boolean isNewCode = (insertSql.indexOf(DataImpUtil.NEW_CODE) >= 0);
		if (isNewCode) {
			insertSql = insertSql.replaceFirst(DataImpUtil.NEW_CODE_REGEX, "?");
		}
		_log.showDebug("..........insert sql:" + insertSql);
		//构建参数对象
		DaoParam param = _dao.createParam(insertSql);
		param.setUseParse(true);
		
		//开始导入数据
		int index = 0, indexok = 0;
		for (Map<String,String> mpData : gridData) {
			index++;
			Map<String,String> relatData = null;
			if (hasRelat) {//取得相关关系数据集
				relatData = DataImpUtil.queryRelat(lsRelatSql, formData, mpData);
			}
			
			//解析SQL中的主键、编码
			String keyId = "";
			if (isNewKeyId) {
				keyId = DataImpUtil.getKeyValue(funId);
				param.addStringValue(keyId);
			}
			if (isNewCode) {
				param.addStringValue(DataImpUtil.getCodeValue(funId, mpData));
			}
			
			//取新增SQL的参数：如果是表头数据则从formData取值；如果是表格数据则从gridData取值；如果是关系数据则从relat取值
			//同时检查导入字段值的有效性：必填项、数值、日期格式
			boolean isValid = true;
			for (Map<String,String> mpField : lsField) {
				String value = "";
				String is_must = mpField.get("is_must");
				String data_src = mpField.get("data_src");
				
				String data_type = mpField.get("data_type");
				String field_name = mpField.get("field_name");
				String field_title = mpField.get("field_title");
				
				if (data_src.equals("1")) {
					value = MapUtil.getValue(mpData, field_name);
				} else if (data_src.equals("2")) {
					value = MapUtil.getValue(formData, field_name);
				} else if (data_src.equals("3")) {
					if (relatData != null && !relatData.isEmpty()) {
						value = MapUtil.getValue(relatData, field_name);
					}
				}
				//_log.showDebug("..........field_name={0}, data_type={1}, data_src={2}, value={3}", field_name, data_type, data_src, value);
				//日期值修补
				if (data_type.equals("date") && value.length() > 0) {
					value = DataImpUtil.repDateValue(value);
				}
				//数值处理，去掉逗号
				if ((data_type.equals("double") || data_type.equals("int")) && value.length() > 0) {
					value = value.replace(",", "");
				}
				
				//取字段长度
				String field_len = MapUtil.getValue(mpFieldLen, field_name, "0");
				
				//字段值有效性校验
				isValid = validValue(field_title, value, data_type, is_must, field_len, index);
				if (isValid) {
					param.addValue(value);
					param.addType(data_type);
				} else {//不合法则退出，继续下一条检查
					break;
				}
			}
			//数据校验合格才执行新增操作，校验不合格则继续处理下一条，把所有合格的记录导入系统
			if (isValid) {
				boolean bret = _dao.update(param);
				if (!bret) {//执行失败则退出，原来新增记录继续有效
					return lsImpKeys;
				} else {
					lsImpKeys.add(keyId);
				}
				
				indexok++;
				_log.showDebug("..........success size:" + indexok);
			}
			
			//清除新增参数
			param.clearParam();
		}
		
		return lsImpKeys;
	}
	
	//字段值有效性校验
	private boolean validValue(String fieldtitle, String value, String datatype, String ismust, String field_len, int row) {
		//必填项校验
		if (ismust.equals("1") && value.length() == 0) {
			String msg = MessageFormat.format("第【{0}】行，字段【{1}】的值【{2}】必须填写；", row, fieldtitle, value);
			_validInfo.append(msg);
			_log.showDebug(msg);
			return false;
		}
		//数值校验
		if ((datatype.equals("double") || datatype.equals("int")) && value.length() > 0) {
			if (!StringValidator.validValue(value, StringValidator.DOUBLE_TYPE)) {
				String msg = MessageFormat.format("第【{0}】行，字段【{1}】的值【{2}】必须是数值类型；", row, fieldtitle, value);
				_validInfo.append(msg);
				_log.showDebug(msg);
				return false;
			}
		}
		//日期校验
		if (datatype.equals("date") && value.length() > 0) {
			if (!StringValidator.validValue(value, StringValidator.DATE_TYPE)) {
				String msg = MessageFormat.format("第【{0}】行，字段【{1}】的值【{2}】必须是日期类型(YYYY-MM-DD)；", row, fieldtitle, value);
				_validInfo.append(msg);
				_log.showDebug(msg);
				return false;
			}
		}
		//长度校验
		if (datatype.equals("string") && value.length() > 0) {
			int len = Integer.parseInt(field_len);
			try {
				int len1 = value.getBytes("GBK").length;
				if (len1 > len) {
					String msg = MessageFormat.format("第【{0}】行，字段【{1}】的值【{2}】长度为【{3}】超过【{4}】个字节；", row, fieldtitle, value, len1, len);
					_validInfo.append(msg);
					_log.showDebug(msg);
					return false;
				}
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
		}
		return true;
	}
	
	/**
	 * 解析表格中的数据
	 * @param parser
	 * @param lsGfield
	 * @return
	 */
	private List<Map<String,String>> parseGrid(DataParser parser, List<Map<String,String>> lsGfield) {
		List<Map<String,String>> lsData = FactoryUtil.newList();
		
		int rowsNum = parser.getRowsNum();
		int colsNum = parser.getColsNum();
		_log.showDebug("..........rows num: {0}, cols num: {1}", rowsNum, colsNum);
		if (rowsNum < 0 || colsNum < 0) {
			_log.showWarn("parse grid data rowsnum is -1 or colsnum is -1!!");
			return lsData;
		}
		
		for (int i = 0; i < rowsNum; i++) {
			_log.showDebug("..........parse row:" + i);
			
			Map<String,String> mpData = FactoryUtil.newMap();
			//是否有效数据，如果有必填字段没有填写，则不添加
			boolean isValid = true;
			for (Map<String,String> mpField : lsGfield) {
				String fieldPos = mpField.get("field_pos");
				String fieldName = mpField.get("field_name");
				String is_must = mpField.get("is_must");
				
				int[] pos = DataImpUtil.getPosition(fieldPos);
				if (pos.length != 2) {
					_log.showWarn("import data position [{0}] is error!!", fieldPos);
					continue;
				}
				
				String value = parser.getData(pos[0]+i, pos[1]);
				if (is_must.equals("1") && value.length() == 0) {
					_log.showDebug("..........parse row fieldname:[{0}] data is empty!!", fieldName);
					isValid = false;
					break;
				}
				
				mpData.put(fieldName, value);
			}
			
			if (isValid) {
				_log.showDebug("..........parse row data:" + mpData);
				lsData.add(mpData);
			} else {
				_log.showDebug("..........parse row data has not valid!!");
			}
		}
		
		return lsData;
	}
	
	/**
	 * 解析表头中的数据
	 * @param parser
	 * @param formField
	 * @return
	 */
	private Map<String,String> parseForm(DataParser parser, List<Map<String,String>> formField) {
		Map<String,String> mpData = FactoryUtil.newMap();
		
		for (Map<String,String> mpField : formField) {
			String fieldPos = mpField.get("field_pos");
			String fieldName = mpField.get("field_name");
			
			int[] pos = DataImpUtil.getPosition(fieldPos);
			if (pos.length != 2) {
				_log.showWarn("import data position [{0}] is error!!", fieldPos);
				continue;
			}
			
			String value = parser.getData(pos[0], pos[1]);
			mpData.put(fieldName, value);
		}
		_log.showDebug("..........parse form data:" + mpData);
		
		return mpData;
	}
}
