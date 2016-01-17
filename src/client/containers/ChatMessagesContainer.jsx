ChatMessagesContainer = React.createClass({
  mixins: [Reflux.connect(MessageStore, 'messages')],

  render() {
    return (
      <ChatMessages messages={this.state.messages.messages} />
    );
  }
});
