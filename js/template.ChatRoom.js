(function(){
Template.body.addContent((function() {
  var view = this;
  return HTML.Raw('<h1>Chat Room</h1>\n\n  <div id="render-target"></div>');
}));
Meteor.startup(Template.body.renderToDocument);

}).call(this);
