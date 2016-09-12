/**
 * 体系建模
 */
var Model = {
	TYPE : {
		System : 'elementSystem',
		Organization : 'elementOrganization',
		Actor : 'elementPeople',
		Service : 'elementService',
		ResourceFlow : 'elementResourceFlow'
	},
	BOUND_WIDTH : 8,
	MODE : 'SELECT',
	MAIN_PANEL : 'mainPanel',
	WORKSPACE : 'workspace',
	NODE_SPACE : 'nodeGroup',
	EDGE_SPACE : 'edgeGroup',
	BG_COLOR : '#ffffff',
	TEXT_COLOR : '#000000',
	bgColorValue : null,
	textColorValue : null,
	toXml : function () {
		return [
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">',
			'\t<!--文字颜色-->',
			'\t<key id="keyTextColor" for="node" attr.name="textColor" attr.type="string">',
			'\t\t<default>black</default>',
			'\t</key>',
			'\t<!--背景色-->',
			'\t<key id="keyBackgroundColor" for="node" attr.name="backgroundColor" attr.type="string">',
			'\t\t<default>white</default>',
			'\t</key>',
			'\t<!--X坐标-->',
			'\t<key id="keyX" for="node" attr.name="x" attr.type="float">',
			'\t\t<default>0</default>',
			'\t</key>',
			'\t<!--Y坐标-->',
			'\t<key id="keyY" for="node" attr.name="y" attr.type="float">',
			'\t\t<default>0</default>',
			'\t</key>',
			'\t<!--宽-->',
			'\t<key id="keyWidth" for="node" attr.name="width" attr.type="float">',
			'\t\t<default>90</default>',
			'\t</key>',
			'\t<!--高-->',
			'\t<key id="keyHeight" for="node" attr.name="height" attr.type="float">',
			'\t\t<default>60</default>',
			'\t</key>',
			'\t<!--节点类型-->',
			'\t<key id="keyNodeType" for="node" attr.name="nodeType" attr.type="string">',
			'\t\t<default>系统</default>',
			'\t</key>',
			'\t<!--转折点-->',
			'\t<key id="keyPoints" for="edge" attr.name="points" attr.type="string"/>',
			'\t<!--默认有向图-->',
			'\t<graph id="G" edgedefault="directed">',
			Model.AllNode.toXml('\t\t'),
			Model.AllEdge.toXml('\t\t'),
			'\t</graph>',
			'</graphml>'].join('\n')
	},
	toJson : function () {
		return {
			node : Model.AllNode.toJson(),
			edge : Model.AllEdge.toJson()
		};
	},
	clear : function () {
		Model.select();
		for (var i in Model.AllNode.all) {
			Model.AllNode.all[i].removeSelf();
		}
		for (var i in Model.AllEdge.all) {
			Model.AllEdge.all[i].removeSelf();
		}
	},
	importJson : function (graph) {
		if (graph) {
			if (graph.node && graph.node.length > 0) {
				Model.AllNode.importJson(graph.node);
			}
			if (graph.edge && graph.edge.length > 0) {
				Model.AllEdge.importJson(graph.edge);
			}
		}
	},
	select : function (id) {
		Model.AllNode.select(id);
		Model.AllEdge.select(id);
	},
	console : function (msg, type) {
		type = type || 'log';
		//if (console && console[type]) {
			//console[type](msg);
		//}
	}
};

Model.AllModel = {
	all: {},
	set: function (modelId, model) {
		Model.AllModel.all[modelId] = model;
	},
	get: function (modelId) {
		return Model.AllModel.all[modelId];
	},
	remove: function (modelId) {
		delete Model.AllModel.all[modelId];
	},
	modelId : null
}

/**
 * 节点集合类
 */
