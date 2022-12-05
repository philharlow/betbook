import React from 'react';
import styled from 'styled-components';
import { FilterLevel, FilterLevels, useUIState } from '../store/uiStore';

const FilterBarDiv = styled.div`
  width: 100%;
  display: flex;
  padding: 5px 15px;
`;

const FilterTab = styled.div`
  font-size: 18px;
  font-weight: 400;
  padding: 0px 15px;
  padding-bottom: 5px;
  text-transform: uppercase;
  &.selected {
    border-bottom: 3px solid var(--green);
  }
`;


function FilterBar() {
  const filterLevel = useUIState(state => state.filterLevel);
  const setFilterLevel = useUIState(state => state.setFilterLevel);
  
  const onTabClick = (filter: FilterLevel) => {
    setFilterLevel(filter);
  };

  return (
    <FilterBarDiv>
      {FilterLevels.map((filter) => 
        <FilterTab onClick={() => onTabClick(filter)} className={filter === filterLevel ? "selected" : ""} key={filter}>
          {filter}
        </FilterTab>
        )}
    </FilterBarDiv>
  );
}

export default FilterBar;
