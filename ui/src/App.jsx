import React, { useState, useEffect } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import './style.css';
import Add from './Add.jsx';
import graphQLFetch from './graphql.js';

const Homepage = () => {
  return (
    <div>
      <h5>Placeholder for Homepage</h5>
    </div>
  );
};

const MoodTracker = () => {
  const [mood, setMood] = useState([]);
  const [selector, setSelector] = useState(1);

  const setSelectorValue = (value) => {
    setSelector(value);
  };

  const loadData = async () => {
    // Write code for GraphQL API call to fetch list of travellers
    // Write the query
    // Make a call to graphQLFetch with parameter: query
    // Post process data and take some action (e.g., re-load UI)
  };

  useEffect(() => {
    loadData();
  }, []);

  const bookTraveller = async (passenger) => {
    // Write code for GraphQL API call to add a traveller
  };

  const deleteTraveller = async (passenger) => {
    // Write code for GraphQL API call to delete a traveller
  };

  const blacklistTraveller = async (passenger) => {
    // Code to blacklist traveller at the back-end
    console.log("Pending code to Blacklist", passenger);
    const query = `
      mutation mymutation($passenger: String!){
        blacklistTraveller(travellername: $passenger)
      }
    `;
    const response = await graphQLFetch(query, { passenger });
    console.log("Response from server", response);
    // End of Code to blacklist traveller
  };

  return (
    <div>
      <Navbar bg="light" expand="lg" className="flex-column">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="flex-column">
            <Nav.Link onClick={() => setSelectorValue(1)}>Logout</Nav.Link>
            <Nav.Link onClick={() => setSelectorValue(2)}>Mood Log</Nav.Link>
            <Nav.Link onClick={() => setSelectorValue(3)}>Analysis</Nav.Link>
            <Nav.Link onClick={() => setSelectorValue(4)}>Recommend</Nav.Link>
            <Nav.Link onClick={() => setSelectorValue(5)}>Discover</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div>
        {selector === 1 ? <Homepage /> : <hr />}
        {selector === 2 ? <Display travellers={travellers} /> : <hr />}
        {selector === 3 ? <Add bookTraveller={bookTraveller} /> : <hr />}
        {selector === 4 ? <Delete deleteTraveller={deleteTraveller} /> : <hr />}
        {selector === 5 ? <Blacklist blacklistTraveller={blacklistTraveller} /> : <hr />}
      </div>
    </div>
  );
};

const element = <MoodTracker />;

ReactDOM.render(element, document.getElementById('contents'));