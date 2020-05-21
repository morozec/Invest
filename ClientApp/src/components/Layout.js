import React from 'react';
import NavMenu from './NavMenu';

export function Layout(props) {

  return (
    <div>
      <NavMenu/>
      <div className='layout-container'>
        {props.children}
      </div>
    </div>
  )
}

