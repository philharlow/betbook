import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { isSettled, TicketRecord, TICKETS_KEY, TicketStatus, useTicketState } from '../store/ticketStore';
import { useToastState } from '../store/toastStore';
import { Modal, useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import MenuButton from './MenuButton';
import { localStorageGet, localStorageSet } from '../LocalStorageManager';

const SettingsModalDiv = styled.div`
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

const TopBar = styled.div`
  background-color: var(--grey);
  font-size: var(--topbar-font-size);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  align-items: center;
`;

const Warning = styled.div`
  color: #cdcd24;
  font-size: 10px;
`;

const CloseButton = styled(Button)`
  padding: 10px 14px;
`;

const SettingButton = styled(Button)`
  padding: 10px 20px;
  align-self: center;
`;

function SettingsModal() {
  const navigate = useNavigate();
  const modalOpen = useUIState(state => state.modalOpen);
  const tickets = useTicketState(state => state.tickets);
  const updateTicket = useTicketState(state => state.updateTicket);
  const refreshTickets = useTicketState(state => state.refreshTickets);
  const showToast = useToastState((state) => state.showToast);
  
  const closeModal = () => {
    navigate("/");
  };

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
      const ticket: TicketRecord = {
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
        a.download = `BettBookData-${new Date().toISOString().substring(0, 10) }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 1000);
    }
  }

  if (modalOpen !== Modal.Settings) return null;

  return (
    <SettingsModalDiv>
      <TopBar>
        <MenuButton />
        Settings
        <CloseButton onClick={closeModal}>X</CloseButton>
      </TopBar>
      <Content>
        Manual refesh
        <SettingButton onClick={onRefreshAll}>Refresh All Tickets</SettingButton>
        <SettingButton onClick={onRefreshOpen}>Refresh Open Tickets</SettingButton>
        <hr />
        Import/Export Numbers
        <SettingButton onClick={onImport}>Import ticket numbers</SettingButton>
        <SettingButton onClick={onExport}>Export ticket numbers</SettingButton>
        <hr />
        Import/Export Data
        <Warning>(Warning, importing will overwrite existing data)</Warning>
        <SettingButton onClick={onImportData}>Import ticket data</SettingButton>
        <SettingButton onClick={onExportData}>Export ticket data</SettingButton>
      </Content>
    </SettingsModalDiv>
  );
}

export default SettingsModal;
