var color = d3.scale.category20();
var Node = React.createClass({
	handleClick: function(event) {
		d3.select('.node.selected,.node-label.selected').classed('selected', false);
		d3.select(event.target).classed('selected', true);
	},
	render: function () {
		return (

		<circle
		r={5}
		cx={this.props.x}
		cy={this.props.y}
		className="node"
		style={{
			"fill": color(this.props.group),
			"stroke": d3.rgb(color(this.props.group)).darker(),
			"strokeWidth": "2px",
		}}
		onClick={this.handleClick}
		/>);
	}
});
var Link = React.createClass({
	render: function () {

		return (
		<line
		   x1={this.props.datum.source.x}
		   y1={this.props.datum.source.y}
		   x2={this.props.datum.target.x}
		   y2={this.props.datum.target.y}
		   className="link"
		   style={{
		     "stroke":"#999",
		     "strokeOpacity":".6",
		     "strokeWidth": 1,
		 }}/>);

	}
});
var NodeLabel = React.createClass({
	render: function () {
		return (
		<text
		x={this.props.x}
		y={this.props.y}
		dx="10"
		dy="0.3em"
		className="node-label"
		style={{
			"fontsize": 12,
			"fontfamily": "微软雅黑",
			"fill": "gray",
		  }}>
		{this.props.text}
		</text>);
	}
});
var Graph = React.createClass({
	mixins: [Radium.StyleResolverMixin, Radium.BrowserStateMixin],
	getInitialState: function() {

		var svgWidth = window.innerWidth;
		var svgHeight = window.innerHeight;
		var force = d3.layout.force()
		 	.charge(-120)
		 	.linkDistance(120)
		 	.gravity(0.05)
		 	.size([svgWidth, svgHeight]);

		 return {
		   svgWidth: svgWidth,
		   svgHeight: svgHeight,
		   force: force,
		   nodes: null,
		   links: null,
		   dragging: false,
		 }
	},
	componentDidMount: function () {
		var self = this;
		// refactor entire graph into sub component - force layout shouldn't be
		// manipulating props, though this works

		this.state.force.nodes(this.props.data.nodes).links(this.props.data.edges).start();
		this.state.force.on("tick", function (tick, b, c) {
			self.forceUpdate();
		});
	},
	toggleSelected: function(i, b) {
		this.state.nodes.filter(function (n) {
			return n.id == i;
		}).classed('selected', b);
		this.state.nodeLabels.filter(function (n) {
			return n.id == i;
		}).classed('selected', b);
	},
	drawLinks: function () {
	  var links = this.props.data.edges.map(function (link, index) {
	    return (
			<Link datum={link} key={index} />
		)
	  });
	  return (<g>
	    {links}
	  </g>)
	},
	drawNodes: function () {
	  var nodes = this.props.data.nodes.map(function (node, index) {
	    return (
			<Node key={index} x={node.x} y={node.y} group={node.group} on/>
		)
	});
	  return nodes;
	},
	drawNodeLabels: function () {
		var labels = this.props.data.nodes.map(function (node, index) {
			return (<NodeLabel
				key={index}
				x={node.x}
				y={node.y}
				text={node.name}/>)
		});
			return labels;
		},
	render: function() {
	    return (
	      <div>
	        <div style={{"marginLeft": "20px", "fontFamily": "Helvetica"}}>
	          </div>
			  <svg
				  style={{"border": "2px solid black", "margin": "20px"}}
				  width={this.state.svgWidth}
				  height={this.state.svgHeight}
				  viewBox={[0, 0, this.state.svgWidth, this.state.svgHeight].join(' ')}
				  preserveAspectRatio="xMidYMid meet">
				  {this.drawLinks()}
				  {this.drawNodes()}
				  {this.drawNodeLabels()}
			  </svg>
	      </div>
	  );
	}
});
d3.json(/*"/discover/rest/network/getCategorys.discover"*/'/discover/data/miserables.json', function(error, data) {
	React.render(<Graph data={data}/>, document.getElementById("mount-point"));
});
