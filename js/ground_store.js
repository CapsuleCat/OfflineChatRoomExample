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
var Store;

(function(){

////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// packages/ground_store/storage.scope.js                                         //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
                                                                                  //
// Define the Storage scope                                                       // 1
Store = {};                                                                       // 2
////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// packages/ground_store/client.js                                                //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
                                                                                  //
// Users can add multiple storage adapters to Storage, but we might dont care     // 1
// about wich to use, so here we provide a small helper api to the Storage object
// to get the "best" storage available.                                           // 3
                                                                                  // 4
// List of possible storage adapters, the best is at the top                      // 5
var _rankedStorageAdapterList = [                                                 // 6
  'localStorage'                                                                  // 7
];                                                                                // 8
                                                                                  // 9
// This function will return the name of best storage adapter available.          // 10
var _getTheBestStorageAdapterAvailable = function() {                             // 11
                                                                                  // 12
  // Iterate over the ranked list of storge adapters                              // 13
  for (var i = 0; i < _rankedStorageAdapterList.length; i++) {                    // 14
                                                                                  // 15
    // Set surgestion to the name of a storage adapter                            // 16
    var surgestion = _rankedStorageAdapterList[i];                                // 17
                                                                                  // 18
    // If the storage is found then this must be the best storage adapter         // 19
    if (Store[surgestion]) {                                                      // 20
      return surgestion;                                                          // 21
    }                                                                             // 22
  }                                                                               // 23
                                                                                  // 24
  // Got nothing, we return null                                                  // 25
  return null;                                                                    // 26
};                                                                                // 27
                                                                                  // 28
// This function will return the name of the passed in storage adapter            // 29
var _getStorageNameFromStorageAdapter = function(storageAdapterInstance) {        // 30
                                                                                  // 31
  // Iterate over the ranked list of storge adapters                              // 32
  for (var i = 0; i <_rankedStorageAdapterList.length; i++) {                     // 33
                                                                                  // 34
    // Set storageAdapterName to the name of a storage adapter                    // 35
    var storageAdapterName = _rankedStorageAdapterList[i];                        // 36
                                                                                  // 37
    // StorageAdapter                                                             // 38
    var StorageAdapter = Store[storageAdapterName];                               // 39
                                                                                  // 40
    // Check if the storage adapter is found,                                     // 41
    if (StorageAdapter) {                                                         // 42
                                                                                  // 43
      // check if the handed objectis an instance of the storage adapter, if so   // 44
      // return the storage adapter name                                          // 45
      if (storageAdapterInstance instanceof StorageAdapter) {                     // 46
        return storageAdapterName;                                                // 47
      }                                                                           // 48
                                                                                  // 49
      // We could add a === check allowing a class check                          // 50
      if (storageAdapterInstance === StorageAdapter) {                            // 51
        return storageAdapterName;                                                // 52
      }                                                                           // 53
                                                                                  // 54
    }                                                                             // 55
  }                                                                               // 56
};                                                                                // 57
                                                                                  // 58
// Get the storage name from storage adapter or its instance                      // 59
Store.getName = function(storageAdapterInstance) {                                // 60
                                                                                  // 61
  // Tries to find the name of the storage adapter or instance given              // 62
  // returns null if no match                                                     // 63
  return _getStorageNameFromStorageAdapter(storageAdapterInstance);               // 64
                                                                                  // 65
};                                                                                // 66
                                                                                  // 67
// Returns a storage adapter, either the best on the system or a specific if      // 68
// name is set as an argument.                                                    // 69
Store.getStorage = function(name /* Optional */) {                                // 70
                                                                                  // 71
  // Check if name is set and is a string, if not set it to the best storage      // 72
  // adapter available                                                            // 73
  if (name !== ''+name) {                                                         // 74
    name = _getTheBestStorageAdapterAvailable();                                  // 75
  }                                                                               // 76
                                                                                  // 77
  // Return the storage by name, if none found then return noop                   // 78
  return Store[name] || function() {};                                            // 79
                                                                                  // 80
};                                                                                // 81
                                                                                  // 82
// Returns an instance of the best possible storage                               // 83
Store.create = function(options) {                                                // 84
                                                                                  // 85
  // Get the best storage available                                               // 86
  var storage = Store.getStorage();                                               // 87
                                                                                  // 88
  // Return the instance                                                          // 89
  return new storage(options);                                                    // 90
                                                                                  // 91
};                                                                                // 92
                                                                                  // 93
////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ground:store'] = {
  Store: Store
};

})();
