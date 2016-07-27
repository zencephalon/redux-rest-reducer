import configureAPI from './api'
import * as httpReducer from './httpReducer'
import * as actions from './actions'
import * as actionTypes from './actionTypes'

module.exports = {
  configureAPI,
  http: httpReducer,
  actions,
  actionTypes: actionTypes.default,
}
