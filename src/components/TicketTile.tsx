import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components/macro";
import { getStatusColor, getTicketTimePeriod } from "../store/ticketStore";
import { getCurrencyDisplay, getDateDisplay } from "../utils";
import LiveIcon from "./LiveIcon";
import {
  getOddsDisplay,
  TicketDefinition,
  TimePeriod,
} from "../data/ticketTypes";

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
  cursor: pointer;
  transition: background 0.1s linear;
  &:active {
    background: #333;
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

const GreyLabel = styled.div`
  color: #888;
`;

const TimeLabel = styled.div`
  color: #ccc;
  font-size: 16px;
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
  hideArrow?: boolean;
}

function TicketTile({ ticket, hideArrow }: Props) {
  const navigate = useNavigate();
  const className = ticket.refreshing ? "scrolling-gradient" : "";

  let { betEventsStartDate, betEventsEndDate } = ticket.ticketDetails ?? {};

  return (
    <TicketTileDiv
      onClick={() => hideArrow !== true && navigate("/" + ticket.ticketNumber)}
    >
      {!hideArrow && <ClickArrow>&gt;</ClickArrow>}
      <TopRow>
        <Title className={(ticket.archivedDate ? "archived " : "") + className}>
          {ticket.ticketDetails?.title ?? "Loading..."}
        </Title>
        <TicketResult
          style={{
            color:
              "var(--" + getStatusColor(ticket.ticketDetails?.status) + ")",
          }}
          className={className}
        >
          {ticket.ticketDetails?.status}
        </TicketResult>
      </TopRow>

      {ticket.ticketDetails?.subTitle && (
        <SubTitle className={className}>
          {ticket.ticketDetails?.subTitle}
        </SubTitle>
      )}
      <Info className={className}>
        <InfoCol>
          <CellContent>
            <GreyLabel>Wager:</GreyLabel>$
            {getCurrencyDisplay(ticket.ticketDetails?.wager)}
          </CellContent>
          <CellContent>
            <GreyLabel>To Pay:</GreyLabel>$
            {getCurrencyDisplay(ticket.ticketDetails?.toPay)}
          </CellContent>
        </InfoCol>
        <InfoCol>
          <CellContent>
            <GreyLabel>Odds:</GreyLabel>
            {getOddsDisplay(ticket.ticketDetails?.totalOdds)}
          </CellContent>
          <CellContent>
            <GreyLabel>To Win:</GreyLabel>$
            {getCurrencyDisplay(ticket.ticketDetails?.toWin)}
          </CellContent>
        </InfoCol>
      </Info>
      <CellContent className={className}>
        <TimeLabel>
          {getDateDisplay(betEventsStartDate)}
          {betEventsStartDate?.getTime() !== betEventsEndDate?.getTime() &&
            " - " + getDateDisplay(betEventsEndDate)}
        </TimeLabel>
        {/*TODO do this better */}
        {getTicketTimePeriod(ticket.ticketDetails) === TimePeriod.Current && (
          <LiveIcon />
        )}
      </CellContent>
    </TicketTileDiv>
  );
}

export default TicketTile;
