import create from "zustand";
import { localStorageGet, localStorageSet } from "../LocalStorageManager";
import { fetchTicketData } from "../ticketApi";
import { useUIState } from "./uiStore";
import { BetDetails, TicketDb, TicketDbVersion, TicketDefinition, TicketDetails, TICKETS_DB_KEY, TicketSource, TicketStatus, TimePeriod } from "../data/ticketTypes";
import { DraftKingsDataV1 } from "../data/DraftKingsDataV1";
import { DraftKingsDataV2 } from "../data/DraftKingsDataV2";

export const getStatusColor = (status?: TicketStatus) => {
  if (status === TicketStatus.Opened) return "orange";
  if (status === TicketStatus.Lost) return "red";
  if (status === TicketStatus.Won) return "green";
  if (status === TicketStatus.Draw) return "draw";
  return "white";
};

export const getTicketTimePeriod = (ticketDetails?: TicketDetails) => {
  if (!ticketDetails) return TimePeriod.Future;
  return getTimePeriod(ticketDetails.betEventsStartDate, ticketDetails.status);
};

export const getBetTimePeriod = (betDetails?: BetDetails) => {
  if (!betDetails) return TimePeriod.Future;
  return getTimePeriod(betDetails.eventDate, betDetails.status);
};

const getTimePeriod = (eventDate: Date, ticketStatus: TicketStatus) => {
  const now = new Date();
  const timePeriod = now > eventDate ? TimePeriod.Past : TimePeriod.Future;
  if (timePeriod === TimePeriod.Past && ticketStatus === TicketStatus.Opened)
    return TimePeriod.Current;
  return timePeriod;
};

export const sanitizeResponse = (data: any) => {
  sanitizeStrings(data);
};

export const sanitizeStrings = (obj: any) => {
  if (!obj) return;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      obj[key] = value.replace("−", "-"); // Fix "heavy" minus returned from api
      obj[key] = value.replace("$", ""); // Remove any $ signs returned from api
    }
    if (typeof value === "object") {
      sanitizeStrings(value);
    }
  }
};

export const filterTicketsBySearch = (
  ticket: TicketDefinition,
  searchValue: string
) => {
  if (searchValue === "") return true;
  if (!ticket.ticketDetails) return false;
  searchValue = searchValue.toLowerCase();
  for (const searchString of ticket.ticketDetails.searchStrings) {
    if (searchString.indexOf(searchValue) > -1) return true;
  }
  return false;
};

interface TicketState {
  tickets: TicketDefinition[];
  setTickets: (tickets: TicketDefinition[]) => void;
  updateTicket: (ticket: TicketDefinition) => void;
  removeTicket: (ticketNumber: string) => void;
  archiveTicket: (ticketNumber: string, archived?: boolean) => void;
  refreshTicket: (ticket: TicketDefinition) => void;
  refreshTickets: (filter?: (ticket: TicketDefinition) => boolean) => void;
}

// Refresh current tickets on focusing the app
let lastRefreshed = Date.now();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (Date.now() - lastRefreshed > 60 * 1000) {
    console.log("focused, refreshing");
    lastRefreshed = Date.now();
    // TODO force tickets to update their own timeperiod, then use that to update
    updateCurrentTickets();
  } else console.log("focused too soon", Date.now() - lastRefreshed);
});

// TODOv2
export const updateCurrentTickets = () => {
  useTicketState.getState().refreshTickets((ticket) => {
    if (ticket.ticketDetails) {
      const newTimePeriod = getTicketTimePeriod(ticket.ticketDetails);
      if (newTimePeriod === TimePeriod.Current) return true;
    }
    return false;
  });
};

export const fetchUpdatedTicket = async (ticketNumber: string) => {
  const ticketState = useTicketState.getState();
  const uiState = useUIState.getState();
  const existingTicket = ticketState.tickets.find(
    (t) => t.ticketNumber === ticketNumber
  );
  if (!existingTicket)
    return console.warn(
      "fetchUpdatedTicket() Could not find ticket",
      ticketNumber
    );

  existingTicket.refreshing = true;
  uiState.setViewingTicket(existingTicket);

  console.log("fetching ticket", existingTicket.ticketNumber);
  const newTicketData = await fetchTicketData(existingTicket.ticketNumber);
  console.log("newTicketData", newTicketData);

  if (newTicketData) {
    let newTicket = {...existingTicket};
    newTicket.rawData = newTicketData;
    newTicket.refreshing = false;
    computeTicketDetails(newTicket);
    useTicketState.getState().updateTicket(newTicket);
  }
};

