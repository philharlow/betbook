import create from "zustand";
import { localStorageGet, localStorageSet } from "../LocalStorageManager";
import { fetchTicketData } from "../ticketApi";
import {
  BetDetails,
  isSettled,
  TicketDb,
  TicketDbVersion,
  TicketDefinition,
  TicketDetails,
  TICKETS_DB_KEY,
  TicketStatus,
  TimePeriod,
} from "../data/ticketTypes";
import { DraftKingsDataV1 } from "../data/DraftKingsDataV1";
import { DraftKingsDataV2 } from "../data/DraftKingsDataV2";
import { useToastState } from "./toastStore";

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
  if (isSettled(ticketStatus)) return TimePeriod.Past;
  const now = new Date();
  const timePeriod = now > eventDate ? TimePeriod.Past : TimePeriod.Future;
  if (timePeriod === TimePeriod.Past && ticketStatus === TicketStatus.Opened) return TimePeriod.Current;
  return timePeriod;
};

export const sanitizeResponse = (data: any) => {
  sanitizeStrings(data);
};

export const sanitizeStrings = (obj: any) => {
  if (!obj) return;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      obj[key] = obj[key].replaceAll("−", "-"); // Fix "heavy" minus returned from api
      obj[key] = obj[key].replaceAll("–", "-"); // Fix "heavy" minus returned from api
      obj[key] = obj[key].replaceAll("$", ""); // Remove any $ signs returned from api
    }
    if (typeof value === "object") {
      sanitizeStrings(value);
    }
  }
};

export const filterTicketsBySearch = (ticket: TicketDefinition, searchValue: string) => {
  if (searchValue === "") return true;
  if (!ticket.ticketDetails) return false;
  searchValue = searchValue.toLowerCase();
  for (const searchString of ticket.ticketDetails.searchStrings) {
    if (searchString.indexOf(searchValue) > -1) return true;
  }
  return false;
};

// Refresh current tickets on focusing the app
let lastRefreshed = Date.now();
const refreshThreshold = 60 * 1000; // 1 minute
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const timeSinceLastRefresh = Date.now() - lastRefreshed;
  const shouldRefresh = timeSinceLastRefresh > refreshThreshold;
  console.log(shouldRefresh ? "focused, refreshing" : "focused too soon", {
    refreshed: `${timeSinceLastRefresh / 1000}s ago`,
  });
  if (shouldRefresh) updateCurrentTickets();
});

// TODOv2
export const updateCurrentTickets = () => {
  lastRefreshed = Date.now();
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
  const useToast = useToastState.getState();
  const existingTicket = ticketState.tickets.find((t) => t.ticketNumber === ticketNumber);
  if (!existingTicket) return console.warn("fetchUpdatedTicket() Could not find ticket", ticketNumber);

  existingTicket.refreshing = true;
  ticketState.updateTicket(existingTicket);
  // uiState.setViewingTicket(existingTicket);

  console.log("fetching ticket", existingTicket.ticketNumber);
  const newTicketData = await fetchTicketData(existingTicket.ticketNumber);
  console.log("newTicketData", newTicketData);

  existingTicket.refreshing = false;
  ticketState.updateTicket(existingTicket);

  if (newTicketData) {
    let newTicket = { ...existingTicket };
    newTicket.rawData = newTicketData;
    newTicket.refreshing = false;
    computeTicketDetails(newTicket);
    ticketState.updateTicket(newTicket);
  } else {
    useToast.showToast("Failed to get ticket data");
  }
};

export const computeTicketDetails = (ticket: TicketDefinition) => {
  if (!ticket.rawData) return;

  if (DraftKingsDataV1.isValidTicket(ticket)) {
    let ticketData = ticket.rawData as DraftKingsDataV1.TicketResponse;
    let ticketDetails = DraftKingsDataV1.getTicketDetails(ticketData);
    if (ticketDetails) {
      ticket.ticketDetails = ticketDetails;
      ticket.createdDate = new Date(ticketData.ticketResult.CreatedDate);
      ticket.archivedDate = ticketData.archived ? new Date() : undefined;
    }
  } else if (DraftKingsDataV2.isValidTicket(ticket)) {
    let ticketData = ticket.rawData as DraftKingsDataV2.TicketResponse;
    let ticketDetails = DraftKingsDataV2.getTicketDetails(ticketData);
    if (ticketDetails) {
      ticket.ticketDetails = ticketDetails;
      ticket.createdDate = new Date(ticketData.placedDate);
    }
  }
  // Fix fup pay outs
  if (ticket.ticketDetails) {
    if (!ticket.ticketDetails.toPay || isNaN(ticket.ticketDetails.toPay)) {
      let totalOdds = ticket.ticketDetails.totalOdds;
      let oddsRatio = totalOdds / 100;
      if (totalOdds < 0) oddsRatio = 100 / -totalOdds;

      ticket.ticketDetails.toWin = ticket.ticketDetails.wager * oddsRatio;
      ticket.ticketDetails.toPay = ticket.ticketDetails.wager + ticket.ticketDetails.toWin;
    }
  }
};

