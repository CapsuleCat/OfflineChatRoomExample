(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/components/ChatRoom.jsx                                      //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatRoom = React.createClass({                                         // 1
  displayName: "ChatRoom",                                             //
                                                                       //
  render: function () {                                                // 2
    return React.createElement(                                        // 3
      "div",                                                           //
      { className: "container" },                                      //
      React.createElement(                                             //
        "div",                                                         //
        { className: "row" },                                          //
        React.createElement(                                           //
          "div",                                                       //
          { className: "col-md-6 col-md-offset-3 col-sm-12" },         //
          React.createElement(ChatConnectionContainer, null),          //
          React.createElement(                                         //
            "div",                                                     //
            { className: "panel panel-default" },                      //
            React.createElement(                                       //
              "div",                                                   //
              { className: "panel-body" },                             //
              React.createElement(ChatMessagesContainer, null),        //
              React.createElement(ChatFormContainer, null)             //
            )                                                          //
          )                                                            //
        )                                                              //
      )                                                                //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
