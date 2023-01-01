import React, { useCallback, useState } from 'react';
import styled from 'styled-components/macro';
import {
  fetchUpdatedTicket,
  TicketRecord,
  TicketStatus,
  useTicketState,
} from '../store/ticketStore';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import { useToastState } from '../store/toastStore';

const AddTicketDiv = styled.div`
  position: absolute;
  background-color: var(--black);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
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

const CloseButton = styled(Button)`
  padding: 10px 14px;
`;

const AddTicketButton = styled(Button)`
  font-size: 20px;
`;

const Input = styled.input`
  font-size: 20px;
  border-radius: 10px;
`;


function ManuallyAddTicketModal() {
  const manuallyAddTicketModalOpen = useUIState(state => state.manuallyAddTicketModalOpen);
  const setManuallyAddTicketModalOpen = useUIState(state => state.setManuallyAddTicketModalOpen);
  const tickets = useTicketState(state => state.tickets);
  const updateTicket = useTicketState(state => state.updateTicket);
  const showToast = useToastState(state => state.showToast);
  const [value, setValue] = useState('');

  const handleChange = (e: any) => {
    const val = e.target.value;
    setValue(val);
  };

  const addTicket = useCallback((ticketNumber: string) => {
    const asNumber = parseInt(ticketNumber);
    if (asNumber && !isNaN(asNumber)) {
      setValue(ticketNumber);
      if (tickets.find((ticket) => ticket.ticketNumber === ticketNumber)) {
        showToast("Ticket already added");
      } else {
        const ticket: TicketRecord = {
          ticketNumber,
          sportsbook: "DraftKings",
          status: TicketStatus.Unknown,
          refreshing: true,
        };
        updateTicket(ticket);
        fetchUpdatedTicket(ticket.ticketNumber)
        showToast("Ticket added!");
      }
    } else {
      showToast("Ticket number invalid");
    }
  }, [updateTicket, tickets, showToast]);

  const onAddTicket = () => {
    addTicket(value);
    setManuallyAddTicketModalOpen(false);
  };


  if (!manuallyAddTicketModalOpen) return null;

  return (
    <AddTicketDiv>
      <TopBar>
        Manually Add Ticket
        <CloseButton onClick={() => setManuallyAddTicketModalOpen(false)}>X</CloseButton>
      </TopBar>
      Draftkings Ticket Number
      <Input value={value} placeholder="Ticket number" onChange={handleChange} type='text' />
      <AddTicketButton onClick={() => onAddTicket()}>Add Ticket</AddTicketButton>
      <hr />
      Manual Ticket Entry<br />
      (Not done yet)
      {/* TODO: Add auto complete with existing entries */}
      <Input placeholder="Name" onChange={handleChange} type='text' />
      <Input placeholder="Sportsbook" onChange={handleChange} type='text' />
      <Input placeholder="Ticket number" onChange={handleChange} type='text' />
      <Input placeholder="Wager" onChange={handleChange} type='text' />
      <Input placeholder="Odds" onChange={handleChange} type='text' />
      <Input placeholder="Event Date/Time" onChange={handleChange} type='text' />
      {/* TODO: make dropdown */}
      <Input placeholder="Ticket Status" onChange={handleChange} type='text' />
      <Input placeholder="Notes" onChange={handleChange} type='text' />
      {/* TODO: Add auto complete with existing entries */}
      {/* <AddTicketButton onClick={() => onAddTicket()}>Add Ticket</AddTicketButton> */}
    </AddTicketDiv>
  );
}

export default ManuallyAddTicketModal;
