import React, { useEffect, useState } from 'react';
import Homepage from './HomePage';
import { defaultClient } from '../Client';

const TicketToRide = () => {
  const [travellers, setTravellers] = useState([]);
  const [selector, setSelector] = useState(1);

  const loadData = async () => {
    const res = await defaultClient.query<DummyAPI>({
      query: dummyAPIQuery
    })
    
    console.log('Loading data');
    // to query from db
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1>Ticket To Ride</h1>
      <div>
        <button onClick={setSelector.bind(null, 1)}>Homepage</button>
        <button onClick={setSelector.bind(null, 1)}>Display Travellers</button>
        <button onClick={setSelector.bind(null, 3)}>Add Traveller</button>
        <button onClick={setSelector.bind(null, 4)}>Delete Traveller</button>
        <button onClick={setSelector.bind(null, 5)}>Blacklist Traveller</button>
      </div>
      {selector === 1 ? <Homepage /> : <hr />}
      {/*{this.state.selector === 2 ? <Display travellers={this.state.travellers} /> : <hr />}
      {this.state.selector === 3 ? <Add bookTraveller={this.bookTraveller} /> : <hr />}
      {this.state.selector === 4 ? <Delete deleteTraveller={this.deleteTraveller} /> : <hr />}
      {this.state.selector === 5 ? <Blacklist blacklistTraveller={this.blacklistTraveller} /> : <hr />}*/}
    </div>
  );
};

export default TicketToRide;
