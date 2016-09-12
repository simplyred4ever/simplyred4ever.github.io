/**
 * 树形拓扑图（Reingold Tilford算法）
 * @param id	ID
 * @param pid 父ID
 * @param dsc 描述文字
 * @param entries 条目
 * @param ext 扩展数据
 *  ext.w		宽
 *  ext.h		高
 *  ext.c		颜色
 *  ext.bc	边框色
 *  ext.target 目标
 */
TopoNode = function (id, pid, dsc, entries, ext) {
	this.id = id;
	this.pid = pid;
	this.dsc = dsc;
	this.entries = entries;
	this.ext = ext || {};

	this.w = this.ext.w;
	this.h = 30 + entries.length * 30; //this.ext.h;
	this.c = this.ext.c;
	this.bc = this.ext.bc;
	this.target = this.ext.target;
	this.url = this.ext.url;

	this.siblingIndex = 0;
	this.dbIndex = 0;

	this.XPosition = 0;
	this.YPosition = 0;
	this.prelim = 0;
	this.modifier = 0;
	this.leftNeighbor = null;
	this.rightNeighbor = null;
	this.nodeParent = null;
	this.nodeChildren = [];

	this.isCollapsed = false;
	this.canCollapse = false;

	this.isSelected = false;
}

TopoNode.prototype._getLevel = function () {
	if (this.nodeParent.id == -1) {
		return 0;
	} else
		return this.nodeParent._getLevel() + 1;
}

TopoNode.prototype._isAncestorCollapsed = function () {
	if (this.nodeParent.isCollapsed) {
		return true;
	} else {
		if (this.nodeParent.id == -1) {
			return false;
		} else {
			return this.nodeParent._isAncestorCollapsed();
		}
	}
}

TopoNode.prototype._setAncestorsExpanded = function () {
	if (this.nodeParent.id == -1) {
		return;
	} else {
		this.nodeParent.isCollapsed = false;
		return this.nodeParent._setAncestorsExpanded();
	}
}

TopoNode.prototype._getChildrenCount = function () {
	if (this.isCollapsed)
		return 0;
	if (this.nodeChildren == null)
		return 0;
	else
		return this.nodeChildren.length;
}

TopoNode.prototype._getLeftSibling = function () {
	if (this.leftNeighbor != null && this.leftNeighbor.nodeParent == this.nodeParent)
		return this.leftNeighbor;
	else
		return null;
}

TopoNode.prototype._getRightSibling = function () {
	if (this.rightNeighbor != null && this.rightNeighbor.nodeParent == this.nodeParent)
		return this.rightNeighbor;
	else
		return null;
}

TopoNode.prototype._getChildAt = function (i) {
	return this.nodeChildren[i];
}

TopoNode.prototype._getChildrenCenter = function (tree) {
	node = this._getFirstChild();
	node1 = this._getLastChild();
	return node.prelim + ((node1.prelim - node.prelim) + tree._getNodeSize(node1)) / 2;
}

TopoNode.prototype._getFirstChild = function () {
	return this._getChildAt(0);
}

TopoNode.prototype._getLastChild = function () {
	return this._getChildAt(this._getChildrenCount() - 1);
}

