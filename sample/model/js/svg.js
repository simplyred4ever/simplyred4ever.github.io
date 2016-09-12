var $$ = (function () {

	function getUuid(len, radix) {
		// Private array of chars to use
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_'.split('')
		var uuid = [];
		var i;
		radix = radix || chars.length;

		if (len) {
			// Compact form
			for ( i = 0; i < len; i++) {
				uuid[i] = chars[0 | Math.random() * radix];
			}
		} else {
			// rfc4122, version 4 form
			var r;
			// rfc4122 requires these characters
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';

			// Fill in random data.  At i==19 set the high bits of clock sequence as
			// per rfc4122, sec. 4.1.5
			for ( i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
		}
		return uuid.join('');
	}

	/**
	 * 继承
	 *
	 * @param subClass
	 * @param superClass
	 */
	function extend(subClass, superClass) {
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
	 * 搜索指定id元素
	 */
	function $(elementId) {
		return document.documentElement.getElementById(elementId);
	}

	/**
	 * 搜索指定tagName的祖先节点
	 *
	 * @param node
	 * @param tagName
	 * @returns
	 */
	function parent(node, tagName) {
		p = node.parentNode;
		if (!p) {
			return null;
		} else if (p.nodeName == tagName) {
			return p;
		} else {
			return parent(p, tagName);
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
	function getByClass(searchClass, node, tag) {

		var classElements = [];
		var defaultTags = "a,circle,ellipse,g,image,line,path,polygon,polyline,rect,svg,text,use,symbol";

		node = node || document;
		tag = tag || defaultTags;
		var els;
		var elsLen;
		if (window.getSVGViewerVersion) {

			tagRegExp = new RegExp('(' + tag.replace(/,/g, ')|(') + ')', 'g');
			classRegExp = new RegExp('(\\s|^)' + searchClass + '(\\s|$)', 'g');

			var ei;
			els = node.childNodes();
			elsLen = els.length;
			for (var i = 0; i < elsLen; i++) {
				ei = els.item(i);
				if (ei.nodeType == 1 && ei.nodeName.match(tagRegExp) && ei.getAttribute("class") && ei.getAttribute("class").match(classRegExp)) {
					classElements.push(ei);
				}
				if (ei.childNodes().length > 0) {
					classElements = classElements.concat(getByClass(searchClass, ei, tag));
				}
			}
			return classElements;
		} else {

			var tags = tag.split(",");

			for (var t in tags) {
				els = node.getElementsByTagName(tags[t]);
				elsLen = els.length;
				for (i = 0; i < elsLen; i++) {
					try {
						if (hasClass(els.item(i), searchClass)) {
							classElements.push(els.item(i));
						}
					} catch (e) {}
				}
			}
			return classElements;

		}

	}

	/**
	 * 是否包含class
	 *
	 * @param ele
	 * @param cls
	 * @returns
	 */
	function hasClass(ele, cls) {
		if (!ele) {
			return;
		}
		if (ele.getAttribute("class") == null)
			return false;
		return ele.getAttribute("class").match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	}

	/**
	 * 是否数组?
	 *
	 * @param obj
	 * @returns {Boolean}
	 */
	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}
	
	/**
	 * “四舍五入”
	 * @param num
	 * @param unit
	 */
	function round (num, unit) {
		unit = unit || 10;
		return Math.round(num / unit) * unit;
	}

	/**
	 * 屏蔽事件
	 */
	function stop (evt) {
		evt = evt || window.event;
		if (evt.preventDefault) {
			evt.preventDefault();
		}
		evt.cancelBubble = true;
		evt.returnValue = false;
		return false;
	}
	
	//Constructor.
	var Interface = function (name, methods) {
		if (arguments.length != 2) {
			throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
		}
		this.name = name;
		this.methods = [];
		for (var i = 0, len = methods.length; i < len; i++) {
			if (typeof methods[i] !== 'string') {
				throw new Error("Interface constructor expects method names to be " + "passed in as a string.");
			}
			this.methods.push(methods[i]);
		}
	};

	// Static class method.
	Interface.ensureImplements = function (object) {
		if (arguments.length < 2) {
			throw new Error("Function Interface.ensureImplements called with " + arguments.length + "arguments, but expected at least 2.");
		}
		for (var i = 1, len = arguments.length; i < len; i++) {
			var interface = arguments[i];
			if (interface.constructor !== Interface) {
				throw new Error("Function Interface.ensureImplements expects arguments" + "two and above to be instances of Interface.");
			}
			for (var j = 0, methodsLen = interface.methods.length; j < methodsLen; j++) {
				var method = interface.methods[j];
				if (!object[method] || typeof object[method] !== 'function') {
					throw new Error("Function Interface.ensureImplements: object " + "does not implement the " + interface.name + " interface. Method " + method + " was not found.");
				}
			}
		}
	};

	var Drag = new Interface('Drag', ['drag', 'drop']);
	
	/**
	 * 元素
	 */
	var Element = function (id, parentNode, nodeName) {
		var temp = parentNode;
		if (!id) {
			alert('没有节点ID！'+ '[id:' + id+',parentNode:'+temp+',nodeName:'+nodeName+']');
			return;
		}
		if (typeof parentNode === 'string') {
			parentNode = $(parentNode);
		}
		if (!parentNode) {
			alert('没有父节点！' + '[id:' + id+',parentNode:'+temp+',nodeName:'+nodeName+']');
			return;
		}
		if (!nodeName) {
			alert('没有节点名称！'+ '[id:' + id+',parentNode:'+temp+',nodeName:'+nodeName+']');
			return;
		}
		this.NS = 'http://www.w3.org/2000/svg';
		var o = $(id);
		if (!o) {
			o = document.createElementNS(this.NS, nodeName);
			parentNode.appendChild(o);
		}
		this.id = id;
		this.self = o;
		this.attr('id', id);
	}

	/**
	 * 设置属性
	 */
	Element.prototype.attr = function (name, value) {
		if (typeof name === 'object') {
			for (var i in name) {
				this.attr(i, name[i]);
			}
			return this;
		} else if (arguments.length > 1) {
			this.self.setAttributeNS(null, name, value);
			return this;
		} else {
			return this.self.getAttributeNS(null, name);
		}
	}

	/**
	 * 设置样式
	 */
	Element.prototype.css = function (name, value) {
		if (typeof name === 'object') {
			for (var i in name) {
				this.css(i, name[i]);
			}
			return this;
		} else if (arguments.length > 1) {
			if (window.getSVGViewerVersion) {
				this.self.getStyle().setProperty(name, value);
			} else {
				var style = this.attr('style') || '';
				var arr = style.split(';');
				var newArr = [];
				for (var i in arr) {
					if (!arr[i].match(name)) {
						newArr.push(arr[i]);
					}
				}
				newArr.push(name + ':' + value);
				this.attr('style', newArr.join(';'));
			}
			return this;
		} else {
			if (window.getSVGViewerVersion) {
				return this.self.getStyle().getProperty(name);
			} else {
				var style = this.attr('style');
				var arr = style.split(';');
				for (var i in arr) {
					if (arr[i].match(name)) {
						return arr[i].replace(/^.*:/g, '');
					}
				}
				return null;
			}
		}
	}

	/**
	 * 判断存在样式类
	 */
	Element.prototype.hasClass = function (cls) {
		if (this.attr("class") == null)
			return false;
		return !!this.attr("class").match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	}

	/**
	 * 替换样式类
	 */
	Element.prototype.changeClass = function (clsOld, clsNew) {
		if (this.hasClass(clsOld)) {
			this.attr("class", this.attr("class").replace(new RegExp('(\\s|^)' + clsOld + '(\\s|$)'), " " + clsNew + " "));
		}
		return this;
	}
	/**
	 * 删除样式类
	 */
	Element.prototype.removeClass = function (cls) {
		if (this.hasClass(cls)) {
			this.attr("class", this.attr("class").replace(new RegExp('(\\s|^)' + cls + '(\\s|$)'), ''));
		}
		return this;
	}
	/**
	 * 添加样式类
	 */
	Element.prototype.addClass = function (cls) {
		if (!this.hasClass(cls)) {
			if (this.attr("class") != null) {
				this.attr("class", this.attr("class") + " " + cls);
			} else {
				this.attr("class", cls);
			}
		}
		return this;
	}

	/**
	 * 删除
	 */
	Element.prototype.remove = function () {
		this.self.parentNode.removeChild(this.self);
		return this;
	}
	/**
	 * 隐藏
	 */
	Element.prototype.hide = function () {
		this.attr('pointer-events', 'none');
		this.attr('display', 'none');
		return this;
	}
	/**
	 * 显示
	 */
	Element.prototype.show = function () {
		this.attr('pointer-events', 'all');
		this.attr('display', 'block');
		return this;
	}
	/**
	 * 位置
	 */
	Element.prototype.position = function (x, y) {
		if (arguments.length == 0) {
			return {
				x : +this.attr('x'),
				y : +this.attr('y')
			};
		} else {
			this.attr({
				x : x,
				y : y
			});
			return this;
		}
	}
	/**
	 * 兼容所有浏览器的getCTM方法，以IE的getCTM为标准
	 */
	Element.prototype.getCTM = function () {
		return window.getSVGViewerVersion ? {
			e : this.self.getCTM().e,
			f : this.self.getCTM().f
		}
		 : {
			e : (this.self.getCTM().e - this.self.parentNode.getCTM().e) / this.self.parentNode.getCTM().a,
			f : (this.self.getCTM().f - this.self.parentNode.getCTM().f) / this.self.parentNode.getCTM().d
		}
	}
	/**
	 * 兼容所有浏览器的getCTM方法，以Chrome的getCTM为标准
	 */
	Element.prototype.getScreenCTM = function (rootId) {
		if (window.getSVGViewerVersion) {
			var ele = this.self.parentNode;
			var e = 0;
			var f = 0;
			while (ele.id != rootId && ele != document.documentElement) {
				e += ele.getCTM().e;
				f += ele.getCTM().f;
				ele = ele.parentNode;
			}
			return {
				e : e,
				f : f
			};
		} else {
			return {
				e : this.self.getCTM().e,
				f : this.self.getCTM().f
			};
		}
	}

	/**
	 * 层
	 * @extends Element
	 */
	var Group = function (id, p) {
		Group.superClass.constructor.call(this, id, p, 'g');
	}
	extend(Group, Element);
	/**
	 * 位置
	 */
	Group.prototype.position = function (x, y) {
		if (arguments.length == 0) {
			return {
				x : this.self.getCTM().e,
				y : this.self.getCTM().f
			};
		} else {
			this.attr('transform', 'translate(' + x + ',' + y + ')');
			return this;
		}
	}
	/**
	 *  文字
	 * @extends Element
	 */
	var Text = function (id, p) {
		Text.superClass.constructor.call(this, id, p, 'text');
		this.attr('pointer-events', 'all');
	}
	extend(Text, Element);

	Text.prototype.text = function (str, num, ellipsis) {
		if (arguments.length > 0) {
			ellipsis = ellipsis || "...";
			num = num || 10;
			str = str + "";
			var subStr = str;
			var dotflag = false;
			if (subStr.replace(/[^\x00-\xff]/g, '**').length > num) {
				while (subStr.replace(/[^\x00-\xff]/g, '**').length > num - 2) {
					subStr = subStr.substring(0, subStr.length - 1);
					dotflag = true;
				}
				subStr = subStr + (dotflag ? ellipsis : "");
			}
			if (this.self.firstChild) {
				this.self.firstChild.data = subStr;
			} else {
				this.self.appendChild(document.createTextNode(subStr));
			}
			return this;
		} else {
			if (this.self.firstChild) {
				return this.self.firstChild.data;
			} else {
				return null;
			}
		}
	}
	Text.prototype.size = function () {
		alert('没有此方法[Text.size]');
		return this;
	}
	/**
	 * 方框
	 * @extends Element
	 */
	var Rect = function (id, p) {
		Rect.superClass.constructor.call(this, id, p, 'rect');
	}
	extend(Rect, Element);
	/**
	 * 设置宽高
	 */
	Rect.prototype.bound = function (x, y, width, height) {
		if (arguments.length == 0) {
			return {
				x : +this.attr('x'),
				y : +this.attr('y'),
				width : +this.attr('width'),
				height : +this.attr('height')
			}
		} else {
			this.attr({
				x : x,
				y : y,
				width : width,
				height : height
			});
			return this;
		}
	}
	/**
	 * 设置宽高
	 */
	Rect.prototype.size = function (width, height) {
		if (arguments.length == 0) {
			return {
				width : +this.attr('width'),
				height : +this.attr('height')
			}
		} else {
			width = $$.round(width);
			height = $$.round(height);
			this.attr({
				width : width,
				height : height
			});
			return this;
		}
	}
	var Image = function (id, p) {
		Image.superClass.constructor.call(this, id, p, 'image');
	}
	extend(Image, Element);
	Image.prototype.change = function (url) {
		if (url) {
			this.self.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url);
		} else {
			alert('没有图片路径！');
		}
		return this;
	}
	Image.prototype.bound = Rect.prototype.bound;
	/**
	 * 引用
	 * @extends Element
	 */
	var Use = function (id, p) {
		Use.superClass.constructor.call(this, id, p, 'use');
	}
	extend(Use, Element);
	/**
	 * 变更引用对象ID
	 */
	Use.prototype.change = function (id) {
		if ($(id)) {
			this.self.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
		} else {
			alert('没有' + id + '图片元素！');
		}
		return this;
	}
	Use.prototype.bound = Rect.prototype.bound;
	/**
	 * 连线
	 * @extends Element
	 */
	var Line = function (id, p) {
		Line.superClass.constructor.call(this, id, p, 'line');
	}
	extend(Line, Element);
	/**
	 * 位置
	 * @param {Object} xy
	 */
	Line.prototype.position = function (xy) {
		if (arguments.length > 0) {
			// xy = {x1:x1,y1:y1,x2:x2,y2:y2}
			this.attr(xy);
			return this;
		} else {
			return {
				x1 : this.attr('x1'),
				x2 : this.attr('x2'),
				y1 : this.attr('y1'),
				y2 : this.attr('y2')
			};
		}
	}
	/**
	 * 圆
	 * @extends Element
	 * @param {Object} id
	 * @param {Object} p
	 */
	var Circle = function (id, p) {
		Circle.superClass.constructor.call(this, id, p, 'circle');
	}
	extend(Circle, Element);

	/**
	 * 边界
	 */
	Circle.prototype.bound = function (x, y, width, height) {
		if (arguments.length == 0) {
			return {
				x : this.attr('cx') - this.attr('r'),
				y : this.attr('cy') - this.attr('r'),
				width : this.attr('r') * 2,
				height : this.attr('r') * 2
			};
		} else {
			this.attr({
				cx : +x + width / 2,
				cy : +y + height / 2,
				r : width
			});
		}
	}
	/**
	 * 椭圆
	 * @extends Element
	 * @param {Object} id
	 * @param {Object} p
	 */
	var Ellipse = function (id, p) {
		Ellipse.superClass.constructor.call(this, id, p, 'ellipse');
	}
	extend(Ellipse, Element);
	/**
	 * 边界
	 */
	Ellipse.prototype.bound = function (x, y, width, height) {
		if (arguments.length == 0) {
			return {
				x : this.attr('cx') - this.attr('rx'),
				y : this.attr('cy') - this.attr('ry'),
				width : this.attr('rx') * 2,
				height : this.attr('ry') * 2
			}
		} else {
			this.attr({
				cx : x + width / 2,
				cy : y + height / 2,
				rx : width / 2,
				ry : height / 2
			});
			return this;
		}
	}
	/**
	 * SVG元素
	 * @extends Element
	 */
	var Svg = function (id, p) {
		Svg.superClass.constructor.call(this, id, p, 'svg');
	}
	extend(Svg, Element);
	/**
	 * 设置视口
	 * @param {Object} x
	 * @param {Object} y
	 * @param {Object} width
	 * @param {Object} height
	 */
	Svg.prototype.viewBox = function (x, y, width, height) {
		if (arguments.length > 0) {
			this.attr('viewBox', [x, y, width, height].join(' '));
			return this;
		} else {
			var arr = this.attr('viewBox');
			if (!arr) {
				return null;
			}
			arr = arr.split(' ');
			if (arr.length == 0) {
				return null;
			}
			return {
				x : arr[0],
				y : arr[1],
				width : arr[2],
				height : arr[3]
			};
		}
	}
	Svg.prototype.bound = Rect.prototype.bound;
	/**
	 * Path元素
	 * @extends Element
	 */
	var Path = function (id, p) {
		Path.superClass.constructor.call(this, id, p, 'path');
		//M250 150 L300 150 L300 350 L450 350
		this.attr('pointer-events', 'stroke');
	}
	extend(Path, Element);
	/**
	 * 路径
	 */
	Path.prototype.setPath = function (points) {
		var d = '';
		for (var i in points) {
			d += (i == 0 ? 'M' : 'L') + points[i].x + ',' + points[i].y + ' ';
		}
		this.attr('d', d);
		return this;
	}
	/**
	 * Polygon元素
	 * @extends Element
	 */
	var Polygon = function (id, p) {
		Polygon.superClass.constructor.call(this, id, p, 'polygon');
	}
	extend(Polygon, Element);

	/**
	 * 设置点
	 */
	Polygon.prototype.setPoints = function (points) {
		var d = '';
		if (typeof points === 'string') {
			d = points;
		} else {
			for (var i in points) {
				d += points[i].x + ',' + points[i].y + ' ';
			}
		}
		this.attr('points', d);
		return this;
	}

	/**
	 * 六边形
	 * @extends Polygon
	 */
	var Hexagon = function (id, p) {
		Hexagon.superClass.constructor.call(this, id, p, 'polygon');
	}
	extend(Hexagon, Polygon);
	/**
	 * 边界
	 */
	Hexagon.prototype.bound = function (x, y, width, height) {
		if (arguments.length > 0) {
			this.setPoints([{
						x : x + height / 4,
						y : y
					}, {
						x : x,
						y : y + height / 2
					}, {
						x : x + height / 4,
						y : y + height
					}, {
						x : x + width - height / 4,
						y : y + height
					}, {
						x : x + width,
						y : y + height / 2
					}, {
						x : x + width - height / 4,
						y : y
					}
				]);
			return this;
		} else {
			var box = this.self.getBBox();
			return {
				x : box.x,
				y : box.y,
				width : box.width,
				height : box.height
			};
		}
	}

	/**
	 * 五边形
	 * @extends Polygon
	 */
	var Pentagon = function (id, p) {
		Pentagon.superClass.constructor.call(this, id, p, 'polygon');
	}
	extend(Pentagon, Polygon);
	/**
	 * 边界
	 */
	Pentagon.prototype.bound = function (x, y, width, height) {
		if (arguments.length > 0) {
			this.setPoints([{
						x : x,
						y : y
					}, {
						x : x,
						y : y + height
					}, {
						x : x + width - height / 4,
						y : y + height
					}, {
						x : x + width,
						y : y + height / 2
					}, {
						x : x + width - height / 4,
						y : y
					}
				]);
			return this;
		} else {
			var box = this.self.getBBox();
			return {
				x : box.x,
				y : box.y,
				width : box.width,
				height : box.height
			};
		}
	}

	/**
	 * Polyline元素
	 * @extends Element
	 */
	var Polyline = function (id, p) {
		Polyline.superClass.constructor.call(this, id, p, 'polyline');
		this.points = [];
		this.attr('pointer-events', 'stroke');
	}
	extend(Polyline, Element);
	/**
	 * 设置转折点
	 */
	Polyline.prototype.setPoints = function (points) {
		var d = '';
		if (typeof points === 'string') {
			d = points;
		} else {
			for (var i in points) {
				d += points[i].x + ',' + points[i].y + ' ';
			}
		}
		this.points = points;
		this.attr('points', d);
		return this;
	}

	/**
	 * 判断触发事件的点在哪两个点之间，返回第一个点的索引号
	 */
	Polyline.prototype.checkIn = function (x, y) {
		var w = 3; // 触发距离
		var x1;
		var x2;
		var y1;
		var y2;
		var A;
		var B;
		var C;
		var d;
		for (var i = 0; i <= this.points.length; i++) {
			if (i === 0) {
				continue;
			}
			x1 = this.points[i - 1].x;
			x2 = this.points[i].x;
			y1 = this.points[i - 1].y;
			y2 = this.points[i].y;
			//点到直线距离公式A*x+B*y+C=0
			A = y1 - y2;
			B = x2 - x1;
			C = x1 * y2 - y1 * x2;
			d = 1000;
			if (x1 === x2) {
				d = x - x1;
				if (Math.abs(d) < w) {
					if ((y1 <= y && y <= y2) || (y1 >= y && y >= y2)) {
						return i;
					}
				}
			} else if (y1 === y2) {
				d = y - y1;
				if (Math.abs(d) < w) {
					if ((x1 <= x && x <= x2) || (x1 >= x && x >= x2)) {
						return i;
					}
				}
			} else {
				d = (A * x + B * y + C) / Math.sqrt(A * A + B * B);
				if (Math.abs(d) < w) {
					if ((x1 <= x && x <= x2 || x1 >= x && x >= x2) 
						&& (y1 <= y && y <= y2 || y1 >= y && y >= y2)) {
						return i;
					}
				}
			}
		}
		return 1;
	}

	/**
	 * A元素
	 * @extends Element
	 */
	var A = function (id, href, isNew, p) {
		A.superClass.constructor.call(this, id, p, 'a');
		//M250 150 L300 150 L300 350 L450 350
		this.attr({
			id : id,
			"xlink:href" : href,
			"target" : isNew ? "new" : ""
		});
	}
	extend(A, Element);
	/**
	 * Marker元素
	 * @extends Element
	 */
	var Marker = function (id, p) {
		Marker.superClass.constructor.call(this, id, p, 'marker');
		this.attr({
			id : id,
			viewBox : "0 0 10 10",
			refX : "10",
			refY : "5",
			markerUnits : "strokeWidth",
			markerWidth : "3",
			markerHeight : "5",
			orient : "auto"
		});
	}
	extend(Marker, Element);

	/**
	 * 颜色
	 */
	Marker.prototype.color = function (color) {
		this.path = new Path(id + 'path', [], '', this.self);
		this.path.attr({
			d : "M0,0 L10,5 L0,10 z",
			fill : color,
			stroke : color
		});
		return this;
	}

	return {
		Group : Group,
		Line : Line,
		Marker : Marker,
		A : A,
		Path : Path,
		Text : Text,
		Rect : Rect,
		Image : Image,
		Use : Use,
		Svg : Svg,
		Circle : Circle,
		Ellipse : Ellipse,
		Polygon : Polygon,
		Polyline : Polyline,
		Pentagon : Pentagon,
		Hexagon : Hexagon,
		$ : $,
		getByClass : getByClass,
		hasClass : hasClass,
		extend : extend,
		getUuid : getUuid,
		round : round,
		stop : stop,
		Interface : Interface,
		Drag : Drag
	}

})();
