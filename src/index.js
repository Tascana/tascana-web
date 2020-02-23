import 'normalize.css'
import 'react-tippy/dist/tippy.css'
import './index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import Firebase, { FirebaseContext } from './components/Firebase'
import store from './redux/store'
import * as serviceWorker from './serviceWorker'

export const firebase = new Firebase()

ReactDOM.render(
  <Provider store={store}>
    <FirebaseContext.Provider value={firebase}>
      <App />
    </FirebaseContext.Provider>
  </Provider>,
  document.getElementById('root'),
)

serviceWorker.unregister()
