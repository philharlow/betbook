import create from 'zustand'
import { localStorageGet, localStorageSet } from '../LocalStorageManager';
import { fetchTicketStatus } from '../ticketApi';
import { useUIState } from './uiStore';

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

export const isSettled = (status: TicketStatus) => {
	return status === TicketStatus.Won || status === TicketStatus.Lost || status === TicketStatus.Draw;
}

export interface TicketRecord {
	ticketNumber: string;
	status: TicketStatus;
	sportsbook: string;
	refreshing: boolean;
	ticketResult?: TicketResult;
	
	archived?: boolean;
	manuallyCreated?: boolean;
}

export interface TicketResult {
	BetShopName: string;
	TicketCost: string;
	ToPay: string;
	ToWin: string;
	TotalOdds: string;
	CreatedDate: string;
	ExpireDate: string;
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
		CreatedDate: Date;
		ExpireDate: Date;
		ArchivedDate?: Date;
		searchStrings: string[];
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
	IsTeamSwapEnabled: boolean;
	YourBetPrefix: string;
	Yourbet: string;
	Status: TicketStatus;
	
	// Calculated
	calculated: {
		Teams: string[];
		EventDate: Date;
		TimePeriod: TimePeriod;
	}
}

export const getStatusColor = (status: TicketStatus) => {
    if (status === TicketStatus.Opened) return 'orange';
    if (status === TicketStatus.Lost) return 'red';
    if (status === TicketStatus.Won) return 'green';
    if (status === TicketStatus.Draw) return 'draw';
    return 'white';
};

const getTimePeriod = (eventDate: Date, ticketStatus: TicketStatus) => {
	const now = new Date();
	const timePeriod = now > eventDate ? TimePeriod.Past : TimePeriod.Future;
	if (timePeriod === TimePeriod.Past && ticketStatus === TicketStatus.Opened)
		return TimePeriod.Current;
	return timePeriod;
}

export const sanitizeTicket = (ticketResult: TicketResult) => {
	sanitizeStrings(ticketResult);
};

export const sanitizeStrings = (obj: any) => {
	if (!obj) return;
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === "string") {
			obj[key] = value.replace("−", "-") // Fix "heavy" minus returned from api
		}
		if (typeof value === "object") {
			sanitizeStrings(value);
		}
	}
};

const cleanupTeamPrefix = (team: string) => {
	const split = team.split(" ");
	const prefix = split[0];
	if (prefix.length <= 3 && prefix === prefix.toUpperCase()) {
		return team.substring(prefix.length + 1);
	}
	return team;
}

export const calculateTicketValues = (ticketResult: TicketResult) => {
	const selections = ticketResult.Selections;
	const firstSelection = selections[0];
	const searchStrings: string[] = [];

	let earliestEventDate = new Date(firstSelection.EventDate);
	const allTeams = new Set();
	for (const selection of selections) {
		if (selection.IsTeamSwapEnabled) {
			const temp = selection.MatchScore1;
			selection.MatchScore1 = selection.MatchScore2;
			selection.MatchScore2 = temp;
		}

		let Teams: string[] = [];
		if (selection.EventName.indexOf(" vs ") > -1) Teams.push(...selection.EventName.split(" vs "));
		if (selection.EventName.indexOf(" @ ") > -1) Teams.push(...selection.EventName.split(" @ "));
		Teams = Teams.map((team) => cleanupTeamPrefix(team));
		
		const remove = ["Alternate", "Spread", "Yards"];
		const prefixSplit = selection.YourBetPrefix.replace("Moneyline", "ML").split(" ");
		const yourBetPrefix = prefixSplit.filter(p => !remove.includes(p)).join(" ");
		const yourBet = cleanupTeamPrefix(selection.Yourbet.split(" - ")[1] ?? selection.Yourbet) + " " + yourBetPrefix;
		Teams.push(yourBet);
		if (selections.length > 1) {
			allTeams.add(yourBet);
		} else {
			// Teams.forEach((team) => allTeams.add(team));
		}

		const EventDate = new Date(selection.EventDate);
		if (EventDate < earliestEventDate) earliestEventDate = EventDate;
		const TimePeriod = getTimePeriod(EventDate, ticketResult.Status);
		
		selection.calculated = {
			Teams,
			EventDate,
			TimePeriod,
		}
		searchStrings.push(selection.EventName);
		searchStrings.push(selection.YourBetPrefix);
		searchStrings.push(selection.Yourbet);
		searchStrings.push(...Teams);
	}
	const SubTitle = Array.from(allTeams.values()).join(", ");
	searchStrings.push(SubTitle);

	const yourBet = cleanupTeamPrefix(firstSelection.Yourbet.split(" - ")[1] ?? firstSelection.Yourbet);
	let Title = firstSelection.YourBetPrefix + " - " + yourBet;
	if(selections.length > 1) Title = `Parlay (${selections.length} pick)`;

	const EventDate = earliestEventDate;
	const TimePeriod = getTimePeriod(EventDate, ticketResult.Status);
	
	ticketResult.calculated = {
		Title,
		SubTitle: SubTitle === yourBet ? "" : SubTitle,
		EventDate,
		TimePeriod,
		TicketCost: parseFloat(ticketResult.TicketCost),
		ToPay: parseFloat(ticketResult.ToPay),
		ToWin: parseFloat(ticketResult.ToWin),
		TotalOdds: parseFloat(ticketResult.TotalOdds),
		CreatedDate: new Date(ticketResult.CreatedDate),
		ExpireDate: new Date(ticketResult.ExpireDate),
		searchStrings: searchStrings.map(s => s.toLowerCase()),
	};
};

