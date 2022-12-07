import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components/macro';
import { isSettled, useTicketState } from '../store/ticketStore';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import SelectionDisplay from './SelectionDisplay';
import TicketDisplay from './TicketDisplay';

const easeTime = 500;

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
  left: 100%;
  transition: left ${easeTime}ms ease;
  &.open {
    left: 0%;
  }
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
  padding: 10px 15px;
  align-items: center;
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

const RedeemButton = styled(Button)`
  background: var(--green);
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

const BackButton = styled(Button)`
  padding: 10px 14px;
`;

function ViewTicketModal() {
	const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const navigate = useNavigate();
  const viewingTicket = useUIState(state => state.viewingTicket);
  const setViewingTicket = useUIState(state => state.setViewingTicket);
  const setViewingBarcode = useUIState(state => state.setViewingBarcode);
  const tickets = useTicketState(state => state.tickets);
  const removeTicket = useTicketState(state => state.removeTicket);
  const archiveTicket = useTicketState(state => state.archiveTicket);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ticketNumber && viewingTicket?.ticketNumber !== ticketNumber) {
      const ticket = tickets.find((t) => t.ticketNumber === ticketNumber);
      console.log("setting ticket" , { ticketNumber, ticket });
      setViewingTicket(ticket);
    }
  }, [ticketNumber, viewingTicket, setViewingTicket, tickets]);
  
  const closeModal = () => {
    setOpen(false);
    setTimeout(() => {
      navigate("/");
    }, easeTime);
  };
  
  useEffect(() => {
    setOpen(viewingTicket !== undefined);
    console.log("viewing ticket useeffect", viewingTicket);
  }, [viewingTicket]);
  
  const deleteTicket = () => {
    if (!viewingTicket) return;
    if (!window.confirm(`Are you sure you want to delete ticket ${viewingTicket.ticketNumber}?`)) return;
    removeTicket(viewingTicket.ticketNumber);
    setViewingTicket(undefined);
  };
  
  const redeemTicket = () => {
    if (!viewingTicket) return;
    setViewingBarcode(viewingTicket.ticketNumber);
  };
  
  const onArchiveTicket = () => {
    if (!viewingTicket) return;
    archiveTicket(viewingTicket.ticketNumber, !viewingTicket.archived);
    setViewingTicket(undefined);
  };

  if (!viewingTicket) return <ViewTicketDiv />;

  const selections = viewingTicket.ticketResult?.Selections ?? [];
  const firstSelection = selections[0];
  const title = selections.length > 1 ? `${selections.length} Pick Parlay` : firstSelection?.EventName ?? "Loading...";
  const odds = viewingTicket.ticketResult?.TotalOdds;
  const archivable = isSettled(viewingTicket.status);
  const archiveLabel = viewingTicket.archived ? "Unarchive" : "Archive";

  return (
    <ViewTicketDiv className={open ? "open" : ""}>
      <TopBar>
        <BackButton onClick={closeModal}>&lt;</BackButton>
        Ticket number {viewingTicket.ticketNumber}
        <span />
      </TopBar>
      <Content>
        <TicketDisplay ticket={viewingTicket} hideArrow={true} />

        <Title>{title} {odds}</Title>
        <Selections>
          {viewingTicket.ticketResult?.Selections.map((selection, i) => (
            <SelectionDisplay key={i} selection={selection} />
          )) ?? 'Loading...'}
        </Selections>
      
      <ButtonRow>
        <RemoveButton onClick={deleteTicket}>Remove Ticket</RemoveButton>
        {archivable && <ArchiveButton onClick={onArchiveTicket}>{archiveLabel} Ticket</ArchiveButton>}
        <RedeemButton onClick={redeemTicket}>Redeem Ticket</RedeemButton>
      </ButtonRow>
      {archivable && <FooterRow>
        Archiving tickets will remove them from the main screen but keep them for stats.
      </FooterRow>}
      </Content>
    </ViewTicketDiv>
  );
}

export default ViewTicketModal;
