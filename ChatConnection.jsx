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
  getDefaultProps: function () {                                       // 2
    return {                                                           // 3
      hasOpenConnection: false,                                        // 4
      hasOpenPeer: false,                                              // 5
      connectionKey: 'None'                                            // 6
    };                                                                 //
  },                                                                   //
                                                                       //
  handleConnect: function (e) {                                        // 10
    e.preventDefault();                                                // 11
                                                                       //
    var key = this.refs.connectToKey.value;                            // 13
                                                                       //
    PeerStore.connect(key);                                            // 15
  },                                                                   //
                                                                       //
  render: function () {                                                // 18
    if (!this.props.hasOpenPeer || this.props.hasOpenConnection) {     // 19
      return React.createElement("div", null);                         // 20
    }                                                                  //
                                                                       //
    return React.createElement(                                        // 23
      "div",                                                           //
      { className: "panel panel-default" },                            //
      React.createElement(                                             //
        "div",                                                         //
        { className: "panel-body" },                                   //
        React.createElement(                                           //
          "p",                                                         //
          null,                                                        //
          "Your Connection Key: ",                                     //
          this.props.connectionKey                                     //
        ),                                                             //
        React.createElement(                                           //
          "form",                                                      //
          {                                                            //
            className: "form-inline",                                  // 28
            onSubmit: this.handleConnect },                            // 29
          React.createElement("input", {                               //
            className: "form-control",                                 // 31
            ref: "connectToKey",                                       // 32
            type: "text",                                              // 33
            placeholder: "Connect To..." }),                           // 34
          React.createElement(                                         //
            "button",                                                  //
            {                                                          //
              className: "btn btn-success",                            // 36
              type: "submit" },                                        // 37
            "Connect"                                                  //
          )                                                            //
        )                                                              //
      )                                                                //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
