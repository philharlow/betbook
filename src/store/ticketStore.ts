import create from 'zustand'
import { localStorageGet, localStorageSet } from '../LocalStorageManager';

export enum TicketStatus {
	Error = "Error",
	Stale = "Stale",
	Refreshing = "Refreshing",
	Opened = "Opened",
	Lost = "Lost",
	Push = "Push",
	Won = "Won",
}
export const TicketStatuses = Object.values(TicketStatus);

const TICKETS_KEY = "tickets";

export interface TicketRecord {
	ticketNumber: number;
	status: TicketStatus;
	ticketResult?: TicketResult;
}

export interface TicketResult {
	TicketCost: string;
	ToPay: string;
	ToWin: string;
	TotalOdds: string;
	Selections: SelectionResult[];
	Status: TicketStatus;
}

export interface SelectionResult {
	YourBetPrefix: string;
	Yourbet: string;
	Status: TicketStatus;
}

interface TicketState {
	tickets: TicketRecord[];
	updateTicket: (ticket: TicketRecord) => void;
	removeTicket: (ticketNumber: number) => void;
	cameraDialogOpen: boolean;
	toggleCameraDialogOpen: () => void;
}

const getTickets = () => {
	const ticketsStr = localStorageGet(TICKETS_KEY);
	if (!ticketsStr) return [];
	const tickets = JSON.parse(ticketsStr) as TicketRecord[];
	for (const ticket of tickets) ticket.status = TicketStatus.Stale;
	return tickets;
}

export const useTicketState = create<TicketState>((set, get) => ({
	tickets: getTickets(),
	updateTicket: (ticket: TicketRecord) => {
		const tickets = [...get().tickets];
		const existingTicket = tickets.find((t) => t.ticketNumber === ticket.ticketNumber);
		if (existingTicket) {
			Object.assign(existingTicket, ticket);
		}
		else tickets.push(ticket);
		localStorageSet(TICKETS_KEY, JSON.stringify(tickets));
		set({ tickets });
	},
	removeTicket: (ticketNumber: number) => {
		const tickets = [...get().tickets].filter((t) => t.ticketNumber !== ticketNumber);
		localStorageSet(TICKETS_KEY, JSON.stringify(tickets));
		set({ tickets });
	},
	cameraDialogOpen: false,
	toggleCameraDialogOpen: () => {
		set({ cameraDialogOpen: !get().cameraDialogOpen });
	},
}));
