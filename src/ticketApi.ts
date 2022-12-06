import { calculateTicketValues, TicketRecord, TicketResult, TicketStatus, TicketStatuses } from "./store/ticketStore";

const corsRouter = "https://sfs-cors.herokuapp.com/";
const ticketDetailsEndpoint = "https://cashier-dkuswaretail-ticket-details.sbtech.com/async/ticketdetails.ashx/GetPublicTicket";
const request: RequestInit = { headers: { "requesttarget": "AJAXService" } };

export const fetchTicketStatus = async (ticketNumber: string) => {
	const url = `${corsRouter}${ticketDetailsEndpoint}?barcode=${ticketNumber}`;
	const response = await fetch(url, request);
	const responseJson = await response.json();
	const ticket = parseTicket(ticketNumber, responseJson);
	return ticket;
};

const parseTicket = (ticketNumber: string, ticketResult: TicketResult) => {
	if (ticketResult.ToPay) {
		// Update calculated values
		calculateTicketValues(ticketResult);

		const ticket: TicketRecord = {
			ticketNumber,
			sportsbook: "draftkings",
			status: getStatus(ticketResult),
			ticketResult,
			refreshing: false,
		}
		return ticket;
	} else {
		console.error("failed to parse ticket", ticketResult, ticketNumber);
	}
};

const getStatus = (ticketResult: TicketResult) => {
	if (TicketStatuses.includes(ticketResult.Status)) return ticketResult.Status;
	return TicketStatus.Error;
};