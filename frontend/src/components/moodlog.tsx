import React, { useState } from 'react';
import bootstrap from 'bootstrap';
import Header from './header';
import Footer from './footer'
import Sidebar from './sidebar';

const MoodLog = () => {


  return (
    <div>
      <Header></Header>
      <div className='container-fluid bg-danger'>
        <Sidebar></Sidebar>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default MoodLog;
