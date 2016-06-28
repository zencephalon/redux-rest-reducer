'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchFromAPI = fetchFromAPI;
exports.postToAPI = postToAPI;
exports.postMultipartToAPI = postMultipartToAPI;
exports.putToAPI = putToAPI;
exports.deleteFromAPI = deleteFromAPI;
exports.postImage = postImage;
exports.genericApiFactory = genericApiFactory;
var API_URL = 'http://52.87.59.36:8080/';
var CONTENT_TYPE = 'application/vnd.travelytix.guestfriend-1.0+json';

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
    return json ? r.json() : null;
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
  var thumbnail = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var type = thumbnail ? 'thumbnail' : 'cms_regular';
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