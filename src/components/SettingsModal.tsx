import React from 'react';
import styled from 'styled-components/macro';
import { isSettled, TicketRecordOld, TICKETS_KEY, TicketStatus, useTicketState } from '../store/ticketStore';
import { useToastState } from '../store/toastStore';
import { Button } from '../styles/GlobalStyles';
import { localStorageGet, localStorageSet } from '../LocalStorageManager';

const SettingsModalDiv = styled.div`
  background-color: var(--black);
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 15px;
  gap: 25px;
`;

const Warning = styled.div`
  color: #cdcd24;
  font-size: 10px;
`;

const Group = styled.div`
  background-color: #222;
  font-size: 24px;
  padding: 24px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-self: center;
`;

const SettingButton = styled(Button)`
  padding: 10px 20px;
  align-self: center;
`;

function SettingsModal() {
  const tickets = useTicketState(state => state.tickets);
  const updateTicket = useTicketState(state => state.updateTicket);
  const refreshTickets = useTicketState(state => state.refreshTickets);
  const showToast = useToastState((state) => state.showToast);

  const onRefreshAll = () => {
    refreshTickets();
  }

  const onRefreshOpen = () => {
    refreshTickets((ticket) => !isSettled(ticket.status));
  }

  const onImport = () => {
    const ticketNumbersStr = prompt("Enter comma-delimited ticket number list");
    if (!ticketNumbersStr) return;
    const ticketNumbers = ticketNumbersStr.split(",").map((tn) => tn.trim());
    const newTicketNumbers = ticketNumbers.filter((tn) => !tickets.find((t) => t.ticketNumber === tn));
    showToast(`Adding ${newTicketNumbers.length} new tickets`);
    newTicketNumbers.forEach((ticketNumber) => {
      const ticket: TicketRecordOld = {
        ticketNumber,
        sportsbook: "DraftKings",
        status: TicketStatus.Unknown,
        refreshing: true,
      };
      updateTicket(ticket);
    });
  }

  const onExport = () => {
    const ticketNumbers = tickets.map((t) => t.ticketNumber);
    navigator.clipboard.writeText(ticketNumbers.join(", "));
    showToast(`Copied ${tickets.length} ticket numbers to clipboard`);
  }

  const onImportData = () => {
    var input  = window.document.createElement('input') as HTMLInputElement;
    input.type = "file";
    input.id = "input";
    document.body.appendChild(input);
    let handleFiles = async () => {
      try {
        const file = input.files?.item(0)
        if (file) {
          const text = await file.text();
          let json = JSON.parse(text);
          // console.log("got data", json);
          localStorageSet(TICKETS_KEY, JSON.stringify(json));
          showToast(`Imported ${json.length} tickets. Reloading...`);
          setTimeout(() => window.location.reload(), 2000);
        }
      } catch {
        showToast(`Failed to import data! Send to Phil`);
      }
      document.body.removeChild(input);
    }
    input.addEventListener("change", handleFiles, false);
    input.click();
  }

  const onExportData = () => {
    let ticketStorage = localStorageGet(TICKETS_KEY);
    // console.log("got ticket data", ticketStorage);
    if (ticketStorage) {
      showToast(`Exporting ${tickets.length} tickets' data`);
      setTimeout(() => {
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([ticketStorage!], {type: 'application/json'}));
        a.download = `BetBookData-${new Date().toISOString().substring(0, 10) }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 1000);
    }
  }

  return (
    <SettingsModalDiv>
      <Content>
        <Group>
          Manual refesh
          <SettingButton onClick={onRefreshAll}>Refresh All Tickets</SettingButton>
          <SettingButton onClick={onRefreshOpen}>Refresh Open Tickets</SettingButton>
        </Group>
        <Group>
          Import/Export Numbers
          <SettingButton onClick={onImport}>Import ticket numbers</SettingButton>
          <SettingButton onClick={onExport}>Export ticket numbers</SettingButton>
        </Group>
        <Group>
          Import/Export Data
          <Warning>(Warning: Importing will overwrite existing data)</Warning>
          <SettingButton onClick={onImportData}>Import ticket data</SettingButton>
          <SettingButton onClick={onExportData}>Export ticket data</SettingButton>
        </Group>
      </Content>
    </SettingsModalDiv>
  );
}

export default SettingsModal;
