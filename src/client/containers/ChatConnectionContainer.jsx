ChatConnectionContainer = React.createClass({
  mixins: [Reflux.connect(PeerStore, 'peer')],

  render() {
    return (
      <div>
        <ChatOpenPeerButton 
            hasOpenPeer={this.state.peer.hasOpenPeer}/>
        <ChatConnection
            connectionKey={this.state.peer.key}
            hasOpenPeer={this.state.peer.hasOpenPeer}
            hasOpenConnection={this.state.peer.hasOpenConnection} />
        <ConnectedTo
            connectedToKey={this.state.peer.connectedToKey}
            hasOpenConnection={this.state.peer.hasOpenConnection} />
      </div>
    );
  }
});
