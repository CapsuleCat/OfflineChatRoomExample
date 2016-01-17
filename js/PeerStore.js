(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// lib/stores/PeerStore.js                                             //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
PeerActions = Reflux.createActions(['open', 'connect', 'send']);       // 1
                                                                       //
PeerStore = Reflux.createStore({                                       // 7
  init: function () {                                                  // 8
    this._key = null;                                                  // 9
    this._otherKey = null;                                             // 10
    this._peer = null;                                                 // 11
    this._connection = null;                                           // 12
  },                                                                   //
                                                                       //
  _data: function (data) {                                             // 15
    Messages.insert({                                                  // 16
      text: data,                                                      // 17
      from: 'other',                                                   // 18
      createdAt: new Date()                                            // 19
    });                                                                //
  },                                                                   //
                                                                       //
  open: function (key) {                                               // 23
    this._key = key;                                                   // 24
    this._peer = new Peer(key, { key: 'mx9f1w0bidmibe29' });           // 25
                                                                       //
    this._peer.on('connection', (function (connection) {               // 27
      this._connection = connection;                                   // 28
                                                                       //
      this._connection.on('data', this._data.bind(this));              // 30
    }).bind(this));                                                    //
  },                                                                   //
                                                                       //
  connect: function (otherKey) {                                       // 34
    this._connection = this._peer.connect(otherKey);                   // 35
                                                                       //
    this._connection.on('data', this._data.bind(this));                // 37
                                                                       //
    this._connection.on('open', (function () {                         // 39
      this._connection.send(this._key + ' has connected');             // 40
    }).bind(this));                                                    //
  },                                                                   //
                                                                       //
  send: function (text) {                                              // 45
    this._connection.send(text);                                       // 46
  }                                                                    //
                                                                       //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);
