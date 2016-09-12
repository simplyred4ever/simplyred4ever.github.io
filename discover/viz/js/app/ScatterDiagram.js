define(['d3', 'heatmap'],function (d3,h337) {
	ScatterDiagram = function (elemid, dataset,config) {
		var self = this;
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
		this.config = {
			layout : {
				width : 600,
				heigth : 600,
				xmax : maxX || 30,
				xmin :  minX || 0,
				ymax :  maxY || 10,
				ymin : minY || 0,
				title : "多维尺度散点图",
				xlabal : "X",
				ylabel : "Y"
			},
			circle : {
				r : 2
			},
			text : {
				flag : true,//文字是否显示
				dx : 20
			},
			point : {
				value : 0.5,
				radius : 20
			},
			heatmap : {
				flag : true, //是否显示热点图
				id : "heatmapContainer",//热点图的id
				gradient : {
					'.3' : 'blue',
					'.5' : 'lime',
					'.6' : 'yellow',
					'.75' : 'orange',
					'.95' : 'red'
				}
			},
			axis : {
				tick : 10
			}
		};
		
		
		//配置项覆盖否则按默认的
		//布局配置
		if(config && config.layout){
			this.config.layout.width = config.layout.width || this.config.layout.width;
			this.config.layout.height = config.layout.height || this.config.layout.height;
			this.config.layout.xmax = config.layout.xmax || this.config.layout.xmax;
			this.config.layout.xmin = config.layout.xmin || this.config.layout.xmin;
			this.config.layout.ymin = config.layout.ymin || this.config.layout.ymin;
			this.config.layout.ymax = config.layout.ymax || this.config.layout.ymax;
			this.config.layout.title = config.layout.title || this.config.layout.title;
			this.config.layout.xlabel = config.layout.xlabel || this.config.layout.xlabel;
			this.config.layout.ylabel = config.layout.ylabel || this.config.layout.ylabel;
		}
		//点的配置
		if (config && config.circle) {
			this.config.circle.r = config.layout.circle.r || this.config.layout.circle.r;
		}
		//文字的配置
		if(config && config.text){
			this.config.text.dx = config.text.dx || this.config.text.dx;
			this.config.text.flag = config.text.flag || this.config.text.flag;
		}
		
		//热点图中点热点开始值及半径的配置
		if(config && config.point) {
			this.config.point.value = config.point.value || this.config.point.value;
			this.config.point.radius = config.point.radius || this.config.point.radius;
		}
		//有关热点图的配置
		if (config && config.heatmap) {
			this.config.heatmap.flag = config.heatmap.flag || this.config.heatmap.flag;
			this.config.heatmap.id = config.heatmap.id || this.config.heatmap.id;
			this.config.heatmap.gradient = config.heatmap.gradient || this.config.heatmap.gradient;
		}
		//坐标轴的配置
		if (config && config.axis) {
			this.config.axis.tick = config.axis.tick || this.config.axis.tick;
		}
		
		//布局宽高设置
		d3.selectAll("#"+elemid).style({
			"height" : this.config.layout.height + "px",
			"width" : this.config.layout.width + "px"
		});
		//判断是否有热点图对象
		if (this.config.heatmap.flag) {
			d3.selectAll("#"+this.config.heatmap.id).style({
				"height" : this.config.layout.height-100 + "px",
				"width" : this.config.layout.width-100 + "px"
			});
		}
		this.chart = document.getElementById(elemid);
		this.cx = this.chart.clientWidth;
		this.cy = this.chart.clientHeight;
		this.padding = {
			"top" : this.config.layout.title ? 40 : 20,
			"right" : 30,
			"bottom" : this.config.layout.xlabal ? 60 : 10,
			"left" : this.config.layout.ylabel ? 70 : 45
		};

		this.size = {
			"width" : this.cx - this.padding.left - this.padding.right,
			"height" : this.cy - this.padding.top - this.padding.bottom
		};
		

		// x-scale
		this.x = d3.scale.linear().domain([this.config.layout.xmin, this.config.layout.xmax]).range(
				[0, this.size.width]);

		// drag x-axis logic
		this.downx = Math.NaN;

		// y-scale (inverted domain)
		this.y = d3.scale.linear().domain([this.config.layout.ymax, this.config.layout.ymin]).nice().range(
				[0, this.size.height]).nice();

		// drag y-axis logic
		this.downy = Math.NaN;

		this.dragged = this.selected = null;



		this.points = dataset;

		this.vis = d3.select(this.chart).append("svg").attr("width", this.cx).attr("height", this.cy)
				.append("g").attr("transform",
						"translate(" + this.padding.left + "," + this.padding.top + ")");

		this.plot = this.vis.append("rect").attr("width", this.size.width).attr("height", this.size.height)
				.style("fill", "#EEEEEE").attr("pointer-events", "all").style("fill-opacity", 0.2).style(
						"stroke", "black").style("stroke-width", 1);
		this.plot.call(d3.behavior.zoom().x(this.x).y(this.y).on("zoom", this.redraw()));

		this.vis.append("svg").attr("top", 0).attr("left", 0).attr("width", this.size.width).attr("height",
				this.size.height).attr("viewBox", "0 0 " + this.size.width + " " + this.size.height).attr(
				"class", "line");

		// add Chart Title
		if (this.config.layout.title) {
			this.vis.append("text").attr("class", "axis").text(this.config.layout.title).attr("x",
					this.size.width / 2).attr("dy", "-0.8em").style("text-anchor", "middle");
		}

		// Add the x-axis label
		if (this.config.layout.xlabel) {
			this.vis.append("text").attr("class", "axis").text(this.config.layout.xlabel).attr("x",
					this.size.width / 2).attr("y", this.size.height).attr("dy", "2.4em").style(
					"text-anchor", "middle");
		}

		// add y-axis label
		if (this.config.layout.ylabel) {
			this.vis.append("g").append("text").attr("class", "axis").text(this.config.layout.ylabel).style(
					"text-anchor", "middle").attr("transform",
					"translate(" + -40 + " " + this.size.height / 2 + ") rotate(-90)");
		}
		if (this.config.heatmap.flag) {
			this.heatmapInstance = h337.create({
				// only container is required, the rest will be defaults
				container : document.getElementById(this.config.heatmap.id),
				// backgroundColor : 'white',
				// custom gradient colors
				gradient : this.config.heatmap.gradient,
				maxOpacity : .9,
				minOpacity : .3
			});
			//设置热点图的位置
			d3.select("#" + this.config.heatmap.id).style({
				"top":(this.padding.top-3)+"px",
				"left":(this.padding.left-1)+"px"
			});
		}
		
		this.redraw()();
	};
	ScatterDiagram.prototype.update = function() {
		var self = this;
		var circle = this.vis.select("svg").selectAll("circle").data(this.points);

		circle.enter().append("circle").attr("class", function(d) {
			return d === self.selected ? "selected" : null;
		}).attr("cx", function(d) {
			return self.x(d.x);
		}).attr("cy", function(d) {
			return self.y(d.y);
		}).attr("r", self.config.circle.r);

		circle.attr("class", function(d) {
			return d === self.selected ? "selected" : null;
		}).attr("cx", function(d) {

			return self.x(d.x);
		}).attr("cy", function(d) {
			return self.y(d.y);
		});

		circle.exit().remove();

		var text = this.vis.select("svg").selectAll("text").data(this.points);
		
		text.enter().append("text").attr("dx", self.config.text.dx).attr("x", function(d) {
			return self.x(d.x);
		}).attr("y", function(d) {
			return self.y(d.y);
		}).text(function(d) {
			return d.name;
		});
		
		text.attr("x", function(d) {
			return self.x(d.x);
		}).attr("y", function(d) {
			return self.y(d.y);
		});

		//exit部分的处理方法是删除  
		text.exit().remove();  
		//生成新的热点图数据
		var newPoints = [];
		this.points.forEach(function(d) {
			newPoints.push({
				x : self.x(d.x),
				y : self.y(d.y),
				value : self.config.point.value,
				radius : self.config.point.radius
			});
		});
		//更新热点图数据
		if (this.heatmapInstance) {
			this.heatmapInstance.setData({
				max : 1,
				data : newPoints
			});
		}
	};


	ScatterDiagram.prototype.redraw = function() {
		var self = this;
		return function() {
			var tx = function(d) {
				return "translate(" + self.x(d) + ",0)";
			}, ty = function(d) {
				return "translate(0," + self.y(d) + ")";
			}, stroke = function(d) {
				return d ? "#ccc" : "#666";
			},strokeOpacity = function (d){
				return  d ? "0" : "1";
			}, fx = self.x.tickFormat(self.config.axis.tick), fy = self.y.tickFormat(self.config.axis.tick);

			// Regenerate x-ticks…
			var gx = self.vis.selectAll("g.x").data(self.x.ticks(self.config.axis.tick), String).attr("transform", tx);

			gx.select("text").text(fx);

			var gxe = gx.enter().insert("g", "a").attr("class", "x").attr("transform", tx);

			gxe.append("line").attr("stroke-opacity",strokeOpacity).attr("stroke", stroke).attr("y1", 0).attr("y2", self.size.height);

			gxe.append("text").attr("class", "axis").attr("y", self.size.height).attr("dy", "1em").attr(
					"text-anchor", "middle").text(fx).style("cursor", "ew-resize").on("mouseover",
					function(d) {
						d3.select(this).style("font-weight", "bold");
					}).on("mouseout", function(d) {
				d3.select(this).style("font-weight", "normal");
			}).on("mousedown.drag", self.xaxis_drag()).on("touchstart.drag", self.xaxis_drag());

			gx.exit().remove();

			// Regenerate y-ticks…
			var gy = self.vis.selectAll("g.y").data(self.y.ticks(self.config.axis.tick), String).attr("transform", ty);

			gy.select("text").text(fy);

			var gye = gy.enter().insert("g", "a").attr("class", "y").attr("transform", ty).attr(
					"background-fill", "#FFEEB6");

			gye.append("line").attr("stroke", stroke).attr("stroke-opacity",strokeOpacity).attr("x1", 0).attr("x2", self.size.width);
			
			gye.append("text").attr("class", "axis").attr("x", -3).attr("dy", ".35em").attr("text-anchor",
					"end").text(fy).style("cursor", "ns-resize").on("mouseover", function(d) {
				d3.select(this).style("font-weight", "bold");
			}).on("mouseout", function(d) {
				d3.select(this).style("font-weight", "normal");
			}).on("mousedown.drag", self.yaxis_drag()).on("touchstart.drag", self.yaxis_drag());
			
			
			
			gy.exit().remove();
			self.plot.call(d3.behavior.zoom().x(self.x).y(self.y).on("zoom", self.redraw()));
			self.update();
		};
	};

	ScatterDiagram.prototype.xaxis_drag = function() {
		var self = this;
		return function(d) {
			document.onselectstart = function() {
				return false;
			};
			var p = d3.mouse(self.vis[0][0]);
			self.downx = self.x.invert(p[0]);
		};
	};

	ScatterDiagram.prototype.yaxis_drag = function(d) {
		var self = this;
		return function(d) {
			document.onselectstart = function() {
				return false;
			};
			var p = d3.mouse(self.vis[0][0]);
			self.downy = self.y.invert(p[1]);
		};
	};
	
	return ScatterDiagram;
});