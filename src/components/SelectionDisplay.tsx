import React from 'react';
import styled from 'styled-components/macro';
import { getStatusColor, SelectionResult } from '../store/ticketStore';

const SelectionDisplayDiv = styled.div`
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
}

function SelectionDisplay({selection} : Props) {
  const score = `${selection.MatchScore1}-${selection.MatchScore2}`;

  return (
    <SelectionDisplayDiv>
      <Column>
        <Circle style={{ backgroundColor: "var(--" + getStatusColor(selection.Status) + ")" }} />
      </Column>
      <Column style={{flex: 1}}>
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
          {new Date(selection.EventDate).toLocaleString()}
        </GreyLabel>
      </Column>
      <Column>
        {selection.Odds || score}
      </Column>
    </SelectionDisplayDiv>
  );
}

export default SelectionDisplay;
