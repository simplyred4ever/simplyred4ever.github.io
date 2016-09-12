
var targetX = 500, targetY = 50; //目标对象 object对象
var relyOnX = 100, relyOnY = 50; //依赖关系对象 Arrays数组
var beRelyOnX = 900, beRelyOnY = 50; //被依赖关系对象 array数组
var nodeWidth = 250, nodeHeight = 30, stateIconWidth = 18;
var textNumber = 30;
var dataTree;
/*
数据对象

 */

function DataTree() {
	this.all = {}; //key:文档Id，value：文档数据对象
	this.beRelyOn = {}; //被依赖对象
	this.relyOn = {}; //依赖对象
	this.mapping = {};
	this._DataMapping = new DataMapping();
}

DataTree.prototype.add = function (treeObj) {
	this.all[treeObj.id] = treeObj;
}

/*
数据初始化函数
 */
DataTree.prototype.init = function (dataJson) {
	var data = dataJson;
	var target = data.target || []; //目标对象 object对象
	var relyOn = data.relyOn || []; //依赖关系对象 Arrays数组
	var beRelyOn = data.beRelyOn || []; //被依赖关系对象 array数组
	for (var i = 0; i < target.length; i++) {
		this.getTreeNode(target[i], 1);
	}

	for (var i = 0; i < relyOn.length; i++) {
		this.getTreeNode(relyOn[i], 2);
		this.relyOn[relyOn[i].id] = relyOn[i];
	}

	for (var i = 0; i < beRelyOn.length; i++) {
		this.getTreeNode(beRelyOn[i], 3);
		this.beRelyOn[beRelyOn[i].id] = beRelyOn[i];
	}

	this._DataMapping.init();
}
/*
type:1表示目标对象，2表示依赖关系对象，3表示被依赖关系对象
 */
DataTree.prototype.getTreeNode = function (obj, type) {
	//$id('workspace').removeChild();
	if (obj) {
		//var reTypeStr = obj || {};
		var exabs = obj || {};
		var parentNode = new Tree(obj.id, type, obj.text, "-1", exabs);
		this.add(parentNode);

		this.getTreeNodeChild(obj);
		if (obj.mapping) {
			this.getMapping(obj.id, obj.mapping);
		}
	}
}

DataTree.prototype.getTreeNodeChild = function (obj) {
	var children = obj.children || [];

	for (var i = 0; i < children.length; i++) {
		//var exabs = {"reType":this.reType};
		var exabs = children[i] || {};
		var node = new Tree(children[i].id, null, children[i].text, obj.id, exabs);
		if (children[i].mapping) {
			this.getMapping(obj.id, children[i].mapping);
		}
		this.add(node);
	}

}

DataTree.prototype.getMapping = function (toNodeId, mapStr) {
	var mapArr = [];
	mapArr = mapStr.indexOf(",") != -1 ? mapStr.split(",") : [];
	if (!mapArr.length) {
		mapArr.push(mapStr);
	};
	if (mapArr.length > 0) {
		for (var i = 0; i < mapArr.length; i++) {
			var mapOneS = mapArr[i];
			var mapOneArr = mapOneS.indexOf(";") != -1 ? mapOneS.split(";") : mapOneS;
			if (this.mapping[mapOneArr[0]]) {
				var obj = {
					"fromId" : mapOneArr[1],
					"fromNodeId" : mapOneArr[2],
					"toNodeId" : toNodeId,
					"reType" : mapOneArr[3]
				}
				this.mapping[mapOneArr[0]].push(obj);
			} else {
				this.mapping[mapOneArr[0]] = [{
						"fromId" : mapOneArr[1],
						"fromNodeId" : mapOneArr[2],
						"toNodeId" : toNodeId,
						"reType" : mapOneArr[3]
					}
				];
			}

		};
	}
}

DataTree.prototype.getNodeById = function (id) {
	return this.all[id];
}

DataTree.prototype.getChildAllById = function (id) {
	var allNode = this.all,
	num = 0;
	for (var attr in allNode) {
		var node = allNode[attr];
		if (node.parentId == id) {
			num++;
		}
	}
	return num;
}

DataTree.prototype.getRelyOnForSvg = function () {
	return this.relyOn;
}
/*
获取依赖关系当前页面显示的节点数
 */
DataTree.prototype.getBeRelyOnForSvgNum = function () {
	var num = 0,
	parentNum = 0;
	for (var attr in this.beRelyOn) {
		parentNum++;
		var childNum = this.getChildAllById(attr);
		if (parentNum > 1) {
			num += childNum + 2;
		} else {
			num += childNum
			num++;
		}
	}
	return num;
}

/*
获取被依赖关系当前页面显示的节点数
 */
DataTree.prototype.getRelyOnForSvgNum = function () {
	var num = 0,
	parentNum = 0;
	for (var attr in this.relyOn) {
		parentNum++;
		var childNum = this.getChildAllById(attr);
		if (parentNum > 1) {
			num += childNum + 2;
		} else {
			num += childNum
			num++;
		}
	}
	return num;
}
/*
exabs:扩展属性{property,propertyIcon,icon}
 */
function Tree(id, type, name, parentId, exabs) {
	this.id = id;
	this.name = name;
	this.type = type;
	this.parentId = parentId;
	this.exabs = exabs;
	this.create();

}

/*
创建节点信息
 */
