import React from 'react';
import { useTicketState } from '../store/ticketStore';
import { useUIState } from '../store/uiStore';
import TicketTable from './TicketTable';

function MainTicketTable() {
  const tickets = useTicketState(state => state.tickets);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);

  return (
    <TicketTable tickets={tickets} showArchivedTickets={showArchivedTickets} />
  );
}

export default MainTicketTable;
