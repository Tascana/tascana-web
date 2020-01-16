import { createSlice } from '@reduxjs/toolkit'
import omit from 'lodash/omit'

const INITIAL_STATE = {}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: INITIAL_STATE,
  reducers: {
    setTasks: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    createTask: (state, action) => ({
      ...state,
      [action.payload.id]: action.payload.task,
    }),
    editTask: (state, action) => ({
      ...state,
      [action.payload.id]: {
        ...state[action.payload.id],
        ...action.payload.task,
      },
    }),
    deleteTask: (state, action) => omit(state, action.payload),
  },
})

export default tasksSlice
