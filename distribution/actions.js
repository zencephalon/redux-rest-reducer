'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withImageActionFactory = exports.actionFactory = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var actionFactory = exports.actionFactory = function actionFactory(stateName, t, api) {
  var action = {};

  var simpleActions = ['INVALIDATE', 'SELECT', 'UNSELECT'];

  var getPromiseQueue = [];

  simpleActions.forEach(function (simpleAction) {
    action[simpleAction] = function (id) {
      return { type: t[simpleAction], id: id };
    };
  });

  action.DELETE = {
    REQUEST: function REQUEST(id) {
      return { type: t.DELETE.REQUEST, id: id };
    },
    FAIL: function FAIL(id, error) {
      return { type: t.DELETE.FAIL, id: id, error: error };
    },
    CONFIRM: function CONFIRM(id) {
      return {
        type: t.DELETE.CONFIRM,
        id: id,
        receivedAt: Date.now()
      };
    }
  };

  action.PUT = {
    REQUEST: function REQUEST(id, data) {
      return { type: t.PUT.REQUEST, id: id, data: data };
    },
    FAIL: function FAIL(id, data, error) {
      return { type: t.PUT.FAIL, id: id, data: data, error: error };
    },
    CONFIRM: function CONFIRM(id, data) {
      return {
        type: t.PUT.CONFIRM,
        id: id,
        data: data,
        receivedAt: Date.now()
      };
    }
  };

  action.POST = {
    REQUEST: function REQUEST(id, data) {
      return { type: t.POST.REQUEST, id: id, data: data };
    },
    FAIL: function FAIL(id, data, error) {
      return { type: t.POST.FAIL, id: id, data: data, error: error };
    },
    CONFIRM: function CONFIRM(id, data) {
      return {
        type: t.POST.CONFIRM,
        id: id,
        data: data,
        receivedAt: Date.now()
      };
    }
  };

  action.GET = {
    REQUEST: function REQUEST(id) {
      return { type: t.GET.REQUEST, id: id };
    },
    FAIL: function FAIL(id, error) {
      return { type: t.GET.FAIL, id: id, error: error };
    },
    CONFIRM: function CONFIRM(id, data) {
      return {
        id: id,
        data: data,
        type: t.GET.CONFIRM,
        receivedAt: Date.now()
      };
    },
    CACHE_HIT: function CACHE_HIT(id, data) {
      return { type: t.GET.CACHE_HIT, id: id, data: data };
    }
  };

  action.INDEX = {
    REQUEST: function REQUEST(params) {
      return { type: t.INDEX.REQUEST, params: params };
    },
    FAIL: function FAIL(params, error) {
      return { type: t.INDEX.FAIL, params: params, error: error };
    },
    CONFIRM: function CONFIRM(params, data) {
      var sortOrder = arguments.length <= 2 || arguments[2] === undefined ? ['orderInList', 'firstName', 'name', 'id'] : arguments[2];
      return {
        params: params,
        data: sortOrder ? (0, _lodash.sortBy)(data, sortOrder) : data,
        type: t.INDEX.CONFIRM,
        receivedAt: Date.now()
      };
    },
    CACHE_HIT: function CACHE_HIT(id, data) {
      return { type: t.INDEX.CACHE_HIT, id: id, data: data };
    }
  };

  var promise = {
    INDEX: function INDEX(id, sortOrder) {
      return function (dispatch) {
        dispatch(action.INDEX.REQUEST(id));
        return api.INDEX(id).then(function (json) {
          return dispatch(action.INDEX.CONFIRM(id, json.result, sortOrder));
        }).catch(function (e) {
          dispatch(action.INDEX.FAIL(id, e));
          dispatch({ type: 'ERROR', e: e });
        });
      };
    },
    INDEX_BY_PARAMS: function INDEX_BY_PARAMS(params, sortOrder) {
      return function (dispatch) {
        dispatch(action.INDEX.REQUEST(params));
        return api.INDEX_BY_PARAMS(params).then(function (json) {
          return dispatch(action.INDEX.CONFIRM(params, json.result, sortOrder));
        }).catch(function (e) {
          dispatch(action.INDEX.FAIL(params, e));
          dispatch({ type: 'ERROR', e: e });
        });
      };
    },
    DELETE: function DELETE(id) {
      return function (dispatch) {
        dispatch(action.DELETE.REQUEST(id));
        return api.DELETE(id).then(function () {
          return dispatch(action.DELETE.CONFIRM(id));
        }).catch(function (e) {
          dispatch(action.DELETE.FAIL(id, e));
          dispatch({ type: 'ERROR', e: e });
        });
      };
    },
    GET: function GET(id) {
      return function (dispatch, getState) {
        var _ref = getState()[stateName].http.things[id] || {
          GET: { requested: false }
        };

        var requested = _ref.GET.requested;
        // If we already have an on-going request just wait for it to finish

        if (requested) {
          var queuePromise = new Promise(function (resolve) {
            getPromiseQueue.push(resolve);
          });
          return queuePromise.then(function (json) {
            return action.GET.CONFIRM(id, json.result);
          });
        }

        dispatch(action.GET.REQUEST(id));
        return api.GET(id).then(function (json) {
          getPromiseQueue.forEach(function (resolve) {
            resolve(json);
          });
          getPromiseQueue = [];
          return dispatch(action.GET.CONFIRM(id, json.result));
        }).catch(function (e) {
          dispatch(action.GET.FAIL(id, e));
          dispatch({ type: 'ERROR', e: e });
          throw new Error('GET FAILED');
        });
      };
    },
    POST: function POST(id, data) {
      return function (dispatch) {
        dispatch(action.POST.REQUEST(id, data));
        return api.POST(data).then(function (json) {
          return dispatch(action.POST.CONFIRM(id, json.result));
        }).catch(function (e) {
          dispatch(action.POST.FAIL(id, data, e));
          dispatch({ type: 'ERROR', e: e });
          throw new Error('POST FAILED');
        });
      };
    },
    PUT: function PUT(id, data) {
      return function (dispatch) {
        dispatch(action.PUT.REQUEST(id, data));
        return api.PUT(id, data).then(function () {
          return dispatch(action.PUT.CONFIRM(id, data));
        }).catch(function (e) {
          dispatch(action.PUT.FAIL(id, data, e));
          dispatch({ type: 'ERROR', e: e });
          throw new Error('PUT FAILED');
        });
      };
    }
  };

  return {
    INDEX: function INDEX(id, sortOrder) {
      return function (dispatch) {
        return dispatch(promise.INDEX(id, sortOrder));
      };
    },
    INDEX_CACHE: function INDEX_CACHE(id) {
      return function (dispatch, getState) {
        var _ref2 = getState()[stateName].http.collections[id] || {
          data: null,
          confirmed: false
        };

        var data = _ref2.data;
        var confirmed = _ref2.confirmed;


        return dispatch(confirmed ? action.INDEX.CACHE_HIT(id, data) : promise.INDEX(id));
      };
    },
    INDEX_BY_PARAMS: function INDEX_BY_PARAMS(params, sortOrder) {
      return function (dispatch) {
        return dispatch(promise.INDEX_BY_PARAMS(params, sortOrder));
      };
    },
    INDEX_BY_PARAMS_CACHE: function INDEX_BY_PARAMS_CACHE(params) {
      return function (dispatch, getState) {
        var _ref3 = getState()[stateName].http.collections[params] || {
          data: null,
          confirmed: false
        };

        var data = _ref3.data;
        var confirmed = _ref3.confirmed;


        return dispatch(confirmed ? action.INDEX.CACHE_HIT(params, data) : promise.INDEX_BY_PARAMS(params));
      };
    },
    DELETE: function DELETE(id) {
      return function (dispatch) {
        return dispatch(promise.DELETE(id));
      };
    },
    GET: function GET(id) {
      return function (dispatch) {
        return dispatch(promise.GET(id));
      };
    },
    GET_CACHE: function GET_CACHE(id) {
      return function (dispatch, getState) {
        // Check cache before making request

        var _ref4 = getState()[stateName].http.things[id] || {
          data: null,
          GET: { confirmed: false }
        };

        var data = _ref4.data;
        var confirmed = _ref4.GET.confirmed;


        return dispatch(confirmed ? action.GET.CACHE_HIT(id, data) : promise.GET(id));
      };
    },
    POST: function POST(id, data) {
      return function (dispatch) {
        return dispatch(promise.POST(id, data));
      };
    },
    PUT: function PUT(id, data) {
      return function (dispatch, getState) {
        var _ref5 = getState()[stateName].http.things[id] || {
          data: {}
        };

        var oldData = _ref5.data;

        return dispatch(promise.PUT(id, _extends({}, oldData, data)));
      };
    },
    CLEAR_ERRORS: function CLEAR_ERRORS() {
      return {
        type: t.CLEAR_ERRORS
      };
    },
    action: action
  };
};

