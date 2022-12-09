import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PullToRefresh from 'react-simple-pull-to-refresh';
import styled from 'styled-components/macro';
import { SelectionResult, TimePeriod, useTicketState } from '../store/ticketStore';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import Accordion from './Accordion';
import SelectionTile from './SelectionTile';
import TicketTile from './TicketTile';
import Toggle from './Toggle';

const easeTime = 300;

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
  width: 100%;
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

const RemoveButton = styled(Button)`
  background: var(--red);
  padding: 10px 20px;
  margin-top: 30px;
`;

const RedeemButton = styled(Button)`
  background: var(--green);
  padding: 10px 20px;
`;

const ButtonRow = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
  gap: 15px;
`;

const ArchiveRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 50px;
  max-width: 60%;
  span {
    color: #666;
  }
`;

const ToggleRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 15px;
  align-self: center;
  align-items: center;
`;

const BackButton = styled(Button)`
  padding: 10px 14px;
`;

function ViewTicketModal() {
	const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const navigate = useNavigate();
  const viewingTicket = useUIState(state => state.viewingTicket);
  const setViewingTicket = useUIState(state => state.setViewingTicket);
  const setViewingTicketNumber = useUIState(state => state.setViewingTicketNumber);
  const setViewingBarcode = useUIState(state => state.setViewingBarcode);
  const removeTicket = useTicketState(state => state.removeTicket);
  const archiveTicket = useTicketState(state => state.archiveTicket);
  const refreshTicket = useTicketState(state => state.refreshTicket);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setViewingTicketNumber(ticketNumber);
  }, [ticketNumber, setViewingTicketNumber]);
  
  const closeModal = () => {
    setOpen(false);
    setTimeout(() => {
      navigate("/");
    }, easeTime);
  };
  
  useEffect(() => {
    setOpen(viewingTicket !== undefined);
    // console.log("viewing ticket useeffect", viewingTicket);
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
  };

  if (!viewingTicket) return <ViewTicketDiv />;
  
  const selections = viewingTicket.ticketResult?.Selections || [];
  const isPending = viewingTicket.ticketResult === undefined;
  const pastSelections = selections.filter((selection) => selection.calculated.TimePeriod === TimePeriod.Past);
  const currentSelections = selections.filter((selection) => selection.calculated.TimePeriod === TimePeriod.Current);
  const futureSelections = selections.filter((selection) => selection.calculated.TimePeriod === TimePeriod.Future);
  
  const firstSelection = selections[0];
  const title = selections.length > 1 ? `${selections.length} Pick Parlay` : firstSelection?.EventName ?? "Loading...";
  const odds = viewingTicket.ticketResult?.TotalOdds;
  const className = viewingTicket.refreshing ? "scrolling-gradient" : "";
  const getSelectionDisplay = (selection: SelectionResult, i: number) => <SelectionTile selection={selection} key={i} className={className}/>


  const handleRefresh = async () => {
    console.log("refreshed");
    refreshTicket(viewingTicket);
  };

  return (
    <ViewTicketDiv className={open ? "open" : ""}>
      <TopBar>
        <BackButton onClick={closeModal}>&lt;</BackButton>
        Ticket number {viewingTicket.ticketNumber}
        <span />
      </TopBar>
      <PullToRefresh onRefresh={handleRefresh}>
        <Content>
          <TicketTile ticket={viewingTicket} hideArrow={true} />

          <Title className={className}>{title} {odds}</Title>
          
          {/* Past */}
          <Accordion
            className={className}
            dontDrawEmpty={true}
            label={`Past (${pastSelections.length})`}>
              {pastSelections.map(getSelectionDisplay)}
          </Accordion>

          {/* Current */}
          <Accordion
            dontDrawEmpty={true}
            label={`Current (${currentSelections.length})`}>
              {currentSelections.map(getSelectionDisplay)}
          </Accordion>

          {/* Future */}
          <Accordion
            dontDrawEmpty={true}
            label={`Future (${futureSelections.length})`}>
              {futureSelections.map(getSelectionDisplay)}
          </Accordion>

          {isPending && 'Loading...'}
          
          <ArchiveRow>
            <ToggleRow>
              <div onClick={onArchiveTicket}>Archive Ticket</div>
              <Toggle checked={viewingTicket.archived ?? false} onChecked={onArchiveTicket} />
            </ToggleRow>
            <span>Archiving tickets will remove them from the main screen but keep them for stats.</span>
          </ArchiveRow>
          <ButtonRow>
            <RedeemButton onClick={redeemTicket}>View Barcode</RedeemButton>
          </ButtonRow>
          <RemoveButton onClick={deleteTicket}>Delete Ticket</RemoveButton>
        </Content>
      </PullToRefresh>
    </ViewTicketDiv>
  );
}

export default ViewTicketModal;
