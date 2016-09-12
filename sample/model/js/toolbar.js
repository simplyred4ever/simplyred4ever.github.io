var AllToolbarItem = {
	all : {},
	add : function (item) {
		this.all[item.name] = item;
		return this;
	},
	get : function (name) {
		return this.all[name];
	},
	remove : function (item) {
		this.all[item.name].group.remove();
		delete this.all[item.name];
		return this;
	}
};
/**
 * 工具栏对象
 */
function ToolbarItem(id, x, y, text) {
	this.id = id;
	this.name = text;
	this.group = new $$.Group(id, 'toolbarGroup').position(x, y);
	this.bg = new $$.Rect(id + 'bg', this.group.self).bound(0, 0, 40, 40).addClass('toolbarBg');
	this.text = new $$.Text(id + 'txt', this.group.self).position(20, 38).addClass('text').text(text);
	/*	this.group.self.appendChild($$.$(icon))
	this.icon = new $$[shape](icon, this.group.self).position(0, 0).addClass('toolbar');*/
	AllToolbarItem.add(this);
}

(function toolbar($$) {
	var HEIGHT = 50;
	var y = 0;
	var item;
	// 工具栏
	item = new ToolbarItem($$.getUuid(), 0, y, '选择');
	item.group.addClass('SelectMode');
	//item.icon = new $$.Polygon(item.id + 'icon', item.group.self).setPoints('16,14 17,25 20,23 22,26 23,25 21,22 24,21').addClass('toolbar');
	item.icon = new $$.Image(item.id + 'icon', item.group.self).change('../img/select.png').bound(8, 4, 24, 22).addClass('toolbar');
	y += HEIGHT;

	item = new ToolbarItem($$.getUuid(), 0, y, '人员');
	//item.icon = new $$.Ellipse(item.id + 'icon', item.group.self).bound(10, 8, 20, 18).addClass('toolbar DragToolbarIcon ActorNode');
	item.icon = new $$.Image(item.id + 'icon', item.group.self).change('../img/people.png').bound(8, 4, 24, 22).addClass('toolbar DragToolbarIcon ActorNode');
	y += HEIGHT;

	item = new ToolbarItem($$.getUuid(), 0, y, '系统');
	//item.icon = new $$.Rect(item.id + 'icon', item.group.self).bound(10, 10, 20, 16).addClass('toolbar DragToolbarIcon SystemNode');
	item.icon = new $$.Image(item.id + 'icon', item.group.self).change('../img/system.png').bound(8, 4, 24, 22).addClass('toolbar DragToolbarIcon SystemNode');
	y += HEIGHT;

	item = new ToolbarItem($$.getUuid(), 0, y, '组织');
	//item.icon = new $$.Polygon(item.id + 'icon', item.group.self).setPoints('14,10 10,18 14,26 26,26 30,18 26,10').addClass('toolbar DragToolbarIcon OrganizationNode');
	item.icon = new $$.Image(item.id + 'icon', item.group.self).change('../img/organization.png').bound(8, 4, 24, 22).addClass('toolbar DragToolbarIcon OrganizationNode');
	y += HEIGHT;

	item = new ToolbarItem($$.getUuid(), 0, y, '服务');
	//item.icon = new $$.Polygon(item.id + 'icon', item.group.self).setPoints('10,10 10,26 26,26 30,18 26,10').addClass('toolbar DragToolbarIcon ServiceNode');
	item.icon = new $$.Image(item.id + 'icon', item.group.self).change('../img/service.png').bound(8, 4, 24, 22).addClass('toolbar DragToolbarIcon ServiceNode');
	y += HEIGHT;

	item = new ToolbarItem($$.getUuid(), 0, y, '资源流');
	item.group.addClass('LineMode');
	//item.icon = new $$.Polygon(item.id + 'icon', item.group.self).setPoints('10,16 25,16 25,12 30,19 25,26 25,22 10,22').addClass('toolbar');
	item.icon = new $$.Image(item.id + 'icon', item.group.self).change('../img/resource_flow.png').bound(8, 4, 24, 22).addClass('toolbar');
})($$);

function MenuList(id, x, y, items) {
	this.group = new $$.Group(id, 'toolbarGroup').position(x, y).hide();
	new $$.Rect(id + 'r', this.group.self).bound(0, 0, 150, 20 * items.length).css({
		'fill' : '#F1F1F1',
		'stroke-width' : 1,
		'stroke' : '#979797'
	});
	for (var i in items) {
		new MenuItem(items[i].id, this.group.self, 0, 20 * i, items[i].title, items[i].action);
	}
}

function MenuItem(id, p, x, y, title, action) {
	new $$.Rect(id, p).bound(x, y, 150, 20).attr('onmousedown', action).css({
		'fill' : '#F1F1F1',
		'filter' : 'url(#f1)',
		'cursor' : 'pointer'
	});
	new $$.Text(id + 'txt', p).position(x + 70, y + 14).text(title).attr('onmousedown', action).addClass('text').css('fill', 'black').css('pointer-events', 'none');
}

Model.menuNode = new MenuList('menuNodeGroup', 0, 0, [{
				id : 'menuItemBottom',
				p : 'menuNodeGroup',
				x : 0,
				y : 0,
				title : '移动到底层',
				action : 'Model.moveBottom()'
			}, {
				id : 'menuItemTop',
				p : 'menuNodeGroup',
				x : 0,
				y : 20,
				title : '移动到顶层',
				action : 'Model.moveTop()'
			}, {
				id : 'menuItemEditNode',
				p : 'menuNodeGroup',
				x : 0,
				y : 40,
				title : '编辑属性',
				action : 'Model.editNode()'
			}
		]);

Model.menuLine = new MenuList('menuLineGroup', 0, 0, [{
				id : 'menuItemAddPoint',
				p : 'menuLineGroup',
				x : 0,
				y : 0,
				title : '添加转折点',
				action : 'Model.addPoint()'
			}, {
				id : 'menuItemEditLine',
				p : 'menuLineGroup',
				x : 0,
				y : 20,
				title : '编辑属性',
				action : 'Model.editLine()'
			}
		]);

Model.menuPoint = new MenuList('menuPointGroup', 0, 0, [{
				id : 'menuItemRemovePoint',
				p : 'menuPointGroup',
				x : 0,
				y : 0,
				title : '删除转折点',
				action : 'Model.removePoint()'
			}
		]);
