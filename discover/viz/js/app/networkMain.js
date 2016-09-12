(function() {
	require.config({
		// js目录
		baseUrl : '/discover/viz/js',
		// 路径映射
		paths : {
			bootstrap : 'bootstrap.min',
			d3 : 'd3.v3',
			crossfilter : 'crossfilter.min',
			cola : 'cola.v3.min',
			Force : 'app/Force',
			'jquery-ui' : 'jquery-ui.min',
			React : 'react/react-with-addons.min',
			JSXTransformer : 'react/JSXTransformer',
			jsx : 'react/jsx',
			text : 'react/text',
			html5shiv : '//cdn.bootcss.com/html5shiv/3.7.2/html5shiv.min.js',
			'html5shiv-printshiv' : '//cdn.bootcss.com/html5shiv/3.7.2/html5shiv-printshiv.min.js',
			'es5-shim' : '//cdn.bootcss.com/es5-shim/4.5.9/es5-shim.js',
			'es5-sham' : '//cdn.bootcss.com/es5-shim/4.5.9/es5-sham.js',
			'respond' : '//cdn.bootcss.com/respond.js/1.4.2/respond.min.js'
		},
		// 依赖/输出
		shim : {
			'jquery-ui' : ['jquery'],
			bootstrap : {
				deps : ['jquery']
			},
			'bootstrap-contextmenu' : ['bootstrap', 'jquery-ui'],
			crossfilter : {
				deps : [],
				exports : 'crossfilter'
			},
			cola : {
				deps : ['d3'],
				exports : 'cola'
			}
		},
		jsx: {
		    fileExtension: '.jsx',
		    harmony: true,
		    stripTypes: true
		}
	});

	// 不需要使用的全局参数放在后面（'bootstrap-contextmenu'）
	require(['jquery', 'd3', 'crossfilter', 'cola', 'jsx!react/ReactUtil', 'bootstrap-contextmenu'],
			function($, d3, crossfilter, cola, ReactUtil) {
		// -----------------------右键菜单栏
		$('#myTab a').click(function(e) {
			e.preventDefault()
			$(this).tab('show')
		});

		var myMenu = $('#container').contextmenu({
			target : '#context-menu',
			before : function(e, element, target) {
				e.preventDefault();
				if (e.target.nodeName != 'circle') {
					e.preventDefault();
					this.closemenu();
					return false;
				}
				clkNode(e);
				return true;
			}
		});

		// ------------------------绘图
		var nfilter = crossfilter();
		var efilter = crossfilter();
		var nodesDegDim = null;
		var ndegVal = 1;
		var windowWidth = $(window, parent).width() - 320;
		var windowHeight = $(window, parent).height()
		var mode = {
			all : {
				width : windowWidth,
				height : windowHeight,
				labelVisibility : false,
				nodeRadius : 6,
				charge : -120,
				linkDistance : 120
			},
			child : {
				width : windowWidth,
				height : windowHeight,
				labelVisibility : false,
				nodeRadius : 10,
				charge : -120,
				linkDistance : 120
			},
			adjacent : {
				width : windowWidth,
				height : windowHeight,
				labelVisibility : false,
				nodeRadius : 10,
				charge : -120,
				linkDistance : 120,
				undirected : true
			}
		}
		var currentMode = mode.all;
		var color = d3.scale.category20();
		var svg = null;
		var force = null;
		var node = null;
		var link = null;
		var text = null;
		var linked = null;
		var dragging = false;
		var searching = false;
		var highlightId = -1;

		// 主图
		window.fullGraph = function fullGraph() {
			currentMode = mode.all;
			d3.select('#container>svg').remove();
			//d3.json('/discover/rest/networkTemp/getData.discover', drawGraph);
			d3.json('/discover/data/miserables.json', drawGraph);

		}
		window.fullGraph();

		// 绘图
		function drawGraph(error, graph) {
			if (!graph || !graph.nodes || graph.nodes.length == 0) {
				alert('没有数据！');
			}

			svg = d3.select('#container').append('svg').attr('width', currentMode.width).attr('height', currentMode.height).attr('viewBox', '0 0 ' + currentMode.width + ' ' + currentMode.height)
					.attr('preserveAspectRatio', 'xMidYMid meet').on('click', function() {
						toggleSelected(highlightId, false);
						connectedNodes(null);
						highlightId = -1;
						//removeNodeInfo();
						d3.event.stopPropagation();
						try {
							myMenu.closemenu();
						} catch (ex) {
						}
					}).call(d3.behavior.zoom().scaleExtent([0.25, 4]).on('zoom', function zoom() {
						if (dragging) {
							return;
						}
						svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
					})).append('g').attr('style', 'cursor:move');

			// 连线的箭头和滤镜
			d3.select('#container>svg').append('defs').html(
					['<defs><marker id="end-arrow" viewBox="0 -5 10 10" refX="0" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,-5L10,0L0,5" fill="#999" opacity="1"></path>',
							'</marker><marker id="end-arrow-red" viewBox="0 -5 10 10" refX="0" markerWidth="5" markerHeight="5" orient="auto">',
							'<path d="M0,-5L10,0L0,5" fill="red" opacity="1"></path></marker><filter id="Gaussian_Blur" x="-0.1" y="-0.1" height="400%" width="400%">',
							'<feOffset result="offOut" in="SourceAlpha" dx="1" dy="1"></feOffset><feGaussianBlur result="blurOut" in="offOut" stdDeviation="1"></feGaussianBlur>',
							'<feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend></filter><filter xmlns="http://www.w3.org/2000/svg" id="MyFilter">',
							'<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/><feOffset in="blur" dx="4" dy="4" result="offsetBlur"/>',
							'<feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="10" lighting-color="white" result="specOut">',
							'	<fePointLight x="-5000" y="-10000" z="20000"/></feSpecularLighting><feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>',
							'<feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/><feMerge>	<feMergeNode in="offsetBlur"/>',
							'	<feMergeNode in="litPaint"/></feMerge></filter></defs>'].join(''));

			linked = {};
			graph.nodes.forEach(function(d) {
				d.id = d.id || d.name;
			});
			graph.edges.forEach(function(d) {
				d.from = graph.nodes[d.source].id;
				d.to = graph.nodes[d.target].id;
				linked[d.from + ',' + d.to] = true;
			});
			graph.nodes.forEach(function(d) {
				d.r = currentMode.nodeRadius + Math.sqrt(d.outDegree || 0)
				d.height = d.width = 2 * d.r;
				d.color = color(d.group);
				linked[d.id + ',' + d.id] = true;
			});
			nfilter.remove();
			nfilter.add(graph.nodes);
			nodesDegDim = nfilter.dimension(function(d) {
				return +d.inDegree + 1 * d.outDegree;
			});
			efilter.remove();
			efilter.add(graph.edges);

			if (graph.nodes.length > 200) {
				force = d3.layout.force().charge(function(d) {
					return d.outDegree > 1 ? currentMode.charge * 1.5 : currentMode.charge / 2;
				}).linkDistance(function(d) {
					return d.outDegree > 1 ? currentMode.linkDistance * 1.5 : currentMode.linkDistance / 2;
				}).linkStrength(0.5).size([currentMode.width, currentMode.height]).nodes(graph.nodes)
				.links(graph.edges).start().alpha(0.05).theta(.4);
			} else {
				force = cola.d3adaptor().avoidOverlaps(true).size([currentMode.width, currentMode.height])
				.linkDistance(function(d) {
					return d.outDegree > 1 ? currentMode.linkDistance : currentMode.linkDistance / 2;
				}).nodes(graph.nodes).links(graph.edges).start(10, 15, 20).alpha(0.01);
			}

			link = svg.selectAll('.link').data(graph.edges).enter().append('path').classed('link', true).attr('id', function(d) {
				return 'link' + d.source.id + d.target.id;
			}).attr('stroke-width', function(d) {
				return 1;//d.weight | 1;
			}).attr('stroke', function(d) {
				return d3.rgb(d.source.color);
			}).attr('marker-mid', currentMode.undirected ? '' : 'url(#end-arrow)');

			node = svg.selectAll('.node').data(graph.nodes).enter().append('circle').classed('node', true).attr('id', function(d) {
				return 'node' + d.id;
			}).attr('r', function(d) {
				return d.r;
			}).attr('fill', function(d) {
				return d.color;
			}).call(force.drag().on("dragstart", function(d, i) {
				dragging = true;
			}).on("dragend", function(d, i) {
				dragging = false;
			}).on("drag", function(d, i) {
				dragging = true;
			})).on('mouseover', function(d) {
				if (!dragging && !searching) {
					connectedNodes(d);
				}
			}).on('mouseout', function(d) {
				if (!dragging && !searching) {
					connectedNodes(null);
				}
			}).on('mousedown', function(d) {
				if (d3.event.defaultPrevented)
					return;
				clicker(d, this);
				clkNode(d3.event);
				searching = false;
				d3.event.stopPropagation();
			});

			/*
			 * node.append('title').text(function(d) { return d.name; });
			 */

			text = svg.append('g').selectAll('text').data(force.nodes()).enter().append('text').attr('id', function(d) {
				return 'text' + d.id;
			}).attr('dx', function(d) {
				return d.r + 2;
			}).attr('dy', '.31em').style('font-size', function(d) {
				return 6 + Math.sqrt(d.outDegree);
			}).classed(currentMode === mode.all ? {
				'node-label' : true
			} : {
				'node-label' : true,
				'node-label-child' : true
			}).style('opacity', function(d) {
				if (currentMode === mode.all) {
					return (d.inDegree + d.outDegree) > 2 ? 1 : 0;
				} else {
					return 1;
				}
			}).text(function(d) {
				return d.name;
			});

			force.on('tick', function() {
				/*
				 * link.attr("d", function(d) { // 计算节点之间连线，考虑两端的半径
				 * if(currentMode.undirected) { return 'M' + d.source.x + ',' +
				 * d.source.y + 'L' + d.target.x + ',' + d.target.y; } else {
				 * var deltaX = d.target.x - d.source.x, deltaY = d.target.y -
				 * d.source.y, dist = Math.sqrt(deltaX * deltaX + deltaY *
				 * deltaY), normX = deltaX / dist, normY = deltaY / dist,
				 * sourcePadding = currentMode.nodeRadius, targetPadding =
				 * currentMode.nodeRadius + 4, sourceX = d.source.x +
				 * (sourcePadding * normX), sourceY = d.source.y +
				 * (sourcePadding * normY), targetX = d.target.x -
				 * (targetPadding * normX), targetY = d.target.y -
				 * (targetPadding * normY); return 'M' + sourceX + ',' + sourceY +
				 * 'L' + targetX + ',' + targetY; } });
				 */
				link.attr("d", function(d) {
					// 不考虑半径时
					return ["M", d.source.x, d.source.y, "L", (d.source.x + d.target.x) / 2, (d.source.y + d.target.y) / 2, "L", d.target.x, d.target.y].join(" ");
				});

				node.attr('cx', function(d) {
					return d.x;
				}).attr('cy', function(d) {
					return d.y;
				});

				text.attr('x', function(d) {
					return d.x;
				}).attr('y', function(d) {
					return d.y;
				});
			});
			nodeClicked(force.nodes()[0]);
		}

		function connectedNodes(d) {
			if (d != null) {
				// Reduce the opacity of all but the neighbouring nodes
//				node.attr('filter', function(o) {
//					return neighboring(d, o) | neighboring(o, d) ? 'url(#Gaussian_Blur)' : '';
//				});
				node.style('opacity', function(o) {
					return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
				});
				text.style('opacity', function(o) {
					return neighboring(d, o) | neighboring(o, d) ? 1 : 0;
				});
				link.style('opacity', function(o) {
					return d.id == o.from | d.id == o.to ? 1 : 0.05;
				});
			} else {
//				node.attr('filter', '');
				node.style('opacity', 1);
				link.style('opacity', 1);
				text.style('opacity', function(d) {
					if (currentMode === mode.all) {
						return (d.inDegree + d.outDegree) > 2 ? 1 : 0;
					} else {
						return 1;
					}
				});
			}
		}

		window.filterNDeg = function filterNDeg(ndeg) {
			ndegVal = ndeg;
			$('#ndeglabel').val(ndeg);
			cfilter(ndegVal);
		}

		function neighboring(a, b) {
			return linked[a.id + ',' + b.id];
		}

		// 点击节点
		window.clkNode = function clkNode(evt) {
			if (evt.target.nodeName == 'circle') {

				if (evt.ctrlKey) {
					$('#toNode').val($('#' + evt.target.id.replace('node', 'text')).text());
					$('#toId').val(evt.target.id.replace('node', ''));
				} else {
					$('#fromNode, #rootNode').val($('#' + evt.target.id.replace('node', 'text')).text());
					$('#fromId').val(evt.target.id.replace('node', ''));
					d3.selectAll('.node.selected').classed('selected', false);
				}
				d3.select(evt.target).classed('selected', true);
			}
		}

		// 最短路径
		window.shortPath = function shortPath(type) {
			// 通过名称找id
			var fromTo = force.nodes().filter(function(val) {
				return val.id === $('#fromId').val() || val.id === $('#toId').val();
			});
			if (fromTo.length === 2) {
				d3.json('/discover/rest/networkTemp/shortPath/' + type + '/' + fromTo[0].id + '/' + fromTo[1].id + '.discover', function(error, lines) {
					d3.selectAll('.link-active').classed('link-active', false);

					lines.forEach(function(l) {
						d3.select('#link' + l).classed('link-active', true);
					});
				});
			} else {
				alert('请选择两个合适的节点！当前选中' + fromTo.length + '个。')
			}

		}

		// 导航
		window.childGraph = function childGraph() {
			var n = force.nodes().filter(function(val) {
				return val.name === $('#rootNode').val();
			});

			if (n.length === 0)
				return;
			d3.select('#container>svg').remove();
			currentMode = mode.child;
			d3.json('/discover/rest/networkTemp/relation/queryChildRelationsToJson/' + n[0].id + '/-1.discover', drawGraph);
		}

		// 相似相邻
		window.adjacentGraph = function adjacentGraph() {
			var n = force.nodes().filter(function(val) {
				return val.name === $('#rootNode').val();
			});

			if (n.length === 0)
				return;
			d3.select('#container>svg').remove();
			currentMode = mode.adjacent;
			d3.json('/discover/rest/networkTemp/relation/querySimilarGraphInfo/' + n[0].id + '.discover', drawGraph);
		}

		// 聚类图
		window.cluster = function cluster(type) {
			currentMode = mode.all;
			d3.select('#container>svg').remove();
			var methods = {
				'kmean' : 'kmean/10/20',
				'weakComponent' : 'weakComponent',
				'bicomponent' : 'bicomponent',
				'edgeBetweenness' : 'edgeBetweenness/10',
				'community' : 'queryCommunityModularity'
			};

			d3.json('/discover/rest/networkTemp/cluster/' + methods[type] + '.discover', drawGraph);
		}

		dblclick_timer = false;
		function clicker(d, elem) {
			if (dblclick_timer) {
				clearTimeout(dblclick_timer);
				dblclick_timer = false;
				// nodeDblClicked(d, elem);
			} else
				dblclick_timer = setTimeout(function() {
					dblclick_timer = false;
					nodeClicked(d);
				}, 200);
		};

		function nodeClicked(d) {
			// Mark selected node
			if (highlightId != d.id) {
				showNodeInfo(d);
				toggleSelected(highlightId, false);
				highlightId = d.id;
				toggleSelected(highlightId, true);
			} else {
				//removeNodeInfo();
				toggleSelected(highlightId, false);
				highlightId = -1;
			}
		}

		function removeNodeInfo() {
			ReactUtil.setPropBox(null, 'propTab');
		}

		function showNodeInfo(d) {
			var n = [];
			n.push({
				key : '名称',
				value : d.name
			});
			for ( var i in d.attrs) {
				n.push({
					key : d.attrs[i].attrName,
					value : d.attrs[i].attrValue
				});
			}
			if (currentMode == mode.all || currentMode == mode.child) {
				var inner = [];
				force.nodes().filter(function(o) {
					return neighboring(d, o) && d != o;
				}).forEach(function(d, i) {
					inner.push({
						id : d.id,
						name : d.name,
						onclick : 'changeNode',
						color : brightness(d.color)
					});
				});
				var outer = [];
				force.nodes().filter(function(o) {
					return neighboring(o, d) && d != o;
				}).forEach(function(d, i) {
					outer.push({
						id : d.id,
						name : d.name,
						onclick : 'changeNode',
						color : brightness(d.color)
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
					}]
				}, {
					name : '包含关系',
					list : inner
				}, {
					name : '所属关系',
					list : outer
				}], 'propTab');
			} else {
				var io = [];
				force.nodes().filter(function(o) {
					return (neighboring(o, d) || neighboring(d, o)) && d != o;
				}).forEach(function(d, i) {
					io.push({
						id : d.id,
						name : d.name,
						onclick : 'changeNode',
						color : brightness(d.color)
					});
				});
				ReactUtil.setPropBox([{
					name : '',
					list : n
				}, {
					name : '相似相邻',
					list : io
				}], 'propTab');
			}
		}

		function toggleSelected(i, b) {
			node.filter(function(n) {
				return n.id == i;
			}).select('circle').classed('selected', b);
		}

		window.searchNode = function searchNode(name) {
			name = name || $('#rootNode').val();
			var n = force.nodes().filter(function(d) {
				return d.name.indexOf(name) != -1;
			});

			if (n.length > 0) {
				node.style('opacity', function(o) {
					var v = 0.1, d;
					for ( var i in n) {
						d = n[i];
						if (d == o) {
							v = 1;
						}
					}
					return v;
				});
				text.style('opacity', function(o) {
					var v = 0.1, d;
					for ( var i in n) {
						d = n[i];
						if (d == o) {
							v = 1;
						}
					}
					return v;
				});
				link.style('opacity', function(o) {
					return 0.05;
				});
				searching = true;
			}

		}

		window.changeNode = function changeNode(id) {
			if (id.target) {
				id = id.target.id.replace('changeNode', '');
			}
			name = name || $('#rootNode').val();
			var n = force.nodes().filter(function(d) {
				return d.id === id;
			});

			if (n.length > 0) {
				nodeClicked(n[0]);
				connectedNodes(n[0]);
				$('#rootNode').val($('#text' + n[0].id).text());
				d3.selectAll('.node.selected').classed('selected', false);
				d3.select('#node' + n[0].id).classed('selected', true);
			}

		}

		function cfilter(ndeg) {
			ndeg = ndeg | 1;
			// Nodes
			nodesDegDim.filter([ndeg, Infinity]);
			var n = nodesDegDim.top(Infinity);
			nodeIds = d3.set(n.map(function(d) {
				return d.id;
			}));

			// Edges
			var edgesConDim = efilter.dimension(function(d) {
				return nodeIds.has(d.from) && nodeIds.has(d.to);
			});
			edgesConDim.filter(function(d) {
				return d;
			});
			var e = edgesConDim.top(Infinity);
			edgesConDim.dispose();

			// Filter unconnected nodes
			var fromIds = e.map(function(d) {
				return d.from;
			});
			var toIds = e.map(function(d) {
				return d.to;
			});
			var edgeIds = d3.set(fromIds.concat(toIds));
			var ncon = nfilter.dimension(function(d) {
				return edgeIds.has(d.id);
			});
			ncon.filter(function(d) {
				return d;
			});
			n = ncon.top(Infinity);
			ncon.dispose();

			node.style("display", function(d) {
				if (!nodeIds.has(d.id))
					return 'none';
				else
					return 'block';
			});
			text.style("display", function(d) {
				if (!nodeIds.has(d.id))
					return 'none';
				else
					return 'block';
			});
			edgeIds = d3.set(e.map(function(d) {
				return d.id;
			}));
			link.style("display", function(d) {
				if (!edgeIds.has(d.id))
					return 'none';
				else
					return 'block';
			});
		}

		function brightness(color) {
			var rgb = d3.rgb(color);
			var value = rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
			return value < 128 ? ['#fff', color] : ['#000', color];
		}

	});
})(this);
