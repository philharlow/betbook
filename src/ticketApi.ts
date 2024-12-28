import { sanitizeResponse } from "./store/ticketStore";
import { useToastState } from "./store/toastStore";

// cors-anywhere router to get around api's cors restrictions
// https://github.com/Rob--W/cors-anywhere
const corsRouter = process.env.REACT_APP_CORS_ROUTER;

// Draftkings ticket api endpoint
const ticketDetailsEndpoint =
  "https://cashier-dkuswaretail-ticket-details.draftkings.com/api/tickets/";
const request: RequestInit = { headers: { requesttarget: "AJAXService" } };

export const fetchTicketData = async (ticketNumber: string) => {
  const url = `${corsRouter}${ticketDetailsEndpoint}${ticketNumber}`;
  const response = await fetch(url, request).catch((e) =>
    useToastState.getState().showToast("Failed to get ticket data")
  );
  if (response) {
    const responseJson = await response.json();
    sanitizeResponse(responseJson.data);
    return responseJson.data;
  }
};
