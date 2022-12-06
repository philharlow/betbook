import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';

const TopBarDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px 15px;
`;

const Title = styled.div`
  font-size: var(--topbar-font-size);
  font-weight: 400;
`;

const AddTicketButton = styled(Button)`
  font-size: var(--topbar-font-size);
  padding: 0px 12px;
`;

const Logo = styled.img`
  height: 22px;
  padding-right: 10px;
`;

function TopBar() {
  const navigate = useNavigate();
  const toggleAddTicketModalOpen = useUIState(state => state.toggleAddTicketModalOpen);
  
  const addTicket = () => {
    toggleAddTicketModalOpen();
  };

  const openSettings = () => {
    // setStatsModalOpen(true);
    navigate("/stats");
  };

  return (
    <TopBarDiv>
      <Title onClick={openSettings}>
        <svg fill='white' viewBox="0 0 100 80" width="25" height="30">
          <rect y="0" width="80" height="10" rx="5"></rect>
          <rect y="30" width="80" height="10" rx="5"></rect>
          <rect y="60" width="80" height="10" rx="5"></rect>
        </svg>
      </Title>
      <Title>
        <Logo src="logo192.png" alt="logo" />
        BetBook
      </Title>
      <AddTicketButton onClick={() => addTicket()}>+</AddTicketButton>
    </TopBarDiv>
  );
}

export default TopBar;