var withImageActionFactory = exports.withImageActionFactory = function withImageActionFactory(generic, imageParam, postImage) {
  var promise = {
    POST_WITH_IMG: function POST_WITH_IMG(id, data, image) {
      var type = arguments.length <= 3 || arguments[3] === undefined ? 'thumbnail' : arguments[3];
      return function (dispatch) {
        return postImage(image, type).then(function (j) {
          return dispatch(generic.POST(id, _extends({}, data, _defineProperty({}, imageParam, j.result))));
        });
      };
    },
    PUT_WITH_IMG: function PUT_WITH_IMG(id, data, image) {
      var type = arguments.length <= 3 || arguments[3] === undefined ? 'thumbnail' : arguments[3];
      return function (dispatch) {
        return postImage(image, type).then(function (j) {
          var output = _extends({}, data, _defineProperty({}, imageParam, j.result));
          dispatch(generic.PUT(id, output));
        });
      };
    }
  };
  return {
    POST_WITH_IMG: function POST_WITH_IMG(id, data, image) {
      var type = arguments.length <= 3 || arguments[3] === undefined ? 'thumbnail' : arguments[3];
      return function (dispatch) {
        // Provides feedback to the form that we've started processing
        // the overall request
        dispatch(generic.action.POST.REQUEST(id));
        return dispatch(promise.POST_WITH_IMG(id, data, image, type));
      };
    },
    PUT_WITH_IMG: function PUT_WITH_IMG(id, data, image) {
      var type = arguments.length <= 3 || arguments[3] === undefined ? 'thumbnail' : arguments[3];
      return function (dispatch) {
        // Provides feedback to the form that we've started processing
        // the overall request
        dispatch(generic.action.PUT.REQUEST(id));
        return dispatch(promise.PUT_WITH_IMG(id, data, image, type));
      };
    }
  };
};