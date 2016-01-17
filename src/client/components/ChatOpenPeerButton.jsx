ChatOpenPeerButton = React.createClass({
  getDefaultProps() {
    hasOpenPeer: false
  },

  handleOpenConnection(e) {
    e.preventDefault();

    let key = ShortId.generate();
    PeerStore.open(key);
  },

  render() {
    if (this.props.hasOpenPeer) {
      return <div></div>;
    }

    return (
      <button 
          className="btn btn-primary"
          onClick={this.handleOpenConnection}>
        Get My Key
      </button>
    );
  }
});