ChatConnection = React.createClass({
  getInitialState() {
    return {
      key: 'None'
    }
  },

  handleOpenConnection(e) {
    e.preventDefault();

    let key = ShortId.generate();

    this.setState({
      key: key
    });

    PeerStore.open(key);
  },

  handleConnect(e) {
    e.preventDefault();

    let key = this.refs.connectToKey.value;

    PeerStore.connect(key);
  },

  render() {
    return (
      <div>
        <button onClick={this.handleOpenConnection}>Get My Key</button>
        <p>Your Connection Key: {this.state.key}</p>
        <form onSubmit={this.handleConnect}>
          <input ref="connectToKey" type="text" placeholder="Connect To..."/>
          <button type="submit">Connect</button>
        </form>
      </div>
    );
  }
});