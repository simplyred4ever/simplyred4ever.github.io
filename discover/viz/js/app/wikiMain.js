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
		window.fullGraph = function(id) {
			if (id && id.target) {
				$(id.target).addClass('selected');
				id = id.target.id.replace('fullGraph', '');
				if (graphObj.config.type == 'all') {
					graphObj.nodeClicked(id);
					return;
				}
			}
			d3.json('/discover/rest/wiki/getData.discover', function(error, graph) {
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
				graphObj = new Force('container', graph, config);
				
			});
		};
		window.fullGraph();

		// 相似相邻
		window.adjacentGraph = function adjacentGraph(id) {
			if (!id) {		
				var n = graphObj.force.nodes().filter(function(val) {
					return val.id === graphObj.highlightId;
				});
				if (n.length === 0)
					return;
				id = n[0].id;
			}

			d3.json('/discover/rest/wiki/relation/querySimilarGraphInfo/{nodeId}/{count}/{weightCount}.discover'
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
			if (id.target) {
				$(id.target).addClass('selected');
				id = id.target.id.replace('changeNode', '');
			}
			graphObj.setAnimation(id,2000);
			graphObj.nodeClicked(id);
		}

		/**
		 * 切换实例
		 */
		window.changeInstance = function changeInstance(id) {
			if (id && id.target) {
				$(id.target).addClass('selected');
				id = id.target.id.replace('changeInstance', '');
			} else if (!id) {
				var name = $('#rootNode').val();
				var n = graphObj.force.nodes().filter(function(d) {
					return d.id === graphObj.highlightId;
				});
				id = n[0].id;
			}
			clearMdsDiv();
			d3.json('/discover/rest/wiki/relation/queryChildRelationsToJson/' + id + '/1.discover', function(error,
					graph) {
				if (!graph || !graph.nodes || graph.nodes.length == 0) {
					alert('没有数据！');
					return;
				}

				toggleStyle(true, 1);
				//graphObj.removeNodeInfo();
				graphObj = new Force('container', graph, {
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
				});
			});
		};
		
		/**
		 * 应用
		 */
		window.apply = function() {
			if (graphObj.config.type == 'all') {
				fullGraph();
			} else if (graphObj.config.type == 'instance') {
				changeInstance();
			} else if (graphObj.config.type == 'adjacent') {
				adjacentGraph();
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
			$('#onlyInstanceDisplay input[type=radio]').each(function(i, v) {
				if (i == index) {
					$(v)[0].checked = true;
				}
			});
		};
		
		window.searchType = 0;
		window.changeSearch = function changeSearch(type) {
			window.searchType = type;
			var $one_li = $("#menu li:eq(" + type + ")");
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
			d3.json('/discover/rest/wiki/queryGraphByNameToJson/' + searchType + '/10/' + name + '.discover',
					searchNodeCallback);

		};

		/**	
		 * mds图例方法
		 */
		window.mdsGraph = function mdsGraph(id) {
			var propertyA = getChecked();
			if(propertyA.length == 0){
				alert("属性选择不能为空.");
				return;
			} else if (propertyA.length < 2){
				alert("至少选择2个属性.");
				return;
			} 
			var propertystr = propertyA.join(",");
			if (id && id.target) {
				id = id.target.id;
			}
			d3.select('#container>svg').remove();
			toggleStyle(false, 0);
			clearMdsDiv();
			d3.json('/discover/rest/wiki/ontology/mds/'+id+'/'+propertystr+'.discover'/* "/discover/rest/wiki/mds.discover" */,
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
					$('#scatterContainer').addClass('show').removeClass('hidden');
					$('#heatmapContainer').addClass('show').removeClass('hidden');
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
			var inputs = $("#mdsBox .list-group-item p input[type='checkbox']");
			var values = [];
			inputs.each(function (i,d){
				if(d.checked){
					var name = d.name.substr(0,(d.name.length - 'check'.length));
					values.push(name);	
				}
			});
			
			if (values.length == inputs.length){
				values = ["all"];
			}
			return values;
		};
	});

	
})(this);
