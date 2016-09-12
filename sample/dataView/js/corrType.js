var corrType;
/**
 *	关联类型
 */
function CorrType(typeArray, colorArray) {
	var paddingL = 10;
	this.lineColor = {};
	this.typeArray = typeArray;
	var height = window.innerHeight;
	var width = window.innerWidth;
	this.width = 186;
	this.height = typeArray.length * 20 + 20;
	this.group = new $$.Group("type_g", document.documentElement).position(width - this.width, height - 10 - this.height).addClass('DragCorrType');
	this.rect =  new $$.Rect("type_rect", this.group.self).bound(0, 0, this.width, this.height).addClass('typeFill');
	this.text =  new $$.Text("type_title", this.group.self).position(paddingL, 20).text("关联类型").addClass('text');

	for(var i = 0; i < this.typeArray.length; i++){
		this.lineColor[this.typeArray[i]] = colorArray[i % 10];
		new CorrType.TypeLine('typeLine' + i, this.group.self, typeArray[i], colorArray[i % 10], i);
	}
	this.setFilter(typeArray.join(','));
}

CorrType.prototype.color = function (type) {
	return this.lineColor[type];
}

CorrType.prototype.getType = function () {
	return this.typeArray;
}

CorrType.prototype.setFilter = function (filter) {
	this.filter = filter;
}

CorrType.prototype.getFilter = function (type) {
	return this.filter && !!this.filter.match(type);
}
/**
 *	线对象
 */
CorrType.TypeLine = function (id, p, name, color, index){
	this.id = id;
	this.name = name;
	this.color = color;
	var paddingL = 5;
	var lineHeight = 20;
	var lineWidth = 100;
	var xy = {
		x1 : paddingL + lineHeight / 2,
		y1 : lineHeight * index + 30,
		x2 : lineWidth + lineHeight / 2,
		y2 : lineHeight * index + 30
	};

	new $$.Marker('arrow_' + this.color, $$.$('lineNeed')).color(this.color);

	this.line = new $$.Line(this.id, p).position(xy).addClass('line')
	.attr('fill', this.color).attr('stroke', this.color).attr('marker-end', 'url(#arrow_' + this.color + ')')
	.css('fill', this.color).css('stroke', this.color).css('marker-end', 'url(#arrow_' + this.color + ')');

	this.text =  new $$.Text(this.id + 'text', p).position(xy.x2+20, xy.y2+3).text(this.name).addClass('text');
}

CorrType.DragCorrType = function (evt) {
	$$.Interface.ensureImplements(this, $$.Drag);
	this.target = evt.target.parentNode;
	this.x = evt.clientX;
	this.y = evt.clientY;
	var position = corrType.group.position();
	this.tx = position.x;
	this.ty = position.y;
}

CorrType.DragCorrType.prototype = {
	drag : function (evt) {
		var x = evt.clientX - this.x + this.tx;
		var y = evt.clientY - this.y + this.ty;
		x = Math.min(window.innerWidth - corrType.width, Math.max(0, x));
		y = Math.min(window.innerHeight - 10 - corrType.height, Math.max(0, y));
		corrType.group.position(x, y);
	},
	drop : function () {
		window.dragTarget = null;
	}
};
