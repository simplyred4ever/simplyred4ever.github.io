var aerialView = {};
/**
 * 缩放图
 * @param {Object} id
 * @param {Object} mainPanel
 * @param {Object} workspace
 * @param {Object} size
 * @param {Object} dWidth
 * @param {Object} dHeight
 */
function AerialView(id, mainPanel, workspace, size, dWidth, dHeight) {
	this.id = id;
	this.width = 200;
	this.height = 200;
	this.mainPanel = mainPanel;
	this.size = size;
	this.vSize = size;
	this.name = '';
	this.maxRate = 2;
	this.minRate = 0.5;
	this.closeGroup = new $$.Group(this.id + 'CloseGroup', document.documentElement).position(0, 1);
	this.group = new $$.Group(this.id, document.documentElement).position(0, 0);
	this.viewBg = new $$.Rect(this.id + 'ViewBg', this.group.self).bound(0, 0, 200, 200).addClass('aerialViewBg');
	this.view = new $$.Rect(this.id + 'View', this.group.self).bound(0, 0, this.width, this.height).addClass('aerialViewFg');
	this.view.self.addEventListener('click', AerialView.clickView, false);
	this.svg = new $$.Svg(this.id + 'Svg', this.group.self).viewBox(0, 0, this.width, this.height);
	var ws = [];
	if (workspace.id) {
		ws = [workspace];
	} else {
		ws = workspace;
	}
	for (var i = 0; i < ws.length; i++) {
		new $$.Use(this.id + 'Ws' + i, this.svg.self).position(0, 0).change(ws[i].id);
	}

	this.redBox = new $$.Rect(this.id + 'RedBox', this.svg.self).bound(0, 0, 0, 0).addClass('redBox');
	this.redBox.attr('pointer-events', 'all');

	this._z = 1;
	this.left = 0;
	this.top = 0;
	this.dWidth = dWidth;
	this.dHeight = dHeight;
	this.resize().open();
}

AerialView.prototype = {
	/**
	 * 绘制
	 */
	draw : function(center, vWidth, vHeight) {
		if (vWidth && vHeight) {			
			var vSize = Math.max(vWidth, vHeight);
			if (vSize > 0) {
				this.vWidth = vWidth;
				this.vHeight = vHeight;
				this.vSize = vSize;
			}
		}
		//showMsg(this.svg.self.getAttribute('viewBox'))
		// 边界处理
		var mWidth = +this.mainPanel.getAttribute('width') - this.dWidth * 2;
		var mHeight = +this.mainPanel.getAttribute('height');
		var cx, cy;
		if (center === true || center === 'redBoxCenter') {
			cx = +this.redBox.self.getAttribute('x') + this.redBox.self.getAttribute('width') / 2;
			cy = +this.redBox.self.getAttribute('y') + this.redBox.self.getAttribute('height') / 2;
			this.left = cx - mWidth / this._z / 2;
			this.top = cy - mHeight / this._z / 2;
		} else if (center === 'screenCenter') {
			cx = +this.size / 2;
			cy = +this.size / 2;
			this.left = cx - mWidth / this._z / 2;
			this.top = cy - mHeight / this._z / 2;
		}
		if (this.left + mWidth / this._z > this.size) {
			this.left = this.size - mWidth / this._z;
		}
		if (this.left < 0) {
			this.left = 0;
		}
		if (this.top + mHeight / this._z > this.size) {
			this.top = this.size - mHeight / this._z;
		}
		if (this.top < 0) {
			this.top = 0;
		}

		// 红框
		this.redBox.bound(this.left, this.top, mWidth / this._z, mHeight / this._z);
		this.redBox.attr('stroke-width', 6 * this.vSize / 1000);
		this.svg.bound(0, 0, this.width, this.height).viewBox((this.size - this.vSize) / 2, (this.size - this.vSize) / 2, this.vSize, this.vSize);
		// 全局布局
		this.mainPanel.setAttribute('viewBox', [this.left, this.top, mWidth / this._z, mHeight / this._z].join(' '));
		return this;
	},
	/**
	 * Svg窗口尺寸变更
	 */
	resize : function(id) {
		this.setWindowWidthHeight(id);
		this.draw();
		return this;
	},
	/**
	 * 布局
	 * @param {Object} x
	 * @param {Object} y
	 */
	position : function(x, y) {
		this.group.position(x, y);
		this.closeGroup.position(x, y);
		return this;
	},
	/**
	 * 打开
	 */
	open : function() {
		this.group.show();
		this.closeGroup.hide();
		this.setWindowWidthHeight();
		return this;
	},
	/**
	 * 关闭
	 */
	close : function() {
		this.group.hide();
		this.closeGroup.show();
		this.setWindowWidthHeight();
		return this;
	},
	/**
	 * 设置窗体
	 */
	setWindowWidthHeight : function(id) {
		var parentObj = parent.document.getElementById('embedObjDiv'); 

		if (id) {
			try {
				// 同步svg页面的宽高
				if (Math.abs(parent.document.body.offsetHeight - parentObj.offsetHeight) > 10 || Math.abs(parent.document.body.offsetWidth - parentObj.offsetWidth) > 10) {
					parentObj.style.width = parent.document.body.offsetWidth;
					parentObj.style.height = parent.document.body.offsetHeight;
				}
			} catch(ex) {

			}
		}
		var cw = parentObj.offsetWidth + this.dWidth;
		var ch = parentObj.offsetHeight + this.dHeight;
		this.mainPanel.setAttribute('width', cw);
		this.mainPanel.setAttribute('height', ch);

		if (this.isOpen()) {
			this.position(cw - 203 - this.dWidth, 1);
		} else {
			this.position(cw - 203 - this.dWidth, 1);
		}
		return this;
	},
	/**
	 * 打开状态
	 */
	isOpen : function() {
		return this.group.self.getAttribute('display') != 'none';
	},
	/**
	 * 点击视窗
	 */
	clickView : function(evt) {
		this.left = (evt.clientX - this.group.getCTM().e - this.view.self.getAttribute('x')) * this.size / this.width;
		this.top = (evt.clientY - this.group.getCTM().f - this.view.self.getAttribute('y')) * this.size / this.height;
		this.draw();
	},
	/**
	 * 放大
	 */
	zoomIn : function() {
		if (this._z * 1.15 >= this.maxRate) {
			this._z = this.maxRate;
		} else {
			this._z *= 1.15;
		}
		this.draw();
	},
	/**
	 * 缩小
	 */
	zoomOut : function() {
		if (this._z * 0.85 <= this.minRate) {
			this._z = this.minRate;
		} else {
			this._z *= 0.85;
		}
		this.draw();
	},
	/**
	 * 恢复100%
	 */
	zoomTo : function(num) {
		this._z = num;
		this.draw();
	}
};

