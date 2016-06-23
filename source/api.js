const API_URL = 'http://52.87.59.36:8080/'
const CONTENT_TYPE = 'application/vnd.travelytix.guestfriend-1.0+json'

export function fetchFromAPI(endpoint, { options = {}, image = false, json = true } = {}) {
  const authToken = localStorage.getItem('jwt_token')
  const headers = {
    Accept: CONTENT_TYPE
  }
  if (!image) { headers['Content-Type'] = CONTENT_TYPE }
  if (authToken && authToken != "null") {
    headers['X-AUTH-TOKEN'] = authToken
  }
  return fetch(API_URL + endpoint, Object.assign({
    headers
  }, options)).then(r => {
    if (!r.ok) {
      throw Error(r.statusText)
    }
    if (json) {
      return r.json()
    } else {
      return null
    }
  })
}

export function postToAPI(endpoint, options = {}) {
  return fetchFromAPI(endpoint,
    { options: Object.assign({method: 'post'}, options) }
  )
}

export function postMultipartToAPI(endpoint, options = {}, image) {
  return fetchFromAPI(endpoint,
    { options:
        Object.assign({method: 'post',}, options),
      image: image
    }).then(r => r)
}

export function putToAPI(endpoint, options = {}) {
  return fetchFromAPI(endpoint,
    { options:
        Object.assign({method: 'put',}, options),
      json: false
    })
}

export function deleteFromAPI(endpoint, options = {}) {
  return fetchFromAPI(endpoint,
    { options:
        Object.assign({method: 'delete',}, options),
      json: false
    })
}

export function postImage(imageFormData, thumbnail = false) {
  const type = thumbnail ? 'thumbnail' : 'cms_regular'
  return postMultipartToAPI(`image/?image-type=${type}`, {
    body: imageFormData
  }, true)
}

export function genericApiFactory(endpoint, indexParam, template) {
  return {
    'INDEX': (id) => {
      const req = indexParam ? `${endpoint}/?${indexParam}=${id}` : `${endpoint}/`
      return fetchFromAPI(req)
    },
    'INDEX_BY_PARAMS': (params) => {
      return fetchFromAPI(`${endpoint}/?${params}`)
    },
    'POST': (item) => {
      item = Object.assign({}, template, item)
      return postToAPI(`${endpoint}/`, {
        body: JSON.stringify(item)
      })
    },
    'GET': (id) => {
      return fetchFromAPI(`${endpoint}/${id}`)
    },
    'DELETE': (id) => {
      return deleteFromAPI(`${endpoint}/${id}`)
    },
    'PUT': (id, item) => {
      item = Object.assign({}, template, item)
      return putToAPI(`${endpoint}/${id}`, {
        body: JSON.stringify(item)
      })
    }
  }
}
