import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import {  TicketRecord, TimePeriod, updateCurrentTickets } from '../store/ticketStore';
import { FilterLevel, useUIState } from '../store/uiStore';
import Accordion from './Accordion';
import TicketTile from './TicketTile';
import PullToRefresh from 'react-simple-pull-to-refresh';

const TableDiv = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  overflow-y: auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
`;

const Footer = styled.div`
  padding-bottom: 100px;
`;

const AddTicketsMessage = styled.div`
  font-size: 16px;
  display: flex;
  flex: 1;
  flex-direction: column;
  color: #999;
  justify-content: center;
  line-height: 2;
`;

const Disclaimer = styled.div`
  font-size: 14px;
  color: #666;
  justify-content: end;
  a {
    text-decoration: underline;
  }
`;

const SearchInput = styled.input`
  font-size: 20px;
  border-radius: 10px;
  padding: 4px;
  background: #111;
  border: 1px solid #222;
  color: #fff;

  &:focus {
    outline: none;
  }
`;

interface Props {
  tickets: TicketRecord[];
  mainTable?: boolean;
}

function TicketTable({ tickets, mainTable }: Props) {
  const filterLevel = useUIState(state => state.filterLevel);
  const searchQuery = useUIState(state => state.searchQuery);
  const setSearchQuery = useUIState(state => state.setSearchQuery);
  
  const [filteredTickets, setFilteredTickets] = useState<TicketRecord[]>([]);
  
  const filterTicketsBySearch = (ticket: TicketRecord, searchValue: string) => {
    if (searchValue === "") return true;
    if (!ticket.ticketResult) return false;
    searchValue = searchValue.toLowerCase();
    for (const searchString of ticket.ticketResult.calculated.searchStrings) {
      if (searchString.indexOf(searchValue) > -1) return true;
    }
    return false;
  };

  useEffect(() => {
    const searchResults = tickets.filter((ticket) => filterTicketsBySearch(ticket, searchQuery));
    setFilteredTickets(searchResults);
  }, [searchQuery, tickets]);

  const pendingTickets = filteredTickets.filter((ticket) => ticket.ticketResult === undefined);
  const pastTickets = filteredTickets.filter((ticket) => ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Past);
  const currentTickets = filteredTickets.filter((ticket) => ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Current);
  const futureTickets = filteredTickets.filter((ticket) => ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Future).reverse();
  const hasTickets = filteredTickets.length > 0;

  // TODO remove hard coded time periods

  const getTicketDisplay = (ticket: TicketRecord) => <TicketTile ticket={ticket} key={ticket.ticketNumber} />

  const handleRefresh = async () => {
    console.log("refreshed");
    updateCurrentTickets();
  };

  return (
    <TableDiv>
      <PullToRefresh onRefresh={handleRefresh}>
        <Content>
          <SearchInput
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Pending */}
          <Accordion
            dontDrawEmpty={true}
            label={`Pending (${pendingTickets.length})`}>
              {pendingTickets.map(getTicketDisplay)}
          </Accordion>

          {/* Current */}
          <Accordion
            className="current"
            dontDrawEmpty={true}
            label={`Current (${currentTickets.length})`}>
              {currentTickets.map(getTicketDisplay)}
          </Accordion>

          {/* Future */}
          <Accordion
            className="future"
            dontDrawEmpty={true}
            label={`Future (${futureTickets.length})`}>
              {futureTickets.map(getTicketDisplay)}
          </Accordion>

          {/* Past */}
          <Accordion
            dontDrawEmpty={true}
            label={`Past (${pastTickets.length})`}>
              {pastTickets.map(getTicketDisplay)}
          </Accordion>

          <Footer />

          {/* No tickets */}
          {!hasTickets &&
            <AddTicketsMessage>
              <div>No {filterLevel === FilterLevel.All ? "" : filterLevel.toLowerCase()} tickets found</div>
              {mainTable && filterLevel === FilterLevel.All && <div>Click the + button to add a ticket</div>}
            </AddTicketsMessage>
          }
          {mainTable && !hasTickets && filterLevel === FilterLevel.All &&
            <Disclaimer>
              All data is stored securely on your device.
              <br/>
              Open source: <a href="https://github.com/philharlow/betbook">github.com/philharlow/betbook</a>
            </Disclaimer>
          }
        </Content>
      </PullToRefresh>
    </TableDiv>
  );
}

export default TicketTable;
