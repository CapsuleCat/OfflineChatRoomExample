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
var Reflux;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/fourquet_reflux/client.browserify.js                                                              //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Reflux = require('reflux');                                                                                   // 1
                                                                                                              // 2
},{"reflux":18}],2:[function(require,module,exports){                                                         //
'use strict';                                                                                                 // 1
                                                                                                              // 2
//                                                                                                            // 3
// We store our EE objects in a plain object whose properties are event names.                                // 4
// If `Object.create(null)` is not supported we prefix the event names with a                                 // 5
// `~` to make sure that the built-in object properties are not overridden or                                 // 6
// used as an attack vector.                                                                                  // 7
// We also assume that `Object.create(null)` is available when the event name                                 // 8
// is an ES6 Symbol.                                                                                          // 9
//                                                                                                            // 10
var prefix = typeof Object.create !== 'function' ? '~' : false;                                               // 11
                                                                                                              // 12
/**                                                                                                           // 13
 * Representation of a single EventEmitter function.                                                          // 14
 *                                                                                                            // 15
 * @param {Function} fn Event handler to be called.                                                           // 16
 * @param {Mixed} context Context for function execution.                                                     // 17
 * @param {Boolean} once Only emit once                                                                       // 18
 * @api private                                                                                               // 19
 */                                                                                                           // 20
function EE(fn, context, once) {                                                                              // 21
  this.fn = fn;                                                                                               // 22
  this.context = context;                                                                                     // 23
  this.once = once || false;                                                                                  // 24
}                                                                                                             // 25
                                                                                                              // 26
/**                                                                                                           // 27
 * Minimal EventEmitter interface that is molded against the Node.js                                          // 28
 * EventEmitter interface.                                                                                    // 29
 *                                                                                                            // 30
 * @constructor                                                                                               // 31
 * @api public                                                                                                // 32
 */                                                                                                           // 33
function EventEmitter() { /* Nothing to set */ }                                                              // 34
                                                                                                              // 35
/**                                                                                                           // 36
 * Holds the assigned EventEmitters by name.                                                                  // 37
 *                                                                                                            // 38
 * @type {Object}                                                                                             // 39
 * @private                                                                                                   // 40
 */                                                                                                           // 41
EventEmitter.prototype._events = undefined;                                                                   // 42
                                                                                                              // 43
/**                                                                                                           // 44
 * Return a list of assigned event listeners.                                                                 // 45
 *                                                                                                            // 46
 * @param {String} event The events that should be listed.                                                    // 47
 * @param {Boolean} exists We only need to know if there are listeners.                                       // 48
 * @returns {Array|Boolean}                                                                                   // 49
 * @api public                                                                                                // 50
 */                                                                                                           // 51
EventEmitter.prototype.listeners = function listeners(event, exists) {                                        // 52
  var evt = prefix ? prefix + event : event                                                                   // 53
    , available = this._events && this._events[evt];                                                          // 54
                                                                                                              // 55
  if (exists) return !!available;                                                                             // 56
  if (!available) return [];                                                                                  // 57
  if (available.fn) return [available.fn];                                                                    // 58
                                                                                                              // 59
  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {                                      // 60
    ee[i] = available[i].fn;                                                                                  // 61
  }                                                                                                           // 62
                                                                                                              // 63
  return ee;                                                                                                  // 64
};                                                                                                            // 65
                                                                                                              // 66
/**                                                                                                           // 67
 * Emit an event to all registered event listeners.                                                           // 68
 *                                                                                                            // 69
 * @param {String} event The name of the event.                                                               // 70
 * @returns {Boolean} Indication if we've emitted an event.                                                   // 71
 * @api public                                                                                                // 72
 */                                                                                                           // 73
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {                                      // 74
  var evt = prefix ? prefix + event : event;                                                                  // 75
                                                                                                              // 76
  if (!this._events || !this._events[evt]) return false;                                                      // 77
                                                                                                              // 78
  var listeners = this._events[evt]                                                                           // 79
    , len = arguments.length                                                                                  // 80
    , args                                                                                                    // 81
    , i;                                                                                                      // 82
                                                                                                              // 83
  if ('function' === typeof listeners.fn) {                                                                   // 84
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);                            // 85
                                                                                                              // 86
    switch (len) {                                                                                            // 87
      case 1: return listeners.fn.call(listeners.context), true;                                              // 88
      case 2: return listeners.fn.call(listeners.context, a1), true;                                          // 89
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;                                      // 90
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;                                  // 91
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;                              // 92
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;                          // 93
    }                                                                                                         // 94
                                                                                                              // 95
    for (i = 1, args = new Array(len -1); i < len; i++) {                                                     // 96
      args[i - 1] = arguments[i];                                                                             // 97
    }                                                                                                         // 98
                                                                                                              // 99
    listeners.fn.apply(listeners.context, args);                                                              // 100
  } else {                                                                                                    // 101
    var length = listeners.length                                                                             // 102
      , j;                                                                                                    // 103
                                                                                                              // 104
    for (i = 0; i < length; i++) {                                                                            // 105
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);                    // 106
                                                                                                              // 107
      switch (len) {                                                                                          // 108
        case 1: listeners[i].fn.call(listeners[i].context); break;                                            // 109
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;                                        // 110
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;                                    // 111
        default:                                                                                              // 112
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {                                    // 113
            args[j - 1] = arguments[j];                                                                       // 114
          }                                                                                                   // 115
                                                                                                              // 116
          listeners[i].fn.apply(listeners[i].context, args);                                                  // 117
      }                                                                                                       // 118
    }                                                                                                         // 119
  }                                                                                                           // 120
                                                                                                              // 121
  return true;                                                                                                // 122
};                                                                                                            // 123
                                                                                                              // 124
/**                                                                                                           // 125
 * Register a new EventListener for the given event.                                                          // 126
 *                                                                                                            // 127
 * @param {String} event Name of the event.                                                                   // 128
 * @param {Functon} fn Callback function.                                                                     // 129
 * @param {Mixed} context The context of the function.                                                        // 130
 * @api public                                                                                                // 131
 */                                                                                                           // 132
EventEmitter.prototype.on = function on(event, fn, context) {                                                 // 133
  var listener = new EE(fn, context || this)                                                                  // 134
    , evt = prefix ? prefix + event : event;                                                                  // 135
                                                                                                              // 136
  if (!this._events) this._events = prefix ? {} : Object.create(null);                                        // 137
  if (!this._events[evt]) this._events[evt] = listener;                                                       // 138
  else {                                                                                                      // 139
    if (!this._events[evt].fn) this._events[evt].push(listener);                                              // 140
    else this._events[evt] = [                                                                                // 141
      this._events[evt], listener                                                                             // 142
    ];                                                                                                        // 143
  }                                                                                                           // 144
                                                                                                              // 145
  return this;                                                                                                // 146
};                                                                                                            // 147
                                                                                                              // 148
/**                                                                                                           // 149
 * Add an EventListener that's only called once.                                                              // 150
 *                                                                                                            // 151
 * @param {String} event Name of the event.                                                                   // 152
 * @param {Function} fn Callback function.                                                                    // 153
 * @param {Mixed} context The context of the function.                                                        // 154
 * @api public                                                                                                // 155
 */                                                                                                           // 156
EventEmitter.prototype.once = function once(event, fn, context) {                                             // 157
  var listener = new EE(fn, context || this, true)                                                            // 158
    , evt = prefix ? prefix + event : event;                                                                  // 159
                                                                                                              // 160
  if (!this._events) this._events = prefix ? {} : Object.create(null);                                        // 161
  if (!this._events[evt]) this._events[evt] = listener;                                                       // 162
  else {                                                                                                      // 163
    if (!this._events[evt].fn) this._events[evt].push(listener);                                              // 164
    else this._events[evt] = [                                                                                // 165
      this._events[evt], listener                                                                             // 166
    ];                                                                                                        // 167
  }                                                                                                           // 168
                                                                                                              // 169
  return this;                                                                                                // 170
};                                                                                                            // 171
                                                                                                              // 172
