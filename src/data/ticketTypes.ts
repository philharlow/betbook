export const TicketDbVersion = 2.0;

export interface TicketDb {
    ticketsDbVersion: number
    tickets: TicketDefinition[]
}

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

export const TICKETS_DB_KEY = "TICKETS_DB";

export enum TimePeriod {
  Past = "Past",
  Current = "Current",
  Future = "Future",
}

export const isSettled = (status?: TicketStatus) => {
  return (
    status === TicketStatus.Won ||
    status === TicketStatus.Lost ||
    status === TicketStatus.Draw
  );
};

export enum TicketSource {
  Manual = "Manual",
  DraftKingsV1 = "DraftKingsV1",
  DraftKingsV2 = "DraftKingsV2",
}

export interface TicketDefinition {
  // Required
  ticketNumber: string;
  dataSource: TicketSource;
  createdDate: Date;
  refreshing: boolean;

  // Computed/fetched
  ticketDetails?: TicketDetails;
  rawData?: any;

  archivedDate?: Date;
}

export interface TicketDetails {
  title: string;
  subTitle: string;
  status: TicketStatus;

  betEventsStartDate: Date;
  betEventsEndDate: Date;

  wager: number;
  toWin: number;
  toPay: number;

  totalOdds: number;

  bets: BetDetails[];

  betshopName: string;
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

  scores?: EventScores;
}

export interface EventScores {
  teamA: string;
  scoreA: string;

  teamB: string;
  scoreB: string;
}

export const getOddsDisplay = (odds?: number) => {
  if (!odds) return "";
  if (odds > 0) return "+" + odds;
  return odds;
};