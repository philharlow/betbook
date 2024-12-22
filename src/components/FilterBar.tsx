import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { FilterLevel, FilterLevels, useUIState } from '../store/uiStore';
import OptionBar from './OptionBar';
import { Button } from '../styles/GlobalStyles';
import Toggle from './Toggle';

const OptionBarDiv = styled.div`
  width: 100%;
  display: flex;
  padding: 5px 15px;
  justify-content: space-between;
  gap: 10px;
`;

const FilterButton = styled(Button)`
  font-size: 18px;
  &.open {
    background-color: #8f8f8f;
  }
`;

const FilterMenuDiv = styled.div`
  position: absolute;
  right: 0px;
  top: 0px;
  width: 100vw;
  height: 100vh;
  background-color: #0004;
  display: none;
  z-index: 9999;
  &.open {
    display: flex;
  }
`;

const FilterMenu = styled.div`
  position: absolute;
  right: 5px;
  top: 85px;
  width: 300px;
  padding: 10px 20px;
  background-color: #333;
  flex-direction: column;
`;

const Option = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: center;
  justify-content: space-between;
`;


function FilterBar() {
  const filterLevel = useUIState(state => state.filterLevel);
  const setFilterLevel = useUIState(state => state.setFilterLevel);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const setShowArchivedTickets = useUIState(state => state.setShowArchivedTickets);
  
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleFiltersOpen = () => {
    setFiltersOpen(!filtersOpen);
  };

  return (
    <OptionBarDiv>
      <OptionBar options={FilterLevels} selected={filterLevel} onSelectionChanged={(val) => setFilterLevel(val as FilterLevel)} />

      <FilterButton className={filtersOpen ? "open" : ""} onClick={toggleFiltersOpen}><TbAdjustmentsHorizontal /></FilterButton>

      <FilterMenuDiv className={filtersOpen ? "open" : ""} onClick={() => setFiltersOpen(false)}>
          <FilterMenu>
            <Option className="option" onClick={(e) => {
              e.stopPropagation();
              if ((e.target as any).classList?.contains("option")) {
                setShowArchivedTickets(!showArchivedTickets)
              }
            }}>
                Show Archived Tickets
                <Toggle checked={showArchivedTickets} onChecked={() => setShowArchivedTickets(!showArchivedTickets)}/>
            </Option>
          </FilterMenu>
        </FilterMenuDiv>
    </OptionBarDiv>
  );
}

export default FilterBar;
