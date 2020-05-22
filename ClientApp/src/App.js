import React, {useState} from 'react';
import { Route } from 'react-router';
import { Home } from './components/Home';
import { YahooFinance } from './components/Stock';
import { Counter } from './components/Counter';
import NavMenu from './components/NavMenu'

import './custom.css'
import Company from './components/company/Company';
import { SearchList } from './components/SearchList';
import { Comparing } from './components/Comparing';

export default function App() {

  const [comparingCompanies, setComparingCompanies] = useState([]);

  const addComparingCompany = (company) => {
    setComparingCompanies([...comparingCompanies, company]);
  }

  return (
    <div>
      <NavMenu comparingCompanies={comparingCompanies} />
      <div className='layout-container'>
        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
        <Route path='/yahoo' component={YahooFinance} />
        <Route path='/stock' render={props => <Company addComparingCompany={addComparingCompany} {...props}/>} />
        <Route path='/search' component={SearchList} />
        <Route path='/comparing' render={props => <Comparing comparingCompanies={comparingCompanies} {...props}/>}/>
      </div>
    </div>
  );
}
