import React from 'react';
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
  padding: 0px 8px;
`;

function TopBar() {
  const toggleAddTicketModalOpen = useUIState(state => state.toggleAddTicketModalOpen);
  
  const addTicket = () => {
    toggleAddTicketModalOpen();
  };

  return (
    <TopBarDiv>
      <Title>My Bets Viewer</Title>
      <AddTicketButton onClick={() => addTicket()}>+</AddTicketButton>
    </TopBarDiv>
  );
}

export default TopBar;
