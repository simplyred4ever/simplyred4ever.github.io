var toolTip;
function ToolTip() {
	this.group = new $$.Group('tip2016', document.documentElement).hide();
	this.rect = new $$.Rect('tipRect2016', this.group.self).attr({
			x : 0,
			y : 0,
			height : 18,
			width : 100
		}).css({
			'fill-opacity' : 1,
			fill : '#ffc',
			stroke : "rgb(9,0,130)",
			'stroke-width' : 1,
			'shape-rendering' : 'crispEdges',
			'pointer-events' : 'none'
		});
	this.text = new $$.Text('tipText2016', this.group.self).attr({
			x : 0,
			y : 0,
			dy : 2.5
		}).addClass('text').css({
			fill : '#515151',
			'text-anchor' : 'start',
			'font-size' : 16
		});
}

ToolTip.prototype.show = function (evt) {
	var object = evt.target;
	var msg = object.getAttribute("title");
	if (!msg || msg.length == 0) {
		return;
	}

	if (this.group.self.getAttribute('display') != 'none') {
		return;
	}
	
	this.text.text(msg, 300);
	
	var h = window.innerHeight - 30;
	var w = window.innerWidth;
	var l = this.text.self.getComputedTextLength();
	if (l === 0) {
		l = msg.replace(/[^\x00-\xff]/g, '**').length * 7.5;
	}
	var x = (w - evt.clientX < l + 10) ? w - l - 10 : evt.clientX + 5;
	var y = (h - evt.clientY < 20) ? h - 20 : evt.clientY + 12;
	
	this.text.position(x, y);
	this.rect.bound(x - 5, y - 12, l + 10, 18);
	this.group.show();
}

ToolTip.prototype.hide = function () {
	this.group.hide();
}
