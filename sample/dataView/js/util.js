var DataMapping_Split = ";";




var closeflag = false;
var EventUtil = new Object;
EventUtil.addEventHandler = function (oTarget, sEventType, fnHandler) {
	if (oTarget.addEventListener) {
		oTarget.addEventListener(sEventType, fnHandler, false);
	} else if (oTarget.attachEvent) {
		oTarget.attachEvent("on" + sEventType, fnHandler);
	} else {
		oTarget["on" + sEventType] = fnHandler;
	}
};

function isSVG(){   
    //IE不支持navigator.mimeTypes属性   
    if (navigator.mimeTypes != null && navigator.mimeTypes.length > 0){  
        //如果不是IE,判断此游览器中是否有支持SVG的插件   
        var setSvg = !!navigator.mimeTypes["image/svg+xml"];   
        if(setSvg){  
            // do nothing  
        	return true;
        }else{  
        	parent.alert("请使用32位IE浏览器查看图片");  
        	return false;
        }  
    } else {   
        //如果是IE则判断是否安装了ADOBE的SVG的插件   
        // 判断浏览器位数  
        var browBit = window.navigator.platform;  
        // 32位浏览器可以显示svg，64位ie显示不出来  
        if(browBit=="Win32"){  
        	try {
        		var setSvg = new ActiveXObject("Adobe.SVGCtl");       
	            if(setSvg){  
	                // do nothing 
	            	return true;
	            }else{ 
	            	parent.alert("请下载SVG插件查看图片");  
	            	return false;
	            }  
        	} catch (e) {
        			parent.alert("请下载SVG插件查看图片");  
        			return false;
        	}
            
        }else{  
        	parent.alert("请使用32位IE浏览器查看图片");  
        	return false;
        }  
    }   
}  
// 屏蔽页面右键
//document.oncontextmenu=function(){return false;};
// get param from search
function findValue(param) {
	var search = location.search.toString();
	if (search == '') {
		return "";
	}
	var params = search.substr(1, search.length - 1); // remove '?'
	
	if (params == "") {
		return "";
	}
	
	var paramsArr = params.split('&');
	var length = paramsArr.length;
	for (var i = 0; i < length; i++) {
		var temp = paramsArr[i].split('=');
		if (temp.length == 2) {
			if (temp[0] == param) {
				return temp[1];
			}
		}
	}
	
	return "";
}

function findParentValue(param) {
	var search = parent.location.search.toString();
	if (search == '') {
		return "";
	}
	var params = search.substr(1, search.length - 1); // remove '?'
	
	if (params == "") {
		return "";
	}
	
	var paramsArr = params.split('&');
	var length = paramsArr.length;
	for (var i = 0; i < length; i++) {
		var temp = paramsArr[i].split('=');
		if (temp.length == 2) {
			if (temp[0] == param) {
				return temp[1];
			}
		}
	}
	
	return "";
}

function Enumration(name) {
	this.name = name;
}

function ExtendAttribute(name, value) {
	this.name = name;
	this.value = value;
}

function ExternalReference(location) {
    this.location = location;
}

function DataField(id, name, type, typeItem, eaArray, processId, processName, dims, indices, version, state, initValue,description,code,remark,notDataFileName,notDataFileId,paramTypeCode,paramTypeName,notDataFileDesc,ParamTypeDate,ParamTypeState) {
	this.id = id;
	this.name = name;
	this.type = type;
	this.typeItem = typeItem;
	this.eaArray = eaArray;
	// Add by zhangtao on 2009-06-23
	this.processId = processId;
	this.processName = processName;
	this.dims = dims;
	this.indices = indices;
	this.version = version;
	this.state = state;
	this.initValue = initValue || "";
	this.description = description || "";
	//2014-06-12 活动定义输入添加
	this.code = code;//文件号
	this.remark = remark;//备注
	this.notDataFileName = notDataFileName; //参考文件或者模板文件
	this.notDataFileId = notDataFileId; //参考文件或者模板文件的id
	this.paramTypeCode = paramTypeCode; //交付去向code
	this.paramTypeName = paramTypeName; //交付去向text
	this.notDataFileDesc = notDataFileDesc;//参考文件模板文件的描述
	//2014-12-19  
	this.ParamTypeDate = ParamTypeDate;//交付去向时间
	this.ParamTypeState = ParamTypeState;//交付去向状态
	
}


function EaArrayInfo(code,remark,notDataFileName,notDataFileId,paramTypeCode,paramTypeName,notDataFileDesc){
	var arr = [];
	if(code!=""&&code!=undefined){//文件号
		arr.push({name:"Code",value:code});
	}
	if(remark!=""&&remark!=undefined){//备注
		arr.push({name:"Remark",value:remark});
	}
	if(notDataFileName!=""&&notDataFileName!=undefined){//参考文件或者模板文件
		arr.push({name:"NotDataFileName",value:notDataFileName});
	}
	if(notDataFileId!=""&&notDataFileId!=undefined){//参考文件或者模板文件的id
		arr.push({name:"NotDataFileId",value:notDataFileId});
	}
	if(paramTypeCode!=""&&paramTypeCode!=undefined){//交付去向code
		arr.push({name:"ParamTypeCode",value:paramTypeCode});
	}
	if(paramTypeName!=""&&paramTypeName!=undefined){//交付去向text
		arr.push({name:"ParamTypeName",value:paramTypeName});
	}
	if(notDataFileDesc!=""&&notDataFileDesc!=undefined){//参考文件或者模板文件的描述
		arr.push({name:"NotDataFileDesc",value:notDataFileDesc});
	}
	return arr;
}

