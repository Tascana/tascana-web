import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import IndexPage from '../../pages/index'
import YearPage from '../../pages/year'
import Landing from '../Landing'
import useAuthentication from '../../hooks/use-authentication'

function App() {
  useAuthentication()

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={IndexPage} />
        <Route exact path="/signin" component={Landing} />
        <Route path="/:year" component={YearPage} />
      </Switch>
    </Router>
  )
}

export default App
