import React from 'react';
import Layout from '../common/layout';
import OverallQuestion from './overallfeeling';
import HappyRange from './happyrange';
import MostImpact from './mostimpact';

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
      <OverallQuestion></OverallQuestion>
      <HappyRange></HappyRange>
      <MostImpact></MostImpact>
    </Layout>
  );
}

export default MoodLog;
