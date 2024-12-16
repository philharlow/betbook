import create from "zustand";
import { localStorageGet, localStorageSet } from "../LocalStorageManager";
import { fetchTicketStatus } from "../ticketApi";
import { useUIState } from "./uiStore";

export enum TicketStatus {
  Unknown = "Updating",
  Error = "Error",
  Opened = "Opened",
  Lost = "Lost",
  Draw = "Draw",
  Won = "Won",
}
export const TicketStatuses = Object.values(TicketStatus);

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

  dataSource: TicketSource;
  sourceData?: any;

  refreshing: boolean;
  version: string;
}

export interface TicketDetails {
  title: string;
  subTitle: string;

  wager: number;
  toWin: number;
  toPay: number;

  totalOdds: number;

  bets: BetDetails[];

  createdDate: Date;
  expiresDate: Date;

  searchStrings: string[];
}

export interface BetDetails {
  title: string;
  subTitle: string;
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
  Selections: SelectionResult[];
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
  Selections: SelectionResult[];
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

export interface SelectionResult {
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

export const getStatusColor = (status: TicketStatus) => {
  if (status === TicketStatus.Opened) return "orange";
  if (status === TicketStatus.Lost) return "red";
  if (status === TicketStatus.Won) return "green";
  if (status === TicketStatus.Draw) return "draw";
  return "white";
};

const getTimePeriod = (eventDate: Date, ticketStatus: TicketStatus) => {
  const now = new Date();
  const timePeriod = now > eventDate ? TimePeriod.Past : TimePeriod.Future;
  if (timePeriod === TimePeriod.Past && ticketStatus === TicketStatus.Opened)
    return TimePeriod.Current;
  return timePeriod;
};

export const sanitizeTicket = (ticketResult: DraftkingsTicketResultOld) => {
  sanitizeStrings(ticketResult);
};

export const sanitizeStrings = (obj: any) => {
  if (!obj) return;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      obj[key] = value.replace("−", "-"); // Fix "heavy" minus returned from api
      obj[key] = value.replace("$", ""); // Remove any $ signs returned from api
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
};

export const calculateTicketValues = (
  ticketResult: DraftkingsTicketResultOld
) => {
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
    if (selection.EventName.indexOf(" vs ") > -1)
      Teams.push(...selection.EventName.split(" vs "));
    if (selection.EventName.indexOf(" @ ") > -1)
      Teams.push(...selection.EventName.split(" @ "));
    Teams = Teams.map((team) => cleanupTeamPrefix(team));

    const remove = ["Alternate", "Spread", "Yards", "Total"];
    const replace: any = {
      Moneyline: "ML",
      "Touchdown Scorer": "TD",
    };
    let betPrefix = selection.YourBetPrefix;
    // TODO dont be lazy
    Object.entries(replace).forEach(
      ([key, str]) => (betPrefix = betPrefix.replace(key, str as string))
    );
    const prefixSplit = betPrefix.split(" ");
    const yourBetPrefix = prefixSplit
      .filter((p) => !remove.includes(p))
      .join(" ");
    const yourBet =
      cleanupTeamPrefix(
        selection.Yourbet.split(" - ")[1] ?? selection.Yourbet
      ) +
      " " +
      yourBetPrefix;
    // Teams.push(yourBet);
    if (selections.length > 1) {
      allTeams.add(yourBet);
    } else {
      Teams.forEach((team) => allTeams.add(team));
    }

    const EventDate = new Date(selection.EventDate);
    if (EventDate < earliestEventDate) earliestEventDate = EventDate;
    const TimePeriod = getTimePeriod(EventDate, ticketResult.Status);

    selection.calculated = {
      Teams,
      EventDate,
      TimePeriod,
    };
    searchStrings.push(selection.EventName);
    searchStrings.push(selection.YourBetPrefix);
    searchStrings.push(selection.Yourbet);
    searchStrings.push(selection.LeagueName);
    searchStrings.push(...Teams);
  }
  const SubTitle = Array.from(allTeams.values()).join(", ");
  searchStrings.push(SubTitle);

  const yourBet = cleanupTeamPrefix(
    firstSelection.Yourbet.split(" - ")[1] ?? firstSelection.Yourbet
  );
  let Title = firstSelection.YourBetPrefix + " - " + yourBet;
  if (selections.length > 1) Title = `Parlay (${selections.length} pick)`;

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
    searchStrings: searchStrings.map((s) => s.toLowerCase()),
  };
};

export const filterTicketsBySearch = (
  ticket: TicketRecordOld,
  searchValue: string
) => {
  if (searchValue === "") return true;
  if (!ticket.ticketResult) return false;
  searchValue = searchValue.toLowerCase();
  for (const searchString of ticket.ticketResult.calculated.searchStrings) {
    if (searchString.indexOf(searchValue) > -1) return true;
  }
  return false;
};

