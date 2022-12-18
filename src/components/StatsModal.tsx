import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { TicketRecord, TicketStatus, useTicketState } from '../store/ticketStore';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import Accordion from './Accordion';
import MenuButton from './MenuButton';
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

const Stats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
`;

const StatGroup = styled.div`
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
  height: 70px;
  max-width: 120px;
  justify-content: space-between;
`;

const StatLabel = styled.div`
  font-size: 12px;
  display: flex;
  flex: 1;
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


const dollarUSLocale = Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const toCurrencyFormat = (val: number) => "$" + dollarUSLocale.format(val);
export const toPercentFormat = (val: number) => `${parseFloat((val * 100).toFixed(2))}%`;

function StatsModal() {
  const navigate = useNavigate();
  const statsModalOpen = useUIState(state => state.statsModalOpen);
  const setStatsModalOpen = useUIState(state => state.setStatsModalOpen);
  const tickets = useTicketState(state => state.tickets);
  
  const closeModal = () => {
    setStatsModalOpen(false);
    navigate("/");
  };

  useEffect(() => {
    setStatsModalOpen(true);
  }, [setStatsModalOpen]);
  

  if (!statsModalOpen) return null;

  const winningTickets = tickets.filter((t) => t.status === TicketStatus.Won);
  const losingTickets = tickets.filter((t) => t.status === TicketStatus.Lost);
  const drawingTickets = tickets.filter((t) => t.status === TicketStatus.Draw);
  const openTickets = tickets.filter((t) => t.status === TicketStatus.Opened);
  const totalWagered = tickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.TicketCost ?? 0), 0);
  const totalLost = losingTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.TicketCost ?? 0), 0);
  const totalWon = winningTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.ToPay ?? 0), 0);
  const totalDrawn = drawingTickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.ToPay ?? 0), 0);
  const totalReceived = totalWon + totalDrawn;
  const maxWin = tickets.reduce((acc, t) => acc + (t.ticketResult?.calculated?.ToPay ?? 0), 0) ;
  const maxRemainingWin = maxWin - totalReceived;

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
      ["Total Received", toCurrencyFormat(totalReceived)],
      ["Total Won", toCurrencyFormat(totalWon)],
      ["Total Lost", toCurrencyFormat(totalLost)],
      ["Total Drawn", toCurrencyFormat(totalDrawn)],
    ],
    [
      ["Current profit/loss", toCurrencyFormat(totalReceived - totalWagered)],
      ["Current profit/loss %", `${toPercentFormat((totalReceived / totalWagered) - 1)}`],
    ],
    [
      ["Max potential win", toCurrencyFormat(maxRemainingWin)],
      ["Max profit/loss", toCurrencyFormat((maxRemainingWin + totalReceived) - totalWagered)],
      ["Max profit/loss %", `${toPercentFormat(((maxRemainingWin + totalReceived) / totalWagered) - 1)}`],
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
        <Accordion label="Stats" >
          <Stats>
            {statGroups.map((stats, i) =>
              <StatGroup key={i}>
                {stats.map((stat) => getStatDiv(stat[0], stat[1]))}
              </StatGroup>
            )}
          </Stats>
        </Accordion>
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
