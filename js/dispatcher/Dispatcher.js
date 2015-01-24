var Promise = require('es6-promise').Promise;
var assign = require('object-assign');

var _callbacks = [];
var _promises = [];

var Dispatcher = function(){};
Dispatcher.prototype = assign({}, Dispatcher.prototype, {
  // the register method registers a callback from a store and
  // returns to the index of the registered callback
  register: function(callback) {
    _callbacks.push(callback);
    return _callbacks.length - 1;
  },

  // dispatch
  // payload is an object with the data from the action
  dispatch: function(payload) {
    // create array of promises for callbacks to reference
    var resolves = [];
    var rejects = [];
    _promises = _callbacks.map(function(_, index){
      return new Promise(function(resolve, reject){
        resolves[index] = resolve;
        rejects[index] = reject;
      });
    });
    // dispatch to callbacks and resolve/reject promises
    _callbacks.forEach(function(callback, index){
      Promise.resolve(callback(payload)).then(function(){
        resolves[index](payload);
      }, function(){
        rejects[index](new Error('Dispatcher callback unsuccessful'));
      });
    })

    _promises = [];
  }
});

module.exports = Dispatcher;