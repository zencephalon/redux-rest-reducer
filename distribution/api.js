'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = configureAPI;
var CONTENT_TYPE = 'application/json';

function configureAPI(API_URL) {
  function fetchFromAPI(endpoint) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$options = _ref.options,
        options = _ref$options === undefined ? {} : _ref$options,
        _ref$image = _ref.image,
        image = _ref$image === undefined ? false : _ref$image,
        _ref$json = _ref.json,
        json = _ref$json === undefined ? true : _ref$json;

    var authToken = localStorage.getItem('jwt_token');
    var headers = {
      Accept: CONTENT_TYPE
    };
    if (!image) {
      headers['Content-Type'] = CONTENT_TYPE;
    }
    // Send up our token
    if (authToken && authToken !== 'null') {
      headers['X-AUTH-TOKEN'] = authToken;
    }
    return fetch(API_URL + endpoint, Object.assign({
      headers: headers
    }, options)).then(function (r) {
      if (!r.ok) {
        // ILUVU: 401 means we used an expired token and we should logout
        if (r.status === 401) {
          localStorage.removeItem('jwt_token');
        }
        var e = new Error(r.status);
        e.json = json;
        throw e;
      }
      return json ? r.json().then(function (jsonVal) {
        return jsonVal;
      }) : r;
    });
  }

  function postToAPI(endpoint) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return fetchFromAPI(endpoint, { options: Object.assign({ method: 'post' }, options) });
  }

  function postMultipartToAPI(endpoint) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var image = arguments[2];

    return fetchFromAPI(endpoint, {
      options: Object.assign({ method: 'post' }, options),
      image: image
    }).then(function (r) {
      return r;
    });
  }

  function putToAPI(endpoint) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return fetchFromAPI(endpoint, {
      options: Object.assign({ method: 'put' }, options),
      json: false
    });
  }

  function deleteFromAPI(endpoint) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return fetchFromAPI(endpoint, {
      options: Object.assign({ method: 'delete' }, options),
      json: false
    });
  }

  function postImage(imageFormData) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'thumbnail';

    return postMultipartToAPI('image/?image-type=' + type, {
      body: imageFormData
    }, true);
  }

  function genericApiFactory(endpoint, indexParam, template) {
    return {
      INDEX: function INDEX(id) {
        var req = indexParam ? endpoint + '/?' + indexParam + '=' + id : endpoint + '/';
        return fetchFromAPI(req);
      },
      INDEX_BY_PARAMS: function INDEX_BY_PARAMS(params) {
        return fetchFromAPI(endpoint + '/?' + params);
      },
      POST: function POST(item) {
        return postToAPI(endpoint + '/', {
          body: JSON.stringify(_extends({}, template, item))
        });
      },
      GET: function GET(id) {
        return fetchFromAPI(endpoint + '/' + id);
      },
      DELETE: function DELETE(id) {
        return deleteFromAPI(endpoint + '/' + id);
      },
      PUT: function PUT(id, item) {
        return putToAPI(endpoint + '/' + id, {
          body: JSON.stringify(_extends({}, template, item))
        });
      }
    };
  }

  return {
    fetchFromAPI: fetchFromAPI,
    postToAPI: postToAPI,
    postMultipartToAPI: postMultipartToAPI,
    putToAPI: putToAPI,
    deleteFromAPI: deleteFromAPI,
    postImage: postImage,
    genericApiFactory: genericApiFactory
  };
}