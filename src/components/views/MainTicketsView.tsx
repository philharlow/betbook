import React, { useEffect, useRef } from "react";
import styled from "styled-components/macro";
import { filterTicketsBySearch, getTicketTimePeriod, useTicketState } from "../../store/ticketStore";
import { StatusFilter, useUIState } from "../../store/uiStore";
import FilterBar from "../FilterBar";
import { isSettled, TicketDefinition, TicketStatus, TimePeriod } from "../../data/ticketTypes";
import SearchBar from "../SearchBar";
import Accordion from "../Accordion";
import TicketTile from "../TicketTile";
import { Top } from "./TicketDetailsView";

const TableDiv = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
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

const filterTicketsByStatus = (ticket: TicketDefinition, filter: StatusFilter) => {
  const status = ticket.ticketDetails?.status;
  if (filter === StatusFilter.Open) return status === TicketStatus.Opened;
  if (filter === StatusFilter.Won) return status === TicketStatus.Won;
  if (filter === StatusFilter.Lost) return status === TicketStatus.Lost;
  if (filter === StatusFilter.Settled) return isSettled(status);
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
    // Start observing the target node for configured mutations
    if (scrollRef.current) {
      const contentChanged = () => {
        const scrollPos = sessionStorage.getItem("scrollPos_" + key);
        if (scrollRef.current && scrollPos) scrollRef.current.scrollTop = parseInt(scrollPos);
        removeListener();
      };

      const config = { attributes: true, childList: true, subtree: true };
      const observer = new MutationObserver(contentChanged);
      observer.observe(scrollRef.current, config);

      let removeListener = () => {
        observer.disconnect();
      };
      return removeListener;
    }
  }, [scrollRef, key]);

  return scrollRef;
}

function MainTicketsView() {
  const tickets = useTicketState((state) => state.tickets);
  const statusFilter = useUIState((state) => state.statusFilter);
  const searchQuery = useUIState((state) => state.searchQuery);
  const showArchivedTickets = useUIState((state) => state.showArchivedTickets);
  const scrollRef = useScrollRestoration("MainTicketsView");

  const searchResults = tickets.filter(
    (ticket) => filterTicketsByStatus(ticket, statusFilter) && filterTicketsBySearch(ticket, searchQuery)
  );

  const unarchived = searchResults.filter((ticket) => !ticket.archivedDate);
  const archivedCount = searchResults.length - unarchived.length;

  const ticketsToShow = showArchivedTickets ? searchResults : unarchived;

  const pendingTickets = ticketsToShow.filter((ticket) => ticket.ticketDetails === undefined);

  const ticketsByTimePeriod = ticketsToShow.reduce((acc, ticket) => {
    if (ticket.rawData === undefined) return acc;
    const timePeriod = getTicketTimePeriod(ticket.ticketDetails);
    acc[timePeriod] = acc[timePeriod] ?? [];
    acc[timePeriod]!.push(ticket);
    return acc;
  }, {} as { [key in TimePeriod]?: TicketDefinition[] });

  let filterPrefix = statusFilter === StatusFilter.All ? "" : statusFilter.toLowerCase();
  const hasTickets = ticketsToShow.length > 0;

  const getTicketDisplay = (ticket: TicketDefinition) => (
    <TicketTile ticket={ticket} key={ticket.ticketNumber} clickable />
  );
  const getTicketsAccordion = (timePeriod: TimePeriod) => (
    <Accordion dontDrawEmpty={true} label={`${timePeriod} (${ticketsByTimePeriod[timePeriod]?.length ?? 0})`}>
      {ticketsByTimePeriod[timePeriod]?.map(getTicketDisplay)}
    </Accordion>
  );

  return (
    <TableDiv ref={scrollRef}>
      <FilterBar />
      {/* <PullToRefresh onRefresh={handleRefresh}> */}
      <Content>
        <Top id="top" />
        <SearchBar />

        {/* Pending */}
        <Accordion dontDrawEmpty={true} label={`Pending (${pendingTickets.length})`}>
          {pendingTickets.map(getTicketDisplay)}
        </Accordion>

        {getTicketsAccordion(TimePeriod.Current)}
        {getTicketsAccordion(TimePeriod.Future)}
        {getTicketsAccordion(TimePeriod.Past)}

        {/* No tickets */}
        {!hasTickets && (
          <AddTicketsMessage>
            <div>No {filterPrefix} tickets found</div>
            {archivedCount > 0 && (
              <ArchivedCount>
                ({archivedCount} archived {filterPrefix} tickets not shown)
              </ArchivedCount>
            )}
            {statusFilter === StatusFilter.All && <div>Click the + button to add a ticket</div>}
          </AddTicketsMessage>
        )}
        {!hasTickets && statusFilter === StatusFilter.All && (
          <Disclaimer>
            All data is stored locally on your device.
            <br />
            Open source: <a href="https://github.com/philharlow/betbook">github.com/philharlow/betbook</a>
          </Disclaimer>
        )}
      </Content>
      {/* </PullToRefresh> */}
    </TableDiv>
  );
}

export default MainTicketsView;
