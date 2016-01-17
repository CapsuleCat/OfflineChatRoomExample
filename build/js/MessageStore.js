(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/stores/MessageStore.js                                          //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
MessageActions = Reflux.createActions(['post']);                       // 1
                                                                       //
MessageStore = Reflux.createStore({                                    // 5
  listenables: [MessageActions],                                       // 6
                                                                       //
  init: function () {                                                  // 8
    this._messages = [];                                               // 9
                                                                       //
    if (Meteor.isClient) {                                             // 11
      Tracker.autorun(Meteor.bindEnvironment((function (computation) {
        this._messages = Messages.find({}, {                           // 13
          sort: { createdAt: 1 }                                       // 14
        }).fetch();                                                    //
                                                                       //
        this.trigger(this.getInitialState());                          // 17
      }).bind(this)));                                                 //
    }                                                                  //
  },                                                                   //
                                                                       //
  post: function (text) {                                              // 22
    this._messages.push({                                              // 23
      text: text,                                                      // 24
      poster: 'me'                                                     // 25
    });                                                                //
                                                                       //
    Messages.insert({                                                  // 28
      text: text,                                                      // 29
      poster: 'me',                                                    // 30
      createdAt: new Date()                                            // 31
    });                                                                //
                                                                       //
    PeerStore.send(text);                                              // 34
  },                                                                   //
                                                                       //
  getInitialState: function () {                                       // 37
    return {                                                           // 38
      messages: this._messages                                         // 39
    };                                                                 //
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
