MessageActions = Reflux.createActions([
  'post'
]);

MessageStore = Reflux.createStore({
  listenables: [MessageActions],

  init: function () {
    this._messages = [];

    if (Meteor.isClient) {
      Tracker.autorun(Meteor.bindEnvironment(function (computation) {
        this._messages = Messages.find({}, {
          sort: { createdAt: 1 }
        }).fetch();

        this.trigger(this.getInitialState());
      }.bind(this)));
    }
  },

  post: function (text) {
    this._messages.push({
      text: text,
      poster: 'me'
    });

    Messages.insert({
      text: text,
      poster: 'me',
      createdAt: new Date()
    });

    PeerStore.send(text);
  },

  getInitialState: function () {
    return {
      messages: this._messages
    }
  }
});
