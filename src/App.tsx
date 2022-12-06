import React from 'react';
import styled from 'styled-components';
import AddTicketModal from './components/AddTicketModal';
import FilterBar from './components/FilterBar';
import StatsModal from './components/StatsModal';
import TicketTable from './components/TicketTable';
import Toast from './components/Toast';
import TopBar from './components/TopBar';
import VersionDisplay from './components/VersionDisplay';
import ViewTicketModal from './components/ViewTicketModal';
import { GlobalStyles } from './styles/GlobalStyles';

const AppDiv = styled.div`
  height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const App = () => {
  return (
    <AppDiv>
      <GlobalStyles />
      <TopBar />
      <FilterBar />
      <TicketTable />
      <StatsModal />
      <ViewTicketModal />
      <AddTicketModal />
      <Toast />
      <VersionDisplay />
    </AppDiv>
  );
}

export default App;
