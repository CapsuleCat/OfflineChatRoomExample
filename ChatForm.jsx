(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/components/ChatForm.jsx                                      //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatForm = React.createClass({                                         // 1
  displayName: "ChatForm",                                             //
                                                                       //
  getDefaultProps: function () {                                       // 2
    return {                                                           // 3
      hasOpenConnection: false                                         // 4
    };                                                                 //
  },                                                                   //
                                                                       //
  handleSubmit: function (e) {                                         // 8
    e.preventDefault();                                                // 9
                                                                       //
    MessageStore.post(this.refs.text.value);                           // 11
                                                                       //
    this.refs.text.value = '';                                         // 13
  },                                                                   //
                                                                       //
  render: function () {                                                // 16
    if (!this.props.hasOpenConnection) {                               // 17
      return React.createElement("div", null);                         // 18
    }                                                                  //
                                                                       //
    return React.createElement(                                        // 21
      "form",                                                          //
      { onSubmit: this.handleSubmit },                                 //
      React.createElement(                                             //
        "div",                                                         //
        { className: "form-group" },                                   //
        React.createElement("input", { className: "form-control", ref: "text", type: "text" })
      )                                                                //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