function TaskNode(id, xpdlOid, nodeid, name, sTime, eTime, user, state, app, schedule) {
	this.id = id; // processid
	this.xpdlOid = xpdlOid;
	this.nodeid = nodeid;
	this.name = name;
	this.sTime = sTime;
	this.eTime = eTime;
	this.user = user;
	this.state = state;
	this.app = app;
	this.schedule = schedule;
}

function Transition(id, edgeId) {
	this.id = id;
	this.edgeId = edgeId;
}

function MappingObj(id, name, starttime, endtime, vtpin,
	vtpout, startmode, finishmode, jointype, splittype,
	username, rolename, groupname, processName, processId) {
	this.id = id;
	this.name = name;
	this.starttime = starttime;
	this.endtime = endtime;
	this.vtpin = vtpin;
	this.vtpout = vtpout;
	this.startmode = startmode;
	this.finishmode = finishmode;
	this.jointype = jointype;
	this.splittype = splittype;
	this.username = username;
	this.rolename = rolename;
	this.groupname = groupname;
	this.processName = processName;
	this.processId = processId;
}

function confirmClose() {
	// alert("");
	try{
		if (!closeflag){
			window.event.returnValue = "离开该页面未保存的信息会丢失！";
		}
	}catch(e){
	}
}

function isFormChanged() {
	var formChangeFlag = false;
	var eles = document.getElementsByTagName('input');
	var inputLength = eles.length;
	for (var i = 0; i < inputLength; i++) {
		var e = eles[i];
		if (e.type == 'button' || e.type == 'BUTTON') {
			continue;
		} else if (e.type == 'radio' || e.type == 'checkbox') {
			if (e.checked != e.defaultChecked) {
				formChangeFlag = true;
				break;
			}
		} else {
			if (e.value != e.defaultValue) {
				formChangeFlag = true;
				break;
			}
		}
	}
	
	if (!formChangeFlag) {
		eles = document.getElementsByTagName('textarea');
		var textareaLength = eles.length
		for (var i = 0; i < textareaLength; i++) {
			var e = eles[i];
			if (e.value != e.defaultValue) {
				formChangeFlag = true;
				break;
			}
		}
	}
	
	if (!formChangeFlag) {
		eles = document.getElementsByTagName('select');
		var selectLength = eles.length;
		for (var i = 0; i < selectLength; i++) {
			var se = eles[i];
			var ops = se.options;
			var v = ops[se.selectedIndex].value;
			var opsLength = ops.length;
			for (var j = 0; j < opsLength; j++) {
				var e = ops[j];
				if (e.defaultSelected && (e.value != v)) {
					formChangeFlag = true;
					break;
				}
			}
		}
	}
	return formChangeFlag;
}

function perpsBreak(processId, blockId, ifsubFlag) {
	this.processId = processId;
	this.blockId = blockId;
	this.ifsubFlag = ifsubFlag;
}

function SimSoftware(softwareID, softwareName, templateName) {
	this.softwareID = softwareID;
	this.softwareName = softwareName;
	this.templateName = templateName;
}

function computeLen(val) {
	var len = 0;
	
	if (val != '') {
		if (val.charCodeAt(0) < 299) {
			len = 1;
		} else {
			len = 2;
		}
	}
	
	return len;
}

function getLength(name) {
	var len = 0;
	
	var nameArr = name.split("");
	var length = nameArr.length;
	for (var i = 0; i < length; i++) {
		len += computeLen(nameArr[i]);
	}
	
	return len;
}

function getShortName(name) {
	
	var nameArr = name.split("");
	var firstLen = 0;
	var firstStr = new String("");
	
	var secondLen = 0;
	var secondStr = new String("");
	
	var len = getLength(name);
	var lineLen = len > 16 ? 16 : len;
	var length = nameArr.length;
	for (var i = 0; i < length; i++) {
		if (firstLen + computeLen(nameArr[i]) <= lineLen) {
			firstLen += computeLen(nameArr[i]);
			
			firstStr += nameArr[i];
		} else {
			break;
		}
	}
	
	return firstStr;
}

function alertMsg(msg) {
	alert(msg);
}

/**
 * 搜索指定id元素
 */
function $id(elementId) {
	return document.getElementById(elementId);
}

/**
 * 设定属性的{name:value}队象
 *
 * @param ele
 * @param attrObj
 */