TopoNode.prototype._drawChildrenLinks = function (tree) {
	var s = [];
	var xa = 0,
	ya = 0,
	xb = 0,
	yb = 0,
	xc = 0,
	yc = 0,
	xd = 0,
	yd = 0;
	var node1 = null;

	switch (tree.config.iRootOrientation) {
	case TopoTree.RO_TOP:
		xa = this.XPosition + (this.w / 2);
		ya = this.YPosition + this.h;
		break;

	case TopoTree.RO_BOTTOM:
		xa = this.XPosition + (this.w / 2);
		ya = this.YPosition;
		break;

	case TopoTree.RO_RIGHT:
		xa = this.XPosition;
		ya = this.YPosition + (this.h / 2);
		break;

	case TopoTree.RO_LEFT:
		xa = this.XPosition + this.w;
		ya = this.YPosition + (this.h / 2);
		break;
	}

	for (var k = 0; k < this.nodeChildren.length; k++) {
		node1 = this.nodeChildren[k];

		switch (tree.config.iRootOrientation) {
		case TopoTree.RO_TOP:
			xd = xc = node1.XPosition + (node1.w / 2);
			yd = node1.YPosition;
			xb = xa;
			switch (tree.config.iNodeJustification) {
			case TopoTree.NJ_TOP:
				yb = yc = yd - tree.config.iLevelSeparation / 2;
				break;
			case TopoTree.NJ_BOTTOM:
				yb = yc = ya + tree.config.iLevelSeparation / 2;
				break;
			case TopoTree.NJ_CENTER:
				yb = yc = ya + (yd - ya) / 2;
				break;
			}
			break;

		case TopoTree.RO_BOTTOM:
			xd = xc = node1.XPosition + (node1.w / 2);
			yd = node1.YPosition + node1.h;
			xb = xa;
			switch (tree.config.iNodeJustification) {
			case TopoTree.NJ_TOP:
				yb = yc = yd + tree.config.iLevelSeparation / 2;
				break;
			case TopoTree.NJ_BOTTOM:
				yb = yc = ya - tree.config.iLevelSeparation / 2;
				break;
			case TopoTree.NJ_CENTER:
				yb = yc = yd + (ya - yd) / 2;
				break;
			}
			break;

		case TopoTree.RO_RIGHT:
			xd = node1.XPosition + node1.w;
			yd = yc = node1.YPosition + (node1.h / 2);
			yb = ya;
			switch (tree.config.iNodeJustification) {
			case TopoTree.NJ_TOP:
				xb = xc = xd + tree.config.iLevelSeparation / 2;
				break;
			case TopoTree.NJ_BOTTOM:
				xb = xc = xa - tree.config.iLevelSeparation / 2;
				break;
			case TopoTree.NJ_CENTER:
				xb = xc = xd + (xa - xd) / 2;
				break;
			}
			break;

		case TopoTree.RO_LEFT:
			xd = node1.XPosition;
			yd = yc = node1.YPosition + (node1.h / 2);
			yb = ya;
			switch (tree.config.iNodeJustification) {
			case TopoTree.NJ_TOP:
				xb = xc = xd - tree.config.iLevelSeparation / 2;
				break;
			case TopoTree.NJ_BOTTOM:
				xb = xc = xa + tree.config.iLevelSeparation / 2;
				break;
			case TopoTree.NJ_CENTER:
				xb = xc = xa + (xd - xa) / 2;
				break;
			}
			break;
		}
		new $$.Polyline($$.getUuid(), 'workspace').setPoints([{
					x : xa,
					y : ya
				}, {
					x : xd,
					y : yd
				}
			]).addClass('line');

	}

	return s.join('');
}

