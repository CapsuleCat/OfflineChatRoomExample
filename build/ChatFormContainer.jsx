(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/containers/ChatFormContainer.jsx                             //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatFormContainer = React.createClass({                                // 1
  displayName: 'ChatFormContainer',                                    //
                                                                       //
  mixins: [Reflux.connect(PeerStore, 'peer')],                         // 2
                                                                       //
  render: function () {                                                // 4
    return React.createElement(ChatForm, { hasOpenConnection: this.state.peer.hasOpenConnection });
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
