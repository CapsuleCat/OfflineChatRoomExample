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
var _ = Package.underscore._;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var EJSON = Package.ejson.EJSON;
var _groundUtil = Package['ground:util']._groundUtil;
var Ground = Package['ground:util'].Ground;
var ServerTime = Package['ground:servertime'].ServerTime;
var EventEmitter = Package['raix:eventemitter'].EventEmitter;
var OneTimeout = Package['raix:onetimeout'].OneTimeout;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Kernel = Package['dispatch:kernel'].Kernel;
var MiniMax = Package['ground:minimax'].MiniMax;
var Store = Package['ground:store'].Store;

/* Package-scope variables */
var GroundDB, Ground;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ground_db/groundDB.client.js                                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/*                                                                                                                   // 1
               ______                           ______  ____                                                         // 2
              / ____/________  __  ______  ____/ / __ \/ __ )                                                        // 3
             / / __/ ___/ __ \/ / / / __ \/ __  / / / / __  |                                                        // 4
            / /_/ / /  / /_/ / /_/ / / / / /_/ / /_/ / /_/ /                                                         // 5
            \____/_/   \____/\__,_/_/ /_/\__,_/_____/_____/                                                          // 6
                                                                                                                     // 7
                                                                                                                     // 8
GroundDB is a thin layer providing Meteor offline database and methods                                               // 9
                                                                                                                     // 10
Concept, localstorage is simple wide spread but slow                                                                 // 11
                                                                                                                     // 12
GroundDB saves outstanding methods and minimongo into localstorage at window                                         // 13
unload, but can be configured to save at any changes and at certain interval(ms)                                     // 14
                                                                                                                     // 15
When the app loads GroundDB resumes methods and database changes                                                     // 16
                                                                                                                     // 17
Regz. RaiX                                                                                                           // 18
                                                                                                                     // 19
*/                                                                                                                   // 20
                                                                                                                     // 21
/* global Ground: true */                                                                                            // 22
/* global GroundDB: true */       // This global is deprecating */                                                   // 23
/* global MiniMax: false */       // ground:minimax */                                                               // 24
/* global _groundUtil: false */   // ground:util */                                                                  // 25
/* global OneTimeout: false */    // ground:util - use _.debounce instead */                                         // 26
/* global Store: false */         // ground:store */                                                                 // 27
/* global EventEmitter: false */  // raix:eventemitter */                                                            // 28
/* global Kernel: false */        // dispatch:kernel */                                                              // 29
                                                                                                                     // 30
///////////////////////////////// TEST BED /////////////////////////////////////                                     // 31
                                                                                                                     // 32
var test;                                                                                                            // 33
                                                                                                                     // 34
try {                                                                                                                // 35
  test = Package['ground:test'].GroundTest;                                                                          // 36
  console.warn('## IN TEST MODE');                                                                                   // 37
} catch(err) {                                                                                                       // 38
  // Production noop                                                                                                 // 39
  test = {                                                                                                           // 40
    log: function() {},                                                                                              // 41
    debug: function() {},                                                                                            // 42
    isMain: false                                                                                                    // 43
  };                                                                                                                 // 44
}                                                                                                                    // 45
                                                                                                                     // 46
//////////////////////////////// GROUND DATABASE ///////////////////////////////                                     // 47
                                                                                                                     // 48
