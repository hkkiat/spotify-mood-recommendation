import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Some inspirational quote...</h5>
            <p>"Your mood does not define your worth, but your resilience in navigating through it certainly does."</p>
          </div>
          <div className="col-md-6">
            <h5>Contact Us</h5>
            <address>
              Email: contact@example.com<br />
              Phone: +123456789
            </address>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <p className="text-center">© 2024 Mood Tracker. All rights reserved.</p>
          </div>
        </div>
      </div>  
    </footer>
  );
}

export default Footer;
