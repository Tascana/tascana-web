import { combineReducers, createStore } from 'redux'
import { tasks, UI, user } from './reducer'

export default createStore(combineReducers({ tasks, UI, user }))