interface TicketState {
	tickets: TicketRecord[];
	setTickets: (tickets: TicketRecord[]) => void;
	updateTicket: (ticket: TicketRecord) => void;
	removeTicket: (ticketNumber: string) => void;
	archiveTicket: (ticketNumber: string, archived?: boolean) => void;
	refreshTicket: (ticket: TicketRecord) => void;
	refreshTickets: (filter?: (ticket: TicketRecord) => boolean) => void;
}

// Refresh current tickets on focusing the app
let lastRefreshed = Date.now();
document.addEventListener('visibilitychange', () => {
	if (document.visibilityState !== 'visible') return;
	if (Date.now() - lastRefreshed > 60 * 1000) {
		console.log("focused, refreshing");
		lastRefreshed = Date.now();
		// TODO force tickets to update their own timeperiod, then use that to update
		updateCurrentTickets();
	} else
		console.log("focused too soon", Date.now() - lastRefreshed);
});

export const updateCurrentTickets = () => {
	useTicketState.getState().refreshTickets((ticket) => {
		if (ticket.ticketResult) {
			const newTimePeriod = getTimePeriod(ticket.ticketResult.calculated.EventDate, ticket.status);
			if (newTimePeriod === TimePeriod.Current)
				return true;
		 }
		 return false;
	});
}


export const fetchUpdatedTicket = async (ticketNumber: string) => {
	const ticketState = useTicketState.getState();
	const uiState = useUIState.getState();
	const ticket = ticketState.tickets.find((t) => t.ticketNumber === ticketNumber);
	if (!ticket) return console.warn("fetchUpdatedTicket() Could not find ticket", ticketNumber);

	ticket.refreshing = true;
	uiState.setViewingTicket(ticket);

	console.log('fetching ticket', ticket.ticketNumber);
	const newTicket = await fetchTicketStatus(ticket.ticketNumber);

	console.log("ticket response", newTicket?.ticketResult);
	if (newTicket) {
		useTicketState.getState().updateTicket(newTicket);
	}
};
const sortTickets = (tickets: TicketRecord[]) => {
	tickets.sort((a, b) => a.ticketResult && b.ticketResult ? b.ticketResult.calculated.EventDate.getTime() - a.ticketResult.calculated.EventDate.getTime() : 0);
}

const getTicketsFromStorage = () => {
	const ticketsStr = localStorageGet(TICKETS_KEY);
	if (!ticketsStr) return [];
	const tickets = JSON.parse(ticketsStr) as TicketRecord[];
	for (const ticket of tickets) {
		if (typeof ticket.ticketNumber === "number") ticket.ticketNumber = `${ticket.ticketNumber}`;
		if (ticket.ticketResult) calculateTicketValues(ticket.ticketResult);
	}
	sortTickets(tickets);
	
	// Fetch updates
	setTimeout(() => tickets.forEach((ticket) => {
		// Only update current bets
		if (ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Current)
			fetchUpdatedTicket(ticket.ticketNumber);
	}), 1);

	return tickets;
}

export const useTicketState = create<TicketState>((set, get) => ({
	tickets: getTicketsFromStorage(),
	setTickets: (tickets: TicketRecord[]) => {
		sortTickets(tickets);
		localStorageSet(TICKETS_KEY, JSON.stringify(tickets));
		set({ tickets });
	},
	updateTicket: (ticket: TicketRecord) => {
		const tickets = [...get().tickets];
		const existingTicketIndex = tickets.findIndex((t) => t.ticketNumber === ticket.ticketNumber);
		if (existingTicketIndex > -1) {
			ticket = { ...tickets[existingTicketIndex], ...ticket};
			tickets[existingTicketIndex] = ticket;
		}
		else tickets.push(ticket);

		get().setTickets(tickets);
		
		// TODO fix this, this is bad
		const uiState = useUIState.getState();
		if (uiState.viewingTicket?.ticketNumber === ticket.ticketNumber)
			uiState.setViewingTicket(ticket);
	},
	removeTicket: (ticketNumber: string) => {
		const tickets = [...get().tickets].filter((t) => t.ticketNumber !== ticketNumber);
		
		get().setTickets(tickets);
	},
	archiveTicket: (ticketNumber: string, archived = true) => {
		const existingTicket = get().tickets.find((t) => t.ticketNumber === ticketNumber);
		if (existingTicket) {
			existingTicket.archived = archived;
			get().updateTicket(existingTicket);
		}
	},
	refreshTicket: (ticket: TicketRecord) => {
		fetchUpdatedTicket(ticket.ticketNumber);
	},
	refreshTickets: (filter?: (ticket: TicketRecord) => boolean) => {
		const { tickets,setTickets } = get();
		tickets.forEach((t) => (!filter || filter(t)) && fetchUpdatedTicket(t.ticketNumber));
		setTickets([...tickets]);
	},
}));
