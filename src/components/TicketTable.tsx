import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {  TicketRecord, TicketStatus, TimePeriod, useTicketState } from '../store/ticketStore';
import { FilterLevel, useUIState } from '../store/uiStore';
import Accordian from './Accordian';
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

const AddTicketsMessage = styled.div`
  font-size: 16px;
  display: flex;
  flex: 1;
  justify-content: center;
  flex-direction: column;
  color: #999;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 50px;
`;

const TimePeriodLabel = styled.div`
  font-size: 12px;
  color: #666;
  align-self: start;
`;

const shouldDisplay = (ticket: TicketRecord, filter: FilterLevel) => {
  if (filter === FilterLevel.Open) return ticket.status === TicketStatus.Opened;
  if (filter === FilterLevel.Won) return ticket.status === TicketStatus.Won;
  if (filter === FilterLevel.Lost) return ticket.status === TicketStatus.Lost;
  if (filter === FilterLevel.Settled) return ticket.status === TicketStatus.Lost || ticket.status === TicketStatus.Won;
  return true;
}

function TicketTable() {
  const tickets = useTicketState(state => state.tickets);
  const filterLevel = useUIState(state => state.filterLevel);
  const setViewingTicket = useUIState(state => state.setViewingTicket);
  const [hasTickets, setHasTickets] = useState(false);
  const [pastTickets, setPastTickets] = useState<TicketRecord[]>([]);
  const [currentTickets, setCurrentTickets] = useState<TicketRecord[]>([]);
  const [futureTickets, setFutureTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    const filteredTickets = tickets.filter((ticket) => shouldDisplay(ticket, filterLevel));
    setPastTickets(filteredTickets.filter((ticket) => ticket.ticketResult?.TimePeriod === TimePeriod.Past));
    setCurrentTickets(filteredTickets.filter((ticket) => ticket.ticketResult?.TimePeriod === TimePeriod.Current));
    setFutureTickets(filteredTickets.filter((ticket) => ticket.ticketResult?.TimePeriod === TimePeriod.Future));
    setHasTickets(filteredTickets.length > 0)
  }, [tickets, filterLevel])

  // TODO remove hard coded time periods

  const getTicketDisplay = (ticket: TicketRecord) => <TicketDisplay ticket={ticket} key={ticket.ticketNumber} onClick={() => setViewingTicket(ticket)} />

  return (
    <TableDiv>
      <Content>
        {/* Past */}
        <Accordian
          dontDrawIfNoChildren={true}
          label={<TimePeriodLabel>Past ({pastTickets.length})</TimePeriodLabel>}>
            {pastTickets.map(getTicketDisplay)}
        </Accordian>

        {/* Current */}
        <Accordian
          dontDrawIfNoChildren={true}
          label={<TimePeriodLabel>Current ({currentTickets.length})</TimePeriodLabel>}>
            {currentTickets.map(getTicketDisplay)}
        </Accordian>

        {/* Future */}
        <Accordian
          dontDrawIfNoChildren={true}
          label={<TimePeriodLabel>Future ({futureTickets.length})</TimePeriodLabel>}>
            {futureTickets.map(getTicketDisplay)}
        </Accordian>

        {/* No tickets */}
        {!hasTickets &&
          <AddTicketsMessage>
            <div>No tickets found</div>
            {filterLevel === FilterLevel.All && <div>Click the + button to add a ticket</div>}
          </AddTicketsMessage>
        }
      </Content>
    </TableDiv>
  );
}

export default TicketTable;
