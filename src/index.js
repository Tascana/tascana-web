import './index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import Firebase, { FirebaseContext } from './components/Firebase'
import store from './redux/store'
import * as serviceWorker from './serviceWorker'

console.log(store.getState())

ReactDOM.render(
  <Provider store={store}>
    <FirebaseContext.Provider value={new Firebase()}>
      <App />
    </FirebaseContext.Provider>
  </Provider>,
  document.getElementById('root'),
)

serviceWorker.unregister()
