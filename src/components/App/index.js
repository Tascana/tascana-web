import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import IndexPage from '../../pages/index'
import SignInPage from '../../pages/sign-in'
import YearPage from '../../pages/year'

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={IndexPage} />
        <Route path="/signin" component={SignInPage} />
        <Route path="/:year" component={YearPage} />
      </Switch>
    </Router>
  )
}

export default App