interface TicketState {
  tickets: TicketRecordOld[];
  setTickets: (tickets: TicketRecordOld[]) => void;
  updateTicket: (ticket: TicketRecordOld) => void;
  removeTicket: (ticketNumber: string) => void;
  archiveTicket: (ticketNumber: string, archived?: boolean) => void;
  refreshTicket: (ticket: TicketRecordOld) => void;
  refreshTickets: (filter?: (ticket: TicketRecordOld) => boolean) => void;
}

// Refresh current tickets on focusing the app
let lastRefreshed = Date.now();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (Date.now() - lastRefreshed > 60 * 1000) {
    console.log("focused, refreshing");
    lastRefreshed = Date.now();
    // TODO force tickets to update their own timeperiod, then use that to update
    updateCurrentTickets();
  } else console.log("focused too soon", Date.now() - lastRefreshed);
});

export const updateCurrentTickets = () => {
  useTicketState.getState().refreshTickets((ticket) => {
    if (ticket.ticketResult) {
      const newTimePeriod = getTimePeriod(
        ticket.ticketResult.calculated.EventDate,
        ticket.status
      );
      if (newTimePeriod === TimePeriod.Current) return true;
    }
    return false;
  });
};

export const fetchUpdatedTicket = async (ticketNumber: string) => {
  const ticketState = useTicketState.getState();
  const uiState = useUIState.getState();
  const ticket = ticketState.tickets.find(
    (t) => t.ticketNumber === ticketNumber
  );
  if (!ticket)
    return console.warn(
      "fetchUpdatedTicket() Could not find ticket",
      ticketNumber
    );

  ticket.refreshing = true;
  uiState.setViewingTicket(ticket);

  console.log("fetching ticket", ticket.ticketNumber);
  const newTicket = await fetchTicketStatus(ticket.ticketNumber);

  console.log("ticket response", newTicket?.ticketResult);
  if (newTicket) {
    useTicketState.getState().updateTicket(newTicket);
  }
};
const sortTickets = (tickets: TicketRecordOld[]) => {
  tickets.sort((a, b) =>
    a.ticketResult && b.ticketResult
      ? b.ticketResult.calculated.EventDate.getTime() -
        a.ticketResult.calculated.EventDate.getTime()
      : 0
  );
};

const getTicketsFromStorage = () => {
  const ticketsStr = localStorageGet(TICKETS_KEY);
  if (!ticketsStr) return [];

  const tickets = JSON.parse(ticketsStr) as TicketRecordOld[];
  for (const ticket of tickets) {
    if (typeof ticket.ticketNumber === "number")
      ticket.ticketNumber = `${ticket.ticketNumber}`;
    if (ticket.ticketResult) calculateTicketValues(ticket.ticketResult);
  }

  sortTickets(tickets);

  // Fetch updates
  setTimeout(
    () =>
      tickets.forEach((ticket) => {
        // Only update current bets
        if (ticket.ticketResult?.calculated.TimePeriod === TimePeriod.Current)
          fetchUpdatedTicket(ticket.ticketNumber);
      }),
    1
  );

  return tickets;
};

export const useTicketState = create<TicketState>((set, get) => ({
  tickets: getTicketsFromStorage(),
  setTickets: (tickets: TicketRecordOld[]) => {
    sortTickets(tickets);
    localStorageSet(TICKETS_KEY, JSON.stringify(tickets));
    set({ tickets });
  },
  updateTicket: (ticket: TicketRecordOld) => {
    const tickets = [...get().tickets];
    const existingTicketIndex = tickets.findIndex(
      (t) => t.ticketNumber === ticket.ticketNumber
    );
    if (existingTicketIndex > -1) {
      ticket = { ...tickets[existingTicketIndex], ...ticket };
      tickets[existingTicketIndex] = ticket;
    } else tickets.push(ticket);

    get().setTickets(tickets);

    // TODO fix this, this is bad
    const uiState = useUIState.getState();
    if (uiState.viewingTicket?.ticketNumber === ticket.ticketNumber)
      uiState.setViewingTicket(ticket);
  },
  removeTicket: (ticketNumber: string) => {
    const tickets = [...get().tickets].filter(
      (t) => t.ticketNumber !== ticketNumber
    );

    get().setTickets(tickets);
  },
  archiveTicket: (ticketNumber: string, archived = true) => {
    const existingTicket = get().tickets.find(
      (t) => t.ticketNumber === ticketNumber
    );
    if (existingTicket) {
      existingTicket.archived = archived;
      get().updateTicket(existingTicket);
    }
  },
  refreshTicket: (ticket: TicketRecordOld) => {
    fetchUpdatedTicket(ticket.ticketNumber);
  },
  refreshTickets: (filter?: (ticket: TicketRecordOld) => boolean) => {
    const { tickets, setTickets } = get();
    tickets.forEach(
      (t) => (!filter || filter(t)) && fetchUpdatedTicket(t.ticketNumber)
    );
    setTickets([...tickets]);
  },
}));
