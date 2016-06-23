'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var neoActionTypes = exports.neoActionTypes = function neoActionTypes(name) {
  var actionTypes = ['INVALIDATE', 'SELECT', 'UNSELECT', 'SET_SELECT', 'SET_ADD_ANOTHER'];
  var exportTypes = {};
  actionTypes.forEach(function (key) {
    exportTypes[key] = 'NEO/' + name + '/' + key;
  });

  var requestTypes = ['DELETE', 'POST', 'GET', 'PUT', 'INDEX'];
  var statuses = ['REQUEST', 'CONFIRM', 'FAILURE', 'CACHE_HIT'];

  requestTypes.forEach(function (type) {
    var obj = {};
    statuses.forEach(function (status) {
      obj[status] = 'NEO/' + name + '/' + type + '/' + status;
    });
    exportTypes[type] = obj;
  });
  return exportTypes;
};