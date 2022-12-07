import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { getStatusColor, TicketRecord } from '../store/ticketStore';

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

const Info = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
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
  color: #888;
`;

const TimeLabel = styled.div`
  color: #888;
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
  hideArrow?: boolean;
}

function TicketDisplay({ticket, hideArrow} : Props) {
  const navigate = useNavigate();
  const resultClassName = ticket.refreshing ? "scrolling-gradient" : "";

  return (
    <TicketDisplayDiv onClick={() => navigate("/" + ticket.ticketNumber)}>
      {!hideArrow && <ClickArrow>&gt;</ClickArrow>}
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
      <Info>
        <InfoCol>
          <CellContent className={resultClassName}>
            <GreyLabel>Wager:</GreyLabel>
            ${ticket.ticketResult?.TicketCost}
          </CellContent>
          <CellContent className={resultClassName}>
            <GreyLabel>To Pay:</GreyLabel>
            ${ticket.ticketResult?.ToPay}
          </CellContent>
        </InfoCol>
        <InfoCol>
          <CellContent className={resultClassName}>
            <GreyLabel>Odds:</GreyLabel>
            {ticket.ticketResult?.TotalOdds}
          </CellContent>
          <CellContent className={resultClassName}>
            <GreyLabel>To Win:</GreyLabel>
            ${ticket.ticketResult?.ToWin}
          </CellContent>
        </InfoCol>
      </Info>
      <CellContent className={resultClassName}>
        <TimeLabel>{ticket.ticketResult?.calculated.EventDate.toLocaleString()}</TimeLabel>
      </CellContent>
    </TicketDisplayDiv>
  );
}

export default TicketDisplay;
