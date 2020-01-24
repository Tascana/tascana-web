import { configureStore } from '@reduxjs/toolkit'
import session from './session'
import tasks from './tasks'
import UI from './UI'

export default configureStore({
  reducer: {
    tasks: tasks.reducer,
    session: session.reducer,
    UI: UI.reducer,
  },
})
