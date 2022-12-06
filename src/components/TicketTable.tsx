import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {  TicketRecord, TicketStatus, TimePeriod, useTicketState } from '../store/ticketStore';
import { FilterLevel, useUIState } from '../store/uiStore';
import Accordion from './Accordion';
import TicketDisplay from './TicketDisplay';

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
  const filterLevel = useUIState(state => state.filterLevel);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const [hasTickets, setHasTickets] = useState(false);
  const [pendingTickets, setPendingTickets] = useState<TicketRecord[]>([]);
  const [pastTickets, setPastTickets] = useState<TicketRecord[]>([]);
  const [currentTickets, setCurrentTickets] = useState<TicketRecord[]>([]);
  const [futureTickets, setFutureTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    const filteredTickets = tickets.filter((ticket) => shouldDisplay(ticket, filterLevel, showArchivedTickets));
    setPendingTickets(filteredTickets.filter((ticket) => ticket.ticketResult === undefined));
    setPastTickets(filteredTickets.filter((ticket) => ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Past));
    setCurrentTickets(filteredTickets.filter((ticket) => ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Current));
    setFutureTickets(filteredTickets.filter((ticket) => ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Future));
    setHasTickets(filteredTickets.length > 0);
  }, [tickets, filterLevel, showArchivedTickets])

  // TODO remove hard coded time periods

  const getTicketDisplay = (ticket: TicketRecord) => <TicketDisplay ticket={ticket} key={ticket.ticketNumber} />

  return (
    <TableDiv>
      <Content>
        {/* Pending */}
        <Accordion
          dontDrawIfNoChildren={true}
          label={`Pending (${pendingTickets.length})`}>
            {pendingTickets.map(getTicketDisplay)}
        </Accordion>

        {/* Past */}
        <Accordion
          dontDrawIfNoChildren={true}
          label={`Past (${pastTickets.length})`}>
            {pastTickets.map(getTicketDisplay)}
        </Accordion>

        {/* Current */}
        <Accordion
          dontDrawIfNoChildren={true}
          label={`Current (${currentTickets.length})`}>
            {currentTickets.map(getTicketDisplay)}
        </Accordion>

        {/* Future */}
        <Accordion
          dontDrawIfNoChildren={true}
          label={`Future (${futureTickets.length})`}>
            {futureTickets.map(getTicketDisplay)}
        </Accordion>

        {/* No tickets */}
        {!hasTickets &&
          <>
            <AddTicketsMessage>
              <div>No tickets found</div>
              {filterLevel === FilterLevel.All && <div>Click the + button to add a ticket</div>}
            </AddTicketsMessage>
            <Disclaimer>
              Disclaimer: All data is stored on your device. No data ever leaves your device.
              <br/>
              <a href="https://github.com/philharlow/betbook">Open source: https://github.com/philharlow/betbook</a>
            </Disclaimer>
          </>
        }
      </Content>
    </TableDiv>
  );
}

export default TicketTable;
