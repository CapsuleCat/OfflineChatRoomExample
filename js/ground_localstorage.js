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
var Random = Package.random.Random;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;
var Store = Package['ground:store'].Store;
var EventEmitter = Package['raix:eventemitter'].EventEmitter;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/ground_localstorage/client.js                                                              //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
// This function will test localstorage to see if its actually available and                           // 1
// working.                                                                                            // 2
var _getLocalStorage = function() {                                                                    // 3
                                                                                                       // 4
  // Set storage to localStorage - if test fails storage is set to null                                // 5
  var storage = window.localStorage;                                                                   // 6
                                                                                                       // 7
  // We initialize the fail flag defaulting to true                                                    // 8
  var fail = true;                                                                                     // 9
                                                                                                       // 10
  // In the test we test the localstorage api setItem/getItem/removeItem this                          // 11
  // uid will hopefully prevent any overwriting of existing data                                       // 12
  var uid = Random.id();                                                                               // 13
                                                                                                       // 14
  try {                                                                                                // 15
    // Use the setItem api                                                                             // 16
    storage.setItem(uid, uid);                                                                         // 17
    // Test the getItem api and check if the value could be set and retrieved                          // 18
    fail = (storage.getItem(uid) !== uid);                                                             // 19
    // Test removeItem and clean up the test data                                                      // 20
    storage.removeItem(uid);                                                                           // 21
                                                                                                       // 22
    // If the test failed then set the storage to null                                                 // 23
    if (fail) {                                                                                        // 24
      storage = null;                                                                                  // 25
    }                                                                                                  // 26
                                                                                                       // 27
  } catch(e) {                                                                                         // 28
    // Noop, cant do much about it                                                                     // 29
  }                                                                                                    // 30
                                                                                                       // 31
  // Return the tested localstorage                                                                    // 32
  return storage;                                                                                      // 33
};                                                                                                     // 34
                                                                                                       // 35
// Get storage if available                                                                            // 36
var _storage = _getLocalStorage();                                                                     // 37
                                                                                                       // 38
                                                                                                       // 39
