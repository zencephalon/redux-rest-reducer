'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducerDefaultState = exports.defaultIndexState = exports.defaultIndexRequestedState = exports.defaultPOSTState = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.reducerFactory = reducerFactory;

var _lodash = require('lodash');

var defaultPOSTState = exports.defaultPOSTState = {
  requested: false,
  confirmed: false,
  failed: false
};

var defaultIndexRequestedState = exports.defaultIndexRequestedState = {
  requested: true,
  confirmed: false,
  failed: false,
  data: []
};

var defaultIndexState = exports.defaultIndexState = {
  requested: false,
  confirmed: false,
  failed: false,
  data: []
};

var reducerDefaultState = exports.reducerDefaultState = {
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
};

var methodDefault = function methodDefault() {
  return {
    requested: false,
    failed: false,
    confirmed: false
  };
};

var thingDefault = function thingDefault() {
  return {
    data: {},
    GET: methodDefault(),
    DELETE: methodDefault(),
    PUT: methodDefault()
  };
};

function reducerFactory(t) {
  var reducer = function httpReducer() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? reducerDefaultState : arguments[0];
    var action = arguments[1];

    var things = void 0;
    var collections = void 0;
    var POST = void 0;

    switch (action.type) {
      case t.INVALIDATE:
        return _extends({}, state, {
          things: (0, _lodash.reject)(state.things, function (thing) {
            return thing.id === action.id;
          })
        });
      case t.GET.REQUEST:
        things = _extends({}, state.things);

        things[action.id] = things[action.id] || thingDefault();
        things[action.id].GET.requested = true;

        return _extends({}, state, {
          things: things
        });
      case t.GET.CONFIRM:
        things = _extends({}, state.things);

        things[action.id] = things[action.id] || thingDefault();
        things[action.id] = _extends({}, things[action.id], {
          GET: {
            requested: false,
            failed: false,
            confirmed: true
          },
          data: action.data
        });

        collections = (0, _lodash.mapValues)(state.collections, function (collection) {
          return _extends({}, collection, {
            data: collection.data.map(function (thing) {
              return thing.id === action.id ? action.data : thing;
            })
          });
        });

        return _extends({}, state, {
          things: things,
          collections: collections
        });
      case t.GET.FAIL:
        things = _extends({}, state.things);

        things[action.id] = things[action.id] || thingDefault();
        things[action.id] = _extends({}, things[action.id], {
          GET: {
            requested: false,
            failed: true,
            confirmed: false
          }
        });

        return _extends({}, state, {
          things: things
        });
      case t.INDEX.REQUEST:
        collections = _extends({}, state.collections);
        collections[action.params] = {
          data: [],
          requested: true,
          failed: false,
          confirmed: false
        };

        return _extends({}, state, { collections: collections });
      case t.INDEX.CONFIRM:
        collections = _extends({}, state.collections);
        things = _extends({}, state.things);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = action.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var datum = _step.value;

            if (!things[datum.id]) {
              things[datum.id] = thingDefault();
            }
            things[datum.id].data = datum;

            // should we do this? maybe not...
            if (!things[datum.id].GET) {
              things[datum.id].GET = methodDefault();
            }
            things[datum.id].GET.confirmed = true;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        collections[action.params] = {
          data: action.data,
          requested: false,
          failed: false,
          confirmed: true
        };

        return _extends({}, state, { collections: collections, things: things });
      case t.INDEX.FAIL:
        collections = _extends({}, state.collections);
        collections[action.params] = {
          data: [],
          requested: false,
          failed: true,
          confirmed: false
        };

        return _extends({}, state, { collections: collections });
      case t.DELETE.REQUEST:
        things = _extends({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          DELETE: {
            requested: true,
            failed: false,
            confirmed: false
          }
        });

        return _extends({}, state, { things: things });
      case t.DELETE.FAIL:
        things = _extends({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          DELETE: {
            requested: false,
            failed: false,
            confirmed: true
          }
        });

        return _extends({}, state, { things: things });
      case t.DELETE.CONFIRM:
        things = _extends({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          DELETE: {
            requested: false,
            failed: false,
            confirmed: true
          }
        });

        collections = (0, _lodash.mapValues)(state.collections, function (collection) {
          return _extends({}, collection, {
            data: collection.data.filter(function (thing) {
              return thing.id !== action.id;
            })
          });
        });

        return _extends({}, state, { things: things, collections: collections });
      case t.POST.REQUEST:
        POST = _extends({}, state.POST);
        POST[action.id] = {
          requested: true,
          failed: false,
          confirmed: false,
          data: action.data
        };

        return _extends({}, state, { POST: POST });
      case t.POST.CONFIRM:
        POST = _extends({}, state.POST);
        POST[action.id] = {
          requested: false,
          failed: false,
          confirmed: true,
          data: _extends({}, POST[action.id].data, {
            id: action.data
          })
        };

        return _extends({}, state, { POST: POST });
      case t.POST.FAIL:
        POST = _extends({}, state.POST);

        POST[action.id] = {
          requested: false,
          failed: true,
          confirmed: false,
          data: action.data
        };

        return _extends({}, state, { POST: POST });
      case t.PUT.REQUEST:
        things = _extends({}, state.things);

        things[action.id] = things[action.id] || thingDefault();
        things[action.id] = _extends({}, things[action.id], {
          PUT: {
            requested: true,
            failed: false,
            confirmed: false
          }
        });

        return _extends({}, state, { things: things });
      case t.PUT.CONFIRM:
        things = _extends({}, state.things);

        things[action.id] = things[action.id] || thingDefault();
        things[action.id] = _extends({}, things[action.id], {
          data: action.data,
          PUT: {
            requested: false,
            failed: false,
            confirmed: true
          }
        });

        collections = (0, _lodash.mapValues)(state.collections, function (collection) {
          return _extends({}, collection, {
            data: collection.data.map(function (thing) {
              return thing.id === action.id ? action.data : thing;
            })
          });
        });

        return _extends({}, state, { things: things, collections: collections });
      case t.PUT.FAIL:
        things = _extends({}, state.things);

        things[action.id] = things[action.id] || thingDefault();
        things[action.id] = _extends({}, things[action.id], {
          PUT: {
            requested: false,
            failed: true,
            confirmed: false
          }
        });

        return _extends({}, state, { things: things });
      default:
        return state;
    }
  };

  return reducer;
}