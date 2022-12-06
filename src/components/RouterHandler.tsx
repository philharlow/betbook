import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTicketState } from '../store/ticketStore';
import { useUIState } from '../store/uiStore';


function RouterHandler() {
	const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const viewingTicket = useUIState(state => state.viewingTicket);
  const setViewingTicket = useUIState(state => state.setViewingTicket);
  const tickets = useTicketState(state => state.tickets);

  useEffect(() => {
    if (ticketNumber && viewingTicket?.ticketNumber !== ticketNumber) {
      const ticket = tickets.find((t) => t.ticketNumber === ticketNumber);
      console.log("setting ticket2" , { ticketNumber, ticket });
      setViewingTicket(ticket);
    }
  }, [ticketNumber, viewingTicket, setViewingTicket, tickets]);
  
  return (
    <></>
  );
}

export default RouterHandler;