function $set(ele, attrObj) {
	for (var attr in attrObj) {
		try {
			ele.setAttribute(attr, attrObj[attr]);
		} catch (e) {
			// alert(ele + "|$set|" + printNode(ele))
		}
	}
}

/**
 * 取属性
 *
 * @param ele
 * @param attr
 * @returns
 */
function $get(ele, attr) {
	if (!ele)
		return null;
	return ele.getAttribute(attr);
}

/**
 * 搜索指定tagName的祖先节点
 *
 * @param node
 * @param tagName
 * @returns
 */
function $parent(node, tagName) {
	p = node.parentNode;
	if (!p) {
		return null;
	} else if (p.nodeName == tagName) { 
		return p;
	} else {
		return $parent(p, tagName);
	}
}

/**
 * 在节点下搜索指定tagName和class的元素
 *
 * @param searchClass
 * @param node
 *            如果不指定直接父节点会有bug
 * @param tag
 *            可以逗号分隔, 如果不指定会有bug
 * @returns {Array}
 */
function $getByClass(searchClass, node, tag) {
	var defaultTags = "a,circle,ellipse,g,image,line,path,polygon,polyline,rect,svg,text,use,symbol";
	var classElements = [];
	if (node == null)
		node = document;
	if (tag == null)
		tag = defaultTags;
	var tags = tag.split(",");
	var els;
	var elsLen;
	for (var t in tags) {
		els = node.getElementsByTagName(tags[t]);
		elsLen = els.length;
		for (i = 0; i < elsLen; i++) {
			try {
				if ($hasClass(els.item(i), searchClass)) {
					classElements.push(els.item(i));
				}
			} catch (e) {}
		}
	}
	return classElements;
}

/**
 * 在节点下搜索指定tagName和指定属性的元素
 *
 * @param searchClass
 * @param node
 *            如果不指定直接父节点会有bug
 * @param tag
 *            如果不指定会有bug
 * @returns {Array}
 */
function $getByAttr(attrName, attrValue, node, tag) {
	var defaultTags = "a,circle,ellipse,g,image,line,path,polygon,polyline,rect,svg,text,use,symbol";
	var elements = [];
	if (node == null)
		node = document;
	if (tag == null)
		tag = defaultTags;
	var tags = tag.split(",");
	var els;
	var elsLen;
	for (var t in tags) {
		els = node.getElementsByTagName(tags[t]);
		elsLen = els.length;
		for (i = 0; i < elsLen; i++) {
			try {
				if (els.item(i).getAttribute(attrName) == attrValue) {
					elements.push(els.item(i));
				}
			} catch (e) {}
		}
	}
	return elements;
}

/**
 * 是否包含class
 *
 * @param ele
 * @param cls
 * @returns
 */
