ChatRoom = React.createClass({
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-md-offset-3 col-sm-12">
            <ChatConnectionContainer />
            <ChatMessagesContainer />
            <ChatForm />
          </div>
        </div>
      </div>
    );
  }
});