TopoTree = function (obj, elm) {
	this.config = {
		iMaxDepth : 100,
		iLevelSeparation : 150,
		iSiblingSeparation : 30,
		iSubtreeSeparation : 30,
		iRootOrientation : TopoTree.RO_LEFT,
		iNodeJustification : TopoTree.NJ_TOP,
		topXAdjustment : 50,
		topYAdjustment : -100,
		render : "SVG",
		linkType : "M",
		linkColor : "blue",
		nodeColor : "#CCCCFF",
		nodeFill : TopoTree.NF_GRADIENT,
		nodeBorderColor : "blue",
		nodeSelColor : "#FFFFCC",
		levelColors : ["#5555FF", "#8888FF", "#AAAAFF", "#CCCCFF"],
		levelBorderColors : ["#5555FF", "#8888FF", "#AAAAFF", "#CCCCFF"],
		colorStyle : TopoTree.CS_NODE,
		useTarget : true,
		searchMode : TopoTree.SM_DSC,
		selectMode : TopoTree.SL_SINGLE,
		defaultNodeWidth : 250,
		defaultNodeHeight : 30,
		defaultTextNumber : 28,
		defaultTarget : 'javascript:void(0);',
		expandedImage : '../img/scroll_left.gif',
		collapsedImage : '../img/scroll_right.gif',
		transImage : '../img/trans.gif',
		titleImage : '../img/doc.gif',
		sectionImage : '../img/chaper.gif',
		entryImage : '../img/docReqItem.gif'
	}

	this.version = "1.1";
	this.obj = obj;
	if (typeof elm === 'string') {
		this.elm = [document.getElementById(elm)];
	} else {
		this.elm = [];
		for (var i = 0; i < elm.length; i++) {
			this.elm.push(document.getElementById(elm[i]));
		}
	}
	this.self = this;
	this.render = this.config.render;
	this.ctx = null;
	this.canvasoffsetTop = 0;
	this.canvasoffsetLeft = 0;

	this.maxLevelHeight = [];
	this.maxLevelWidth = [];
	this.previousLevelNode = [];

	this.rootYOffset = 0;
	this.rootXOffset = 0;

	this.nDatabaseNodes = [];
	this.mapIDs = {};

	this.root = new TopoNode(-1, null, null, 2, 2);
	this.iSelectedNode = -1;
	this.iLastSearch = 0;

}

//Constant values

//Tree orientation
TopoTree.RO_TOP = 0;
TopoTree.RO_BOTTOM = 1;
TopoTree.RO_RIGHT = 2;
TopoTree.RO_LEFT = 3;

//Level node alignment
TopoTree.NJ_TOP = 0;
TopoTree.NJ_CENTER = 1;
TopoTree.NJ_BOTTOM = 2;

//Node fill type
TopoTree.NF_GRADIENT = 0;
TopoTree.NF_FLAT = 1;

//Colorizing style
TopoTree.CS_NODE = 0;
TopoTree.CS_LEVEL = 1;

//Search method: Title, metadata or both
TopoTree.SM_DSC = 0;
TopoTree.SM_META = 1;
TopoTree.SM_BOTH = 2;

//Selection mode: single, multiple, no selection
TopoTree.SL_MULTIPLE = 0;
TopoTree.SL_SINGLE = 1;
TopoTree.SL_NONE = 2;

//Layout algorithm
TopoTree._firstWalk = function (tree, node, level) {
	var leftSibling = null;

	node.XPosition = 0;
	node.YPosition = 0;
	node.prelim = 0;
	node.modifier = 0;
	node.leftNeighbor = null;
	node.rightNeighbor = null;
	tree._setLevelHeight(node, level);
	tree._setLevelWidth(node, level);
	tree._setNeighbors(node, level);
	if (node._getChildrenCount() == 0 || level == tree.config.iMaxDepth) {
		leftSibling = node._getLeftSibling();
		if (leftSibling != null)
			node.prelim = leftSibling.prelim + tree._getNodeSize(leftSibling) + tree.config.iSiblingSeparation;
		else
			node.prelim = 0;
	} else {
		var n = node._getChildrenCount();
		for (var i = 0; i < n; i++) {
			var iChild = node._getChildAt(i);
			TopoTree._firstWalk(tree, iChild, level + 1);
		}

		var midPoint = node._getChildrenCenter(tree);
		midPoint -= tree._getNodeSize(node) / 2;
		leftSibling = node._getLeftSibling();
		if (leftSibling != null) {
			node.prelim = leftSibling.prelim + tree._getNodeSize(leftSibling) + tree.config.iSiblingSeparation;
			node.modifier = node.prelim - midPoint;
			TopoTree._apportion(tree, node, level);
		} else {
			node.prelim = midPoint;
		}
	}
}