Model.AllNode = {
	/**
	 * 所有节点
	 */
	all : {},
	/**
	 * 添加
	 */
	add : function (node) {
		if (!node || !node.id) {
			parent.alert('Model.AllNode.add方法参数异常！');
			return;
		}
		this.all[node.id] = node;
		return this;
	},
	/**
	 * 删除
	 */
	remove : function (node) {
		if (!node || !node.id) {
			parent.alert('Model.AllNode.remove方法参数异常！');
			return;
		}
		delete this.all[node.id];

		return this;
	},
	/**
	 * 取得
	 */
	get : function (id) {
		if (typeof id !== 'string') {
			parent.alert('Model.AllNode.get方法参数异常！');
			return;
		}
		return this.all[id];
	},
	/**
	 * 全局绘制
	 */
	draw : function (centerNode) {
		return this;
	},
	/**
	 * 全局位置
	 */
	position : function () {
		return this;
	},
	/**
	 * 设置选中节点
	 */
	select : function (node) {
		if (typeof node === 'string') {
			node = this.get(node);
		}
		this.selected = node;
		for (var i in this.all) {
			this.all[i].unselect();
		}
		if (node) {
			node.select();
		}
		return this;
	},
	/**
	 * 取得选中节点
	 */
	getSelected : function () {
		return this.selected;
	},
	/**
	 * 取得新名称
	 */
	getUniqueName : function (name) {
		name = name.replace(/\s/g, "");
		var index = 0;

		for (var i in this.all) {
			if (this.all[i].name.match(/^(.*)\_(\d+)$/g) && RegExp.$1 === name) {
				index = Math.max(index, +RegExp.$2 + 1);
			}
			if (this.all[i].name === name) {
				index = Math.max(index, 1);
			}
		}
		return name + (index > 0 ? "_" + index : "");

	},
	/**
	 * 导出xml
	 */
	toXml : function (tab) {
		var s = [];
		for (var i in this.all) {
			s.push(this.all[i].toXml('\t\t'));
		}
		return s.join('\n');
	},
	/**
	 * 导出json
	 */
	toJson : function () {
		var node = [];
		var item;
		var nodeGroup = $$.$('nodeGroup'); // 记录实际顺序
		for (var i = 0; i < nodeGroup.childNodes.length; i++) {
			item = this.get(nodeGroup.childNodes.item(i).id);
			if (item) {
				node.push({
					id : item.id,
					name : item.name,
					ext : item.ext
				});
			}
		}
		return node;
	},
	/**
	 * 导入json
	 */
	importJson : function (node) {
		for (var i = 0; i < node.length; i++) {
			if (!node[i].ext.nodeType || !node[i].id || !node[i].name) {
				Model.console('node | nodeType: ' + node[i].ext.nodeType + ', id: ' + node[i].id + ', name: ' + node[i].name, 'warn');
				continue;
			}
			if (!Model[node[i].ext.nodeType + 'Node']) {
				Model.console('node | nodeType: ' + node[i].ext.nodeType + ', id: ' + node[i].id + ', name: ' + node[i].name, 'warn');
				continue;
			}
			new Model[node[i].ext.nodeType + 'Node'](node[i].id, Model.NODE_SPACE, node[i].name, node[i].ext);
			Model.console('node | nodeType: ' + node[i].ext.nodeType + ', id: ' + node[i].id + ', name: ' + node[i].name, 'debug');
		}
		return this;
	}
};

/**
 * 抽象节点
 *
 * @param {Object} id
 * @param {Object} parentId
 * @param {Object} name
 */
Model.SuperNode = function (id, parentId, name, ext) {
	this.id = id;
	this.parentId = parentId;
	this.name = name;
	this.width = 0;
	this.height = 0;
	this.x = 0;
	this.y = 0;
	this.SPACE = 20;
	this.DISPLAY_NAME_SIZE = 14;
	this.ext = ext;

	Model.AllNode.add(this);
};
/**
 * 取得节点范围
 */
Model.SuperNode.prototype.size = function (width, height) {
	if (arguments.length === 0) {
		return {
			width : +this.ext.width,
			height : +this.ext.height
		};
	} else {
		this.ext.width = Math.max($$.round(width, 20), 80);
		this.ext.height = Math.max($$.round(height, 20), 40);
		return this;
	}
};
/**
 * 设置坐标
 */
