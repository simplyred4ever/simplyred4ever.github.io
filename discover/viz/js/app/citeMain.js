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
			'jquery-ui' : 'jquery-ui.min',
			React : 'react/react-with-addons.min',
			JSXTransformer : 'react/JSXTransformer',
			jsx : 'react/jsx',
			text : 'react/text',
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
			},
			json2 : {
				exports : 'JSON'
			}
		},
		jsx: {
		    fileExtension: '.jsx',
		    harmony: true,
		    stripTypes: true
		}
	});

	require(['jquery', 'bootstrap'], function($) {
		// -----------------------右键菜单栏
		$('#myTab a').click(function(e) {
			e.preventDefault();
			$(this).tab('show');
		});

		// ------------------------Tooltip
		$('[data-toggle="popover"]').css('color', 'blue').popover({
			trigger : 'hover',
			html : true
		});
	});
	
	// 不需要使用的全局参数放在后面（'bootstrap-contextmenu'）
	require(['jquery', 'd3', 'crossfilter', 'cola', 'jsx!react/ReactUtil', 'bootstrap-contextmenu'], 
			function($, d3, crossfilter, cola, ReactUtil) {

		var myMenu = $('#container').contextmenu({
			target : '#context-menu',
			before : function(e, element, target) {
				e.preventDefault();
				if (e.target.nodeName != 'circle') {
					e.preventDefault();
					this.closemenu();
					return false;
				}
				changeSearchBar(e);
				return true;
			}
		});

		// ------------------------绘图
		var nfilter = crossfilter();
		var efilter = crossfilter();
		var yfilter = crossfilter();
		var nodesDegDim = null;
		var nodesYearDim = null;
		var ndegVal = 1;
		var nyearVal = 0;
		var mode = {
			all : {
				width : window.innerWidth - 320,
				height : window.innerHeight,
				labelVisibility : true,
				nodeRadius : 10,
				charge : -60,
				linkDistance : 60
			},
			cc : {
				width : window.innerWidth - 320,
				height : window.innerHeight,
				labelVisibility : true,
				nodeRadius : 10,
				charge : -60,
				linkDistance : 60,
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
			d3.json('/discover/rest/cite/getData/0.discover', drawGraph);
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
					['<defs><marker id="end-arrow" viewBox="0 -5 10 10" refX="0" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,-5L10,0L0,5" fill="#0A0" opacity="1"></path>',
							'</marker><marker id="end-arrow-red" viewBox="0 -5 10 10" refX="0" markerWidth="5" markerHeight="5" orient="auto">',
							'<path d="M0,-5L10,0L0,5" fill="red" opacity="1"></path></marker><filter id="Gaussian_Blur" x="-0.1" y="-0.1" height="400%" width="400%">',
							'<feOffset result="offOut" in="SourceAlpha" dx="1" dy="1"></feOffset><feGaussianBlur result="blurOut" in="offOut" stdDeviation="1"></feGaussianBlur>',
							'<feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend></filter><filter xmlns="http://www.w3.org/2000/svg" id="MyFilter">',
							'<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/><feOffset in="blur" dx="4" dy="4" result="offsetBlur"/>',
							'<feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="10" lighting-color="white" result="specOut">',
							'<fePointLight x="-5000" y="-10000" z="20000"/></feSpecularLighting><feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>',
							'<feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/><feMerge>	<feMergeNode in="offsetBlur"/>',
							'<feMergeNode in="litPaint"/></feMerge></filter><filter id="MyFilter2" filterUnits="userSpaceOnUse" x="0" y="0" width="200" height="120">',
						    '<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/><feOffset in="blur" dx="4" dy="4" result="offsetBlur"/>',
						    '<feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lighting-color="#bbbbbb" result="specOut">',
						    '<fePointLight x="-5000" y="-10000" z="20000"/> </feSpecularLighting><feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>',
						    '<feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>',
						    '<feMerge><feMergeNode in="offsetBlur"/><feMergeNode in="litPaint"/></feMerge></filter></defs>'].join(''));

			linked = {};
			var years = {};

			graph.nodes.forEach(function(d) {
				d.name = d.title;
				if (d.year == 0) {
					if (d.name.match(/(\d{4}).*$/)) {
						d.year = +RegExp.$1;
					} else {
						d.year = 3000;
					}
				}
				d.year = +d.year + '';
				years[+d.year + ''] = +d.year + '';
			});
			var yearskey = d3.keys(years).sort();
			compute = d3.interpolate(d3.rgb(255, 0, 0), d3.rgb(0, 255, 0));
			graph.nodes.forEach(function(d) {
				d.r = currentMode.nodeRadius + Math.sqrt(d.outDegree || 0)
				d.height = 2 * d.r;
				d.width = d.r + 20;
				if (d.year != 3000) {					
					d.color = compute(yearskey.indexOf(d.year) / yearskey.length);
				} else {
					d.color = '#77F';
				}
				linked[d.id + ',' + d.id] = true;
			});
			graph.edges.forEach(function(d) {
				d.from = graph.nodes[d.source].id;
				d.to = graph.nodes[d.target].id;
				if (currentMode == mode.cc) {
					if (+d.source.year == 3000 || +d.target.year == 3000) {
						d.color = '#77F';
					} else if (+d.source.year > +d.target.year) {
						d.color = compute(yearskey.indexOf(graph.nodes[d.target].year) / yearskey.length);
					} else {
						d.color = compute(yearskey.indexOf(graph.nodes[d.source].year) / yearskey.length);
					}
				} else {
					d.color = '#0A0';
				}
				linked[d.from + ',' + d.to] = true;
			});

			nfilter.remove();
			nfilter.add(graph.nodes);
			nodesDegDim = nfilter.dimension(function(d) {
				return +d.inDegree + 1 * d.outDegree;
			});
			yfilter.remove();
			yfilter.add(graph.nodes);
			nodesYearDim = yfilter.dimension(function(d) {
				return +d.year;
			});
			efilter.remove();
			efilter.add(graph.edges);
			
			if (graph.nodes.length + graph.edges.length > 1000) {
				force = d3.layout.force().charge(currentMode.charge).linkDistance(currentMode.linkDistance * 1.5)
				.linkStrength(1).gravity(0.05).size([currentMode.width, currentMode.height])
				.nodes(graph.nodes).links(graph.edges).start();
			} else {
				force = cola.d3adaptor().avoidOverlaps(false).size([currentMode.width, currentMode.height]).symmetricDiffLinkLengths(15).linkDistance(currentMode.linkDistance).jaccardLinkLengths(
						currentMode.linkDistance * 1.5, currentMode.linkDistance * .05).nodes(graph.nodes).links(graph.edges).start(1, 1, 5).alpha(0.01);
			}

			link = svg.selectAll('.link').data(graph.edges).enter().append('path').classed('link', true).attr('id', function(d) {
				return 'link' + d.source.id + '_' + d.target.id;
			}).style('stroke-width', function(d) {
				return Math.max(d.weight, 1);
			}).style('marker-mid', currentMode.undirected ? '' : 'url(#end-arrow)').style('stroke', function(d) {
				return d.color;
			});

			node = svg.selectAll('.node').data(graph.nodes).enter().append('circle').classed('node', true).attr('id', function(d) {
				return 'node' + d.id;
			}).attr('r', function(d) {
				return d.r;
			}).style('stroke-width', 2).style('fill', function(d) {
				return d.color;
			}).style('stroke', function(d) {
				return d3.rgb(d.color).darker();
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
				nodeClicked(d);
				changeSearchBar(d3.event);
				searching = false;
				d3.event.stopPropagation();
			});
			
			node.append('title').text(function(d) { return d.name; });

			text = svg.append('g').selectAll('text').data(force.nodes()).enter().append('text').attr('id', function(d) {
				return 'text' + d.id;
			}).attr('dx', function(d) {
				return d.r;
			}).attr('dy', '.31em').attr('font-size', function(d) {
				return 10 + 1 * d.outDegree;
			}).classed(currentMode === mode.all ? {
				'node-label' : true
			} : {
				'node-label' : true,
				'node-label-child' : true
			}).text(function(d) {
				return d.name;
			}).style('display', function(d){
				return d.inDegree + d.outDegree > 1 ? 'block' : 'none';
			});

			text2 = svg.append('g').selectAll('text').data(force.nodes()).enter().append('text').attr('id', function(d) {
				return 'number' + d.id;
			}).attr('dx', 0).attr('dy', '.31em').attr('font-size', function(d) {
				return 10 + Math.sqrt(d.outDegree);
			}).classed('node-number', true).text(function(d) {
				return '';
			}).style('fill', function(d) {
				return brightness(d3.rgb(d.color)) < 125 ? "#eee" : "#000";
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

				text2.attr('x', function(d) {
					return d.x;
				}).attr('y', function(d) {
					return d.y;
				});
			});
			years = d3.entries(years);
			var titleColor = d3.select('#container svg').append('g').selectAll('rect').data(years).enter().append('rect').attr('x', 0).attr('y', function(d, i) {
				return i * 20;
			}).attr('width', 40).attr('height', 20).style('fill', function(d, i) {
				if (d.value == 3000) {
					return '#77F';
				}
				return compute(i / years.length);
			});
			var title = d3.select('#container svg').append('g').selectAll('text').data(years).enter().append('text').attr('x', 6).attr('y', function(d, i) {
				return 16 + i * 20;
			}).style('fill', 'black').text(function(d) {
				if (d.value == 3000) {
					return '未知';
				}
				return d.value;
			});
			nodeClicked(force.nodes()[0]);
		}

		function connectedNodes(d) {
			if (d != null) {
				// Reduce the opacity of all but the neighbouring nodes
				node.style('opacity', function(o) {
					return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
				});
				node.attr('filter', function(o) {
					return neighboring(d, o) | neighboring(o, d) ? 'url(#Gaussian_Blur)' : '';
				});
				text.style('opacity', function(o) {
					return neighboring(d, o) | neighboring(o, d) ? 1 : 0;
				});
				if (currentMode == mode.all) {
					node.style('stroke', function(o) {
						if (d == o) {
							return 'blue';
						} else if (neighboring(d, o)) {
							return 'lime';
						} else if (neighboring(o, d)) {
							return 'orange';
						} else {
							return d3.rgb(o.color).darker();
						}
					});
					text2.style('opacity', function(o) {
						return neighboring(d, o) | neighboring(o, d) ? 1 : 0;
					});
					text2.text(function(o) {
						if (d == o) {
							return '';
						} else if (neighboring(d, o)) {
							return o.inDegree;
						} else if (neighboring(o, d)) {
							return o.outDegree;
						} else {
							return '';
						}
					});
				}
				link.style('opacity', function(o) {
					return d.id == o.from | d.id == o.to ? 1 : 0.05;
				});
			} else {
				node.style('opacity', 1);
				link.style('opacity', 1);
				text.style('opacity', 1);
				text2.style('opacity', 1);
				text2.text('');
				node.attr('filter', '');
				node.style('stroke', function(o) {
					return d3.rgb(o.color).darker();
				});
			}
		}

		window.filterNDeg = function filterNDeg(ndeg) {
			ndegVal = ndeg;
			$('#ndeglabel').val(ndeg);
			cfilter(ndegVal, nyearVal);
		}

		window.filterNYear = function filterNYear(nyear) {
			nyearVal = nyear;
			$('#nyearlabel').val(nyear);
			cfilter(ndegVal, nyearVal);
		}

		function neighboring(a, b) {
			return linked[a.id + ',' + b.id];
		}

		// 点击节点
		window.changeSearchBar = function changeSearchBar(evt) {
			if (evt.target.nodeName == 'circle') {

				if (evt.ctrlKey) {
					$('#toNode').val($('#' + evt.target.id.replace('node', 'text')).text());
					$('#toId').val(evt.target.id.replace('node', ''));
				} else {
					$('#fromNode, #rootNode').val($('#' + evt.target.id.replace('node', 'text')).text());
					$('#fromId').val(evt.target.id.replace('node', ''));
					d3.selectAll('.node-active').classed('node-active', false);
				}
				d3.select(evt.target).classed('node-active', true);
			}
		}

		// 最短路径
		window.shortPath = function shortPath(type) {
			// 通过名称找id
			var fromTo = force.nodes().filter(function(val) {
				return val.id === $('#fromId').val() || val.id === $('#toId').val();
			});
			if (fromTo.length === 2) {
				d3.json('/discover/rest/cite/shortPath/' + type + '/' + fromTo[0].id + '/' + fromTo[1].id + '.discover', function(error, lines) {
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
			currentMode = mode.all;
			d3.json('/discover/rest/cite/relation/queryChildRelationsToJson/' + n[0].id + '/-1.discover', drawGraph);
		}

		// 共引共被引
		window.ccGraph = function ccGraph(type) {
			d3.select('#container>svg').remove();
			currentMode = mode.cc;
			d3.json('/discover/rest/cite/queryCROrCCToJson/0/' + type + '.discover', drawGraph);
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
			d3.json('/discover/rest/cite/relation/querySimilarGraphInfo/' + n[0].id + '.discover', drawGraph);
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

			d3.json('/discover/rest/cite/cluster/' + methods[type] + '.discover', drawGraph);
		}

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

			if (currentMode == mode.all) {
				var inner = [];
				force.nodes().filter(function(o) {
					return neighboring(d, o) && d != o;
				}).forEach(function(d, i) {
					inner.push({
						id : d.id,
						name : d.name
					});
				});
				var outer = [];
				force.nodes().filter(function(o) {
					return neighboring(o, d) && d != o;
				}).forEach(function(d, i) {
					outer.push({
						id : d.id,
						name : d.name
					});
				});
				ReactUtil.setPropBox([{
					name : '',
					list : [{
						key : '名称',
						value : d.name
					}, {
						key : '作者',
						value : d.author
					}, {
						key : '时间',
						value : d.year
					}]
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
					name : '施引',
					list : inner
				}, {
					name : '被引',
					list : outer
				}], 'propTab');
			} else {
				var io = [];
				force.nodes().filter(function(o) {
					return (neighboring(o, d) || neighboring(d, o)) && d != o;
				}).forEach(function(d, i) {
					io.push({
						id : d.id,
						name : d.name
					});
				});
				ReactUtil.setPropBox([{
					name : '',
					list : [{
						key : '名称',
						value : d.name
					}, {
						key : '作者',
						value : d.author
					}, {
						key : '时间',
						value : d.year
					}]
				}, {
					name : '相关',
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
				d3.selectAll('.node-active').classed('node-active', false);
				d3.select('#node' + n[0].id).classed('node-active', true);
			}

		}

		function cfilter(ndeg, nyear) {
			// Nodes
			nodesDegDim.filter([ndeg, Infinity]);
			var n = nodesDegDim.top(Infinity);
			var nodeIds = d3.set(n.map(function(d) {
				return d.id;
			}));

			nodesYearDim.filter([nyear, Infinity]);
			var y = nodesYearDim.top(Infinity);
			var nodeyearIds = d3.set(y.map(function(d) {
				return d.id;
			}));

			// Edges
			var edgesConDim = efilter.dimension(function(d) {
				return nodeIds.has(d.from) && nodeIds.has(d.to) && nodeyearIds.has(d.from) && nodeyearIds.has(d.to);
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
				if (nodeIds.has(d.id) && nodeyearIds.has(d.id)) {
					return 'block';
				} else {
					return 'none';
				}
			});
			text.style("display", function(d) {
				if (nodeIds.has(d.id) && nodeyearIds.has(d.id)) {
					return 'block';
				} else {
					return 'none';
				}
			});
			edgeIds = d3.set(e.map(function(d) {
				return d.id;
			}));
			link.style("display", function(d) {
				if (!edgeIds.has(d.id)) {
					return 'none';
				} else {
					return 'block';
				}
			});
		}

		function brightness(rgb) {
			return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
		}
	});
})(this);