import React from 'react';
import styled from 'styled-components';
import { useTicketState } from '../store/ticketStore';
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
  margin-top: 50px;
  padding: 10px 20px;
`;

const CloseButton = styled(Button)``;

function ViewTicketModal() {
  const viewingTicket = useUIState(state => state.viewingTicket);
  const setViewingTicket = useUIState(state => state.setViewingTicket);
  const removeTicket = useTicketState(state => state.removeTicket);
  
  const closeModal = () => {
    setViewingTicket(undefined);
  };
  
  const deleteTicket = () => {
    if (!viewingTicket) return;
    if (!window.confirm(`Are you sure you want to delete ticket ${viewingTicket.ticketNumber}?`)) return;
    removeTicket(viewingTicket.ticketNumber);
    setViewingTicket(undefined);
  };

  if (!viewingTicket) return null;

  const selections = viewingTicket.ticketResult?.Selections ?? [];
  const firstSelection = selections[0];
  const title = selections.length > 1 ? `${selections.length} Pick Parlay` : firstSelection.EventName;
  const odds = viewingTicket.ticketResult?.TotalOdds;

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
            <SelectionDisplay selection={selection} />
          )) ?? 'Loading...'}
        </Selections>

        <RemoveButton onClick={deleteTicket}>Remove</RemoveButton>
      </Content>
    </ViewTicketDiv>
  );
}

export default ViewTicketModal;
