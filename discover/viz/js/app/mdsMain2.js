(function() {
	require.config({
		// js目录
		baseUrl : '/discover/viz/js',
		// 路径映射
		paths : {
			heatmap : 'heatmap.min',
			d3 : 'd3.v3',
			SimpleGraph : 'app/SimpleGraph'
		},
		// 依赖/输出
		shim : {
			heatmap : {
				exports : 'h337'
			}
		}
	});

	// 不需要使用的全局参数放在后面（'bootstrap-contextmenu'）
	require(['SimpleGraph'], function(SimpleGraph) {
			// var dataset = [ [5, 20], [48.0, -90], [-250, 50], [100, 33],
			// [-33.0,
			// -95], [41.0, 12], [47.5, 44], [25, 67], [85, 21], [-220, 88]
			// ];
			d3.csv("/discover/data/SPSS3.csv"/* "/discover/rest/network/mds.discover" */,
				function(error, dataset) {
					if (!dataset) {
						alert('没有数据！');
					}
					var config = {
						layout : {
							"width" : 600,
							"height" : 600
						}
					};
					graph = new SimpleGraph('scatterContainer', dataset, config);
				});
		});

})(this);