import React from 'react';
import styled from 'styled-components/macro';
import { FilterLevel, FilterLevels, useUIState } from '../store/uiStore';
import OptionBar from './OptionBar';
import SmallToggle from './SmallToggle';

const OptionBarDiv = styled.div`
  width: 100%;
  display: flex;
  padding: 5px 15px;
  justify-content: space-between;
`;


function FilterBar() {
  const filterLevel = useUIState(state => state.filterLevel);
  const setFilterLevel = useUIState(state => state.setFilterLevel);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const setShowArchivedTickets = useUIState(state => state.setShowArchivedTickets);

  return (
    <OptionBarDiv>
      <OptionBar options={FilterLevels} selected={filterLevel} onSelectionChanged={(val) => setFilterLevel(val as FilterLevel)} />
      
      <SmallToggle checked={showArchivedTickets} onChecked={() => setShowArchivedTickets(!showArchivedTickets)} label="Show Archived" />
    </OptionBarDiv>
  );
}

export default FilterBar;
