import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { getStatusColor, TicketRecord } from '../store/ticketStore';
import { getDateDisplay } from '../utils';

const TicketTileDiv = styled.div`
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
  ticket: TicketRecord;
  hideArrow?: boolean;
}

function TicketTile({ticket, hideArrow} : Props) {
  const navigate = useNavigate();
  const className = ticket.refreshing ? "scrolling-gradient" : "";

  const eventDate = ticket.ticketResult?.calculated.EventDate;
  const dateStr = getDateDisplay(eventDate);

  return (
    <TicketTileDiv onClick={() => navigate("/" + ticket.ticketNumber)}>
      {!hideArrow && <ClickArrow>&gt;</ClickArrow>}
      <ResultRow style={{ color: "var(--" + getStatusColor(ticket.status) + ")" }} className={className}>
        {ticket.status}
      </ResultRow>
      {ticket.ticketResult === undefined && <Title>Loading...</Title>}

      <Title className={(ticket.archived ? "archived " : "") + className}>
        {ticket.ticketResult?.calculated.Title}
      </Title>
      <SubTitle className={className}>
        {ticket.ticketResult?.calculated.SubTitle}
      </SubTitle>
      <Info className={className}>
        <InfoCol>
          <CellContent>
            <GreyLabel>Wager:</GreyLabel>
            ${ticket.ticketResult?.TicketCost}
          </CellContent>
          <CellContent>
            <GreyLabel>To Pay:</GreyLabel>
            ${ticket.ticketResult?.ToPay}
          </CellContent>
        </InfoCol>
        <InfoCol>
          <CellContent>
            <GreyLabel>Odds:</GreyLabel>
            {ticket.ticketResult?.TotalOdds}
          </CellContent>
          <CellContent>
            <GreyLabel>To Win:</GreyLabel>
            ${ticket.ticketResult?.ToWin}
          </CellContent>
        </InfoCol>
      </Info>
      <CellContent className={className}>
        <TimeLabel>{dateStr}</TimeLabel>
      </CellContent>
    </TicketTileDiv>
  );
}

export default TicketTile;
