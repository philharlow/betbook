import {
  BetDetails,
  getStatus,
  EventScores,
  TicketDetails,
  TicketDefinition,
  TicketSource,
  sanitizeString,
} from "./ticketTypes";

// TODOv2 make some common protocol for DraftKingsDataV1 and DraftKingsDataV2
export namespace DraftKingsDataV2 {
  export const isValidTicket = (ticket: TicketDefinition): boolean => {
    if (ticket.dataSource !== TicketSource.DraftKings) return false;
    return ticket.rawData?.bets?.length > 0;
  };

  export const getTicketDetails = (ticketResponse: TicketResponse): TicketDetails => {
    let bets: BetDetails[] = [];
    let searchStrings: String[] = [];

    let earliestEventDate = new Date(ticketResponse.bets[0].events[0].eventDate);
    let latestEventDate = new Date(ticketResponse.bets[0].events[0].eventDate);

    for (let bet of ticketResponse.bets) {
      for (let event of bet.events) {
        for (let group of event.selectionsGroups) {
          for (let selection of group.selections) {
            let betDetails = {
              betName: sanitizeString(selection.selectionName),
              eventName: sanitizeString(event.eventName),
              betType: sanitizeString(selection.marketName),
              eventDate: new Date(event.eventDate),
              odds: Number(selection.selectionOdds),
              scores: getEventScores(event),
              status: getStatus(selection.selectionStatus),
            };
            bets.push(betDetails);

            searchStrings.concat([event.team1Name, event.team1Name]);
            if (betDetails.eventDate < earliestEventDate) {
              earliestEventDate = betDetails.eventDate;
            }
            if (betDetails.eventDate > latestEventDate) {
              latestEventDate = betDetails.eventDate;
            }
          }
        }
      }
    }

    let searchStringSet = new Set<String>(searchStrings);

    let ticket: TicketDetails = {
      wager: ticketResponse.ticketCost,
      toWin: ticketResponse.toWinAmount,
      toPay: ticketResponse.toPayAmount,
      totalOdds: Number(ticketResponse.totalOdds),
      bets: bets,
      betEventsStartDate: earliestEventDate,
      betEventsEndDate: latestEventDate,
      expiresDate: new Date(ticketResponse.expireDate),
      searchStrings: Array.from(searchStringSet, (s) => s.toLowerCase()),
      betshopName: ticketResponse.betshopName,
      status: getStatus(ticketResponse.ticketStatus),
    };
    return ticket;
  };

  const getEventScores = ({ team1Name, settleScore, team2Name }: Event): EventScores | undefined => {
    if (settleScore) {
      return { teamA: team1Name, scoreA: settleScore.homeScore, teamB: team2Name, scoreB: settleScore.awayScore };
    }
  };

  export interface TicketResponse {
    ticketId: string;
    ticketCost: number;
    displayTicketCost: string;
    ticketStatus: string;
    ticketStatusId: number;
    totalOdds: string;
    totalOddsDecimal: number;
    toWinAmount: number;
    displayToWinAmount: string;
    toPayAmount: number;
    displayToPayAmount: string;
    paidAmount: number;
    displayPaidAmount: string;
    placedDate: string;
    settleDate: string;
    paidDate: any;
    paidBy: any;
    displayPaidBy: string;
    expireDate: string;
    wasPaid: boolean;
    canCalculateToWin: boolean;
    canPayWin: boolean;
    canRefund: boolean;
    canCashOut: boolean;
    canReprint: boolean;
    canCancel: boolean;
    isCanceled: boolean;
    isExpired: boolean;
    cancelActiveSeconds: number;
    isEnabledPayoutPin: boolean;
    siteId: number;
    betshopName: string;
    issuerId: number;
    issuerType: string;
    issuerName: string;
    ticketExpPeriod: number;
    bets: Bet[];
  }

  interface Bet {
    betId: string;
    betStatus: string;
    betStatusId: number;
    betName: string;
    betType: string;
    betTypeId: number;
    betOdds: string;
    betStake: number;
    displayBetStake: string;
    toPayAmount: number;
    displayToPayAmount: string;
    paidAmount: number;
    displayPaidAmount: string;
    additionalData: any;
    numberOfBets: number;
    events: Event[];
  }

  interface Event {
    eventId: number;
    displayEventId: string;
    fullEventId: number;
    eventName: string;
    eventDate: string;
    isLive: boolean;
    isInProgress: boolean;
    isTeamSport: boolean;
    isTeamSwap: boolean;
    team1Id: number;
    team2Id: number;
    team1Name: string;
    team2Name: string;
    sportId: number;
    sportName: string;
    leagueId: number;
    leagueName: string;
    eventTypeId: number;
    lineTypeId: number;
    rowTypeId: number;
    gameData: GameData;
    settleScore: Score;
    selectionsGroups: SelectionsGroup[];
  }

  interface Score {
    homeScore: string;
    awayScore: string;
  }

  interface GameData {
    eventScore: any;
    liveGameState: any;
    score: any;
    eventScorecard: any;
  }

  interface SelectionsGroup {
    groupName: string;
    groupType: string;
    groupTypeId: number;
    groupStatus: string;
    groupStatusId: number;
    groupOdds: string;
    selections: Selection[];
  }

  interface Selection {
    selectionId: number;
    encodedLineId: string;
    selectionName: string;
    selectionStatus: string;
    selectionStatusId: number;
    selectionOdds: string;
    marketId: string;
    marketName: string;
    marketBlurb: string;
    isSettled: boolean;
    isCanceled: boolean;
    isOutright: boolean;
    cancelReason: string;
    copySelectionData: CopySelectionData;
  }

  interface CopySelectionData {}
}
