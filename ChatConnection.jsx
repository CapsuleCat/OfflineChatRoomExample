(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/components/ChatConnection.jsx                                //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatConnection = React.createClass({                                   // 1
  displayName: "ChatConnection",                                       //
                                                                       //
  getInitialState: function () {                                       // 2
    return {                                                           // 3
      key: 'None'                                                      // 4
    };                                                                 //
  },                                                                   //
                                                                       //
  handleOpenConnection: function (e) {                                 // 8
    e.preventDefault();                                                // 9
                                                                       //
    var key = ShortId.generate();                                      // 11
                                                                       //
    this.setState({                                                    // 13
      key: key                                                         // 14
    });                                                                //
                                                                       //
    PeerStore.open(key);                                               // 17
  },                                                                   //
                                                                       //
  handleConnect: function (e) {                                        // 20
    e.preventDefault();                                                // 21
                                                                       //
    var key = this.refs.connectToKey.value;                            // 23
                                                                       //
    PeerStore.connect(key);                                            // 25
  },                                                                   //
                                                                       //
  render: function () {                                                // 28
    return React.createElement(                                        // 29
      "div",                                                           //
      null,                                                            //
      React.createElement(                                             //
        "button",                                                      //
        { onClick: this.handleOpenConnection },                        //
        "Get My Key"                                                   //
      ),                                                               //
      React.createElement(                                             //
        "p",                                                           //
        null,                                                          //
        "Your Connection Key: ",                                       //
        this.state.key                                                 //
      ),                                                               //
      React.createElement(                                             //
        "form",                                                        //
        { onSubmit: this.handleConnect },                              //
        React.createElement("input", { ref: "connectToKey", type: "text", placeholder: "Connect To..." }),
        React.createElement(                                           //
          "button",                                                    //
          { type: "submit" },                                          //
          "Connect"                                                    //
        )                                                              //
      )                                                                //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
