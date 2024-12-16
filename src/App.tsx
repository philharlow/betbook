import React from 'react';
import styled from 'styled-components/macro';
import AddTicketModal from './components/AddTicketModal';
import StatsModal from './components/StatsModal';
import MainTicketTable from './components/MainTicketTable';
import Toast from './components/Toast';
import ViewTicketModal from './components/ViewTicketModal';
import { GlobalStyles } from './styles/GlobalStyles';
import { HashRouter, Route, Routes } from 'react-router-dom';
import BarcodePopup from './components/BarcodePopup';
import SettingsModal from './components/SettingsModal';
import ManuallyAddTicketModal from './components/ManuallyAddTicketModal';
import MenuBar from './components/MenuBar';
import TopBar from './components/TopBar';

const AppDiv = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  text-align: center;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ScrollPane = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const App = () => {
  return (
    <AppDiv>
      <GlobalStyles />

      <HashRouter>
        <TopBar />
        <ScrollPane>
          <Routes>
            <Route index element={<MainTicketTable />} />
            <Route path="/stats" element={<StatsModal />} />
            <Route path="/settings" element={<SettingsModal />} />
            <Route path="/:ticketNumber" element={<ViewTicketModal />} />
          </Routes>
        </ScrollPane>
        
        <AddTicketModal />
        <ManuallyAddTicketModal />
        <BarcodePopup />
        <Toast />
        <MenuBar />
      </HashRouter>
    </AppDiv>
  );
}

export default App;
