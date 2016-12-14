'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var actionTypes = function actionTypes(name) {
  var actionTypes = [
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
      obj[status] = 'HTTP/' + name + '/' + type + '/' + status;
    });
    exportTypes[type] = obj;
  });
  return exportTypes;
};

exports.default = actionTypes;