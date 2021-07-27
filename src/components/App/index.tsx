import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import IndexPage from '../../pages'
import YearPage from '../../pages/year'
import Landing from '../Landing'

function App() {
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
