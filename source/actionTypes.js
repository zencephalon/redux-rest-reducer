const actionTypes = (name) => {
  const actionTypes = [
    // Real time push actionTypes
    'UPDATE',
    'INSERT',
    'REMOVE',
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
      obj[status] = `HTTP/${name}/${type}/${status}`
    })
    exportTypes[type] = obj
  })
  return exportTypes
}

export default actionTypes
