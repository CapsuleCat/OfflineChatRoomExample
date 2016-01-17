ChatMessages = React.createClass({
  getDefaultProps() {
    return {
      messages: []
    }
  },

  componentDidUpdate() {
    if (this.refs.messages) {
      var messageContainer = ReactDOM.findDOMNode(this.refs.messages);

      messageContainer.scrollTop = Number.MAX_VALUE;
    }
  },

  render() {
    if (this.props.messages == null ||
        this.props.messages.length === 0) {
      return <p>No messages</p>;
    }

    return (
      <div style={{ maxHeight: '50vh', overflow: 'auto' }} ref="messages">
        {this.props.messages.map(function (source, i) {
          return <ChatMessage 
              key={source._id}
              poster={source.poster}
              text={source.text} />;
        })}
      </div>
    );
  }
});