function $hasClass(ele, cls) {
	if (!ele) {
		return;
	}
	if (ele.getAttribute("class") == null)
		return false;
	return ele.getAttribute("class").match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

/**
 * 增加class
 *
 * @param ele
 * @param cls
 */
function $addClass(ele, cls) {
	if (!ele) {
		return;
	}
	if ($isArray(ele)) {
		for (var i in ele) {
			$addClass(ele[i], cls);
		}
	} else {
		if (!$hasClass(ele, cls)) {
			if (ele.getAttribute("class") != null)
				ele.setAttribute("class", ele.getAttribute("class") + " " + cls);
			else
				ele.setAttribute("class", cls);
		}
	}
}

/**
 * 换class
 *
 * @param ele
 * @param clsOld
 * @param clsNew
 */
function $changeClass(ele, clsOld, clsNew) {
	if (!ele) {
		return;
	}
	if ($isArray(ele)) {
		for (var i in ele) {
			$changeClass(ele[i], clsOld, clsNew);
		}
	} else {
		if ($hasClass(ele, clsOld)) {
			ele.setAttribute("class", ele.getAttribute("class").replace(new RegExp('(\\s|^)' + clsOld + '(\\s|$)'), " " + clsNew + " "));
		}
	}
}

/**
 * 移除class
 *
 * @param ele
 * @param cls
 */
function $removeClass(ele, cls) {
	if (!ele) {
		return;
	}
	if ($isArray(ele)) {
		for (var i in ele) {
			$removeClass(ele[i], cls);
		}
	} else {
		if ($hasClass(ele, cls)) {
			ele.setAttribute("class", ele.getAttribute("class").replace(new RegExp('(\\s|^)' + cls + '(\\s|$)'), ''));
		}
	}
}

function $show(ele) {
	if (!ele) {
		return;
	}
	if ($isArray(ele)) {
		for (var i in ele) {
			$show(ele[i]);
		}
	} else {
		ele.setAttribute("visibility", "visible");
		ele.setAttributeNS(null, "pointer-events", "all");
	}
}

function $hide(ele) {
	if (!ele) {
		return;
	}
	if ($isArray(ele)) {
		for (var i in ele) {
			$hide(ele[i]);
		}
	} else {
		ele.setAttribute("visibility", "hidden");
		ele.setAttributeNS(null, "pointer-events", "none");
	}
}

function $display(ele) {
	if (!ele) {
		return;
	}
	if ($isArray(ele)) {
		for (var i in ele) {
			$display(ele[i]);
		}
	} else {
		ele.setAttribute("display", "inline");
		ele.setAttributeNS(null, "pointer-events", "all");
	}
}

function $displayNone(ele) {
	if (!ele) {
		return;
	}
	if ($isArray(ele)) {
		for (var i in ele) {
			$displayNone(ele[i]);
		}
	} else {
		ele.setAttribute("display", "none");
		ele.setAttributeNS(null, "pointer-events", "none");
	}
}

function $showOpacity(ele) {
	if ($isArray(ele)) {
		for (var i in ele) {
			$showOpacity(ele[i]);
		}
	} else {
		ele.setAttribute("opacity", "1");
		ele.setAttributeNS(null, "pointer-events", "all");
	}
}

function $hideOpacity(ele) {
	if ($isArray(ele)) {
		for (var i in ele) {
			$hideOpacity(ele[i]);
		}
	} else {
		ele.setAttribute("opacity", "0");
		ele.setAttributeNS(null, "pointer-events", "none");
	}
}

/**
 * 是否包含id
 *
 * @param ele
 * @param id
 * @param type
 * @returns
 */
function $hasId(ele, id, type) {
	return ele.getAttribute(type).match(new RegExp('(,|^)' + id + '(,|$)'));
}

/**
 * 增加id
 *
 * @param ele
 * @param id
 * @param type
 * @returns
 */
function $addId(ele, id, type) {
	if (!$hasId(ele, id, type)) {
		if (ele.getAttribute(type) == "none" || ele.getAttribute(type) == "" || ele.getAttribute(type) == null) {
			ele.setAttribute(type, id);
		} else {
			ele.setAttribute(type, ele.getAttribute(type) + "," + id);
		}
	}
}

function $deleteId(ele, id, type){
	if ($hasId(ele, id, type)) {
		ele.setAttribute(type, delLastDot(ele.getAttribute(type).replace(new RegExp(id+"(,|$)", "g"), "")));
		if(ele.getAttribute(type) == ""){
			ele.setAttribute(type, "none");
		}
		if(ele.getAttribute(type).indexOf(",") == -1){
			if(type=="before"){
				ele.setAttribute("jointype", "XOR");
			} else if(type=="beyond"){
				ele.setAttribute("splittype", "XOR");
			}
		}
	}
}

/**
 * 在区间内取值
 *
 * @param value
 * @param minV
 * @param maxV
 * @returns
 */
function $between(value, minV, maxV) {
	return Math.max(Math.min(value, maxV), minV);
}

/**
 * 事件不向上冒泡
 *
 * @param evt
 */
function $stop(evt) {
	if (evt && evt.stopPropagation) {
		evt.stopPropagation();
	} else {
		evt.cancelBubble = true;
	}
}

function $lpad(str, num, ch) {
	var length = str.length;
	while (length < num) {
		str = ch + str;
	}
	return str;
}
/**
 * 继承
 *
 * @param subClass
 * @param superClass
 */
function $extend(subClass, superClass) {
	var F = function () {};
	F.prototype = superClass.prototype;
	subClass.prototype = new F();
	subClass.prototype.constructor = subClass;
	subClass.superClass = superClass.prototype;
	
	if (superClass.prototype.constructor == Object.prototype.constructor) {
		superClass.prototype.constructor = superClass;
	}
}


/**
 * 是否在数组中?
 *
 * @param obj
 * @param arr
 * @returns {Boolean}
 */
function $inArray(obj, arr) {
	for (var i in arr) {
		if (obj == arr[i]) {
			return true;
		}
	}
	return false;
}

/**
 * 是否数组?
 *
 * @param obj
 * @returns {Boolean}
 */
function $isArray(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

/**
 * 递归删除所有子节点
 *
 * @param obj
 * @param arr
 * @returns {Boolean}
 */
function $deleteChildNodes(parent) {//方法改名，注意simworkflow.js
	var childs = parent.childNodes;
	for (var i = childs.length; i--; i > 0) {
		if (childs.item(i).childNodes && childs.item(i).childNodes.length > 0) {
			$deleteChildNodes(childs.item(i));
		} else {
			parent.removeChild(childs.item(i));
		}
	}
	
	for (var i = childs.length; i--; i > 0) {
		parent.removeChild(childs.item(i));
	}
}

function $_delete(obj){
	
	if(obj.nodeType == 1){
		obj.setAttribute("id", "");
		obj.setAttribute("visibility", "hidden");
		obj.setAttributeNS(null, "pointer-events", "none");
		obj.setAttribute("deleted", "true");
	}
	for (var i = obj.childNodes.length; i--; i > 0) {
		$delete(obj.childNodes.item(i));
	}
}

//根据浏览器版本调用对应的删除操作
function $delete(obj){

	//根据浏览器核心判断版本是否>=9	
/*	var coreVersion=window.parent.navigator.appVersion.match(/Trident\/\d\.\d/);
	if(coreVersion&&coreVersion[0]&&parseInt(coreVersion[0].replace('Trident/',''))>=5)
	{
		//如果是ie9
		//alert('ie9:' + parseInt(coreVersion[0].replace('Trident/','')));		
		$_delete(obj);
	}
	else
	{*/
		//如果不是ie9
		//alert(coreVersion + "!=ie9");		
		$deleteChildNodes(obj);
		//删除自身接点	
		if(obj.parentNode)
		{
			obj.parentNode.removeChild(obj);
		}
		obj = null;
//	}
	

}


/**
 * 根据文件路径读取文件内容
 *
 * @param file 文件路径
 * @returns {string}
 */
function readFile(file){
	if (typeof window.ActiveXObject != 'undefined'){
		var content = "";
		try {
			var fso = new ActiveXObject("Scripting.FileSystemObject");
			var reader = fso.openTextFile(file, 1);
			while (!reader.AtEndofStream)
				content += reader.readline();content += "\n";
			reader.close();
		}catch (e) {
			alert("Internet Explore read local file error: \n" + e);
		}
		return content;
	}else if (document.implementation && document.implementation.createDocument) {
		var content = "";
		try {
			netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
			var lf = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			lf.initWithPath(file);if (lf.exists() == false) {
				alert("File does not exist");
			}
			var fis = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
			fis.init(lf, 0x01, 00004, null);
			var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
			sis.init(fis);
			var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";content = converter.ConvertToUnicode(sis.read(sis.available()));
		}catch(e){
			alert("Mozilla Firefox read local file error: \n" + e);
		}
		return content;
	}
}
/**
 * 根据文件路径读取文件内容
 *
 * @param filename 文件路径
 * @param filecontent 文件内容
 */
function writeFile(filename,filecontent){ 
    var fso, f, s ; 
    fso = new ActiveXObject("Scripting.FileSystemObject");    
	if (fso.FileExists(filename)) {
		alert('文件已经存在');
	}
	else {
		f = fso.OpenTextFile(filename,8,true);
		f.WriteLine(filecontent);
		f.Close(); 
	}
}
var KEYCODE = {
	BACKSPACE : 8,
	TAB : 9,
	NUM_CENTER : 12,
	ENTER : 13,
	RETURN : 13,
	SHIFT : 16,
	CTRL : 17,
	CONTROL : 17, // legacy
	ALT : 18,
	PAUSE : 19,
	CAPS_LOCK : 20,
	ESC : 27,
	SPACE : 32,
	PAGE_UP : 33,
	PAGEUP : 33, // legacy
	PAGE_DOWN : 34,
	PAGEDOWN : 34, // legacy
	END : 35,
	HOME : 36,
	LEFT : 37,
	UP : 38,
	RIGHT : 39,
	DOWN : 40,
	PRINT_SCREEN : 44,
	INSERT : 155,
	DELETE : 127,
	ZERO : 48,
	ONE : 49,
	TWO : 50,
	THREE : 51,
	FOUR : 52,
	FIVE : 53,
	SIX : 54,
	SEVEN : 55,
	EIGHT : 56,
	NINE : 57,
	A : 65,
	B : 66,
	C : 67,
	D : 68,
	E : 69,
	F : 70,
	G : 71,
	H : 72,
	I : 73,
	J : 74,
	K : 75,
	L : 76,
	M : 77,
	N : 78,
	O : 79,
	P : 80,
	Q : 81,
	R : 82,
	S : 83,
	T : 84,
	U : 85,
	V : 86,
	W : 87,
	X : 88,
	Y : 89,
	Z : 90,
	CONTEXT_MENU : 93,
	NUM_ZERO : 96,
	NUM_ONE : 97,
	NUM_TWO : 98,
	NUM_THREE : 99,
	NUM_FOUR : 100,
	NUM_FIVE : 101,
	NUM_SIX : 102,
	NUM_SEVEN : 103,
	NUM_EIGHT : 104,
	NUM_NINE : 105,
	NUM_MULTIPLY : 106,
	NUM_PLUS : 107,
	NUM_MINUS : 109,
	NUM_PERIOD : 110,
	NUM_DIVISION : 111,
	F1 : 112,
	F2 : 113,
	F3 : 114,
	F4 : 115,
	F5 : 116,
	F6 : 117,
	F7 : 118,
	F8 : 119,
	F9 : 120,
	F10 : 121,
	F11 : 122,
	F12 : 123
};

/**
 * 按属性值删除子节点
 * @param {Object} parent
 * @param {Object} attrName
 * @param {Object} attrValue
 */
function $deleteChildByAttr(parent, attrName, attrValue) {
	var childs = parent.childNodes;
	for (var i = childs.length; i--; i > 0) {
		if (childs.item(i).getAttribute(attrName) == attrValue) {
			parent.removeChild(childs.item(i));
		}
	}
	
}

function parseXml(strXML) {
	var root;
	if (window.ActiveXObject) {
		var source = new ActiveXObject('Microsoft.XMLDOM');
		source.async = false;
		source.loadXML(strXML);
		root = source.documentElement;
	} else {
		var parser = new DOMParser();
		root = parser.parseFromString(strXML, "text/xml");
	}
	
	return root;
}

/**
 * 截取字符串
 * 
 * @param {Object} str 目标字符串
 * @param {Object} num 半角字符个数
 * @param {Object} ellipsis 省略号字符串
 */
function subStri(str, num, ellipsis){
	ellipsis = ellipsis || "...";
	num = num || 10;
	str = str + "";
	var dotflag = false;
	while (str.replace(/[^\x00-\xff]/g, '**').length > num){
		str = str.substring(0,str.length - 1);
		dotflag = true;
	}
	return str + (dotflag?ellipsis:"");
}

/*
	截取字符串
	@param
		str 目标字符串
		num 每行要显示的半角字符个数
		ellipsis 省略号字符串
	@return 返回一个拆分后的字符串数组
*/
function subStri2(str, num, ellipsis) {
	function getStrNum(str, num) {
		var number = Math.floor(num/2);
		while (getLenB(str.substring(0, number)) < num) {
			number++;
			if(getLenB(str.substring(0, number)) > num){
				return --number;
			}
		}
		return number;
	};
	function getLenB(str){
		var r = new RegExp("[^\x00-\xff]", "g");
		return str.replace(r, '**').length
	}
	
	ellipsis = ellipsis || "...";
	num = num || 10;
	str = str + "";
	var length = getLenB(str);
	var result = [];
	var _number = 0;
	if (length <= num) {
		result[0] = str;
	} else if (length > num) {
		_number = getStrNum(str, num);
		result[0] = str.substring(0, _number);
		result[1] = str.substring(_number, str.length);
		if(getLenB(result[1]) > num){
			result[1] = result[1].substring(0, getStrNum(result[1], num-2)) + ellipsis;
		}
	}
	return result;
}


/*
	截取字符串
	@param
		str 目标字符串
		num 每行要显示的半角字符个数(全角占用两个字符)
		ellipsis 省略号字符串
		lines 要显示多少行
	@return 返回一个拆分后的字符串数组(根据显示的行数,显示纬数)
*/
function subStri3(str, num, ellipsis, lines) {
		var length = str.length;
		var result = [];
		var flag = 0;
		for(var i=0;i<length;i++){
			var _char = str.charAt(i);
			if(_char.charCodeAt(0)>256){
				//全角
				result[flag++] = _char;
				result[flag++] = '';
			}else{
				//半角
				result[flag++] = _char;
			}
		}
		ellipsis = ellipsis || "...";
		num = num || 10;
		var _result = [];
		var allLines = Math.ceil(result.length/num);
		for(i=0;i<allLines;i++){
			var s = '';
			for(var j=0;j<num;j++){
				if(num*i + j == result.length){
					break;
				}
				s = s + result[num*i + j];			
			}
			_result[i] = s;
		}
		if(_result[lines-1]&&_result[lines-1].length>ellipsis.length){
			_result[lines-1] = _result[lines-1].substring(0,_result[lines-1].length-ellipsis.length) + ellipsis;
		}
		return _result;
}


/**
 * 删除最后的逗号
 * @param {Object} str
 */
function delLastDot(str){
	if(str){
		return str.replace(/,$/g,"");
	}
	return "";
}

function addOptions(id, arr){
	var obj = document.getElementById(id);
	var arrStr = [];
	for(var i = 0; i < arr.length; i++){
		arrStr.push('<option value="'+arr[i]+'">'+arr[i]+'</option>');
	}
	obj.innerHTML = arrStr.join("");
}

/*
 * JS版base64编解码算法。示例:
 * b64 = base64encode(data);
 * data = base64decode(b64);
 */

var base64EncodeChars = [
    "A", "B", "C", "D", "E", "F", "G", "H",
    "I", "J", "K", "L", "M", "N", "O", "P",
    "Q", "R", "S", "T", "U", "V", "W", "X",
    "Y", "Z", "a", "b", "c", "d", "e", "f",
    "g", "h", "i", "j", "k", "l", "m", "n",
    "o", "p", "q", "r", "s", "t", "u", "v",
    "w", "x", "y", "z", "0", "1", "2", "3",
    "4", "5", "6", "7", "8", "9", "+", "/"
];

var base64DecodeChars = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
];

function base64encode(str) {
    var out, i, j, len;
    var c1, c2, c3;

    len = str.length;
    i = j = 0;
    out = [];
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len)
        {
            out[j++] = base64EncodeChars[c1 >> 2];
            out[j++] = base64EncodeChars[(c1 & 0x3) << 4];
            out[j++] = "==";
            break;
        }
        c2 = str.charCodeAt(i++) & 0xff;
        if (i == len)
        {
            out[j++] = base64EncodeChars[c1 >> 2];
            out[j++] = base64EncodeChars[((c1 & 0x03) << 4) | ((c2 & 0xf0) >> 4)];
            out[j++] = base64EncodeChars[(c2 & 0x0f) << 2];
            out[j++] = "=";
            break;
        }
        c3 = str.charCodeAt(i++) & 0xff;
        out[j++] = base64EncodeChars[c1 >> 2];
        out[j++] = base64EncodeChars[((c1 & 0x03) << 4) | ((c2 & 0xf0) >> 4)];
        out[j++] = base64EncodeChars[((c2 & 0x0f) << 2) | ((c3 & 0xc0) >> 6)];
        out[j++] = base64EncodeChars[c3 & 0x3f];
    }
    return out.join('');
}

