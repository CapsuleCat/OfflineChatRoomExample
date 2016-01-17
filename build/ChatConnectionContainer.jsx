(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/containers/ChatConnectionContainer.jsx                       //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatConnectionContainer = React.createClass({                          // 1
  displayName: 'ChatConnectionContainer',                              //
                                                                       //
  mixins: [Reflux.connect(PeerStore, 'peer')],                         // 2
                                                                       //
  render: function () {                                                // 4
    return React.createElement(                                        // 5
      'div',                                                           //
      null,                                                            //
      React.createElement(ChatOpenPeerButton, {                        //
        hasOpenPeer: this.state.peer.hasOpenPeer }),                   // 8
      React.createElement(ChatConnection, {                            //
        connectionKey: this.state.peer.key,                            // 10
        hasOpenPeer: this.state.peer.hasOpenPeer,                      // 11
        hasOpenConnection: this.state.peer.hasOpenConnection }),       // 12
      React.createElement(ConnectedTo, {                               //
        connectedToKey: this.state.peer.connectedToKey,                // 14
        hasOpenConnection: this.state.peer.hasOpenConnection })        // 15
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
