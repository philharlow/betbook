import React from 'react';
import styled from 'styled-components/macro';
import { useUIState } from '../store/uiStore';
import SmallToggle from './SmallToggle';

const OptionBarDiv = styled.div`
  width: 100%;
  display: flex;
  padding: 5px 15px;
  justify-content: space-between;
`;

const ArchiveToggle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
  font-size: 8px;
`;

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

const DisabledSmallToggle = styled(SmallToggle)`
  pointer-events: none;
`;

interface Props {
  options: string[];
  selected: string;
  showArchiveToggle?: boolean;
  onSelectionChanged: (option: string) => void;
}

function OptionBar({ options, selected, onSelectionChanged, showArchiveToggle }: Props) {
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const setShowArchivedTickets = useUIState(state => state.setShowArchivedTickets);

  return (
    <OptionBarDiv>
      <Tabs>
        {options.map((option) => 
          <FilterTab onClick={() => onSelectionChanged(option)} className={option === selected ? "selected" : ""} key={option}>
            {option}
          </FilterTab>
        )}
      </Tabs>
      {showArchiveToggle &&
        <ArchiveToggle onClick={() => setShowArchivedTickets(!showArchivedTickets)}>
          <DisabledSmallToggle checked={showArchivedTickets} />
          Show Archived
        </ArchiveToggle>
      }
    </OptionBarDiv>
  );
}

export default OptionBar;
