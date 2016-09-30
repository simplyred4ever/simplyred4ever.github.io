const React = require('react');
const ReactDOMServer = require('react-dom/server');

class MessageItem extends React.Component {
	render() {
		let classType;
		let item = this.props.item;
		let user = this.props.user;
		if (!item) {
			return (
				React.createElement("div", null)
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
			removeButton = React.createElement("span", {className: "glyphicon glyphicon-trash remove-post", "data-id": item._id})
		}
		return (
			React.createElement("div", {className: "col-lg-12", id: item._id}, 
				React.createElement("h2", null, React.createElement("a", {href: "/u/" + item._id}, item.user), " ："), 
				React.createElement("p", null, React.createElement("small", null, item.time), 
					removeButton
				), 
				React.createElement("p", {className: classType}, item.post)
		    )
		);

	}
}

class MessageList extends React.Component {
	render() {
		if(this.props.posts) {
			var list = this.props.posts.map((item) => {
				return (React.createElement(MessageItem, {key: item._id, item: item, user: this.props.user}));
			});
			return (
				React.createElement("div", {className: "row"}, 
					list
				)
			);
		} else {
			return (
				React.createElement("div", {className: "row"})
			);
		}
	}
};

module.exports = (posts, user) => {
	return ReactDOMServer.renderToString(React.createElement(MessageList, {posts: posts, user: user}));
};
