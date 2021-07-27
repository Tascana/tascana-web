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
import { Firebase } from './services/firebase'
import { FirebaseAuthService } from './services/auth'

export const firebase = new Firebase()
const authService = new FirebaseAuthService(firebase)

ReactDOM.render(
  <Provider store={store}>
    <FirebaseProvider provider={firebase}>
      <AuthProvider provider={authService}>
        <App />
      </AuthProvider>
    </FirebaseProvider>
  </Provider>,
  document.getElementById('root'),
)

serviceWorker.unregister()
