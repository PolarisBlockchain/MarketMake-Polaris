import React, {useState, useEffect} from 'react';
import ConfluxSide from './components/Conflux'
import EthereumSide from './components/Ethereum'
import EthereumManagerSide from './components/Ethereum_Manager'
import User from './components/User'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const App = () => {
  
  return(
    <Router>
    <div>
      <Switch>
        <Route path="/manager">
          <h2>Hello manager!</h2>
          <EthereumManagerSide />
        </Route>
        <Route path="/">
          <h2>Hello user!</h2>
          <User />
        </Route>
      </Switch>
    </div>
  </Router>
  )
}

export default App;