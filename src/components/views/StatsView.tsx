import React, { useEffect, useState } from "react";
import styled from "styled-components/macro";
import { filterTicketsBySearch, useTicketState } from "../../store/ticketStore";
import { useUIState } from "../../store/uiStore";
import Accordion from "../Accordion";
import OptionBar from "../OptionBar";
import TicketTile from "../TicketTile";
import SearchBar from "../SearchBar";
import {
  isSettled,
  TicketDefinition,
  TicketStatus,
} from "../../data/ticketTypes";
import { Button } from "../../styles/GlobalStyles";

const StatsViewDiv = styled.div`
  background-color: var(--black);
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 10px 15px;
  gap: 20px;
`;

const StatGroupDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  padding: 10px;
  justify-content: center;
`;

const Stat = styled.div`
  background: var(--grey);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 10px;
  height: 80px;
  width: 100px;
  justify-content: space-around;
`;

const StatLabel = styled.div`
  font-size: 11px;
  display: flex;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const SubBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px 15px;
`;

const SearchQueryBar = styled.div`
  width: 100%;
  text-align: center;
`;

interface StatGroup {
  name: string;
  startOpen?: boolean;
  stats: [string, any][];
}

const dayMs = 1000 * 60 * 60 * 24;

enum TimeSpan {
  AllTime = "All time",
  PastWeek = "Past 7 days",
  PastMonth = "30 days",
  PastYear = "365 days",
  Custom = "Custom",
}

const allTimeSpans = Object.values(TimeSpan);

const msBytimeSpan = {
  [TimeSpan.AllTime]: -1,
  [TimeSpan.PastWeek]: dayMs * 7,
  [TimeSpan.PastMonth]: dayMs * 30,
  [TimeSpan.PastYear]: dayMs * 365,
  [TimeSpan.Custom]: 0, // Overridden
};

interface CustomTimeSpan {
  start: Date;
  end: Date;
}

const dollarUSLocale = Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const toCurrencyFormat = (val: number) =>
  isNaN(val) ? "$--" : "$" + dollarUSLocale.format(val);
export const toPercentFormat = (val: number) =>
  isNaN(val) ? "--%" : `${parseFloat((val * 100).toFixed(2))}%`;

function StatsView() {
  const searchQuery = useUIState((state) => state.searchQuery);
  const tickets = useTicketState((state) => state.tickets);
  const [timeSpan, setTimeSpan] = useState(TimeSpan.AllTime);
  const [filteredTickets, setFilteredTickets] = useState<TicketDefinition[]>(
    []
  );
  const [customTimeSpan, setCustomTimeSpan] = useState<CustomTimeSpan | null>(
    null
  );
  const [customTimeInputOpen, setCustomTimeInputOpen] = useState(false);

  useEffect(() => {
    const nowMs = new Date().getTime();
    let start = nowMs;
    let timeSpanMs = msBytimeSpan[timeSpan];
    let end = nowMs - timeSpanMs;

    if (timeSpan === TimeSpan.Custom && customTimeSpan) {
      start = customTimeSpan.start.getTime();
      end = customTimeSpan.end.getTime();
    }

    const timeSpanResults = tickets.filter((ticket) => {
      if (!ticket.ticketDetails) return false;
      if (!filterTicketsBySearch(ticket, searchQuery)) return false;
      if (timeSpanMs === -1) return true;
      let ticketDate = ticket.ticketDetails.betEventsStartDate.getTime();
      return ticketDate > end && ticketDate < start;
    });
    setFilteredTickets(timeSpanResults);
  }, [tickets, timeSpan, searchQuery, customTimeSpan]);

  useEffect(() => {
    if (
      customTimeInputOpen === false &&
      timeSpan === TimeSpan.Custom &&
      customTimeSpan === null
    ) {
      setTimeSpan(TimeSpan.AllTime);
    }
  }, [customTimeInputOpen, timeSpan, customTimeSpan]);

  const winningTickets = filteredTickets.filter(
    (t) => t.ticketDetails?.status === TicketStatus.Won
  );
  const losingTickets = filteredTickets.filter(
    (t) => t.ticketDetails?.status === TicketStatus.Lost
  );
  const drawingTickets = filteredTickets.filter(
    (t) => t.ticketDetails?.status === TicketStatus.Draw
  );
  const openTickets = filteredTickets.filter(
    (t) => t.ticketDetails?.status === TicketStatus.Opened
  );
  const settledTickets = filteredTickets.filter((t) =>
    isSettled(t.ticketDetails?.status)
  );

  const totalOpenWagers = openTickets.reduce(
    (acc, t) => acc + (t.ticketDetails?.wager ?? 0),
    0
  );
  const totalSettledWagers = settledTickets.reduce(
    (acc, t) => acc + (t.ticketDetails?.wager ?? 0),
    0
  );
  // const totalLost = losingTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.TicketCost ?? 0), 0);
  const totalWagers = totalOpenWagers + totalSettledWagers;

  const totalWon = winningTickets.reduce(
    (acc, t) => acc + (t.ticketDetails?.toPay ?? 0),
    0
  );
  const totalDrawn = drawingTickets.reduce(
    (acc, t) => acc + (t.ticketDetails?.toPay ?? 0),
    0
  );
  const totalReceived = totalWon + totalDrawn;

  const maxRemainingPay = openTickets.reduce(
    (acc, t) => acc + (t.ticketDetails?.toPay ?? 0),
    0
  );
  const archivedTickets = filteredTickets.filter((t) => t.archivedDate);
  const nonArchivedSettledTickets = filteredTickets.filter(
    (t) => !t.archivedDate && isSettled(t.ticketDetails?.status)
  );

  const nonArchivedPay = nonArchivedSettledTickets.reduce(
    (acc, t) => acc + (t.ticketDetails?.toPay ?? 0),
    0
  );

  const getStatDiv = (label: string, value: any) => {
    return (
      <Stat key={label}>
        <StatLabel>{label}</StatLabel>
        <StatValue>{value}</StatValue>
      </Stat>
    );
  };

  const statGroups: StatGroup[] = [
    {
      name: "Ticket Totals",
      stats: [
        ["Total Tickets", filteredTickets.length],
        [
          "Won/Lost/Drawn",
          `${winningTickets.length}/${losingTickets.length}/${drawingTickets.length}`,
        ],
        ["Open Tickets", openTickets.length],
      ],
    },
    {
      name: "Ticket %",
      stats: [
        [
          "Winning Ticket %",
          toPercentFormat(winningTickets.length / settledTickets.length),
        ],
        [
          "Losing Ticket %",
          toPercentFormat(losingTickets.length / settledTickets.length),
        ],
        [
          "Drawing Ticket %",
          toPercentFormat(drawingTickets.length / settledTickets.length),
        ],
      ],
    },
    {
      name: "$ Totals",
      stats: [
        ["Total Open Wagers", toCurrencyFormat(totalOpenWagers)],
        ["Total Settled Wagers", toCurrencyFormat(totalSettledWagers)],
        ["Total Wagers", toCurrencyFormat(totalWagers)],
        // ["Total Losing Wagers", toCurrencyFormat(totalLost)],
        ["Total Winning Payouts", toCurrencyFormat(totalWon)],
        ["Total Drawing Payouts", toCurrencyFormat(totalDrawn)],
        ["Un-archived Payouts", toCurrencyFormat(nonArchivedPay)],
      ],
    },
    {
      name: "Current profit/loss",
      stats: [
        [
          "Current $ profit/loss",
          toCurrencyFormat(totalReceived - totalSettledWagers),
        ],
        [
          "Current % profit/loss",
          toPercentFormat(totalReceived / totalSettledWagers - 1),
        ],
      ],
    },
    {
      name: "Maximum/Minimum",
      stats: [
        ["Max remaining payout", toCurrencyFormat(maxRemainingPay)],
        [
          "Max $ profit/loss",
          toCurrencyFormat(maxRemainingPay + totalReceived - totalWagers),
        ],
        [
          "Max % profit/loss",
          toPercentFormat((maxRemainingPay + totalReceived) / totalWagers - 1),
        ],
        ["Min $ profit/loss", toCurrencyFormat(totalReceived - totalWagers)],
        ["Min % profit/loss", toPercentFormat(totalReceived / totalWagers - 1)],
      ],
    },
    {
      name: "Archived",
      startOpen: false,
      stats: [
        ["Archived Tickets", archivedTickets.length],
        [
          "Archived %",
          toPercentFormat(archivedTickets.length / filteredTickets.length),
        ],
      ],
    },
  ];

  const ticketsToShow: [string, TicketDefinition][] = [];
  let bestOddsWin = winningTickets[0];
  let bestPayWin = winningTickets[0];
  for (const ticket of winningTickets) {
    if (!ticket.ticketDetails) break;
    if (
      ticket.ticketDetails?.totalOdds >
      (bestOddsWin.ticketDetails?.totalOdds ?? 0)
    )
      bestOddsWin = ticket;
    if (ticket.ticketDetails?.toPay > (bestPayWin.ticketDetails?.toPay ?? 0))
      bestPayWin = ticket;
  }
  if (bestOddsWin) ticketsToShow.push(["Best Odds Win", bestOddsWin]);
  if (bestPayWin) ticketsToShow.push(["Best Payout Win", bestPayWin]);

  const onTimeSpanChanged = (newTimeSpan: string) => {
    setTimeSpan(newTimeSpan as TimeSpan);
    if (newTimeSpan === TimeSpan.Custom) {
      setCustomTimeInputOpen(true);
    }
  };

  return (
    <StatsViewDiv>
      <SubBar>
        <OptionBar
          options={allTimeSpans}
          selected={timeSpan}
          onSelectionChanged={onTimeSpanChanged}
        />
      </SubBar>
      <Content>
        <SearchBar />
        {searchQuery && (
          <SearchQueryBar>
            Stats for tickets matching {`"${searchQuery}"`}
          </SearchQueryBar>
        )}
        {statGroups.map((statGroup, i) => (
          <Accordion
            label={statGroup.name}
            key={i}
            startOpen={statGroup.startOpen}
          >
            <StatGroupDiv>
              {statGroup.stats.map((stat) => getStatDiv(stat[0], stat[1]))}
            </StatGroupDiv>
          </Accordion>
        ))}
        {ticketsToShow.map(([label, ticket]) => (
          <Accordion key={label} label={label}>
            {ticket && <TicketTile ticket={ticket} />}
          </Accordion>
        ))}
      </Content>
      {customTimeInputOpen && (
        <CustomTimeInputModal
          customTimeSpan={customTimeSpan}
          setCustomTimeSpan={setCustomTimeSpan}
          setCustomTimeInputOpen={setCustomTimeInputOpen}
        />
      )}
    </StatsViewDiv>
  );
}

export default StatsView;

interface CustomTimeInputProps {
  customTimeSpan: CustomTimeSpan | null;
  setCustomTimeSpan: (span: CustomTimeSpan) => void;
  setCustomTimeInputOpen: (open: boolean) => void;
}

const CustomTimeInputModalDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;
  background-color: var(--grey);
`;

