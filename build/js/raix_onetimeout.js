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
var OneTimeout;

(function(){

////////////////////////////////////////////////////////////////////////
//                                                                    //
// packages/raix_onetimeout/onetimeout.js                             //
//                                                                    //
////////////////////////////////////////////////////////////////////////
                                                                      //
OneTimeout = function(delay) {                                        // 1
  if (typeof delay === 'undefined') {                                 // 2
    throw new Error('New api');                                       // 3
  }                                                                   // 4
  // Pointer to Meteor.setTimeout                                     // 5
  var id = null;                                                      // 6
  // Save the methods into the localstorage                           // 7
  return function oneTimeout(f) {                                     // 8
    // If a timeout is in progress                                    // 9
    if (id !== null) {                                                // 10
      // then stop the current timeout - we have updates              // 11
      Meteor.clearTimeout(id);                                        // 12
    }                                                                 // 13
    // Spawn new timeout                                              // 14
    id = Meteor.setTimeout(function runOneTimeout() {                 // 15
      // Ok, we reset reference so we dont get cleared and go to work
      id = null;                                                      // 17
      // Run function                                                 // 18
      f();                                                            // 19
      // Delay execution a bit                                        // 20
    }, delay);                                                        // 21
  };                                                                  // 22
};                                                                    // 23
                                                                      // 24
////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['raix:onetimeout'] = {
  OneTimeout: OneTimeout
};

})();
