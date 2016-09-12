(function() {
	require.config({
		// js目录
		baseUrl : '/discover/viz/js',
		// 路径映射
		paths : {
			heatmap : 'heatmap.min',
			d3 : 'd3.v3'
		},
		// 依赖/输出
		shim : {
			heatmap : {
				exports : 'h337'
			}
		}
	});
	
	// 不需要使用的全局参数放在后面（'bootstrap-contextmenu'）
	require(['d3', 'heatmap'], function(d3, h337) {
		//Width and height
		var w = 600;
		var h = 600;
		var dragging = false;
		var points = [];
		d3.selectAll("#heatmapContainer,#scatterContainer").style({
			"height" : h + "px",
			"width" : w + "px"
		});
		//var dataset = [ [5, 20], [48.0, -90], [-250, 50], [100, 33], [-33.0, -95], [41.0, 12], [47.5, 44], [25, 67], [85, 21], [-220, 88] ];

		d3.csv("/discover/data/SPSS3.csv"/*"/discover/rest/network/mds.discover"*/, function(error, dataset) {
			if (!dataset) {
				alert('没有数据！');
			}
			// 最大坐标
			var maxX = d3.max(dataset, function(d) {
				return +d.x;
			});
			var minX = d3.min(dataset, function(d) {
				return +d.x;
			});
			var maxY = d3.max(dataset, function(d) {
				return +d.y;
			});
			var minY = d3.min(dataset, function(d) {
				return +d.y;
			});

			// 增加边缘空隙
			var extra = Math.max(maxX - minX, maxY - minY) * 0.05;
			maxX += extra;
			minX -= extra;
			maxY += extra;
			minY -= extra; 
			 
			var zoomX = Math.max(maxX - minX) / w;
			var zoomY = Math.max(maxY - minY) / h;

			points = [];
			for ( var n in dataset) {
				points.push({
					x : transformX(dataset[n].x),
					sx : transformX(dataset[n].x),
					y : transformY(dataset[n].y),
					sy : transformY(dataset[n].y),
					value : 0.5,
					radius : 20
				});
			}

			// minimal heatmap instance configuration
			var heatmapInstance = h337.create({
				// only container is required, the rest will be defaults
				container : document.getElementById('heatmapContainer'),
				//backgroundColor : 'white',
				// custom gradient colors
				gradient : {
					// enter n keys between 0 and 1 here
					// for gradient color customization
					'.3' : 'blue',
					'.5' : 'lime',
					'.6' : 'yellow',
					'.75' : 'orange',
					'.95' : 'red'
				},
				// the maximum opacity (the value with the highest intensity will have it)
				maxOpacity : .9,
				// minimum opacity. any value > 0 will produce 
				// no transparent gradient transition
				minOpacity : .3
			});
			heatmapInstance.setData({
				max : 1,
				data : points
			});

			var x = d3.scale.linear().range([-w / 2, w / 2]).domain([minX, maxX]);

			var y = d3.scale.linear().range([-h / 2, h / 2]).domain([maxY, minY]);

			var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickSize(10);
			var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickSize(10);
			//Create SVG element
			var svg = d3.select("#scatterContainer").append("svg").attr("viewBox", [-24, -24, w + 50, h + 50].join(' ')).attr("width", w + 50).attr("height", h + 50).call(
					d3.behavior.zoom().scaleExtent([0.25, 4]).on('zoom', function zoom() {
						if (dragging) {
							return;
						}
						d3.select("#svgBg").remove();
						points.forEach(function(value, i, arr){
							points[i].x = points[i].sx * d3.event.scale + d3.event.translate[0];
							points[i].y = points[i].sy * d3.event.scale + d3.event.translate[1];
						});
						heatmapInstance.setData({
							max : 1,
							data : points
						});
						svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
						
						/** 坐标轴 */
						var svgBg = d3.select("#scatterContainer svg").append("g").attr("id","svgBg");
						maxX = d3.max(points, function(d) {
							return +d.x*zoomX;
						});
						minX = d3.min(points, function(d) {
							return +d.x*zoomX;
						});
						maxY = d3.max(points, function(d) {
							return +d.y*zoomY;
						});
						minY = d3.min(points, function(d) {
							return +d.y*zoomY;
						});
						// 增加边缘空隙
						extra = Math.max(maxX - minX, maxY - minY) * 0.05;
						maxX += extra;
						minX -= extra;
						maxY += extra;
						minY -= extra; 
						
						x = d3.scale.linear().range([-w / 2, w / 2]).domain([minX, maxX]);
			
						y = d3.scale.linear().range([-h / 2, h / 2]).domain([maxY, minY]);

						xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickSize(10);
					
						yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickSize(10);

						svgBg.selectAll(".x.axis").data(["x"]).enter().append("g").attr("class", "x axis").attr("transform", function(d, i) {
							return "translate(" + w / 2 + "," + (h - 5) + ")";
						}).each(function(d) {
							d3.select(this).call(xAxis);
						});

						svgBg.selectAll(".y.axis").data(["y"]).enter().append("g").attr("class", "y axis").attr("transform", function(d, i) {
							return "translate(" + 5 + "," + h / 2 + ")";
						}).each(function(d) {
							d3.select(this).call(yAxis);
						});
						
						var cell = svgBg.selectAll(".cell").data(cross(["x"], ["y"])).enter().append("g").attr("class", "cell");
						cell.append("rect").attr("class", "frame").attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);
						cell.append("line").attr("class", "frame0").attr("x1", transformX(0)).attr("y1", 0).attr("x2", transformX(0)).attr("y2", h);
						cell.append("line").attr("class", "frame0").attr("x1", 0).attr("y1", transformY(0)).attr("x2", w).attr("y2", transformY(0));

					})).append('g');

			var svgBg = d3.select("#scatterContainer svg").append("g").attr("id","svgBg");

			var length = dataset.length;
			var nodes = dataset.concat(dataset);
			var edges = [];
			var linked = {};
			for ( var i = 0; i < length; i++) {
				nodes[i].mds = true;
				nodes[i].id = nodes[i].name;
				nodes[i].sx = transformX(nodes[i].x);
				nodes[i].sy = transformY(nodes[i].y);
				nodes[i + length].id = nodes[i].name + '`';
				nodes[i + length].x = nodes[i].sx + (i % 2 ? 50 : -50);
				nodes[i + length].y = nodes[i].sy;
				nodes[i + length].fixed = false;
				//nodes[i].name = '';
				edges.push({
					source : i,
					target : length + i,
					from : nodes[i],
					to : nodes[i + length]
				});
				linked[nodes[i].id + ',' + nodes[i + length].id] = true;
			}

			var force = d3.layout.force().gravity(0).charge(0).linkDistance(10).linkStrength(0).size([w, h]).nodes(nodes).links(edges).start().alpha(0.05).theta(.4);

			var node = svg.selectAll("circle").data(nodes).enter().append("circle").attr("cx", function(d) {
				return d.x;
			}).attr("cy", function(d) {
				return d.y;
			}).attr("r", function(d) {
				return d.mds ? 2 : 10;
			}).style('visibility', function(d) {
				return d.mds ? 'visibility' : 'hidden';
			});

			var text = svg.selectAll("text").data(nodes).enter().append("text").text(function(d) {
				return d.name;
			}).attr("x", function(d) {
				return d.x;
			}).attr("y", function(d) {
				return d.y;
			}).style('cursor', 'move').classed("label-text", true).style('display', function(d) {
				return d.mds ? 'block' : 'none';
			}).call(force.drag().on("dragstart", function(d, i) {
				d3.select(this).style('fill', 'red');
				dragging = true;
			}).on("dragend", function(d, i) {
				dragging = false;
				d3.select(this).style('fill', 'black');
			}).on("drag", function(d, i) {
				dragging = true;
			}));

			svgBg.selectAll(".x.axis").data(["x"]).enter().append("g").attr("class", "x axis").attr("transform", function(d, i) {
				return "translate(" + w / 2 + "," + (h - 5) + ")";
			}).each(function(d) {
				d3.select(this).call(xAxis);
			});

			svgBg.selectAll(".y.axis").data(["y"]).enter().append("g").attr("class", "y axis").attr("transform", function(d, i) {
				return "translate(" + 5 + "," + h / 2 + ")";
			}).each(function(d) {
				d3.select(this).call(yAxis);
			});

			var cell = svgBg.selectAll(".cell").data(cross(["x"], ["y"])).enter().append("g").attr("class", "cell");
			cell.append("rect").attr("class", "frame").attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);
			cell.append("line").attr("class", "frame0").attr("x1", transformX(0)).attr("y1", 0).attr("x2", transformX(0)).attr("y2", h);
			cell.append("line").attr("class", "frame0").attr("x1", 0).attr("y1", transformY(0)).attr("x2", w).attr("y2", transformY(0));

			var link = svg.selectAll('.link').data(edges).enter().append('path').classed('link', true).style('stroke-width', 1).style('stroke', 'gray');

			function transformX(x) {
				return (x - minX) / zoomX;
			}

			function transformY(y) {
				return (maxY - y) / zoomY;
			}
			
			function neighboring(a, b) {
				return linked[a.id + ',' + b.id];
			}
			force.on('tick', tick);
			function tick() {
				link.attr("d", function(d) {
					// 不考虑半径时
					return ["M", d.source.sx, d.source.sy, "L", d.target.x, d.target.y].join(" ");
				});

				node.attr('cx', function(d) {
					return d.mds ? d.sx : d.x;
				}).attr('cy', function(d) {
					return d.mds ? d.sy : d.y;
				});

				text.attr('x', function(d) {
					return d.x;
				}).attr('y', function(d) {
					return d.y;
				});
			}
		});

		function cross(a, b) {
			var c = [], n = a.length, m = b.length, i, j;
			for (i = -1; ++i < n;)
				for (j = -1; ++j < m;)
					c.push({
						x : a[i],
						i : i,
						y : b[j],
						j : j
					});
			return c;
		}

	});
})(this);