import React from "react";
import styled from "styled-components/macro";
import ScanTicketModal from "./components/modals/ScanTicketModal";
import StatsView from "./components/views/StatsView";
import MainTicketsView from "./components/views/MainTicketsView";
import Toast from "./components/Toast";
import TicketDetailsView from "./components/views/TicketDetailsView";
import { GlobalStyles } from "./styles/GlobalStyles";
import { HashRouter, Route, Routes } from "react-router-dom";
import BarcodePopup from "./components/BarcodePopup";
import SettingsView from "./components/views/SettingsView";
import ManuallyAddTicketModal from "./components/modals/ManuallyAddTicketModal";
import MenuBar from "./components/MenuBar";
import TopBar from "./components/TopBar";

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

  display: flex;
  flex-direction: column;
`;

const App = () => {
  return (
    <AppDiv>
      <GlobalStyles />

      <HashRouter>
        <TopBar />
        <ScrollPane>
          <Routes>
            <Route index element={<MainTicketsView />} />
            <Route path="/:ticketNumber" element={<TicketDetailsView />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </ScrollPane>

        <ScanTicketModal />
        <ManuallyAddTicketModal />
        <BarcodePopup />
        <Toast />
        <MenuBar />
      </HashRouter>
    </AppDiv>
  );
};

export default App;
