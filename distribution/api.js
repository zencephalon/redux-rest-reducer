'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = configureAPI;

var _lodash = require('lodash');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
        r.json().then(function (resp) {
          var e = new Error(r.status);
          e.response = resp;
          throw e;
        });
      }
      var newToken = r.headers.get('X-AUTH-TOKEN');
      // ILUVU: Check whether we got back a new token in the headers.
      // We will if our token will expire soon, and we should replace it.
      if (newToken) {
        // Which property did we make the request for?
        var requestProperty = r.headers.get('X-AUTH-HOTEL');
        var allProperties = JSON.parse(localStorage.getItem('all_properties'));
        // Find the token we used to make the request
        var requestPropertyEntry = (0, _lodash.find)(allProperties, {
          propertyId: requestProperty
        });
        var requestToken = requestPropertyEntry ? requestPropertyEntry.token : null;

        // Replace the current jwt_token if we used it to make this request
        if (localStorage.getItem('jwt_token') === requestToken) {
          localStorage.setItem('jwt_token', newToken);
        }
        // Always replace the token in the all_properties map
        localStorage.setItem('all_properties', JSON.stringify(_extends({}, allProperties, _defineProperty({}, requestProperty, newToken))));
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