import React from 'react';
import styled from 'styled-components';
import { getStatusColor, TicketRecord, TicketStatus } from '../store/ticketStore';

const TicketDisplayDiv = styled.div`
  width: 100%;
  background: var(--grey);
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 5px;
  position: relative;
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
`;

const ResultRow = styled.div`
  position: absolute;
  right: 15px;
  top: 15px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  font-size: 18px;
  font-weight: 500;
`;

const GreyLabel = styled.div`
  color: #666;
`;

const TimeLabel = styled.div`
  color: #666;
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
  ticket: TicketRecord;
  onClick?: () => void;
}

function TicketDisplay({ticket, onClick} : Props) {
  const resultClassName = ticket.status === TicketStatus.Refreshing ? "scrolling-gradient" : "";

  return (
    <TicketDisplayDiv onClick={onClick}>
      {onClick && <ClickArrow>&gt;</ClickArrow>}
      <ResultRow style={{ color: "var(--" + getStatusColor(ticket.status) + ")" }} className={resultClassName}>
        {ticket.status}
      </ResultRow>
      {ticket.ticketResult === undefined && <Title>Loading...</Title>}

      <Title className={ticket.archived ? "archived " : "" + resultClassName}>
        {ticket.ticketResult?.calculated.Title}{ticket.archived ? " (Archived)" : ""}
      </Title>
      <SubTitle className={resultClassName}>
        {ticket.ticketResult?.calculated.SubTitle}
      </SubTitle>
      <CellContent className={resultClassName}>
        <GreyLabel>Wager:</GreyLabel>
        ${ticket.ticketResult?.TicketCost}
      </CellContent>
      <CellContent className={resultClassName}>
        <GreyLabel>To Pay:</GreyLabel>
        ${ticket.ticketResult?.ToPay}
      </CellContent>
      <CellContent className={resultClassName}>
        <TimeLabel>{ticket.ticketResult?.calculated.EventDate.toLocaleString()}</TimeLabel>
      </CellContent>
    </TicketDisplayDiv>
  );
}

export default TicketDisplay;
