import { combineReducers, createStore } from 'redux'
import { tasks, UI } from './reducer'

export default createStore(combineReducers({ tasks, UI }))
