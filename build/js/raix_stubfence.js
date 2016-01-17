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
var Mongo = Package.mongo.Mongo;
var DDP = Package['ddp-client'].DDP;
var _ = Package.underscore._;

/* Package-scope variables */
var _DDP;

(function(){

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// packages/raix_stubfence/util.js                                               //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
/* global _DDP:true */                                                           // 1
                                                                                 // 2
_DDP = Package.ddp && Package.ddp.LivedataTest;                                  // 3
                                                                                 // 4
if (_DDP) {                                                                      // 5
  _DDP = _DDP.Connection && _DDP.Connection.prototype;                           // 6
} else {                                                                         // 7
  _DDP = Meteor.connection.__proto__; // jshint ignore:line                      // 8
}                                                                                // 9
                                                                                 // 10
if (!_DDP) {                                                                     // 11
  throw new Error('Arg! Meteor just broke raix:stubfence! Please report to @raix at github, and he will work his butt' +
    ' off trying to fix this');                                                  // 13
}                                                                                // 14
                                                                                 // 15
///////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// packages/raix_stubfence/nostub.js                                             //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
/* global _DDP:false */                                                          // 1
var inFence = 0;                                                                 // 2
                                                                                 // 3
_DDP.stubFence = function(names, f) {                                            // 4
  var self = this;                                                               // 5
                                                                                 // 6
  if (++inFence !== 1) {                                                         // 7
    inFence--;                                                                   // 8
    throw new Error('stubFence cannot lock since another stubFence is running');
  }                                                                              // 10
                                                                                 // 11
  // Take string or array of string                                              // 12
  if (names === ''+names) {                                                      // 13
    names = [names];                                                             // 14
  }                                                                              // 15
                                                                                 // 16
  // Carrier for super of methods                                                // 17
  var supers = {};                                                               // 18
                                                                                 // 19
  // Store supers                                                                // 20
  _.each(names, function(name) {                                                 // 21
                                                                                 // 22
    // Check that the method exists                                              // 23
    if (self._methodHandlers[name]) {                                            // 24
      supers[name] = self._methodHandlers[name];                                 // 25
    } else {                                                                     // 26
      throw new Error('stubFence could not find method "' + name + '"');         // 27
    }                                                                            // 28
                                                                                 // 29
  });                                                                            // 30
                                                                                 // 31
  // Check that we got any supers to stubFence                                   // 32
  if (names.length) {                                                            // 33
                                                                                 // 34
    // Remove the stub                                                           // 35
    _.each(supers, function(f, name) {                                           // 36
      self._methodHandlers[name] = null;                                         // 37
    });                                                                          // 38
                                                                                 // 39
    // Run the code                                                              // 40
    f();                                                                         // 41
                                                                                 // 42
    // Insert the stub again                                                     // 43
    _.each(supers, function(f, name) {                                           // 44
      self._methodHandlers[name] = f;                                            // 45
    });                                                                          // 46
  } else {                                                                       // 47
    throw new Error('stubFence, no methods found');                              // 48
  }                                                                              // 49
                                                                                 // 50
  inFence--;                                                                     // 51
};                                                                               // 52
                                                                                 // 53
Mongo.Collection.prototype.stubFence = function(f) {                             // 54
  var self = this;                                                               // 55
                                                                                 // 56
  // Make sure we got a collection name                                          // 57
  if (!self._name) {                                                             // 58
    throw new Error('Dont run stubFence on an annonymous collection');           // 59
  }                                                                              // 60
                                                                                 // 61
  // Make sure we got a connection                                               // 62
  if (self._connection) {                                                        // 63
    // The main collection methods                                               // 64
    var collectionMethods = [                                                    // 65
      '/' + self._name + '/insert',                                              // 66
      '/' + self._name + '/remove',                                              // 67
      '/' + self._name + '/update'                                               // 68
    ];                                                                           // 69
                                                                                 // 70
    // Run the connection stubFence                                              // 71
    self._connection.stubFence(collectionMethods, f);                            // 72
                                                                                 // 73
  } else {                                                                       // 74
    throw new Error('Dont run stubFence on a collection with no connection');    // 75
  }                                                                              // 76
};                                                                               // 77
                                                                                 // 78
///////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['raix:stubfence'] = {};

})();
