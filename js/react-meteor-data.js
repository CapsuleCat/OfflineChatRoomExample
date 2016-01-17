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
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var babelHelpers = Package['babel-runtime'].babelHelpers;

/* Package-scope variables */
var ReactMeteorData;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/react-meteor-data/meteor-data-mixin.jsx                                     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
ReactMeteorData = {                                                                     // 1
  componentWillMount: function () {                                                     // 2
    this.data = {};                                                                     // 3
    this._meteorDataManager = new MeteorDataManager(this);                              // 4
    var newData = this._meteorDataManager.calculateData();                              // 5
    this._meteorDataManager.updateData(newData);                                        // 6
  },                                                                                    //
  componentWillUpdate: function (nextProps, nextState) {                                // 8
    var saveProps = this.props;                                                         // 9
    var saveState = this.state;                                                         // 10
    var newData = undefined;                                                            // 11
    try {                                                                               // 12
      // Temporarily assign this.state and this.props,                                  //
      // so that they are seen by getMeteorData!                                        //
      // This is a simulation of how the proposed Observe API                           //
      // for React will work, which calls observe() after                               //
      // componentWillUpdate and after props and state are                              //
      // updated, but before render() is called.                                        //
      // See https://github.com/facebook/react/issues/3398.                             //
      this.props = nextProps;                                                           // 20
      this.state = nextState;                                                           // 21
      newData = this._meteorDataManager.calculateData();                                // 22
    } finally {                                                                         //
      this.props = saveProps;                                                           // 24
      this.state = saveState;                                                           // 25
    }                                                                                   //
                                                                                        //
    this._meteorDataManager.updateData(newData);                                        // 28
  },                                                                                    //
  componentWillUnmount: function () {                                                   // 30
    this._meteorDataManager.dispose();                                                  // 31
  }                                                                                     //
};                                                                                      //
                                                                                        //
// A class to keep the state and utility methods needed to manage                       //
// the Meteor data for a component.                                                     //
                                                                                        //
var MeteorDataManager = (function () {                                                  //
  function MeteorDataManager(component) {                                               // 38
    babelHelpers.classCallCheck(this, MeteorDataManager);                               //
                                                                                        //
    this.component = component;                                                         // 39
    this.computation = null;                                                            // 40
    this.oldData = null;                                                                // 41
  }                                                                                     //
                                                                                        //
  MeteorDataManager.prototype.dispose = (function () {                                  // 37
    function dispose() {                                                                // 44
      if (this.computation) {                                                           // 45
        this.computation.stop();                                                        // 46
        this.computation = null;                                                        // 47
      }                                                                                 //
    }                                                                                   //
                                                                                        //
    return dispose;                                                                     //
  })();                                                                                 //
                                                                                        //
  MeteorDataManager.prototype.calculateData = (function () {                            // 37
    function calculateData() {                                                          // 51
      var component = this.component;                                                   // 52
                                                                                        //
      if (!component.getMeteorData) {                                                   // 54
        return null;                                                                    // 55
      }                                                                                 //
                                                                                        //
      // When rendering on the server, we don't want to use the Tracker.                //
      // We only do the first rendering on the server so we can get the data right away
      if (Meteor.isServer) {                                                            // 60
        return component.getMeteorData();                                               // 61
      }                                                                                 //
                                                                                        //
      if (this.computation) {                                                           // 64
        this.computation.stop();                                                        // 65
        this.computation = null;                                                        // 66
      }                                                                                 //
                                                                                        //
      var data = undefined;                                                             // 69
      // Use Tracker.nonreactive in case we are inside a Tracker Computation.           //
      // This can happen if someone calls `ReactDOM.render` inside a Computation.       //
      // In that case, we want to opt out of the normal behavior of nested              //
      // Computations, where if the outer one is invalidated or stopped,                //
      // it stops the inner one.                                                        //
      this.computation = Tracker.nonreactive(function () {                              // 75
        return Tracker.autorun(function (c) {                                           // 76
          if (c.firstRun) {                                                             // 77
            var savedSetState = component.setState;                                     // 78
            try {                                                                       // 79
              component.setState = function () {                                        // 80
                throw new Error("Can't call `setState` inside `getMeteorData` as this could cause an endless" + " loop. To respond to Meteor data changing, consider making this component" + " a \"wrapper component\" that only fetches data and passes it in as props to" + " a child component. Then you can use `componentWillReceiveProps` in that" + " child component.");
              };                                                                        //
                                                                                        //
              data = component.getMeteorData();                                         // 89
            } finally {                                                                 //
              component.setState = savedSetState;                                       // 91
            }                                                                           //
          } else {                                                                      //
            // Stop this computation instead of using the re-run.                       //
            // We use a brand-new autorun for each call to getMeteorData                //
            // to capture dependencies on any reactive data sources that                //
            // are accessed.  The reason we can't use a single autorun                  //
            // for the lifetime of the component is that Tracker only                   //
            // re-runs autoruns at flush time, while we need to be able to              //
            // re-call getMeteorData synchronously whenever we want, e.g.               //
            // from componentWillUpdate.                                                //
            c.stop();                                                                   // 102
            // Calling forceUpdate() triggers componentWillUpdate which                 //
            // recalculates getMeteorData() and re-renders the component.               //
            component.forceUpdate();                                                    // 105
          }                                                                             //
        });                                                                             //
      });                                                                               //
                                                                                        //
      if (Package.mongo && Package.mongo.Mongo) {                                       // 110
        Object.keys(data).forEach(function (key) {                                      // 111
          if (data[key] instanceof Package.mongo.Mongo.Cursor) {                        // 112
            console.warn("Warning: you are returning a Mongo cursor from getMeteorData. This value " + "will not be reactive. You probably want to call `.fetch()` on the cursor " + "before returning it.");
          }                                                                             //
        });                                                                             //
      }                                                                                 //
                                                                                        //
      return data;                                                                      // 121
    }                                                                                   //
                                                                                        //
    return calculateData;                                                               //
  })();                                                                                 //
                                                                                        //
  MeteorDataManager.prototype.updateData = (function () {                               // 37
    function updateData(newData) {                                                      // 124
      var component = this.component;                                                   // 125
      var oldData = this.oldData;                                                       // 126
                                                                                        //
      if (!(newData && typeof newData === 'object')) {                                  // 128
        throw new Error("Expected object returned from getMeteorData");                 // 129
      }                                                                                 //
      // update componentData in place based on newData                                 //
      for (var key in babelHelpers.sanitizeForInObject(newData)) {                      // 132
        component.data[key] = newData[key];                                             // 133
      }                                                                                 //
      // if there is oldData (which is every time this method is called                 //
      // except the first), delete keys in newData that aren't in                       //
      // oldData.  don't interfere with other keys, in case we are                      //
      // co-existing with something else that writes to a component's                   //
      // this.data.                                                                     //
      if (oldData) {                                                                    // 140
        for (var key in babelHelpers.sanitizeForInObject(oldData)) {                    // 141
          if (!(key in newData)) {                                                      // 142
            delete component.data[key];                                                 // 143
          }                                                                             //
        }                                                                               //
      }                                                                                 //
      this.oldData = newData;                                                           // 147
    }                                                                                   //
                                                                                        //
    return updateData;                                                                  //
  })();                                                                                 //
                                                                                        //
  return MeteorDataManager;                                                             //
})();                                                                                   //
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['react-meteor-data'] = {
  ReactMeteorData: ReactMeteorData
};

})();
