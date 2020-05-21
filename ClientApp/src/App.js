import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { YahooFinance } from './components/Stock';
import { Counter } from './components/Counter';

import './custom.css'
import Company from './components/company/Company';
import { SearchList } from './components/SearchList';

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
        <Route path='/yahoo' component={YahooFinance} />
        <Route path='/stock' component={Company} />
        <Route path='/search' component={SearchList} />
      </Layout>
    );
  }
}
