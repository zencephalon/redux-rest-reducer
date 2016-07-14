const assert = require('chai').assert;
const http = require('../distribution/httpReducer');
const actionTypes = require('../distribution/actionTypes');
const actions = require('../distribution/actions');

const types = actionTypes.default('TEST')
const acts = actions.actionFactory('TEST', types, {}).action
const reducer = http.reducerFactory(types)

const testObj = { id: 5, ILUVU: true, name: 'Aleister Crowley' }

describe('Array', () => {
  describe('GET.REQUEST', () => {
    it('should set request state', () => {
      const state = reducer(undefined, acts.GET.REQUEST(5))
      assert(state.things[5].GET.requested)
      assert(!state.things[5].GET.failed)
      assert(!state.things[5].GET.confirmed)
    })
    it('should preserve existing data', () => {
      let state = reducer(undefined, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, testObj))
      state = reducer(state, acts.GET.REQUEST(5))
      assert(state.things[5].data.ILUVU)
    })
  })
  describe('GET.CONFIRM', () => {
    it('should set request state', () => {
      const state = reducer(undefined, acts.GET.CONFIRM(5))
      assert(!state.things[5].GET.requested)
      assert(!state.things[5].GET.failed)
      assert(state.things[5].GET.confirmed)
    })
    it('should set data', () => {
      let state = reducer(undefined, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, testObj))
      assert(state.things[5].data.ILUVU)
    })
    it('should overwrite existing data', () => {
      let state = reducer(undefined, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, testObj))
      state = reducer(state, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, { ILUVU: false }))
      assert(!state.things[5].data.ILUVU)
    })
  })
  describe('GET.FAIL', () => {
    it('should set request state', () => {
      const state = reducer(undefined, acts.GET.FAIL(5))
      assert(!state.things[5].GET.requested)
      assert(state.things[5].GET.failed)
      assert(!state.things[5].GET.confirmed)
    })
    it('should preserve existing data', () => {
      let state = reducer(undefined, acts.GET.REQUEST(5))
      state = reducer(state, acts.GET.CONFIRM(5, testObj))
      state = reducer(state, acts.GET.FAIL(5))
      assert(state.things[5].data.ILUVU)
    })
  })
  describe('PUT.REQUEST', () => {
    it('should not break GET.REQUEST', () => {
      let state = reducer(undefined, acts.PUT.REQUEST(5))
      state = reducer(state, acts.GET.REQUEST(5))
    })
  })
  describe('INDEX.CONFIRM', () => {
    it('should populate the things cache', () => {

    })
  })
})
