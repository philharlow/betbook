import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { isSettled, TicketRecord, TicketStatus, useTicketState } from '../store/ticketStore';
import { useToastState } from '../store/toastStore';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import MenuButton from './MenuButton';

const SettingsModalDiv = styled.div`
  position: absolute;
  background-color: var(--black);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 15px;
  gap: 10px;
`;

const TopBar = styled.div`
  background-color: var(--grey);
  font-size: var(--topbar-font-size);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  align-items: center;
`;

const CloseButton = styled(Button)`
  padding: 10px 14px;
`;

const SettingButton = styled(Button)`
  padding: 10px 20px;
  align-self: center;
`;

function SettingsModal() {
  const navigate = useNavigate();
  const settingsModalOpen = useUIState(state => state.settingsModalOpen);
  const setSettingsModalOpen = useUIState(state => state.setSettingsModalOpen);
  const tickets = useTicketState(state => state.tickets);
  const updateTicket = useTicketState(state => state.updateTicket);
  const refreshTickets = useTicketState(state => state.refreshTickets);
  const showToast = useToastState((state) => state.showToast);
  
  const closeModal = () => {
    setSettingsModalOpen(false);
    navigate(-1);
  };

  const onRefreshAll = () => {
    refreshTickets();
  }

  const onRefreshOpen = () => {
    refreshTickets((ticket) => !isSettled(ticket.status));
  }

  const onImport = () => {
    const ticketNumbersStr = prompt("Enter comma-delimited ticket number list");
    if (!ticketNumbersStr) return;
    const ticketNumbers = ticketNumbersStr.split(",").map((tn) => tn.trim());
    const newTicketNumbers = ticketNumbers.filter((tn) => !tickets.find((t) => t.ticketNumber === tn));
    showToast(`Adding ${newTicketNumbers.length} new tickets`);
    newTicketNumbers.forEach((ticketNumber) => {
      const ticket: TicketRecord = {
        ticketNumber,
        sportsbook: "DraftKings",
        status: TicketStatus.Unknown,
        refreshing: true,
      };
      updateTicket(ticket);
    });
  }

  const onExport = () => {
    const ticketNumbers = tickets.map((t) => t.ticketNumber);
    navigator.clipboard.writeText(ticketNumbers.join(", "));
  }
  
  useEffect(() => {
    setSettingsModalOpen(true);
  }, [setSettingsModalOpen]);
  

  if (!settingsModalOpen) return null;
  return (
    <SettingsModalDiv>
      <TopBar>
        <MenuButton />
        Settings
        <CloseButton onClick={closeModal}>X</CloseButton>
      </TopBar>
      <Content>
        Manual refesh
        <SettingButton onClick={onRefreshAll}>Refresh All Tickets</SettingButton>
        <SettingButton onClick={onRefreshOpen}>Refresh Open Tickets</SettingButton>
        <hr />
        Import/Export
        <SettingButton onClick={onImport}>Import ticket numbers</SettingButton>
        <SettingButton onClick={onExport}>Copy all ticket numbers</SettingButton>
      </Content>
    </SettingsModalDiv>
  );
}

export default SettingsModal;
