import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import { TbFilter } from "react-icons/tb";
import VersionDisplay from './VersionDisplay';
import Toggle from './Toggle';
import { useLocation } from 'react-router-dom';

const TopBarDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px 15px;
  height: 50px;
`;

const Title = styled.div`
  font-size: var(--topbar-font-size);
  font-weight: 400;
  display: flex;
  align-items: center;
`;

const FilterButton = styled(Button)`
  font-size: var(--topbar-font-size);
  padding: 5px 12px;
  &.open {
    background-color: #8f8f8f;
  }
`;

const Logo = styled.img`
  width: 35px;
  height: 25px;
  padding-right: 10px;
`;

const OffsetVersionDisplay = styled(VersionDisplay)`
  padding-left: 5px;
  padding-top: 13px;
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
  top: 55px;
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

function TopBar() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const setShowArchivedTickets = useUIState(state => state.setShowArchivedTickets);
  const location = useLocation();
  
  const toggleFiltersOpen = () => {
    setFiltersOpen(!filtersOpen);
  };

  let myBetsSelected = location.pathname === "/";

  return (
    <TopBarDiv>
      <Title>
        <Logo src="logo192.png" alt="logo" />
        BetBook
        
        <OffsetVersionDisplay />
      </Title>
      {myBetsSelected && <>
        <FilterButton className={filtersOpen ? "open" : ""} onClick={toggleFiltersOpen}><TbFilter /></FilterButton>
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
      </>}
    </TopBarDiv>
  );
}

export default TopBar;