/**                                                                                                           // 173
 * Remove event listeners.                                                                                    // 174
 *                                                                                                            // 175
 * @param {String} event The event we want to remove.                                                         // 176
 * @param {Function} fn The listener that we need to find.                                                    // 177
 * @param {Mixed} context Only remove listeners matching this context.                                        // 178
 * @param {Boolean} once Only remove once listeners.                                                          // 179
 * @api public                                                                                                // 180
 */                                                                                                           // 181
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {                   // 182
  var evt = prefix ? prefix + event : event;                                                                  // 183
                                                                                                              // 184
  if (!this._events || !this._events[evt]) return this;                                                       // 185
                                                                                                              // 186
  var listeners = this._events[evt]                                                                           // 187
    , events = [];                                                                                            // 188
                                                                                                              // 189
  if (fn) {                                                                                                   // 190
    if (listeners.fn) {                                                                                       // 191
      if (                                                                                                    // 192
           listeners.fn !== fn                                                                                // 193
        || (once && !listeners.once)                                                                          // 194
        || (context && listeners.context !== context)                                                         // 195
      ) {                                                                                                     // 196
        events.push(listeners);                                                                               // 197
      }                                                                                                       // 198
    } else {                                                                                                  // 199
      for (var i = 0, length = listeners.length; i < length; i++) {                                           // 200
        if (                                                                                                  // 201
             listeners[i].fn !== fn                                                                           // 202
          || (once && !listeners[i].once)                                                                     // 203
          || (context && listeners[i].context !== context)                                                    // 204
        ) {                                                                                                   // 205
          events.push(listeners[i]);                                                                          // 206
        }                                                                                                     // 207
      }                                                                                                       // 208
    }                                                                                                         // 209
  }                                                                                                           // 210
                                                                                                              // 211
  //                                                                                                          // 212
  // Reset the array, or remove it completely if we have no more listeners.                                   // 213
  //                                                                                                          // 214
  if (events.length) {                                                                                        // 215
    this._events[evt] = events.length === 1 ? events[0] : events;                                             // 216
  } else {                                                                                                    // 217
    delete this._events[evt];                                                                                 // 218
  }                                                                                                           // 219
                                                                                                              // 220
  return this;                                                                                                // 221
};                                                                                                            // 222
                                                                                                              // 223
/**                                                                                                           // 224
 * Remove all listeners or only the listeners for the specified event.                                        // 225
 *                                                                                                            // 226
 * @param {String} event The event want to remove all listeners for.                                          // 227
 * @api public                                                                                                // 228
 */                                                                                                           // 229
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {                              // 230
  if (!this._events) return this;                                                                             // 231
                                                                                                              // 232
  if (event) delete this._events[prefix ? prefix + event : event];                                            // 233
  else this._events = prefix ? {} : Object.create(null);                                                      // 234
                                                                                                              // 235
  return this;                                                                                                // 236
};                                                                                                            // 237
                                                                                                              // 238
//                                                                                                            // 239
// Alias methods names because people roll like that.                                                         // 240
//                                                                                                            // 241
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;                                           // 242
EventEmitter.prototype.addListener = EventEmitter.prototype.on;                                               // 243
                                                                                                              // 244
//                                                                                                            // 245
// This function doesn't apply anymore.                                                                       // 246
//                                                                                                            // 247
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {                                         // 248
  return this;                                                                                                // 249
};                                                                                                            // 250
                                                                                                              // 251
//                                                                                                            // 252
// Expose the prefix.                                                                                         // 253
//                                                                                                            // 254
EventEmitter.prefixed = prefix;                                                                               // 255
                                                                                                              // 256
