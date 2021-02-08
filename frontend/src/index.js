/*!

=========================================================
* BLK Design System React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/blk-design-system-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/blk-design-system-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "assets/css/nucleo-icons.css";
import "assets/scss/blk-design-system-react.scss?v=1.1.0";
import "assets/demo/demo.css";

import Index from "views/Index.js";
import LandingPage from "views/examples/LandingPage.js";
import RegisterPageAave from "views/examples/RegisterPageAave.js";
import RegisterPageConflux from "views/examples/RegisterPageConflux.js";
import RegisterPageMatic from "views/examples/RegisterPageMatic.js";
import ProfilePage from "views/examples/ProfilePage.js";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/home" render={props => <Index {...props} />} />
      <Route
        path="/documentation"
        render={props => <LandingPage {...props} />}
      />
      <Route
        path="/app/matic"
        render={props => <RegisterPageMatic {...props} />}
      />
      <Route
        path="/app/aave"
        render={props => <RegisterPageAave {...props} />}
      />
      <Route
        path="/app/conflux"
        render={props => <RegisterPageConflux {...props} />}
      />
      <Route
        path="/about-us"
        render={props => <ProfilePage {...props} />}
      />
      <Redirect from="/" to="/home" />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
