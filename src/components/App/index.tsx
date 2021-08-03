import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import IndexPage from '../../pages'
import YearPage from '../../pages/year'
import Landing from '../Landing'
import { GuardedRoute } from '../GuardedRoute'
import { LOGIN_PAGE_PATH, INDEX_PAGE_PATH, YEAR_PAGE_PATH } from '../../constants/route'

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path={LOGIN_PAGE_PATH} component={Landing} />
        <GuardedRoute exact path={INDEX_PAGE_PATH} component={IndexPage} />
        <GuardedRoute path={YEAR_PAGE_PATH} component={YearPage} />
      </Switch>
    </Router>
  )
}

export default App