Model.SuperNode.prototype.position = function (x, y) {
	if (arguments.length === 0) {
		return {
			x : +this.ext.x,
			y : +this.ext.y,
			cx : +this.ext.x + this.ext.width / 2,
			cy : +this.ext.y + this.ext.height / 2
		};
	} else {
		this.ext.x = $$.round(x, 20);
		this.ext.y = $$.round(y, 20);
		return this;
	}
};

Model.SuperNode.prototype.bound = function (x, y, width, height) {
	if (arguments.length === 0) {
		return {
			x : +this.ext.x,
			y : +this.ext.y,
			width : +this.ext.width,
			height : +this.ext.height
		};
	} else {
		this.position(x, y).size(width, height);
		return this;
	}
};
/**
 * 删除自身svg元素
 */
Model.SuperNode.prototype.removeSelf = function () {
	Model.AllNode.remove(this);
	this.removeGuide().group.self.parentNode.removeChild(this.group.self);
	return this;
};
/**
 * 重命名
 */
Model.SuperNode.prototype.rename = function (name) {
	// 重命名检查
	this.name = name;
	return this;
};
/**
 * 重命名
 */
Model.SuperNode.prototype.setExt = function (prop, value) {
	// 重命名检查
	this.ext[prop] = value;
	return this;
};
/**
 * 选中
 */
Model.SuperNode.prototype.select = function () {
	this.addGuide();
	parent.$('#backgroundColor input').css('background-color', this.ext.backgroundColor);
	parent.$('#textColor input').css('background-color', this.ext.textColor);
	return this;
};
/**
 * 取消选中
 */
Model.SuperNode.prototype.unselect = function () {
	this.removeGuide();
	return this;
};
/**
 * 绘制
 */
Model.SuperNode.prototype.draw = function () {
	// g标签
	this.group = new $$.Group(this.id, $$.$(this.parentId)).position(this.ext.x, this.ext.y).addClass('DragNode');
	var clazz;
	switch (this.ext.nodeType) {
		case 'System':
			clazz = $$.Rect;
			break;
		case 'Actor':
			clazz = $$.Ellipse;
			break;
		case 'Organization':
			clazz = $$.Hexagon;
			break;
		case 'Service':
			clazz = $$.Pentagon;
			break;
	}

	// 主图形
	this.shape = new clazz(this.id + 'r', this.group.self).bound(0, 0, this.ext.width, this.ext.height)
	.css('fill', this.ext.backgroundColor)
	.addClass('node');

	// 文字
	this.text = new $$.Text(this.id + 't', this.group.self).position(this.ext.width / 2, 20)
	.css('fill', this.ext.textColor)
	.addClass('text')
	.text(this.name, 20);

	if (window.getSVGViewerVersion) {
		this.text.css('stroke', this.ext.textColor)
	}

	return this;
};
/**
 * 转XML
 */
Model.SuperNode.prototype.toXml = function (tab) {
	return tab + [
		'<node id="' + this.id + '" name="' + this.name + '">',
		'\t<data key="keyNodeType">' + this.ext.nodeType + '</data>',
		'\t<data key="keyBackgroundColor">' + this.ext.backgroundColor + '</data>',
		'\t<data key="keyTextColor">' + this.ext.textColor + '</data>',
		'\t<data key="keyX">' + this.ext.x + '</data>',
		'\t<data key="keyY">' + this.ext.y + '</data>',
		'\t<data key="keyWidth">' + this.ext.width + '</data>',
		'\t<data key="keyHeight">' + this.ext.height + '</data>',
		'\t<port name="n"/>',
		'\t<port name="s"/>',
		'\t<port name="w"/>',
		'\t<port name="e"/>',
		'</node>'
	].join('\n' + tab);
}

