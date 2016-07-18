import { postImage } from './api'
import { sortBy } from 'lodash'

export const actionFactory = (stateName, t, api) => {
  const action = {}

  const simpleActions = ['INVALIDATE', 'SELECT', 'UNSELECT']

  simpleActions.forEach(simpleAction => {
    action[simpleAction] = (id) => (
      { type: t[simpleAction], id }
    )
  })

  action.DELETE = {
    REQUEST: (id) => (
      { type: t.DELETE.REQUEST, id }
    ),
    FAIL: (id, error) => (
      { type: t.DELETE.FAIL, id, error }
    ),
    CONFIRM: (id) => (
      {
        type: t.DELETE.CONFIRM,
        id,
        receivedAt: Date.now(),
      }
    ),
  }

  action.PUT = {
    REQUEST: (id, data) => (
      { type: t.PUT.REQUEST, id, data }
    ),
    FAIL: (id, data, error) => (
      { type: t.PUT.FAIL, id, data, error }
    ),
    CONFIRM: (id, data) => (
      {
        type: t.PUT.CONFIRM,
        id,
        data,
        receivedAt: Date.now(),
      }
    ),
  }

  action.POST = {
    REQUEST: (id, data) => (
      { type: t.POST.REQUEST, id, data }
    ),
    FAIL: (id, data, error) => (
      { type: t.POST.FAIL, id, data, error }
    ),
    CONFIRM: (id, data) => (
      {
        type: t.POST.CONFIRM,
        id,
        data,
        receivedAt: Date.now(),
      }
    ),
  }

  action.GET = {
    REQUEST: (id) => (
      { type: t.GET.REQUEST, id }
    ),
    FAIL: (id, error) => (
      { type: t.GET.FAIL, id, error }
    ),
    CONFIRM: (id, data) => (
      {
        id,
        data,
        type: t.GET.CONFIRM,
        receivedAt: Date.now(),
      }
    ),
    CACHE_HIT: (id, data) => (
      { type: t.GET.CACHE_HIT, id, data }
    ),
    WAIT: (id) => (
      { type: t.GET.WAIT, id }
    ),
  }

  action.INDEX = {
    REQUEST: (params) => (
      { type: t.INDEX.REQUEST, params }
    ),
    FAIL: (params, error) => (
      { type: t.INDEX.FAIL, params, error }
    ),
    CONFIRM: (params, data, sortOrder = ['orderInList', 'firstName', 'name', 'id']) => (
      {
        params,
        data: sortOrder ? sortBy(data, sortOrder) : data,
        type: t.INDEX.CONFIRM,
        receivedAt: Date.now(),
      }
    ),
  }

  const promise = {
    INDEX: (id, sortOrder) => (
      dispatch => {
        dispatch(action.INDEX.REQUEST(id))
        return api.INDEX(id)
          .then(json => dispatch(action.INDEX.CONFIRM(id, json.result, sortOrder)))
          .catch(e => dispatch(action.INDEX.FAIL(id, e)))
      }
    ),
    INDEX_BY_PARAMS: (params, sortOrder) => (
      dispatch => {
        dispatch(action.INDEX.REQUEST(params))
        return api.INDEX_BY_PARAMS(params)
          .then(json => dispatch(action.INDEX.CONFIRM(params, json.result, sortOrder)))
          .catch(e => dispatch(action.INDEX.FAIL(params, e)))
      }
    ),
    DELETE: (id) => (
      dispatch => {
        dispatch(action.DELETE.REQUEST(id))
        return api.DELETE(id)
          .then(() => dispatch(action.DELETE.CONFIRM(id)))
          .catch(e => dispatch(action.DELETE.FAIL(id, e)))
      }
    ),
    GET: (id) => (
      (dispatch, getState) => {
        const {
          GET: { requested },
        } = getState()[stateName].http.things[id] || {
          GET: { requested: false },
        }
        console.log('requested state in GET', requested)
        if (requested) return dispatch(action.GET.WAIT(id))

        dispatch(action.GET.REQUEST(id))
        return api.GET(id)
          .then(json => dispatch(action.GET.CONFIRM(id, json.result)))
          .catch(e => dispatch(action.GET.FAIL(id, e)))
      }
    ),
    POST: (id, data) => (
      dispatch => {
        dispatch(action.POST.REQUEST(id, data))
        return api.POST(data)
          .then(json => dispatch(action.POST.CONFIRM(id, json.result)))
          .catch(e => dispatch(action.POST.FAIL(id, data, e)))
      }
    ),
    PUT: (id, data) => (
      dispatch => {
        dispatch(action.PUT.REQUEST(id, data))
        return api.PUT(id, data)
          .then(() => dispatch(action.PUT.CONFIRM(id, data)))
          .catch(e => {
            dispatch(action.PUT.FAIL(id, data, e))
          })
      }
    ),
  }

  return {
    INDEX: id => dispatch => dispatch(promise.INDEX(id)),
    INDEX_BY_PARAMS: params => (
      dispatch => dispatch(promise.INDEX_BY_PARAMS(params))
    ),
    DELETE: id => dispatch => dispatch(promise.DELETE(id)),
    GET: id => dispatch => dispatch(promise.GET(id)),
    GET_CACHE: id => (
      (dispatch, getState) => {
        // Check cache before making request
        const {
          data,
          GET: { confirmed },
        } = getState()[stateName].http.things[id] || {
          data: null,
          GET: { confirmed: false },
        }

        return dispatch(confirmed ?
          action.GET.CACHE_HIT(id, data) : promise.GET(id))
      }
    ),
    POST: (id, data) => dispatch => dispatch(promise.POST(id, data)),
    PUT: (id, data) => (
      (dispatch, getState) => {
        const {
          data: oldData,
        } = getState()[stateName].http.things[id] || {
          data: {},
        }
        return dispatch(promise.PUT(id, Object.assign(oldData, data)))
      }
    ),
    action,
  }
}

export const withImageActionFactory = (generic, imageParam) => {
  const promise = {
    POST_WITH_IMG: (id, data, image, thumbnail = false) => (
      dispatch => (
        postImage(image, thumbnail).then(j =>
          dispatch(generic.POST(id, {
            ...data,
            [imageParam]: j.result,
          }))
        )
      )
    ),
    PUT_WITH_IMG: (id, data, image, thumbnail = false) => (
      dispatch => (
        postImage(image, thumbnail).then(j => {
          const output = {
            ...data,
            [imageParam]: j.result,
          }
          dispatch(generic.PUT(id, output))
        }
        )
      )
    ),
  }
  return {
    POST_WITH_IMG: (id, data, image, thumbnail = false) => (
      dispatch => {
        // Provides feedback to the form that we've started processing
        // the overall request
        dispatch(generic.action.POST.REQUEST(id))
        return dispatch(promise.POST_WITH_IMG(id, data, image, thumbnail))
      }
    ),
    PUT_WITH_IMG: (id, data, image, thumbnail = false) => (
      dispatch => {
        // Provides feedback to the form that we've started processing
        // the overall request
        dispatch(generic.action.PUT.REQUEST(id))
        return dispatch(promise.PUT_WITH_IMG(id, data, image, thumbnail))
      }
    ),
  }
}
