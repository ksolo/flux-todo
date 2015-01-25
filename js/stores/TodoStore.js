var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TodoConstants = require('../constants/TodoConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _todos = {};

// Create TodoItem
function create(text) {
  var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  _todos[id] = {
    id: id,
    complete: false,
    text: text
  };
}

// Update todo
function update(id, updates) {
  _todos[id] = assign({}, _todos[id], updates);
}

// Update all of the TodoItems with the same object
function updateAll(updates) {
  for (var id in _todos) {
    update(id, updates);
  }
}

// Delete a Todo
function destroy(id) {
  delete _todos[id];
}

// Delete completed
function destroyCompleted(){
  for(var id in _todos) {
    if (_todos[id].completed) {
      destroy(id);
    }
  }
}

var TodoStore = assign({}, EventEmitter.prototype, {

  areAllComplete: function(){
    for (var id in _todos) {
      if(!_todos[id].complete {
        return false;
      }
    }
    return true;
  }

  getAll: function(){
    return _todos;
  }

  emitChange: function(){
    this.emit(CHANGE_EVENT);
  }

  addChangeListener: function(callback){
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener: function(callback){
    this.removeListener(CHANGE_EVENT, callback);
  }

});

// Register callback to handle all updates
AppDispatcher.register(function(action){
  var text;

  switch(action.actionType) {
    case TodoConstants.TODO_CREATE:
      text = action.text.trim();
      if (text !== '') {
        create(text)
      }
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_TOGGLE_COMPLETE_ALL:
      if (TodoStore.areAllComplete()) {
        updateAll({complete: false});
      }
      else {
        updateAll({complete: true});
      }
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_UNDO_COMPLETE:
      update(action.id, {complete: false});
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_COMPLETE:
      update(action.id, {complete: true});
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_UPDATE_TEXT:
      text = action.text.trim();
      if (text !== '') {
        update(action.id, {text: text});
      }
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_DESTROY:
      destroy(action.id);
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_DESTROY_COMPLETED:
      destroyCompleted();
      TodoStore.emitChange();
      break;

    default:
  }
  return true;
});

module.exports = TodoStore;