// XXX: This usage of minimax could be extended to letting the user add more                                         // 49
// words to the dictionary - but its not without danger and should prop. trigger                                     // 50
// some warning if no migration scheme is setup...                                                                   // 51
var MiniMaxDB = new MiniMax({                                                                                        // 52
  // We add the most general words in databases                                                                      // 53
 dictionary: ['_id', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy']                                             // 54
});                                                                                                                  // 55
                                                                                                                     // 56
var MiniMaxMethods = new MiniMax({                                                                                   // 57
  // We add the most general words in databases                                                                      // 58
  dictionary: ['method', 'args', 'options', 'wait', '_id']                                                           // 59
});                                                                                                                  // 60
                                                                                                                     // 61
// Status of app reload                                                                                              // 62
var _isReloading = false;                                                                                            // 63
                                                                                                                     // 64
// Add a pointer register of grounded databases                                                                      // 65
var _groundDatabases = {};                                                                                           // 66
                                                                                                                     // 67
var noop = function noop() {};                                                                                       // 68
                                                                                                                     // 69
// This function will add a emitter for the "changed" event                                                          // 70
var _addChangedEmitter = function _addChangedEmitter() {                                                             // 71
  var self = this;                                                                                                   // 72
  // Reactive deps for when data changes                                                                             // 73
  var _dataChanged = new Tracker.Dependency();                                                                       // 74
                                                                                                                     // 75
  var _changeData = function _changeData() { _dataChanged.changed(); };                                              // 76
                                                                                                                     // 77
  Tracker.autorun(function _changeDataAutorun() {                                                                    // 78
    // Depend on data change                                                                                         // 79
    _dataChanged.depend();                                                                                           // 80
    // Emit changed                                                                                                  // 81
    self.collection.emit('changed');                                                                                 // 82
  });                                                                                                                // 83
                                                                                                                     // 84
  // Observe all changes and rely on the less agressive observer system for                                          // 85
  // providing a reasonable update frequens                                                                          // 86
  self.collection.find().observe({                                                                                   // 87
    'added': _changeData,                                                                                            // 88
    'changed': _changeData,                                                                                          // 89
    'removed': _changeData                                                                                           // 90
  });                                                                                                                // 91
};                                                                                                                   // 92
                                                                                                                     // 93
// Clean up the local data and align to the subscription                                                             // 94
var _cleanUpLocalData = function _cleanUpLocalData() {                                                               // 95
  var self = this;                                                                                                   // 96
  // Flag marking if the local data is cleaned up to match the subscription                                          // 97
  self.isCleanedUp = false;                                                                                          // 98
                                                                                                                     // 99
  Tracker.autorun(function _cleanUpLocalDataAutorun(computation) {                                                   // 100
    if (Ground.ready() && !self.isCleanedUp) {                                                                       // 101
      // If all subscriptions have updated the system then remove all local only                                     // 102
      // data?                                                                                                       // 103
      // console.log('Clean up ' + self.name);                                                                       // 104
      self.isCleanedUp = true;                                                                                       // 105
      _removeLocalOnly.call(self);                                                                                   // 106
                                                                                                                     // 107
      // Stop this listener                                                                                          // 108
      computation.stop();                                                                                            // 109
    }                                                                                                                // 110
  });                                                                                                                // 111
};                                                                                                                   // 112
                                                                                                                     // 113
// Setup the syncronization of tabs                                                                                  // 114
var _setupTabSyncronizer = function _setupTabSyncronizer() {                                                         // 115
  var self = this;                                                                                                   // 116
  // We check to see if database sync is supported, if so we sync the database                                       // 117
  // if data has changed in other tabs                                                                               // 118
  if (typeof _syncDatabase === 'function') {                                                                         // 119
                                                                                                                     // 120
    // Listen for data changes                                                                                       // 121
    self.storage.addListener('storage', function _setupTabSyncronizerListener() {                                    // 122
                                                                                                                     // 123
      // Database changed in another tab - sync this db                                                              // 124
      _syncDatabase.call(self);                                                                                      // 125
                                                                                                                     // 126
    });                                                                                                              // 127
                                                                                                                     // 128
  }                                                                                                                  // 129
};                                                                                                                   // 130
                                                                                                                     // 131
// Rig the change listener and make sure to store the data to local storage                                          // 132
var _setupDataStorageOnChange = function _setupDataStorageOnChange() {                                               // 133
  var self = this;                                                                                                   // 134
                                                                                                                     // 135
  // Add listener, is triggered on data change                                                                       // 136
  self.collection.addListener('changed', function _setupDataStorageOnChangeListener() {                              // 137
                                                                                                                     // 138
    // Store the database in store when ever theres a change                                                         // 139
    // the _saveDatabase will throttle to optimize                                                                   // 140
    _saveDatabase.call(self);                                                                                        // 141
                                                                                                                     // 142
  });                                                                                                                // 143
};                                                                                                                   // 144
                                                                                                                     // 145
// This is the actual grounddb instance                                                                              // 146
var _groundDbConstructor = function _groundDbConstructor(collection, options) {                                      // 147
  var self = this;                                                                                                   // 148
                                                                                                                     // 149
  // Check if user used the "new" keyword                                                                            // 150
  if (!(self instanceof _groundDbConstructor)) {                                                                     // 151
    throw new Error('_groundDbConstructor expects the use of the "new" keyword');                                    // 152
  }                                                                                                                  // 153
                                                                                                                     // 154
  self.collection = collection;                                                                                      // 155
                                                                                                                     // 156
  // Set Ground.Collection prefix for localstorage                                                                   // 157
  var _prefix = options && options.prefix || '';                                                                     // 158
                                                                                                                     // 159
  // Set helper to connection                                                                                        // 160
  self.connection = collection._connection;                                                                          // 161
                                                                                                                     // 162
  // Set helper to minimongo collection                                                                              // 163
  self._collection = collection._collection;                                                                         // 164
                                                                                                                     // 165
  // Is this an offline client only database?                                                                        // 166
  self.offlineDatabase = (self.connection === null);                                                                 // 167
                                                                                                                     // 168
  // Initialize collection name                                                                                      // 169
  // XXX: Using null as a name is a problem - only one may be called null                                            // 170
  self.name = (collection._name)? collection._name : 'null';                                                         // 171
                                                                                                                     // 172
  /////// Finally got a name... and rigged                                                                           // 173
                                                                                                                     // 174
  // One timeout pointer for database saves                                                                          // 175
  self._saveDatabaseTimeout = new OneTimeout(200);                                                                   // 176
                                                                                                                     // 177
  // Rig resume for this collection                                                                                  // 178
  if (!self.offlineDatabase && options.resume !== false) {                                                           // 179
                                                                                                                     // 180
    Ground.methodResume([                                                                                            // 181
      '/' + self.name + '/insert',                                                                                   // 182
      '/' + self.name + '/remove',                                                                                   // 183
      '/' + self.name + '/update'                                                                                    // 184
    ], self.connection);                                                                                             // 185
                                                                                                                     // 186
  }                                                                                                                  // 187
                                                                                                                     // 188
  // Get the best storage available                                                                                  // 189
  self.storage = Store.create({                                                                                      // 190
    // We allow the user to set a prefix for the storage. Its mainly ment for                                        // 191
    // testing purposes, since the prefixing allows the tests to simulate more                                       // 192
    // complex scenarios                                                                                             // 193
    name: _prefix + self.name,                                                                                       // 194
    // Default version is 1.0 - if different from the one in storage record it                                       // 195
    // would trigger a migration                                                                                     // 196
    version: options.version || 1.1,                                                                                 // 197
    // migration can be set to overwrite the default behaviour on the storage.                                       // 198
    // the options.migration should be a function(oldRecord, newRecord)                                              // 199
    // one can compare the oldRecord.version and the new version to ensure                                           // 200
    // correct migration steps.                                                                                      // 201
    // That said the default behaviour simply clears the storage.                                                    // 202
    migration: options.migration                                                                                     // 203
  });                                                                                                                // 204
                                                                                                                     // 205
  // Rig an event handler on Meteor.Collection                                                                       // 206
  collection.eventemitter = new EventEmitter();                                                                      // 207
                                                                                                                     // 208
  // Add to pointer register                                                                                         // 209
  // XXX: should we throw an error if already found?                                                                 // 210
  // Store.create will prop. throw an error before...                                                                // 211
  _groundDatabases[ self.name ] = self;                                                                              // 212
                                                                                                                     // 213
  // We have to allow the minimongo collection to contain data before                                                // 214
  // subscriptions are ready                                                                                         // 215
  _hackMeteorUpdate.call(self);                                                                                      // 216
                                                                                                                     // 217
  // Flag true/false depending if database is loaded from local                                                      // 218
  self._databaseLoaded = false;                                                                                      // 219
                                                                                                                     // 220
  // Map local-only - this makes sure that localstorage matches remote loaded db                                     // 221
  self._localOnly = {};                                                                                              // 222
                                                                                                                     // 223
  // Clean up the database and align to subscription - we dont do this for                                           // 224
  // pure offline databases                                                                                          // 225
  if (options.cleanupLocalData && !self.offlineDatabase) {                                                           // 226
    _cleanUpLocalData.call(self);                                                                                    // 227
  }                                                                                                                  // 228
                                                                                                                     // 229
  // Add api for Clean up local only data                                                                            // 230
  // If passing query we'll remove only those that pass it (and of course are only local)                            // 231
  self.collection.removeLocalOnly = function removeLocalOnly(query) {                                                // 232
    self.isCleanedUp = true;                                                                                         // 233
    _removeLocalOnly.call(self, query);                                                                              // 234
  };                                                                                                                 // 235
                                                                                                                     // 236
  self.collection.clear = function clear(callback) {                                                                 // 237
                                                                                                                     // 238
    if (typeof callback !== 'function') { callback = noop; }                                                         // 239
                                                                                                                     // 240
    // Clean storage                                                                                                 // 241
    self.storage.clear(callback);                                                                                    // 242
                                                                                                                     // 243
    // Empty collection                                                                                              // 244
    self._collection.remove({});                                                                                     // 245
    // // Set empty map                                                                                              // 246
    // _groundUtil.setDatabaseMap(self, {});                                                                         // 247
                                                                                                                     // 248
    // // Invalidate the database                                                                                    // 249
    // _groundUtil.invalidateDb(self);                                                                               // 250
  };                                                                                                                 // 251
                                                                                                                     // 252
  // Add the emitter of "changed" events                                                                             // 253
  _addChangedEmitter.call(self);                                                                                     // 254
                                                                                                                     // 255
  // The data changes should be stored in storage                                                                    // 256
  _setupDataStorageOnChange.call(self);                                                                              // 257
                                                                                                                     // 258
  // Load the database as soon as possible                                                                           // 259
  _loadDatabase.call(self);                                                                                          // 260
                                                                                                                     // 261
  // Add tab syncronizer                                                                                             // 262
  _setupTabSyncronizer.call(self);                                                                                   // 263
                                                                                                                     // 264
};                                                                                                                   // 265
                                                                                                                     // 266
// Global helper for applying grounddb on a collection                                                               // 267
Ground.Collection = function groundCollection(name, options) {                                                       // 268
  var self;                                                                                                          // 269
                                                                                                                     // 270
  // Inheritance Meteor Collection can be set by options.collection                                                  // 271
  // Accepts smart collections by Arunoda Susiripala                                                                 // 272
  // Check if user used the "new" keyword                                                                            // 273
                                                                                                                     // 274
                                                                                                                     // 275
  // Make sure we got some options                                                                                   // 276
  options = _.extend({                                                                                               // 277
    // By default local data is cleaned up when all subscriptions are ready                                          // 278
    // but thats not what we would do always                                                                         // 279
    cleanupLocalData: true                                                                                           // 280
  }, options);                                                                                                       // 281
                                                                                                                     // 282
  // Either name is a Meteor collection or we create a new Meteor collection                                         // 283
  if (name instanceof _groundUtil.Collection) {                                                                      // 284
    self = name;                                                                                                     // 285
  } else {                                                                                                           // 286
    self = new _groundUtil.Collection(name, options);                                                                // 287
  }                                                                                                                  // 288
                                                                                                                     // 289
  // Throw an error if something went wrong                                                                          // 290
  if (!(self instanceof _groundUtil.Collection)) {                                                                   // 291
    throw new Error('Ground.Collection expected a Mongo.Collection');                                                // 292
  }                                                                                                                  // 293
                                                                                                                     // 294
  // Add grounddb to the collection, circular reference since self is                                                // 295
  // grounddb.collection                                                                                             // 296
  self.grounddb = new _groundDbConstructor(self, options);                                                           // 297
                                                                                                                     // 298
  // Return grounded collection - We dont return this eg if it was an instance                                       // 299
  // of Ground.Collection                                                                                            // 300
  return self;                                                                                                       // 301
};                                                                                                                   // 302
                                                                                                                     // 303
////////////////////////////////////////////////////////////////////////////////                                     // 304
// Private Methods                                                                                                   // 305
////////////////////////////////////////////////////////////////////////////////                                     // 306
                                                                                                                     // 307
/*                                                                                                                   // 308
                                                                                                                     // 309
TODO: Implement conflict resoultion                                                                                  // 310
                                                                                                                     // 311
The _hackMeteorUpdate should be modified to resolve conflicts via default or                                         // 312
custom conflict handler.                                                                                             // 313
                                                                                                                     // 314
The first thing we have to do is to solve the "remove" operation - Its quite                                         // 315
tricky and there are a couple of patterns we could follow:                                                           // 316
                                                                                                                     // 317
1. Create a register for removed docs - but how long should we store this data?                                      // 318
2. Stop the real remove, add a removedAt serverStamp in an empty doc instead                                         // 319
3. Find a way to get a removedAt timestamp in another way                                                            // 320
                                                                                                                     // 321
So we cant trust that having the data at the server makes everything ok,                                             // 322
                                                                                                                     // 323
---                                                                                                                  // 324
The scenario or question to answer is:                                                                               // 325
                                                                                                                     // 326
clientA creates a document and goes offline                                                                          // 327
clientB removes the document                                                                                         // 328
after a day, a month or years?:                                                                                      // 329
clientA edits the document and goes online                                                                           // 330
                                                                                                                     // 331
So what should happen?                                                                                               // 332
---                                                                                                                  // 333
                                                                                                                     // 334
If we want the newest change to win, then the document should be restored                                            // 335
                                                                                                                     // 336
If clientA and clientB is the same user we would assume they kinda know what                                         // 337
they are doing, but if you edit the docuemnt after you removed it - it seems                                         // 338
like an user error removing the document.                                                                            // 339
                                                                                                                     // 340
But now time comes into play, if it was 6 month ago the user removed the document,                                   // 341
and now edits it offline then going online would still restore the document?                                         // 342
This raises the question of how long time should we store details about removed                                      // 343
documents... and where?                                                                                              // 344
                                                                                                                     // 345
Should destructive actions be comprimised, rather dont remove?                                                       // 346
                                                                                                                     // 347
Now if the user updates a document - should we try to merge the data, sometimes                                      // 348
yes, sometimes no.                                                                                                   // 349
                                                                                                                     // 350
Never the less - this is an example of the power a custom conflict handler                                           // 351
should have. So the task is to provide the tooling and data for the conflict                                         // 352
handlers.                                                                                                            // 353
                                                                                                                     // 354
A conflict handler is really a question about strategy, how the app should                                           // 355
act in the situation. This is why we are going to have the client-side do this                                       // 356
work - I mean we could have a strategy for letting the user decide what should                                       // 357
happen.                                                                                                              // 358
                                                                                                                     // 359
The conflict handler should be provided the localVersion and remoteVersion,                                          // 360
it should then return the winning result - might be in a callback allowing                                           // 361
sync + async behaviours?                                                                                             // 362
                                                                                                                     // 363
So this is focused on servertime stamps - but the interesting thing here could                                       // 364
also be the focus on versions instead. Much like OT and github does.                                                 // 365
                                                                                                                     // 366
But OT will prop. only make sense when all online?                                                                   // 367
                                                                                                                     // 368
---                                                                                                                  // 369
                                                                                                                     // 370
Should it be the server that handles conflicts? All the data is available there                                      // 371
we cant be sure about subscriptions + we could have OT records for each collection                                   // 372
Creating a conflict resoultion package could be isolated and would work on all                                       // 373
collections - grounded or not...                                                                                     // 374
                                                                                                                     // 375
We could wait until OT is supported in core?                                                                         // 376
                                                                                                                     // 377
*/                                                                                                                   // 378
var _hackMeteorUpdate = function _hackMeteorUpdate() {                                                               // 379
  var self = this;                                                                                                   // 380
                                                                                                                     // 381
  // Super container                                                                                                 // 382
  var _super;                                                                                                        // 383
                                                                                                                     // 384
  // Overwrite the store update                                                                                      // 385
  if (self.connection && self.connection._stores[ self.name ]) {                                                     // 386
    // Set super                                                                                                     // 387
    _super = self.connection._stores[ self.name ].update;                                                            // 388
    // Overwrite                                                                                                     // 389
    self.connection._stores[ self.name ].update = function groundUpdate(msg) {                                       // 390
      // console.log('GOT UPDATE');                                                                                  // 391
      var mongoId = msg.id && _groundUtil.idParse(msg.id);                                                           // 392
      var doc = msg.id && self._collection.findOne(mongoId);                                                         // 393
      // We check that local loaded docs are removed before remote sync                                              // 394
      // otherwise it would throw an error                                                                           // 395
        // When adding and doc allready found then we remove it                                                      // 396
      if (msg.msg === 'added' && doc) {                                                                              // 397
          // We mark the data as remotely loaded TODO:                                                               // 398
          delete self._localOnly[mongoId];                                                                           // 399
          // Solve the conflict - server wins                                                                        // 400
          // Then remove the client document                                                                         // 401
          self._collection.remove(mongoId);                                                                          // 402
      }                                                                                                              // 403
      // If message wants to remove the doc but allready removed locally then                                        // 404
      // fix this before calling super                                                                               // 405
      if (msg.msg === 'removed' && !doc) {                                                                           // 406
        self._collection.insert({_id: mongoId});                                                                     // 407
      }                                                                                                              // 408
      // Call super and let it do its thing                                                                          // 409
      _super(msg);                                                                                                   // 410
    };                                                                                                               // 411
  }                                                                                                                  // 412
};                                                                                                                   // 413
                                                                                                                     // 414
                                                                                                                     // 415
// We dont trust the localstorage so we make sure it doesn't contain                                                 // 416
// duplicated id's - primary a problem i FF                                                                          // 417
var _checkDocs = function _checkDocs(a) {                                                                            // 418
  var c = {};                                                                                                        // 419
  // // We create c as an object with no duplicate _id's                                                             // 420
  // for (var i = 0, keys = Object.keys(a); i < keys.length; i++) {                                                  // 421
  //   // Extract key/value                                                                                          // 422
  //   var key = keys[i];                                                                                            // 423
  //   var doc = a[key];                                                                                             // 424
  //   // set value in c                                                                                             // 425
  //   c[key] = doc;                                                                                                 // 426
  // }                                                                                                               // 427
                                                                                                                     // 428
  _groundUtil.each(a, function iterateDoc(doc, key) {                                                                // 429
    c[key] = doc;                                                                                                    // 430
  });                                                                                                                // 431
  return c;                                                                                                          // 432
};                                                                                                                   // 433
                                                                                                                     // 434
// At some point we can do a remove all local-only data? Making sure that we                                         // 435
// Only got the same data as the subscription                                                                        // 436
// If passing query we'll remove only those that pass it (and of course are only local)                              // 437
var _removeLocalOnly = function _removeLocalOnly(query) {                                                            // 438
  var self = this;                                                                                                   // 439
  query = query || {};                                                                                               // 440
                                                                                                                     // 441
  _groundUtil.each(self._localOnly, function _loadDatabaseEach(isLocalOnly, id) {                                    // 442
    if (isLocalOnly) {                                                                                               // 443
      self._collection.remove({ $and: [{ _id: id }, query] });                                                       // 444
      delete self._localOnly[id];                                                                                    // 445
    }                                                                                                                // 446
  });                                                                                                                // 447
};                                                                                                                   // 448
                                                                                                                     // 449
// Bulk Load database from local to memory                                                                           // 450
var _loadDatabase = function _loadDatabase() {                                                                       // 451
  var self = this;                                                                                                   // 452
  // Then load the docs into minimongo                                                                               // 453
                                                                                                                     // 454
  // Emit event                                                                                                      // 455
  self.collection.emit('resume', { type: 'database' });                                                              // 456
  Ground.emit('resume', { type: 'database', collection: self.name });                                                // 457
                                                                                                                     // 458
  // Load object from localstorage                                                                                   // 459
  self.storage.getItem('data', function storageGetItem(err, data) {                                                  // 460
    if (!err) {                                                                                                      // 461
                                                                                                                     // 462
      self.collection.emit('resumed', { type: 'database', data: data });                                             // 463
      Ground.emit('resumed', { type: 'database', collection: self.name });                                           // 464
                                                                                                                     // 465
      // Maxify the data                                                                                             // 466
      var docs = data && MiniMaxDB.maxify(data) || {};                                                               // 467
                                                                                                                     // 468
      // Initialize client documents                                                                                 // 469
      Kernel                                                                                                         // 470
      .each(_checkDocs.call(self, docs || {} ), function kernelEach(doc) {                                           // 471
        // Test if document allready exists, this is a rare case but accounts                                        // 472
        // sometimes adds data to the users database, eg. if "users" are grounded                                    // 473
        var exists = self._collection.findOne(doc._id);                                                              // 474
        // If collection is populated before we get started then the data in                                         // 475
        // memory would be considered latest therefor we dont load from local                                        // 476
        if (!exists) {                                                                                               // 477
          if (!self.offlineDatabase) {                                                                               // 478
            // If online database then mark the doc as local only TODO:                                              // 479
            self._localOnly[doc._id] = true;                                                                         // 480
          }                                                                                                          // 481
          self._collection.insert(doc);                                                                              // 482
        }                                                                                                            // 483
      })                                                                                                             // 484
      .then(function afterKernelEach() {                                                                             // 485
        // Setting database loaded, this allows minimongo to be saved into local                                     // 486
        self._databaseLoaded = true;                                                                                 // 487
      });                                                                                                            // 488
                                                                                                                     // 489
    }                                                                                                                // 490
                                                                                                                     // 491
  });                                                                                                                // 492
};                                                                                                                   // 493
                                                                                                                     // 494
// Bulk Save database from memory to local, meant to be as slim, fast and                                            // 495
// realiable as possible                                                                                             // 496
var _saveDatabase = function _saveDatabase() {                                                                       // 497
  var self = this;                                                                                                   // 498
  // If data loaded from localstorage then its ok to save - otherwise we                                             // 499
  // would override with less data                                                                                   // 500
  if (self._databaseLoaded && _isReloading === false) {                                                              // 501
    self._saveDatabaseTimeout(function _saveDatabaseTimeout() {                                                      // 502
      // We delay the operation a bit in case of multiple saves - this creates                                       // 503
      // a minor lag in terms of localstorage updating but it limits the num                                         // 504
      // of saves to the database                                                                                    // 505
      // Make sure our database is loaded                                                                            // 506
      self.collection.emit('cache', { type: 'database' });                                                           // 507
      Ground.emit('cache', { type: 'database', collection: self.name });                                             // 508
      var minifiedDb = MiniMaxDB.minify(_groundUtil.getDatabaseMap(self));                                           // 509
      // Save the collection into localstorage                                                                       // 510
      self.storage.setItem('data', minifiedDb, function storageCache(err) {                                          // 511
        // Emit feedback                                                                                             // 512
        if (err) {                                                                                                   // 513
          // Emit error                                                                                              // 514
          self.collection.emit('error', { error: err });                                                             // 515
          Ground.emit('error', { collection: self.name, error: err });                                               // 516
        } else {                                                                                                     // 517
          // Emit cached event                                                                                       // 518
          self.collection.emit('cached', { type: 'database', data: minifiedDb });                                    // 519
          Ground.emit('cached', { type: 'database', collection: self.name });                                        // 520
        }                                                                                                            // 521
      });                                                                                                            // 522
                                                                                                                     // 523
    });                                                                                                              // 524
  }                                                                                                                  // 525
};                                                                                                                   // 526
                                                                                                                     // 527
                                                                                                                     // 528
// Reactive variable containing a boolean flag, true == all subscriptions have                                       // 529
// been loaded                                                                                                       // 530
// XXX: this should be a bit more finegrained eg. pr. collection, but thats not                                      // 531
// possible yet                                                                                                      // 532
Ground.ready = _groundUtil.allSubscriptionsReady;                                                                    // 533
                                                                                                                     // 534
Ground.lookup = function groundLookup(collectionName) {                                                              // 535
  return _groundDatabases[collectionName];                                                                           // 536
};                                                                                                                   // 537
                                                                                                                     // 538
var _allowMethodResumeMap = {};                                                                                      // 539
var _methodResumeConnections = [];                                                                                   // 540
                                                                                                                     // 541
var addConnectionToResume = function addConnectionToResume(connection) {                                             // 542
  if (_methodResumeConnections.indexOf(connection) < 0) {                                                            // 543
    _methodResumeConnections.push(connection);                                                                       // 544
  }                                                                                                                  // 545
};                                                                                                                   // 546
                                                                                                                     // 547
Ground.methodResume = function methodResume(names, connection) {                                                     // 548
  // Allow string or array of strings                                                                                // 549
  if (names === ''+names) {                                                                                          // 550
    names = [names];                                                                                                 // 551
  }                                                                                                                  // 552
                                                                                                                     // 553
  // Default to the default connection...                                                                            // 554
  connection = connection || _groundUtil.connection;                                                                 // 555
                                                                                                                     // 556
  // This index comes in handy when we use getMethodList                                                             // 557
  addConnectionToResume(connection);                                                                                 // 558
                                                                                                                     // 559
  // Add methods to resume                                                                                           // 560
  _groundUtil.each(names, function(name) {                                                                           // 561
    _allowMethodResumeMap[name] = connection;                                                                        // 562
  });                                                                                                                // 563
  // console.log(_allowMethodResumeMap);                                                                             // 564
};                                                                                                                   // 565
                                                                                                                     // 566
// Add settings for methods to skip or not when caching methods                                                      // 567
Ground.skipMethods = function skipMethods() {                                                                        // 568
  throw new Error('Ground.skipMethods is deprecated, use Ground.methodResume instead');                              // 569
};                                                                                                                   // 570
                                                                                                                     // 571
Ground.OneTimeout = OneTimeout;                                                                                      // 572
                                                                                                                     // 573
///////////////////////////// RESUME METHODS ///////////////////////////////////                                     // 574
                                                                                                                     // 575
// Is methods resumed?                                                                                               // 576
var _methodsResumed = false;                                                                                         // 577
var _methodsResumedDeps = new Tracker.Dependency();                                                                  // 578
                                                                                                                     // 579
                                                                                                                     // 580
Ground.isResumed = function isResumed() {                                                                            // 581
  _methodsResumedDeps.depend();                                                                                      // 582
  return _methodsResumed;                                                                                            // 583
};                                                                                                                   // 584
                                                                                                                     // 585
// Get a nice array of current methods                                                                               // 586
var _getMethodsList = function _getMethodsList() {                                                                   // 587
  // Array of outstanding methods                                                                                    // 588
  var methods = [];                                                                                                  // 589
  // Made a public API to disallow caching of some method calls                                                      // 590
  // Convert the data into nice array                                                                                // 591
                                                                                                                     // 592
  // We iterate over the connections that have resumable methods                                                     // 593
  _groundUtil.each(_methodResumeConnections, function resumeEachConnection(connection) {                             // 594
    // We run through the method invokers                                                                            // 595
    _groundUtil.each(connection._methodInvokers, function resumeEachInvoker(method) {                                // 596
      // Get the method name                                                                                         // 597
      var name = method._message.method;                                                                             // 598
      // Check that this method is resumeable and on the correct connection                                          // 599
      if (_allowMethodResumeMap[name] === connection) {                                                              // 600
        // Push the method                                                                                           // 601
        methods.push({                                                                                               // 602
          // Format the data                                                                                         // 603
          method: name,                                                                                              // 604
          args: method._message.params,                                                                              // 605
          options: { wait: method._wait }                                                                            // 606
        });                                                                                                          // 607
                                                                                                                     // 608
      }                                                                                                              // 609
                                                                                                                     // 610
    });                                                                                                              // 611
  });                                                                                                                // 612
                                                                                                                     // 613
  return methods;                                                                                                    // 614
};                                                                                                                   // 615
                                                                                                                     // 616
// Flush in memory methods, its a dirty trick and could have some edge cases                                         // 617
// that would throw an error? Eg. if flushed in the middle of waiting for                                            // 618
// a method call to return - the returning call would not be able to find the                                        // 619
// method callback. This could happen if the user submits a change in one window                                     // 620
// and then switches to another tab and submits a change there before the first                                      // 621
// method gets back?                                                                                                 // 622
var _flushInMemoryMethods = function _flushInMemoryMethods() {                                                       // 623
  var didFlushSome = false;                                                                                          // 624
  // TODO: flush should be rewritten to - we should do method proxy stuff...                                         // 625
  // This code is a bit dirty                                                                                        // 626
  if (_groundUtil.connection && _groundUtil.connection._outstandingMethodBlocks &&                                   // 627
          _groundUtil.connection._outstandingMethodBlocks.length) {                                                  // 628
                                                                                                                     // 629
    // Clear the in memory outstanding methods TODO: Check if this is enough                                         // 630
    // Check to see if we should skip methods                                                                        // 631
    for (var i = 0; i < _groundUtil.connection._outstandingMethodBlocks.length; i++) {                               // 632
      var method = _groundUtil.connection._outstandingMethodBlocks[i];                                               // 633
      if (method && method._message && _allowMethodResumeMap[method._message.method]) {                              // 634
        // Clear invoke callbacks                                                                                    // 635
//    _groundUtil.connection._outstandingMethodBlocks = [];                                                          // 636
        delete _groundUtil.connection._outstandingMethodBlocks[i];                                                   // 637
//    _groundUtil.connection._methodInvokers = {};                                                                   // 638
        delete _groundUtil.connection._methodInvokers[i];                                                            // 639
        // Set the flag to call back                                                                                 // 640
        didFlushSome = true;                                                                                         // 641
      }                                                                                                              // 642
    }                                                                                                                // 643
    if (didFlushSome) {                                                                                              // 644
      // Call the event callback                                                                                     // 645
      Ground.emit('flush', { type: 'methods' });                                                                     // 646
    }                                                                                                                // 647
                                                                                                                     // 648
  }                                                                                                                  // 649
};                                                                                                                   // 650
                                                                                                                     // 651
// Extract only newly added methods from localstorage                                                                // 652
var _getMethodUpdates = function _getMethodUpdates(newMethods) {                                                     // 653
  var result = [];                                                                                                   // 654
  if (newMethods && newMethods.length > 0) {                                                                         // 655
    // Get the old methods allready in memory                                                                        // 656
    // We could have done an optimized slice version or just starting at                                             // 657
    // oldMethods.length, but this tab is not in focus                                                               // 658
    var oldMethods = _getMethodsList();                                                                              // 659
    // We do a check to see if we should flush our in memory methods if allready                                     // 660
    // run on an other tab - an odd case - the first item would not match in                                         // 661
    // old methods and new methods, its only valid to make this test if both                                         // 662
    // methods arrays are not empty allready                                                                         // 663
    if (oldMethods.length &&                                                                                         // 664
            EJSON.stringify(oldMethods[0]) !== EJSON.stringify(newMethods[0])) {                                     // 665
      // Flush the in memory / queue methods                                                                         // 666
      _flushInMemoryMethods();                                                                                       // 667
      // We reset the oldMethods array of outstanding methods                                                        // 668
      oldMethods = [];                                                                                               // 669
    }                                                                                                                // 670
    // Iterate over the new methods, old ones should be ordered in beginning of                                      // 671
    // newMethods we do a simple test an throw an error if thats not the case                                        // 672
    for (var i=0; i < newMethods.length; i++) {                                                                      // 673
                                                                                                                     // 674
      if (i < oldMethods.length) {                                                                                   // 675
        // Do a hard slow test to make sure all is in sync                                                           // 676
        if (EJSON.stringify(oldMethods[i]) !== EJSON.stringify(newMethods[i])) {                                     // 677
          // The client data is corrupted, throw error or force the client to                                        // 678
          // reload, does not make sense to continue?                                                                // 679
          throw new Error('The method database is corrupted or out of sync at position: ' + i);                      // 680
        }                                                                                                            // 681
      } else {                                                                                                       // 682
        // Ok out of oldMethods this is a new method call                                                            // 683
        result.push(newMethods[i]);                                                                                  // 684
                                                                                                                     // 685
        Ground.emit('methodcall', newMethods[i]);                                                                    // 686
      }                                                                                                              // 687
    } // EO for iteration                                                                                            // 688
                                                                                                                     // 689
  } else {                                                                                                           // 690
    // If new methods are empty this means that the other client / tap has                                           // 691
    // Allready sendt and recieved the method calls - so we flush our in mem                                         // 692
    // Flush the in memory / queue methods                                                                           // 693
    _flushInMemoryMethods();                                                                                         // 694
  }                                                                                                                  // 695
                                                                                                                     // 696
  // return the result                                                                                               // 697
  return result;                                                                                                     // 698
};                                                                                                                   // 699
                                                                                                                     // 700
///////////////////////////// LOAD & SAVE METHODS //////////////////////////////                                     // 701
// Create the storage for methods                                                                                    // 702
var _methodsStorage = Store.create({                                                                                 // 703
  name: '_methods_',                                                                                                 // 704
  version: 1.1                                                                                                       // 705
});                                                                                                                  // 706
                                                                                                                     // 707
var _sendMethod = function _sendMethod(method, connection) {                                                         // 708
  // Send a log message first to the test                                                                            // 709
  test.log('SEND', JSON.stringify(method));                                                                          // 710
                                                                                                                     // 711
  if (test.isMain) {                                                                                                 // 712
    console.warn('Main test should not send methods...');                                                            // 713
  }                                                                                                                  // 714
                                                                                                                     // 715
  connection.apply(                                                                                                  // 716
    method.method, method.args, method.options, function resumeMethodCallback(err, result) {                         // 717
      // We cant fix the missing callbacks made at runtime the                                                       // 718
      // last time the app ran. But we can emit data                                                                 // 719
                                                                                                                     // 720
      if (err) {                                                                                                     // 721
        test.log('RETURNED ERROR', JSON.stringify(method), err.message);                                             // 722
      } else {                                                                                                       // 723
        test.log('RETURNED METHOD', JSON.stringify(method));                                                         // 724
      }                                                                                                              // 725
                                                                                                                     // 726
      // Emit the data we got back here                                                                              // 727
      Ground.emit('method', { method: method, error: err, result: result });                                         // 728
    }                                                                                                                // 729
  );                                                                                                                 // 730
};                                                                                                                   // 731
                                                                                                                     // 732
var waitingMethods = [];                                                                                             // 733
                                                                                                                     // 734
// We may end in a situation where things have changed eg. if collections are                                        // 735
// renamed or left out in the app. We make sure that ground db will try 5 time                                       // 736
// times and then have the missing methods die.                                                                      // 737
// The correct thing in the future would prop. be to have the conflict resolution                                    // 738
// create patch calls instead of resume.                                                                             // 739
var resumeAttemptsLeft = 5;                                                                                          // 740
                                                                                                                     // 741
var resumeWaitingMethods = function resumeWaitingMethods() {                                                         // 742
  var missing = [];                                                                                                  // 743
                                                                                                                     // 744
  resumeAttemptsLeft--;                                                                                              // 745
                                                                                                                     // 746
  // Resume each method                                                                                              // 747
  _groundUtil.each(waitingMethods, function eachWaitingMethods(method) {                                             // 748
    if (method) {                                                                                                    // 749
                                                                                                                     // 750
      // name helper for the method                                                                                  // 751
      var name = method.method;                                                                                      // 752
                                                                                                                     // 753
      if (name) {                                                                                                    // 754
                                                                                                                     // 755
        test.log('RESUME', 'Load method "' + name + '"');                                                            // 756
        // Get the connection from the allow method resume                                                           // 757
        var methodConnection = _allowMethodResumeMap[name];                                                          // 758
        // Run it in fenced mode since the changes have already been applied                                         // 759
        // locally                                                                                                   // 760
        if (methodConnection) {                                                                                      // 761
                                                                                                                     // 762
          _groundUtil.connection.stubFence(name, function runFencedMethod() {                                        // 763
            // Add method to connection                                                                              // 764
            _sendMethod(method, methodConnection);                                                                   // 765
          });                                                                                                        // 766
                                                                                                                     // 767
        } else {                                                                                                     // 768
          // XXX: make sure we keep order                                                                            // 769
          // TODO: Check if we should use push or unshift                                                            // 770
          missing.push(method);                                                                                      // 771
          test.log('RESUME', 'Missing method "' + name + '" - retry later');                                         // 772
          console.warn('Ground method resume: Cannot resume "' + name + '" connection not rigged yet, retry later');
        }                                                                                                            // 774
                                                                                                                     // 775
      }                                                                                                              // 776
                                                                                                                     // 777
    }                                                                                                                // 778
  });                                                                                                                // 779
                                                                                                                     // 780
  // Keep track of missing methods                                                                                   // 781
  waitingMethods = missing;                                                                                          // 782
                                                                                                                     // 783
  // If no waiting methods - then we must be done?                                                                   // 784
  if (!_methodsResumed && !waitingMethods.length || !resumeAttemptsLeft) {                                           // 785
    // Methods have resumed                                                                                          // 786
    _methodsResumed = true;                                                                                          // 787
    _methodsResumedDeps.changed();                                                                                   // 788
  }                                                                                                                  // 789
                                                                                                                     // 790
};                                                                                                                   // 791
                                                                                                                     // 792
                                                                                                                     // 793
var loadMissingMethods = function loadMissingMethods(callback) {                                                     // 794
  _methodsStorage.getItem('methods', function storageLoadMissingMethods(err, data) {                                 // 795
    test.log('RESUME', 'methods loaded into memory');                                                                // 796
    if (err) {                                                                                                       // 797
      // XXX:                                                                                                        // 798
      callback(err);                                                                                                 // 799
    } else if (data) {                                                                                               // 800
      // Maxify the data from storage                                                                                // 801
      // We are only going to submit the diff                                                                        // 802
      // Set missing methods                                                                                         // 803
      waitingMethods = _getMethodUpdates(MiniMaxMethods.maxify(data));                                               // 804
    }                                                                                                                // 805
                                                                                                                     // 806
    callback();                                                                                                      // 807
  });                                                                                                                // 808
};                                                                                                                   // 809
                                                                                                                     // 810
// load methods from localstorage and resume the methods                                                             // 811
var _loadMethods = function _loadMethods() {                                                                         // 812
                                                                                                                     // 813
  loadMissingMethods(function loadMissingMethods(err) {                                                              // 814
    if (err) {                                                                                                       // 815
      test.log('RESUME', 'Could not load missing methods into memory', err);                                         // 816
    } else {                                                                                                         // 817
                                                                                                                     // 818
      // Try to resume missing methods now                                                                           // 819
      resumeWaitingMethods();                                                                                        // 820
                                                                                                                     // 821
      // If not all methods are resumed then try until success                                                       // 822
      if (!_methodsResumed) {                                                                                        // 823
                                                                                                                     // 824
        var interval = Meteor.setInterval(function loadMissingMethodsInterval() {                                    // 825
          // Try to resume missing methods                                                                           // 826
          resumeWaitingMethods();                                                                                    // 827
                                                                                                                     // 828
          // If methods are resumed then stop this                                                                   // 829
          if (_methodsResumed) {                                                                                     // 830
            Meteor.clearInterval(interval);                                                                          // 831
          }                                                                                                          // 832
        }, 1000);                                                                                                    // 833
                                                                                                                     // 834
      }                                                                                                              // 835
                                                                                                                     // 836
    }                                                                                                                // 837
  });                                                                                                                // 838
                                                                                                                     // 839
}; // EO load methods                                                                                                // 840
                                                                                                                     // 841
// Save the methods into the localstorage                                                                            // 842
var _saveMethods = function _saveMethods() {                                                                         // 843
  if (_methodsResumed) {                                                                                             // 844
                                                                                                                     // 845
    // Ok memory is initialized                                                                                      // 846
    Ground.emit('cache', { type: 'methods' });                                                                       // 847
                                                                                                                     // 848
    // Save outstanding methods to localstorage                                                                      // 849
    var methods = _getMethodsList();                                                                                 // 850
//test.log('SAVE METHODS', JSON.stringify(methods));                                                                 // 851
    _methodsStorage.setItem('methods', MiniMaxMethods.minify(methods), function storage_saveMethods() { // jshint ignore:line
      // XXX:                                                                                                        // 853
    });                                                                                                              // 854
                                                                                                                     // 855
  }                                                                                                                  // 856
};                                                                                                                   // 857
                                                                                                                     // 858
//////////////////////////// STARTUP METHODS RESUME ////////////////////////////                                     // 859
                                                                                                                     // 860
Meteor.startup(function startupMethodResume() {                                                                      // 861
  // Wait some not to conflict with accouts login                                                                    // 862
  // TODO: Do we have a better way, instead of depending on time should depend                                       // 863
  // on en event.                                                                                                    // 864
  Meteor.setTimeout(function loadMethods() {                                                                         // 865
    test.log('INIT LOAD METHODS');                                                                                   // 866
    _loadMethods();                                                                                                  // 867
  }, 500);                                                                                                           // 868
});                                                                                                                  // 869
                                                                                                                     // 870
/////////////////////////// SYNC TABS METHODS DATABSE //////////////////////////                                     // 871
                                                                                                                     // 872
var syncDatabaseTimeout = new OneTimeout(150);                                                                       // 873
                                                                                                                     // 874
// Offline client only databases will sync a bit different than normal                                               // 875
// This function is a bit hard - but it works - optimal solution could be to                                         // 876
// have virtual method calls it would complicate things                                                              // 877
var _syncDatabase = function _syncDatabase() {                                                                       // 878
  var self = this;                                                                                                   // 879
  // We set a small delay in case of more updates within the wait                                                    // 880
  syncDatabaseTimeout(function syncDatabaseTimeout() {                                                               // 881
//    if (self && (self.offlineDatabase === true || !Meteor.status().connected)) {                                   // 882
    if (self) {                                                                                                      // 883
      // Add event hook                                                                                              // 884
      self.collection.emit('sync');                                                                                  // 885
      Ground.emit('sync', { type: 'database', collection: self.name });                                              // 886
      // Hard reset database?                                                                                        // 887
      self.storage.getItem('data', function storageSyncFetch(err, data) {                                            // 888
        if (err) {                                                                                                   // 889
          //                                                                                                         // 890
          throw err;                                                                                                 // 891
        } else {                                                                                                     // 892
          // Get the data back in size                                                                               // 893
          var newDocs = MiniMaxDB.maxify(data) || {};                                                                // 894
                                                                                                                     // 895
          self.collection.find().forEach(function storageSyncFetchEach(doc) {                                        // 896
            // Remove document                                                                                       // 897
            self._collection.remove(doc._id);                                                                        // 898
            // If found in new documents then hard update                                                            // 899
            if (typeof newDocs[doc._id] !== 'undefined') {                                                           // 900
              // Update doc                                                                                          // 901
              self._collection.insert(newDocs[doc._id]);                                                             // 902
              delete newDocs[doc._id];                                                                               // 903
            }                                                                                                        // 904
          });                                                                                                        // 905
                                                                                                                     // 906
          _groundUtil.each(newDocs, function storageSyncFetchEachNew(doc) {                                          // 907
            // insert doc                                                                                            // 908
            self._collection.insert(doc);                                                                            // 909
          });                                                                                                        // 910
                                                                                                                     // 911
        }                                                                                                            // 912
      });                                                                                                            // 913
                                                                                                                     // 914
    }                                                                                                                // 915
  });                                                                                                                // 916
};                                                                                                                   // 917
                                                                                                                     // 918
var syncMethodsTimeout = new OneTimeout(500);                                                                        // 919
                                                                                                                     // 920
// Syncronize tabs via method calls                                                                                  // 921
var _syncMethods = function _syncMethods() {                                                                         // 922
  // We are going to into reload, stop all access to localstorage                                                    // 923
  _isReloading = true;                                                                                               // 924
  // We are not master and the user is working on another tab, we are not in                                         // 925
  // a hurry to spam the browser with work, plus there are typically acouple                                         // 926
  // of db access required in most operations, we wait a sec?                                                        // 927
  syncMethodsTimeout(function _syncMethodsTimeout() {                                                                // 928
    // Add event hook                                                                                                // 929
    Ground.emit('sync', { type: 'methods' });                                                                        // 930
    // Load the offline data into our memory                                                                         // 931
    _groundUtil.each(_groundDatabases, function syncMethodsTimeoutEach(collection, name) {                           // 932
      test.log('SYNC DB', name);                                                                                     // 933
      _loadDatabase.call(collection);                                                                                // 934
    });                                                                                                              // 935
    // Resume methods                                                                                                // 936
    test.log('SYNC METHODS');                                                                                        // 937
    _loadMethods();                                                                                                  // 938
    // Resume normal writes                                                                                          // 939
    _isReloading = false;                                                                                            // 940
  });                                                                                                                // 941
};                                                                                                                   // 942
                                                                                                                     // 943
/////////////////////// ADD TRIGGERS IN LIVEDATACONNECTION /////////////////////                                     // 944
                                                                                                                     // 945
if (!test.isMain) {                                                                                                  // 946
                                                                                                                     // 947
  // Add hooks method hooks                                                                                          // 948
  // We need to know when methods are added and when they have returned                                              // 949
                                                                                                                     // 950
  var _superApply = _groundUtil.Connection.prototype.apply;                                                          // 951
  var _superOutstandingMethodFinished = _groundUtil.Connection.prototype._outstandingMethodFinished;                 // 952
                                                                                                                     // 953
  _groundUtil.Connection.prototype.apply = function applyHook(name /* , args, options, callback */) {                // 954
    // Intercept grounded databases                                                                                  // 955
    if (_allowMethodResumeMap[name]) {                                                                               // 956
      test.debug('APPLY', JSON.stringify(_groundUtil.toArray(arguments)));                                           // 957
    }                                                                                                                // 958
    // Call super                                                                                                    // 959
    var result = _superApply.apply(this, _groundUtil.toArray(arguments));                                            // 960
    // Save methods                                                                                                  // 961
    if (_allowMethodResumeMap[name]) {                                                                               // 962
      _saveMethods();                                                                                                // 963
    }                                                                                                                // 964
    // return the result                                                                                             // 965
    return result;                                                                                                   // 966
  };                                                                                                                 // 967
                                                                                                                     // 968
  _groundUtil.Connection.prototype._outstandingMethodFinished = function _outstandingMethodFinished() {              // 969
      // Call super                                                                                                  // 970
      _superOutstandingMethodFinished.apply(this);                                                                   // 971
      // We save current status of methods                                                                           // 972
      _saveMethods();                                                                                                // 973
      // _outstandingMethodFinished dont return anything                                                             // 974
    };                                                                                                               // 975
                                                                                                                     // 976
}                                                                                                                    // 977
                                                                                                                     // 978
/////////////////////// LOAD CHANGES FROM OTHER TABS ///////////////////////////                                     // 979
                                                                                                                     // 980
// The main test mode should not interfere with tab sync                                                             // 981
if (!test.isMain) {                                                                                                  // 982
                                                                                                                     // 983
  // Sync Methods if changed                                                                                         // 984
  _methodsStorage.addListener('storage', function storageEventListener() {                                           // 985
    // Method calls are delayed a bit for optimization                                                               // 986
    _syncMethods('mehods');                                                                                          // 987
                                                                                                                     // 988
  });                                                                                                                // 989
                                                                                                                     // 990
}                                                                                                                    // 991
                                                                                                                     // 992
////////////////////////// ADD DEPRECATION NOTICE //////////////////////////////                                     // 993
if (typeof GroundDB === 'undefined') {                                                                               // 994
  GroundDB = function deprecatedGroundDB(name, options) {                                                            // 995
    // Deprecation notice                                                                                            // 996
    console.warn('The GroundDB scope is deprecating!! Use Ground.Collection instead');                               // 997
    return new Ground.Collection(name, options);                                                                     // 998
  };                                                                                                                 // 999
}                                                                                                                    // 1000
                                                                                                                     // 1001
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ground_db/wrap.collection.js                                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
//////////////////////////////////////////////////////////////////////////////                                       // 1
// WRAP MONGO COLLECTION API on prototype                                                                            // 2
//////////////////////////////////////////////////////////////////////////////                                       // 3
                                                                                                                     // 4
// Why do we need to overwrite the default insert function?                                                          // 5
//                                                                                                                   // 6
// We set _id manually if not already set, this is due to the "optimization"                                         // 7
// added in Meteor and the fact that we cant rely on connection or method                                            // 8
// invocations in grounddb:                                                                                          // 9
// "Don't generate the id if we're the client and the 'outermost' call                                               // 10
//  This optimization saves us passing both the randomSeed and the id                                                // 11
//  Passing both is redundant."                                                                                      // 12
//  // Mongo->collection.js                                                                                          // 13
                                                                                                                     // 14
// XXX: This is a bit strange - its the only way of making sure the _id is                                           // 15
// sent to the server. We want the id to the server if we are doing offline                                          // 16
// resume - grounddb cannot regenerate the invocation callbacks if browser                                           // 17
// was closed.                                                                                                       // 18
                                                                                                                     // 19
var _super = _groundUtil.Collection.prototype.insert;                                                                // 20
                                                                                                                     // 21
// Overwrite insert                                                                                                  // 22
_groundUtil.Collection.prototype.insert = function(/* arguments */) {                                                // 23
  /*************************************************************************                                         // 24
   *  This function is overwritten by GroundDB - Sorry! but we need an _id *                                         // 25
   *************************************************************************/                                        // 26
                                                                                                                     // 27
  // Convert arguments object into real array                                                                        // 28
  var args = _.toArray(arguments);                                                                                   // 29
                                                                                                                     // 30
  // Only make sure _id is set if grounddb is mounted                                                                // 31
  if (this.grounddb) {                                                                                               // 32
    args[0]._id = args[0]._id || this._makeNewID();                                                                  // 33
  }                                                                                                                  // 34
                                                                                                                     // 35
  // Call super                                                                                                      // 36
  return _super.apply(this, args);                                                                                   // 37
};                                                                                                                   // 38
                                                                                                                     // 39
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ground_db/wrap.eventemitter.js                                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
//////////////////////////////////////////////////////////////////////////////                                       // 1
// WRAP EVENTEMITTER API on Ground                                                                                   // 2
//////////////////////////////////////////////////////////////////////////////                                       // 3
                                                                                                                     // 4
// Add a top level event emitter                                                                                     // 5
Ground.eventemitter = new EventEmitter();                                                                            // 6
                                                                                                                     // 7
// Wrap the Event Emitter Api "on"                                                                                   // 8
Ground.on = function(/* arguments */) {                                                                              // 9
  Ground.eventemitter.on.apply(Ground.eventemitter, _.toArray(arguments));                                           // 10
};                                                                                                                   // 11
                                                                                                                     // 12
// Wrap the Event Emitter Api "once"                                                                                 // 13
Ground.once = function(/* arguments */) {                                                                            // 14
  Ground.eventemitter.once.apply(Ground.eventemitter, _.toArray(arguments));                                         // 15
};                                                                                                                   // 16
                                                                                                                     // 17
// Wrap the Event Emitter Api "off"                                                                                  // 18
Ground.off = function(/* arguments */) {                                                                             // 19
  Ground.eventemitter.off.apply(Ground.eventemitter, _.toArray(arguments));                                          // 20
};                                                                                                                   // 21
                                                                                                                     // 22
// Wrap the Event Emitter Api "emit"                                                                                 // 23
Ground.emit = function(/* arguments */) {                                                                            // 24
  Ground.eventemitter.emit.apply(Ground.eventemitter, _.toArray(arguments));                                         // 25
};                                                                                                                   // 26
                                                                                                                     // 27
                                                                                                                     // 28
// Add api helpers                                                                                                   // 29
Ground.addListener = Ground.on;                                                                                      // 30
Ground.removeListener = Ground.off;                                                                                  // 31
Ground.removeAllListeners = Ground.off;                                                                              // 32
                                                                                                                     // 33
// Add jquery like helpers                                                                                           // 34
Ground.one = Ground.once;                                                                                            // 35
Ground.trigger = Ground.emit;                                                                                        // 36
                                                                                                                     // 37
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ground_db/wrap.proto.eventemitter.js                                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
//////////////////////////////////////////////////////////////////////////////                                       // 1
// WRAP EVENTEMITTER API on prototype                                                                                // 2
//////////////////////////////////////////////////////////////////////////////                                       // 3
                                                                                                                     // 4
// Wrap the Event Emitter Api "on"                                                                                   // 5
_groundUtil.Collection.prototype.on = function(/* arguments */) {                                                    // 6
  return this.eventemitter.on.apply(this.eventemitter, _.toArray(arguments));                                        // 7
};                                                                                                                   // 8
                                                                                                                     // 9
// Wrap the Event Emitter Api "once"                                                                                 // 10
_groundUtil.Collection.prototype.once = function(/* arguments */) {                                                  // 11
  return this.eventemitter.once.apply(this.eventemitter, _.toArray(arguments));                                      // 12
};                                                                                                                   // 13
                                                                                                                     // 14
// Wrap the Event Emitter Api "off"                                                                                  // 15
_groundUtil.Collection.prototype.off = function(/* arguments */) {                                                   // 16
  return this.eventemitter.off.apply(this.eventemitter, _.toArray(arguments));                                       // 17
};                                                                                                                   // 18
                                                                                                                     // 19
// Wrap the Event Emitter Api "emit"                                                                                 // 20
_groundUtil.Collection.prototype.emit = function(/* arguments */) {                                                  // 21
  return this.eventemitter.emit.apply(this.eventemitter, _.toArray(arguments));                                      // 22
};                                                                                                                   // 23
                                                                                                                     // 24
                                                                                                                     // 25
// Add api helpers                                                                                                   // 26
_groundUtil.Collection.prototype.addListener = _groundUtil.Collection.prototype.on;                                  // 27
_groundUtil.Collection.prototype.removeListener = _groundUtil.Collection.prototype.off;                              // 28
_groundUtil.Collection.prototype.removeAllListeners = _groundUtil.Collection.prototype.off;                          // 29
                                                                                                                     // 30
// Add jquery like helpers                                                                                           // 31
_groundUtil.Collection.prototype.one = _groundUtil.Collection.prototype.once;                                        // 32
_groundUtil.Collection.prototype.trigger = _groundUtil.Collection.prototype.emit;                                    // 33
                                                                                                                     // 34
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ground:db'] = {
  Ground: Ground,
  GroundDB: GroundDB
};

})();
