(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/stores/PeerStore.js                                             //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
PeerActions = Reflux.createActions(['open', 'connect', 'disconnect', 'send']);
                                                                       //
PeerStore = Reflux.createStore({                                       // 8
  init: function () {                                                  // 9
    this._key = null;                                                  // 10
    this._connectedToKey = null;                                       // 11
    this._otherKey = null;                                             // 12
    this._peer = null;                                                 // 13
    this._connection = null;                                           // 14
  },                                                                   //
                                                                       //
  _data: function (data) {                                             // 17
    Messages.insert({                                                  // 18
      text: data,                                                      // 19
      poster: 'other',                                                 // 20
      createdAt: new Date()                                            // 21
    });                                                                //
  },                                                                   //
                                                                       //
  open: function (key) {                                               // 25
    this._key = key;                                                   // 26
    this._peer = new Peer(key, { key: 'mx9f1w0bidmibe29' });           // 27
                                                                       //
    this._peer.on('connection', (function (connection) {               // 29
      this._connection = connection;                                   // 30
      this._connectedToKey = connection.peer;                          // 31
                                                                       //
      this._connection.on('data', this._data.bind(this));              // 33
      this._connection.on('close', (function () {                      // 34
        this._connectedToKey = null;                                   // 35
        this._connection = null;                                       // 36
                                                                       //
        this.trigger(this.getInitialState());                          // 38
      }).bind(this));                                                  //
                                                                       //
      this.trigger(this.getInitialState());                            // 42
    }).bind(this));                                                    //
                                                                       //
    this.trigger(this.getInitialState());                              // 46
  },                                                                   //
                                                                       //
  connect: function (otherKey) {                                       // 49
    this._connection = this._peer.connect(otherKey);                   // 50
    this._connectedToKey = otherKey;                                   // 51
                                                                       //
    this._connection.on('data', this._data.bind(this));                // 53
                                                                       //
    this._connection.on('open', (function () {                         // 55
      this._connection.send(this._key + ' has connected');             // 56
    }).bind(this));                                                    //
                                                                       //
    this._connection.on('close', (function () {                        // 59
      this._connectedToKey = null;                                     // 60
      this._connection = null;                                         // 61
                                                                       //
      this.trigger(this.getInitialState());                            // 63
    }).bind(this));                                                    //
                                                                       //
    this.trigger(this.getInitialState());                              // 66
  },                                                                   //
                                                                       //
  disconnect: function () {                                            // 69
    this._connection.close();                                          // 70
                                                                       //
    this._connectedToKey = null;                                       // 72
    this._connection = null;                                           // 73
                                                                       //
    this.trigger(this.getInitialState());                              // 75
  },                                                                   //
                                                                       //
  send: function (text) {                                              // 78
    this._connection.send(text);                                       // 79
  },                                                                   //
                                                                       //
  getInitialState: function () {                                       // 82
    return {                                                           // 83
      hasOpenPeer: this._peer != null,                                 // 84
      hasOpenConnection: this._connection != null,                     // 85
      key: this._key,                                                  // 86
      connectedToKey: this._connectedToKey                             // 87
    };                                                                 //
  }                                                                    //
                                                                       //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
