import React, { useEffect } from 'react';
import styled from 'styled-components/macro';
import {  isSettled, TicketRecord, TicketStatus, TimePeriod, useTicketState } from '../store/ticketStore';
import { FilterLevel, useUIState } from '../store/uiStore';
import Accordion from './Accordion';
import TicketTile from './TicketTile';
import PullToRefresh from 'react-simple-pull-to-refresh';

const TableDiv = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  overflow-y: auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
  margin-bottom: 70px; // Hack for iphones not scrolling to bottomw
`;

const AddTicketsMessage = styled.div`
  font-size: 16px;
  display: flex;
  flex: 1;
  flex-direction: column;
  color: #999;
  justify-content: center;
`;

const Disclaimer = styled.div`
  font-size: 14px;
  color: #666;
  justify-content: end;
  a {
    text-decoration: underline;
  }
`;

const shouldDisplay = (ticket: TicketRecord, filter: FilterLevel, showArchivedTickets: boolean) => {
  if (ticket.archived && !showArchivedTickets) return false;
  if (filter === FilterLevel.Open) return ticket.status === TicketStatus.Opened;
  if (filter === FilterLevel.Won) return ticket.status === TicketStatus.Won;
  if (filter === FilterLevel.Lost) return ticket.status === TicketStatus.Lost;
  if (filter === FilterLevel.Settled) return ticket.status === TicketStatus.Lost || ticket.status === TicketStatus.Won || ticket.status === TicketStatus.Draw;
  return true;
}

function TicketTable() {
  const tickets = useTicketState(state => state.tickets);
  const refreshTickets = useTicketState(state => state.refreshTickets);
  const filterLevel = useUIState(state => state.filterLevel);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);

  const filteredTickets = tickets.filter((ticket) => shouldDisplay(ticket, filterLevel, showArchivedTickets));
  const pendingTickets = filteredTickets.filter((ticket) => ticket.ticketResult === undefined);
  const pastTickets = filteredTickets.filter((ticket) => ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Past);
  const currentTickets = filteredTickets.filter((ticket) => ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Current);
  const futureTickets = filteredTickets.filter((ticket) => ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Future).reverse();
  const hasTickets = filteredTickets.length > 0;

  // Scroll to current
  useEffect(() => {
    const current = document.querySelector(".current");
    current?.scrollIntoView( { behavior: 'smooth', block: 'start' } );
  }, []);

  // TODO remove hard coded time periods

  const getTicketDisplay = (ticket: TicketRecord) => <TicketTile ticket={ticket} key={ticket.ticketNumber} />

  const handleRefresh = async () => {
    console.log("refreshed");
    refreshTickets((ticket) => !isSettled(ticket.status));
  };

  return (
    <TableDiv>
      <PullToRefresh onRefresh={handleRefresh}>
        <Content>

          {/* Pending */}
          <Accordion
            dontDrawEmpty={true}
            label={`Pending (${pendingTickets.length})`}>
              {pendingTickets.map(getTicketDisplay)}
          </Accordion>

          {/* Current */}
          <Accordion
            className="current"
            dontDrawEmpty={true}
            label={`Current (${currentTickets.length})`}>
              {currentTickets.map(getTicketDisplay)}
          </Accordion>

          {/* Future */}
          <Accordion
            className="future"
            dontDrawEmpty={true}
            label={`Future (${futureTickets.length})`}>
              {futureTickets.map(getTicketDisplay)}
          </Accordion>

          {/* Past */}
          <Accordion
            dontDrawEmpty={true}
            label={`Past (${pastTickets.length})`}>
              {pastTickets.map(getTicketDisplay)}
          </Accordion>

          {/* No tickets */}
          {!hasTickets &&
            <AddTicketsMessage>
              <div>No {filterLevel === FilterLevel.All ? "" : filterLevel.toLowerCase()} tickets found</div>
              {filterLevel === FilterLevel.All && <div>Click the + button to add a ticket</div>}
            </AddTicketsMessage>
          }
          {!hasTickets && filterLevel === FilterLevel.All &&
            <Disclaimer>
              All data is stored securely on your device.
              <br/>
              Open source: <a href="https://github.com/philharlow/betbook">github.com/philharlow/betbook</a>
            </Disclaimer>
          }
        </Content>
      </PullToRefresh>
    </TableDiv>
  );
}

export default TicketTable;