function base64decode(str) {

    var c1, c2, c3, c4;
    var i, j, len, out;

    len = str.length;
    i = j = 0;
    out = [];
    while (i < len) {
        /* c1 */
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1) break;

        /* c2 */
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1) break;

        out[j++] = String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61) return out.join('');
            c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1) break;

        out[j++] = String.fromCharCode(((c2 & 0x0f) << 4) | ((c3 & 0x3c) >> 2));

        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61) return out.join('');
            c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1) break;
        out[j++] = String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out.join('');
}

function getUuid(len, radix) {
		// Private array of chars to use
	var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_'
			.split('');
		var chars = CHARS, uuid = [], i;
		radix = radix || chars.length;

		if (len) {
			// Compact form
			for (i = 0; i < len; i++)
				uuid[i] = chars[0 | Math.random() * radix];
		} else {
			// rfc4122, version 4 form
			var r;
			// rfc4122 requires these characters
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';

			// Fill in random data.  At i==19 set the high bits of clock sequence as
			// per rfc4122, sec. 4.1.5
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
		}
		return uuid.join('');
}

function getExtendAttrValue(eaArray,eaAttrName){
    var extendAttrValue;
    var index = getExtendAttrIndex(eaArray,eaAttrName);
    if(index != -1){
        extendAttrValue = eaArray[index].value;
    }
    return extendAttrValue;
}

