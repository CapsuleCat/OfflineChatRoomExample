(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// P2PChat.jsx                                                         //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
if (Meteor.isClient) {                                                 // 1
  Meteor.startup(function () {                                         // 2
    Meteor.disconnect();                                               // 3
    ReactDOM.render(React.createElement(ChatRoom, null), document.getElementById('render-target'));
  });                                                                  //
}                                                                      //
/////////////////////////////////////////////////////////////////////////

}).call(this);