export const computeTicketDetails = (ticket: TicketDefinition) => {
  if (!ticket.rawData) return;

  if (ticket.dataSource === TicketSource.DraftKingsV1) {
    let ticketData = ticket.rawData as DraftKingsDataV1.TicketResponse
    let ticketDetails = DraftKingsDataV1.getTicketDetails(ticketData);
    if (ticketDetails) {
      ticket.ticketDetails = ticketDetails;
      ticket.createdDate = new Date(ticketData.ticketResult.CreatedDate);
      ticket.archivedDate = ticketData.archived ? new Date() : undefined;
    }
  }
  if (ticket.dataSource === TicketSource.DraftKingsV2) {
    let ticketData = ticket.rawData as DraftKingsDataV2.TicketResponse
    let ticketDetails = DraftKingsDataV2.getTicketDetails(ticketData);
    if (ticketDetails) {
      ticket.ticketDetails = ticketDetails;
      ticket.createdDate = new Date(ticketData.placedDate);
    }
  }
}


const sortTickets = (tickets: TicketDefinition[]) => {
  tickets.sort((a, b) => {

    return a.ticketDetails && b.ticketDetails
      ? b.ticketDetails.betEventsStartDate.getTime() -
        a.ticketDetails.betEventsStartDate.getTime()
      : 0
}
  );
};

const getTicketsFromStorage = () => {
  const ticketsStr = localStorageGet(TICKETS_DB_KEY);
  if (!ticketsStr) return [];

  const ticketDb = JSON.parse(ticketsStr) as TicketDb;
  if (!ticketDb) return [];
  if (ticketDb.ticketsDbVersion !== TicketDbVersion) {
    console.error("Ticket db version mismatch", ticketDb.ticketsDbVersion);
    return [];
  }

  for (let ticket of ticketDb.tickets) {
    computeTicketDetails(ticket);
  }

  sortTickets(ticketDb.tickets);

  // Fetch updates
  setTimeout(
    () =>
      ticketDb.tickets.forEach((ticket) => {
        // Only update current bets
        let timePeriod = getTicketTimePeriod(ticket.ticketDetails);
        if (timePeriod === TimePeriod.Current)
          fetchUpdatedTicket(ticket.ticketNumber);
      }),
    1
  );

  return ticketDb.tickets;
};

export const useTicketState = create<TicketState>((set, get) => ({
  tickets: getTicketsFromStorage(),
  setTickets: (tickets: TicketDefinition[]) => {
    sortTickets(tickets);
    let db = { ticketsDbVersion: TicketDbVersion, tickets };
    localStorageSet(TICKETS_DB_KEY, JSON.stringify(db));
    set({ tickets });
  },
  updateTicket: (ticket: TicketDefinition) => {
    const tickets = [...get().tickets];
    const existingTicketIndex = tickets.findIndex(
      (t) => t.ticketNumber === ticket.ticketNumber
    );
    if (existingTicketIndex > -1) {
      ticket = { ...tickets[existingTicketIndex], ...ticket };
      tickets[existingTicketIndex] = ticket;
    } else tickets.push(ticket);

    get().setTickets(tickets);

    // TODO fix this, this is bad
    const uiState = useUIState.getState();
    if (uiState.viewingTicket?.ticketNumber === ticket.ticketNumber)
      uiState.setViewingTicket(ticket);
  },
  removeTicket: (ticketNumber: string) => {
    const tickets = [...get().tickets].filter(
      (t) => t.ticketNumber !== ticketNumber
    );

    get().setTickets(tickets);
  },
  archiveTicket: (ticketNumber: string, archived = true) => {
    const existingTicket = get().tickets.find(
      (t) => t.ticketNumber === ticketNumber
    );
    if (existingTicket) {
      existingTicket.archivedDate = archived ? new Date() : undefined;
      get().updateTicket(existingTicket);
    }
  },
  refreshTicket: (ticket: TicketDefinition) => {
    fetchUpdatedTicket(ticket.ticketNumber);
  },
  refreshTickets: (filter?: (ticket: TicketDefinition) => boolean) => {
    const { tickets, setTickets } = get();
    tickets.forEach(
      (t) => (!filter || filter(t)) && fetchUpdatedTicket(t.ticketNumber)
    );
    setTickets([...tickets]);
  },
}));
