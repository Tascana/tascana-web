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

export const firebase = new Firebase()

ReactDOM.render(
  <Provider store={store}>
    <FirebaseProvider provider={firebase}>
      <AuthProvider provider={firebase}>
        <App />
      </AuthProvider>
    </FirebaseProvider>
  </Provider>,
  document.getElementById('root'),
)

serviceWorker.unregister()
