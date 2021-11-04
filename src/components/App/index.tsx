import React from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import IndexPage from '../../pages'
import YearPage from '../../pages/year'
import { GuardedRoute } from '../GuardedRoute'
import SignInEndPointFacebook from '../SignInEndpoint/signinFacebook'
import SignInEndPointGoogle from '../SignInEndpoint/signinGoogle'
import { LOGIN_PAGE_PATH, INDEX_PAGE_PATH, YEAR_PAGE_PATH } from '../../constants/route'

function App() {
  return (
    <Router>
      <Switch>
        <Route
          exact
          path={LOGIN_PAGE_PATH}
          render={() => <Redirect to={(window.location.href = '/signin.html')} />}
        />
        <Route exact path="/signInWithFacebook" component={SignInEndPointFacebook} />
        <Route exact path="/signInWithGoogle" component={SignInEndPointGoogle} />
        <GuardedRoute exact path={INDEX_PAGE_PATH} component={IndexPage} />
      </Switch>
    </Router>
  )
}

export default App
