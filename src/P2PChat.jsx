if (Meteor.isClient) {
  Meteor.startup(function () {
    Meteor.disconnect();
    ReactDOM.render(<ChatRoom />, document.getElementById('render-target'));
  });
}