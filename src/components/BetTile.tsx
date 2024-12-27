import React from "react";
import styled from "styled-components/macro";
import { getStatusColor } from "../store/ticketStore";
import { getDateDisplay } from "../utils";
import { BetDetails, getOddsDisplay } from "../data/ticketTypes";

const BetTileDiv = styled.div`
  width: 100%;
  background: var(--grey);
  padding: 15px;
  display: flex;
  flex-direction: row;
  align-items: start;
  gap: 15px;
  position: relative;
  text-align: left;
`;

const Circle = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 20px;
  margin-top: 5px;
  background-clip: unset;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const SubTitle = styled.div`
  font-size: 16px;
  font-weight: 400;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
  line-height: 16px;
`;

const RightColumn = styled(Column)`
  align-items: end;
  text-align: right;
`;

const GreyLabel = styled.div`
  color: #ccc;
`;

interface Props {
  bet: BetDetails;
  className?: string;
}

function BetTile({ bet, className }: Props) {
  const hasScore = bet.scores !== undefined;
  const score1 = `${bet.scores?.teamA} : ${bet.scores?.scoreA}`;
  const score2 = `${bet.scores?.teamB} : ${bet.scores?.scoreB}`;

  const eventDate = bet.eventDate;
  const dateStr = getDateDisplay(eventDate);

  return (
    <BetTileDiv>
      <Column>
        <Circle
          style={{
            backgroundColor: "var(--" + getStatusColor(bet.status) + ")",
          }}
          className={className}
        />
      </Column>
      <Column style={{ flex: 1 }} className={className}>
        <Title>{bet.title}</Title>
        <SubTitle>{bet.subTitle}</SubTitle>
        <SubTitle>{bet.lineType}</SubTitle>
        <GreyLabel>{dateStr}</GreyLabel>
      </Column>
      <RightColumn className={className}>
        {!!bet.odds && <div>Odds: {getOddsDisplay(bet.odds)}</div>}
        {hasScore && (
          <GreyLabel>
            {score1}
            <br />
            {score2}
          </GreyLabel>
        )}
      </RightColumn>
    </BetTileDiv>
  );
}

export default BetTile;
