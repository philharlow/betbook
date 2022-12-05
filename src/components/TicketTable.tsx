import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {  TicketRecord, TicketStatus, useTicketState } from '../store/ticketStore';
import { FilterLevel, useUIState } from '../store/uiStore';
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
  const [displayedTickets, setDisplayedTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    setDisplayedTickets(tickets.filter((ticket) => shouldDisplay(ticket, filterLevel)))
  }, [tickets, filterLevel])

  return (
    <TableDiv>
      {displayedTickets.map(ticket => 
        <TicketDisplay ticket={ticket} key={ticket.ticketNumber} onClick={() => setViewingTicket(ticket)} />
      )}
      {displayedTickets.length === 0 &&
        <AddTicketsMessage>
          <div>No tickets found</div>
          {filterLevel === FilterLevel.All && <div>Click the + button to add a ticket</div>}
        </AddTicketsMessage>}
    </TableDiv>
  );
}

export default TicketTable;
