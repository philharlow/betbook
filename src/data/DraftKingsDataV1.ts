import { BetDetails, getStatus, TicketDefinition, TicketDetails, TicketSource, EventScores, sanitizeString, getTeams } from "./ticketTypes";

// TODOv2 make some common protocol for DraftKingsDataV1 and DraftKingsDataV2
export namespace DraftKingsDataV1 {
  export const isValidTicket = (ticket: TicketDefinition): boolean => {
    if (ticket.dataSource !== TicketSource.DraftKings) return false;
    return ticket.rawData?.ticketResult?.Selections?.length > 0;
  }

  export const getTicketDefinition = (ticketResponse: TicketResponse): TicketDefinition => {
    let ticketDetails = getTicketDetails(ticketResponse);
    let ticket: TicketDefinition = {
      ticketNumber: ticketResponse.ticketNumber,
      dataSource: TicketSource.DraftKings,
      createdDate: new Date(ticketResponse.ticketResult.CreatedDate),
      refreshing: ticketResponse.refreshing,
      ticketDetails: ticketDetails,
      rawData: ticketResponse,
      archivedDate: ticketResponse.archived ? new Date() : undefined
    };
    return ticket;
  }

  export const getTicketDetails = (ticketResponse: TicketResponse): TicketDetails => {
    let bets: BetDetails[] = [];
    let searchStrings: String[] = [ticketResponse.ticketNumber];
    let earliestEventDate = new Date(ticketResponse.ticketResult.Selections[0].EventDate);
    let latestEventDate = new Date(ticketResponse.ticketResult.Selections[0].EventDate);

    for(let selection of ticketResponse.ticketResult.Selections) {
      let betName = selection.Yourbet;
      let eventName = selection.EventName;
      betName = betName.replace(eventName + " - ", "");

      let betType = selection.EventTypeName;
      if (betType === eventName) betType = selection.LineTypeName;

      let teams = getTeams(selection.EventName);

      let betDetails: BetDetails = {
        betName: sanitizeString(betName),
        eventName: sanitizeString(eventName),
        betType: sanitizeString(betType),
        eventDate: new Date(selection.EventDate),
        odds: Number(selection.Odds),
        scores: getEventScores(teams, selection),
        status: getStatus(selection.Status)
      };
      bets.push(betDetails);

      searchStrings.push(selection.EventName);
      searchStrings.push(selection.YourBetPrefix);
      searchStrings.push(selection.Yourbet);
      searchStrings.push(selection.LeagueName);
      searchStrings.push(...teams);

      if (betDetails.eventDate < earliestEventDate) { earliestEventDate = betDetails.eventDate; }
      if (betDetails.eventDate > latestEventDate) { latestEventDate = betDetails.eventDate; }
    };

    let searchStringSet = new Set<String>(searchStrings);
    let wager = Number(ticketResponse.ticketResult.TicketCost);
    let totalOdds = Number(ticketResponse.ticketResult.TotalOdds);
    const getOddsAsRatio = (odds: number) => {
      if (odds < 0) return 100 / -odds;
      return odds / 100;
    }
    let toWin = Number(ticketResponse.ticketResult.ToPay) || wager * getOddsAsRatio(totalOdds);
    let toPay = wager + toWin;

    let ticket: TicketDetails = {
      wager,
      toWin,
      toPay,
      totalOdds,
      bets,
      betEventsStartDate: earliestEventDate,
      betEventsEndDate: latestEventDate,
      expiresDate: new Date(ticketResponse.ticketResult.ExpireDate),
      searchStrings: Array.from(searchStringSet, s => s.toLowerCase()),
      betshopName: ticketResponse.ticketResult.BetShopName,
      status: getStatus(ticketResponse.ticketResult.Status)
    };
    return ticket;
  }
  
  const getEventScores = (teams: string[], selection: Selection): EventScores | undefined => {
    if (selection.MatchScore1 && teams[0]) {
      return { teamA: teams[0], scoreA: selection.MatchScore1, teamB: teams[1], scoreB: selection.MatchScore2 };
    }
  }

  export interface TicketResponse {
    ticketNumber: string;
    sportsbook: string;
    status: string;
    refreshing: boolean;
    ticketResult: TicketResult;
    archived: boolean;
  }

  export interface TicketResult {
    BetShopName: string;
    BetsInformation: BetsInformation[];
    CanCalculateToWin: number;
    CanCancel: number;
    CanCashOut: number;
    CancelActiveSeconds: number;
    CanceledByType: number;
    CanPayWin: number;
    CanRefund: number;
    CanReprint: number;
    CreatedDate: string;
    CurrencyCode: string;
    ExpireDate: string;
    ExtraWin: string;
    GroupedSelections: GroupedSelection[];
    HasOpenEvents: number;
    IsCanceled: number;
    IsCasino: number;
    IsExpired: number;
    IsFreeBet: number;
    IsLive: number;
    IsPrinted: number;
    IssuerId: string;
    IssuerType: string;
    IsYourBet: number;
    NumberOfBets: number;
    PaidAmmount: string;
    PaidBy: string;
    PurchaseDate: string;
    Selections: Selection[];
    SettleDate: string;
    Stake: string;
    StakePerBet: string;
    StakeTaxAmount: string;
    StakeTaxPercent: number;
    Status: string;
    StatusModified: string;
    TicketCost: string;
    TicketId: string;
    ToPay: string;
    TotalOdds: string;
    ToWin: string;
    WaitingBetID: string;
    WasPaid: number;
    WinTaxAmount: string;
    WinTaxPercent: number;
  }

  export interface BetsInformation {
    BetName: string;
    BetType: number;
    BetTypeId: number;
    HasSgpSelection: number;
    NumberOfBets: number;
  }

  export interface GroupedSelection {
    ClientOdds: string;
    IsProgressiveParlayGroup: number;
    IsSgpGroup: number;
    Selections: Selection[];
  }

  export interface Selection {
    BranchId: number;
    CountryName: string;
    EventDate: string;
    EventId: string;
    EventName: string;
    EventTime: string;
    EventTypeID: number;
    EventTypeName: string;
    IsBanker: number;
    IsLive: number;
    IsOutright: number;
    IsTeamSwapEnabled: number;
    LeagueName: string;
    LineTypeID: number;
    LineTypeName: string;
    MarketBlurbId: string;
    MarketBlurbText: string;
    MatchScore1: string;
    MatchScore2: string;
    Odds: string;
    Results: any;
    RowTypeID: number;
    Score1: string;
    Score2: string;
    Status: string;
    TeamMappingID: number;
    Yourbet: string;
    YourBetPrefix: string;
  }

  export interface Calculated {
    Teams: any[];
    EventDate: string;
    TimePeriod: string;
  }
}
