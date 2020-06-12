import React, { useState, useEffect } from 'react';
import { Route } from 'react-router';
import { Home } from './components/Home';
import { YahooFinance } from './components/Stock';
import { Counter } from './components/Counter';
import NavMenu from './components/NavMenu'

import './custom.css'
import Company from './components/company/Company';
import SearchList from './components/SearchList';
import { Comparing } from './components/Comparing';
import Login from './components/Login';
import { WatchList } from './components/WatchList';
import { PortfoliosList } from './components/PortfoliosList';
import { Portfolio } from './components/Portfolio';

export default function App() {

  const [companies, setCompanies] = useState([]);
  const [comparingCompanies, setComparingCompanies] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetch(`api/account/loadCompanies`)
      .then(response => response.json())
      .then(companies => setCompanies(companies));
  }, [])


  const addComparingCompany = (company) => {
    setComparingCompanies([...comparingCompanies, company]);
  }

  const removeComparingCompany = (companySymbol) => {
    setComparingCompanies(comparingCompanies.filter(c => c.profile.quoteType.symbol !== companySymbol))
  }

  return (
    <div>
      <NavMenu comparingCompanies={comparingCompanies} userData={userData} setUserData={setUserData} companies={companies} />
      <div className='layout-container'>
        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
        <Route path='/yahoo' render={props => <YahooFinance userData={userData} {...props} />} />
        <Route path='/stock' render={props =>
          <Company
            comparingCompanies={comparingCompanies}
            addComparingCompany={addComparingCompany}
            removeComparingCompany={removeComparingCompany}
            userData={userData} 
            {...props} />} />
        <Route path='/search' component={SearchList} />
        <Route path='/comparing' render={props =>
          <Comparing comparingCompanies={comparingCompanies} removeComparingCompany={removeComparingCompany} {...props} />} />
        <Route path='/login' render={props => <Login userData={userData} setUserData={setUserData} {...props} />} />
        <Route path='/watchList' render={props => <WatchList userData={userData} {...props} />} />
        <Route path='/portfolios' render={props => <PortfoliosList userData={userData} {...props} />} />
        <Route path='/portfolio/:portfolioId' render={props => <Portfolio userData={userData} companies={companies} {...props} />} />
      </div>
    </div>
  );
}
