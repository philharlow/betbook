import create from "zustand";
import {
  localStorageGet,
  localStorageGetBool,
  localStorageSet,
  localStorageSetBool,
} from "../LocalStorageManager";
import { TicketDefinition } from "../data/ticketTypes";

export enum StatusFilter {
  All = "All",
  Open = "Open",
  Settled = "Settled",
  Won = "Won",
  Lost = "Lost",
}
export const StatusFilters = Object.values(StatusFilter);

const STATUS_FILTER_KEY = "STATUS_FILTER";
const SHOW_ARCHIVED_TICKETS_KEY = "SHOW_ARCHIVED_TICKETS";
const STARTING_BALANCE_KEY = "STARTING_BALANCE";
const SHOW_BALANCE_KEY = "SHOW_BALANCE";
const USER_NAME_KEY = "USER_NAME";

export enum Modal {
  None,
  AddTicket,
  ManuallyAddTicket,
}

interface UIState {
  viewingBarcode?: TicketDefinition;
  setViewingBarcode: (viewingBarcode?: TicketDefinition) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (statusFilter: StatusFilter) => void;
  modalOpen?: Modal;
  setModalOpen: (modal?: Modal) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  showArchivedTickets: boolean;
  setShowArchivedTickets: (showArchivedTickets: boolean) => void;
  showBalance: boolean;
  setShowBalance: (showBalance: boolean) => void;
  startingBalance: number;
  setStartingBalance: (startingBalance: number) => void;
  userName: string;
  setUserName: (userName: string) => void;
}

export const useUIState = create<UIState>((set, get) => ({
  viewingBarcode: undefined,
  setViewingBarcode: (viewingBarcode?: TicketDefinition) => {
    set({ viewingBarcode });
  },
  statusFilter: localStorageGet(STATUS_FILTER_KEY)
    ? (localStorageGet(STATUS_FILTER_KEY) as StatusFilter)
    : StatusFilter.All,
  setStatusFilter: (statusFilter: StatusFilter) => {
    set({ statusFilter });
    localStorageSet(STATUS_FILTER_KEY, statusFilter);
  },
  modalOpen: undefined,
  setModalOpen: (modalOpen?: Modal) => {
    set({ modalOpen });
  },
  searchQuery: "",
  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },
  showArchivedTickets: localStorageGetBool(SHOW_ARCHIVED_TICKETS_KEY) ?? false,
  setShowArchivedTickets: (showArchivedTickets: boolean) => {
    set({ showArchivedTickets });
    localStorageSetBool(SHOW_ARCHIVED_TICKETS_KEY, showArchivedTickets);
  },
  showBalance: localStorageGetBool(SHOW_BALANCE_KEY) ?? true,
  setShowBalance: (showBalance: boolean) => {
    set({ showBalance });
    localStorageSetBool(SHOW_BALANCE_KEY, showBalance);
  },
  startingBalance: Number(localStorageGet(STARTING_BALANCE_KEY) ?? 0),
  setStartingBalance: (startingBalance: number) => {
    set({ startingBalance });
    localStorageSet(STARTING_BALANCE_KEY, ""+startingBalance);
  },
  userName: localStorageGet(USER_NAME_KEY) ?? "User",
  setUserName: (userName: string) => {
    set({ userName });
    localStorageSet(USER_NAME_KEY, userName);
  },
}));
