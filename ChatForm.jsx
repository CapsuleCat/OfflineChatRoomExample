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
  handleSubmit: function (e) {                                         // 2
    e.preventDefault();                                                // 3
                                                                       //
    MessageStore.post(this.refs.text.value);                           // 5
                                                                       //
    this.refs.text.value = '';                                         // 7
  },                                                                   //
                                                                       //
  render: function () {                                                // 10
    return React.createElement(                                        // 11
      "form",                                                          //
      { onSubmit: this.handleSubmit },                                 //
      React.createElement("input", { ref: "text", type: "text" })      //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
