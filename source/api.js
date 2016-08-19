import { find } from 'lodash'

const CONTENT_TYPE = 'application/vnd.travelytix.guestfriend-1.0+json'

export default function configureAPI(API_URL) {
  function fetchFromAPI(endpoint, { options = {}, image = false, json = true } = {}) {
    const authToken = localStorage.getItem('jwt_token')
    const headers = {
      Accept: CONTENT_TYPE,
    }
    if (!image) { headers['Content-Type'] = CONTENT_TYPE }
    if (authToken && authToken !== 'null') {
      headers['X-AUTH-TOKEN'] = authToken
    }
    return fetch(API_URL + endpoint, Object.assign({
      headers,
    }, options)).then(r => {
      if (!r.ok) {
        if (r.status === 401) {
          localStorage.removeItem('jwt_token')
        }
        throw Error(r.statusText)
      }
      const newToken = r.headers.get('X-AUTH-TOKEN')
      if (newToken) {
        const requestProperty = r.headers.get('X-AUTH-HOTEL')
        const allProperties = JSON.parse(localStorage.getItem('all_properties'))
        const requestToken = find(allProperties, { propertyId: requestProperty }).token

        if (localStorage.getItem('jwt_token') === requestToken) {
          localStorage.setItem('jwt_token', newToken)
        }
        localStorage.setItem('all_properties', JSON.stringify({
          ...allProperties,
          [requestProperty]: newToken,
        }))
      }
      return json ? r.json() : r
    })
  }

  function postToAPI(endpoint, options = {}) {
    return fetchFromAPI(endpoint,
      { options: Object.assign({ method: 'post' }, options) }
    )
  }

  function postMultipartToAPI(endpoint, options = {}, image) {
    return fetchFromAPI(endpoint,
      {
        options: Object.assign({ method: 'post' }, options),
        image,
      }).then(r => r)
  }

  function putToAPI(endpoint, options = {}) {
    return fetchFromAPI(endpoint,
      {
        options: Object.assign({ method: 'put' }, options),
        json: false,
      })
  }

  function deleteFromAPI(endpoint, options = {}) {
    return fetchFromAPI(endpoint,
      {
        options: Object.assign({ method: 'delete' }, options),
        json: false,
      })
  }

  function postImage(imageFormData, type = 'thumbnail') {
    return postMultipartToAPI(`image/?image-type=${type}`, {
      body: imageFormData,
    }, true)
  }

  function genericApiFactory(endpoint, indexParam, template) {
    return {
      INDEX: (id) => {
        const req = indexParam ? `${endpoint}/?${indexParam}=${id}` : `${endpoint}/`
        return fetchFromAPI(req)
      },
      INDEX_BY_PARAMS: (params) => fetchFromAPI(`${endpoint}/?${params}`),
      POST: (item) => {
        const newItem = Object.assign({}, template, item)
        return postToAPI(`${endpoint}/`, {
          body: JSON.stringify(newItem),
        })
      },
      GET: (id) => fetchFromAPI(`${endpoint}/${id}`),
      DELETE: (id) => deleteFromAPI(`${endpoint}/${id}`),
      PUT: (id, item) => {
        const newItem = Object.assign({}, template, item)
        return putToAPI(`${endpoint}/${id}`, {
          body: JSON.stringify(newItem),
        })
      },
    }
  }

  return {
    fetchFromAPI,
    postToAPI,
    postMultipartToAPI,
    putToAPI,
    deleteFromAPI,
    postImage,
    genericApiFactory,
  }
}