TopoTree._apportion = function (tree, node, level) {
	var firstChild = node._getFirstChild();
	var firstChildLeftNeighbor = firstChild.leftNeighbor;
	var j = 1;
	for (var k = tree.config.iMaxDepth - level; firstChild != null && firstChildLeftNeighbor != null && j <= k; ) {
		var modifierSumRight = 0;
		var modifierSumLeft = 0;
		var rightAncestor = firstChild;
		var leftAncestor = firstChildLeftNeighbor;
		for (var l = 0; l < j; l++) {
			rightAncestor = rightAncestor.nodeParent;
			leftAncestor = leftAncestor.nodeParent;
			modifierSumRight += rightAncestor.modifier;
			modifierSumLeft += leftAncestor.modifier;
		}

		var totalGap = (firstChildLeftNeighbor.prelim + modifierSumLeft + tree._getNodeSize(firstChildLeftNeighbor) + tree.config.iSubtreeSeparation) - (firstChild.prelim + modifierSumRight);
		if (totalGap > 0) {
			var subtreeAux = node;
			var numSubtrees = 0;
			for (; subtreeAux != null && subtreeAux != leftAncestor; subtreeAux = subtreeAux._getLeftSibling())
				numSubtrees++;

			if (subtreeAux != null) {
				var subtreeMoveAux = node;
				var singleGap = totalGap / numSubtrees;
				for (; subtreeMoveAux != leftAncestor; subtreeMoveAux = subtreeMoveAux._getLeftSibling()) {
					subtreeMoveAux.prelim += totalGap;
					subtreeMoveAux.modifier += totalGap;
					totalGap -= singleGap;
				}

			}
		}
		j++;
		if (firstChild._getChildrenCount() == 0)
			firstChild = tree._getLeftmost(node, 0, j);
		else
			firstChild = firstChild._getFirstChild();
		if (firstChild != null)
			firstChildLeftNeighbor = firstChild.leftNeighbor;
	}
}

TopoTree._secondWalk = function (tree, node, level, X, Y) {
	if (level <= tree.config.iMaxDepth) {
		var xTmp = tree.rootXOffset + node.prelim + X;
		var yTmp = tree.rootYOffset + Y;
		var maxsizeTmp = 0;
		var nodesizeTmp = 0;
		var flag = false;

		switch (tree.config.iRootOrientation) {
		case TopoTree.RO_TOP:
		case TopoTree.RO_BOTTOM:
			maxsizeTmp = tree.maxLevelHeight[level];
			nodesizeTmp = node.h;
			break;

		case TopoTree.RO_RIGHT:
		case TopoTree.RO_LEFT:
			maxsizeTmp = tree.maxLevelWidth[level];
			flag = true;
			nodesizeTmp = node.w;
			break;
		}
		switch (tree.config.iNodeJustification) {
		case TopoTree.NJ_TOP:
			node.XPosition = xTmp;
			node.YPosition = yTmp;
			break;

		case TopoTree.NJ_CENTER:
			node.XPosition = xTmp;
			node.YPosition = yTmp + (maxsizeTmp - nodesizeTmp) / 2;
			break;

		case TopoTree.NJ_BOTTOM:
			node.XPosition = xTmp;
			node.YPosition = (yTmp + maxsizeTmp) - nodesizeTmp;
			break;
		}
		if (flag) {
			var swapTmp = node.XPosition;
			node.XPosition = node.YPosition;
			node.YPosition = swapTmp;
		}
		switch (tree.config.iRootOrientation) {
		case TopoTree.RO_BOTTOM:
			node.YPosition = -node.YPosition - nodesizeTmp;
			break;

		case TopoTree.RO_RIGHT:
			node.XPosition = -node.XPosition - nodesizeTmp;
			break;
		}
		if (node._getChildrenCount() != 0)
			TopoTree._secondWalk(tree, node._getFirstChild(), level + 1, X + node.modifier, Y + maxsizeTmp + tree.config.iLevelSeparation);
		var rightSibling = node._getRightSibling();
		if (rightSibling != null)
			TopoTree._secondWalk(tree, rightSibling, level, X, Y);
	}
}

