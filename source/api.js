const CONTENT_TYPE = 'application/json'

export default function configureAPI(API_URL) {
  function fetchFromAPI(endpoint, { options = {}, image = false, json = true } = {}) {
    const headers = {
      Accept: CONTENT_TYPE,
    }
    if (!image) { headers['Content-Type'] = CONTENT_TYPE }
    return fetch(API_URL + endpoint, Object.assign({
      headers,
    }, options)).then(r => {
      if (!r.ok) {
        const e = new Error(r.status)
        e.json = json
        throw e
      }
      return json ? r.json().then(jsonVal => jsonVal) : r
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
      POST: (item) => postToAPI(`${endpoint}/`, {
        body: JSON.stringify({ ...template, ...item }),
      }),
      GET: (id) => fetchFromAPI(`${endpoint}/${id}`),
      DELETE: (id) => deleteFromAPI(`${endpoint}/${id}`),
      PUT: (id, item) => putToAPI(`${endpoint}/${id}`, {
        body: JSON.stringify({ ...template, ...item }),
      }),
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
