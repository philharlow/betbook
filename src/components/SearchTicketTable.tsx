import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { TicketRecord, useTicketState } from '../store/ticketStore';
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
`;

const filter = (ticket: TicketRecord, searchValue: string) => {
  if (!ticket.ticketResult) return false;
  searchValue = searchValue.toLowerCase();
  for (const searchString of ticket.ticketResult.calculated.searchStrings) {
    if (searchString.indexOf(searchValue) > -1) return true;
  }
  return false;
};

function SearchTicketTable() {
  const navigate = useNavigate();
  const tickets = useTicketState(state => state.tickets);
  const [searchValue, setSearchValue] = useState("");
  const [filteredTickets, setFilteredTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    setFilteredTickets(tickets.filter((ticket) => filter(ticket, searchValue)))
  }, [searchValue, tickets]);

  const closeModal = () => {
    navigate("/");
  };

  return (
    <SearchTicketTableDiv>
      <TopBar>
        <MenuButton />
        <SearchInput placeholder="Search" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
        <CloseButton onClick={closeModal}>X</CloseButton>
      </TopBar>
      <TicketTable tickets={filteredTickets} showArchivedTickets={true} />
    </SearchTicketTableDiv>
  );
}

export default SearchTicketTable;
