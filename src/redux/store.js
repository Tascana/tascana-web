import { configureStore } from '@reduxjs/toolkit'
import session from './session'
import tasks from './tasks'
import ui from './ui'

export default configureStore({
  reducer: {
    tasks: tasks.reducer,
    session: session.reducer,
    ui: ui.reducer,
  },
})
