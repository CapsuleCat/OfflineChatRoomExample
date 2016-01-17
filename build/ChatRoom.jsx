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
      null,                                                            //
      React.createElement(ChatConnection, null),                       //
      React.createElement(ChatMessagesContainer, null),                //
      React.createElement(ChatForm, null)                              //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