/**
 * 面板的拖动
 * @param {Object} evt
 */
AerialView.DragMainPanel = function (evt) {
	$$.Interface.ensureImplements(this, $$.Drag);
	this.clientX = evt.clientX;
	this.clientY = evt.clientY;
	this.viewBox = aerialView.mainPanel.getAttribute('viewBox').split(' ');
};

AerialView.DragMainPanel.prototype = {
	drag : function (evt) {
		//面板真实移动的距离
		aerialView.left = (this.clientX - evt.clientX) / aerialView._z + 1 * this.viewBox[0];
		aerialView.top = (this.clientY - evt.clientY) / aerialView._z + 1 * this.viewBox[1];
		aerialView.draw();
	},
	drop : function () {
		window.dragTarget = null;
	}
};

/**
 *  缩略图中的视口的拖动
 */
AerialView.DragMiniViewBox = function (evt) {
	$$.Interface.ensureImplements(this, $$.Drag);
	this.clientX = evt.clientX;
	this.clientY = evt.clientY;
	this.viewBox = aerialView.mainPanel.getAttribute('viewBox').split(' ');
};

AerialView.DragMiniViewBox.prototype = {
	drag : function (evt) {
		//面板真实移动的距离
		aerialView.left = (evt.clientX - this.clientX) * aerialView.vSize / aerialView.width + 1 * this.viewBox[0];
		aerialView.top = (evt.clientY - this.clientY) * aerialView.vSize / aerialView.height + 1 * this.viewBox[1];
		aerialView.draw();
	},
	drop : function () {
		//aerialView.draw();
		window.dragTarget = null;
	}
};

/**
 * 鼠标滚轮的相关操作
 * @param {Object} delta
 * @param {Object} ctrl
 */
function mouseWheel(delta, ctrl) {
	if (!ctrl) {
		if (delta > 0) {
			aerialView.top -=  150 / aerialView._z;
		} else {
			aerialView.top += 150 / aerialView._z;
		}
		aerialView.draw();
	} else {
		if (delta > 0) {
			aerialView.zoomIn();
		} else {
			aerialView.zoomOut();
		}
	}
}