// Check to see if we got any localstorage to add                                                      // 40
if (_storage) {                                                                                        // 41
                                                                                                       // 42
  // Create a namespace to track storage name spacing                                                  // 43
  var _localStorageNS = {};                                                                            // 44
                                                                                                       // 45
  // Create a noop function                                                                            // 46
  var noop = function() {};                                                                            // 47
                                                                                                       // 48
  // Prefix convention                                                                                 // 49
  var _prefix = function(name) {                                                                       // 50
    return '_storage.' + name;                                                                         // 51
  };                                                                                                   // 52
                                                                                                       // 53
  // Prefix database                                                                                   // 54
  var _prefixDatabase = function(name) {                                                               // 55
    return _prefix(name) + '.db.';                                                                     // 56
  };                                                                                                   // 57
                                                                                                       // 58
  // Prefix database record                                                                            // 59
  var _prefixDatabaseRecord = function(name) {                                                         // 60
    return _prefix(name) + '.record';                                                                  // 61
  };                                                                                                   // 62
                                                                                                       // 63
  // Helper getting and updating the table record                                                      // 64
  var _setTableRecord = function(SAInstance, migrationCallback) {                                      // 65
                                                                                                       // 66
    // Database record name in localstorage                                                            // 67
    var recordName = _prefixDatabaseRecord(SAInstance.name);                                           // 68
                                                                                                       // 69
    // Get the database record                                                                         // 70
    var oldRecordString = _storage.getItem(recordName);                                                // 71
                                                                                                       // 72
    // Set the default empty record object                                                             // 73
    var record = {};                                                                                   // 74
                                                                                                       // 75
    try {                                                                                              // 76
                                                                                                       // 77
      // Get old record object                                                                         // 78
      record = oldRecordString && EJSON.parse(oldRecordString) || {};                                  // 79
                                                                                                       // 80
    } catch(err) {                                                                                     // 81
      // Noop, cant do much about it, we assume that data is lost                                      // 82
    }                                                                                                  // 83
                                                                                                       // 84
    // Set new version helper                                                                          // 85
    var newVersion = SAInstance.version;                                                               // 86
                                                                                                       // 87
    // Set old version helper                                                                          // 88
    var oldVersion = record.version || 1.0;                                                            // 89
                                                                                                       // 90
    // Update the record                                                                               // 91
    record.version = SAInstance.version;                                                               // 92
                                                                                                       // 93
    try {                                                                                              // 94
                                                                                                       // 95
      // Create new record as string                                                                   // 96
      var newRecordString = EJSON.stringify(record);                                                   // 97
                                                                                                       // 98
      // Store the new record                                                                          // 99
      _storage.setItem(recordName, newRecordString);                                                   // 100
                                                                                                       // 101
    } catch(err) {                                                                                     // 102
      // Noop, cant do much here                                                                       // 103
    }                                                                                                  // 104
                                                                                                       // 105
    migrationCallback.call(SAInstance, {                                                               // 106
      version: oldVersion                                                                              // 107
    }, {                                                                                               // 108
      version: newVersion                                                                              // 109
    });                                                                                                // 110
  };                                                                                                   // 111
                                                                                                       // 112
  // Yeah, got it - add the api to the Storage global                                                  // 113
  Store.localStorage = function(options) {                                                             // 114
    var self = this;                                                                                   // 115
                                                                                                       // 116
    if (!(self instanceof Store.localStorage)) {                                                       // 117
      return new Store.localStorage(self.name);                                                        // 118
    }                                                                                                  // 119
                                                                                                       // 120
    // Inheritance EventEmitter                                                                        // 121
    self.eventemitter = new EventEmitter();                                                            // 122
                                                                                                       // 123
    // Make sure options is at least an empty object                                                   // 124
    options = options || {};                                                                           // 125
                                                                                                       // 126
    // Set the name on the instance                                                                    // 127
    self.name = options.name;                                                                          // 128
                                                                                                       // 129
    // Check to see if the storage is already defined                                                  // 130
    if (_localStorageNS[self.name]) {                                                                  // 131
      throw new Error('Storage.localStorage "' + self.name + '" is already in use');                   // 132
    }                                                                                                  // 133
                                                                                                       // 134
    // Make sure that the user dont use '.db.'                                                         // 135
    if (/\.db\./.test(self.name)) {                                                                    // 136
      throw new Error('Storage.localStorage "' + self.name + '" contains ".db." this is not allowed');
    }                                                                                                  // 138
                                                                                                       // 139
    // Set the size of db 0 === disable quota                                                          // 140
    // TODO: Implement                                                                                 // 141
    self.size = options.size || 0;                                                                     // 142
                                                                                                       // 143
    // Set version - if this is bumped then the data is cleared pr. default                            // 144
    // migration                                                                                       // 145
    self.version = options.version || 1.0;                                                             // 146
                                                                                                       // 147
    // Set migration function                                                                          // 148
    var migrationFunction = options.migration || function(oldRecord, newRecord) {                      // 149
                                                                                                       // 150
      // Check storage versions                                                                        // 151
      if (oldRecord.version !== newRecord.version) {                                                   // 152
        // We allow the user to customize a migration algoritme but here we just                       // 153
        // clear the storage if versions mismatch                                                      // 154
        self.clear(noop);                                                                              // 155
      }                                                                                                // 156
    };                                                                                                 // 157
                                                                                                       // 158
    // Store the instance                                                                              // 159
    _localStorageNS[self.name] = self;                                                                 // 160
                                                                                                       // 161
                                                                                                       // 162
    // Set the table record, at the moment this is only handling the version                           // 163
    _setTableRecord(self, migrationFunction);                                                          // 164
                                                                                                       // 165
  };                                                                                                   // 166
                                                                                                       // 167
  // Simple helper to return the storage type name                                                     // 168
  Store.localStorage.prototype.typeName = function() {                                                 // 169
    return 'localStorage';                                                                             // 170
  };                                                                                                   // 171
                                                                                                       // 172
  Store.localStorage.prototype.prefix = function() {                                                   // 173
    var self = this;                                                                                   // 174
    return _prefixDatabase(self.name);                                                                 // 175
  };                                                                                                   // 176
                                                                                                       // 177
  Store.localStorage.prototype.getPrefixedId = function(name) {                                        // 178
    var self = this;                                                                                   // 179
    return self.prefix() + name;                                                                       // 180
  };                                                                                                   // 181
                                                                                                       // 182
  //////////////////////////////////////////////////////////////////////////////                       // 183
  // WRAP LOCALSTORAGE API                                                                             // 184
  //////////////////////////////////////////////////////////////////////////////                       // 185
                                                                                                       // 186
  Store.localStorage.prototype.getItem = function(name, callback) {                                    // 187
    var self = this;                                                                                   // 188
                                                                                                       // 189
    // Check if callback is function                                                                   // 190
    if (typeof callback !== 'function') {                                                              // 191
      throw new Error('Storage.localStorage.getItem require a callback function');                     // 192
    }                                                                                                  // 193
                                                                                                       // 194
    try {                                                                                              // 195
                                                                                                       // 196
      // Get the string value                                                                          // 197
      var jsonObj = _storage.getItem(self.getPrefixedId(name));                                        // 198
                                                                                                       // 199
      // Try to return the object of the parsed string                                                 // 200
      callback(null, jsonObj && EJSON.parse(jsonObj) || jsonObj);                                      // 201
                                                                                                       // 202
    } catch(err) {                                                                                     // 203
      // Callback with error                                                                           // 204
      callback(err);                                                                                   // 205
                                                                                                       // 206
    }                                                                                                  // 207
                                                                                                       // 208
  };                                                                                                   // 209
                                                                                                       // 210
  Store.localStorage.prototype.setItem = function(name, obj, callback) {                               // 211
    var self = this;                                                                                   // 212
                                                                                                       // 213
    // Check if callback is function                                                                   // 214
    if (typeof callback !== 'function') {                                                              // 215
      throw new Error('Storage.localStorage.setItem require a callback function');                     // 216
    }                                                                                                  // 217
                                                                                                       // 218
    try {                                                                                              // 219
                                                                                                       // 220
      // Stringify the object                                                                          // 221
      var jsonObj = EJSON.stringify(obj);                                                              // 222
                                                                                                       // 223
      // Try to set the stringified object                                                             // 224
      callback(null, _storage.setItem(self.getPrefixedId(name), jsonObj));                             // 225
                                                                                                       // 226
    } catch(err) {                                                                                     // 227
                                                                                                       // 228
      // Callback with error                                                                           // 229
      callback(err);                                                                                   // 230
                                                                                                       // 231
    }                                                                                                  // 232
  };                                                                                                   // 233
                                                                                                       // 234
  Store.localStorage.prototype.removeItem = function(name, callback) {                                 // 235
    var self = this;                                                                                   // 236
                                                                                                       // 237
    // Check if callback is function                                                                   // 238
    if (typeof callback !== 'function') {                                                              // 239
      throw new Error('Storage.localStorage.removeItem require a callback function');                  // 240
    }                                                                                                  // 241
                                                                                                       // 242
    try {                                                                                              // 243
                                                                                                       // 244
      // Try to remove the item                                                                        // 245
      callback(null, _storage.removeItem(self.getPrefixedId(name)));                                   // 246
                                                                                                       // 247
    } catch(err) {                                                                                     // 248
                                                                                                       // 249
      // callback with error                                                                           // 250
      callback(err);                                                                                   // 251
                                                                                                       // 252
    }                                                                                                  // 253
  };                                                                                                   // 254
                                                                                                       // 255
  Store.localStorage.prototype.clear = function(callback) {                                            // 256
    var self = this;                                                                                   // 257
                                                                                                       // 258
    // Check if callback is function                                                                   // 259
    if (typeof callback !== 'function') {                                                              // 260
      throw new Error('Storage.localStorage.clear require a callback function');                       // 261
    }                                                                                                  // 262
                                                                                                       // 263
    try {                                                                                              // 264
                                                                                                       // 265
      // Find all relevant keys for this storage                                                       // 266
      self.keys(function(err, keys) {                                                                  // 267
        if (err) {                                                                                     // 268
                                                                                                       // 269
          // On error we just callback                                                                 // 270
          callback(err);                                                                               // 271
                                                                                                       // 272
        } else {                                                                                       // 273
                                                                                                       // 274
          // Iterate over keys and removing them one by one                                            // 275
          for (var i=0; i < keys.length; i++) {                                                        // 276
            self.removeItem(keys[i], noop);                                                            // 277
          }                                                                                            // 278
                                                                                                       // 279
          // Callback                                                                                  // 280
          callback(null, keys.length);                                                                 // 281
        }                                                                                              // 282
      });                                                                                              // 283
                                                                                                       // 284
    } catch(err) {                                                                                     // 285
                                                                                                       // 286
      // callback with error                                                                           // 287
      callback(err);                                                                                   // 288
                                                                                                       // 289
    }                                                                                                  // 290
  };                                                                                                   // 291
                                                                                                       // 292
  Store.localStorage.prototype.keys = function(callback) {                                             // 293
    var self = this;                                                                                   // 294
                                                                                                       // 295
    // Check if callback is function                                                                   // 296
    if (typeof callback !== 'function') {                                                              // 297
      throw new Error('Storage.localStorage.keys require a callback function');                        // 298
    }                                                                                                  // 299
                                                                                                       // 300
    // Result to return                                                                                // 301
    var result = [];                                                                                   // 302
                                                                                                       // 303
    try {                                                                                              // 304
                                                                                                       // 305
      // Create the prefix test                                                                        // 306
      var regex = new RegExp('^' + self.prefix());                                                     // 307
                                                                                                       // 308
      for (var i = 0; i < _storage.length; i++) {                                                      // 309
                                                                                                       // 310
        // Test if the key is relevant to this store                                                   // 311
        if (regex.test(_storage.key(i))) {                                                             // 312
          // Add the name                                                                              // 313
          result.push(_storage.key(i).replace(regex, ''));                                             // 314
        }                                                                                              // 315
      }                                                                                                // 316
                                                                                                       // 317
      // Return the result                                                                             // 318
      callback(null, result);                                                                          // 319
                                                                                                       // 320
    } catch(err) {                                                                                     // 321
                                                                                                       // 322
      // callback with error                                                                           // 323
      callback(err);                                                                                   // 324
                                                                                                       // 325
    }                                                                                                  // 326
  };                                                                                                   // 327
                                                                                                       // 328
  Store.localStorage.prototype.length = function(callback) {                                           // 329
    var self = this;                                                                                   // 330
                                                                                                       // 331
    // Check if callback is function                                                                   // 332
    if (typeof callback !== 'function') {                                                              // 333
      throw new Error('Storage.localStorage.length require a callback function');                      // 334
    }                                                                                                  // 335
                                                                                                       // 336
    try {                                                                                              // 337
                                                                                                       // 338
      // Get the keys                                                                                  // 339
      self.keys(function(error, keys) {                                                                // 340
                                                                                                       // 341
        // Return the length                                                                           // 342
        callback(error, keys && keys.length || null);                                                  // 343
                                                                                                       // 344
      });                                                                                              // 345
                                                                                                       // 346
    } catch(err) {                                                                                     // 347
                                                                                                       // 348
      // callback with error                                                                           // 349
      callback(err);                                                                                   // 350
                                                                                                       // 351
    }                                                                                                  // 352
  };                                                                                                   // 353
                                                                                                       // 354
  Store.localStorage.prototype.toObject = function(callback) {                                         // 355
    var self = this;                                                                                   // 356
                                                                                                       // 357
    // Check if callback is function                                                                   // 358
    if (typeof callback !== 'function') {                                                              // 359
      throw new Error('Storage.localStorage.toObject require a callback function');                    // 360
    }                                                                                                  // 361
                                                                                                       // 362
    // Result to return                                                                                // 363
    var result = {};                                                                                   // 364
                                                                                                       // 365
    try {                                                                                              // 366
                                                                                                       // 367
      // Create the prefix test                                                                        // 368
      var regex = new RegExp('^' + self.prefix());                                                     // 369
                                                                                                       // 370
      for (var i = 0; i < _storage.length; i++) {                                                      // 371
        // Helper                                                                                      // 372
        var key = _storage.key(i);                                                                     // 373
                                                                                                       // 374
        // Test if the key is relevant to this store                                                   // 375
        if (regex.test(key)) {                                                                         // 376
          try {                                                                                        // 377
                                                                                                       // 378
            // Get the string value                                                                    // 379
            var jsonObj = _storage.getItem(key);                                                       // 380
                                                                                                       // 381
            // Try to return the object of the parsed string                                           // 382
            result[key.replace(regex, '')] = jsonObj && EJSON.parse(jsonObj) || jsonObj;               // 383
                                                                                                       // 384
          } catch(err) {                                                                               // 385
            // NOOP                                                                                    // 386
          }                                                                                            // 387
        }                                                                                              // 388
                                                                                                       // 389
      }                                                                                                // 390
                                                                                                       // 391
      // Return the result                                                                             // 392
      callback(null, result);                                                                          // 393
                                                                                                       // 394
    } catch(err) {                                                                                     // 395
                                                                                                       // 396
      // callback with error                                                                           // 397
      callback(err);                                                                                   // 398
                                                                                                       // 399
    }                                                                                                  // 400
  };                                                                                                   // 401
                                                                                                       // 402
  //////////////////////////////////////////////////////////////////////////////                       // 403
  // WRAP EVENTEMITTER API                                                                             // 404
  //////////////////////////////////////////////////////////////////////////////                       // 405
                                                                                                       // 406
  // Wrap the Event Emitter Api "on"                                                                   // 407
  Store.localStorage.prototype.on = function(/* arguments */) {                                        // 408
    this.eventemitter.on.apply(this.eventemitter, _.toArray(arguments));                               // 409
  };                                                                                                   // 410
                                                                                                       // 411
  // Wrap the Event Emitter Api "once"                                                                 // 412
  Store.localStorage.prototype.once = function(/* arguments */) {                                      // 413
    this.eventemitter.once.apply(this.eventemitter, _.toArray(arguments));                             // 414
  };                                                                                                   // 415
                                                                                                       // 416
  // Wrap the Event Emitter Api "off"                                                                  // 417
  Store.localStorage.prototype.off = function(/* arguments */) {                                       // 418
    this.eventemitter.off.apply(this.eventemitter, _.toArray(arguments));                              // 419
  };                                                                                                   // 420
                                                                                                       // 421
  // Wrap the Event Emitter Api "emit"                                                                 // 422
  Store.localStorage.prototype.emit = function(/* arguments */) {                                      // 423
    this.eventemitter.emit.apply(this.eventemitter, _.toArray(arguments));                             // 424
  };                                                                                                   // 425
                                                                                                       // 426
                                                                                                       // 427
  // Add api helpers                                                                                   // 428
  Store.localStorage.prototype.addListener = Store.localStorage.prototype.on;                          // 429
  Store.localStorage.prototype.removeListener = Store.localStorage.prototype.off;                      // 430
  Store.localStorage.prototype.removeAllListeners = Store.localStorage.prototype.off;                  // 431
                                                                                                       // 432
  // Add jquery like helpers                                                                           // 433
  Store.localStorage.prototype.one = Store.localStorage.prototype.once;                                // 434
  Store.localStorage.prototype.trigger = Store.localStorage.prototype.emit;                            // 435
                                                                                                       // 436
                                                                                                       // 437
                                                                                                       // 438
  //////////////////////////////////////////////////////////////////////////////                       // 439
  // WRAP LOCALSTORAGE EVENTHANDLER                                                                    // 440
  //////////////////////////////////////////////////////////////////////////////                       // 441
                                                                                                       // 442
  // This will be a quick test to see if we have any relations to the data                             // 443
  var _prefixedByUs = new RegExp('^' + _prefix(''));                                                   // 444
                                                                                                       // 445
  // Add event handlers                                                                                // 446
  if (typeof window.addEventListener !== 'undefined') {                                                // 447
      // Add support for multiple tabs                                                                 // 448
      window.addEventListener('storage', function(e) {                                                 // 449
      // Data changed in another tab, it would have updated localstorage, I'm                          // 450
      // outdated so reload the tab and localstorage - but we test the prefix on the                   // 451
      // key - since we actually make writes in the localstorage feature test                          // 452
                                                                                                       // 453
      // First of lets make sure that it was actually prefixed by us                                   // 454
      if (e.key && _prefixedByUs.test(e.key)) {                                                        // 455
                                                                                                       // 456
        // Okay, this looks familiar, now we try to lookup the storage instance                        // 457
        // to emit an event on...                                                                      // 458
                                                                                                       // 459
        // Remove the prefix                                                                           // 460
        var noPrefix = e.key.replace(_prefixedByUs, '');                                               // 461
                                                                                                       // 462
        // So we know that the name dont contain suffix ".db."                                         // 463
        var elements = noPrefix.split('.db.');                                                         // 464
                                                                                                       // 465
        var storageName = elements.shift();                                                            // 466
                                                                                                       // 467
        // Get the remaining key                                                                       // 468
        var key = elements.join('.db.');                                                               // 469
                                                                                                       // 470
        // Get the affected storage                                                                    // 471
        var storageAdapter = _localStorageNS[storageName];                                             // 472
                                                                                                       // 473
        if (storageAdapter) {                                                                          // 474
                                                                                                       // 475
          // Emit the event on the storage                                                             // 476
          storageAdapter.emit('storage', {                                                             // 477
            key: key,                                                                                  // 478
            newValue: e.newValue && EJSON.parse(e.newValue) || e.newValue,                             // 479
            oldValue: e.oldValue && EJSON.parse(e.oldValue) || e.oldValue,                             // 480
            originalKey: e.key,                                                                        // 481
            updatedAt: new Date(e.timeStamp),                                                          // 482
            url: e.url,                                                                                // 483
            storage: storageAdapter                                                                    // 484
          });                                                                                          // 485
        }                                                                                              // 486
                                                                                                       // 487
      }                                                                                                // 488
                                                                                                       // 489
    }, false);                                                                                         // 490
}                                                                                                      // 491
                                                                                                       // 492
}                                                                                                      // 493
                                                                                                       // 494
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ground:localstorage'] = {};

})();
