PeerActions = Reflux.createActions([
  'open',
  'connect',
  'send'
]);

PeerStore = Reflux.createStore({
  init: function () {
    this._key = null;
    this._otherKey = null;
    this._peer = null;
    this._connection = null;
  },

  _data: function(data) {
    Messages.insert({
      text: data,
      from: 'other',
      createdAt: new Date()
    });
  },

  open: function(key) {
    this._key = key;
    this._peer = new Peer(key, {key: 'mx9f1w0bidmibe29'});

    this._peer.on('connection', function (connection) {
      this._connection = connection;

      this._connection.on('data', this._data.bind(this));
    }.bind(this));
  },

  connect: function (otherKey) {
    this._connection = this._peer.connect(otherKey);

    this._connection.on('data', this._data.bind(this));

    this._connection.on('open', function () {
      this._connection.send(this._key + ' has connected');
    }.bind(this));
  },


  send: function (text) {
    this._connection.send(text);
  }

})