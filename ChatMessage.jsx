(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/components/ChatMessage.jsx                                   //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
ChatMessage = React.createClass({                                      // 1
  displayName: 'ChatMessage',                                          //
                                                                       //
  render: function () {                                                // 2
    var styles = {                                                     // 3
      'float': this.props.poster === 'me' ? 'right' : 'left'           // 4
    };                                                                 //
                                                                       //
    var classNames = 'alert ';                                         // 7
                                                                       //
    classNames += this.props.poster === 'me' ? 'alert-info' : 'alert-success';
                                                                       //
    return React.createElement(                                        // 11
      'div',                                                           //
      null,                                                            //
      React.createElement(                                             //
        'div',                                                         //
        { style: styles, className: classNames },                      //
        React.createElement(                                           //
          'p',                                                         //
          null,                                                        //
          this.props.text                                              //
        )                                                              //
      ),                                                               //
      React.createElement('div', { style: { clear: 'both' } })         //
    );                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
