import React, { useEffect, useState } from 'react';
import Homepage from './homepage';
import { defaultClient } from '../Client';
import { dummyAPIQuery } from '../graphql/queries/User';
// import { DummyAPI } from '../graphql/queries/__generated__/dummyAPI';

const TicketToRide = () => {
  //const [travellers, setTravellers] = useState([]);
  const [selector, setSelector] = useState(1);

  const loadData = async () => {
    console.log('Loading data');
    try {
      // const res = await defaultClient.query<DummyAPI>({
      //   query: dummyAPIQuery,
      //   fetchPolicy: 'network-only',
      // });
      // console.log(res);
    } catch (e) {
      console.error(e);
    }

    return [];
  };

  return (
    <div>
      <h1>Ticket To Ride</h1>
      <div>
        {/*{travellers}*/}
        <button onClick={setSelector.bind(null, 1)}>Homepage</button>
        <button onClick={setSelector.bind(null, 1)}>Display Travellers</button>
        <button onClick={setSelector.bind(null, 3)}>Add Traveller</button>
        <button onClick={setSelector.bind(null, 4)}>Delete Traveller</button>
        <button onClick={setSelector.bind(null, 5)}>Blacklist Traveller</button>
      </div>
      {/* {selector === 1 ? <Homepage /> : <hr />} */}
      {/*{this.state.selector === 2 ? <Display travellers={this.state.travellers} /> : <hr />}
      {this.state.selector === 3 ? <Add bookTraveller={this.bookTraveller} /> : <hr />}
      {this.state.selector === 4 ? <Delete deleteTraveller={this.deleteTraveller} /> : <hr />}
      {this.state.selector === 5 ? <Blacklist blacklistTraveller={this.blacklistTraveller} /> : <hr />}*/}
    </div>
  );
};

export default TicketToRide;
