import React, { useState } from 'react';
import NavMenu from './NavMenu';

export function Layout(props) {
  const [comparingCompanies, setComparingCompanies] = useState([]);
  return (
    <div>
      <NavMenu comparingCompanies={comparingCompanies}/>
      <div className='layout-container'>
        {props.children}
      </div>
    </div>
  )
}