Tree.prototype.create = function () {
	var x;
	var y;
	switch (this.type + '') {
	case '1': //目标对象标题
		x = targetX;
		y = targetY;
		this.rect = new $$.Rect(this.id + 'rect', 'workspace').bound(x, y, nodeWidth, nodeHeight).addClass('targetTitle targetBorder').attr('title', this.name);
		this.stateIcon = new $$.Use(this.id + 'use', 'workspace').position(x + 4, y + 8).change('documentIcon');
		this.text = new $$.Text(this.id + 'text', 'workspace').position(x + stateIconWidth + 2, y + nodeHeight / 2 + 8).text(this.name, textNumber).addClass("text");
		break;
	case '2': //依赖对象标题
		var num = dataTree.getRelyOnForSvgNum();
		y = relyOnY + (num ? (num + 1) * nodeHeight : 0);
		x = relyOnX;
		this.rect = new $$.Rect(this.id + 'rect', 'workspace').bound(x, y, nodeWidth, nodeHeight).addClass('defTitle defBorder').attr('title', this.name);
		this.stateIcon = new $$.Use(this.id + 'use', 'workspace').position(x + 4, y + 8).change('documentIcon');
		this.text = new $$.Text(this.id + 'text', 'workspace').position(x + stateIconWidth + 2, y + nodeHeight / 2 + 8).text(this.name, textNumber).addClass("text");
		break;
	case '3': //被依赖对象标题
		var num = dataTree.getBeRelyOnForSvgNum();
		y = beRelyOnY + (num ? (num + 1) * nodeHeight : 0);
		x = beRelyOnX;
		this.rect = new $$.Rect(this.id + 'rect', 'workspace').bound(x, y, nodeWidth, nodeHeight).addClass('defTitle defBorder').attr('title', this.name);
		this.stateIcon = new $$.Use(this.id + 'use', 'workspace').position(x + 4, y + 8).change('documentIcon');
		this.text = new $$.Text(this.id + 'text', 'workspace').position(x + stateIconWidth + 2, y + nodeHeight / 2 + 8).text(this.name, textNumber).addClass("text");
		break;
	default: //所有条目
		var parentTreeNode = dataTree.getNodeById(this.parentId);
		var childNum = dataTree.getChildAllById(this.parentId);
		var position = parentTreeNode.rect.position();
		x = position.x;
		y = position.y;
		this.rect = new $$.Rect(this.id + 'rect', 'workspace').bound(x, y + (childNum + 1) * nodeHeight, nodeWidth, nodeHeight)
			.addClass('item unFill ' + (parentTreeNode.type == '1' ? 'targetBorder' : 'defBorder'))
			.attr('title', this.name);
		this.stateIcon = new $$.Use(this.id + 'use', 'workspace').position(x + 4, y + (childNum + 1) * nodeHeight + 8).change(this.exabs.isSectionItem == '1' ? 'docReqIcon' : 'chaperIcon');
		this.a = new $$.A(this.id + 'a', '#', 'new', 'workspace');
		this.a.attr('pointer-events', 'none');
		if (!window.getSVGViewerVersion) {
			this.a.attr('onclick', 'return false;');
		}
		this.text = new $$.Text(this.id + 'text', this.a.self).position(x + stateIconWidth + 2, y + ((childNum + 1) * nodeHeight) + nodeHeight / 2 + 8).text(this.name, textNumber)
			.attr('onclick', 'parent.openWin("'+ [this.exabs.id, this.exabs.mainDocId, this.exabs.docEdtionId].join(',') +'")').addClass("aColor text").attr({
				'font-family': 'simsun',
				'text-rendering': 'optimizeLegibility',
				fill: '#0000ff',
				'stroke-width': 1,
				'font-size': '14px',
				'text-decoration': 'underline'
			});
	}

}

/*
属性图标
 */
Tree.prototype.getPropertyIcon = function (property) {
	var propertyIcon;
	switch (property) {
	case 1:
		propertyIcon = new $$.Use(this.id + 'PI', this.group.self).position(0, 0).change('propertyIcon1');
		break;
	case 2:
		propertyIcon = new $$.Use(this.id + 'PI', this.group.self).position(0, 0).change('propertyIcon2');
		break;
	case 3:
		propertyIcon = new $$.Use(this.id + 'PI', this.group.self).position(0, 0).change('propertyIcon3');
		break;
	default:
		propertyIcon = "";
	}
	return propertyIcon;
}

/*
线对象
 */
function DataMapping() {}
/*
初始化线对象
 */
DataMapping.prototype.init = function () {

	var mappingObj = dataTree.mapping;
	if (mappingObj) {
		for (var attr in mappingObj) {
			var mappingArr = mappingObj[attr];
			for (var i = 0; i < mappingArr.length; i++) {
				var mapOne = mappingArr[i];
				var fromNode = dataTree.getNodeById(mapOne.fromId);
				this.create(mapOne.fromNodeId, mapOne.fromId, mapOne.toNodeId, attr, corrType.color(mapOne.reType));
			}
		}
	}
}

/*
画线对象
nodeWidth = 160,nodeHeight = 30;
 */
DataMapping.prototype.create = function (fromNodeId, fromId, toNodeId, toId, color) {
	var fromTreeNode = dataTree.getNodeById(fromNodeId);
	var toTreeNode = dataTree.getNodeById(toNodeId);
	//var exabs = {"reType":this.reType};

	var y1 = parseInt($$.$(fromId + "rect").getAttribute("y")) + nodeHeight / 2;
	var x1 = parseInt($$.$(fromId + "rect").getAttribute("x"));
	var y2 = parseInt($$.$(toId + "rect").getAttribute("y")) + nodeHeight / 2;
	var x2 = parseInt($$.$(toId + "rect").getAttribute("x")) + nodeWidth;
	var xy = {
		"x1" : x1,
		"y1" : y1,
		"x2" : x2,
		"y2" : y2
	};
	this.line = new $$.Line(fromId + "_" + toId, 'lineWorkspace').position(xy).addClass('line')
	.attr('stroke', color).attr('marker-end', 'url(#arrow_' + color + ')')
	.css('stroke', color).css('marker-end', 'url(#arrow_' + color + ')');

}