// Sort tickets so that the most recent are at the top
const sortTickets = (tickets: TicketDefinition[]) => {
  tickets.sort((a, b) => {
    return a.ticketDetails && b.ticketDetails
      ? b.ticketDetails.betEventsStartDate.getTime() - a.ticketDetails.betEventsStartDate.getTime()
      : 0;
  });
};

export const LEGACY_TICKETS_ARRAY_KEY = "MBTB_tickets";
const tryLegacyImport = () => {
  const ticketsStr = localStorage.getItem(LEGACY_TICKETS_ARRAY_KEY);
  if (!ticketsStr) return;
  console.log("Found legacy DB, importing tickets");

  const tickets = JSON.parse(ticketsStr) as DraftKingsDataV1.TicketResponse[];
  console.log(`Found ${tickets.length} legacy tickets`);
  const ticketDefs = tickets.map(DraftKingsDataV1.getTicketDefinition);
  importTickets(ticketDefs, "legacy");
  // localStorage.removeItem(legacyLSKey);
};

export const importTickets = (tickets: TicketDefinition[], version: string) => {
  tickets.forEach(sanitizeResponse);
  tickets.forEach(computeTicketDetails);
  useTicketState.getState().setTickets(tickets);
  useToastState.getState().showToast(`Imported ${tickets.length} tickets from ${version} data`);

  // Fetch any updates
  setTimeout(() => {
    useTicketState.getState().refreshTickets((ticket) => !ticket.rawData || !ticket.ticketDetails);
  }, 100);
};

const getTicketsFromStorage = () => {
  const ticketsStr = localStorageGet(TICKETS_DB_KEY) ?? "null";
  const ticketDb = JSON.parse(ticketsStr) as TicketDb;
  if (!ticketDb || (ticketDb.tickets?.length ?? 0) === 0) {
    setTimeout(tryLegacyImport, 100); // Wait for store to init
    return [];
  }
  if (ticketDb.ticketsDbVersion !== TicketDbVersion) {
    setTimeout(() => {
      console.error("Ticket db version mismatch", ticketDb.ticketsDbVersion, TicketDbVersion);
    }, 100); // Hack for the console store to init, yuck
    // TODOv2 handle version mismatch
    return [];
  }

  // TODOv2 remove?
  // Currently fixes up dates, as they are stored as strings
  for (let ticket of ticketDb.tickets) {
    computeTicketDetails(ticket);
  }

  sortTickets(ticketDb.tickets);

  // Fetch updates
  setTimeout(() => {
    useTicketState
      .getState()
      .refreshTickets((ticket) => getTicketTimePeriod(ticket.ticketDetails) === TimePeriod.Current);
  }, 100);

  return ticketDb.tickets;
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
    const existingTicketIndex = tickets.findIndex((t) => t.ticketNumber === ticket.ticketNumber);
    if (existingTicketIndex > -1) {
      ticket = { ...tickets[existingTicketIndex], ...ticket };
      tickets[existingTicketIndex] = ticket;
    } else tickets.push(ticket);

    get().setTickets(tickets);
  },
  removeTicket: (ticketNumber: string) => {
    const tickets = [...get().tickets].filter((t) => t.ticketNumber !== ticketNumber);

    get().setTickets(tickets);
  },
  archiveTicket: (ticketNumber: string, archived = true) => {
    const existingTicket = get().tickets.find((t) => t.ticketNumber === ticketNumber);
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
    tickets.forEach((t) => (!filter || filter(t)) && fetchUpdatedTicket(t.ticketNumber));
    setTickets([...tickets]);
  },
}));
