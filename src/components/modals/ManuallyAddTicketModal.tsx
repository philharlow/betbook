import React, { useCallback, useState } from "react";
import styled from "styled-components/macro";
import { fetchUpdatedTicket, useTicketState } from "../../store/ticketStore";
import { Modal, useUIState } from "../../store/uiStore";
import { Button } from "../../styles/GlobalStyles";
import { useToastState } from "../../store/toastStore";
import { TicketDefinition, TicketSource } from "../../data/ticketTypes";

const AddTicketDiv = styled.div`
  position: absolute;
  background-color: var(--black);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
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

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CloseButton = styled(Button)`
  padding: 10px 14px;
`;

const AddTicketButton = styled(Button)`
  font-size: 20px;
  padding: 10px 20px;
`;

const Input = styled.input`
  font-size: 26px;
  border-radius: 10px;
  padding: 5px;
`;

function ManuallyAddTicketModal() {
  const modalOpen = useUIState((state) => state.modalOpen);
  const setModalOpen = useUIState((state) => state.setModalOpen);
  const tickets = useTicketState((state) => state.tickets);
  const updateTicket = useTicketState((state) => state.updateTicket);
  const showToast = useToastState((state) => state.showToast);
  const [value, setValue] = useState("");

  const handleChange = (e: any) => {
    const val = e.target.value;
    setValue(val);
  };

  const addDraftkingsTicket = useCallback(
    (ticketNumber: string) => {
      const asNumber = parseInt(ticketNumber);
      if (asNumber && !isNaN(asNumber)) {
        setValue("");
        if (tickets.find((ticket) => ticket.ticketNumber === ticketNumber)) {
          showToast("Ticket already added");
        } else {
          const ticket: TicketDefinition = {
            ticketNumber,
            createdDate: new Date(),
            dataSource: TicketSource.DraftKings,
            refreshing: true,
          };
          updateTicket(ticket);
          fetchUpdatedTicket(ticket.ticketNumber);
          showToast("Ticket added!");
        }
      } else {
        showToast("Ticket number invalid");
      }
    },
    [updateTicket, tickets, showToast]
  );

  const onAddDraftkingsTicket = () => {
    addDraftkingsTicket(value);
    setModalOpen(undefined);
  };

  if (modalOpen !== Modal.ManuallyAddTicket) return null;

  return (
    <AddTicketDiv>
      <TopBar>
        Manually Add Ticket
        <CloseButton onClick={() => setModalOpen(undefined)}>X</CloseButton>
      </TopBar>
      <Content>
        Draftkings Ticket Number
        <Input autoFocus value={value} placeholder="Ticket number" onChange={handleChange} type="text" />
        <AddTicketButton onClick={() => onAddDraftkingsTicket()}>Add Ticket</AddTicketButton>
      </Content>
      {/* <hr />
      <ManuallyAddTicketFields /> */}
    </AddTicketDiv>
  );
}

export default ManuallyAddTicketModal;

/*
let startingTicketDetails: TicketDetails = {
  status: TicketStatus.Unknown,
  betEventsStartDate: new Date(),
  betEventsEndDate: new Date(),
  wager: 0,
  toWin: 0,
  toPay: 0,
  totalOdds: 0,
  bets: [],
  betshopName: "",
  expiresDate: new Date(),
  searchStrings: [],
};

function ManuallyCreateTicketModal() {
  const [ticket, setTicket] = useState<TicketDefinition>({
    ticketNumber: "",
    createdDate: new Date(),
    dataSource: TicketSource.Manual,
    refreshing: true,
    ticketDetails: startingTicketDetails,
  });

  return (
    <AddTicketDiv>
      <TopBar>
        Manually Add Ticket
        <CloseButton>X</CloseButton>
      </TopBar>
      <Input autoFocus placeholder="Ticket number" type="text" />
      <TicketDetailsFields ticket={ticket} setTicket={setTicket} />
      <AddTicketButton>Add Ticket</AddTicketButton>
    </AddTicketDiv>
  );
}

function TicketDetailsFields({
  ticket,
  setTicket,
}: {
  ticket: TicketDefinition;
  setTicket: (ticket: TicketDefinition) => void;
}) {
  let details: TicketDetails = ticket.ticketDetails!;
  return (
    <>
      <Input placeholder="Status" type="text" />
      <Input placeholder="Bet Events Start Date" type="text" />
      <Input placeholder="Bet Events End Date" type="text" />
      <Input placeholder="Wager" type="text" />
      <Input placeholder="To Win" type="text" />
      <Input placeholder="To Pay" type="text" />
      <Input placeholder="Total Odds" type="text" />
      <Input placeholder="Betshop Name" type="text" />
      <Input placeholder="Expires Date" type="text" />
      <Input placeholder="Search Strings" type="text" />
    </>
  );
}
function BetDetailsFields({ bet }: { bet: any }) {
  return (
    <>
      <Input placeholder="Bet Event" type="text" />
      <Input placeholder="Bet Event Date" type="text" />
      <Input placeholder="Bet Event Time" type="text" />
      <Input placeholder="Bet Event Odds" type="text" />
      <Input placeholder="Bet Event Result" type="text" />
      <Input placeholder="Bet Event Status" type="text" />
    </>
  );
}
*/
