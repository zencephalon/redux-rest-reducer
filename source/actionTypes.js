const actionTypes = (name) => {
  const actionTypes = [
    'INVALIDATE',
    'SELECT',
    'UNSELECT',
    'SET_SELECT',
    'SET_ADD_ANOTHER'
  ]
  const exportTypes = {}
  actionTypes.forEach((key) => {
    exportTypes[key] = `${name}/${key}`
  })

  const requestTypes = ['DELETE', 'POST', 'GET', 'PUT', 'INDEX']
  const statuses =  ['REQUEST', 'CONFIRM', 'FAILURE', 'CACHE_HIT']

  requestTypes.forEach((type) => {
    var obj = {}
    statuses.forEach((status) => {
      obj[status] = `${name}/${type}/${status}`
    })
    exportTypes[type] = obj
  })
  return exportTypes
}

export default actionTypes