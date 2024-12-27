import { BetDetails, getStatus, TicketDefinition, TicketDetails, TicketSource, EventScores } from "./ticketTypes";

export namespace DraftKingsDataV1 {
  export const getTicketDefinition = (ticketResponse: TicketResponse): TicketDefinition => {
    let ticketDetails = getTicketDetails(ticketResponse);
    let ticket: TicketDefinition = {
      ticketNumber: ticketResponse.ticketNumber,
      dataSource: TicketSource.DraftKingsV1,
      createdDate: new Date(ticketResponse.ticketResult.CreatedDate),
      refreshing: ticketResponse.refreshing,
      ticketDetails: ticketDetails,
      rawData: ticketResponse,
      archivedDate: ticketResponse.archived ? new Date() : undefined
    };
    return ticket;

    // return {
    //   ticketNumber: ticket.ticketNumber,
    //   createdDate: new Date(ticket.ticketResult.CreatedDate),
    //   dataSource: TicketSource.DraftKingsV1,
    //   ticketDetails,
    //   refreshing: false,
    //   rawData: ticket,
    // };
  }

  export const getTicketDetails = (ticketResponse: TicketResponse): TicketDetails => {
    let bets: BetDetails[] = [];
    let searchStrings: String[] = [ticketResponse.ticketNumber];
    let earliestEventDate = new Date(ticketResponse.ticketResult.Selections[0].EventDate);
    let latestEventDate = new Date(ticketResponse.ticketResult.Selections[0].EventDate);

    for(let selection of ticketResponse.ticketResult.Selections) {
      let teams = getTeams(selection);
      let subTitle = sanitizeString(selection.EventName);
      let title = sanitizeString(`${selection.YourBetPrefix} - ${selection.Yourbet}`);
      if (subTitle === selection.YourBetPrefix) title = selection.Yourbet;
      title = title.replace(subTitle + " - ", "");
      let betDetails: BetDetails = {
        title,
        subTitle,
        lineType: selection.LineTypeName,
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
    
    let title = bets[0].title + " - " + bets[0].subTitle;
    if (bets.length > 1) title = `Parlay (${bets.length} pick)`;
    let subTitle = getSubtitle(ticketResponse.ticketResult.Selections);

    let searchStringSet = new Set<String>(searchStrings);
    let wager = Number(ticketResponse.ticketResult.TicketCost);
    let totalOdds = Number(ticketResponse.ticketResult.TotalOdds);
    const getOddsAsRatio = (odds: number) => {
      if (odds < 0) return 100 / odds;
      return odds / 100;
    }
    let toWin = Number(ticketResponse.ticketResult.ToPay) || wager * getOddsAsRatio(totalOdds) / 100;
    let toPay = wager + toWin;

    let ticket: TicketDetails = {
      title,
      subTitle,
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

  const getTeams = (selection: Selection): string[] => {
    let Teams: string[] = [];
    if (selection.EventName.indexOf(" vs ") > -1)
      Teams.push(...selection.EventName.split(" vs "));
    if (selection.EventName.indexOf(" @ ") > -1)
      Teams.push(...selection.EventName.split(" @ "));
    return Teams.map((team) => cleanupTeamPrefix(team));
  }

  const cleanupTeamPrefix = (team: string) => {
    const split = team.split(" ");
    const prefix = split[0];
    if (prefix.length <= 3 && prefix === prefix.toUpperCase()) {
      return team.substring(prefix.length + 1);
    }
    return team;
  };

  const replaceAll = (str: string, replace: { [key: string]: string }) => {
    for (let key of Object.keys(replace)) {
      let value = replace[key];
      str = str.replace(key, value);
    }
    return str;
  }
  const removeAll = (str: string, remove: string[]) => {
    return str.split(" ")
      .filter((word) => !remove.includes(word))
      .join(" ");
  }

  const stringsToRemove = ["Alternate", "Yards", "Total"];
  const stringsToReplace = {
    "Moneyline FT": "Moneyline",
    "Money Line FT": "Money Line",
    "Touchdown Scorer": "Touchdown",
  };
  const stringsToReplaceShort = {
    "Moneyline FT": "ML",
    "Moneyline": "ML",
    "Money Line FT": "ML",
    "Money Line": "ML",
    "Touchdown Scorer": "TD",
    "Touchdowns": "TDs",
  };

  const sanitizeString = (str: string, long = true) => {
    let replaced = replaceAll(str, long ? stringsToReplace : stringsToReplaceShort);
    return removeAll(replaced, stringsToRemove);
  }

  const getSubtitle = (selections: Selection[]): string => {
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
      Teams = Teams.map((team) => replaceAll(cleanupTeamPrefix(team), stringsToReplaceShort));

      const yourBetPrefix = sanitizeString(selection.YourBetPrefix, false);
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
    }
    const subTitle = Array.from(allTeams.values()).join(", ");
    // console.log("subtitle:", subTitle, allTeams)
    return subTitle;
  }

  // TODOv2
  /*
  export const calculateTicketValues = (
    ticketResult: TicketResult
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
      const timePeriod = TimePeriod.Past; // getTimePeriod(EventDate, ticketResult.Status);t
      // selection.calculated = {
      //   Teams,
      //   EventDate,
      //   TimePeriod: timePeriod,
      // };
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
    // const timePeriod = getTimePeriod(EventDate, ticketResult.Status);

    // ticketResult.calculated = {
    //   Title,
    //   SubTitle: SubTitle === yourBet ? "" : SubTitle,
    //   EventDate,
    //   TimePeriod: timePeriod,
    //   TicketCost: parseFloat(ticketResult.TicketCost),
    //   ToPay: parseFloat(ticketResult.ToPay),
    //   ToWin: parseFloat(ticketResult.ToWin),
    //   TotalOdds: parseFloat(ticketResult.TotalOdds),
    //   CreatedDate: new Date(ticketResult.CreatedDate),
    //   ExpireDate: new Date(ticketResult.ExpireDate),
    //   searchStrings: searchStrings.map((s) => s.toLowerCase()),
    // };
  };
  */

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
