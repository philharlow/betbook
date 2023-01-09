import React from 'react';
import styled from 'styled-components/macro';
import AddTicketModal from './components/AddTicketModal';
import StatsModal from './components/StatsModal';
import MainTicketTable from './components/MainTicketTable';
import Toast from './components/Toast';
import VersionDisplay from './components/VersionDisplay';
import ViewTicketModal from './components/ViewTicketModal';
import { GlobalStyles } from './styles/GlobalStyles';
import { HashRouter, Route, Routes } from 'react-router-dom';
import BarcodePopup from './components/BarcodePopup';
import MenuPopup from './components/MenuPopup';
import SettingsModal from './components/SettingsModal';
import ManuallyAddTicketModal from './components/ManuallyAddTicketModal';
import SearchTicketTable from './components/SearchTicketTable';

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
      <HashRouter>
        <GlobalStyles />
          <Routes>
            <Route path='/settings' element={<SettingsModal />} />
            <Route path='/stats' element={<StatsModal />} />
            <Route path='/:ticketNumber' element={<ViewTicketModal />} />
            <Route path='/search' element={<SearchTicketTable />} />
            <Route path="*" element={<></>} />
          </Routes>
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
