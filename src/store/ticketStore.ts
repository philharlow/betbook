import create from 'zustand'
import { localStorageGet, localStorageSet } from '../LocalStorageManager';
import { fetchTicketStatus } from '../ticketApi';

export enum TicketStatus {
	Unknown = "Updating",
	Error = "Error",
	Opened = "Opened",
	Lost = "Lost",
	Draw = "Draw",
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
	ticketNumber: string;
	status: TicketStatus;
	sportsbook: string;
	archived?: boolean;
	refreshing: boolean;
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
	calculated: {
		TicketCost: number;
		ToPay: number;
		ToWin: number;
		TotalOdds: number;
		Title: String;
		SubTitle: String;
		EventDate: Date;
		TimePeriod: TimePeriod;
	};
}

export interface SelectionResult {
	EventDate: string;
	EventName: string;
	EventTypeName: string;
	LineTypeName: string;
	Odds: string;
	MatchScore1: string;
	MatchScore2: string;
	YourBetPrefix: string;
	Yourbet: string;
	Status: TicketStatus;
	
	// Calculated
	Teams: string[];
	WinningTeam: string;
}

export const getStatusColor = (status: TicketStatus) => {
    if (status === TicketStatus.Opened) return 'orange';
    if (status === TicketStatus.Lost) return 'red';
    if (status === TicketStatus.Won) return 'green';
    if (status === TicketStatus.Draw) return 'lightgrey';
    return 'white';
};

const now = new Date();
export const calculateTicketValues = (ticketResult: TicketResult) => {
	const selections = ticketResult.Selections;
	const firstSelection = selections[0];

	let EventDate = new Date(firstSelection.EventDate);
	const set = new Set();
	for (const selection of selections) {
		const split = selection.Yourbet.split(" - ");
		const eventName = split[0];
		
		if (split.length > 1) selection.WinningTeam = split[1]; // Winning team

		selection.Teams = eventName.split(" vs ");
		selection.Teams.forEach((team) => set.add(team));

		const eventDate = new Date(selection.EventDate);
		if (eventDate < EventDate) EventDate = eventDate;
	}
	const SubTitle = Array.from(set.values()).join(", ");

	let Title = firstSelection.YourBetPrefix;
	if(selections.length > 1) Title = `Parlay (${selections.length} pick)`;

	let timePeriod = now > EventDate ? TimePeriod.Past : TimePeriod.Future;
	if (timePeriod === TimePeriod.Past && ticketResult.Status === TicketStatus.Opened)
		timePeriod = TimePeriod.Current;
	
	ticketResult.calculated = {
		Title,
		SubTitle,
		EventDate,
		TimePeriod: timePeriod,
		TicketCost: parseFloat(ticketResult.TicketCost),
		ToPay: parseFloat(ticketResult.ToPay),
		ToWin: parseFloat(ticketResult.ToWin),
		TotalOdds: parseFloat(ticketResult.TotalOdds),
		
	};
};

interface TicketState {
	tickets: TicketRecord[];
	setTickets: (tickets: TicketRecord[]) => void;
	updateTicket: (ticket: TicketRecord) => void;
	removeTicket: (ticketNumber: string) => void;
	archiveTicket: (ticketNumber: string, archived?: boolean) => void;
}

export const fetchUpdatedTicket = async (ticket: TicketRecord) => {
	ticket.refreshing = true;
	console.log('fetching ticket', ticket.ticketNumber);
	const newTicket = await fetchTicketStatus(ticket.ticketNumber);
	console.log("ticket response", newTicket?.ticketResult);
	if (newTicket) useTicketState.getState().updateTicket(newTicket);
};

const getTicketsFromStorage = () => {
	const ticketsStr = localStorageGet(TICKETS_KEY);
	if (!ticketsStr) return [];
	const tickets = JSON.parse(ticketsStr) as TicketRecord[];
	for (const ticket of tickets) {
		if (typeof ticket.ticketNumber === "number") ticket.ticketNumber = `${ticket.ticketNumber}`;
		if (!ticket.archived) {
			ticket.refreshing = true;
			if (ticket.ticketResult) calculateTicketValues(ticket.ticketResult);
		}
	}
	
	// Fetch updates
	setTimeout(() => tickets.forEach(fetchUpdatedTicket), 1);

	return tickets;
}

export const useTicketState = create<TicketState>((set, get) => ({
	tickets: getTicketsFromStorage(),
	setTickets: (tickets: TicketRecord[]) => {
		localStorageSet(TICKETS_KEY, JSON.stringify(tickets));
		set({ tickets });
	},
	updateTicket: (ticket: TicketRecord) => {
		const tickets = [...get().tickets];
		const existingTicket = tickets.find((t) => t.ticketNumber === ticket.ticketNumber);
		if (existingTicket) {
			Object.assign(existingTicket, ticket);
		}
		else tickets.push(ticket);
		tickets.sort((a, b) => a.ticketResult && b.ticketResult ? a.ticketResult.calculated.EventDate.getDate() - b.ticketResult.calculated.EventDate.getDate() : 0);

		get().setTickets(tickets);
	},
	removeTicket: (ticketNumber: string) => {
		const tickets = [...get().tickets].filter((t) => t.ticketNumber !== ticketNumber);
		
		get().setTickets(tickets);
	},
	archiveTicket: (ticketNumber: string, archived = true) => {
		const tickets = [...get().tickets];
		const ticket = tickets.find((ticket) => ticket.ticketNumber === ticketNumber);
		if (ticket) ticket.archived = archived;
		
		get().setTickets(tickets);
	},
}));
