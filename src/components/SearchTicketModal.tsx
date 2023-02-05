import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { filterTicketsBySearch, TicketRecord, useTicketState } from '../store/ticketStore';
import { Modal, useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import MenuButton from './MenuButton';
import TicketTable from './TicketTable';

const SearchTicketTableDiv = styled.div`
  position: absolute;
  background-color: var(--black);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const TopBar = styled.div`
  background-color: var(--grey);
  font-size: var(--topbar-font-size);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  align-items: center;
`;

const CloseButton = styled(Button)`
  padding: 10px 14px;
`;

const SearchInput = styled.input`
  font-size: 20px;
  border-radius: 10px;
  padding: 4px;
`;

const SearchDiv = styled.div`
  position: relative;
`;

const ClearButton = styled(Button)`
  position: absolute;
  right: 7px;
  top: 8px;
  background: #3338;
  padding: 4px 8px;
`;

function SearchTicketModal() {
  const navigate = useNavigate();
  const tickets = useTicketState(state => state.tickets);
  const modalOpen = useUIState(state => state.modalOpen);
  const searchQuery = useUIState(state => state.searchQuery);
  const setSearchQuery = useUIState(state => state.setSearchQuery);
  const [filteredTickets, setFilteredTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    const searchResults = tickets.filter((ticket) => filterTicketsBySearch(ticket, searchQuery));
    setFilteredTickets(searchResults);
  }, [searchQuery, tickets]);

  const closeModal = () => {
    navigate("/");
  };

  const clearQuery = () => {
    setSearchQuery("");
    const searchInput = document.querySelector("#search") as HTMLInputElement;
    searchInput?.focus();
  };

  if (modalOpen !== Modal.Search) return null;

  return (
    <SearchTicketTableDiv>
      <TopBar>
        <MenuButton />
        <SearchDiv>
          <SearchInput id="search" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && <ClearButton onClick={clearQuery}>x</ClearButton>}
        </SearchDiv>
        <CloseButton onClick={closeModal}>X</CloseButton>
      </TopBar>
      <TicketTable tickets={filteredTickets} />
    </SearchTicketTableDiv>
  );
}

export default SearchTicketModal;
