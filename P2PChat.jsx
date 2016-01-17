if (Meteor.isClient) {
  Meteor.startup(function () {
    ReactDOM.render(<ChatRoom />, document.getElementById('render-target'));
  });
}