function setExtendAttr(eaarray, eaAttrName, eaAttrValue){
    var index = getExtendAttrIndex(eaarray, eaAttrName);
    
    if(index != -1){
        eaarray[index].value = eaAttrValue;
    }else{
        var ea = new ExtendAttribute(eaAttrName, eaAttrValue);
        eaarray.push(ea);
    }
}

function removeExtendAttr(eaarray, eaAttrName){
    var index = getExtendAttrIndex(eaarray, eaAttrName);
    
    if(index != -1){
        eaarray.splice(index,1);
    }
}

function getExtendAttrIndex(eaArray,eaAttrName){
    if(eaArray == null){
        return -1;
    }
    
    for(var i = 0; i < eaArray.length; i++){
        if(eaArray[i] != undefined && eaArray[i].name == eaAttrName){
            return i;
        }
    }
    return -1;
}

function isRobotParameter(id){
	return id.match(/n\d{6}[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
}

function htmlEncode(html) {
	var temp = document.createElement("div");
	(temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
	var output = temp.innerHTML;
	temp = null;
	return output||"";
}

function htmlDecode(text) {
	var temp = document.createElement("div");
	temp.innerHTML = text;
	var output = temp.innerText || temp.textContent;
	temp = null;
	return output||"";
}

function xmlEncode(text) {
	return (text||"")
		.replace(/\&/g,"&amp;")
		.replace(/\</g, "&lt;")
		.replace(/\>/g, "&gt;")
		.replace(/\'/g,"&apos;")
		.replace(/\"/g,"&quot;");
}

function xmlDecode(text) {
	return (text||"")
		.replace(/\&lt;/g, "<")
		.replace(/\&gt;/g, ">")
		.replace(/\&apos;/g,"'")
		.replace(/\&quot;/g,"\"")
		.replace(/\&amp;/g,"&");
}

var BASE_COMPONENT_CONFIG = [/*名称 工具栏图标 组件类型图标*/
	{
		name : "Ansys脚本类型",
		icon : "image/svg/base_component/ansys.png",
		midIcon : "image/svg/base_component/ansys42.png",
		largeIcon : "image/svg/base_component/ansys64.png",
		guid : "034A967D-62A9-4EF4-8A0B-788BC5BCF60B"
	}, {
		name : "Catia实体类型",
		icon : "image/svg/base_component/catia_entity.png",
		midIcon : "image/svg/base_component/catia_entity42.png",
		largeIcon : "image/svg/base_component/catia_entity64.png",
		guid : "EA736349-E181-4DE0-A79C-CFF60BCCA843"
	}, {
		name : "脚本驱动引擎组件",
		icon : "image/svg/base_component/script_driver.png",
		midIcon : "image/svg/base_component/script_driver42.png",
		largeIcon : "image/svg/base_component/script_driver64.png",
		guid : "58DBA6CB-0FB1-4495-8266-1FBE6D6AC518"
	}, {
		name : "Oracle组件",
		icon : "image/svg/base_component/oracle.png",
		midIcon : "image/svg/base_component/oracle42.png",
		largeIcon : "image/svg/base_component/oracle64.png",
		guid : "DE3A1522-0D5E-48FC-95FA-0FA6EA225E7E"
	}, {
		name : "数据解析组件",
		icon : "image/svg/base_component/data_parser.png",
		midIcon : "image/svg/base_component/data_parser42.png",
		largeIcon : "image/svg/base_component/data_parser64.png",
		guid : "69F08DE1-A7FC-470D-A2A2-A19626A22041"
	}, {
		name : "Microsoft Excel组件",
		icon : "image/svg/base_component/excel.png",
		midIcon : "image/svg/base_component/excel42.png",
		largeIcon : "image/svg/base_component/excel64.png",
		guid : "EA68A825-6EEA-4786-8BC2-85282F0B4B1F"
	}, {
		name : "工具集成组件",
		icon : "image/svg/base_component/command.png",
		midIcon : "image/svg/base_component/command42.png",
		largeIcon : "image/svg/base_component/command64.png",
		guid : "E5FE966F-BD57-41D9-9C19-97F4337B5D51"
	}, {
		name : "Hyperworks脚本类型",
		icon : "image/svg/base_component/hyperworks.png",
		midIcon : "image/svg/base_component/hyperworks42.png",
		largeIcon : "image/svg/base_component/hyperworks64.png",
		guid : "EDB3A208-6D39-4C52-B249-E348FA973234"
	}, {
		name : "Nastran脚本类型",
		icon : "image/svg/base_component/nastran.png",
		midIcon : "image/svg/base_component/nastran42.png",
		largeIcon : "image/svg/base_component/nastran64.png",
		guid : "352FAC5C-A06B-4CB6-8BD5-FD0F1E481040"
	}, {
		name : "Patran宏脚本类型",
		icon : "image/svg/base_component/patran_macro.png",
		midIcon : "image/svg/base_component/patran_macro42.png",
		largeIcon : "image/svg/base_component/patran_macro64.png",
		guid : "1135DA07-70FA-4B16-8B8F-E333551489B7"
	}, {
		name : "Microsoft Word组件",
		icon : "image/svg/base_component/word.png",
		midIcon : "image/svg/base_component/word42.png",
		largeIcon : "image/svg/base_component/word64.png",
		guid : "AA692673-F4E4-49CB-A162-F1DADB766354"
	}, {
		name : "公式组件",
		icon : "image/svg/base_component/formula.png",
		midIcon : "image/svg/base_component/formula42.png",
		largeIcon : "image/svg/base_component/formula64.png",
		guid : "30B22B29-2FB6-4A5A-9EDD-8F42A1578EA2"
	}
];

function getBaseComponentConfigByType(typeName){
	for(var i = 0; i < BASE_COMPONENT_CONFIG.length; i++){
		if(BASE_COMPONENT_CONFIG[i].name == typeName){
			return BASE_COMPONENT_CONFIG[i];
		}
	}
	return {name:typeName, icon:"image/svg/base_component/default.png", midIcon:"image/svg/base_component/default42.png", largeIcon:"image/svg/base_component/default64.png"};
}
function getBaseComponentConfigByGuid(guid){
	for(var i = 0; i < BASE_COMPONENT_CONFIG.length; i++){
		if(BASE_COMPONENT_CONFIG[i].guid == guid){
			return BASE_COMPONENT_CONFIG[i];
		}
	}
	return {name:"", icon:"image/svg/base_component/default.png", midIcon:"image/svg/base_component/default42.png", largeIcon:"image/svg/base_component/default64.png"};
}
var CONDITION_RE = /\({1,5}!{0,1}[\u0391-\uFFE5\w\-]+.equals\(\"[\u0391-\uFFE5\w\-]+\"\)\){1,5}/g;
var DATA_BASIC_TYPE = "REFERENCE";
var DEFAULT_APP_ID = "82";
var DEFAULT_APP_NAME = "GRCRunners";

var JsonUtil = (function () {
    function jsonToString(obj) {

        var THIS = this;
        switch (typeof(obj)) {
        case 'string':
            return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
        case 'array':
            return '[' + obj.map(THIS.jsonToString).join(',') + ']';
        case 'object':
            if (obj instanceof Array) {
                var strArr = [];
                var len = obj.length;
                for (var i = 0; i < len; i++) {
                    strArr.push(THIS.jsonToString(obj[i]));
                }
                return '[' + strArr.join(',') + ']';
            } else if (obj == null) {
                return 'null';

            } else {
                var string = [];
                for (var property in obj)
                    string.push(THIS.jsonToString(property) + ':' + THIS.jsonToString(obj[property]));
                return '{' + string.join(',') + '}';
            }
        case 'number':
            return obj;
        case false:
            return obj;
        }
    }

    function stringToJson(str) {
        return (new Function("return " + str))();
    }
    return {
        jsonToString : jsonToString,
        stringToJson : stringToJson
    };
})();

