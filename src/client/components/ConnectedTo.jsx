ConnectedTo = React.createClass({
  getDefaultProps() {
    return {
      hasOpenConnection: false,
      connectedToKey: 'None'
    };
  },

  handleDisconnect(e) {
    e.preventDefault();

    PeerStore.disconnect();
  },

  render() {
    if (! this.props.hasOpenConnection) {
      return <div></div>
    }

    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <p>Connected to: {this.props.connectedToKey}</p>
          <button
              onClick={this.handleDisconnect}
              className="btn btn-danger">
            Disconnect
          </button>
        </div>
      </div>
    );
  }
});
