import 'normalize.css'
import 'react-datepicker/dist/react-datepicker.css'
import './index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import store from './redux/store'
import * as serviceWorker from './serviceWorker'
import { AuthProvider } from './context/auth'
import { FirebaseProvider } from './context/firebase'
import { LoggerProvider } from './context/logger'
import { Firebase } from './services/firebase'
import { FirebaseAuthService } from './services/auth'
import { FirebaseLoggerService } from './services/logger'

export const firebase = new Firebase()
const authService = new FirebaseAuthService(firebase)
const loggerService = new FirebaseLoggerService(firebase)

ReactDOM.render(
  <Provider store={store}>
    <FirebaseProvider provider={firebase}>
      <AuthProvider provider={authService}>
        <LoggerProvider provider={loggerService}>
          <App />
        </LoggerProvider>
      </AuthProvider>
    </FirebaseProvider>
  </Provider>,
  document.getElementById('root'),
)

serviceWorker.unregister()
