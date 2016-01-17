(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/components/ConnectedTo.jsx                                   //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ConnectedTo = React.createClass({                                      // 1
  displayName: "ConnectedTo",                                          //
                                                                       //
  getDefaultProps: function () {                                       // 2
    return {                                                           // 3
      hasOpenConnection: false,                                        // 4
      connectedToKey: 'None'                                           // 5
    };                                                                 //
  },                                                                   //
                                                                       //
  handleDisconnect: function (e) {                                     // 9
    e.preventDefault();                                                // 10
                                                                       //
    PeerStore.disconnect();                                            // 12
  },                                                                   //
                                                                       //
  render: function () {                                                // 15
    if (!this.props.hasOpenConnection) {                               // 16
      return React.createElement("div", null);                         // 17
    }                                                                  //
                                                                       //
    return React.createElement(                                        // 20
      "div",                                                           //
      { className: "panel panel-default" },                            //
      React.createElement(                                             //
        "div",                                                         //
        { className: "panel-body" },                                   //
        React.createElement(                                           //
          "p",                                                         //
          null,                                                        //
          "Connected to: ",                                            //
          this.props.connectedToKey                                    //
        ),                                                             //
        React.createElement(                                           //
          "button",                                                    //
          {                                                            //
            onClick: this.handleDisconnect,                            // 25
            className: "btn btn-danger" },                             // 26
          "Disconnect"                                                 //
        )                                                              //
      )                                                                //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
