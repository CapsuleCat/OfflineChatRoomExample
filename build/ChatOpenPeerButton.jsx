(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/components/ChatOpenPeerButton.jsx                            //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatOpenPeerButton = React.createClass({                               // 1
  displayName: "ChatOpenPeerButton",                                   //
                                                                       //
  getDefaultProps: function () {                                       // 2
    hasOpenPeer: false;                                                // 3
  },                                                                   //
                                                                       //
  handleOpenConnection: function (e) {                                 // 6
    e.preventDefault();                                                // 7
                                                                       //
    var key = ShortId.generate();                                      // 9
    PeerStore.open(key);                                               // 10
  },                                                                   //
                                                                       //
  render: function () {                                                // 13
    if (this.props.hasOpenPeer) {                                      // 14
      return React.createElement("div", null);                         // 15
    }                                                                  //
                                                                       //
    return React.createElement(                                        // 18
      "button",                                                        //
      {                                                                //
        className: "btn btn-primary",                                  // 20
        onClick: this.handleOpenConnection },                          // 21
      "Get My Key"                                                     //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
