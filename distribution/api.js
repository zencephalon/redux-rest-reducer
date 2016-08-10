'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = configureAPI;
var CONTENT_TYPE = 'application/vnd.travelytix.guestfriend-1.0+json';

function configureAPI(API_URL) {
  function fetchFromAPI(endpoint) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$options = _ref.options;
    var options = _ref$options === undefined ? {} : _ref$options;
    var _ref$image = _ref.image;
    var image = _ref$image === undefined ? false : _ref$image;
    var _ref$json = _ref.json;
    var json = _ref$json === undefined ? true : _ref$json;

    var authToken = localStorage.getItem('jwt_token');
    var headers = {
      Accept: CONTENT_TYPE
    };
    if (!image) {
      headers['Content-Type'] = CONTENT_TYPE;
    }
    if (authToken && authToken !== 'null') {
      headers['X-AUTH-TOKEN'] = authToken;
    }
    return fetch(API_URL + endpoint, Object.assign({
      headers: headers
    }, options)).then(function (r) {
      if (!r.ok) {
        throw Error(r.statusText);
      }
      return json ? r.json() : r;
    });
  }

  function postToAPI(endpoint) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return fetchFromAPI(endpoint, { options: Object.assign({ method: 'post' }, options) });
  }

  function postMultipartToAPI(endpoint) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var image = arguments[2];

    return fetchFromAPI(endpoint, {
      options: Object.assign({ method: 'post' }, options),
      image: image
    }).then(function (r) {
      return r;
    });
  }

  function putToAPI(endpoint) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return fetchFromAPI(endpoint, {
      options: Object.assign({ method: 'put' }, options),
      json: false
    });
  }

  function deleteFromAPI(endpoint) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return fetchFromAPI(endpoint, {
      options: Object.assign({ method: 'delete' }, options),
      json: false
    });
  }

  function postImage(imageFormData) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 'thumbnail' : arguments[1];

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
        var newItem = Object.assign({}, template, item);
        return postToAPI(endpoint + '/', {
          body: JSON.stringify(newItem)
        });
      },
      GET: function GET(id) {
        return fetchFromAPI(endpoint + '/' + id);
      },
      DELETE: function DELETE(id) {
        return deleteFromAPI(endpoint + '/' + id);
      },
      PUT: function PUT(id, item) {
        var newItem = Object.assign({}, template, item);
        return putToAPI(endpoint + '/' + id, {
          body: JSON.stringify(newItem)
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