import create from 'zustand'
import { localStorageGet, localStorageSet } from '../LocalStorageManager';
import { fetchTicketStatus } from '../ticketApi';

export enum TicketStatus {
	Error = "Error",
	Refreshing = "Refreshing",
	Opened = "Opened",
	Lost = "Lost",
	Push = "Push",
	Won = "Won",
}
export const TicketStatuses = Object.values(TicketStatus);

const TICKETS_KEY = "tickets";

export enum TimePeriod {
	Past = "Past",
	Current = "Current",
	Future = "Future"
}

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
	
	// Calculated
	Title: String;
	SubTitle: String;
	EventDate: Date;
	TimePeriod: TimePeriod;
}

export interface SelectionResult {
	EventDate: string;
	EventName: string;
	EventTypeName: string;
	LineTypeName: string;
	Odds: string;
	Score1: string;
	Score2: string;
	YourBetPrefix: string;
	Yourbet: string;
	Status: TicketStatus;
	
	// Calculated
	Team: string;
}

export const getStatusColor = (status: TicketStatus) => {
    if (status === TicketStatus.Opened) return 'orange';
    if (status === TicketStatus.Lost) return 'red';
    if (status === TicketStatus.Won) return 'green';
    if (status === TicketStatus.Push) return 'white';
    if (status === TicketStatus.Refreshing) return 'lightgrey';
    return 'white';
};

const now = new Date();
export const calculateTicketValues = (ticketResult: TicketResult) => {
	const selections = ticketResult.Selections;
	const firstSelection = selections[0];

	ticketResult.Title = firstSelection.YourBetPrefix;
	if(selections.length > 1) ticketResult.Title = `Parlay (${selections.length} pick)`;
	ticketResult.EventDate = new Date(firstSelection.EventDate);

	ticketResult.TimePeriod = now > ticketResult.EventDate ? TimePeriod.Past : TimePeriod.Future;
	if (ticketResult.TimePeriod === TimePeriod.Past && ticketResult.Status === TicketStatus.Opened)
		ticketResult.TimePeriod = TimePeriod.Current;

	const set = new Set();
	for (const selection of selections) {
		const split = selection.Yourbet.split(" - ");
		const eventName = split[0];
		if (split.length > 1) selection.Team = split[1]; // Winning team
		const teams = eventName.split(" vs ");
		teams.forEach((team) => set.add(team));	
	}
	ticketResult.SubTitle = Array.from(set.values()).join(", ");
};

interface TicketState {
	tickets: TicketRecord[];
	updateTicket: (ticket: TicketRecord) => void;
	removeTicket: (ticketNumber: number) => void;
}

export const fetchUpdatedTicket = async (ticket: TicketRecord) => {
	console.log('fetching ticket', ticket.ticketNumber);
	const newTicket = await fetchTicketStatus(ticket.ticketNumber);
	console.log("ticket response", newTicket?.ticketResult);
	if (newTicket) useTicketState.getState().updateTicket(newTicket);
};

const getTickets = () => {
	const ticketsStr = localStorageGet(TICKETS_KEY);
	if (!ticketsStr) return [];
	const tickets = JSON.parse(ticketsStr) as TicketRecord[];
	for (const ticket of tickets) {
		ticket.status = TicketStatus.Refreshing;
		if (ticket.ticketResult) calculateTicketValues(ticket.ticketResult);
	}
	
	// Fetch updates
	setTimeout(() => tickets.forEach(fetchUpdatedTicket), 1);

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
		tickets.sort((a, b) => a.ticketResult && b.ticketResult ? a.ticketResult.EventDate.getDate() - b.ticketResult.EventDate.getDate() : 0)
		set({ tickets });
	},
	removeTicket: (ticketNumber: number) => {
		const tickets = [...get().tickets].filter((t) => t.ticketNumber !== ticketNumber);
		console.log(tickets);
		localStorageSet(TICKETS_KEY, JSON.stringify(tickets));
		set({ tickets });
	},
}));
