var assert = require('chai').assert;
var http = require('../distribution/httpReducer');
var actionTypes = require('../distribution/actionTypes');
//var actions = require('../distribution/actions');

var types = actionTypes.default("TEST")
//var acts = actions.actionFactory()
var reducer = http.reducerFactory(types)

describe('Array', function() {
  describe('GET.REQUEST', function () {
    it('It should set requested to true', function () {
      var state = reducer(undefined, { type: types.GET.REQUEST, id: 5 })
      assert(state.things[5].GET.requested);
    });
  });
});