TopoTree.prototype._positionTree = function () {
	this.maxLevelHeight = [];
	this.maxLevelWidth = [];
	this.previousLevelNode = [];
	TopoTree._firstWalk(this.self, this.root, 0);

	switch (this.config.iRootOrientation) {
	case TopoTree.RO_TOP:
	case TopoTree.RO_LEFT:
		this.rootXOffset = this.config.topXAdjustment + this.root.XPosition;
		this.rootYOffset = this.config.topYAdjustment + this.root.YPosition;
		break;

	case TopoTree.RO_BOTTOM:
	case TopoTree.RO_RIGHT:
		this.rootXOffset = this.config.topXAdjustment + this.root.XPosition;
		this.rootYOffset = this.config.topYAdjustment + this.root.YPosition;
	}

	TopoTree._secondWalk(this.self, this.root, 0, 0, 0);
}

TopoTree.prototype._setLevelHeight = function (node, level) {
	if (this.maxLevelHeight[level] == null)
		this.maxLevelHeight[level] = 0;
	if (this.maxLevelHeight[level] < node.h)
		this.maxLevelHeight[level] = node.h;
}

TopoTree.prototype._setLevelWidth = function (node, level) {
	if (this.maxLevelWidth[level] == null)
		this.maxLevelWidth[level] = 0;
	if (this.maxLevelWidth[level] < node.w)
		this.maxLevelWidth[level] = node.w;
}

TopoTree.prototype._setNeighbors = function (node, level) {
	node.leftNeighbor = this.previousLevelNode[level];
	if (node.leftNeighbor != null)
		node.leftNeighbor.rightNeighbor = node;
	this.previousLevelNode[level] = node;
}

TopoTree.prototype._getNodeSize = function (node) {
	switch (this.config.iRootOrientation) {
	case TopoTree.RO_TOP:
	case TopoTree.RO_BOTTOM:
		return node.w;

	case TopoTree.RO_RIGHT:
	case TopoTree.RO_LEFT:
		return node.h;
	}
	return 0;
}

TopoTree.prototype._getLeftmost = function (node, level, maxlevel) {
	if (level >= maxlevel)
		return node;
	if (node._getChildrenCount() == 0)
		return null;

	var n = node._getChildrenCount();
	for (var i = 0; i < n; i++) {
		var iChild = node._getChildAt(i);
		var leftmostDescendant = this._getLeftmost(iChild, level + 1, maxlevel);
		if (leftmostDescendant != null)
			return leftmostDescendant;
	}

	return null;
}

TopoTree.prototype._selectNodeInt = function (dbindex, flagToggle) {
	if (this.config.selectMode == TopoTree.SL_SINGLE) {
		if ((this.iSelectedNode != dbindex) && (this.iSelectedNode != -1)) {
			this.nDatabaseNodes[this.iSelectedNode].isSelected = false;
		}
		this.iSelectedNode = (this.nDatabaseNodes[dbindex].isSelected && flagToggle) ? -1 : dbindex;
	}
	this.nDatabaseNodes[dbindex].isSelected = (flagToggle) ? !this.nDatabaseNodes[dbindex].isSelected : true;
}

TopoTree.prototype._collapseAllInt = function (flag) {
	var node = null;
	for (var n = 0; n < this.nDatabaseNodes.length; n++) {
		node = this.nDatabaseNodes[n];
		if (node.canCollapse)
			node.isCollapsed = flag;
	}
	this.redraw();
}

TopoTree.prototype._selectAllInt = function (flag) {
	var node = null;
	for (var k = 0; k < this.nDatabaseNodes.length; k++) {
		node = this.nDatabaseNodes[k];
		node.isSelected = flag;
	}
	this.iSelectedNode = -1;
	this.redraw();
}

