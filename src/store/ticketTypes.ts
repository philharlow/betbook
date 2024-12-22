

export enum TicketStatus {
    Unknown = "Updating",
    Error = "Error",
    Opened = "Opened",
    Lost = "Lost",
    Draw = "Draw",
    Won = "Won",
  }
  export const TicketStatuses = Object.values(TicketStatus);
  export const getStatus = (status: string) => {
    if (TicketStatuses.includes(status as TicketStatus))
      return status as TicketStatus;
    return TicketStatus.Error;
  };
  
  export const TICKETS_KEY = "tickets";
  
  export enum TimePeriod {
    Past = "Past",
    Current = "Current",
    Future = "Future",
  }
  
  export const isSettled = (status: TicketStatus) => {
    return (
      status === TicketStatus.Won ||
      status === TicketStatus.Lost ||
      status === TicketStatus.Draw
    );
  };
  
  // TODONOW remove
  export interface TicketRecordOld {
    ticketNumber: string;
    status: TicketStatus;
    sportsbook: string;
    refreshing: boolean;
    ticketResult?: DraftkingsTicketResultOld;
  
    archived?: boolean;
    manuallyCreated?: TicketResultOld;
  }
  
  // TODONOW remove
  export interface TicketResultOld {
    TicketCost: number;
    ToPay: number;
    ToWin: number;
    TotalOdds: number;
    Title: string;
    SubTitle: string;
    EventDate: Date;
    TimePeriod: TimePeriod;
    CreatedDate: Date;
    ExpireDate: Date;
    ArchivedDate?: Date;
    searchStrings: string[];
  }
  
  enum TicketSource {
    Manual,
    DraftKingsV1,
    DraftKingsV2,
  }
  
  export interface TicketDefinition {
    ticketNumber: string;
    ticketDetails: TicketDetails;
  
    archivedDate?: Date;
  
    source: TicketSource;
    rawResponse: any;
  
    refreshing: boolean;
    version: string;
  }
  
  export interface TicketDetails {
    title: string;
    subTitle: string;
    status: TicketStatus;
  
    wager: number;
    toWin: number;
    toPay: number;
  
    totalOdds: number;
  
    bets: BetDetails[];
  
    betshopName: string;
    createdDate: Date;
    expiresDate: Date;
  
    searchStrings: string[];
  }
  
  export interface BetDetails {
    title: string;
    subTitle: string;
    status: TicketStatus;
  
    lineType: string;
    eventDate: Date;
  
    odds: number;
  
    scores?: Scores;
  }
  
  export interface Scores {
    teamA: string;
    scoreA: string;
  
    teamB: string;
    scoreB: string;
  }
  
  // TODONOW remove
  export interface DraftkingsTicketResultOld {
    BetShopName: string;
    TicketCost: string;
    ToPay: string;
    ToWin: string;
    TotalOdds: string;
    CreatedDate: string;
    ExpireDate: string;
    Selections: SelectionResultOld[];
    Status: TicketStatus;
  
    // Calculated
    calculated: TicketResultOld;
  }
  
  export interface DraftkingsDataOld {
    BetShopName: string;
    TicketCost: string;
    ToPay: string;
    ToWin: string;
    TotalOdds: string;
    CreatedDate: string;
    ExpireDate: string;
    Selections: SelectionResultOld[];
    Status: TicketStatus;
  }
  
  namespace DraftKingsDataV1 {
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
      Selections: Selection2[];
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
  
    export interface Selection2 {
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
      calculated: Calculated;
    }
  
    export interface Calculated {
      Teams: any[];
      EventDate: string;
      TimePeriod: string;
    }
  }
  
  namespace DraftKingsDataV2 {
    export const getTicketResult = (ticketResponse: TicketResponse) => {
      let bets: BetDetails[] = [];
      let searchStrings: String[] = [];
  
      for(let bet of ticketResponse.bets) {
        for(let event of bet.events) {
          for(let group of event.selectionsGroups) {
            for(let selection of group.selections) {
              bets.push({
                title: event.eventName,
                subTitle: selection.selectionName,
                lineType: selection.marketName,
                eventDate: new Date(event.eventDate),
                odds: Number(selection.selectionOdds),
                scores: {
                  teamA: event.team1Name,
                  scoreA: event.settleScore?.team1Score,
                  teamB: event.team2Name,
                  scoreB: event.settleScore?.team2Score
                },
                status: getStatus(selection.selectionStatus)
              });
  
              searchStrings.concat([event.team1Name, event.team1Name])
            };
          };
        };
      };
      
      let title = "";
      let subTitle = "";
  
      let searchStringSet = new Set<String>(searchStrings);
  
      let ticket: TicketDetails = {
        title: title,
        subTitle: subTitle,
        wager: ticketResponse.ticketCost,
        toWin: ticketResponse.toWinAmount,
        toPay: ticketResponse.toPayAmount,
        totalOdds: Number(ticketResponse.totalOdds),
        bets: bets,
        createdDate: new Date(ticketResponse.placedDate),
        expiresDate: new Date(ticketResponse.expireDate),
        searchStrings: Array.from(searchStringSet, s => s.toLowerCase()),
        betshopName: ticketResponse.betshopName,
        status: getStatus(ticketResponse.ticketStatus)
      };
      return ticket;
    }
  
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
  
    export interface Bet {
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
  
    export interface Event {
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
      settleScore: any;
      selectionsGroups: SelectionsGroup[];
    }
  
    export interface GameData {
      eventScore: any;
      liveGameState: any;
      score: any;
      eventScorecard: any;
    }
  
    export interface SelectionsGroup {
      groupName: string;
      groupType: string;
      groupTypeId: number;
      groupStatus: string;
      groupStatusId: number;
      groupOdds: string;
      selections: Selection[];
    }
  
    export interface Selection {
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
  
    export interface CopySelectionData {}
  }
  
  export interface SelectionResultOld {
    EventDate: string;
    EventName: string;
    EventTypeName: string;
    LineTypeName: string;
    LeagueName: string;
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
    };
  }
  