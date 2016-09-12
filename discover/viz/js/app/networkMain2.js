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
			Force : 'app/Force',
			heatmap : 'heatmap.min',
			ScatterDiagram : 'app/ScatterDiagram',
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
			heatmap : {
				exports : 'h337'
			}
		},
		jsx: {
		    fileExtension: '.jsx',
		    harmony: true,
		    stripTypes: true
		}
	});
	require(['jquery', 'd3', 'Force', 'ScatterDiagram', 'jsx!react/ReactUtil'], 
			function($, d3, Force, ScatterDiagram, ReactUtil) {

		var graphObj;
		var width = window.innerWidth;
		// ------------------------Tooltip
		$('[data-toggle="popover"]').css('color', 'blue').popover({
			trigger : 'hover',
			html : true
		});
		window.fullGraph = function(id,ndeglabel) {
			if (id && graphObj.config.type == 'all') {
				graphObj.nodeClicked(id);
				return;
			}
			d3.json('/discover/rest/network/getCategorys.discover', function(error, graph) {
				if (!graph || !graph.nodes || graph.nodes.length == 0) {
					alert('没有数据！');
					return;
				}
				toggleStyle(false, 1);
				var config = {
					type : 'all',
					layout : {
						width : ($("#rightAll").width() - 320 - 10),
						height : window.innerHeight
					},
					nodeLabel : {
						display : $('input:radio[name="displayNodeText"]:checked').val() == 1
					},
					highlightId : id
				};
				var payments = crossfilter(graph.nodes);
				var edgesObjFilter = crossfilter(graph.edges);
				if (ndeglabel) {
					var obj = [{"name":"inDegree+outDegree","type":"int","value":[ndeglabel]}];
					var a = setFilter(payments,obj);
					graph.nodes = filterForJson(a);
					var edgesObj = edgesObjFilter.dimension(function(d) {return d;});
					var b = edgesObj.filter(function (d){
						if(graph.nodes[d.source] && graph.nodes[d.target]) {
							return d;
						}
					});
					graph.edges = filterForJson(b);
				}
				graphObj = new Force('container', graph, config);
				
			});
		};
		window.fullGraph();

		// 相似相邻
		window.adjacentGraph = function adjacentGraph(id) {
			id = id || graphObj.highlightId;

			d3.json('/discover/rest/network/relation/querySimilarGraphInfo/{nodeId}/{count}/{weightCount}.discover'
					.replace(/\{nodeId\}/, id)
					.replace(/\{count\}/, $('#adjacentCountLabel').val() || 0)
					.replace(/\{weightCount\}/, $('#adjacentWeightCountLabel').val() || 0), function(
					error, graph) {
				if (!graph || !graph.nodes || graph.nodes.length == 0) {
					alert('没有数据！');
					toggleStyle(true, 1);
					return;
				}
				clearMdsDiv();
				toggleStyle(true, 0);
				graphObj = new Force('container', graph, {
					type : 'adjacent',
					highlightId : id,
					edge : {
						hasDirection : false
					},
					nodeLabel : {
						display : $('input:radio[name="displayNodeText"]:checked').val() == 1
					},
					layout : {
						width : ($("#rightAll").width() - 320 - 10),
						height : window.innerHeight,
						type : 'cola.force'
					}
				});
			});
		}

		/**
		 * 切换节点
		 */
		window.changeNode = function changeNode(id) {
			graphObj.nodeClicked(id);
		}

		/**
		 * 切换实例
		 * ndeglabel(出入度和)
		 */
		window.changeInstance = function changeInstance(id,ndeglabel) {
			id = id || graphObj.highlightId;
			
			clearMdsDiv();
			d3.json('/discover/rest/network/relation/queryChildRelationsToJson/' + id + '/1.discover', function(error,
					graph) {
				if (!graph || !graph.nodes || graph.nodes.length == 0) {
					alert('没有数据！');
					return;
				}

				toggleStyle(true, 1);
				var payments = crossfilter(graph.nodes);
				if (ndeglabel) {
					var obj = [{"name":"inDegree+outDegree","type":"int","value":[0]}];
					var a = setFilter(payments,obj);
					graph.nodes = filterForJson(a);
				}
				var config = {
					type : 'instance',
					highlightId : id,
					nodeLabel : {
						display : $('input:radio[name="displayNodeText"]:checked').val() == 1
					},
					layout : {
						width : ($("#rightAll").width() - 320 - 10),
						height : window.innerHeight,
						type : 'cola.force'
					}
				};
				graphObj = new Force('container', graph, config);
			});
		};
		
		/**
		 * 应用
		 */
		window.apply = function() {
			//度数(初度入度之和)
			var ndeglabel = $("#ndeglabel").val();
			if (graphObj.config.type == 'all') {
				fullGraph(null,ndeglabel);
			} else if (graphObj.config.type == 'instance') {
				changeInstance(null,ndeglabel);
			} else if (graphObj.config.type == 'adjacent') {
				adjacentGraph(null,ndeglabel);
			};
		}
		
		/**
		 * 切换样式
		 */
		window.toggleStyle = function(showFlag, index) {
			if (showFlag) {				
				$('#onlyInstanceDisplay')
				.css('left', ($("#rightAll").width() - 480 - 10) + "px")
				.addClass('show')
				.removeClass('hidden');
			} else {
				$('#onlyInstanceDisplay')
				.addClass('hidden')
				.removeClass('show');
			}
			$('#onlyInstanceDisplay input[type=radio]').eq(index).attr("checked",true);
		};
		
		window.searchType = 0;
		window.changeSearch = function changeSearch(type) {
			window.searchType = type;
			var $one_li = $("#menu li").eq(type);
			$("#dropdownBVal").html($one_li.text() + '<span class="caret"></span>');
		};
		/**
		 * 根据搜索结果显示数据
		 */
		function searchNodeCallback(data) {
			var dataNew = [];
			data.nodes.forEach(function(d, i) {
				//概念
				if(d.type == 1){
					dataNew.push({
						id : d.id,
						name : d.name,
						onclick : 'fullGraph',
						color : ['white', '#777'],
						link : true
					});
				//实例
				} else if (d.type == 2){
					dataNew.push({
						id : d.id,
						name : d.name,
						onclick : 'changeInstance',
						color : ['white', 'rgb(31, 119, 180)'],
						link : true
					});
				}
				
			});
			ReactUtil.setPropDiv(dataNew,"searchNodeTap");
		}
		/**
		 * 搜索框搜索内容
		 */
		window.searchNode = function searchNode(name) {
			name = name || $('#rootNode').val();
			d3.json('/discover/rest/network/queryGraphByNameToJson/' + searchType + '/10/' + name + '.discover',
					searchNodeCallback);

		};

		/**	
		 * mds图例方法
		 */
		window.mdsGraph = function mdsGraph(id) {
			var propertyA = getChecked();
			if(propertyA[0] != "all"){
				if(propertyA.length == 0){
					alert("属性选择不能为空.");
					return;
				} else if (propertyA.length < 2){
					alert("至少选择2个属性.");
					return;
				} 
			}
			var propertystr = propertyA.join(",");
			if (id && id.target) {
				id = id.target.id;
			}
			d3.select('#container>svg').remove();
			toggleStyle(false, 0);
			clearMdsDiv();
			d3.json('/discover/rest/network/ontology/mds/'+id+'/'+propertystr+'.discover'/* "/discover/rest/network/mds.discover" */,
				function(error, dataset) {
					if (!dataset) {
						alert('没有数据！');
					}
					var config = {
						layout : {
							"width" : $("#rightAll").width() - 320 - 10,
							"height" : window.innerHeight -30
						}
					};
					$('#scatterContainer,#heatmapContainer').addClass('show').removeClass('hidden');
					graph = new ScatterDiagram('scatterContainer', dataset, config);
				
			});
		};
		
		window.clearMdsDiv = function () {
			$('#scatterContainer,#heatmapContainer').empty().addClass('hidden').removeClass('show');
		};
		
		/**
		 * 获取mds的选中属性
		 */
		window.getChecked  = function (){
			var inputs = $("#mdsBox .list-group-item p input[type='checkbox']:checked");
			var values = [];
			inputs.each(function (i,d){
				var name = d.name.substr(0,(d.name.length - 'check'.length));
				values.push(name);
			});
			
			if (values.length == inputs.length){
				values = ["all"];
			}
			return values;
		};
	});
	/**
	 * 过滤
	 */
	window.setFilter = function  setFilter(payments,conditions) {
		if (!payments) return;
		var paymentsObj = payments.dimension(function(d) {return d;});
		var str1 = new Object();
			for (var i = conditions.length - 1; i >= 0; i--) {
				
				var conObj = conditions[i];
				if (conObj.type == "string") {
					str1 = paymentsObj.filter(function (d) {if(d[conObj.name]  == conObj.value[0]){
						return d;
					}});
				}else if (conObj.type == "int") {
					//两属性值相加
					if (conObj.name.indexOf("+") != -1) {
						if(conObj.value.length == 1){
							var name1 = conObj.name.substring(0,conObj.name.indexOf("+"));
							var name2 = conObj.name.substring(conObj.name.indexOf("+")+1,conObj.name.length);
							str1 = paymentsObj.filter(function (d) {if((d[name1] + d[name2])  >= conObj.value[0]){
								return d;
							}});
						} else {
							//中间值
							var name1 = conObj.name.substring(0,conObj.name.indexOf("+"));
							var name2 = conObj.name.substring(conObj.name.indexOf("+")+1,conObj.name.length);
							str1 = paymentsObj.filter(function (d) {if( conObj.value[0] <= (d[name1] + d[name2]) && (d[name1] + d[name2]) <= conObj.value[1]){
								return d;
							}});
						}
					} else {
						if(conObj.value.length == 1){
							str1 = paymentsObj.filter(function (d) {if(d[conObj.name]  == conObj.value[0]){
								return d;
							}});
						} else {
							str1 = paymentsObj.filter(function (d) {if( conObj.value[0] <= d[conObj.name] && d[conObj.name] <= conObj.value[1]){
								return d;
							}});
						}
					}
				}
			}
		return str1;
	};
	/**
	 * filter对象转json对象
	 */
	function filterForJson(filter){	
		var f=eval(filter);	
		if (typeof(f.length) != "undefined") {

		}else{

		}	
		if (typeof(f.top) != "undefined") {
			f=f.top(Infinity);
		}else{

		}	
		if (typeof(f.dimension) != "undefined") {
			f=f.dimension(function(d) { return "";}).top(Infinity);
		}else{

		}	
		console.log(filter+"("+f.length+") = "+JSON.stringify(f));
		return f;
	} 
	//var obj = [{"name":"inDegree+outDegree","type":"int","value":[0,100]},{"name":"type","type":"string","value":["tab"]},{"name":"total","type":"int","value":[1,100]}];
	
	
})(this);
