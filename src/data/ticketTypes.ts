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

export const isPaying = (status?: TicketStatus) => {
  return (
    status === TicketStatus.Won ||
    status === TicketStatus.Draw
  );
};

export enum TicketSource {
  Manual = "Manual",
  DraftKings = "DraftKings",
}

export interface TicketDefinition {
  // Required
  ticketNumber: string;
  dataSource: TicketSource;
  createdDate: Date;
  refreshing: boolean;

  // User input
  notes?: string;
  archivedDate?: Date;

  // Computed/fetched
  ticketDetails?: TicketDetails;
  rawData?: any;
}

export interface TicketDetails {
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
  status: TicketStatus;

  eventName: string;
  betName: string;
  betType: string;

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


export const getTeams = (eventName: string): string[] => {
  let teams: string[] = [];
  if (eventName.indexOf(" vs ") > -1)
    teams.push(...eventName.split(" vs "));
  if (eventName.indexOf(" @ ") > -1)
    teams.push(...eventName.split(" @ "));
  return teams; //.map((team) => cleanupTeamPrefix(team));
}

export const cleanupTeamPrefix = (team: string): string => {
  // TODOv2 find a better way
  if (team.indexOf(" vs ") > -1) {
    let split = team.split(" vs ");
    return `${cleanupTeamPrefix(split[0])} vs ${cleanupTeamPrefix(split[1])}`;
  }
  if (team.indexOf(" @ ") > -1) {
    let split = team.split(" @ ");
    return `${cleanupTeamPrefix(split[0])} vs ${cleanupTeamPrefix(split[1])}`;
  }
  const words = team.split(" ");
  const prefix = words[0];
  if (prefix.length <= 3 && prefix === prefix.toUpperCase()) {
    return team.substring(prefix.length + 1);
  }
  return team;
};

export const replaceAll = (str: string, replace: { [key: string]: string }) => {
  for (let key of Object.keys(replace)) {
    let value = replace[key];
    str = str.replace(key, value);
  }
  return str;
}
export const removeAll = (str: string, remove: string[]) => {
  return str.split(" ")
    .filter((word) => !remove.includes(word))
    .join(" ");
}

const stringsToRemove = ["Alternate"];
const stringsToReplace = {
  "Moneyline FT": "Moneyline",
  "Money Line FT": "Money Line",
  "Total FT": "Total",
  "Spread FT": "Spread",
  "Touchdown Scorer": "Touchdown",
};
const stringsToReplaceShort = {
  "Moneyline FT": "ML",
  "Moneyline": "ML",
  "Money Line FT": "ML",
  "Money Line": "ML",
  "Total FT": "Total",
  "Spread FT": "Spread",
  "Touchdown Scorer": "TD",
  "Touchdowns": "TDs",
  "Yards": "Yds",
};

export const sanitizeString = (str: string, short = false) => {
  let replaced = replaceAll(str, short ? stringsToReplaceShort : stringsToReplace);
  return removeAll(replaced, stringsToRemove);
}
