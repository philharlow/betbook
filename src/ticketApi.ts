import {
  calculateTicketValues,
  sanitizeTicket,
  TicketRecordOld,
  DraftkingsTicketResultOld,
  TicketStatus,
  TicketStatuses,
  SelectionResult,
} from "./store/ticketStore";
import { useToastState } from "./store/toastStore";

// cors-anywhere router to get around api's cors restrictions
// https://github.com/Rob--W/cors-anywhere
const corsRouter = process.env.REACT_APP_CORS_ROUTER;
// Draftkings ticket api endpoint
const ticketDetailsEndpoint =
  "https://cashier-dkuswaretail-ticket-details.draftkings.com/api/tickets/";
// "https://cashier-dkuswaretail-ticket-details.draftkings.com/async/ticketdetails.ashx/GetPublicTicket";
//"https://cashier-dkuswaretail-ticket-details.sbtech.com/async/ticketdetails.ashx/GetPublicTicket";
const request: RequestInit = { headers: { requesttarget: "AJAXService" } };

export const fetchTicketStatus = async (ticketNumber: string) => {
  const url = `${corsRouter}${ticketDetailsEndpoint}${ticketNumber}`;
  const response = await fetch(url, request).catch((e) =>
    useToastState.getState().showToast("Failed to update ticket")
  );
  if (response) {
    const responseJson = await response.json();
    // console.log("got response:", responseJson.data);
    const ticket = parseTicket(ticketNumber, responseJson.data);
    return ticket;
  }
};

const parseTicket = (
  ticketNumber: string,
  ticketResult: DraftkingsTicketResultOld
) => {
  if (!ticketResult.ToPay) {
    ticketResult = parseNewTicketData(ticketResult);
  }
  if (ticketResult.ToPay) {
    sanitizeTicket(ticketResult);

    // Update calculated values
    calculateTicketValues(ticketResult);

    const ticket: TicketRecordOld = {
      ticketNumber,
      sportsbook: "DraftKings", // TODO
      status: ticketResult.Status,
      ticketResult,
      refreshing: false,
    };
    return ticket;
  } else {
    console.error("failed to parse ticket", ticketResult, ticketNumber);
  }
};

// Draftkings updated their API around 12/10/2024, this parser handles the new format
function parseNewTicketData(ticket: any): DraftkingsTicketResultOld {
  let selections: SelectionResult[] = [];
  ticket.bets.forEach((bet: any) => {
    bet.events.forEach((event: any) => {
      event.selectionsGroups.forEach((group: any) => {
        group.selections.forEach((selection: any) =>
          selections.push({
            EventDate: event.eventDate,
            EventName: event.eventName,
            EventTypeName: event.sportName,
            LineTypeName:
              selection.marketName || group.groupName || group.groupType,
            LeagueName: event.leagueName,
            Odds: selection.selectionOdds,
            MatchScore1: event.settleScore?.homeScore || "-",
            MatchScore2: event.settleScore?.awayScore || "-",
            IsTeamSwapEnabled: event.isTeamSwap,
            YourBetPrefix: selection.selectionName, // Adjust based on your logic
            Yourbet: `${selection.selectionName}`,
            Status: getStatus(selection.selectionStatus),
          } as SelectionResult)
        );
      });
    });
  });

  let ticketObj = {
    BetShopName: ticket.betshopName,
    TicketCost: ticket.displayTicketCost,
    ToPay: ticket.displayToPayAmount,
    ToWin: ticket.displayToWinAmount,
    TotalOdds: ticket.totalOdds,
    CreatedDate: ticket.placedDate,
    ExpireDate: ticket.expireDate,
    Selections: selections,
    Status: getStatus(ticket.ticketStatus),
  };
  console.log("parseNewTicketData", ticketObj);
  return ticketObj as DraftkingsTicketResultOld;
}

const getStatus = (status: string) => {
  if (TicketStatuses.includes(status as TicketStatus))
    return status as TicketStatus;
  return TicketStatus.Error;
};
