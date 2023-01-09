import React from 'react';
import styled from 'styled-components/macro';
import { getStatusColor, isSettled, SelectionResult } from '../store/ticketStore';
import { getDateDisplay } from '../utils';

const SelectionTileDiv = styled.div`
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
  selection: SelectionResult;
  className?: string;
}

function SelectionTile({ selection, className } : Props) {
  const hasScore = selection.MatchScore1.length > 0 && selection.MatchScore1 !== "-";
  const score1 = `${selection.calculated.Teams[0]}: ${selection.MatchScore1}`;
  const score2 = `${selection.calculated.Teams[1]}: ${selection.MatchScore2}`;
  const scoreClassName = isSettled(selection.Status) ? "" : "scrolling-gradient";

  const eventDate = selection.calculated.EventDate;
  const dateStr = getDateDisplay(eventDate);

  return (
    <SelectionTileDiv>
      <Column>
        <Circle style={{ backgroundColor: "var(--" + getStatusColor(selection.Status) + ")" }} className={className} />
      </Column>
      <Column style={{flex: 1}} className={className}>
        <Title>
          {selection.YourBetPrefix}
        </Title>
        <SubTitle>
          {selection.Yourbet}
        </SubTitle>
        <SubTitle>
          {selection.LineTypeName}
        </SubTitle>
        <GreyLabel>
          {dateStr}
        </GreyLabel>
      </Column>
      <RightColumn className={className}>
        {selection.Odds && <div>Odds: {selection.Odds}</div>}
        {hasScore && <GreyLabel className={scoreClassName}>
          {score1}<br />
          {score2}
        </GreyLabel>}
      </RightColumn>
    </SelectionTileDiv>
  );
}

export default SelectionTile;
