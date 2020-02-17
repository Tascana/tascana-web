import { configureStore } from '@reduxjs/toolkit'
import session from './session'
import { tasksSlice } from './tasks'
import UI from './UI'

export default configureStore({
  reducer: {
    tasks: tasksSlice.reducer,
    session: session.reducer,
    UI: UI.reducer,
  },
})
