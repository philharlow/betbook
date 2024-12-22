import React from 'react';
import { useTicketState } from '../../store/ticketStore';
import { FilterLevel, useUIState } from '../../store/uiStore';
import FilterBar from '../FilterBar';
import TicketTable from '../TicketTable';
import { TicketRecordOld, TicketStatus } from '../../store/ticketTypes';

const shouldDisplay = (ticket: TicketRecordOld, filter: FilterLevel, showArchivedTickets: boolean) => {
  if (ticket.archived && !showArchivedTickets) return false;
  if (filter === FilterLevel.Open) return ticket.status === TicketStatus.Opened;
  if (filter === FilterLevel.Won) return ticket.status === TicketStatus.Won;
  if (filter === FilterLevel.Lost) return ticket.status === TicketStatus.Lost;
  if (filter === FilterLevel.Settled) return ticket.status === TicketStatus.Lost || ticket.status === TicketStatus.Won || ticket.status === TicketStatus.Draw;
  return true;
}

function MainTicketsView() {
  const tickets = useTicketState(state => state.tickets);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const filterLevel = useUIState(state => state.filterLevel);
  const filteredTickets = tickets.filter((ticket) => shouldDisplay(ticket, filterLevel, showArchivedTickets));

  return (
    <>
      <FilterBar />
      <TicketTable tickets={filteredTickets} mainTable={true} />
    </>
  );
}

export default MainTicketsView;
