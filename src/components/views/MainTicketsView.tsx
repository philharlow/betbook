import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components/macro";
import {
  filterTicketsBySearch,
  getTicketTimePeriod,
  useTicketState,
} from "../../store/ticketStore";
import { FilterLevel, useUIState } from "../../store/uiStore";
import FilterBar from "../FilterBar";
import {
  isSettled,
  TicketDefinition,
  TicketStatus,
  TimePeriod,
} from "../../data/ticketTypes";
import SearchBar from "../SearchBar";
import Accordion from "../Accordion";
import TicketTile from "../TicketTile";

const TableDiv = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0px 15px;
  overflow-y: auto;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
  padding: 10px 0px;
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
  padding-bottom: 20px;
  a {
    text-decoration: underline;
  }
`;

const ArchivedCount = styled.div`
  font-size: 12px;
  color: #464646;
  margin-top: -13px;
`;

const shouldDisplay = (ticket: TicketDefinition, filter: FilterLevel) => {
  // if (ticket.archived && !showArchivedTickets) return false;
  const status = ticket.ticketDetails?.status;
  if (filter === FilterLevel.Open) return status === TicketStatus.Opened;
  if (filter === FilterLevel.Won) return status === TicketStatus.Won;
  if (filter === FilterLevel.Lost) return status === TicketStatus.Lost;
  if (filter === FilterLevel.Settled) return isSettled(status);
  return true;
};

export function useScrollRestoration(key: string = "default") {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      let scrollPos = scrollRef.current?.scrollTop.toString() ?? "0";
      sessionStorage.setItem("scrollPos_" + key, scrollPos);
    };

    scrollRef.current?.addEventListener("scroll", handleScroll);

    const ref = scrollRef.current;
    return () => {
      ref?.removeEventListener("scroll", handleScroll);
    };
  }, [scrollRef, key]);

  useEffect(() => {
    const scrollPos = sessionStorage.getItem("scrollPos_" + key);
    if (scrollPos) {
      let scroll = () => {
        if (scrollRef.current)
          scrollRef.current.scrollTop = parseInt(scrollPos, 10);
      };
      setTimeout(scroll, 100);
      scroll();
      sessionStorage.removeItem("scrollPos_" + key);
    }
  }, [key]);

  return scrollRef;
}

function MainTicketsView() {
  const tickets = useTicketState((state) => state.tickets);

  const scrollRef = useScrollRestoration("MainTicketsView");

  const filterLevel = useUIState((state) => state.filterLevel);
  const searchQuery = useUIState((state) => state.searchQuery);
  const showArchivedTickets = useUIState((state) => state.showArchivedTickets);

  const [archivedCount, setArchivedCount] = useState(10);
  const [ticketsToShow, setTicketsToShow] = useState<TicketDefinition[]>([]);

  useEffect(() => {
    const searchResults = tickets.filter(
      (ticket) =>
        shouldDisplay(ticket, filterLevel) &&
        filterTicketsBySearch(ticket, searchQuery)
    );

    const unarchived = searchResults.filter((ticket) => !ticket.archivedDate);
    setArchivedCount(searchResults.length - unarchived.length);

    setTicketsToShow(showArchivedTickets ? searchResults : unarchived);
  }, [searchQuery, tickets, showArchivedTickets, filterLevel]);

  const pendingTickets = ticketsToShow.filter(
    (ticket) => ticket.ticketDetails === undefined
  );

  const ticketsByTimePeriod = ticketsToShow.reduce((acc, ticket) => {
    const timePeriod = getTicketTimePeriod(ticket.ticketDetails);
    acc[timePeriod] = acc[timePeriod] ?? [];
    acc[timePeriod]!.push(ticket);
    return acc;
  }, {} as { [key in TimePeriod]?: TicketDefinition[] });

  const pastTickets = ticketsByTimePeriod[TimePeriod.Past] ?? [];
  const currentTickets = ticketsByTimePeriod[TimePeriod.Current] ?? [];
  const futureTickets = ticketsByTimePeriod[TimePeriod.Future]?.reverse() ?? [];
  const hasTickets = ticketsToShow.length > 0;

  // TODO remove hard coded time periods

  const getTicketDisplay = (ticket: TicketDefinition) => (
    <TicketTile ticket={ticket} key={ticket.ticketNumber} />
  );

  // const handleRefresh = async () => {
  //   console.log("refreshed");
  //   updateCurrentTickets();
  // };

  let filterPrefix =
    filterLevel === FilterLevel.All ? "" : filterLevel.toLowerCase();

  return (
    <TableDiv ref={scrollRef}>
      <FilterBar />
      {/* <PullToRefresh onRefresh={handleRefresh}> */}
      <Content>
        <SearchBar />

        {/* Pending */}
        <Accordion
          dontDrawEmpty={true}
          label={`Pending (${pendingTickets.length})`}
        >
          {pendingTickets.map(getTicketDisplay)}
        </Accordion>

        {/* Current */}
        <Accordion
          className="current"
          dontDrawEmpty={true}
          label={`Current (${currentTickets.length})`}
        >
          {currentTickets.map(getTicketDisplay)}
        </Accordion>

        {/* Future */}
        <Accordion
          className="future"
          dontDrawEmpty={true}
          label={`Future (${futureTickets.length})`}
        >
          {futureTickets.map(getTicketDisplay)}
        </Accordion>

        {/* Past */}
        <Accordion dontDrawEmpty={true} label={`Past (${pastTickets.length})`}>
          {pastTickets.map(getTicketDisplay)}
        </Accordion>

        {/* No tickets */}
        {!hasTickets && (
          <AddTicketsMessage>
            <div>No {filterPrefix} tickets found</div>
            {archivedCount > 0 && (
              <ArchivedCount>
                ({archivedCount} archived {filterPrefix} tickets not shown)
              </ArchivedCount>
            )}
            {filterLevel === FilterLevel.All && (
              <div>Click the + button to add a ticket</div>
            )}
          </AddTicketsMessage>
        )}
        {!hasTickets && filterLevel === FilterLevel.All && (
          <Disclaimer>
            All data is stored locally on your device.
            <br />
            Open source:{" "}
            <a href="https://github.com/philharlow/betbook">
              github.com/philharlow/betbook
            </a>
          </Disclaimer>
        )}
      </Content>
      {/* </PullToRefresh> */}
    </TableDiv>
  );
}

export default MainTicketsView;