TopoTree.prototype._drawTree = function () {
	var node = null;
	var color = "";
	var border = "";

	for (var n = 0; n < this.nDatabaseNodes.length; n++) {
		node = this.nDatabaseNodes[n];

		switch (this.config.colorStyle) {
		case TopoTree.CS_NODE:
			color = node.c;
			border = node.bc;
			break;
		case TopoTree.CS_LEVEL:
			var iColor = node._getLevel() % this.config.levelColors.length;
			color = this.config.levelColors[iColor];
			iColor = node._getLevel() % this.config.levelBorderColors.length;
			border = this.config.levelBorderColors[iColor];
			break;
		}

		if (node._isAncestorCollapsed()) {
			continue;
		}

		// 标题
		var rect = new $$.Rect(node.id, 'workspace').bound(node.XPosition, node.YPosition, node.w, node.h).addClass('node').attr({
			'shape-rendering': 'crispEdges',
			stroke: 'black',
			'stroke-width': 1,
			fill: '#D8D8D8'
		}).attr('title', node.dsc);//.attr('onclick', this.obj + '.selectNode(\'' + node.id + '\', true);'); //.css('stroke', border).css('fill', color);
		if (node.nodeParent === this.root) {
			rect.addClass('current');
		} else {
			rect.removeClass('current');
		}
		var a;
		var text = new $$.Text(node.id + 'text', 'textWorkspace').position(node.XPosition + 22, node.YPosition + this.config.defaultNodeHeight * 0.7).addClass('text').text(node.dsc, this.config.defaultTextNumber);

		new $$.Image(node.id + 'image', 'workspace').bound(node.XPosition + 4, node.YPosition + 8, 16, 16).change(this.config.titleImage);
		// 条目
		var item;
		for (var e = 0; e < node.entries.length; e++) {
			item = node.entries[e];
			rect = new $$.Rect(item.id, 'workspace').bound(node.XPosition, node.YPosition + this.config.defaultNodeHeight * (e + 1), node.w, this.config.defaultNodeHeight).addClass('entry').attr({
				'shape-rendering': 'crispEdges',
				stroke: 'black',
				'stroke-width': 1,
				fill: 'white'
			}).attr('title', item.name); //.css('stroke', border).css('fill', color);
			if (node.nodeParent === this.root) {
				rect.addClass('current');
			} else {
				rect.removeClass('current');
			}
			//rect.attr('onclick', 'parent.showItem("'+ item.url +'")'); //TODO
			a = new $$.A(item.id + 'a', '#', 'new', 'textWorkspace');
			a.attr('pointer-events', 'none');
			if (!window.getSVGViewerVersion) {
				a.attr('onclick', 'return false;');
			}
			text = new $$.Text(item.id + 'text', a.self).position(node.XPosition + 22, node.YPosition + this.config.defaultNodeHeight * (e + 1.7)).addClass('aColor text').text(item.name, this.config.defaultTextNumber);
			text.attr('onclick', 'parent.showItem(\"'+ item.url +'\")').attr({
				'font-family': 'simsun',
				'text-rendering': 'optimizeLegibility',
				fill: '#0000ff',
				'stroke-width': 1,
				'font-size': '14px',
				'text-decoration': 'underline'
			});
			new $$.Image(item.id + 'image', 'workspace').bound(node.XPosition + 4, node.YPosition + this.config.defaultNodeHeight * (e + 1) + 8, 16, 16).change(item.isSectionItem == '0' ? this.config.sectionImage : this.config.entryImage);

		}

		// 展开收缩图标
		if (node.canCollapse) {
			new $$.Image(node.id + 'open', 'workspace').bound(node.XPosition + node.w - 20, node.YPosition + (this.config.defaultNodeHeight - 17) / 2, 17, 17).change(node.isCollapsed ? this.config.collapsedImage : this.config.expandedImage).attr('onclick', this.obj + '.collapseNode(\'' + node.id + '\', true);');
			//new $$.Image($$.getUuid(), 'workspace').bound(node.XPosition + 16, node.YPosition, 17, 17).change(this.config.transImage);
		}

		// 与下级连线
		//if (!node.isCollapsed) {
		//node._drawChildrenLinks(this.self);
		//}
	}

	var sourcePort;
	var targetPort;
	var line;
	var color;
	for (var n = 0; n < this.nDatabaseNodes.length; n++) {
		node = this.nDatabaseNodes[n];

		if (node._isAncestorCollapsed()) {
			continue;
		}
		// 与下级连线
		if (node.isCollapsed) {
			continue;
		}
		for (var i = 0; i < this.mapping.length; i++) {
			if (!corrType.getFilter(this.mapping[i].type)) {
				continue;
			}
			color = corrType.color(this.mapping[i].type);
			if (this.mapping[i].target != node.id) {
				continue;
			}

			sourcePort = $$.$(this.mapping[i].sourcePort);
			targetPort = $$.$(this.mapping[i].targetPort);
			line = new $$.Line(sourcePort.id + '_' + targetPort.id, 'lineWorkspace').position({
					x1 : +sourcePort.getAttribute('x'),
					y1 : +sourcePort.getAttribute('y') + this.config.defaultNodeHeight / 2,
					x2 : +targetPort.getAttribute('x') + node.w,
					y2 : +targetPort.getAttribute('y') + this.config.defaultNodeHeight / 2
				}).addClass('line').attr('stroke', color).attr('marker-end', 'url(#arrow_' + color + ')').css('stroke', color).css('marker-end', 'url(#arrow_' + color + ')');

		}
	}
}

