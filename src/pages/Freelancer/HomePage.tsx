import React from 'react';
import NavBar1 from '../../components/HomeNavBar.Freelancer';

const HomePage: React.FC = () => {
    return (
      <div>
        <NavBar1 />
        <div className="container mx-auto">
          <h1>Welcome to the Freelancer Home Page</h1>
          <p>This is a dummy page for freelancers.</p>
        </div>
      </div>
    );
};

export default HomePage;