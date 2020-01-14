import { createSlice } from '@reduxjs/toolkit'

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
  },
})

export default tasksSlice
