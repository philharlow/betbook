import React from "react";
import styled from "styled-components/macro";
import { getStatusColor } from "../store/ticketStore";
import { getOddsDisplay, getRelativeDateDisplay } from "../utils";
import { BetDetails, sanitizeString } from "../data/ticketTypes";

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

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 5px;
`;

const ContentRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const TimeLabel = styled.div`
  color: #ccc;
  font-size: 14px;
`;

const Odds = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

interface Props {
  bet: BetDetails;
  className?: string;
}

const getBetTitle = (bet: BetDetails): string => {
  let title = sanitizeString(`${bet.betType} - ${bet.betName}`, true);
  let eventName = bet.eventName;
  if (eventName === bet.betType) title = bet.betName;
  //  subtitle = subtitle.replace(eventName + " - ", "");
  return title;
};

function BetTile({ bet, className }: Props) {
  const hasScore = bet.scores !== undefined;
  const score1 = `${bet.scores?.teamA} : ${bet.scores?.scoreA}`;
  const score2 = `${bet.scores?.teamB} : ${bet.scores?.scoreB}`;

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
      <Content>
        <ContentRow>
          <Column style={{ flex: 1 }} className={className}>
            <Title>{getBetTitle(bet)}</Title>
            <SubTitle>{bet.eventName}</SubTitle>
            <SubTitle>{bet.betType}</SubTitle>
          </Column>
          <RightColumn className={className}>
            {!!bet.odds && <Odds>{getOddsDisplay(bet.odds)}</Odds>}
            {hasScore && (
              <GreyLabel>
                {score1}
                <br />
                {score2}
              </GreyLabel>
            )}
          </RightColumn>
        </ContentRow>
        <TimeLabel>{getRelativeDateDisplay(bet.eventDate)}</TimeLabel>
      </Content>
    </BetTileDiv>
  );
}

export default BetTile;
