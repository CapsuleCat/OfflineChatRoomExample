ChatConnection = React.createClass({
  getDefaultProps() {
    return {
      hasOpenConnection: false,
      hasOpenPeer: false,
      connectionKey: 'None'
    }
  },

  handleConnect(e) {
    e.preventDefault();

    let key = this.refs.connectToKey.value;

    PeerStore.connect(key);
  },

  render() {
    if (! this.props.hasOpenPeer || this.props.hasOpenConnection) {
      return <div></div>;
    }

    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <p>Your Connection Key: {this.props.connectionKey}</p>
          <form
              className="form-inline"
              onSubmit={this.handleConnect}>
            <input
                className="form-control"
                ref="connectToKey"
                type="text"
                placeholder="Connect To..."/>
            <button
                className="btn btn-success"
                type="submit">Connect</button>
          </form>
        </div>
      </div>
    );
  }
});