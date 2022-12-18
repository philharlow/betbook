import React from 'react';
import styled from 'styled-components/macro';
import { FilterLevel, FilterLevels, useUIState } from '../store/uiStore';
import SmallToggle from './SmallToggle';

const FilterBarDiv = styled.div`
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

function FilterBar() {
  const filterLevel = useUIState(state => state.filterLevel);
  const setFilterLevel = useUIState(state => state.setFilterLevel);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const setShowArchivedTickets = useUIState(state => state.setShowArchivedTickets);
  
  const onTabClick = (filter: FilterLevel) => {
    setFilterLevel(filter);
  };

  return (
    <FilterBarDiv>
      <Tabs>
        {FilterLevels.map((filter) => 
          <FilterTab onClick={() => onTabClick(filter)} className={filter === filterLevel ? "selected" : ""} key={filter}>
            {filter}
          </FilterTab>
        )}
      </Tabs>
      <ArchiveToggle onClick={() => setShowArchivedTickets(!showArchivedTickets)}>
        <DisabledSmallToggle checked={showArchivedTickets} />
        Show Archived
      </ArchiveToggle>
    </FilterBarDiv>
  );
}

export default FilterBar;
