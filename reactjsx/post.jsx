const React = require('react');
const ReactDOMServer = require('react-dom/server');

class MessageItem extends React.Component {
	render() {
		let classType;
		let item = this.props.item;
		let user = this.props.user;
		if (!item) {
			return (
				<div></div>
			);
		}
		if (item.post.match(/^\$\$.*/)) {
			classType = 'mathjax';
		} else if (item.post.match(/^(sequenceDiagram|gantt|graph)/)) {
			classType = 'mermaid';
		} else {
			classType = 'markdown';
		}
		let removeButton = '';
		if (user && item.user == user.name) {
			removeButton = <span className="glyphicon glyphicon-trash remove-post" data-id={item._id}></span>
		}
		return (
			<div className="col-lg-12" id={item._id}>
				<h2><a href={"/u/" + item._id}>{item.user}</a> ：</h2>
				<p><small>{item.time}</small>
					{removeButton}
				</p>
				<p className={classType}>{item.post}</p>
		    </div>
		);

	}
}

class MessageList extends React.Component {
	render() {
		if(this.props.posts) {
			var list = this.props.posts.map((item) => {
				return (<MessageItem key={item._id} item={item} user={this.props.user}/>);
			});
			return (
				<div className="row">
					{list}
				</div>
			);
		} else {
			return (
				<div className="row"></div>
			);
		}
	}
};

module.exports = (posts, user) => {
	return ReactDOMServer.renderToString(<MessageList posts={posts} user={user}/>);
};