//                                                                                                            // 257
// Expose the module.                                                                                         // 258
//                                                                                                            // 259
if ('undefined' !== typeof module) {                                                                          // 260
  module.exports = EventEmitter;                                                                              // 261
}                                                                                                             // 262
                                                                                                              // 263
},{}],3:[function(require,module,exports){                                                                    //
/**                                                                                                           // 1
 * A module of methods that you want to include in all actions.                                               // 2
 * This module is consumed by `createAction`.                                                                 // 3
 */                                                                                                           // 4
"use strict";                                                                                                 // 5
                                                                                                              // 6
module.exports = {};                                                                                          // 7
},{}],4:[function(require,module,exports){                                                                    //
"use strict";                                                                                                 // 1
                                                                                                              // 2
exports.createdStores = [];                                                                                   // 3
                                                                                                              // 4
exports.createdActions = [];                                                                                  // 5
                                                                                                              // 6
exports.reset = function () {                                                                                 // 7
    while (exports.createdStores.length) {                                                                    // 8
        exports.createdStores.pop();                                                                          // 9
    }                                                                                                         // 10
    while (exports.createdActions.length) {                                                                   // 11
        exports.createdActions.pop();                                                                         // 12
    }                                                                                                         // 13
};                                                                                                            // 14
},{}],5:[function(require,module,exports){                                                                    //
"use strict";                                                                                                 // 1
                                                                                                              // 2
var _ = require("./utils"),                                                                                   // 3
    maker = require("./joins").instanceJoinCreator;                                                           // 4
                                                                                                              // 5
/**                                                                                                           // 6
 * Extract child listenables from a parent from their                                                         // 7
 * children property and return them in a keyed Object                                                        // 8
 *                                                                                                            // 9
 * @param {Object} listenable The parent listenable                                                           // 10
 */                                                                                                           // 11
var mapChildListenables = function mapChildListenables(listenable) {                                          // 12
    var i = 0,                                                                                                // 13
        children = {},                                                                                        // 14
        childName;                                                                                            // 15
    for (; i < (listenable.children || []).length; ++i) {                                                     // 16
        childName = listenable.children[i];                                                                   // 17
        if (listenable[childName]) {                                                                          // 18
            children[childName] = listenable[childName];                                                      // 19
        }                                                                                                     // 20
    }                                                                                                         // 21
    return children;                                                                                          // 22
};                                                                                                            // 23
                                                                                                              // 24
/**                                                                                                           // 25
 * Make a flat dictionary of all listenables including their                                                  // 26
 * possible children (recursively), concatenating names in camelCase.                                         // 27
 *                                                                                                            // 28
 * @param {Object} listenables The top-level listenables                                                      // 29
 */                                                                                                           // 30
var flattenListenables = function flattenListenables(listenables) {                                           // 31
    var flattened = {};                                                                                       // 32
    for (var key in listenables) {                                                                            // 33
        var listenable = listenables[key];                                                                    // 34
        var childMap = mapChildListenables(listenable);                                                       // 35
                                                                                                              // 36
        // recursively flatten children                                                                       // 37
        var children = flattenListenables(childMap);                                                          // 38
                                                                                                              // 39
        // add the primary listenable and chilren                                                             // 40
        flattened[key] = listenable;                                                                          // 41
        for (var childKey in children) {                                                                      // 42
            var childListenable = children[childKey];                                                         // 43
            flattened[key + _.capitalize(childKey)] = childListenable;                                        // 44
        }                                                                                                     // 45
    }                                                                                                         // 46
                                                                                                              // 47
    return flattened;                                                                                         // 48
};                                                                                                            // 49
                                                                                                              // 50
/**                                                                                                           // 51
 * A module of methods related to listening.                                                                  // 52
 */                                                                                                           // 53
module.exports = {                                                                                            // 54
                                                                                                              // 55
    /**                                                                                                       // 56
     * An internal utility function used by `validateListening`                                               // 57
     *                                                                                                        // 58
     * @param {Action|Store} listenable The listenable we want to search for                                  // 59
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`                         // 60
     */                                                                                                       // 61
    hasListener: function hasListener(listenable) {                                                           // 62
        var i = 0,                                                                                            // 63
            j,                                                                                                // 64
            listener,                                                                                         // 65
            listenables;                                                                                      // 66
        for (; i < (this.subscriptions || []).length; ++i) {                                                  // 67
            listenables = [].concat(this.subscriptions[i].listenable);                                        // 68
            for (j = 0; j < listenables.length; j++) {                                                        // 69
                listener = listenables[j];                                                                    // 70
                if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {    // 71
                    return true;                                                                              // 72
                }                                                                                             // 73
            }                                                                                                 // 74
        }                                                                                                     // 75
        return false;                                                                                         // 76
    },                                                                                                        // 77
                                                                                                              // 78
    /**                                                                                                       // 79
     * A convenience method that listens to all listenables in the given object.                              // 80
     *                                                                                                        // 81
     * @param {Object} listenables An object of listenables. Keys will be used as callback method names.      // 82
     */                                                                                                       // 83
    listenToMany: function listenToMany(listenables) {                                                        // 84
        var allListenables = flattenListenables(listenables);                                                 // 85
        for (var key in allListenables) {                                                                     // 86
            var cbname = _.callbackName(key),                                                                 // 87
                localname = this[cbname] ? cbname : this[key] ? key : undefined;                              // 88
            if (localname) {                                                                                  // 89
                this.listenTo(allListenables[key], localname, this[cbname + "Default"] || this[localname + "Default"] || localname);
            }                                                                                                 // 91
        }                                                                                                     // 92
    },                                                                                                        // 93
                                                                                                              // 94
    /**                                                                                                       // 95
     * Checks if the current context can listen to the supplied listenable                                    // 96
     *                                                                                                        // 97
     * @param {Action|Store} listenable An Action or Store that should be                                     // 98
     *  listened to.                                                                                          // 99
     * @returns {String|Undefined} An error message, or undefined if there was no problem.                    // 100
     */                                                                                                       // 101
    validateListening: function validateListening(listenable) {                                               // 102
        if (listenable === this) {                                                                            // 103
            return "Listener is not able to listen to itself";                                                // 104
        }                                                                                                     // 105
        if (!_.isFunction(listenable.listen)) {                                                               // 106
            return listenable + " is missing a listen method";                                                // 107
        }                                                                                                     // 108
        if (listenable.hasListener && listenable.hasListener(this)) {                                         // 109
            return "Listener cannot listen to this listenable because of circular loop";                      // 110
        }                                                                                                     // 111
    },                                                                                                        // 112
                                                                                                              // 113
    /**                                                                                                       // 114
     * Sets up a subscription to the given listenable for the context object                                  // 115
     *                                                                                                        // 116
     * @param {Action|Store} listenable An Action or Store that should be                                     // 117
     *  listened to.                                                                                          // 118
     * @param {Function|String} callback The callback to register as event handler                            // 119
     * @param {Function|String} defaultCallback The callback to register as default handler                   // 120
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */                                                                                                       // 122
    listenTo: function listenTo(listenable, callback, defaultCallback) {                                      // 123
        var desub,                                                                                            // 124
            unsubscriber,                                                                                     // 125
            subscriptionobj,                                                                                  // 126
            subs = this.subscriptions = this.subscriptions || [];                                             // 127
        _.throwIf(this.validateListening(listenable));                                                        // 128
        this.fetchInitialState(listenable, defaultCallback);                                                  // 129
        desub = listenable.listen(this[callback] || callback, this);                                          // 130
        unsubscriber = function () {                                                                          // 131
            var index = subs.indexOf(subscriptionobj);                                                        // 132
            _.throwIf(index === -1, "Tried to remove listen already gone from subscriptions list!");          // 133
            subs.splice(index, 1);                                                                            // 134
            desub();                                                                                          // 135
        };                                                                                                    // 136
        subscriptionobj = {                                                                                   // 137
            stop: unsubscriber,                                                                               // 138
            listenable: listenable                                                                            // 139
        };                                                                                                    // 140
        subs.push(subscriptionobj);                                                                           // 141
        return subscriptionobj;                                                                               // 142
    },                                                                                                        // 143
                                                                                                              // 144
    /**                                                                                                       // 145
     * Stops listening to a single listenable                                                                 // 146
     *                                                                                                        // 147
     * @param {Action|Store} listenable The action or store we no longer want to listen to                    // 148
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.                      // 149
     */                                                                                                       // 150
    stopListeningTo: function stopListeningTo(listenable) {                                                   // 151
        var sub,                                                                                              // 152
            i = 0,                                                                                            // 153
            subs = this.subscriptions || [];                                                                  // 154
        for (; i < subs.length; i++) {                                                                        // 155
            sub = subs[i];                                                                                    // 156
            if (sub.listenable === listenable) {                                                              // 157
                sub.stop();                                                                                   // 158
                _.throwIf(subs.indexOf(sub) !== -1, "Failed to remove listen from subscriptions list!");      // 159
                return true;                                                                                  // 160
            }                                                                                                 // 161
        }                                                                                                     // 162
        return false;                                                                                         // 163
    },                                                                                                        // 164
                                                                                                              // 165
    /**                                                                                                       // 166
     * Stops all subscriptions and empties subscriptions array                                                // 167
     */                                                                                                       // 168
    stopListeningToAll: function stopListeningToAll() {                                                       // 169
        var remaining,                                                                                        // 170
            subs = this.subscriptions || [];                                                                  // 171
        while (remaining = subs.length) {                                                                     // 172
            subs[0].stop();                                                                                   // 173
            _.throwIf(subs.length !== remaining - 1, "Failed to remove listen from subscriptions list!");     // 174
        }                                                                                                     // 175
    },                                                                                                        // 176
                                                                                                              // 177
    /**                                                                                                       // 178
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `getInitialState` method.        // 179
     * @param {Action|Store} listenable The publisher we want to get initial state from                       // 180
     * @param {Function|String} defaultCallback The method to receive the data                                // 181
     */                                                                                                       // 182
    fetchInitialState: function fetchInitialState(listenable, defaultCallback) {                              // 183
        defaultCallback = defaultCallback && this[defaultCallback] || defaultCallback;                        // 184
        var me = this;                                                                                        // 185
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getInitialState)) {                      // 186
            var data = listenable.getInitialState();                                                          // 187
            if (data && _.isFunction(data.then)) {                                                            // 188
                data.then(function () {                                                                       // 189
                    defaultCallback.apply(me, arguments);                                                     // 190
                });                                                                                           // 191
            } else {                                                                                          // 192
                defaultCallback.call(this, data);                                                             // 193
            }                                                                                                 // 194
        }                                                                                                     // 195
    },                                                                                                        // 196
                                                                                                              // 197
    /**                                                                                                       // 198
     * The callback will be called once all listenables have triggered at least once.                         // 199
     * It will be invoked with the last emission from each listenable.                                        // 200
     * @param {...Publishers} publishers Publishers that should be tracked.                                   // 201
     * @param {Function|String} callback The method to call when all publishers have emitted                  // 202
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */                                                                                                       // 204
    joinTrailing: maker("last"),                                                                              // 205
                                                                                                              // 206
    /**                                                                                                       // 207
     * The callback will be called once all listenables have triggered at least once.                         // 208
     * It will be invoked with the first emission from each listenable.                                       // 209
     * @param {...Publishers} publishers Publishers that should be tracked.                                   // 210
     * @param {Function|String} callback The method to call when all publishers have emitted                  // 211
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */                                                                                                       // 213
    joinLeading: maker("first"),                                                                              // 214
                                                                                                              // 215
    /**                                                                                                       // 216
     * The callback will be called once all listenables have triggered at least once.                         // 217
     * It will be invoked with all emission from each listenable.                                             // 218
     * @param {...Publishers} publishers Publishers that should be tracked.                                   // 219
     * @param {Function|String} callback The method to call when all publishers have emitted                  // 220
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */                                                                                                       // 222
    joinConcat: maker("all"),                                                                                 // 223
                                                                                                              // 224
    /**                                                                                                       // 225
     * The callback will be called once all listenables have triggered.                                       // 226
     * If a callback triggers twice before that happens, an error is thrown.                                  // 227
     * @param {...Publishers} publishers Publishers that should be tracked.                                   // 228
     * @param {Function|String} callback The method to call when all publishers have emitted                  // 229
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */                                                                                                       // 231
    joinStrict: maker("strict")                                                                               // 232
};                                                                                                            // 233
},{"./joins":12,"./utils":14}],6:[function(require,module,exports){                                           //
"use strict";                                                                                                 // 1
                                                                                                              // 2
var _ = require("./utils");                                                                                   // 3
                                                                                                              // 4
/**                                                                                                           // 5
 * A module of methods for object that you want to be able to listen to.                                      // 6
 * This module is consumed by `createStore` and `createAction`                                                // 7
 */                                                                                                           // 8
module.exports = {                                                                                            // 9
                                                                                                              // 10
    /**                                                                                                       // 11
     * Hook used by the publisher that is invoked before emitting                                             // 12
     * and before `shouldEmit`. The arguments are the ones that the action                                    // 13
     * is invoked with. If this function returns something other than                                         // 14
     * undefined, that will be passed on as arguments for shouldEmit and                                      // 15
     * emission.                                                                                              // 16
     */                                                                                                       // 17
    preEmit: function preEmit() {},                                                                           // 18
                                                                                                              // 19
    /**                                                                                                       // 20
     * Hook used by the publisher after `preEmit` to determine if the                                         // 21
     * event should be emitted with given arguments. This may be overridden                                   // 22
     * in your application, default implementation always returns true.                                       // 23
     *                                                                                                        // 24
     * @returns {Boolean} true if event should be emitted                                                     // 25
     */                                                                                                       // 26
    shouldEmit: function shouldEmit() {                                                                       // 27
        return true;                                                                                          // 28
    },                                                                                                        // 29
                                                                                                              // 30
    /**                                                                                                       // 31
     * Subscribes the given callback for action triggered                                                     // 32
     *                                                                                                        // 33
     * @param {Function} callback The callback to register as event handler                                   // 34
     * @param {Mixed} [optional] bindContext The context to bind the callback with                            // 35
     * @returns {Function} Callback that unsubscribes the registered event handler                            // 36
     */                                                                                                       // 37
    listen: function listen(callback, bindContext) {                                                          // 38
        bindContext = bindContext || this;                                                                    // 39
        var eventHandler = function eventHandler(args) {                                                      // 40
            if (aborted) {                                                                                    // 41
                return;                                                                                       // 42
            }                                                                                                 // 43
            callback.apply(bindContext, args);                                                                // 44
        },                                                                                                    // 45
            me = this,                                                                                        // 46
            aborted = false;                                                                                  // 47
        this.emitter.addListener(this.eventLabel, eventHandler);                                              // 48
        return function () {                                                                                  // 49
            aborted = true;                                                                                   // 50
            me.emitter.removeListener(me.eventLabel, eventHandler);                                           // 51
        };                                                                                                    // 52
    },                                                                                                        // 53
                                                                                                              // 54
    /**                                                                                                       // 55
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)                                       // 56
     */                                                                                                       // 57
    trigger: function trigger() {                                                                             // 58
        var args = arguments,                                                                                 // 59
            pre = this.preEmit.apply(this, args);                                                             // 60
        args = pre === undefined ? args : _.isArguments(pre) ? pre : [].concat(pre);                          // 61
        if (this.shouldEmit.apply(this, args)) {                                                              // 62
            this.emitter.emit(this.eventLabel, args);                                                         // 63
        }                                                                                                     // 64
    },                                                                                                        // 65
                                                                                                              // 66
    /**                                                                                                       // 67
     * Tries to publish the event on the next tick                                                            // 68
     */                                                                                                       // 69
    triggerAsync: function triggerAsync() {                                                                   // 70
        var args = arguments,                                                                                 // 71
            me = this;                                                                                        // 72
        _.nextTick(function () {                                                                              // 73
            me.trigger.apply(me, args);                                                                       // 74
        });                                                                                                   // 75
    },                                                                                                        // 76
                                                                                                              // 77
    /**                                                                                                       // 78
     * Wraps the trigger mechanism with a deferral function.                                                  // 79
     *                                                                                                        // 80
     * @param {Function} callback the deferral function,                                                      // 81
     *        first argument is the resolving function and the                                                // 82
     *        rest are the arguments provided from the previous                                               // 83
     *        trigger invocation                                                                              // 84
     */                                                                                                       // 85
    deferWith: function deferWith(callback) {                                                                 // 86
        var oldTrigger = this.trigger,                                                                        // 87
            ctx = this,                                                                                       // 88
            resolver = function resolver() {                                                                  // 89
            oldTrigger.apply(ctx, arguments);                                                                 // 90
        };                                                                                                    // 91
        this.trigger = function () {                                                                          // 92
            callback.apply(ctx, [resolver].concat([].splice.call(arguments, 0)));                             // 93
        };                                                                                                    // 94
    }                                                                                                         // 95
                                                                                                              // 96
};                                                                                                            // 97
},{"./utils":14}],7:[function(require,module,exports){                                                        //
/**                                                                                                           // 1
 * A module of methods that you want to include in all stores.                                                // 2
 * This module is consumed by `createStore`.                                                                  // 3
 */                                                                                                           // 4
"use strict";                                                                                                 // 5
                                                                                                              // 6
module.exports = {};                                                                                          // 7
},{}],8:[function(require,module,exports){                                                                    //
"use strict";                                                                                                 // 1
                                                                                                              // 2
module.exports = function (store, definition) {                                                               // 3
    for (var name in definition) {                                                                            // 4
        if (Object.getOwnPropertyDescriptor && Object.defineProperty) {                                       // 5
            var propertyDescriptor = Object.getOwnPropertyDescriptor(definition, name);                       // 6
                                                                                                              // 7
            if (!propertyDescriptor.value || typeof propertyDescriptor.value !== "function" || !definition.hasOwnProperty(name)) {
                continue;                                                                                     // 9
            }                                                                                                 // 10
                                                                                                              // 11
            store[name] = definition[name].bind(store);                                                       // 12
        } else {                                                                                              // 13
            var property = definition[name];                                                                  // 14
                                                                                                              // 15
            if (typeof property !== "function" || !definition.hasOwnProperty(name)) {                         // 16
                continue;                                                                                     // 17
            }                                                                                                 // 18
                                                                                                              // 19
            store[name] = property.bind(store);                                                               // 20
        }                                                                                                     // 21
    }                                                                                                         // 22
                                                                                                              // 23
    return store;                                                                                             // 24
};                                                                                                            // 25
},{}],9:[function(require,module,exports){                                                                    //
"use strict";                                                                                                 // 1
                                                                                                              // 2
var _ = require("./utils"),                                                                                   // 3
    ActionMethods = require("./ActionMethods"),                                                               // 4
    PublisherMethods = require("./PublisherMethods"),                                                         // 5
    Keep = require("./Keep");                                                                                 // 6
                                                                                                              // 7
var allowed = { preEmit: 1, shouldEmit: 1 };                                                                  // 8
                                                                                                              // 9
/**                                                                                                           // 10
 * Creates an action functor object. It is mixed in with functions                                            // 11
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may                                          // 12
 * be overridden in the definition object.                                                                    // 13
 *                                                                                                            // 14
 * @param {Object} definition The action object definition                                                    // 15
 */                                                                                                           // 16
var createAction = function createAction(definition) {                                                        // 17
                                                                                                              // 18
    definition = definition || {};                                                                            // 19
    if (!_.isObject(definition)) {                                                                            // 20
        definition = { actionName: definition };                                                              // 21
    }                                                                                                         // 22
                                                                                                              // 23
    for (var a in ActionMethods) {                                                                            // 24
        if (!allowed[a] && PublisherMethods[a]) {                                                             // 25
            throw new Error("Cannot override API method " + a + " in Reflux.ActionMethods. Use another method name or override it on Reflux.PublisherMethods instead.");
        }                                                                                                     // 27
    }                                                                                                         // 28
                                                                                                              // 29
    for (var d in definition) {                                                                               // 30
        if (!allowed[d] && PublisherMethods[d]) {                                                             // 31
            throw new Error("Cannot override API method " + d + " in action creation. Use another method name or override it on Reflux.PublisherMethods instead.");
        }                                                                                                     // 33
    }                                                                                                         // 34
                                                                                                              // 35
    definition.children = definition.children || [];                                                          // 36
    if (definition.asyncResult) {                                                                             // 37
        definition.children = definition.children.concat(["completed", "failed"]);                            // 38
    }                                                                                                         // 39
                                                                                                              // 40
    var i = 0,                                                                                                // 41
        childActions = {};                                                                                    // 42
    for (; i < definition.children.length; i++) {                                                             // 43
        var name = definition.children[i];                                                                    // 44
        childActions[name] = createAction(name);                                                              // 45
    }                                                                                                         // 46
                                                                                                              // 47
    var context = _.extend({                                                                                  // 48
        eventLabel: "action",                                                                                 // 49
        emitter: new _.EventEmitter(),                                                                        // 50
        _isAction: true                                                                                       // 51
    }, PublisherMethods, ActionMethods, definition);                                                          // 52
                                                                                                              // 53
    var functor = function functor() {                                                                        // 54
        var triggerType = functor.sync ? "trigger" : "triggerAsync";                                          // 55
        return functor[triggerType].apply(functor, arguments);                                                // 56
    };                                                                                                        // 57
                                                                                                              // 58
    _.extend(functor, childActions, context);                                                                 // 59
                                                                                                              // 60
    Keep.createdActions.push(functor);                                                                        // 61
                                                                                                              // 62
    return functor;                                                                                           // 63
};                                                                                                            // 64
                                                                                                              // 65
module.exports = createAction;                                                                                // 66
},{"./ActionMethods":3,"./Keep":4,"./PublisherMethods":6,"./utils":14}],10:[function(require,module,exports){
"use strict";                                                                                                 // 1
                                                                                                              // 2
var _ = require("./utils"),                                                                                   // 3
    Keep = require("./Keep"),                                                                                 // 4
    mixer = require("./mixer"),                                                                               // 5
    bindMethods = require("./bindMethods");                                                                   // 6
                                                                                                              // 7
var allowed = { preEmit: 1, shouldEmit: 1 };                                                                  // 8
                                                                                                              // 9
/**                                                                                                           // 10
 * Creates an event emitting Data Store. It is mixed in with functions                                        // 11
 * from the `ListenerMethods` and `PublisherMethods` mixins. `preEmit`                                        // 12
 * and `shouldEmit` may be overridden in the definition object.                                               // 13
 *                                                                                                            // 14
 * @param {Object} definition The data store object definition                                                // 15
 * @returns {Store} A data store instance                                                                     // 16
 */                                                                                                           // 17
module.exports = function (definition) {                                                                      // 18
                                                                                                              // 19
    var StoreMethods = require("./StoreMethods"),                                                             // 20
        PublisherMethods = require("./PublisherMethods"),                                                     // 21
        ListenerMethods = require("./ListenerMethods");                                                       // 22
                                                                                                              // 23
    definition = definition || {};                                                                            // 24
                                                                                                              // 25
    for (var a in StoreMethods) {                                                                             // 26
        if (!allowed[a] && (PublisherMethods[a] || ListenerMethods[a])) {                                     // 27
            throw new Error("Cannot override API method " + a + " in Reflux.StoreMethods. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead.");
        }                                                                                                     // 29
    }                                                                                                         // 30
                                                                                                              // 31
    for (var d in definition) {                                                                               // 32
        if (!allowed[d] && (PublisherMethods[d] || ListenerMethods[d])) {                                     // 33
            throw new Error("Cannot override API method " + d + " in store creation. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead.");
        }                                                                                                     // 35
    }                                                                                                         // 36
                                                                                                              // 37
    definition = mixer(definition);                                                                           // 38
                                                                                                              // 39
    function Store() {                                                                                        // 40
        var i = 0,                                                                                            // 41
            arr;                                                                                              // 42
        this.subscriptions = [];                                                                              // 43
        this.emitter = new _.EventEmitter();                                                                  // 44
        this.eventLabel = "change";                                                                           // 45
        bindMethods(this, definition);                                                                        // 46
        if (this.init && _.isFunction(this.init)) {                                                           // 47
            this.init();                                                                                      // 48
        }                                                                                                     // 49
        if (this.listenables) {                                                                               // 50
            arr = [].concat(this.listenables);                                                                // 51
            for (; i < arr.length; i++) {                                                                     // 52
                this.listenToMany(arr[i]);                                                                    // 53
            }                                                                                                 // 54
        }                                                                                                     // 55
    }                                                                                                         // 56
                                                                                                              // 57
    _.extend(Store.prototype, ListenerMethods, PublisherMethods, StoreMethods, definition);                   // 58
                                                                                                              // 59
    var store = new Store();                                                                                  // 60
    Keep.createdStores.push(store);                                                                           // 61
                                                                                                              // 62
    return store;                                                                                             // 63
};                                                                                                            // 64
},{"./Keep":4,"./ListenerMethods":5,"./PublisherMethods":6,"./StoreMethods":7,"./bindMethods":8,"./mixer":13,"./utils":14}],11:[function(require,module,exports){
"use strict";                                                                                                 // 1
                                                                                                              // 2
Object.defineProperty(exports, "__esModule", {                                                                // 3
    value: true                                                                                               // 4
});                                                                                                           // 5
var Reflux = {                                                                                                // 6
    version: {                                                                                                // 7
        "reflux-core": "0.3.0"                                                                                // 8
    }                                                                                                         // 9
};                                                                                                            // 10
                                                                                                              // 11
Reflux.ActionMethods = require("./ActionMethods");                                                            // 12
                                                                                                              // 13
Reflux.ListenerMethods = require("./ListenerMethods");                                                        // 14
                                                                                                              // 15
Reflux.PublisherMethods = require("./PublisherMethods");                                                      // 16
                                                                                                              // 17
Reflux.StoreMethods = require("./StoreMethods");                                                              // 18
                                                                                                              // 19
Reflux.createAction = require("./createAction");                                                              // 20
                                                                                                              // 21
Reflux.createStore = require("./createStore");                                                                // 22
                                                                                                              // 23
var maker = require("./joins").staticJoinCreator;                                                             // 24
                                                                                                              // 25
Reflux.joinTrailing = Reflux.all = maker("last"); // Reflux.all alias for backward compatibility              // 26
                                                                                                              // 27
Reflux.joinLeading = maker("first");                                                                          // 28
                                                                                                              // 29
Reflux.joinStrict = maker("strict");                                                                          // 30
                                                                                                              // 31
Reflux.joinConcat = maker("all");                                                                             // 32
                                                                                                              // 33
var _ = Reflux.utils = require("./utils");                                                                    // 34
                                                                                                              // 35
Reflux.EventEmitter = _.EventEmitter;                                                                         // 36
                                                                                                              // 37
Reflux.Promise = _.Promise;                                                                                   // 38
                                                                                                              // 39
/**                                                                                                           // 40
 * Convenience function for creating a set of actions                                                         // 41
 *                                                                                                            // 42
 * @param definitions the definitions for the actions to be created                                           // 43
 * @returns an object with actions of corresponding action names                                              // 44
 */                                                                                                           // 45
Reflux.createActions = (function () {                                                                         // 46
    var reducer = function reducer(definitions, actions) {                                                    // 47
        Object.keys(definitions).forEach(function (actionName) {                                              // 48
            var val = definitions[actionName];                                                                // 49
            actions[actionName] = Reflux.createAction(val);                                                   // 50
        });                                                                                                   // 51
    };                                                                                                        // 52
                                                                                                              // 53
    return function (definitions) {                                                                           // 54
        var actions = {};                                                                                     // 55
        if (definitions instanceof Array) {                                                                   // 56
            definitions.forEach(function (val) {                                                              // 57
                if (_.isObject(val)) {                                                                        // 58
                    reducer(val, actions);                                                                    // 59
                } else {                                                                                      // 60
                    actions[val] = Reflux.createAction(val);                                                  // 61
                }                                                                                             // 62
            });                                                                                               // 63
        } else {                                                                                              // 64
            reducer(definitions, actions);                                                                    // 65
        }                                                                                                     // 66
        return actions;                                                                                       // 67
    };                                                                                                        // 68
})();                                                                                                         // 69
                                                                                                              // 70
/**                                                                                                           // 71
 * Sets the eventmitter that Reflux uses                                                                      // 72
 */                                                                                                           // 73
Reflux.setEventEmitter = function (ctx) {                                                                     // 74
    Reflux.EventEmitter = _.EventEmitter = ctx;                                                               // 75
};                                                                                                            // 76
                                                                                                              // 77
/**                                                                                                           // 78
 * Sets the method used for deferring actions and stores                                                      // 79
 */                                                                                                           // 80
Reflux.nextTick = function (nextTick) {                                                                       // 81
    _.nextTick = nextTick;                                                                                    // 82
};                                                                                                            // 83
                                                                                                              // 84
Reflux.use = function (pluginCb) {                                                                            // 85
    pluginCb(Reflux);                                                                                         // 86
};                                                                                                            // 87
                                                                                                              // 88
/**                                                                                                           // 89
 * Provides the set of created actions and stores for introspection                                           // 90
 */                                                                                                           // 91
/*eslint-disable no-underscore-dangle*/                                                                       // 92
Reflux.__keep = require("./Keep");                                                                            // 93
/*eslint-enable no-underscore-dangle*/                                                                        // 94
                                                                                                              // 95
/**                                                                                                           // 96
 * Warn if Function.prototype.bind not available                                                              // 97
 */                                                                                                           // 98
if (!Function.prototype.bind) {                                                                               // 99
    console.error("Function.prototype.bind not available. " + "ES5 shim required. " + "https://github.com/spoike/refluxjs#es5");
}                                                                                                             // 101
                                                                                                              // 102
exports["default"] = Reflux;                                                                                  // 103
module.exports = exports["default"];                                                                          // 104
},{"./ActionMethods":3,"./Keep":4,"./ListenerMethods":5,"./PublisherMethods":6,"./StoreMethods":7,"./createAction":9,"./createStore":10,"./joins":12,"./utils":14}],12:[function(require,module,exports){
/**                                                                                                           // 1
 * Internal module used to create static and instance join methods                                            // 2
 */                                                                                                           // 3
                                                                                                              // 4
"use strict";                                                                                                 // 5
                                                                                                              // 6
var createStore = require("./createStore"),                                                                   // 7
    _ = require("./utils");                                                                                   // 8
                                                                                                              // 9
var slice = Array.prototype.slice,                                                                            // 10
    strategyMethodNames = {                                                                                   // 11
    strict: "joinStrict",                                                                                     // 12
    first: "joinLeading",                                                                                     // 13
    last: "joinTrailing",                                                                                     // 14
    all: "joinConcat"                                                                                         // 15
};                                                                                                            // 16
                                                                                                              // 17
/**                                                                                                           // 18
 * Used in `index.js` to create the static join methods                                                       // 19
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments                  // 20
 * @returns {Function} A static function which returns a store with a join listen on the given listenables using the given strategy
 */                                                                                                           // 22
exports.staticJoinCreator = function (strategy) {                                                             // 23
    return function () /* listenables... */{                                                                  // 24
        var listenables = slice.call(arguments);                                                              // 25
        return createStore({                                                                                  // 26
            init: function init() {                                                                           // 27
                this[strategyMethodNames[strategy]].apply(this, listenables.concat("triggerAsync"));          // 28
            }                                                                                                 // 29
        });                                                                                                   // 30
    };                                                                                                        // 31
};                                                                                                            // 32
                                                                                                              // 33
/**                                                                                                           // 34
 * Used in `ListenerMethods.js` to create the instance join methods                                           // 35
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments                  // 36
 * @returns {Function} An instance method which sets up a join listen on the given listenables using the given strategy
 */                                                                                                           // 38
exports.instanceJoinCreator = function (strategy) {                                                           // 39
    return function () /* listenables..., callback*/{                                                         // 40
        _.throwIf(arguments.length < 2, "Cannot create a join with less than 2 listenables!");                // 41
        var listenables = slice.call(arguments),                                                              // 42
            callback = listenables.pop(),                                                                     // 43
            numberOfListenables = listenables.length,                                                         // 44
            join = {                                                                                          // 45
            numberOfListenables: numberOfListenables,                                                         // 46
            callback: this[callback] || callback,                                                             // 47
            listener: this,                                                                                   // 48
            strategy: strategy                                                                                // 49
        },                                                                                                    // 50
            i,                                                                                                // 51
            cancels = [],                                                                                     // 52
            subobj;                                                                                           // 53
        for (i = 0; i < numberOfListenables; i++) {                                                           // 54
            _.throwIf(this.validateListening(listenables[i]));                                                // 55
        }                                                                                                     // 56
        for (i = 0; i < numberOfListenables; i++) {                                                           // 57
            cancels.push(listenables[i].listen(newListener(i, join), this));                                  // 58
        }                                                                                                     // 59
        reset(join);                                                                                          // 60
        subobj = { listenable: listenables };                                                                 // 61
        subobj.stop = makeStopper(subobj, cancels, this);                                                     // 62
        this.subscriptions = (this.subscriptions || []).concat(subobj);                                       // 63
        return subobj;                                                                                        // 64
    };                                                                                                        // 65
};                                                                                                            // 66
                                                                                                              // 67
// ---- internal join functions ----                                                                          // 68
                                                                                                              // 69
function makeStopper(subobj, cancels, context) {                                                              // 70
    return function () {                                                                                      // 71
        var i,                                                                                                // 72
            subs = context.subscriptions,                                                                     // 73
            index = subs ? subs.indexOf(subobj) : -1;                                                         // 74
        _.throwIf(index === -1, "Tried to remove join already gone from subscriptions list!");                // 75
        for (i = 0; i < cancels.length; i++) {                                                                // 76
            cancels[i]();                                                                                     // 77
        }                                                                                                     // 78
        subs.splice(index, 1);                                                                                // 79
    };                                                                                                        // 80
}                                                                                                             // 81
                                                                                                              // 82
function reset(join) {                                                                                        // 83
    join.listenablesEmitted = new Array(join.numberOfListenables);                                            // 84
    join.args = new Array(join.numberOfListenables);                                                          // 85
}                                                                                                             // 86
                                                                                                              // 87
function newListener(i, join) {                                                                               // 88
    return function () {                                                                                      // 89
        var callargs = slice.call(arguments);                                                                 // 90
        if (join.listenablesEmitted[i]) {                                                                     // 91
            switch (join.strategy) {                                                                          // 92
                case "strict":                                                                                // 93
                    throw new Error("Strict join failed because listener triggered twice.");                  // 94
                case "last":                                                                                  // 95
                    join.args[i] = callargs;break;                                                            // 96
                case "all":                                                                                   // 97
                    join.args[i].push(callargs);                                                              // 98
            }                                                                                                 // 99
        } else {                                                                                              // 100
            join.listenablesEmitted[i] = true;                                                                // 101
            join.args[i] = join.strategy === "all" ? [callargs] : callargs;                                   // 102
        }                                                                                                     // 103
        emitIfAllListenablesEmitted(join);                                                                    // 104
    };                                                                                                        // 105
}                                                                                                             // 106
                                                                                                              // 107
function emitIfAllListenablesEmitted(join) {                                                                  // 108
    for (var i = 0; i < join.numberOfListenables; i++) {                                                      // 109
        if (!join.listenablesEmitted[i]) {                                                                    // 110
            return;                                                                                           // 111
        }                                                                                                     // 112
    }                                                                                                         // 113
    join.callback.apply(join.listener, join.args);                                                            // 114
    reset(join);                                                                                              // 115
}                                                                                                             // 116
},{"./createStore":10,"./utils":14}],13:[function(require,module,exports){                                    //
"use strict";                                                                                                 // 1
                                                                                                              // 2
var _ = require("./utils");                                                                                   // 3
                                                                                                              // 4
module.exports = function mix(def) {                                                                          // 5
    var composed = {                                                                                          // 6
        init: [],                                                                                             // 7
        preEmit: [],                                                                                          // 8
        shouldEmit: []                                                                                        // 9
    };                                                                                                        // 10
                                                                                                              // 11
    var updated = (function mixDef(mixin) {                                                                   // 12
        var mixed = {};                                                                                       // 13
        if (mixin.mixins) {                                                                                   // 14
            mixin.mixins.forEach(function (subMixin) {                                                        // 15
                _.extend(mixed, mixDef(subMixin));                                                            // 16
            });                                                                                               // 17
        }                                                                                                     // 18
        _.extend(mixed, mixin);                                                                               // 19
        Object.keys(composed).forEach(function (composable) {                                                 // 20
            if (mixin.hasOwnProperty(composable)) {                                                           // 21
                composed[composable].push(mixin[composable]);                                                 // 22
            }                                                                                                 // 23
        });                                                                                                   // 24
        return mixed;                                                                                         // 25
    })(def);                                                                                                  // 26
                                                                                                              // 27
    if (composed.init.length > 1) {                                                                           // 28
        updated.init = function () {                                                                          // 29
            var args = arguments;                                                                             // 30
            composed.init.forEach(function (init) {                                                           // 31
                init.apply(this, args);                                                                       // 32
            }, this);                                                                                         // 33
        };                                                                                                    // 34
    }                                                                                                         // 35
    if (composed.preEmit.length > 1) {                                                                        // 36
        updated.preEmit = function () {                                                                       // 37
            return composed.preEmit.reduce((function (args, preEmit) {                                        // 38
                var newValue = preEmit.apply(this, args);                                                     // 39
                return newValue === undefined ? args : [newValue];                                            // 40
            }).bind(this), arguments);                                                                        // 41
        };                                                                                                    // 42
    }                                                                                                         // 43
    if (composed.shouldEmit.length > 1) {                                                                     // 44
        updated.shouldEmit = function () {                                                                    // 45
            var args = arguments;                                                                             // 46
            return !composed.shouldEmit.some(function (shouldEmit) {                                          // 47
                return !shouldEmit.apply(this, args);                                                         // 48
            }, this);                                                                                         // 49
        };                                                                                                    // 50
    }                                                                                                         // 51
    Object.keys(composed).forEach(function (composable) {                                                     // 52
        if (composed[composable].length === 1) {                                                              // 53
            updated[composable] = composed[composable][0];                                                    // 54
        }                                                                                                     // 55
    });                                                                                                       // 56
                                                                                                              // 57
    return updated;                                                                                           // 58
};                                                                                                            // 59
},{"./utils":14}],14:[function(require,module,exports){                                                       //
"use strict";                                                                                                 // 1
                                                                                                              // 2
Object.defineProperty(exports, "__esModule", {                                                                // 3
    value: true                                                                                               // 4
});                                                                                                           // 5
exports.capitalize = capitalize;                                                                              // 6
exports.callbackName = callbackName;                                                                          // 7
exports.isObject = isObject;                                                                                  // 8
exports.extend = extend;                                                                                      // 9
exports.isFunction = isFunction;                                                                              // 10
exports.object = object;                                                                                      // 11
exports.isArguments = isArguments;                                                                            // 12
exports.throwIf = throwIf;                                                                                    // 13
                                                                                                              // 14
function capitalize(string) {                                                                                 // 15
    return string.charAt(0).toUpperCase() + string.slice(1);                                                  // 16
}                                                                                                             // 17
                                                                                                              // 18
function callbackName(string, prefix) {                                                                       // 19
    prefix = prefix || "on";                                                                                  // 20
    return prefix + exports.capitalize(string);                                                               // 21
}                                                                                                             // 22
                                                                                                              // 23
/*                                                                                                            // 24
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in                               // 25
 * order to remove the dependency                                                                             // 26
 */                                                                                                           // 27
                                                                                                              // 28
function isObject(obj) {                                                                                      // 29
    var type = typeof obj;                                                                                    // 30
    return type === "function" || type === "object" && !!obj;                                                 // 31
}                                                                                                             // 32
                                                                                                              // 33
function extend(obj) {                                                                                        // 34
    if (!isObject(obj)) {                                                                                     // 35
        return obj;                                                                                           // 36
    }                                                                                                         // 37
    var source, prop;                                                                                         // 38
    for (var i = 1, length = arguments.length; i < length; i++) {                                             // 39
        source = arguments[i];                                                                                // 40
        for (prop in source) {                                                                                // 41
            if (Object.getOwnPropertyDescriptor && Object.defineProperty) {                                   // 42
                var propertyDescriptor = Object.getOwnPropertyDescriptor(source, prop);                       // 43
                Object.defineProperty(obj, prop, propertyDescriptor);                                         // 44
            } else {                                                                                          // 45
                obj[prop] = source[prop];                                                                     // 46
            }                                                                                                 // 47
        }                                                                                                     // 48
    }                                                                                                         // 49
    return obj;                                                                                               // 50
}                                                                                                             // 51
                                                                                                              // 52
function isFunction(value) {                                                                                  // 53
    return typeof value === "function";                                                                       // 54
}                                                                                                             // 55
                                                                                                              // 56
exports.EventEmitter = require("eventemitter3");                                                              // 57
                                                                                                              // 58
exports.nextTick = function (callback) {                                                                      // 59
    setTimeout(callback, 0);                                                                                  // 60
};                                                                                                            // 61
                                                                                                              // 62
function object(keys, vals) {                                                                                 // 63
    var o = {},                                                                                               // 64
        i = 0;                                                                                                // 65
    for (; i < keys.length; i++) {                                                                            // 66
        o[keys[i]] = vals[i];                                                                                 // 67
    }                                                                                                         // 68
    return o;                                                                                                 // 69
}                                                                                                             // 70
                                                                                                              // 71
function isArguments(value) {                                                                                 // 72
    return typeof value === "object" && "callee" in value && typeof value.length === "number";                // 73
}                                                                                                             // 74
                                                                                                              // 75
function throwIf(val, msg) {                                                                                  // 76
    if (val) {                                                                                                // 77
        throw Error(msg || val);                                                                              // 78
    }                                                                                                         // 79
}                                                                                                             // 80
},{"eventemitter3":2}],15:[function(require,module,exports){                                                  //
var _ = require('reflux-core/lib/utils'),                                                                     // 1
    ListenerMethods = require('reflux-core/lib/ListenerMethods');                                             // 2
                                                                                                              // 3
/**                                                                                                           // 4
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from                   // 5
 * `ListenerMethods` mixin and takes care of teardown of subscriptions.                                       // 6
 * Note that if you're using the `connect` mixin you don't need this mixin, as connect will                   // 7
 * import everything this mixin contains!                                                                     // 8
 */                                                                                                           // 9
module.exports = _.extend({                                                                                   // 10
                                                                                                              // 11
    /**                                                                                                       // 12
     * Cleans up all listener previously registered.                                                          // 13
     */                                                                                                       // 14
    componentWillUnmount: ListenerMethods.stopListeningToAll                                                  // 15
                                                                                                              // 16
}, ListenerMethods);                                                                                          // 17
                                                                                                              // 18
},{"reflux-core/lib/ListenerMethods":5,"reflux-core/lib/utils":14}],16:[function(require,module,exports){     //
var ListenerMethods = require('reflux-core/lib/ListenerMethods'),                                             // 1
    ListenerMixin = require('./ListenerMixin'),                                                               // 2
    _ = require('reflux-core/lib/utils');                                                                     // 3
                                                                                                              // 4
module.exports = function(listenable,key){                                                                    // 5
    return {                                                                                                  // 6
        getInitialState: function(){                                                                          // 7
            if (!_.isFunction(listenable.getInitialState)) {                                                  // 8
                return {};                                                                                    // 9
            } else if (key === undefined) {                                                                   // 10
                return listenable.getInitialState();                                                          // 11
            } else {                                                                                          // 12
                return _.object([key],[listenable.getInitialState()]);                                        // 13
            }                                                                                                 // 14
        },                                                                                                    // 15
        componentDidMount: function(){                                                                        // 16
            _.extend(this,ListenerMethods);                                                                   // 17
            var me = this, cb = (key === undefined ? this.setState : function(v){                             // 18
                if (typeof me.isMounted === "undefined" || me.isMounted() === true) {                         // 19
                    me.setState(_.object([key],[v]));                                                         // 20
                }                                                                                             // 21
            });                                                                                               // 22
            this.listenTo(listenable,cb);                                                                     // 23
        },                                                                                                    // 24
        componentWillUnmount: ListenerMixin.componentWillUnmount                                              // 25
    };                                                                                                        // 26
};                                                                                                            // 27
                                                                                                              // 28
},{"./ListenerMixin":15,"reflux-core/lib/ListenerMethods":5,"reflux-core/lib/utils":14}],17:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods'),                                             // 1
    ListenerMixin = require('./ListenerMixin'),                                                               // 2
    _ = require('reflux-core/lib/utils');                                                                     // 3
                                                                                                              // 4
