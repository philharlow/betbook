import create from "zustand";
import {
  localStorageGet,
  localStorageGetBool,
  localStorageSet,
  localStorageSetBool,
} from "../LocalStorageManager";
import { TicketRecordOld, useTicketState } from "./ticketStore";

export enum FilterLevel {
  All = "All",
  Open = "Open",
  Settled = "Settled",
  Won = "Won",
  Lost = "Lost",
}
export const FilterLevels = Object.values(FilterLevel);

const FILTER_LEVEL = "FILTER_LEVEL";
const SHOW_ARCHIVED_TICKETS = "SHOW_ARCHIVED_TICKETS";

export enum Modal {
  None,
  AddTicket,
  ManuallyAddTicket,
  Search,
  Stats,
  Settings,
}

interface UIState {
  viewingTicket?: TicketRecordOld;
  setViewingTicket: (viewingTicket?: TicketRecordOld) => void;
  setViewingTicketNumber: (ticketNumber?: string) => void;
  viewingBarcode?: TicketRecordOld;
  setViewingBarcode: (viewingBarcode?: TicketRecordOld) => void;
  filterLevel: FilterLevel;
  setFilterLevel: (filterLevel: FilterLevel) => void;
  modalOpen?: Modal;
  setModalOpen: (modal?: Modal) => void;
  menuOpen: boolean;
  setMenuOpen: (menuOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  showArchivedTickets: boolean;
  setShowArchivedTickets: (showArchivedTickets: boolean) => void;
}

export const useUIState = create<UIState>((set, get) => ({
  viewingTicket: undefined,
  setViewingTicket: (viewingTicket?: TicketRecordOld) => {
    if (viewingTicket) viewingTicket = { ...viewingTicket };
    set({ viewingTicket });
  },
  setViewingTicketNumber: (ticketNumber?: string) => {
    const viewingTicket = useTicketState
      .getState()
      .tickets.find((t) => t.ticketNumber === ticketNumber);
    set({ viewingTicket });
  },
  viewingBarcode: undefined,
  setViewingBarcode: (viewingBarcode?: TicketRecordOld) => {
    set({ viewingBarcode });
  },
  filterLevel: localStorageGet(FILTER_LEVEL)
    ? (localStorageGet(FILTER_LEVEL) as FilterLevel)
    : FilterLevel.All,
  setFilterLevel: (filterLevel: FilterLevel) => {
    set({ filterLevel });
    localStorageSet(FILTER_LEVEL, filterLevel);
  },
  modalOpen: undefined,
  setModalOpen: (modalOpen?: Modal) => {
    set({ modalOpen });
  },
  menuOpen: false,
  setMenuOpen: (menuOpen: boolean) => {
    set({ menuOpen });
  },
  searchQuery: "",
  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },
  showArchivedTickets: localStorageGetBool(SHOW_ARCHIVED_TICKETS) ?? false,
  setShowArchivedTickets: (showArchivedTickets: boolean) => {
    set({ showArchivedTickets });
    localStorageSetBool(SHOW_ARCHIVED_TICKETS, showArchivedTickets);
  },
}));
