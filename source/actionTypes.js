const actionTypes = (name) => {
  const actionTypes = [
    'INVALIDATE',
    'SELECT',
    'UNSELECT',
    'SET_SELECT',
    'SET_ADD_ANOTHER',
    'CLEAR_ERRORS',
  ]
  const exportTypes = {}
  actionTypes.forEach((key) => {
    exportTypes[key] = `NEO/${name}/${key}`
  })

  const requestTypes = ['DELETE', 'POST', 'GET', 'PUT', 'INDEX']
  const statuses = ['REQUEST', 'CONFIRM', 'FAIL', 'CACHE_HIT']

  requestTypes.forEach((type) => {
    const obj = {}
    statuses.forEach((status) => {
      obj[status] = `NEO/${name}/${type}/${status}`
    })
    exportTypes[type] = obj
  })
  return exportTypes
}

export default actionTypes
