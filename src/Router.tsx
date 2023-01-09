import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTicketState } from './store/ticketStore';
import { Modal, useUIState } from './store/uiStore';


const Router = () => {
  const location = useLocation();
  const setModalOpen = useUIState(state => state.setModalOpen);
  const setViewingTicket = useUIState(state => state.setViewingTicket);
  const tickets = useTicketState(state => state.tickets);

  useEffect(() => {
    const pathname = location.pathname;
    const ticketNumber = pathname.length > 1 && pathname.substring(1);
    const ticket = tickets.find((ticket) => ticketNumber === ticket.ticketNumber);
    let modal: Modal | undefined = undefined;

    if (pathname === "/search") modal = Modal.Search;
    if (pathname === "/settings") modal = Modal.Settings;
    if (pathname === "/stats") modal = Modal.Stats;

    if (modal) {
      setViewingTicket(undefined);
      setModalOpen(modal);
    } else {
      setViewingTicket(ticket);
      if (!ticket) setModalOpen(undefined);
    }
  }, [location, setModalOpen, tickets, setViewingTicket]);

  return (
    <></>
  );
}

export default Router;
