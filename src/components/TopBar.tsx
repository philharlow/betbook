import React from "react";
import styled from "styled-components/macro";
import VersionDisplay from "./VersionDisplay";
import { useUIState } from "../store/uiStore";
import { useTicketState } from "../store/ticketStore";
import { toCurrencyFormat } from "./views/StatsView";
import { isAPayingTicketStatus } from "../data/ticketTypes";
import { useNavigate } from "react-router-dom";

const TopBarDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px 15px;
  height: 50px;
`;

const Title = styled.div`
  font-size: var(--topbar-font-size);
  font-weight: 400;
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  width: 35px;
  height: 25px;
  padding-right: 10px;
`;

const OffsetVersionDisplay = styled(VersionDisplay)`
  padding-left: 5px;
  padding-top: 13px;
`;

const Balance = styled.div<{ positive: boolean }>`
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  align-self: center;
  background-color: #333;
  padding: 5px 10px;
  border-radius: 10px;
  color: ${(p) => (p.positive ? "var(--green)" : "#ff4d4d")};
  height: 30px;
  cursor: pointer;
`;

function TopBar() {
  let navigate = useNavigate();
  const startingBalance = useUIState((state) => state.startingBalance);
  const showBalance = useUIState((state) => state.showBalance);
  const tickets = useTicketState((state) => state.tickets);
  const currentBalance = showBalance
    ? tickets.reduce(
        (acc, ticket) =>
          acc +
          (isAPayingTicketStatus(ticket.ticketDetails?.status) ? ticket.ticketDetails?.toPay ?? 0 : 0) -
          (ticket.ticketDetails?.wager ?? 0),
        0
      )
    : startingBalance;

  const scrollToTop = () => {
    const topElement = document.getElementById("top");
    // console.log("scrolling to top", topElement);
    let elements = [
      topElement,
      topElement?.parentElement,
      topElement?.parentElement?.parentElement,
      topElement?.parentElement?.parentElement?.parentElement,
    ];
    // Gross hack to scroll to top of parent element
    for (let element of elements) {
      element?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <TopBarDiv onClick={scrollToTop}>
      <Title onClick={() => navigate("/")}>
        <Logo src="logo192.png" alt="logo" />
        BetBook
        <OffsetVersionDisplay />
      </Title>

      {showBalance && (
        <Balance positive={currentBalance >= 0} onClick={() => navigate("/user")}>
          {toCurrencyFormat(currentBalance)}
        </Balance>
      )}
    </TopBarDiv>
  );
}

export default TopBar;
