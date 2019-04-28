import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import { Switch, Route, Router } from 'react-router-dom';
import { configureHistory } from '../func/configureHistory.js';

import { connect } from 'react-redux';

import { IntlProvider } from 'react-intl';

import { translations } from '../translations/translations';

import moment from 'moment';
// import UnknownPage from './utils/UnknownPage';

import Home from './Home/Home';

import './App.css';
import Dashboard from './Dashboard/Dashboard';
import AuthCallback from './AuthCallback/AuthCallback';
import Blog from './Blog/Blog';
import Billing from './Billing/Billing';

const history = configureHistory();

require('moment/locale/fr');

class App extends Component {

  componentDidMount(){
    
    if ( !window.location.href.includes("localhost") && !window.location.href.includes("192.168")  && window.location.protocol !== "https:"){
      window.location.href = window.location.href.replace('http', 'https')
    }
  }

  render() {

    let language = this.props.app.language;

    return (
      <IntlProvider locale={language} messages={translations[language]}>
      <div className="App">

          <Helmet
            script={[{
              'src': 'https://use.fontawesome.com/releases/v5.1.0/js/all.js'
            }
          ]}>
            <meta charSet="utf-8"/>
            <title>Foxtagram</title>
            <link rel="canonical" href="/"/>
          </Helmet>

          <Router history={history}>
            <Switch>
              <Route exact path='/' component={Home}/>
              <Route exact path='/callback' component={AuthCallback}/>

              <Route exact path='/dashboard' component={Dashboard}/>

              <Route exact path='/billing' component={Billing}/>

            </Switch>
          </Router>
          
      </div>
        </IntlProvider>
    );
  }
}

export default connect( state => state )( App );
