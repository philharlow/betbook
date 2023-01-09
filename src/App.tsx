import React from 'react';
import styled from 'styled-components/macro';
import AddTicketModal from './components/AddTicketModal';
import StatsModal from './components/StatsModal';
import MainTicketTable from './components/MainTicketTable';
import Toast from './components/Toast';
import VersionDisplay from './components/VersionDisplay';
import ViewTicketModal from './components/ViewTicketModal';
import { GlobalStyles } from './styles/GlobalStyles';
import { HashRouter } from 'react-router-dom';
import BarcodePopup from './components/BarcodePopup';
import MenuPopup from './components/MenuPopup';
import SettingsModal from './components/SettingsModal';
import ManuallyAddTicketModal from './components/ManuallyAddTicketModal';
import SearchTicketModal from './components/SearchTicketModal';
import Router from './Router';

const AppDiv = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const App = () => {
  return (
    <AppDiv>
      <HashRouter>
        <Router />
        <ViewTicketModal />
        <GlobalStyles />
        <SettingsModal />
        <StatsModal />
        <SearchTicketModal />
        <MainTicketTable />
        <AddTicketModal />
        <ManuallyAddTicketModal />
        <MenuPopup />
        <BarcodePopup />
        <Toast />
        <VersionDisplay />
      </HashRouter>
    </AppDiv>
  );
}

export default App;