// TopoTree API begins here...

TopoTree.prototype.redraw = function () {
	this._clear();
	this._positionTree();
	this._drawTree();
	return this;
}

TopoTree.prototype._clear = function () {
	var old = this.elm;
	var workspace,
	workspace1,
	p;
	this.elm = [];
	for (var i = 0; i < old.length; i++) {
		workspace = old[i];
		workspace1 = workspace.cloneNode(false);
		p = workspace.parentNode;
		p.removeChild(workspace);
		p.appendChild(workspace1);
		this.elm.push(workspace1);
	}
}

TopoTree.prototype.add = function (id, pid, dsc, entries, ext) {
	ext = ext || {};
	ext.w = ext.w || this.config.defaultNodeWidth; //Width, height, colors, target and extdata defaults...
	ext.h = ext.h || this.config.defaultNodeHeight;
	ext.c = ext.c || this.config.nodeColor;
	ext.bc = ext.bc || this.config.nodeBorderColor;
	ext.url = (this.config.useTarget) ? ((typeof ext.url == "undefined") ? (this.config.defaultTarget) : ext.url) : null;

	var pnode = null; //Search for parent node in database
	if (pid == -1) {
		pnode = this.root;
	} else {
		for (var k = 0; k < this.nDatabaseNodes.length; k++) {
			if (this.nDatabaseNodes[k].id == pid) {
				pnode = this.nDatabaseNodes[k];
				break;
			}
		}
	}

	var node = new TopoNode(id, pid, dsc, entries, ext); //New node creation...
	node.nodeParent = pnode; //Set it's parent
	pnode.canCollapse = true; //It's obvious that now the parent can collapse
	var i = this.nDatabaseNodes.length; //Save it in database
	node.dbIndex = this.mapIDs[id] = i;
	this.nDatabaseNodes[i] = node;
	var h = pnode.nodeChildren.length; //Add it as child of it's parent
	node.siblingIndex = h;
	pnode.nodeChildren[h] = node;
	return this;
}

