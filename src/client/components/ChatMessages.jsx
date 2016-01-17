ChatMessages = React.createClass({
  getDefaultProps() {
    return {
      messages: []
    }
  },

  render() {
    if (this.props.messages == null ||
        this.props.messages.length === 0) {
      return <p>No messages</p>;
    }

    return (
      <div>
        {this.props.messages.map(function (source, i) {
          return <p key={source._id}>{source.text}</p>;
        })}
      </div>
    );
  }
});