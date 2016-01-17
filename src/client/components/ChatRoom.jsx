ChatRoom = React.createClass({
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-md-offset-3 col-sm-12">
            <ChatConnectionContainer />

            <div className="panel panel-default">
              <div className="panel-body">
                <ChatMessagesContainer />
                <ChatFormContainer />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
