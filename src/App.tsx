import React from 'react';
import styled from 'styled-components';
import AddTicketDialog from './components/AddTicketDialog';
import TicketTable from './components/TicketTable';
import { useTicketState } from './store/ticketStore';
import { GlobalStyles } from './styles/GlobalStyles';

const AppDiv = styled.div`
  height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
`;

const Title = styled.h1`
  font-size: 3.2em;
  line-height: 1.1;
  font-weight: 400;
  padding-top: 20px;
`;

const SubTitle = styled.div`
  line-height: 1.1;
`;

const AddTicketButton = styled.button`
  font-size: 1em;
  padding: 10px;
  margin: 10px auto;
`;

const App = () => {
  const toggleCameraDialogOpen = useTicketState(
    state => state.toggleCameraDialogOpen,
  );

  const addTicket = async () => {
    toggleCameraDialogOpen();
  };

  return (
    <AppDiv>
      <GlobalStyles />

      <Title>MBTB</Title>
      <SubTitle>Mobile Bet Ticket Book</SubTitle>
      <AddTicketButton onClick={() => addTicket()}>Add Ticket</AddTicketButton>
      <TicketTable />
      <AddTicketDialog />
    </AppDiv>
  );
}

export default App;
