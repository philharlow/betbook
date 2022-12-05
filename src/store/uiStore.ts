import create from 'zustand'
import { TicketRecord } from './ticketStore';

export enum FilterLevel {
	All = "All",
	Open = "Open",
	Settled = "Settled",
	Won = "Won",
	Lost = "Lost",
}
export const FilterLevels = Object.values(FilterLevel);

interface UIState {
	viewingTicket?: TicketRecord;
	setViewingTicket: (viewingTicket?: TicketRecord) => void;
	filterLevel: FilterLevel;
	setFilterLevel: (filterLevel: FilterLevel) => void;
	addTicketModalOpen: boolean;
	setAddTicketModalOpen: (addTicketModalOpen: boolean) => void;
	toggleAddTicketModalOpen: () => void;
}

export const useUIState = create<UIState>((set, get) => ({
	viewingTicket: undefined,
	setViewingTicket: (viewingTicket?: TicketRecord) => {
		set({ viewingTicket });
	},
	filterLevel: FilterLevel.All,
	setFilterLevel: (filterLevel: FilterLevel) => {
		set({filterLevel});
	},
	addTicketModalOpen: false,
	setAddTicketModalOpen: (addTicketModalOpen: boolean) => {
		set({ addTicketModalOpen });
	},
	toggleAddTicketModalOpen: () => {
		set({ addTicketModalOpen: !get().addTicketModalOpen });
	},
}));
