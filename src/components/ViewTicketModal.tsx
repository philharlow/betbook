import React from 'react';
import styled from 'styled-components';
import { TicketStatus, useTicketState } from '../store/ticketStore';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import SelectionDisplay from './SelectionDisplay';
import TicketTableRow from './TicketDisplay';

const ViewTicketDiv = styled.div`
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
  align-items: center;
  gap: 10px;
  padding: 15px;
  overflow-y: auto;
`;

const TopBar = styled.div`
  background-color: var(--grey);
  font-size: var(--topbar-font-size);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px 15px;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const Selections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
`;

const RemoveButton = styled(Button)`
  background: var(--red);
  padding: 10px 20px;
`;

const ArchiveButton = styled(Button)`
  background: var(--blue);
  padding: 10px 20px;
`;

const ButtonRow = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
`;

const FooterRow = styled.div`
  margin-bottom: 50px;
  color: #666;
  max-width: 75%;
`;

const CloseButton = styled(Button)``;

function ViewTicketModal() {
  const viewingTicket = useUIState(state => state.viewingTicket);
  const setViewingTicket = useUIState(state => state.setViewingTicket);
  const removeTicket = useTicketState(state => state.removeTicket);
  const archiveTicket = useTicketState(state => state.archiveTicket);
  
  const closeModal = () => {
    setViewingTicket(undefined);
  };
  
  const deleteTicket = () => {
    if (!viewingTicket) return;
    if (!window.confirm(`Are you sure you want to delete ticket ${viewingTicket.ticketNumber}?`)) return;
    removeTicket(viewingTicket.ticketNumber);
    setViewingTicket(undefined);
  };
  
  const onArchiveTicket = () => {
    if (!viewingTicket) return;
    if (!window.confirm(`Are you sure you want to ${archiveLabel} ticket ${viewingTicket.ticketNumber}?`)) return;
    archiveTicket(viewingTicket.ticketNumber, !viewingTicket.archived);
    setViewingTicket(undefined);
  };

  if (!viewingTicket) return null;

  const selections = viewingTicket.ticketResult?.Selections ?? [];
  const firstSelection = selections[0];
  const title = selections.length > 1 ? `${selections.length} Pick Parlay` : firstSelection?.EventName ?? "Loading...";
  const odds = viewingTicket.ticketResult?.TotalOdds;
  const archivable = viewingTicket.status === TicketStatus.Lost || viewingTicket.status === TicketStatus.Won;
  const archiveLabel = viewingTicket.archived ? "Unarchive" : "Archive";

  return (
    <ViewTicketDiv>
      <TopBar>
        Ticket number {viewingTicket.ticketNumber}
        <CloseButton onClick={closeModal}>X</CloseButton>
      </TopBar>
      <Content>
        <TicketTableRow ticket={viewingTicket} />

        <Title>{title} {odds}</Title>
        <Selections>
          {viewingTicket.ticketResult?.Selections.map((selection, i) => (
            <SelectionDisplay key={i} selection={selection} />
          )) ?? 'Loading...'}
        </Selections>
      
      <ButtonRow>
        <RemoveButton onClick={deleteTicket}>Remove Ticket</RemoveButton>
        {archivable && <ArchiveButton onClick={onArchiveTicket}>{archiveLabel} Ticket</ArchiveButton>}
      </ButtonRow>
      {archivable && <FooterRow>
        Archiving tickets will remove them from the main screen but keep them for stats.
      </FooterRow>}
      </Content>
    </ViewTicketDiv>
  );
}

export default ViewTicketModal;
