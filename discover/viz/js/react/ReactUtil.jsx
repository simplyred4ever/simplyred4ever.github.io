define(['React'], function(React) {
	var CheckLabel = React.createClass({
		render: function() {
			return (
				<div className="list-group-item">
					<p className="badge stats-item prop-value" style= {{backgroundColor:'white', verticalAlign: 'middle'}} title={this.props.data.name}>
					<input type="checkbox" name={this.props.data.name + 'check'} style= {{marginTop:0}} onClick={window[this.props.data.onclick]} defaultChecked="checked"/>
					</p>{this.props.data.name}
				</div>
			);
		}
	});
	
	var ButtonMds =  React.createClass({
		render : function () {
			return (
				<button type="button" className="btn btn-xs" id={this.props.data.id} onClick={window[this.props.data.onclick]}>应用</button>
			);
		}
	});
	var CheckLabelBox = React.createClass({
		render: function() {
			if(this.props.data) {
				if (this.props.data.checkLabel){ 
					var list = this.props.data.checkLabel.map(function (item) {
						return (
							<CheckLabel data={item}/>
						);
					});
					var classList = {};
					if (this.props.data.classObj) {
						classList = this.props.data.classObj.map(function (item) {
							return (
								<ButtonMds data={item}/>
							);
						});
					}
					return (
						<div>
							<div className="list-group prop-ul">
								{list}
							</div>
							<div style={{textAlign:'right'}}>
								{classList}
							</div>
						</div>
					);
				}
				
			} else {
				return (
					<div></div>
				);
			}
		}
	});
	
	function setCheckLabelBox(data, id) {
		React.unmountComponentAtNode(document.getElementById(id));
		React.render(
			<CheckLabelBox data={data}/>,
			document.getElementById(id)
		);
	}
	
	var PropBadge = React.createClass({
		render: function() {
			return (
				<div className="list-group-item">
					<p className="badge stats-item prop-value" title={this.props.data.value}>{this.props.data.value}</p>{this.props.data.key}
				</div>
			);
		}
	});
	
	var PropLabel = React.createClass({
		clickHandle: function() {
			d3.select(this.getDOMNode()).classed({'selected': true});
			window[this.props.data.onclick](this.getDOMNode().id);
		},
		render: function() {
			var myStyle;
			if (this.props.data.color) {					
				myStyle = {color : this.props.data.color[0], backgroundColor: this.props.data.color[1]};
			} else {
				myStyle = {color : '#fff', backgroundColor: '#777'}
			}
			
			var className = this.props.data.link ? "label" : "badge";
			
			return (
				<div className= {className + ' stats-item prop-long-value fl'} title={this.props.data.name} id={this.props.data.id} 
					onClick={this.clickHandle} style={myStyle}>{this.props.data.name}
				</div>
			);
	
		}
	});
	
	var PropDiv = React.createClass({
		render: function() {
		    var list = this.props.data.map(function (item) {
				if (item.key) {
					return (
						<PropBadge data={item}/>
					);
				} else {
					return (
						<PropLabel data={item}/>
					);
				}
		    });
		    return (
		        <div className="list-group prop-ul">
					{list}
				</div>
		    );
		}
	});
	
	var PropBox = React.createClass({
		render: function() {
			if(this.props.data) {
				var list = this.props.data.map(function (item) {
					return (
						<div>
							<span>{item.name}</span>
							<PropDiv data={item.list}/>
						</div>
					);
				});
				return (
					<div>
						{list}
					</div>
				);
			} else {
				return (
					<div></div>
				);
			}
		}
	});
	
	function setPropBox(data, id) {
		React.unmountComponentAtNode(document.getElementById(id));
		React.render(
			<PropBox data={data}/>,
			document.getElementById(id)
		);
	}
	
	function setPropDiv(list, id) {
		React.unmountComponentAtNode(document.getElementById(id));
		React.render(
			<PropDiv data={list}/>,
			document.getElementById(id)
		);
	}
	
	function setSettingBox(data, id) {
		React.unmountComponentAtNode(document.getElementById(id));
		React.render(
			<SettingBox/>,
			document.getElementById(id)
		);
	}
	var SettingBox = React.createClass({
		mixins: [React.addons.LinkedStateMixin],
		getInitialState: function() {
	    return {ndeglabel: '1'};
	  },
		render : function() {
			return (
				<div>
					<div className="form-group" id="ndeg">
						<span for="ndegslider">度数 [1-200]: </span>
						<ul className="list-group">
							<li className="list-group-item"> <input type="range"
								id="ndegslider" name="ndeg" value="1" min="1" max="200" valueLink={this.linkState('ndeglabel')}/><output for="ndegslider" id="ndeglabel">{this.state.ndeglabel}</output></li>
						</ul>
					</div>
					<div className="form-group">
						<span>节点文字：</span>
						<ul className="list-group">
							<li className="list-group-item"><input type="radio" name="displayNodeText" value="1" defaultChecked="checked" />显示 <input type="radio"
								name="displayNodeText" value="0" />不显示</li>
						</ul>
					</div>
					<div className="form-group">
						<span>显示虚拟叶子节点：大于这个值，则叶子节点都显示为虚拟节点。</span>
						<ul className="list-group">
							<li className="list-group-item"> <input type="range"
								id="ndegslider" name="ndeg" value="1" min="1" max="200" oninput=""/><output for="ndegslider" id="ndeglabel">1</output></li>
						</ul>
					</div>
					<div className="form-group">
						<span>显示虚拟层节点：大于这个值的层节点都不显示。</span>
						<ul className="list-group">
							<li className="list-group-item"> <input type="range"
								id="ndegslider" name="ndeg" value="1" min="1" max="200" oninput=""/><output for="ndegslider" id="ndeglabel">1</output></li>
						</ul>
					</div>
					<div className="form-group">
						<span>显示相关关系节点[1-200]：只显示前N个节点。</span>
						<ul className="list-group">
							<li className="list-group-item"> <input type="range"
								id="adjacentCountSlider" name="adjacentCountSlider" value="1" min="1" max="200" valueLink={this.linkState('adjacentCountLabel')}/><output for="adjacentCountSlider" id="adjacentCountLabel">{this.state.adjacentCountLabel}</output></li>
						</ul>
					</div>
					<div className="form-group">
						<span>显示相关关系节点[1-20]：只显示边权重大于M的节点。</span>
						<ul className="list-group">
							<li className="list-group-item"> <input type="range"
								id="adjacentWeightCountSlider" name="adjacentWeightCountSlider" value="1" min="1" max="20" valueLink={this.linkState('adjacentWeightCountLabel')}/><output for="adjacentWeightCountSlider" id="adjacentWeightCountLabel">{this.state.adjacentWeightCountLabel}</output></li>
						</ul>
					</div>
					<div style={{textAlign:right}}>
						<button type="button" className="btn btn-xs" onClick={window.apply}>应用</button>
					</div>
				</div>
			)
		}
	});
	
	return {
		setPropBox : setPropBox,
		setPropDiv : setPropDiv,
		setCheckLabelBox : setCheckLabelBox,
		setSettingBox : setSettingBox,
	};
});