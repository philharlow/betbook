import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PullToRefresh from "react-simple-pull-to-refresh";
import styled from "styled-components/macro";
import { getBetTimePeriod, useTicketState } from "../../store/ticketStore";
import { useUIState } from "../../store/uiStore";
import { Button } from "../../styles/GlobalStyles";
import Accordion from "../Accordion";
import Toggle from "../Toggle";
import {
  BetDetails,
  getOddsDisplay,
  TicketDefinition,
  TimePeriod,
} from "../../data/ticketTypes";
import TicketTile from "../TicketTile";
import BetTile from "../BetTile";

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

const TopBar = styled.div`
  background-color: var(--grey);
  font-size: var(--topbar-font-size);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  align-items: center;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
  padding: 7px 0;
`;

const RemoveButton = styled(Button)`
  background: var(--red);
  padding: 10px 20px;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const RedeemButton = styled(Button)`
  background: var(--green);
  padding: 10px 20px;
`;

const ButtonRow = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
  gap: 15px;
`;

const ArchiveRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 30px;
  max-width: 60%;
`;

const ToggleRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 15px;
  align-self: center;
  align-items: center;
`;

const BackButton = styled(Button)`
  padding: 10px 14px;
`;

function TicketDetailsView() {
  const navigate = useNavigate();
  let { ticketNumber } = useParams();
  const tickets = useTicketState((state) => state.tickets);
  const [viewingTicket, setViewingTicket] = useState<
    TicketDefinition | undefined
  >(undefined);
  // const setViewingTicket = useUIState(state => state.setViewingTicket);
  const setViewingBarcode = useUIState((state) => state.setViewingBarcode);
  const removeTicket = useTicketState((state) => state.removeTicket);
  const archiveTicket = useTicketState((state) => state.archiveTicket);
  const refreshTicket = useTicketState((state) => state.refreshTicket);

  const closeModal = () => {
    navigate(-1);
  };

  useEffect(() => {
    const ticket = tickets.find(
      (ticket) => ticketNumber === ticket.ticketNumber
    );
    setViewingTicket(ticket);
  }, [ticketNumber, tickets]);

  const deleteTicket = () => {
    if (!viewingTicket) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ticket ${viewingTicket.ticketNumber}?`
      )
    )
      return;
    removeTicket(viewingTicket.ticketNumber);
    setViewingTicket(undefined);
  };

  const redeemTicket = () => {
    if (!viewingTicket) return;
    setViewingBarcode(viewingTicket);
  };

  const onArchiveTicket = () => {
    if (!viewingTicket) return;
    archiveTicket(viewingTicket.ticketNumber, !viewingTicket.archivedDate);
  };

  if (!viewingTicket) return <ViewTicketDiv />;

  const bets = viewingTicket.ticketDetails?.bets || [];
  const isPending = viewingTicket.ticketDetails === undefined;

  const betsByTimePeriod = bets.reduce((acc, bet) => {
    const timePeriod = getBetTimePeriod(bet);
    acc[timePeriod] = acc[timePeriod] ?? [];
    acc[timePeriod]!.push(bet);
    return acc;
  }, {} as { [key in TimePeriod]?: BetDetails[] });

  const pastSelections = betsByTimePeriod[TimePeriod.Past] || [];
  const currentSelections = betsByTimePeriod[TimePeriod.Current] || [];
  const futureSelections = betsByTimePeriod[TimePeriod.Future] || [];

  const title = viewingTicket.ticketDetails?.title ?? "Loading...";
  const odds = viewingTicket.ticketDetails?.totalOdds;
  const className = viewingTicket.refreshing ? "scrolling-gradient" : "";
  const getSelectionDisplay = (bet: BetDetails, i: number) => (
    <BetTile bet={bet} key={i} className={className} />
  );

  const handleRefresh = async () => {
    console.log("refreshed");
    refreshTicket(viewingTicket);
  };

  const now = new Date();
  const expiresInMs = viewingTicket.ticketDetails
    ? viewingTicket.ticketDetails?.expiresDate.getTime() - now.getTime()
    : -1;
  const expiresInDaysStr = `${Math.floor(
    Math.abs(expiresInMs) / 1000 / 60 / 60 / 24
  )} days`;
  const expiresInDays =
    expiresInMs < 0 ? `${expiresInDaysStr} ago` : `in ${expiresInDaysStr}`;

  return (
    <ViewTicketDiv>
      <TopBar>
        <BackButton onClick={closeModal}>&lt;</BackButton>
        {viewingTicket.dataSource} Ticket
        {/* {viewingTicket.ticketDetails?.betshopName} Ticket */}
        <span />
      </TopBar>
      <PullToRefresh onRefresh={handleRefresh}>
        <Content>
          <TicketTile ticket={viewingTicket} hideArrow={true} />
          <Title className={className}>
            {title} {getOddsDisplay(odds)}
          </Title>
          {/* Past */}
          <Accordion
            className={className}
            dontDrawEmpty={true}
            label={`Past (${pastSelections.length})`}
          >
            {pastSelections.map(getSelectionDisplay)}
          </Accordion>
          {/* Current */}
          <Accordion
            dontDrawEmpty={true}
            label={`Current (${currentSelections.length})`}
          >
            {currentSelections.map(getSelectionDisplay)}
          </Accordion>
          {/* Future */}
          <Accordion
            dontDrawEmpty={true}
            label={`Future (${futureSelections.length})`}
          >
            {futureSelections.map(getSelectionDisplay)}
          </Accordion>
          {isPending && "Loading..."}
          Created: {viewingTicket.createdDate.toLocaleString() ?? ""}
          <br />
          Expires:{" "}
          {viewingTicket.ticketDetails?.expiresDate.toLocaleString() ?? ""} (
          {expiresInDays})<br />
          <ArchiveRow>
            <ToggleRow>
              <div onClick={onArchiveTicket}>Archive Ticket</div>
              <Toggle
                checked={viewingTicket.archivedDate !== undefined}
                onChecked={onArchiveTicket}
              />
            </ToggleRow>
          </ArchiveRow>
          <ButtonRow>
            <RedeemButton onClick={redeemTicket}>View Barcode</RedeemButton>
          </ButtonRow>
          <RemoveButton onClick={deleteTicket}>Delete Ticket</RemoveButton>
          Ticket # {viewingTicket.ticketNumber}
          <br />
          <Button onClick={() => console.log(viewingTicket)}>
            Debug: Print ticket data
          </Button>
        </Content>
      </PullToRefresh>
    </ViewTicketDiv>
  );
}

export default TicketDetailsView;
