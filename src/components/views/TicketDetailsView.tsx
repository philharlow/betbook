import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PullToRefresh from "react-simple-pull-to-refresh";
import styled from "styled-components/macro";
import { getBetTimePeriod, useTicketState } from "../../store/ticketStore";
import { useUIState } from "../../store/uiStore";
import { Button } from "../../styles/GlobalStyles";
import Accordion from "../Accordion";
import { BetDetails, TicketDefinition, TimePeriod } from "../../data/ticketTypes";
import TicketTile from "../TicketTile";
import BetTile from "../BetTile";
import { useDebouncedEffect } from "../reactUtils";
import { TbArchive, TbBarcode, TbTrash } from "react-icons/tb";
import { getRelativeDateDisplay } from "../../utils";

const ViewTicketDiv = styled.div`
  background-color: var(--black);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 15px;
  padding-bottom: 50px;
  overflow-y: auto;
`;

// const TopBar = styled.div`
//   background-color: var(--grey);
//   font-size: var(--topbar-font-size);
//   width: 100%;
//   display: flex;
//   justify-content: space-between;
//   padding: 10px 15px;
//   align-items: center;
// `;

const IconButton = styled(Button)`
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  box-sizing: border-box;
  height: 100%;
  justify-content: center;
  gap: 10px;
  svg {
    width: 50px;
    height: 50px;
  }
`;

const RemoveButton = styled(IconButton)`
  background: var(--red);
`;

const RedeemButton = styled(IconButton)`
  background: white;
  color: black;
`;

let outlineThickness = 2;
const ArchiveButton = styled(IconButton)`
  background: var(--blue);
  color: white;
  border: ${outlineThickness}px solid transparent;
  &.archived {
    background: unset;
    border: ${outlineThickness}px solid var(--blue);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
  gap: 15px;
  align-items: center;
`;

// const BackButton = styled(Button)`
//   padding: 10px 14px;
// `;

const NotesField = styled.textarea`
  height: auto;
  font-size: 14px;
  display: table;
  border-radius: 10px;
  background: #111;
  border: 1px solid #222;
  padding: 15px;
`;

const Loading = styled.div`
  height: 100%;
  align-content: center;
`;

const DetailsDiv = styled.div`
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  line-height: 125%;
`;

const Debug = styled.div`
  opacity: 0.5;
  font-size: 12px;
  margin-top: 20px;
`;

function TicketDetailsView() {
  const navigate = useNavigate();
  let { ticketNumber } = useParams();
  const tickets = useTicketState((state) => state.tickets);
  const [ticket, setTicket] = useState<TicketDefinition | undefined>(undefined);
  // const setViewingTicket = useUIState(state => state.setViewingTicket);
  const setViewingBarcode = useUIState((state) => state.setViewingBarcode);
  const removeTicket = useTicketState((state) => state.removeTicket);
  const archiveTicket = useTicketState((state) => state.archiveTicket);
  const refreshTicket = useTicketState((state) => state.refreshTicket);
  const updateTicket = useTicketState((state) => state.updateTicket);

  const [notes, setNotes] = useState(ticket?.notes || "");
  useEffect(() => setNotes(ticket?.notes || ""), [ticket]);
  let saveNotes = () => {
    if (ticket && ticket.notes !== notes) {
      updateTicket({ ...ticket, notes });
    }
  };

  useDebouncedEffect(saveNotes, notes, 1000);

  // const goBack = () => {
  //   navigate(-1);
  // };

  useEffect(() => {
    const selectedTicket = tickets.find((t) => ticketNumber === t.ticketNumber);
    setTicket(selectedTicket);
  }, [ticketNumber, tickets]);

  const deleteTicket = () => {
    if (!ticket) return;
    if (!window.confirm(`Are you sure you want to delete ticket ${ticket.ticketNumber}?`)) return;
    removeTicket(ticket.ticketNumber);
    navigate("/");
  };

  const redeemTicket = () => {
    if (!ticket) return;
    setViewingBarcode(ticket);
  };

  const onArchiveTicket = () => {
    if (!ticket) return;
    archiveTicket(ticket.ticketNumber, !ticket.archivedDate);
  };

  if (!ticket)
    return (
      <ViewTicketDiv>
        <Loading>Loading...</Loading>
      </ViewTicketDiv>
    );

  const bets = ticket.ticketDetails?.bets || [];

  const betsByTimePeriod = bets.reduce((acc, bet) => {
    const timePeriod = getBetTimePeriod(bet);
    acc[timePeriod] = acc[timePeriod] ?? [];
    acc[timePeriod]!.push(bet);
    return acc;
  }, {} as { [key in TimePeriod]?: BetDetails[] });

  const className = ticket.refreshing ? "scrolling-gradient" : "";

  const handleRefresh = async () => {
    console.log("refreshed");
    refreshTicket(ticket);
  };

  const getBetDisplay = (bet: BetDetails, i: number) => <BetTile bet={bet} key={i} className={className} />;
  const getBetsAccordion = (timePeriod: TimePeriod) => (
    <Accordion dontDrawEmpty={true} label={`${timePeriod} (${betsByTimePeriod[timePeriod]?.length ?? 0})`}>
      {betsByTimePeriod[timePeriod]?.map(getBetDisplay)}
    </Accordion>
  );
  return (
    <ViewTicketDiv>
      {/* <TopBar>
        <BackButton onClick={goBack}>&lt;</BackButton>
        {ticket.dataSource} Ticket
        <span />
      </TopBar> */}
      <PullToRefresh onRefresh={handleRefresh}>
        <Content>
          <TicketTile ticket={ticket} />
          {ticket.dataSource} Ticket
          {/* <Title className={className}>
            {title} {getOddsDisplay(odds)}
          </Title> */}
          {getBetsAccordion(TimePeriod.Past)}
          {getBetsAccordion(TimePeriod.Current)}
          {getBetsAccordion(TimePeriod.Future)}
          <DetailsDiv>
            Created: {ticket.createdDate.toLocaleString() ?? ""}
            <br />
            Expires: {getRelativeDateDisplay(ticket.ticketDetails?.expiresDate)}
            <br />
            Archived: {getRelativeDateDisplay(ticket.archivedDate) ?? "No"}
            <br />
            <NotesField placeholder="Notes" value={notes} rows={3} onChange={(e) => setNotes(e.target.value)}>
              {notes}
            </NotesField>
            <ButtonRow>
              <ArchiveButton onClick={onArchiveTicket} className={ticket.archivedDate ? "archived" : ""}>
                <TbArchive />
                {ticket.archivedDate ? "Unarchive" : "Archive"}
              </ArchiveButton>
              <RedeemButton onClick={redeemTicket}>
                <TbBarcode />
                View Barcode
              </RedeemButton>
              <RemoveButton onClick={deleteTicket}>
                <TbTrash />
                Delete Ticket
              </RemoveButton>
            </ButtonRow>
            <Debug>
              <br />
              Ticket # {ticket.ticketNumber}
              <br />
              <Button onClick={() => console.log(ticket)}>Trace ticket data</Button>
            </Debug>
          </DetailsDiv>
        </Content>
      </PullToRefresh>
    </ViewTicketDiv>
  );
}

export default TicketDetailsView;