Model.SuperNode.prototype.addGuide = function () {
	if (!this.shape.bound) {
		return this;
	}
	var b = Model.BOUND_WIDTH;
	var box = this.shape.bound();
	// port 端口标志 ，for 节点ID
	if (Model.MODE === 'SELECT') {
		this.guide = [
			new $$.Rect(this.id + 'nw', this.group.self).attr('for', this.id)
			.addClass('guide DragBound nw-resize').attr('port', 'nw').bound(box.x - b, box.y - b, b, b),
			new $$.Rect(this.id + 'n', this.group.self).attr('for', this.id)
			.addClass('guide DragBound n-resize').attr('port', 'n').bound(box.x - b / 2 + box.width / 2, box.y - b, b, b),
			new $$.Rect(this.id + 'ne', this.group.self).attr('for', this.id)
			.addClass('guide DragBound ne-resize').attr('port', 'ne').bound(box.x + box.width, box.y - b, b, b),
			new $$.Rect(this.id + 'e', this.group.self).attr('for', this.id)
			.addClass('guide DragBound e-resize').attr('port', 'e').bound(box.x + box.width, box.y - b / 2 + box.height / 2, b, b),
			new $$.Rect(this.id + 'se', this.group.self).attr('for', this.id)
			.addClass('guide DragBound se-resize').attr('port', 'se').bound(box.x + box.width, box.y + box.height, b, b),
			new $$.Rect(this.id + 's', this.group.self).attr('for', this.id)
			.addClass('guide DragBound s-resize').attr('port', 's').bound(box.x - b / 2 + box.width / 2, box.y + box.height, b, b),
			new $$.Rect(this.id + 'sw', this.group.self).attr('for', this.id)
			.addClass('guide DragBound sw-resize').attr('port', 'sw').bound(box.x - b, box.y + box.height, b, b),
			new $$.Rect(this.id + 'w', this.group.self).attr('for', this.id)
			.addClass('guide DragBound w-resize').attr('port', 'w').bound(box.x - b, box.y - b / 2 + box.height / 2, b, b)];
	} else if (Model.MODE === 'LINE') {
		this.guide = [
			new $$.Rect(this.id + 'n', this.group.self).attr('for', this.id)
			.addClass('guide DragNewLine').attr('port', 'n').bound(box.x - b / 2 + box.width / 2, box.y - b, b, b),
			new $$.Rect(this.id + 'e', this.group.self).attr('for', this.id)
			.addClass('guide DragNewLine').attr('port', 'e').bound(box.x + box.width, box.y - b / 2 + box.height / 2, b, b),
			new $$.Rect(this.id + 's', this.group.self).attr('for', this.id)
			.addClass('guide DragNewLine').attr('port', 's').bound(box.x - b / 2 + box.width / 2, box.y + box.height, b, b),
			new $$.Rect(this.id + 'w', this.group.self).attr('for', this.id)
			.addClass('guide DragNewLine').attr('port', 'w').bound(box.x - b, box.y - b / 2 + box.height / 2, b, b)];
	}
	return this;
}

Model.SuperNode.prototype.getGuide = function (port) {
	var portMap = Model.MODE === 'SELECT' ? {
		nw : 0,
		n : 1,
		ne : 2,
		e : 3,
		se : 4,
		s : 5,
		sw : 6,
		w : 7
	}
	 : {
		n : 0,
		e : 1,
		s : 2,
		w : 3
	};
	return this.guide[portMap[port]];
}

/**
 * 删除提示点
 */
Model.SuperNode.prototype.removeGuide = function () {
	for (var i in this.guide) {
		this.guide[i].remove();
	}
	this.guide = [];
	return this;
}

/**
 * 系统节点
 *
 * @extends SuperNode
 * @param {Object} id
 * @param {Object} parentId
 * @param {Object} name
 * @param {Object} ext
 */
Model.SystemNode = function (id, parentId, name, ext) {
	ext.nodeType = 'System';
	Model.SystemNode.superClass.constructor.call(this, id, parentId, name, ext);

	this.draw();
	// 提示点
	//this.addGuide();
};
$$.extend(Model.SystemNode, Model.SuperNode);

