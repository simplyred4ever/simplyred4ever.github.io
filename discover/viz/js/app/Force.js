define(['jquery', 'd3', 'crossfilter', 'cola', 'jsx!react/ReactUtil', 'bootstrap-contextmenu'], 
		function ($, d3, crossfilter, cola, ReactUtil) {

	function Force(elementId, graph, config) {
		var self = this;
		this.elementId = elementId;
		this.color = d3.scale.category20();
		this.config = {
			node : {
				id : function (d) {
					return [elementId, 'node', d.id].join('_');
				},
				r : function (d) {
					return Math.max(6, Math.min(20, d.weight || (d.inDegree + d.outDegree) || 0));
				},
				fill : function (d) {
					return self.color(d.group);
				},
				stroke : function (d) {
					return d3.rgb(self.color(d.group)).darker();
				},
				strokeWidth : 2,
				opacity : 1,
				classObject : {
					'node' : 'true'
				}
			},
			edge : {
				id : function (d) {
					return [elementId, 'edge', d.id].join('_');
				},
				strokeWidth : function (d) {
					return d.weight || 1;
				},
				classObject : {
					'link' : 'true'
				},
				isCurve : false,
				hasDirection : true
			},
			nodeLabel : {
				id : function (d) {
					return [elementId, 'edge', d.id].join('_');
				},
				classObject : {
					'node-label' : 'true'
				},
				stroke : 'gray',
				strokeWidth : 1,
				fontSize : function (d) {
					return 6 + Math.sqrt((d.inDegree + d.outDegree) || 0);
				},
				text : function (d) {
					return d.name;
				},
				title : function (d) {
					return '';
				},
				display : true
			},
			event : {
				dragstart : null,
				drag : null,
				dragend : null,
				mouseover : null,
				mouseout : null,
				mousedown : null,
				mainClick : null,
				zoom : null
			},
			layout : {
				width : 600,
				height : 600,
				type : 'd3.force',
				charge : -120,
				linkDistance : 120,
				zoomMin : 0.25,
				zoomMax : 4
			},
			type : 'all',
			highlightId : -1 
		};
		

		// 覆盖配置项
		// 页面类型
		this.config.type = config.type || this.config.type;
		// 节点
		if (config.node) {
			this.config.node.id = config.node.id || this.config.node.id;
			this.config.node.r = config.node.r || this.config.node.r;
			this.config.node.fill = config.node.fill || this.config.node.fill;
			this.config.node.stroke = config.node.stroke || this.config.node.stroke;
			this.config.node.strokeWidth = config.node.strokeWidth || this.config.node.strokeWidth;
			this.config.node.opacity = config.node.opacity || this.config.node.opacity;
			this.config.node.classObject = config.node.classObject || this.config.node.classObject;
		}
		// 边
		if (config.edge) {
			this.config.edge.id = config.edge.id || this.config.edge.id;
			this.config.edge.stroke = config.edge.stroke || this.config.edge.stroke;
			this.config.edge.strokeWidth = config.edge.strokeWidth || this.config.edge.strokeWidth;
			this.config.edge.classObject = config.edge.classObject || this.config.edge.classObject;
			this.config.edge.isCurve = config.edge.isCurve !== undefined ? config.edge.isCurve : this.config.edge.isCurve;
			this.config.edge.hasDirection = config.edge.hasDirection !== undefined ? config.edge.hasDirection : this.config.edge.hasDirection;
		}
		// 节点文字
		if (config.nodeLabel) {
			this.config.nodeLabel.id = config.nodeLabel.id || this.config.nodeLabel.id;
			this.config.nodeLabel.text = config.nodeLabel.text || this.config.nodeLabel.text;
			this.config.nodeLabel.stroke = config.nodeLabel.stroke || this.config.nodeLabel.stroke;
			this.config.nodeLabel.strokeWidth = config.nodeLabel.strokeWidth || this.config.nodeLabel.strokeWidth;
			this.config.nodeLabel.fontSize = config.nodeLabel.fontSize || this.config.nodeLabel.fontSize;
			this.config.nodeLabel.classObject = config.nodeLabel.classObject || this.config.nodeLabel.classObject;
			this.config.nodeLabel.display = config.nodeLabel.display !== undefined ? config.nodeLabel.display : this.config.nodeLabel.display;
		}
		// 图布局
		if (config.layout) {
			this.config.layout.width = config.layout.width || this.config.layout.width;
			this.config.layout.height = config.layout.height || this.config.layout.height;
			this.config.layout.type = config.layout.type || this.config.layout.type;
			this.config.layout.charge = config.layout.charge || this.config.layout.charge;
			this.config.layout.linkDistance = config.layout.linkDistance || this.config.layout.linkDistance;
			this.config.layout.zoomMin = config.layout.zoomMin || this.config.layout.zoomMin;
			this.config.layout.zoomMax = config.layout.zoomMax || this.config.layout.zoomMax;
		}
		// 高亮显示
		this.config.highlightId = config.highlightId || this.config.highlightId;
		this.svg = null;
		this.force = null;
		this.node = null;
		this.edge = null;
		this.nodeLabel = null;
		this.drawGraph(graph);
		ReactUtil.setSettingBox(null, 'setting');
	}

	// 绘图
	Force.prototype.drawGraph = function (graph) {
		var self = this;

		graph.edges = graph.edges || [];

		self.linked = {};
		graph.edges.forEach(function (d) {
			d.from = graph.nodes[d.source].id;
			d.to = graph.nodes[d.target].id;
			self.linked[d.from + ',' + d.to] = true;
		});
		graph.nodes.forEach(function (d) {
			d.width = 30;
			d.height = 10;
			d.color = self.config.node.fill(d);
			self.linked[d.id + ',' + d.id] = true;
		});
		d3.select('#' + self.elementId + '>svg').remove();

		self.svg = d3.select('#' + self.elementId)
			.style('width', self.config.layout.width + 'px')
			.style('height', self.config.layout.height + 'px')
			.append('svg')
			.attr('width', self.config.layout.width)
			.attr('height', self.config.layout.height)
			.attr('viewBox', '0 0 ' + self.config.layout.width + ' ' + self.config.layout.height)
			.attr('preserveAspectRatio', 'xMidYMid meet')
			.call(d3.behavior.zoom().scaleExtent([self.config.layout.zoomMin, self.config.layout.zoomMax])
				.center(null).on('zoom', function zoom() {
					if (self.dragging) {
						return;
					}
					self.translate = d3.event.translate;
					self.scale = d3.event.scale;
					self.svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
				})).on("dblclick.zoom", null).append('g')
				.style('cursor', 'move');

		// 连线的箭头和滤镜
		d3.select('#' + self.elementId + '>svg').append('defs').html([
				'<defs><marker id="end-arrow" viewBox="0 -5 10 10" refX="0" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,-5L10,0L0,5" fill="#999" opacity="1"></path>',
				'</marker><marker id="end-arrow-red" viewBox="0 -5 10 10" refX="0" markerWidth="5" markerHeight="5" orient="auto">',
				'<path d="M0,-5L10,0L0,5" fill="red" opacity="1"></path></marker><filter id="Gaussian_Blur" x="-0.1" y="-0.1" height="400%" width="400%">',
				'<feOffset result="offOut" in="SourceAlpha" dx="1" dy="1"></feOffset><feGaussianBlur result="blurOut" in="offOut" stdDeviation="1"></feGaussianBlur>',
				'<feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend></filter></defs>'].join(''));

		if (self.config.layout.type == 'd3.force' || graph.nodes.length > 300) {
			self.force = d3.layout.force().charge(self.config.layout.charge).linkDistance(self.config.layout.linkDistance)
				.linkStrength(1).gravity(0.05).size([self.config.layout.width, self.config.layout.height])
				.nodes(graph.nodes).links(graph.edges).start();
		} else if (self.config.layout.type == 'cola.force') {
			self.force = cola.d3adaptor().avoidOverlaps(true).size([self.config.layout.width, self.config.layout.height])
				.linkDistance(self.config.layout.linkDistance)
				.nodes(graph.nodes).links(graph.edges).start(10, 15, 20);
		}

		self.edge = self.svg.selectAll('.link').data(graph.edges).enter().append('path')
			.classed(self.config.edge.classObject)
			.attr('id', self.config.edge.id)
			.style('stroke', function(d) {
				return d.source.color;
			}).style('stroke-width', self.config.edge.strokeWidth)
			.style('marker-mid', self.config.edge.hasDirection ? 'url(#end-arrow)' : '');
		
		if (!self.config.edge.hasDirection) {
			self.edge.append('title').text(function(d) {
				return d.weight || 1;
			});
		}

		self.node = self.svg.selectAll('.node').data(graph.nodes).enter().append('circle')
			.classed(self.config.node.classObject)
			.attr('id', self.config.node.id)
			.attr('r', self.config.node.r)
			.style('fill', self.config.node.fill)
			.style('stroke', self.config.node.stroke)
			.call(self.force.drag()
				.on('dragstart', function (d, i) {
					self.dragging = true;
					event.stopPropagation();
				}).on('dragend', function (d, i) {
					self.dragging = false;
				}).on('drag', function (d, i) {
					self.dragging = true;
				})).on('mouseover', function (d) {
					if (!self.dragging) {
						self.connectedNodes(d);
					}
					//d3.event.stopPropagation();
				}).on('mouseout', function (d) {
					if (!self.dragging) {
						self.connectedNodes(null);
					}
					
				}).on('dblclick', function (d) {
					if (self.config.highlightId != d.id) {
						if (self.config.type == 'instance') {
							window.changeInstance(d.id);
						} else if (self.config.type == 'adjacent') {
							window.adjacentGraph(d.id);
						}
					}
				}).on('click', function (d) {
					self.nodeClicked(d);
					d3.event.stopPropagation();
				});

		self.nodeLabel = self.svg.append('g').selectAll('.node-label').data(self.force.nodes()).enter().append('text')
			.attr('id', self.config.nodeLabel.id)
			.attr('dy', '.31em')
			.attr('dx', function(d) {return self.config.node.r(d) + 4})
			.style('font-size', self.config.nodeLabel.fontSize)
			.classed(self.config.nodeLabel.classObject)
			.style('display', function(d) {
				return self.config.nodeLabel.display ? 'block' : 'none';
			}).text(self.config.nodeLabel.text);

		self.force.on('tick', function () {

			self.edge.attr("d", function (d) {

				if (self.config.edge.isCurve) {

					var sqrt3 = 1.7320508075688772;
					var dx = d.target.x - d.source.x,
					dy = d.target.y - d.source.y,
					dr = Math.sqrt(dx * dx + dy * dy),
					mx = (d.target.x + d.source.x) / 2,
					my = (d.target.y + d.source.y) / 2,
					len = dr - ((dr / 2) * sqrt3),
					dir = 2;
					mx += (dir - 1) * dy * len / dr;
					my +=  - (dir - 1) * dx * len / dr;
					return ["M", d.source.x, d.source.y, "A", dr, dr,
						0, 0,
						dir / 2, mx, my, "A", dr, dr, 0, 0, dir / 2,
						d.target.x,
						d.target.y].join(" ");
				} else {

					return ["M", d.source.x, d.source.y, "L", (d.source.x + d.target.x) / 2,
						(d.source.y + d.target.y) / 2, "L", d.target.x, d.target.y].join(" ");
				}
			});

			self.node.attr('cx', function (d) {
				return d.x;
			}).attr('cy', function (d) {
				return d.y;
			});

			self.nodeLabel.attr('x', function (d) {
				return d.x;
			}).attr('y', function (d) {
				return d.y;
			});
		});
		// 默认选中
		if (self.config.highlightId != -1) {
			self.nodeClicked(self.config.highlightId);
		} else if (self.force.nodes()[0]){
			self.nodeClicked(self.force.nodes()[0].id);
		}
	}

	Force.prototype.connectedNodes = function (d) {
		var self = this;
		if (d != null) {
			// Reduce the opacity of all but the neighbouring nodes
//			this.node.attr('filter', function (o) {
//				return self.neighboring(d, o) | self.neighboring(o, d) ? 'url(#Gaussian_Blur)' : '';
//			});
			this.node.style('opacity', function (o) {
				return self.neighboring(d, o) | self.neighboring(o, d) ? 1 : 0.1;
			});
			if (!self.config.nodeLabel.display) {
				this.nodeLabel.style('display', function (o) {
					return d == o ? 'block' : 'none';
				});
			}
			this.nodeLabel.style('opacity', function (o) {
				return self.neighboring(d, o) | self.neighboring(o, d) ? 1 : 0;
			});
			this.edge.style('opacity', function (o) {
				return d.id == o.from | d.id == o.to ? 1 : 0.05;
			});
		} else {
//			this.node.attr('filter', '');
			this.node.style('opacity', 1);
			this.edge.style('opacity', 1);
			this.nodeLabel.style('opacity', 1);
			if (!self.config.nodeLabel.display) {
				this.nodeLabel.style('display', 'none');
			}
		}
	};
	Force.prototype.nodeClicked = function (d) {
		if (typeof d == 'string') {
			var n = this.force.nodes().filter(function(v) {
				return v.id == d;
			});
			if (!n || n.length == 0) {
				return;
			} else {
				d = n[0];
			}
		}
		
		// Mark selected node
		if (this.highlightId != d.id) {
			this.showNodeInfo(d);
			this.showMdsInfo(d);
			this.toggleSelected(this.highlightId, false);
			this.highlightId = d.id;
			this.toggleSelected(this.highlightId, true);
			//this.node.select('.selected');
		/*} else {
			// removeNodeInfo();
			this.toggleSelected(this.highlightId, false);
			this.highlightId = -1;*/
		}
	};

	Force.prototype.removeNodeInfo = function () {
		ReactUtil.setPropBox(null, 'propTab');
	};

	Force.prototype.showNodeInfo = function (d) {
		var n = [];
		var io = [];
		var inner = [];
		var outer = [];
		var category = [];
		var self = this;

		n.push({
			key : '名称',
			value : d.name
		});
		for (var i in d.attrs) {
			n.push({
				key : d.attrs[i].attrName,
				value : d.attrs[i].attrValue
			});
		}

		if (this.config.type == 'all') {

			d3.json('/discover/rest/network/getNodesByCategorys/' + d.id + '/0.discover', function (error,
					data) {
				if (data && data.nodes) {
					data.nodes.forEach(function (v, i) {
						io.push({
							id : v.id,
							name : v.name,
							onclick : 'changeInstance',
							color : self.brightness(d.color),
							link: true
						});
					});
				}
				self.force.nodes().filter(function (o) {
					return self.neighboring(d, o) && d != o;
				}).forEach(function (v, i) {
					inner.push({
						id : v.id,
						name : v.name,
						onclick : 'changeNode',
						color : self.brightness(v.color)
					});
				});
				self.force.nodes().filter(function (o) {
					return self.neighboring(o, d) && d != o;
				}).forEach(function (v, i) {
					outer.push({
						id : v.id,
						name : v.name,
						onclick : 'changeNode',
						color : self.brightness(v.color)
					});
				});
				ReactUtil.setPropBox([{
							name : '',
							list : n
						}, {
							name : '图信息',
							list : [{
									key : '入度',
									value : d.inDegree
								}, {
									key : '出度',
									value : d.outDegree
								}
							]
						}, {
							name : '上位',
							list : outer
						}, {
							name : '下位',
							list : inner
						}, {
							name : '实例',
							list : io
						}
					], 'propTab');

			});
		} else if (d && d.id) {
			d3.json('/discover/rest/network/getCategoryByNodeId/' + d.id + '.discover', function (error, data) {
				if (data) {
					category.push({
						id : data.categoryId,
						name : data.categoryName,
						onclick : 'fullGraph',
						link : true
					});
					
					if (self.config.type == 'instance') {

						self.force.nodes().filter(function (o) {
							return self.neighboring(d, o) && d != o;
						}).forEach(function (v, i) {
							inner.push({
								id : v.id,
								name : v.name,
								onclick : 'changeNode',
								color : self.brightness(v.color)
							});
						});
						self.force.nodes().filter(function (o) {
							return self.neighboring(o, d) && d != o;
						}).forEach(function (v, i) {
							outer.push({
								id : v.id,
								name : v.name,
								onclick : 'changeNode',
								color : self.brightness(v.color)
							});
						});
						ReactUtil.setPropBox([{
									name : '',
									list : n
								}, {
									name : '图信息',
									list : [{
											key : '入度',
											value : d.inDegree
										}, {
											key : '出度',
											value : d.outDegree
										}
									]
								}, {
									name : '上位',
									list : outer
								}, {
									name : '下位',
									list : inner
								}, {
									name : '概念',
									list : category
								}
							], 'propTab');

					} else if (self.config.type == 'adjacent') {

						self.force.nodes().filter(function (o) {
							return (self.neighboring(d, o) || self.neighboring(o, d)) && d != o;
						}).forEach(function (v, i) {
							io.push({
								id : v.id,
								name : v.name,
								onclick : 'changeNode',
								color : self.brightness(v.color)
							});
						});

						ReactUtil.setPropBox([{
									name : '',
									list : n
								}, {
									name : '相关',
									list : io
								}, {
									name : '概念',
									list : category
								}
							], 'propTab');

					}
				}
			});

		}
		
		$('#myTab a:first').tab('show');

	};
	
	Force.prototype.removeMdsInfo = function () {
		ReactUtil.setCheckLabelBox(null, 'mdsBox');
	};
	
	Force.prototype.showMdsInfo = function (d) {
		var self = this;
		if (d.id == '1211' && d.name == '构造单元') {
			ReactUtil.setCheckLabelBox({checkLabel:[{id:'1', name:'构造类型'}, {id:'2', name:'构造级别'},{id:'3', name:'上级构造'}],classObj:[{id:d.id, name:d.name, onclick:'mdsGraph'}]}, 'mdsBox');
		} else if (d.id == '1243' && d.name == '国家') {
			ReactUtil.setCheckLabelBox({checkLabel:[{id:'1', name:'矿权区'}, {id:'2', name:'国土面积'}],classObj:[{id:d.id, name:d.name, onclick:'mdsGraph'}]}, 'mdsBox');
		} else if (d.id == '41' && d.name == '盆地') {
			ReactUtil.setCheckLabelBox({checkLabel:[{id:'1', name:'油气田类型'}, {id:'2', name:'油气藏类型'}, {id:'3', name:'井型'}, {id:'4', name:'井别'}, 
			{id:'5', name:'构造单元'}, {id:'6', name:'地层'}, {id:'7', name:'圈闭类型'}, {id:'8', name:'盆地类型'}],classObj:[{id:d.id, name:d.name, onclick:'mdsGraph'}]}, 'mdsBox');
		} else if (d && d.id) {
			d3.json('/discover/rest/network/getCategoryByNodeId/' + d.id + '.discover', function (error, data) {
				if (data) {
					self.showMdsInfo({
						id : data.categoryId,
						name : data.categoryName
					});
				} else {
					self.removeMdsInfo();
				}
			});
		}
	};

	Force.prototype.toggleSelected = function (i, b) {
		this.node.filter(function (n) {
			return n.id == i;
		}).classed('selected', b);
		this.nodeLabel.filter(function (n) {
			return n.id == i;
		}).classed('selected', b);
	};

	Force.prototype.neighboring = function (a, b) {
		return this.linked[a.id + ',' + b.id];
	};

	Force.prototype.brightness = function (color) {
		var rgb = d3.rgb(color);
		var value = rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
		return value < 128 ? ['#fff', color] : ['#000', color];
	};
	/**
	 * 
	 * @param id
	 * @param duration 动画时间
	 */
	Force.prototype.setAnimation = function (id,duration){
		var d = {};
		if (typeof id == 'string') {
			var n = this.force.nodes().filter(function(v) {
				return v.id == id;
			});
			if (!n || n.length == 0) {
				return;
			} else {
				d = n[0];
			}
		}
		var str = "";
		var scale = this.scale;
		if(scale){
			if(scale == 1){
				str = -(d.x-(this.config.layout.width/2))+" "+(-(d.y-(this.config.layout.height/2)));
			}else {
				str = (-((d.x*scale)-((this.config.layout.width/2)*scale)))+" "+(-((d.y*scale)-((this.config.layout.height/2)*scale)));
			}
		}
		this.svg.transition().duration(duration).attr('transform', 'translate(' + this.translate + ')scale(' + this.scale + ')').attr('transform', 'translate(' + str + ')scale(' + this.scale + ')');
	};
	
	return Force;
});
