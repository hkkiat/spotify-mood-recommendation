import React from 'react';
import Layout from '../common/layout';
import OverallFeeling from './overallfeeling';
import HappyRange from './happyrange';
import MostImpact from './mostimpact';
import Calendar from './calendar';

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
      <Calendar></Calendar>
      <OverallFeeling></OverallFeeling>
      <HappyRange></HappyRange>
      <MostImpact></MostImpact>
    </Layout>
  );
}

export default MoodLog;
