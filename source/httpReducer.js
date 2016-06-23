import _ from "lodash"

export const defaultPOSTState = {
  requested: false,
  confirmed: false,
  failed: false
}

export const defaultIndexRequestedState = {
  requested: true,
  confirmed: false,
  failed: false,
  data: []
}

export const defaultIndexState = {
  requested: false,
  confirmed: false,
  failed: false,
  data: []
}

export const httpReducerDefaultState = {
  things: {
    /*
    "uuid": {
      data: {},
      GET: {
        requested: true,
        failed: false,
        confirmed: false
      },
      PUT: {
        requested: false,
        failed: false,
        confirmed: false
      },
      DELETE: {
        requested: false,
        failed: false,
        confirmed: false
      }
    }
    */
  },
  collections: {
    /*
    "params": {
      data: [],
      requested: true,
      failed: false,
      confirmed: false
    }
    */
  },
  // TODO: when react router switches pages we can clear the POST map
  POST: {
    /*
    "id": { requested: true, failed: false, confirmed: false, data: {} }
    */
  }
}

const methodDefault = () => {
  return {
    requested: false, failed: false, confirmed: false
  }
}

const thingDefault = () => {
  return {
    data: {},
    GET: methodDefault(),
    DELETE: methodDefault(),
    PUT: methodDefault()
  }
}

export function httpReducerFactory(t) {
  const reducer = function (state = httpReducerDefaultState, action) {
    let things
    let collections
    let POST

    switch (action.type) {
      case t.INVALIDATE:
        return Object.assign({}, state, {
          things: _.reject(state.things, thing =>
            { return thing.id === action.id})
        })
      case t.GET.REQUEST:
        things = Object.assign({}, state.things)
        things[action.id] = thingDefault()
        things[action.id].GET.requested = true
        return Object.assign({}, state, { things })
      case t.GET.CONFIRM:
        things = Object.assign({}, state.things)
        things[action.id] = {
          ...things[action.id],
          GET: {
            requested: false, failed: false, confirmed: true
          },
          data: action.data }

        collections = {}
        for (const collectionKey in state.collections) {
          let collection = state.collections[collectionKey]
          collections[collectionKey] = Object.assign({}, collection, {
            data: collection.data.map(thing => {
              return thing.id == action.id ? action.data : thing
            })
          })
        }

        return Object.assign({}, state, {
          things, collections
        })
      case t.GET.FAIL:
        things = Object.assign({}, state.things)
        things[action.id] = {
          ...things[action.id],
          GET: {
            requested: false, failed: true, confirmed: false
          },
          data: action.data
        }
        return Object.assign({}, state, {
          things
        })
      case t.INDEX.REQUEST:
        collections = Object.assign({}, state.collections)
        collections[action.params] = {
          data: [],
          requested: true,
          failed: false,
          confirmed: false
        }
        return Object.assign({}, state, { collections })
      case t.INDEX.CONFIRM:
        collections = Object.assign({}, state.collections)
        things = Object.assign({}, state.things)
        for (let datum of action.data) {
          if (!things[datum.id]) {
            things[datum.id] = thingDefault()
          }
          things[datum.id].data = datum
          if (!things[datum.id].GET) {
            things[datum.id].GET = methodDefault()
          }
          things[datum.id].GET.confirmed = true
        }
        collections[action.params] = {
          data: _.sortBy(action.data, ['firstName', 'name', 'id']),
          requested: false,
          failed: false,
          confirmed: true
        }
        return Object.assign({}, state, { collections, things })
      case t.INDEX.FAIL:
        collections = Object.assign({}, state.collections)
        collections[action.params] = {
          data: [],
          requested: false,
          failed: true,
          confirmed: false,
        }
        return Object.assign({}, state, { collections })
      case t.DELETE.REQUEST:
        things = Object.assign({}, state.things)
        things[action.id] = {
          ...things[action.id],
          DELETE: {
            requested: true, failed: false, confirmed: false
          }
        }
        return Object.assign({}, state, {
          things
        })
      case t.DELETE.FAIL:
        things = Object.assign({}, state.things)
        things[action.id] = {
          ...things[action.id],
          DELETE: {
            requested: false, failed: false, confirmed: true
          }
        }
        return Object.assign({}, state, {
          things
        })
      case t.DELETE.CONFIRM:
        things = Object.assign({}, state.things)
        things[action.id] = {
          ...things[action.id],
          DELETE: {
            requested: false, failed: false, confirmed: true
          },
        }

        collections = {}
        for (const collectionKey in state.collections) {
          let collection = state.collections[collectionKey]
          collections[collectionKey] = Object.assign({}, collection, {
            data: collection.data.filter(thing => thing.id != action.id)
          })
        }

        return Object.assign({}, state, {
          things, collections
        })
      case t.POST.REQUEST:
        POST = Object.assign({}, state.POST)
        POST[action.id] = { requested: true, failed: false, confirmed: false, data: action.data }
        return Object.assign({}, state, { POST })
      case t.POST.CONFIRM:
        POST = Object.assign({}, state.POST)
        const dataWithId = Object.assign({}, POST[action.id].data, { id: action.data })
        POST[action.id] = { requested: false, failed: false, confirmed: true, data: dataWithId }
        return Object.assign({}, state, { POST })
      case t.POST.FAILURE:
        POST = Object.assign({}, state.POST)
        POST[action.id] = { requested: false, failed: true, confirmed: false, data: action.data }
        return Object.assign({}, state, { POST })
      case t.PUT.REQUEST:
        things = Object.assign({}, state.things)
        things[action.id] = {
          ...things[action.id],
          PUT: {
            requested: true, failed: false, confirmed: false
          }
        }
        return Object.assign({}, state, {
          things
        })
      case t.PUT.CONFIRM:
        things = Object.assign({}, state.things)
        things[action.id] = {
          ...things[action.id],
          data: action.data,
          PUT: {
            requested: false, failed: false, confirmed: true
          }
        }

        collections = {}
        for (const collectionKey in state.collections) {
          let collection = state.collections[collectionKey]
          collections[collectionKey] = Object.assign({}, collection, {
            data: collection.data.map(thing => {
              return thing.id == action.id ? action.data : thing
            })
          })
        }

        return Object.assign({}, state, {
          things, collections
        })
      case t.PUT.FAILURE:
        things = Object.assign({}, state.things)
        things[action.id] = {
          ...things[action.id],
          PUT: {
            requested: false, failed: true, confirmed: false
          },
        }
        return Object.assign({}, state, {
          things
        })
      default:
        return state
    }
  }

  return reducer
}