module.exports = function(listenable, key, filterFunc) {                                                      // 5
    filterFunc = _.isFunction(key) ? key : filterFunc;                                                        // 6
    return {                                                                                                  // 7
        getInitialState: function() {                                                                         // 8
            if (!_.isFunction(listenable.getInitialState)) {                                                  // 9
                return {};                                                                                    // 10
            } else if (_.isFunction(key)) {                                                                   // 11
                return filterFunc.call(this, listenable.getInitialState());                                   // 12
            } else {                                                                                          // 13
                // Filter initial payload from store.                                                         // 14
                var result = filterFunc.call(this, listenable.getInitialState());                             // 15
                if (typeof(result) !== "undefined") {                                                         // 16
                    return _.object([key], [result]);                                                         // 17
                } else {                                                                                      // 18
                    return {};                                                                                // 19
                }                                                                                             // 20
            }                                                                                                 // 21
        },                                                                                                    // 22
        componentDidMount: function() {                                                                       // 23
            _.extend(this, ListenerMethods);                                                                  // 24
            var me = this;                                                                                    // 25
            var cb = function(value) {                                                                        // 26
                if (_.isFunction(key)) {                                                                      // 27
                    me.setState(filterFunc.call(me, value));                                                  // 28
                } else {                                                                                      // 29
                    var result = filterFunc.call(me, value);                                                  // 30
                    me.setState(_.object([key], [result]));                                                   // 31
                }                                                                                             // 32
            };                                                                                                // 33
                                                                                                              // 34
            this.listenTo(listenable, cb);                                                                    // 35
        },                                                                                                    // 36
        componentWillUnmount: ListenerMixin.componentWillUnmount                                              // 37
    };                                                                                                        // 38
};                                                                                                            // 39
                                                                                                              // 40
                                                                                                              // 41
},{"./ListenerMixin":15,"reflux-core/lib/ListenerMethods":5,"reflux-core/lib/utils":14}],18:[function(require,module,exports){
var Reflux = require('reflux-core');                                                                          // 1
                                                                                                              // 2
Reflux.connect = require('./connect');                                                                        // 3
                                                                                                              // 4
Reflux.connectFilter = require('./connectFilter');                                                            // 5
                                                                                                              // 6
Reflux.ListenerMixin = require('./ListenerMixin');                                                            // 7
                                                                                                              // 8
Reflux.listenTo = require('./listenTo');                                                                      // 9
                                                                                                              // 10
Reflux.listenToMany = require('./listenToMany');                                                              // 11
                                                                                                              // 12
module.exports = Reflux;                                                                                      // 13
                                                                                                              // 14
},{"./ListenerMixin":15,"./connect":16,"./connectFilter":17,"./listenTo":19,"./listenToMany":20,"reflux-core":11}],19:[function(require,module,exports){
var ListenerMethods = require('reflux-core/lib/ListenerMethods');                                             // 1
                                                                                                              // 2
/**                                                                                                           // 3
 * A mixin factory for a React component. Meant as a more convenient way of using the `ListenerMixin`,        // 4
 * without having to manually set listeners in the `componentDidMount` method.                                // 5
 *                                                                                                            // 6
 * @param {Action|Store} listenable An Action or Store that should be                                         // 7
 *  listened to.                                                                                              // 8
 * @param {Function|String} callback The callback to register as event handler                                // 9
 * @param {Function|String} defaultCallback The callback to register as default handler                       // 10
 * @returns {Object} An object to be used as a mixin, which sets up the listener for the given listenable.    // 11
 */                                                                                                           // 12
module.exports = function(listenable,callback,initial){                                                       // 13
    return {                                                                                                  // 14
        /**                                                                                                   // 15
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`        // 16
         * and then make the call to `listenTo` with the arguments provided to the factory function           // 17
         */                                                                                                   // 18
        componentDidMount: function() {                                                                       // 19
            for(var m in ListenerMethods){                                                                    // 20
                if (this[m] !== ListenerMethods[m]){                                                          // 21
                    if (this[m]){                                                                             // 22
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";                // 23
                    }                                                                                         // 24
                    this[m] = ListenerMethods[m];                                                             // 25
                }                                                                                             // 26
            }                                                                                                 // 27
            this.listenTo(listenable,callback,initial);                                                       // 28
        },                                                                                                    // 29
        /**                                                                                                   // 30
         * Cleans up all listener previously registered.                                                      // 31
         */                                                                                                   // 32
        componentWillUnmount: ListenerMethods.stopListeningToAll                                              // 33
    };                                                                                                        // 34
};                                                                                                            // 35
                                                                                                              // 36
},{"reflux-core/lib/ListenerMethods":5}],20:[function(require,module,exports){                                //
var ListenerMethods = require('reflux-core/lib/ListenerMethods');                                             // 1
                                                                                                              // 2
/**                                                                                                           // 3
 * A mixin factory for a React component. Meant as a more convenient way of using the `listenerMixin`,        // 4
 * without having to manually set listeners in the `componentDidMount` method. This version is used           // 5
 * to automatically set up a `listenToMany` call.                                                             // 6
 *                                                                                                            // 7
 * @param {Object} listenables An object of listenables                                                       // 8
 * @returns {Object} An object to be used as a mixin, which sets up the listeners for the given listenables.  // 9
 */                                                                                                           // 10
module.exports = function(listenables){                                                                       // 11
    return {                                                                                                  // 12
        /**                                                                                                   // 13
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`        // 14
         * and then make the call to `listenTo` with the arguments provided to the factory function           // 15
         */                                                                                                   // 16
        componentDidMount: function() {                                                                       // 17
            for(var m in ListenerMethods){                                                                    // 18
                if (this[m] !== ListenerMethods[m]){                                                          // 19
                    if (this[m]){                                                                             // 20
                        throw "Can't have other property '"+m+"' when using Reflux.listenToMany!";            // 21
                    }                                                                                         // 22
                    this[m] = ListenerMethods[m];                                                             // 23
                }                                                                                             // 24
            }                                                                                                 // 25
            this.listenToMany(listenables);                                                                   // 26
        },                                                                                                    // 27
        /**                                                                                                   // 28
         * Cleans up all listener previously registered.                                                      // 29
         */                                                                                                   // 30
        componentWillUnmount: ListenerMethods.stopListeningToAll                                              // 31
    };                                                                                                        // 32
};                                                                                                            // 33
                                                                                                              // 34
},{"reflux-core/lib/ListenerMethods":5}]},{},[1])                                                             //
//# sourceMappingURL=/packages/fourquet_reflux/client.browserify.js                                           //
                                                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['fourquet:reflux'] = {
  Reflux: Reflux
};

})();
