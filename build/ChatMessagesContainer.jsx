(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/containers/ChatMessagesContainer.jsx                         //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatMessagesContainer = React.createClass({                            // 1
  displayName: 'ChatMessagesContainer',                                //
                                                                       //
  mixins: [Reflux.connect(MessageStore, 'messages')],                  // 2
                                                                       //
  render: function () {                                                // 4
    return React.createElement(ChatMessages, { messages: this.state.messages.messages });
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
