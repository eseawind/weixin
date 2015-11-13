/*
 * Copyright(c) 2013 DongHong Inc.
 */
package org.jxstar.util;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.jxstar.util.factory.FactoryUtil;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * json数据与对象之间转换的工具类。
 *
 * @author TonyTan
 * @version 1.0, 2013-12-16
 */
public class JsonUtil {

	/**
	 * list转为数组，map转为对象
	 * json格式如：[{key1:value1, key2:value2, ...}, {key1:value1, key2:value2, ...}, ...]
	 * @param ls -- List<Map<String,String>>数据对象
	 * @return
	 */
	public static String list2json(List<Map<String,String>> ls) {
		String ret = "";
		if (ls == null || ls.isEmpty()) {
			return ret;
		}
		
		JsonArray ja = new JsonArray();
		for (Map<String,String> mp : ls) {
			JsonObject jo = new JsonObject();
			
			Iterator<String> itr = mp.keySet().iterator();
			while (itr.hasNext()) {
				String key = itr.next();
				String value = mp.get(key);
				jo.addProperty(key, value);
			}
			
			ja.add(jo);
		}
		
		return ja.toString();
	}
	
	/**
	 * map转换为json对象，都是key-value
	 * json格式如：{key1:value1, key2:value2, ...}
	 * @param map
	 * @return
	 */
	public static String map2json(Map<String,String> map) {
		JsonObject jo = new JsonObject();
		
		Iterator<String> itr = map.keySet().iterator();
		while (itr.hasNext()) {
			String key = itr.next();
			String value = map.get(key);
			jo.addProperty(key, value);
		}
		
		return jo.toString();
	}
	
	/**
	 * json转换为list对象，内部是map对象key-value
	 * json格式如：[{key1:value1, key2:value2, ...}, {key1:value1, key2:value2, ...}, ...]
	 * @param json
	 * @return
	 */
	public static List<Map<String,String>> json2list(String json) {
		List<Map<String,String>> ls = FactoryUtil.newList();
		if (json == null || json.length() == 0) return ls;
		
		JsonParser jp = new JsonParser();
		JsonArray ja = jp.parse(json).getAsJsonArray();
		for (JsonElement je : ja) {
			JsonObject jo = je.getAsJsonObject();
			
			Map<String,String> mp = FactoryUtil.newMap();
			for (Entry<String, JsonElement> e : jo.entrySet()) {
				//把json数据保存到map中
				mp.put(e.getKey(), e.getValue().getAsString());
			}
			ls.add(mp);
		}
		
		return ls;
	}
	
	/**
	 * json转换为map对象，都是key-value
	 * json格式如：{key1:value1, key2:value2, ...}
	 * @param json
	 * @return
	 */
	public static Map<String,String> json2map(String json) {
		Map<String,String> mp = FactoryUtil.newMap();
		if (json == null || json.length() == 0) return mp;
		
		JsonParser jp = new JsonParser();
		JsonObject jo = jp.parse(json).getAsJsonObject();
			
		for (Entry<String, JsonElement> e : jo.entrySet()) {
			//把json数据保存到map中
			mp.put(e.getKey(), e.getValue().getAsString());
		}
		
		return mp;
	}
	
	/**
	 * json转换为map对象，都是key-value，值可以是字符串或者字符串数组
	 * json格式如：{key1:value1, key2:value2, key3:[...], ...}
	 * @param json
	 * @return
	 */
	public static Map<String,Object> json2maps(String json) {
		Map<String,Object> mp = FactoryUtil.newMap();
		if (json == null || json.length() == 0) return mp;
		
		JsonParser jp = new JsonParser();
		JsonObject jo = jp.parse(json).getAsJsonObject();
			
		for (Entry<String, JsonElement> e : jo.entrySet()) {
			//把json数据保存到map中
			String key = e.getKey();
			JsonElement ele = e.getValue();
			if (ele.isJsonNull()) {
				mp.put(key, "");
			} else if (ele.isJsonArray()) {
				JsonArray ja = ele.getAsJsonArray();
				String[] values = new String[ja.size()];
				int i = 0;
				for (JsonElement je : ja) {
					values[i++] = je.getAsString();
				}
				mp.put(key, values);
			} else if (ele.isJsonObject()) {
				//转换为字符串，在使用时再生成为JSON对象
				String str = ele.getAsJsonObject().toString();
				mp.put(key, str);
			} else {
				mp.put(key, ele.getAsString());
			}
		}
		
		return mp;
	}
}
