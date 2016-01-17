ChatFormContainer = React.createClass({
  mixins: [Reflux.connect(PeerStore, 'peer')],

  render() {
    return (
      <ChatForm hasOpenConnection={this.state.peer.hasOpenConnection} />
    );
  }
});