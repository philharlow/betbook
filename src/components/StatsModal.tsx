import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { isSettled, TicketRecord, TicketStatus, useTicketState } from '../store/ticketStore';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import Accordion from './Accordion';
import MenuButton from './MenuButton';
import OptionBar from './OptionBar';
import TicketTile from './TicketTile';

const StatsModalDiv = styled.div`
  position: absolute;
  background-color: var(--black);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 15px;
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
  padding: 10px 15px;
  height: 80px;
  max-width: 120px;
  justify-content: space-around;
`;

const StatLabel = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const TopBar = styled.div`
  background-color: var(--grey);
  font-size: var(--topbar-font-size);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  align-items: center;
`;

const CloseButton = styled(Button)`
  padding: 10px 14px;
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
  PastMonth = "Past 30 days",
  PastYear = "Past 365 days",
}

const timeSpanOptions = {
  [TimeSpan.AllTime]: -1,
  [TimeSpan.PastWeek]: dayMs * 7,
  [TimeSpan.PastMonth]: dayMs * 30,
  [TimeSpan.PastYear]: dayMs * 365,
}

const dollarUSLocale = Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const toCurrencyFormat = (val: number) => "$" + dollarUSLocale.format(val);
export const toPercentFormat = (val: number) => `${parseFloat((val * 100).toFixed(2))}%`;

function StatsModal() {
  const navigate = useNavigate();
  const statsModalOpen = useUIState(state => state.statsModalOpen);
  const setStatsModalOpen = useUIState(state => state.setStatsModalOpen);
  const tickets = useTicketState(state => state.tickets);
  const [timeSpan, setTimeSpan] = useState(TimeSpan.AllTime);
  const [filteredTickets, setFilteredTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    const now = new Date();
    const timeSpanLimit = timeSpanOptions[timeSpan];
    const timeSpanResults = tickets.filter((ticket) => {
      if (!ticket.ticketResult) return false;
      if (timeSpanLimit === -1) return true;
      const delta = now.getTime() - ticket.ticketResult.calculated.EventDate.getTime();
      return delta > 0 && delta < timeSpanLimit;
    });
    setFilteredTickets(timeSpanResults);
  }, [tickets, timeSpan]);
  
  const closeModal = () => {
    setStatsModalOpen(false);
    navigate(-1);
  };

  useEffect(() => {
    setStatsModalOpen(true);
  }, [setStatsModalOpen]);
  

  if (!statsModalOpen) return null;

  const winningTickets = filteredTickets.filter((t) => t.status === TicketStatus.Won);
  const losingTickets = filteredTickets.filter((t) => t.status === TicketStatus.Lost);
  const drawingTickets = filteredTickets.filter((t) => t.status === TicketStatus.Draw);
  const openTickets = filteredTickets.filter((t) => t.status === TicketStatus.Opened);
  const settledTickets = filteredTickets.filter((t) => isSettled(t.status));
  
  const totalOpenWagers = openTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.TicketCost ?? 0), 0);
  const totalSettledWagers = settledTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.TicketCost ?? 0), 0);
  const totalLost = losingTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.TicketCost ?? 0), 0);

  const totalWon = winningTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.ToPay ?? 0), 0);
  const totalDrawn = drawingTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.ToPay ?? 0), 0);
  const totalReceived = totalWon + totalDrawn;

  const maxWin = filteredTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.ToPay ?? 0), 0) ;
  const maxRemainingWin = maxWin - totalReceived;
  const archivedTickets = filteredTickets.filter((t) => t.archived);

  const getStatDiv = (label: string, value: any) => {
    return (
    <Stat key={label}>
      <StatLabel>{label}</StatLabel>
      <StatValue>{value}</StatValue>
    </Stat>);
  }

  const statGroups: StatGroup[] = [
    {
      name: "Ticket Totals",
      stats: [
        ["Total Tickets", filteredTickets.length],
        ["Winning Tickets",  winningTickets.length],
        ["Losing Tickets",  losingTickets.length],
        ["Drawing Tickets",  drawingTickets.length],
        ["Open Tickets",  openTickets.length],
      ],
    },
    {
      name: "Ticket %",
      stats: [
        ["Winning Ticket %",  toPercentFormat(winningTickets.length / settledTickets.length)],
        ["Losing Ticket %",  toPercentFormat(losingTickets.length / settledTickets.length)],
        ["Drawing Ticket %",  toPercentFormat(drawingTickets.length / settledTickets.length)],
      ],
    },
    {
      name: "$ Totals",
      stats: [
        ["Total Open Wagers", toCurrencyFormat(totalOpenWagers)],
        ["Total Settled Wagers", toCurrencyFormat(totalSettledWagers)],
        ["Total Losing Wagers", toCurrencyFormat(totalLost)],
        ["Total Winning Payouts", toCurrencyFormat(totalWon)],
        ["Total Drawing Payouts", toCurrencyFormat(totalDrawn)],
      ],
    },
    {
      name: "Current profit/loss",
      stats: [
        ["Current profit/loss", toCurrencyFormat(totalReceived - totalSettledWagers)],
        ["Current profit/loss %", toPercentFormat((totalReceived / totalSettledWagers) - 1)],
      ],
    },
    {
      name: "Maximums",
      stats: [
        ["Max potential win", toCurrencyFormat(maxRemainingWin)],
        ["Max profit/loss", toCurrencyFormat((maxRemainingWin + totalReceived) - totalSettledWagers)],
        ["Max profit/loss %", toPercentFormat(((maxRemainingWin + totalReceived) / totalSettledWagers) - 1)],
      ],
    },
    {
      name: "Archived",
      startOpen: false,
      stats: [
        ["Archived Tickets", archivedTickets.length],
        ["Archived %", toPercentFormat(archivedTickets.length / filteredTickets.length)],
      ],
    },
  ];

  const ticketsToShow: [string, TicketRecord][] = [];
  let bestOddsWin = winningTickets[0];
  let bestPayWin = winningTickets[0];
  for (const ticket of winningTickets) {
    if (!ticket.ticketResult) break;
    if (ticket.ticketResult.calculated.TotalOdds > (bestOddsWin.ticketResult?.calculated.TotalOdds ?? 0)) bestOddsWin = ticket;
    if (ticket.ticketResult.calculated.ToPay > (bestPayWin.ticketResult?.calculated.ToPay ?? 0)) bestPayWin = ticket;
  }
  if (bestOddsWin) ticketsToShow.push(["Best Odds Win", bestOddsWin]);
  if (bestPayWin) ticketsToShow.push(["Best Pay Win", bestPayWin]);


  return (
    <StatsModalDiv>
      <TopBar>
        <MenuButton />
        Stats
        <CloseButton onClick={closeModal}>X</CloseButton>
      </TopBar>
      <Content>
        <OptionBar options={Object.keys(timeSpanOptions)} selected={timeSpan} onSelectionChanged={(val) => setTimeSpan(val as TimeSpan)} />
        {statGroups.map((statGroup, i) =>
          <Accordion label={statGroup.name} key={i} startOpen={statGroup.startOpen} >
            <StatGroupDiv>
              {statGroup.stats.map((stat) => getStatDiv(stat[0], stat[1]))}
            </StatGroupDiv>
          </Accordion>
        )}
        {ticketsToShow.map(([label, ticket]) =>
          <Accordion
            key={label}
            label={label}
            >
              {ticket && <TicketTile ticket={ticket} />}
          </Accordion>
        )}
      </Content>
    </StatsModalDiv>
  );
}

export default StatsModal;
