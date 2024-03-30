import React from 'react';
import Layout from '../common/layout';

/*
This component is used to display the moodlog page
*/

interface MoodLogProps {
  setCurrentPage: (page: string) => void;
  currentPage: string;
}

const MoodLog: React.FC<MoodLogProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      BOILER PLATE CONTENT GOES HERE
    </Layout>
  );
}

export default MoodLog;
