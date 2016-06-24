var assert = require('chai').assert;
var http = require('../distribution/httpReducer');
var actionTypes = require('../distribution/actionTypes');
var actions = require('../distribution/actions');

var types = actionTypes.default('TEST')
var acts = actions.actionFactory('TEST', types, {}).action
var reducer = http.reducerFactory(types)

var testObj = { id: 5, ILUVU: true, name: 'Aleister Crowley' }

describe('Array', function() {
  describe('GET.REQUEST', function() {
    it('should set request state', function() {
      var state = reducer(undefined, acts.GET.REQUEST(5))
      assert(state.things[5].GET.requested)
      assert(!state.things[5].GET.failed)
      assert(!state.things[5].GET.confirmed)
    })
    it('should preserve existing data', function() {
      var state = reducer(undefined, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, testObj))
      state = reducer(state, acts.GET.REQUEST(5))
      assert(state.things[5].data.ILUVU)
    })
  })
  describe('GET.CONFIRM', function() {
    it('should set request state', function() {
      var state = reducer(undefined, acts.GET.CONFIRM(5))
      assert(!state.things[5].GET.requested)
      assert(!state.things[5].GET.failed)
      assert(state.things[5].GET.confirmed)
    })
    it('should set data', function() {
      var state = reducer(undefined, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, testObj))
      assert(state.things[5].data.ILUVU)
    })
    it('should overwrite existing data', function() {
      var state = reducer(undefined, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, testObj))
      state = reducer(state, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, { ILUVU: false }))
      assert(!state.things[5].data.ILUVU)
    })
  })
  describe('GET.FAIL', function() {
    it('should set request state', function() {
      var state = reducer(undefined, acts.GET.FAIL(5))
      assert(!state.things[5].GET.requested)
      assert(state.things[5].GET.failed)
      assert(!state.things[5].GET.confirmed)
    })
    it('should preserve existing data', function() {
      var state = reducer(undefined, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, testObj))
      state = reducer(state, acts.GET.FAIL(5))
      assert(state.things[5].data.ILUVU)
    })
  })
  describe('PUT.REQUEST', function() {
    it('should not break GET.REQUEST', function() {
      var state = reducer(undefined, acts.PUT.REQUEST(5))
      state = reducer(state, acts.GET.REQUEST(5))
    })
  })
})