import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { TicketRecord, TicketStatus, useTicketState } from '../store/ticketStore';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import Accordion from './Accordion';
import TicketDisplay from './TicketDisplay';

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
  gap: 10px;
`;

const StatGroup = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 15px;
  justify-content: center;
`;

const Stat = styled.div`
  background: var(--grey);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
`;

const StatLabel = styled.div`
  font-size: 12px;
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
`;

const CloseButton = styled(Button)``;

const ArchiveButton = styled(Button)`
  margin-top: 50px;
  margin-bottom: 50px;
  background: var(--blue);
  padding: 10px 20px;
  align-self: center;
`;

const dollarUSLocale = Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const toCurrencyFormat = (val: number) => "$" + dollarUSLocale.format(val);

function StatsModal() {
  const navigate = useNavigate();
  const statsModalOpen = useUIState(state => state.statsModalOpen);
  const setStatsModalOpen = useUIState(state => state.setStatsModalOpen);
  const showArchivedTickets = useUIState(state => state.showArchivedTickets);
  const setShowArchivedTickets = useUIState(state => state.setShowArchivedTickets);
  const tickets = useTicketState(state => state.tickets);
  
  const closeModal = () => {
    setStatsModalOpen(false);
    navigate("/");
  };

  const onToggleArchives = () => {
    setShowArchivedTickets(!showArchivedTickets);
    closeModal();
  }
  
  useEffect(() => {
    setStatsModalOpen(true);
  }, [setStatsModalOpen]);
  

  if (!statsModalOpen) return null;

  const winningTickets = tickets.filter((t) => t.status === TicketStatus.Won);
  const losingTickets = tickets.filter((t) => t.status === TicketStatus.Lost);
  const drawingTickets = tickets.filter((t) => t.status === TicketStatus.Draw);
  const openTickets = tickets.filter((t) => t.status === TicketStatus.Opened);
  const totalWagered = tickets.reduce((acc, t) => acc + parseFloat(t.ticketResult?.TicketCost ?? "0"), 0);
  const totalLost = losingTickets.reduce((acc, t) => acc + parseFloat(t.ticketResult?.TicketCost ?? "0"), 0);
  const totalWon = winningTickets.reduce((acc, t) => acc + parseFloat(t.ticketResult?.ToPay ?? "0"), 0);
  const totalDrawn = drawingTickets.reduce((acc, t) => acc + parseFloat(t.ticketResult?.ToPay ?? "0"), 0);
  const totalReceived = totalWon + totalDrawn;
  const maxRemainingWin = tickets.reduce((acc, t) => acc + parseFloat(t.ticketResult?.ToPay ?? "0"), 0) - totalReceived;

  const getStatDiv = (label: string, value: any) => {
    return (
    <Stat key={label}>
      <StatLabel>{label}</StatLabel>
      <StatValue>{value}</StatValue>
    </Stat>);
  }

  const statGroups: [string, any][][] = [
    [
      ["Total Tickets", tickets.length],
      ["Tickets Won",  winningTickets.length],
      ["Tickets Lost",  losingTickets.length],
      ["Tickets Drawn",  drawingTickets.length],
      ["Tickets Open",  openTickets.length],
    ],[
      ["Total Wagered", toCurrencyFormat(totalWagered)],
      ["Total Won", toCurrencyFormat(totalWon)],
      ["Total Lost", toCurrencyFormat(totalLost)],
      ["Total Drawn", toCurrencyFormat(totalDrawn)],
    ],
    [
      ["Current profit/loss", toCurrencyFormat(totalReceived - totalWagered)],
      ["Current profit/loss %", `${parseFloat((((totalReceived / totalWagered) - 1) * 100).toFixed(2))}%`],
    ],
    [
      ["Max potential win", toCurrencyFormat(maxRemainingWin)],
      ["Max profit/loss", toCurrencyFormat((maxRemainingWin + totalReceived) - totalWagered)],
      ["Max profit/loss %", `${parseFloat(((((maxRemainingWin + totalReceived) / totalWagered) - 1) * 100).toFixed(2))}%`],
    ],
    [
      ["Archived Tickets", tickets.filter((t) => t.archived).length],
    ],
  ];

  const ticketsToShow: [string, TicketRecord][] = [];
  let bestOddsWin = winningTickets[0];
  let bestPayWin = winningTickets[0];
  for (const ticket of winningTickets) {
    if (!ticket.ticketResult) break;
    if (ticket.ticketResult.calculated.TotalOdds > (bestOddsWin.ticketResult?.calculated.TotalOdds ?? 0)) bestOddsWin = ticket;
    if (ticket.ticketResult.calculated.ToPay > (bestPayWin.ticketResult?.calculated.ToPay ?? 0)) bestPayWin = ticket;
  }
  ticketsToShow.push(["Best Odds Win", bestOddsWin]);
  ticketsToShow.push(["Best Pay Win", bestPayWin]);


  return (
    <StatsModalDiv>
      <TopBar>
        Stats
        <CloseButton onClick={closeModal}>X</CloseButton>
      </TopBar>
      <Content>
        {statGroups.map((stats, i) =>
          <StatGroup key={i}>
            {stats.map((stat) => getStatDiv(stat[0], stat[1]))}
          </StatGroup>
        )}
        {ticketsToShow.map(([label, ticket]) =>
          <Accordion
            key={label}
            label={label}
            >
              {ticket && <TicketDisplay ticket={ticket} />}
          </Accordion>
        )}
        <ArchiveButton onClick={onToggleArchives}>{showArchivedTickets ? "Hide" : "Show"} Archived Tickets</ArchiveButton>
      </Content>
    </StatsModalDiv>
  );
}

export default StatsModal;
