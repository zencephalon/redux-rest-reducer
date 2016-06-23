'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducerDefaultState = exports.defaultIndexState = exports.defaultIndexRequestedState = exports.defaultPOSTState = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.reducerFactory = reducerFactory;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    requested: false, failed: false, confirmed: false
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
  var reducer = function reducer() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? httpReducerDefaultState : arguments[0];
    var action = arguments[1];

    var things = void 0;
    var collections = void 0;
    var POST = void 0;

    switch (action.type) {
      case t.INVALIDATE:
        return Object.assign({}, state, {
          things: _lodash2.default.reject(state.things, function (thing) {
            return thing.id === action.id;
          })
        });
      case t.GET.REQUEST:
        things = Object.assign({}, state.things);
        things[action.id] = thingDefault();
        things[action.id].GET.requested = true;
        return Object.assign({}, state, { things: things });
      case t.GET.CONFIRM:
        things = Object.assign({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          GET: {
            requested: false, failed: false, confirmed: true
          },
          data: action.data });

        collections = {};
        for (var collectionKey in state.collections) {
          var collection = state.collections[collectionKey];
          collections[collectionKey] = Object.assign({}, collection, {
            data: collection.data.map(function (thing) {
              return thing.id == action.id ? action.data : thing;
            })
          });
        }

        return Object.assign({}, state, {
          things: things, collections: collections
        });
      case t.GET.FAIL:
        things = Object.assign({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          GET: {
            requested: false, failed: true, confirmed: false
          },
          data: action.data
        });
        return Object.assign({}, state, {
          things: things
        });
      case t.INDEX.REQUEST:
        collections = Object.assign({}, state.collections);
        collections[action.params] = {
          data: [],
          requested: true,
          failed: false,
          confirmed: false
        };
        return Object.assign({}, state, { collections: collections });
      case t.INDEX.CONFIRM:
        collections = Object.assign({}, state.collections);
        things = Object.assign({}, state.things);
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
          data: _lodash2.default.sortBy(action.data, ['firstName', 'name', 'id']),
          requested: false,
          failed: false,
          confirmed: true
        };
        return Object.assign({}, state, { collections: collections, things: things });
      case t.INDEX.FAIL:
        collections = Object.assign({}, state.collections);
        collections[action.params] = {
          data: [],
          requested: false,
          failed: true,
          confirmed: false
        };
        return Object.assign({}, state, { collections: collections });
      case t.DELETE.REQUEST:
        things = Object.assign({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          DELETE: {
            requested: true, failed: false, confirmed: false
          }
        });
        return Object.assign({}, state, {
          things: things
        });
      case t.DELETE.FAIL:
        things = Object.assign({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          DELETE: {
            requested: false, failed: false, confirmed: true
          }
        });
        return Object.assign({}, state, {
          things: things
        });
      case t.DELETE.CONFIRM:
        things = Object.assign({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          DELETE: {
            requested: false, failed: false, confirmed: true
          }
        });

        collections = {};
        for (var _collectionKey in state.collections) {
          var _collection = state.collections[_collectionKey];
          collections[_collectionKey] = Object.assign({}, _collection, {
            data: _collection.data.filter(function (thing) {
              return thing.id != action.id;
            })
          });
        }

        return Object.assign({}, state, {
          things: things, collections: collections
        });
      case t.POST.REQUEST:
        POST = Object.assign({}, state.POST);
        POST[action.id] = { requested: true, failed: false, confirmed: false, data: action.data };
        return Object.assign({}, state, { POST: POST });
      case t.POST.CONFIRM:
        POST = Object.assign({}, state.POST);
        var dataWithId = Object.assign({}, POST[action.id].data, { id: action.data });
        POST[action.id] = { requested: false, failed: false, confirmed: true, data: dataWithId };
        return Object.assign({}, state, { POST: POST });
      case t.POST.FAILURE:
        POST = Object.assign({}, state.POST);
        POST[action.id] = { requested: false, failed: true, confirmed: false, data: action.data };
        return Object.assign({}, state, { POST: POST });
      case t.PUT.REQUEST:
        things = Object.assign({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          PUT: {
            requested: true, failed: false, confirmed: false
          }
        });
        return Object.assign({}, state, {
          things: things
        });
      case t.PUT.CONFIRM:
        things = Object.assign({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          data: action.data,
          PUT: {
            requested: false, failed: false, confirmed: true
          }
        });

        collections = {};
        for (var _collectionKey2 in state.collections) {
          var _collection2 = state.collections[_collectionKey2];
          collections[_collectionKey2] = Object.assign({}, _collection2, {
            data: _collection2.data.map(function (thing) {
              return thing.id == action.id ? action.data : thing;
            })
          });
        }

        return Object.assign({}, state, {
          things: things, collections: collections
        });
      case t.PUT.FAILURE:
        things = Object.assign({}, state.things);
        things[action.id] = _extends({}, things[action.id], {
          PUT: {
            requested: false, failed: true, confirmed: false
          }
        });
        return Object.assign({}, state, {
          things: things
        });
      default:
        return state;
    }
  };

  return reducer;
}