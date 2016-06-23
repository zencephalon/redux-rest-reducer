'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var actionTypes = function actionTypes(name) {
  var actionTypes = ['INVALIDATE', 'SELECT', 'UNSELECT', 'SET_SELECT', 'SET_ADD_ANOTHER'];
  var exportTypes = {};
  actionTypes.forEach(function (key) {
    exportTypes[key] = name + '/' + key;
  });

  var requestTypes = ['DELETE', 'POST', 'GET', 'PUT', 'INDEX'];
  var statuses = ['REQUEST', 'CONFIRM', 'FAILURE', 'CACHE_HIT'];

  requestTypes.forEach(function (type) {
    var obj = {};
    statuses.forEach(function (status) {
      obj[status] = name + '/' + type + '/' + status;
    });
    exportTypes[type] = obj;
  });
  return exportTypes;
};

exports.default = actionTypes;