/**
 * 人员节点
 *
 * @extends SuperNode
 * @param {Object} id
 * @param {Object} parentId
 * @param {Object} name
 * @param {Object} ext
 */
Model.ActorNode = function (id, parentId, name, ext) {
	ext.nodeType = 'Actor';
	Model.ActorNode.superClass.constructor.call(this, id, parentId, name, ext);

	this.draw();
	// 提示点
	//this.addGuide();
};
$$.extend(Model.ActorNode, Model.SuperNode);

/**
 * 组织节点
 *
 * @extends SuperNode
 * @param {Object} id
 * @param {Object} parentId
 * @param {Object} name
 * @param {Object} ext
 */
Model.OrganizationNode = function (id, parentId, name, ext) {
	ext.nodeType = 'Organization'
	Model.OrganizationNode.superClass.constructor.call(this, id, parentId, name, ext);

	this.draw();
	// 提示点
	//this.addGuide();
};
$$.extend(Model.OrganizationNode, Model.SuperNode);

/**
 * 服务节点
 *
 * @extends SuperNode
 * @param {Object} id
 * @param {Object} parentId
 * @param {Object} name
 * @param {Object} ext
 */
Model.ServiceNode = function (id, parentId, name, ext) {
	ext.nodeType = 'Service';
	Model.ServiceNode.superClass.constructor.call(this, id, parentId, name, ext);

	this.draw();
	// 提示点
	//this.addGuide();
};
$$.extend(Model.ServiceNode, Model.SuperNode);
/**
 * 资源流集合
 */
Model.AllEdge = {
	/**
	 * 所有节点
	 */
	all : {},

	add : function (line) {
		if (!line || !line.id) {
			parent.alert('Model.AllEdge.add方法参数异常！');
			return;
		}
		this.all[line.id] = line;
		return this;
	},

	remove : function (line) {
		if (!line || !line.id) {
			parent.alert('Model.AllEdge.remove方法参数异常！');
			return;
		}
		delete this.all[line.id];

		return this;
	},

	get : function (id) {
		if (typeof id !== 'string') {
			parent.alert('Model.AllEdge.get方法参数异常！');
			return;
		}
		return this.all[id];
	},

	/**
	 * 设置选中节点
	 */
	select : function (line) {
		if (typeof line === 'string') {
			line = this.get(line);
		}
		this.selected = line;
		for (var i in this.all) {
			this.all[i].unselect();
		}
		if (line) {
			line.select();
		}
		return this;
	},
	/**
	 * 取得选中线
	 */
	getSelected : function () {
		return this.selected;
	},
	draw : function (auto) {
		for (var i in this.all) {
			this.all[i].syncEndPoint().draw(auto);
			//this.all[i].syncEndPoint().addGuide().draw();
		}
		return this;
	},
	toXml : function (tab) {
		var s = [];
		for (var i in this.all) {
			s.push(this.all[i].toXml(tab));
		}
		return s.join('\n');
	},
	toJson : function () {
		var edge = [];
		for (var i in this.all) {
			edge.push(this.all[i].toJson())
		}
		return edge;
	},
	importJson : function (edge) {
		for (var i = 0; i < edge.length; i++) {
			Model.console('edge | id: ' + edge[i].id + ',source: ' + edge[i].source + 'target: ' + edge[i].target, 'debug');
			new Model.Edge(edge[i].id, 'edgeGroup', edge[i].name, edge[i].source, edge[i].target, edge[i].sourcePort, edge[i].targetPort, edge[i].ext).syncEndPoint().draw(true);
		}
		return this;
	}
}
/**
 * 资源流
 */
