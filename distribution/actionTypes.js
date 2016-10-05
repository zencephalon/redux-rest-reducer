'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var actionTypes = function actionTypes(name) {
  var actionTypes = ['INVALIDATE', 'SELECT', 'UNSELECT', 'SET_SELECT', 'SET_ADD_ANOTHER',
  // Real time push actionTypes
  'UPDATE', 'INSERT', 'REMOVE'];
  var exportTypes = {};
  actionTypes.forEach(function (key) {
    exportTypes[key] = 'NEO/' + name + '/' + key;
  });

  var requestTypes = ['DELETE', 'POST', 'GET', 'PUT', 'INDEX'];
  var statuses = ['REQUEST', 'CONFIRM', 'FAIL', 'CACHE_HIT'];

  requestTypes.forEach(function (type) {
    var obj = {};
    statuses.forEach(function (status) {
      obj[status] = 'NEO/' + name + '/' + type + '/' + status;
    });
    exportTypes[type] = obj;
  });
  return exportTypes;
};

exports.default = actionTypes;