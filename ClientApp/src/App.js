import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Stock } from './components/Stock';
import { Counter } from './components/Counter';

import './custom.css'
import { StockSimfin } from './components/StockSimfin';

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
        <Route path='/stock' component={Stock} />
        <Route path='/stocksimfin' component={StockSimfin} />
      </Layout>
    );
  }
}
