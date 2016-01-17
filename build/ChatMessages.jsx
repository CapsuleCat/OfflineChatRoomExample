(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/components/ChatMessages.jsx                                  //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatMessages = React.createClass({                                     // 1
  displayName: "ChatMessages",                                         //
                                                                       //
  getDefaultProps: function () {                                       // 2
    return {                                                           // 3
      messages: []                                                     // 4
    };                                                                 //
  },                                                                   //
                                                                       //
  render: function () {                                                // 8
    if (this.props.messages == null || this.props.messages.length === 0) {
      return React.createElement(                                      // 11
        "p",                                                           //
        null,                                                          //
        "No messages"                                                  //
      );                                                               //
    }                                                                  //
                                                                       //
    return React.createElement(                                        // 14
      "div",                                                           //
      null,                                                            //
      this.props.messages.map(function (source, i) {                   //
        return React.createElement(                                    // 17
          "p",                                                         //
          { key: source._id },                                         //
          source.text                                                  //
        );                                                             //
      })                                                               //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
