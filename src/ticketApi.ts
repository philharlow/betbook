import {
  calculateTicketValues,
  sanitizeTicket,
  TicketRecord,
  DraftkingsTicketResult,
  TicketStatus,
  TicketStatuses,
} from "./store/ticketStore";
import { useToastState } from "./store/toastStore";

// cors-anywhere router to get around api's cors restrictions
// https://github.com/Rob--W/cors-anywhere
const corsRouter = process.env.REACT_APP_CORS_ROUTER;
// Draftkings ticket api endpoint
const ticketDetailsEndpoint =
  "https://cashier-dkuswaretail-ticket-details.draftkings.com/async/ticketdetails.ashx/GetPublicTicket";
//"https://cashier-dkuswaretail-ticket-details.sbtech.com/async/ticketdetails.ashx/GetPublicTicket";
const request: RequestInit = { headers: { requesttarget: "AJAXService" } };

export const fetchTicketStatus = async (ticketNumber: string) => {
  const url = `${corsRouter}${ticketDetailsEndpoint}?barcode=${ticketNumber}`;
  const response = await fetch(url, request).catch((e) =>
    useToastState.getState().showToast("Failed to update ticket")
  );
  if (response) {
    const responseJson = await response.json();
    const ticket = parseTicket(ticketNumber, responseJson);
    return ticket;
  }
};

const parseTicket = (
  ticketNumber: string,
  ticketResult: DraftkingsTicketResult
) => {
  if (ticketResult.ToPay) {
    sanitizeTicket(ticketResult);

    // Update calculated values
    calculateTicketValues(ticketResult);

    const ticket: TicketRecord = {
      ticketNumber,
      sportsbook: "DraftKings", // TODO
      status: getStatus(ticketResult),
      ticketResult,
      refreshing: false,
    };
    return ticket;
  } else {
    console.error("failed to parse ticket", ticketResult, ticketNumber);
  }
};

const getStatus = (ticketResult: DraftkingsTicketResult) => {
  if (TicketStatuses.includes(ticketResult.Status)) return ticketResult.Status;
  return TicketStatus.Error;
};
