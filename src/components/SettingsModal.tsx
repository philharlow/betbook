import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { fetchUpdatedTicket, isSettled, useTicketState } from '../store/ticketStore';
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

const ArchiveButton = styled(Button)`
  background: var(--blue);
  padding: 10px 20px;
  align-self: center;
`;

const RefreshButton = styled(Button)`
  background: var(--green);
  padding: 10px 20px;
  align-self: center;
`;

function SettingsModal() {
  const navigate = useNavigate();
  const settingsModalOpen = useUIState(state => state.settingsModalOpen);
  const setSettingsModalOpen = useUIState(state => state.setSettingsModalOpen);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const setShowArchivedTickets = useUIState(state => state.setShowArchivedTickets);
  const tickets = useTicketState(state => state.tickets);
  const setTickets = useTicketState(state => state.setTickets);
  
  const closeModal = () => {
    setSettingsModalOpen(false);
    navigate("/");
  };

  const onToggleArchives = () => {
    setShowArchivedTickets(!showArchivedTickets);
    closeModal();
  }

  const onRefreshAll = () => {
    tickets.forEach(fetchUpdatedTicket);
    setTickets([...tickets]);
  }

  const onRefreshOpen = () => {
    tickets.forEach((ticket) => !isSettled(ticket.status) && fetchUpdatedTicket(ticket));
    setTickets([...tickets]);
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
        <RefreshButton onClick={onRefreshAll}>Refresh All Tickets</RefreshButton>
        <RefreshButton onClick={onRefreshOpen}>Refresh Open Tickets</RefreshButton>
        <ArchiveButton onClick={onToggleArchives}>{showArchivedTickets ? "Hide" : "Show"} Archived Tickets</ArchiveButton>
      </Content>
    </SettingsModalDiv>
  );
}

export default SettingsModal;
