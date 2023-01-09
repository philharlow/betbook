import React from 'react';
import styled from 'styled-components/macro';
import { getStatusColor, SelectionResult } from '../store/ticketStore';
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
`;

const GreyLabel = styled.div`
  color: #666;
`;

interface Props {
  selection: SelectionResult;
  className?: string;
}

function SelectionTile({ selection, className } : Props) {
  const score = `${selection.MatchScore1}-${selection.MatchScore2}`;

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
      <Column className={className}>
        {selection.Odds || score}
      </Column>
    </SelectionTileDiv>
  );
}

export default SelectionTile;