Model.Edge = function (id, parentId, name, source, target, sourcePort, targetPort, ext) {
	this.id = id;
	this.parentId = parentId;
	this.name = name;
	if (typeof source === 'string') {
		this.source = Model.AllNode.get(source);
	} else {
		this.source = source;
	}
	if (typeof target === 'string') {
		this.target = Model.AllNode.get(target);
	} else {
		this.target = target;
	}
	this.sourcePort = sourcePort;
	this.targetPort = targetPort;
	this.ext = ext;
	if (this.ext && typeof this.ext.points === 'string') {
		var arr = [];
		var xy = this.ext.points.split(' ');
		var item;
		for (var i in xy) {
			item = xy[i].split(',');
			arr.push({
				x : +item[0],
				y : +item[1]
			});
		}
		this.ext.points = arr;
	}
	this.ext = this.ext || {
		points : [{
				x : 0,
				y : 0
			}, {
				x : 0,
				y : 0
			}
		]
	};

	this.syncEndPoint();
	Model.AllEdge.add(this);
	this.draw(true);
	//this.addGuide();
}
/**
 * 绘制
 */
Model.Edge.prototype.draw = function (auto) {
	var d;
	var sp = this.source.position();
	var tp = this.target.position();
	if (auto) {
		if (this.ext.points.length === 2) {
			d = Math.abs(sp.cx - tp.cx) >= Math.abs(sp.cy - tp.cy);
			if (sp.cx < tp.cx && d) {
				this.sourcePort = 'e';
				this.targetPort = 'w';
			} else if (sp.cy > tp.cy && !d) {
				this.sourcePort = 'n';
				this.targetPort = 's';
			} else if (sp.cx > tp.cx && d) {
				this.sourcePort = 'w';
				this.targetPort = 'e';
			} else if (sp.cy < tp.cy && !d) {
				this.sourcePort = 's';
				this.targetPort = 'n';
			}
		} else {
			var point = this.ext.points[1];
			var ww = Math.pow(sp.x - point.x, 2) + Math.pow(sp.cy - point.y, 2);
			var ee = Math.pow(sp.cx * 2 - sp.x - point.x, 2) + Math.pow(sp.cy - point.y, 2);
			var ss = Math.pow(sp.cx - point.x, 2) + Math.pow(sp.cy * 2 - sp.y - point.y, 2);
			var nn = Math.pow(sp.cx - point.x, 2) + Math.pow(sp.y - point.y, 2);
			d = Math.min(ww, ee, ss, nn);
			if (ee === d) {
				this.sourcePort = 'e';
			} else if (nn === d) {
				this.sourcePort = 'n';
			} else if (ww === d) {
				this.sourcePort = 'w';
			} else if (ss === d) {
				this.sourcePort = 's';
			}
			point = this.ext.points[this.ext.points.length - 2];
			ww = Math.pow(tp.x - point.x, 2) + Math.pow(tp.cy - point.y, 2);
			ee = Math.pow(tp.cx * 2 - tp.x - point.x, 2) + Math.pow(tp.cy - point.y, 2);
			ss = Math.pow(tp.cx - point.x, 2) + Math.pow(tp.cy * 2 - tp.y - point.y, 2);
			nn = Math.pow(tp.cx - point.x, 2) + Math.pow(tp.y - point.y, 2);
			d = Math.min(ww, ee, ss, nn);
			showMsg(ww +','+ee +','+ss +','+nn)
			if (ee === d) {
				this.targetPort = 'e';
			} else if (nn === d) {
				this.targetPort = 'n';
			} else if (ww === d) {
				this.targetPort = 'w';
			} else if (ss === d) {
				this.targetPort = 's';
			}
		}
		this.syncEndPoint();
	}
	this.shape = new $$.Polyline(this.id, $$.$(this.parentId)).setPoints(this.ext.points).addClass('resourceFlow');
	return this;
}
/**
 * 同步两端坐标
 */
