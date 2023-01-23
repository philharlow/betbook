import React from 'react';
import styled from 'styled-components/macro';

const Tabs = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterTab = styled.div`
  font-size: 16px;
  font-weight: 400;
  padding: 0px;
  padding-bottom: 5px;
  text-transform: uppercase;
  &.selected {
    border-bottom: 3px solid var(--green);
  }
`;

interface Props {
  options: string[];
  selected: string;
  onSelectionChanged: (option: string) => void;
}

function OptionBar({ options, selected, onSelectionChanged }: Props) {

  return (
    <Tabs>
      {options.map((option) => 
        <FilterTab onClick={() => onSelectionChanged(option)} className={option === selected ? "selected" : ""} key={option}>
          {option}
        </FilterTab>
      )}
    </Tabs>
  );
}

export default OptionBar;
