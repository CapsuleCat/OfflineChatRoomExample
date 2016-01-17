//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var React, ReactDOM, ReactDOMServer;

(function(){

///////////////////////////////////////////////////////////////////////////////////////
//                                                                                   //
// packages/react-runtime/react-runtime.js                                           //
//                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////
                                                                                     //
if (Package["react-runtime-dev"]) {                                                  // 1
  React = Package["react-runtime-dev"].ReactDev;                                     // 2
  ReactDOM = Package["react-runtime-dev"].ReactDOMDev;                               // 3
                                                                                     // 4
  if (Meteor.isServer) {                                                             // 5
    ReactDOMServer = Package["react-runtime-dev"].ReactDOMServerDev;                 // 6
  }                                                                                  // 7
} else if (Package["react-runtime-prod"]) {                                          // 8
  React = Package["react-runtime-prod"].ReactProd;                                   // 9
  ReactDOM = Package["react-runtime-prod"].ReactDOMProd;                             // 10
                                                                                     // 11
  if (Meteor.isServer) {                                                             // 12
    ReactDOMServer = Package["react-runtime-prod"].ReactDOMServerProd;               // 13
  }                                                                                  // 14
} else {                                                                             // 15
  // not sure how this can happen                                                    // 16
  throw new Error("Couldn't find react-runtime-dev or react-runtime-prod packages");
}                                                                                    // 18
                                                                                     // 19
///////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['react-runtime'] = {
  React: React,
  ReactDOM: ReactDOM
};

})();
