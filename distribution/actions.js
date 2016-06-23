'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withImageActionFactory = exports.actionFactory = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _api = require('./api');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var actionFactory = exports.actionFactory = function actionFactory(stateName, t, api) {
  var action = {};

  var simpleActions = ['INVALIDATE', 'SELECT', 'UNSELECT'];

  simpleActions.forEach(function (simpleAction) {
    action[simpleAction] = function (id) {
      return { type: t[simpleAction], id: id };
    };
  });

  action.DELETE = {
    REQUEST: function REQUEST(id) {
      return { type: t.DELETE.REQUEST, id: id };
    },
    FAILURE: function FAILURE(id, error) {
      return { type: t.DELETE.FAILURE, id: id, error: error };
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
    FAILURE: function FAILURE(id, data, error) {
      return { type: t.PUT.FAILURE, id: id, data: data, error: error };
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
    FAILURE: function FAILURE(id, data, error) {
      return { type: t.POST.FAILURE, id: id, data: data, error: error };
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
    FAILURE: function FAILURE(id, error) {
      return { type: t.GET.FAILURE, id: id, error: error };
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
    FAILURE: function FAILURE(params, error) {
      return { type: t.INDEX.FAILURE, params: params, error: error };
    },
    CONFIRM: function CONFIRM(params, data) {
      return {
        params: params,
        data: data,
        type: t.INDEX.CONFIRM,
        receivedAt: Date.now()
      };
    }
  };

  var promise = {
    INDEX: function INDEX(id) {
      return function (dispatch) {
        dispatch(action.INDEX.REQUEST(id));
        return api.INDEX(id).then(function (json) {
          return dispatch(action.INDEX.CONFIRM(id, json.result));
        }).catch(function (e) {
          return dispatch(action.INDEX.FAILURE(id, e));
        });
      };
    },
    INDEX_BY_PARAMS: function INDEX_BY_PARAMS(params) {
      return function (dispatch) {
        dispatch(action.INDEX.REQUEST(params));
        return api.INDEX_BY_PARAMS(params).then(function (json) {
          return dispatch(action.INDEX.CONFIRM(params, json.result));
        }).catch(function (e) {
          return dispatch(action.INDEX.FAILURE(params, e));
        });
      };
    },
    DELETE: function DELETE(id) {
      return function (dispatch) {
        dispatch(action.DELETE.REQUEST(id));
        return api.DELETE(id).then(function () {
          return dispatch(action.DELETE.CONFIRM(id));
        }).catch(function (e) {
          return dispatch(action.DELETE.FAILURE(id, e));
        });
      };
    },
    GET: function GET(id) {
      return function (dispatch) {
        dispatch(action.GET.REQUEST(id));
        return api.GET(id).then(function (json) {
          return dispatch(action.GET.CONFIRM(id, json.result));
        }).catch(function (e) {
          return dispatch(action.GET.FAILURE(id, e));
        });
      };
    },
    POST: function POST(id, data) {
      return function (dispatch) {
        dispatch(action.POST.REQUEST(id, data));
        return api.POST(data).then(function (json) {
          return dispatch(action.POST.CONFIRM(id, json.result));
        }).catch(function (e) {
          return dispatch(action.POST.FAILURE(id, data, e));
        });
      };
    },
    PUT: function PUT(id, data) {
      return function (dispatch) {
        dispatch(action.PUT.REQUEST(id, data));
        return api.PUT(id, data).then(function () {
          return dispatch(action.PUT.CONFIRM(id, data));
        }).catch(function (e) {
          dispatch(action.PUT.FAILURE(id, data, e));
        });
      };
    }
  };

  return {
    INDEX: function INDEX(id) {
      return function (dispatch) {
        return dispatch(promise.INDEX(id));
      };
    },
    INDEX_BY_PARAMS: function INDEX_BY_PARAMS(params) {
      return function (dispatch) {
        return dispatch(promise.INDEX_BY_PARAMS(params));
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

        var _ref = getState()[stateName].http.things[id] || {
          data: null,
          GET: { confirmed: false }
        };

        var data = _ref.data;
        var confirmed = _ref.GET.confirmed;


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
        var _ref2 = getState()[stateName].http.things[id] || {
          data: {}
        };

        var oldData = _ref2.data;

        return dispatch(promise.PUT(id, Object.assign(oldData, data)));
      };
    },
    action: action
  };
};

var withImageActionFactory = exports.withImageActionFactory = function withImageActionFactory(generic, imageParam) {
  var promise = {
    POST_WITH_IMG: function POST_WITH_IMG(id, data, image) {
      var thumbnail = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      return function (dispatch) {
        return (0, _api.postImage)(image, thumbnail).then(function (j) {
          return dispatch(generic.POST(id, _extends(_defineProperty({}, imageParam, j.result), data)));
        });
      };
    },
    PUT_WITH_IMG: function PUT_WITH_IMG(id, data, image) {
      var thumbnail = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      return function (dispatch) {
        return (0, _api.postImage)(image, thumbnail).then(function (j) {
          return dispatch(generic.PUT(id, _extends(_defineProperty({}, imageParam, j.result), data)));
        });
      };
    }
  };
  return {
    POST_WITH_IMG: function POST_WITH_IMG(id, data, image) {
      var thumbnail = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      return function (dispatch) {
        // Provides feedback to the form that we've started processing
        // the overall request
        dispatch(generic.action.POST.REQUEST(id));
        return dispatch(promise.POST_WITH_IMG(id, data, image, thumbnail));
      };
    },
    PUT_WITH_IMG: function PUT_WITH_IMG(id, data, image) {
      var thumbnail = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      return function (dispatch) {
        // Provides feedback to the form that we've started processing
        // the overall request
        dispatch(generic.action.PUT.REQUEST(id));
        return dispatch(promise.PUT_WITH_IMG(id, data, image, thumbnail));
      };
    }
  };
};