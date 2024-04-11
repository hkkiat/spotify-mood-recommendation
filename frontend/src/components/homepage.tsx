import React, { FC } from 'react';
import Layout from './common/layout';

interface HomepageProps {
  email: string;
  currentPage: string;
}

const HomePage: FC<HomepageProps> = ({ email, currentPage }) => {
  return (
    <Layout currentPage={currentPage}>
      <div>Hello world! this is a react functional component</div>
    </Layout>
  );
};

export default HomePage;
