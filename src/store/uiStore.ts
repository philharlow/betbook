import create from 'zustand'
import { localStorageGet, localStorageGetBool, localStorageSet, localStorageSetBool } from '../LocalStorageManager';
import { TicketRecord, useTicketState } from './ticketStore';

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

interface UIState {
	viewingTicket?: TicketRecord;
	setViewingTicket: (viewingTicket?: TicketRecord) => void;
	setViewingTicketNumber: (ticketNumber?: string) => void;
	viewingBarcode?: TicketRecord;
	setViewingBarcode: (viewingBarcode?: TicketRecord) => void;
	filterLevel: FilterLevel;
	setFilterLevel: (filterLevel: FilterLevel) => void;
	addTicketModalOpen: boolean;
	setAddTicketModalOpen: (addTicketModalOpen: boolean) => void;
	manuallyAddTicketModalOpen: boolean;
	setManuallyAddTicketModalOpen: (manuallyAddTicketModalOpen: boolean) => void;
	toggleAddTicketModalOpen: () => void;
	statsModalOpen: boolean;
	setStatsModalOpen: (statsModalOpen: boolean) => void;
	settingsModalOpen: boolean;
	setSettingsModalOpen: (settingsModalOpen: boolean) => void;
	menuOpen: boolean;
	setMenuOpen: (menuOpen: boolean) => void;
	searchModalOpen: boolean;
	setSearchModalOpen: (searchModalOpen: boolean) => void;
	searchQuery: string;
	setSearchQuery: (searchQuery: string) => void;
	showArchivedTickets: boolean;
	setShowArchivedTickets: (showArchivedTickets: boolean) => void;
}

export const useUIState = create<UIState>((set, get) => ({
	viewingTicket: undefined,
	setViewingTicket: (viewingTicket?: TicketRecord) => {
		if (viewingTicket) viewingTicket = { ...viewingTicket };
		set({ viewingTicket });
	},
	setViewingTicketNumber: (ticketNumber?: string) => {
		const viewingTicket = useTicketState.getState().tickets.find((t) => t.ticketNumber === ticketNumber);
		set({ viewingTicket });
	},
	viewingBarcode: undefined,
	setViewingBarcode: (viewingBarcode?: TicketRecord) => {
		set({ viewingBarcode });
	},
	filterLevel: localStorageGet(FILTER_LEVEL) ? localStorageGet(FILTER_LEVEL) as FilterLevel : FilterLevel.All,
	setFilterLevel: (filterLevel: FilterLevel) => {
		set({filterLevel});
		localStorageSet(FILTER_LEVEL, filterLevel);
	},
	addTicketModalOpen: false,
	setAddTicketModalOpen: (addTicketModalOpen: boolean) => {
		set({ addTicketModalOpen });
	},
	manuallyAddTicketModalOpen: false,
	setManuallyAddTicketModalOpen: (manuallyAddTicketModalOpen: boolean) => {
		set({ manuallyAddTicketModalOpen });
	},
	toggleAddTicketModalOpen: () => {
		set({ addTicketModalOpen: !get().addTicketModalOpen });
	},
	statsModalOpen: false,
	setStatsModalOpen: (statsModalOpen: boolean) => {
		set({ statsModalOpen });
	},
	settingsModalOpen: false,
	setSettingsModalOpen: (settingsModalOpen: boolean) => {
		set({ settingsModalOpen });
	},
	menuOpen: false,
	setMenuOpen: (menuOpen: boolean) => {
		set({ menuOpen });
	},
	searchModalOpen: false,
	setSearchModalOpen: (searchModalOpen: boolean) => {
		set({ searchModalOpen });
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