Model.Edge.prototype.syncEndPoint = function () {
	var sp = this.source.bound();
	var tp = this.target.bound();
	if (this.sourcePort === 'w') {
		this.ext.points[0] = {
			x : sp.x,
			y : sp.y + sp.height / 2
		};
	} else if (this.sourcePort === 'n') {
		this.ext.points[0] = {
			x : sp.x + sp.width / 2,
			y : sp.y
		};
	} else if (this.sourcePort === 'e') {
		this.ext.points[0] = {
			x : sp.x + sp.width,
			y : sp.y + sp.height / 2
		};
	} else if (this.sourcePort === 's') {
		this.ext.points[0] = {
			x : sp.x + sp.width / 2,
			y : sp.y + sp.height
		};
	}

	if (this.targetPort === 'w') {
		this.ext.points[this.ext.points.length - 1] = {
			x : tp.x,
			y : tp.y + tp.height / 2
		};
	} else if (this.targetPort === 'n') {
		this.ext.points[this.ext.points.length - 1] = {
			x : tp.x + tp.width / 2,
			y : tp.y
		};
	} else if (this.targetPort === 'e') {
		this.ext.points[this.ext.points.length - 1] = {
			x : tp.x + tp.width,
			y : tp.y + tp.height / 2
		};
	} else if (this.targetPort === 's') {
		this.ext.points[this.ext.points.length - 1] = {
			x : tp.x + tp.width / 2,
			y : tp.y + tp.height
		};
	}

	return this;
}
/**
 * 添加转折点
 */
Model.Edge.prototype.addPoint = function (point, index) {
	this.ext.points = this.ext.points.slice(0, index).concat(point).concat(this.ext.points.slice(index));
	return this;
}
/**
 * 删除转折点
 */
Model.Edge.prototype.removePoint = function (index) {
	this.ext.points = this.ext.points.slice(0, index).concat(this.ext.points.slice(index + 1));
	return this;
}

/**
 * 转XML
 */
Model.Edge.prototype.toXml = function (tab) {
	return tab + [
		'<edge source="' + this.source.id + '" target="' + this.target.id + '" sourceport="' + this.sourcePort + '" targetport="' + this.targetPort + '">',
		'\t<data key="keyPoints">' + this.pointsToJson() + '</data>',
		'</edge>'
	].join('\n' + tab);
}
/**
 * 转JSON
 */
Model.Edge.prototype.toJson = function () {
	return {
		id : this.id,
		source : this.source.id,
		target : this.target.id,
		sourcePort : this.sourcePort,
		targetPort : this.targetPort,
		ext : {
			points : this.pointsToJson()
		}
	}
}
/**
 * 转换点坐标序列
 */
Model.Edge.prototype.pointsToJson = function () {
	var points = [];
	for (var i in this.ext.points) {
		points.push(this.ext.points[i].x + ',' + this.ext.points[i].y);
	}
	return points.join(' ');
}
/**
 * 添加转折点
 */
Model.Edge.prototype.addGuide = function () {
	this.guide = [];
	var b = Model.BOUND_WIDTH;
	var point;
	for (var i = 0; i < this.ext.points.length; i++) {
		// index 转折点索引，开始点，转折点1，转折点2，···，结束点，for 连线ID

		point = new $$.Rect(this.id + 'p' + i, this.shape.self.parentNode)
			.addClass('guide').attr('index', i).attr('for', this.id);
		if (i === 0 || i === this.ext.points.length - 1) {
			point.addClass('DragLine');
		} else {
			point.addClass('DragPoint');
		}
		point.bound(this.ext.points[i].x - b / 2, this.ext.points[i].y - b / 2, b, b);
		this.guide.push(point);
	}
	return this;
}

/**
 * 根据索引转折点
 */
Model.Edge.prototype.getGuide = function (index) {
	return this.guide[index];
}

/**
 * 删除提示点
 */
Model.Edge.prototype.removeGuide = function () {
	for (var i in this.guide) {
		this.guide[i].remove();
	}
	this.guide = [];
	return this;
}

Model.Edge.prototype.select = function () {
	this.addGuide();
	for (var i in this.guide) {
		this.guide[i].addClass('select');
	}
	return this;
}

Model.Edge.prototype.unselect = function () {
	this.removeGuide();
	for (var i in this.guide) {
		this.guide[i].removeClass('select');
	}
	return this;
}

Model.Edge.prototype.removeSelf = function () {
	Model.AllEdge.remove(this);
	this.removeGuide().shape.self.parentNode.removeChild(this.shape.self);
}