const CustomTimeInputDiv = styled.div`
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px;
  font-size: 20px;
`;

const CustomTimeInputRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 15px;
`;

const CustomTimeInputButton = styled(Button)`
  padding: 10px;
`;

function CustomTimeInputModal({
  customTimeSpan,
  setCustomTimeSpan,
  setCustomTimeInputOpen,
}: CustomTimeInputProps) {
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customTimeSpan) {
      setStart(customTimeSpan.start);
      setEnd(customTimeSpan.end);
    }
  }, [customTimeSpan]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (isNaN(date.getTime())) {
      setError("Invalid date");
      return;
    }
    setStart(date);
    setError(null);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (isNaN(date.getTime())) {
      setError("Invalid date");
      return;
    }
    setEnd(date);
    setError(null);
  };

  const handleSetTimeSpan = () => {
    if (!start || !end || start === end) {
      setError("Both dates must be set");
      return;
    }
    if (start.getTime() > end.getTime()) {
      setCustomTimeSpan({ start, end });
    } else {
      setCustomTimeSpan({ start: end, end: start });
    }
    setCustomTimeInputOpen(false);
  };

  return (
    <CustomTimeInputModalDiv>
      <CustomTimeInputDiv>
        <CustomTimeInputRow>
          <h3>Set Custom Time Range</h3>
        </CustomTimeInputRow>
        <CustomTimeInputRow>
          Start Date
          <input
            type="date"
            onChange={handleStartChange}
            value={start.toISOString().substring(0, 10)}
          />
        </CustomTimeInputRow>
        <CustomTimeInputRow>
          End Date
          <input
            type="date"
            onChange={handleEndChange}
            value={end.toISOString().substring(0, 10)}
          />
        </CustomTimeInputRow>
        <CustomTimeInputButton onClick={handleSetTimeSpan}>
          Set Time Span
        </CustomTimeInputButton>
        <CustomTimeInputButton onClick={() => setCustomTimeInputOpen(false)}>
          Cancel
        </CustomTimeInputButton>
        {error && <div>{error}</div>}
      </CustomTimeInputDiv>
    </CustomTimeInputModalDiv>
  );
}
