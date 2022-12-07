import React from 'react';
import styled from 'styled-components/macro';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import MenuButton from './MenuButton';

const TopBarDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 5px 15px;
  align-items: center;
`;

const Title = styled.div`
  font-size: var(--topbar-font-size);
  font-weight: 400;
`;

const AddTicketButton = styled(Button)`
  font-size: var(--topbar-font-size);
  padding: 5px 12px;
`;

const Logo = styled.img`
  height: 22px;
  padding-right: 10px;
`;

function TopBar() {
  const toggleAddTicketModalOpen = useUIState(state => state.toggleAddTicketModalOpen);
  
  const addTicket = () => {
    toggleAddTicketModalOpen();
  };

  return (
    <TopBarDiv>
      <MenuButton />
      <Title>
        <Logo src="logo192.png" alt="logo" />
        BetBook
      </Title>
      <AddTicketButton onClick={addTicket}>+</AddTicketButton>
    </TopBarDiv>
  );
}

export default TopBar;
