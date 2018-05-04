import { reject, mapValues } from 'lodash'

export const defaultPOSTState = {
  requested: false,
  confirmed: false,
  failed: false,
}

export const defaultIndexRequestedState = {
  requested: true,
  confirmed: false,
  failed: false,
  data: [],
}

export const defaultIndexState = {
  requested: false,
  confirmed: false,
  failed: false,
  data: [],
}

export const reducerDefaultState = {
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
      confirmed: false,
      subscribeFilter: null,
    }
    */
  },
  // TODO: when react router switches pages we can clear the POST map
  POST: {
    /*
    "id": { requested: true, failed: false, confirmed: false, data: {} }
    */
  },
}

const methodDefault = () => (
  {
    requested: false,
    failed: false,
    confirmed: false,
  }
)

const thingDefault = () => (
  {
    data: {},
    GET: methodDefault(),
    DELETE: methodDefault(),
    PUT: methodDefault(),
  }
)

export function reducerFactory(t) {
  const reducer = function httpReducer(state = reducerDefaultState, action) {
    let things
    let collections
    let POST

    switch (action.type) {
      case t.INVALIDATE:
        return {
          ...state,
          things: reject(state.things, thing => thing.id === action.id),
        }
      case t.GET.REQUEST:
        things = { ...state.things }

        things[action.id] = things[action.id] || thingDefault()
        things[action.id].GET.requested = true

        return {
          ...state,
          things,
        }
      case t.GET.CONFIRM:
        things = { ...state.things }

        things[action.id] = things[action.id] || thingDefault()
        things[action.id] = {
          ...things[action.id],
          GET: {
            requested: false,
            failed: false,
            confirmed: true,
          },
          data: action.data,
        }

        collections = mapValues(state.collections, collection => (
          {
            ...collection,
            data: collection.data.map(thing =>
              (thing.id === action.id ? action.data : thing)),
          }
        ))

        return {
          ...state,
          things,
          collections,
        }
      case t.GET.FAIL:
        things = { ...state.things }

        things[action.id] = things[action.id] || thingDefault()
        things[action.id] = {
          ...things[action.id],
          GET: {
            requested: false,
            failed: true,
            confirmed: false,
          },
        }

        return {
          ...state,
          things,
        }
      case t.INDEX.REQUEST:
        collections = { ...state.collections }
        collections[action.params] = {
          data: [],
          requested: true,
          failed: false,
          confirmed: false,
        }

        return { ...state, collections }
      case t.INDEX.CONFIRM:
        collections = { ...state.collections }
        things = { ...state.things }

        if (action.shouldUpdateThings) {
          for (const datum of action.data) {
            if (!things[datum.id]) {
              things[datum.id] = thingDefault()
            }
            things[datum.id].data = datum

            // should we do this? maybe not...
            if (!things[datum.id].GET) {
              things[datum.id].GET = methodDefault()
            }
            things[datum.id].GET.confirmed = true
          }
        }

        collections[action.params] = {
          data: action.data,
          requested: false,
          failed: false,
          confirmed: true,
          subscribeFilter:
            (collections[action.params] ?
              collections[action.params].subscribeFilter
              :
              null
            )
            ||
            action.subscribeFilter,
        }

        return { ...state, collections, things }
      case t.INDEX.FAIL:
        collections = { ...state.collections }
        collections[action.params] = {
          data: [],
          requested: false,
          failed: true,
          confirmed: false,
        }

        return {
          ...state,
          collections,
        }
      case t.DELETE.REQUEST:
        things = { ...state.things }
        things[action.id] = {
          ...things[action.id],
          DELETE: {
            requested: true,
            failed: false,
            confirmed: false,
          },
        }

        return { ...state, things }
      case t.DELETE.FAIL:
        things = { ...state.things }
        things[action.id] = {
          ...things[action.id],
          DELETE: {
            requested: false,
            failed: false,
            confirmed: true,
          },
        }

        return {
          ...state,
          things,
        }
      case t.DELETE.CONFIRM:
        things = { ...state.things }
        things[action.id] = {
          ...things[action.id],
          DELETE: {
            requested: false,
            failed: false,
            confirmed: true,
          },
        }

        // Remove the thing from any collections containing it
        collections = mapValues(state.collections, collection => (
          {
            ...collection,
            data: collection.data.filter(thing =>
              thing.id !== action.id),
          }
        ))

        return { ...state, things, collections }
      case t.POST.REQUEST:
        POST = { ...state.POST }
        POST[action.id] = {
          requested: true,
          failed: false,
          confirmed: false,
          data: action.data,
        }

        return { ...state, POST }
      case t.POST.CONFIRM:
        POST = { ...state.POST }
        POST[action.id] = {
          requested: false,
          failed: false,
          confirmed: true,
          data: {
            ...POST[action.id].data,
            id: action.data,
          },
        }

        return { ...state, POST }
      case t.POST.FAIL:
        POST = { ...state.POST }

        POST[action.id] = {
          requested: false,
          failed: true,
          confirmed: false,
          data: action.data,
        }

        return {
          ...state,
          POST,
        }
      case t.PUT.REQUEST:
        things = { ...state.things }

        things[action.id] = things[action.id] || thingDefault()
        things[action.id] = {
          ...things[action.id],
          PUT: {
            requested: true,
            failed: false,
            confirmed: false,
          },
        }

        return { ...state, things }
      case t.PUT.CONFIRM:
        things = { ...state.things }

        things[action.id] = things[action.id] || thingDefault()
        things[action.id] = {
          ...things[action.id],
          data: action.data,
          PUT: {
            requested: false,
            failed: false,
            confirmed: true,
          },
        }

        // Update the things inside of collections
        collections = mapValues(state.collections, collection => (
          {
            ...collection,
            data: collection.data.map(thing =>
              (thing.id === action.id ? action.data : thing)
            ).filter(thing =>
              // Remove things that don't match the subscribe filter anymore
              !collection.subscribeFilter || collection.subscribeFilter(thing)
            ),
          }
        ))

        return { ...state, things, collections }
      case t.PUT.FAIL:
        things = { ...state.things }

        things[action.id] = things[action.id] || thingDefault()
        things[action.id] = {
          ...things[action.id],
          PUT: {
            requested: false,
            failed: true,
            confirmed: false,
          },
        }

        return {
          ...state,
          things,
        }
      // Real time actions
      case t.INSERT:
        collections = { ...state.collections }
        collections = mapValues(state.collections, collection => (
          collection.subscribeFilter &&
          collection.subscribeFilter(action.data) ?
          {
            ...collection,
            data: [action.data, ...collection.data],
          }
          :
          collection
        ))

        return {
          ...state,
          collections,
        }
      default:
        return state
    }
  }

  return reducer
}
