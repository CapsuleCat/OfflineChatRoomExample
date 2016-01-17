ChatRoom = React.createClass({
  render() {
    return (
      <div>
        <ChatConnection />
        <ChatMessagesContainer />
        <ChatForm />
      </div>
    );
  }
});
