import React from 'react';
import { TicketRecord, TicketStatus, useTicketState } from '../store/ticketStore';
import { FilterLevel, useUIState } from '../store/uiStore';
import FilterBar from './FilterBar';
import TicketTable from './TicketTable';
import TopBar from './TopBar';

const shouldDisplay = (ticket: TicketRecord, filter: FilterLevel, showArchivedTickets: boolean) => {
  if (ticket.archived && !showArchivedTickets) return false;
  if (filter === FilterLevel.Open) return ticket.status === TicketStatus.Opened;
  if (filter === FilterLevel.Won) return ticket.status === TicketStatus.Won;
  if (filter === FilterLevel.Lost) return ticket.status === TicketStatus.Lost;
  if (filter === FilterLevel.Settled) return ticket.status === TicketStatus.Lost || ticket.status === TicketStatus.Won || ticket.status === TicketStatus.Draw;
  return true;
}

function MainTicketTable() {
  const tickets = useTicketState(state => state.tickets);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const filterLevel = useUIState(state => state.filterLevel);
  const filteredTickets = tickets.filter((ticket) => shouldDisplay(ticket, filterLevel, showArchivedTickets));

  return (
    <>
      <TopBar />
      <FilterBar />
      <TicketTable tickets={filteredTickets} mainTable={true} />
    </>
  );
}

export default MainTicketTable;
