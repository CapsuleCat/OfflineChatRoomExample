(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/components/ChatMessages.jsx                                  //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatMessages = React.createClass({                                     // 1
  displayName: 'ChatMessages',                                         //
                                                                       //
  getDefaultProps: function () {                                       // 2
    return {                                                           // 3
      messages: []                                                     // 4
    };                                                                 //
  },                                                                   //
                                                                       //
  componentDidUpdate: function () {                                    // 8
    if (this.refs.messages) {                                          // 9
      var messageContainer = ReactDOM.findDOMNode(this.refs.messages);
                                                                       //
      messageContainer.scrollTop = Number.MAX_VALUE;                   // 12
    }                                                                  //
  },                                                                   //
                                                                       //
  render: function () {                                                // 16
    if (this.props.messages == null || this.props.messages.length === 0) {
      return React.createElement(                                      // 19
        'p',                                                           //
        null,                                                          //
        'No messages'                                                  //
      );                                                               //
    }                                                                  //
                                                                       //
    return React.createElement(                                        // 22
      'div',                                                           //
      { style: { maxHeight: '50vh', overflow: 'auto' }, ref: 'messages' },
      this.props.messages.map(function (source, i) {                   //
        return React.createElement(ChatMessage, {                      // 25
          key: source._id,                                             // 26
          poster: source.poster,                                       // 27
          text: source.text });                                        // 28
      })                                                               //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
