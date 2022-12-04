import React, { useEffect } from 'react';
import styled from 'styled-components';
import { TicketStatus, useTicketState } from '../store/ticketStore';
import { fetchTicketStatus } from '../ticketApi';

const Square = styled.div`
  width: 20px;
  height: 20px;
`;

const TableDiv = styled.table`
  width: 100%;
  border-collapse: collapse;
  td,
  th {
    border: 1px solid white;
  }
`;

const CellContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ResultRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

function TicketTable() {
  const tickets = useTicketState(state => state.tickets);
  const updateTicket = useTicketState(state => state.updateTicket);
  const removeTicket = useTicketState(state => state.removeTicket);

  useEffect(() => {
    const update = async () => {
      for (const ticket of tickets) {
        if (ticket.status === TicketStatus.Stale) {
          const refreshingTicket = {
            ...ticket,
            status: TicketStatus.Refreshing,
          };
          updateTicket(refreshingTicket);
          console.log('fetching ticket', ticket.ticketNumber);
          const newTicket = await fetchTicketStatus(ticket.ticketNumber);
          if (newTicket) updateTicket(newTicket);
        }
      }
    };
    update();
  }, [tickets, updateTicket]);

  const getStatusColor = (status: TicketStatus) => {
    if (status === TicketStatus.Opened) return 'orange';
    if (status === TicketStatus.Lost) return 'red';
    if (status === TicketStatus.Won) return 'green';
    if (status === TicketStatus.Push) return 'grey';
    return 'white';
  };

  const remove = (ticketNumber: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to delete ticket: ' + ticketNumber))
      removeTicket(ticketNumber);
  };

  return (
    <TableDiv>
      <tbody>
        <tr>
          <th>Status</th>
          <th>Ticket Number</th>
          <th>Bet</th>
          <th>Ticket Cost</th>
          <th>To Pay</th>
          <th>Remove</th>
        </tr>
        {tickets.map(ticket => (
          <tr key={ticket.ticketNumber}>
            <td>
              <CellContent>
                <ResultRow>
                  <Square
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  />
                  {ticket.status}
                </ResultRow>
              </CellContent>
            </td>
            <td>
              <CellContent>{ticket.ticketNumber}</CellContent>
            </td>
            <td>
              <CellContent>
                {ticket.ticketResult?.Selections.map((s: any, i: number) => (
                  <ResultRow key={i}>
                    <Square
                      style={{ backgroundColor: getStatusColor(s.Status) }}
                    />
                    {s.YourBetPrefix + ' : ' + s.Yourbet}
                  </ResultRow>
                )) ?? 'Loading...'}
              </CellContent>
            </td>
            <td>
              <div>{ticket.ticketResult?.TicketCost}</div>
            </td>
            <td>
              <CellContent>{ticket.ticketResult?.ToPay}</CellContent>
            </td>
            <td>
              <CellContent>
                <button onClick={() => remove(ticket.ticketNumber)}>
                  Remove
                </button>
              </CellContent>
            </td>
          </tr>
        ))}
      </tbody>
    </TableDiv>
  );
}

export default TicketTable;