TopoTree.prototype.searchNodes = function (str) {
	var node = null;
	var m = this.config.searchMode;
	var sm = (this.config.selectMode == TopoTree.SL_SINGLE);

	if (typeof str == "undefined")
		return;
	if (str == "")
		return;

	var found = false;
	var n = (sm) ? this.iLastSearch : 0;
	if (n == this.nDatabaseNodes.length)
		n = this.iLastSeach = 0;

	str = str.toLocaleUpperCase();

	for (; n < this.nDatabaseNodes.length; n++) {
		node = this.nDatabaseNodes[n];
		if (node.dsc.toLocaleUpperCase().indexOf(str) != -1 && ((m == TopoTree.SM_DSC) || (m == TopoTree.SM_BOTH))) {
			node._setAncestorsExpanded();
			this._selectNodeInt(node.dbIndex, false);
			found = true;
		}
		/* 		if (node.ext.tip.toLocaleUpperCase().indexOf(str) != -1 && ((m == TopoTree.SM_META) || (m == TopoTree.SM_BOTH))) {
		node._setAncestorsExpanded();
		this._selectNodeInt(node.dbIndex, false);
		found = true;
		} */
		if (sm && found) {
			this.iLastSearch = n + 1;
			break;
		}
	}
	this.redraw();
}

TopoTree.prototype.selectAll = function () {
	if (this.config.selectMode != TopoTree.SL_MULTIPLE)
		return;
	this._selectAllInt(true);
}

TopoTree.prototype.unselectAll = function () {
	this._selectAllInt(false);
}

TopoTree.prototype.collapseAll = function () {
	this._collapseAllInt(true);
}

TopoTree.prototype.expandAll = function () {
	this._collapseAllInt(false);
}

TopoTree.prototype.collapseNode = function (nodeid, upd) {
	var dbindex = this.mapIDs[nodeid];
	this.nDatabaseNodes[dbindex].isCollapsed = !this.nDatabaseNodes[dbindex].isCollapsed;
	if (upd)
		this.redraw();
}

TopoTree.prototype.selectNode = function (nodeid, upd) {
	this._selectNodeInt(this.mapIDs[nodeid], true);
	if (upd)
		this.redraw();
}

TopoTree.prototype.setNodeTitle = function (nodeid, title, upd) {
	var dbindex = this.mapIDs[nodeid];
	this.nDatabaseNodes[dbindex].dsc = title;
	if (upd)
		this.redraw();
}

TopoTree.prototype.setNodeMetadata = function (nodeid, ext, upd) {
	var dbindex = this.mapIDs[nodeid];
	this.nDatabaseNodes[dbindex].ext = ext;
	if (upd)
		this.redraw();
}

TopoTree.prototype.setNodeUrl = function (nodeid, url, upd) {
	var dbindex = this.mapIDs[nodeid];
	this.nDatabaseNodes[dbindex].ext.url = url;
	if (upd)
		this.redraw();
}

TopoTree.prototype.setNodeColors = function (nodeid, color, border, upd) {
	var dbindex = this.mapIDs[nodeid];
	if (color)
		this.nDatabaseNodes[dbindex].ext.c = color;
	if (border)
		this.nDatabaseNodes[dbindex].ext.bc = border;
	if (upd)
		this.redraw();
}

TopoTree.prototype.getSelectedNodes = function () {
	var node = null;
	var selection = [];
	var selnode = null;

	for (var n = 0; n < this.nDatabaseNodes.length; n++) {
		node = this.nDatabaseNodes[n];
		if (node.isSelected) {
			selnode = {
				"id" : node.id,
				"dsc" : node.dsc,
				"ext" : node.ext
			}
			selection[selection.length] = selnode;
		}
	}
	return selection;
}

TopoTree.prototype.expandLevel = function (level) {
	var node = null;
	for (var n = 0; n < this.nDatabaseNodes.length; n++) {
		node = this.nDatabaseNodes[n];
		if (node.canCollapse && node._getLevel() < level) {
			node.isCollapsed = false;
		}
	}
	this.redraw();
}
