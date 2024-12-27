import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import { getStatusColor, getTicketTimePeriod } from "../store/ticketStore";
import { getCurrencyDisplay, getDateDisplay, getOddsDisplay, getRelativeDateDisplay } from "../utils";
import LiveIcon from "./LiveIcon";
import { sanitizeString, TicketDefinition, TimePeriod } from "../data/ticketTypes";

const TicketTileDiv = styled.div`
  width: 100%;
  background: var(--grey);
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 5px;
  position: relative;
  text-align: left;
  transition: background 0.1s linear;

  &.clickable {
    cursor: pointer;
    &:hover {
      background: #2a2a2a;
    }
    &:active {
      background: #333;
    }
  }
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
  &.archived {
    color: var(--blue);
  }
`;

const SubTitle = styled.div`
  font-size: 16px;
  font-weight: 400;
`;

const CellContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;

const Info = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const TicketResult = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  font-size: 18px;
  font-weight: 500;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  gap: 5px;
`;

const GreyLabel = styled.div<{ useColor?: boolean }>`
  color: ${(p) => (p.useColor ? "#888" : "")};
`;

const TimeLabel = styled.div`
  color: #ccc;
  font-size: 14px;
`;

const ClickArrow = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%) scaleX(50%);
  color: #999;
  font-size: 24px;
  font-weight: 700;
`;

interface Props {
  ticket: TicketDefinition;
  clickable?: boolean;
}

const getTicketTitle = (ticket: TicketDefinition) => {
  if (!ticket.ticketDetails) return "Loading...";
  let { bets } = ticket.ticketDetails;
  let title = bets[0].betName + " - " + bets[0].eventName;
  if (bets.length > 1) title = `Parlay (${bets.length} pick)`;
  return title;
};

const getTicketSubtitle = (ticket: TicketDefinition): string => {
  if (!ticket.ticketDetails) return "Loading...";

  if (ticket.ticketDetails.bets.length === 1) {
    let bet = ticket.ticketDetails.bets[0];
    return bet.betType;
    // let teams: string[] = getTeams(bet.eventName);
    // return Array.from(teams.values()).join(", ");
  }
  const betsByType: { [key: string]: string[] } = {};
  for (const bet of ticket.ticketDetails.bets) {
    const yourBet = bet.betName;
    let key = sanitizeString(bet.betType, true);
    betsByType[key] = [...(betsByType[key] ?? []), yourBet];
  }
  let betStr: string[] = [];

  for (const betType in betsByType) {
    let bets = betsByType[betType];
    betStr.push(betType + " - " + bets.join(", "));
  }
  return betStr.join(" | ");
};

function TicketTile({ ticket, clickable }: Props) {
  const navigate = useNavigate();
  const refreshing = ticket.refreshing || !ticket.ticketDetails;
  const className = refreshing ? "scrolling-gradient" : "";

  let { betEventsStartDate, betEventsEndDate } = ticket.ticketDetails ?? {};

  const showBothDates = betEventsStartDate?.getTime() !== betEventsEndDate?.getTime();

  return (
    <TicketTileDiv
      onClick={() => clickable && navigate("/" + ticket.ticketNumber)}
      className={clickable ? "clickable" : ""}
    >
      {clickable && <ClickArrow>&gt;</ClickArrow>}
      <TopRow>
        <Title className={(ticket.archivedDate ? "archived " : "") + className}>{getTicketTitle(ticket)}</Title>
        <TicketResult
          style={{
            color: "var(--" + getStatusColor(ticket.ticketDetails?.status) + ")",
          }}
          className={className}
        >
          {ticket.ticketDetails?.status}
        </TicketResult>
      </TopRow>

      <SubTitle className={className}>{getTicketSubtitle(ticket)}</SubTitle>
      <Info className={className}>
        <InfoCol>
          <CellContent>
            <GreyLabel useColor={!refreshing}>Wager:</GreyLabel>
            {getCurrencyDisplay(ticket.ticketDetails?.wager)}
          </CellContent>
          <CellContent>
            <GreyLabel useColor={!refreshing}>To Pay:</GreyLabel>
            {getCurrencyDisplay(ticket.ticketDetails?.toPay)}
          </CellContent>
        </InfoCol>
        <InfoCol>
          <CellContent>
            <GreyLabel useColor={!refreshing}>Odds:</GreyLabel>
            {getOddsDisplay(ticket.ticketDetails?.totalOdds)}
          </CellContent>
          <CellContent>
            <GreyLabel useColor={!refreshing}>To Win:</GreyLabel>
            {getCurrencyDisplay(ticket.ticketDetails?.toWin)}
          </CellContent>
        </InfoCol>
      </Info>
      <CellContent className={className}>
        <TimeLabel>
          {!showBothDates && getRelativeDateDisplay(betEventsStartDate)}
          {showBothDates && getDateDisplay(betEventsStartDate) + " - " + getDateDisplay(betEventsEndDate)}
        </TimeLabel>
        {/*TODO do this better */}
        {getTicketTimePeriod(ticket.ticketDetails) === TimePeriod.Current && <LiveIcon />}
      </CellContent>
    </TicketTileDiv>
  );
}

export default TicketTile;
