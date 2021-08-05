import 'normalize.css'
import 'react-datepicker/dist/react-datepicker.css'
import './index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as StoreProvider } from 'react-redux'
import App from './components/App'
import store from './redux/store'
import * as serviceWorker from './serviceWorker'
import { AuthProvider } from './context/auth'
import { FirebaseProvider } from './context/firebase'
import { LoggerProvider } from './context/logger'
import { DeviceProvider } from './context/device'
import { Firebase } from './services/firebase'
import { FirebaseAuthService } from './services/auth'
import { FirebaseLoggerService } from './services/logger'
import { DeviceService } from './services/device'

export const firebase = new Firebase()
const authService = new FirebaseAuthService(firebase)
const loggerService = new FirebaseLoggerService(firebase)
const deviceService = new DeviceService()

ReactDOM.render(
  <DeviceProvider provider={deviceService}>
    <StoreProvider store={store}>
      <FirebaseProvider provider={firebase}>
        <AuthProvider provider={authService}>
          <LoggerProvider provider={loggerService}>
            <App />
          </LoggerProvider>
        </AuthProvider>
      </FirebaseProvider>
    </StoreProvider>
  </DeviceProvider>,
  document.getElementById('root'),
)

serviceWorker.unregister()
