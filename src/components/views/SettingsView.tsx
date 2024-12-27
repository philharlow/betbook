import React from "react";
import styled from "styled-components/macro";
import { computeTicketDetails, sanitizeStrings, useTicketState } from "../../store/ticketStore";
import { useToastState } from "../../store/toastStore";
import { Button } from "../../styles/GlobalStyles";
import { localStorageGet, localStorageRemove, localStorageSet } from "../../LocalStorageManager";
import { isSettled, TicketDb, TicketDbVersion, TICKETS_DB_KEY } from "../../data/ticketTypes";
import { DraftKingsDataV1 } from "../../data/DraftKingsDataV1";

const SettingsViewDiv = styled.div`
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
  align-items: center;
`;

const SettingButton = styled(Button)<{ danger?: boolean }>`
  padding: 10px 20px;
  align-self: center;
  color: ${(props) => (props.danger ? "red" : "unset")};
`;

const Stat = styled.div``;

function SettingsView() {
  const tickets = useTicketState((state) => state.tickets);
  const updateTicket = useTicketState((state) => state.updateTicket);
  const refreshTickets = useTicketState((state) => state.refreshTickets);
  const showToast = useToastState((state) => state.showToast);

  const onRefreshAll = () => {
    refreshTickets();
  };

  const onRefreshOpen = () => {
    refreshTickets((ticket) => !isSettled(ticket.ticketDetails?.status));
  };

  const onClearRefreshing = () => {
    tickets.forEach((ticket) => {
      if (ticket.refreshing) {
        ticket.refreshing = false;
        updateTicket(ticket);
      }
    });
  };

  const onRecomputeAll = () => {
    tickets.forEach((ticket) => {
      computeTicketDetails(ticket);
      updateTicket(ticket);
    });
  };

  const onImportData = () => {
    var input = window.document.createElement("input") as HTMLInputElement;
    input.type = "file";
    input.id = "input";
    document.body.appendChild(input);
    let handleFiles = async () => {
      try {
        const file = input.files?.item(0);
        if (file) {
          parseFile(file);
        }
      } catch {
        showToast(`Failed to import data! Send to Phil`);
      }
      document.body.removeChild(input);
    };
    input.addEventListener("change", handleFiles, false);
    input.click();
  };

  const parseFile = async (file: File) => {
    const text = await file.text();
    let json = JSON.parse(text);
    sanitizeStrings(json);

    // Check if the file is a db or a ticket list
    let db = json as TicketDb;
    let dbVersion = db.ticketsDbVersion;
    if (dbVersion === undefined) {
      // Legacy import
      dbVersion = 1;
      const tickets = json as DraftKingsDataV1.TicketResponse[];
      db = {
        ticketsDbVersion: TicketDbVersion,
        tickets: tickets.map(DraftKingsDataV1.getTicketDefinition),
      };
    }
    localStorageSet(TICKETS_DB_KEY, JSON.stringify(db));
    showToast(`Imported ${db.tickets.length} tickets from v${dbVersion} data. Refreshing...`);
    setTimeout(() => window.location.reload(), 1000);
  };

  const onExportData = () => {
    let ticketStorage = localStorageGet(TICKETS_DB_KEY);
    // console.log("got ticket data", ticketStorage);
    if (ticketStorage) {
      showToast(`Exporting ${tickets.length} tickets' data`);
      setTimeout(() => {
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(new Blob([ticketStorage!], { type: "application/json" }));
        a.download = `BetBookData-${new Date().toISOString().substring(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 1000);
    }
  };

  const onEraseData = () => {
    if (window.confirm("Are you sure you want to wipe all local data?\rTHIS CANNOT BE UNDONE")) {
      localStorageRemove(TICKETS_DB_KEY);
      showToast(`Data wiped! Reloading...`);
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <SettingsViewDiv>
      <Content>
        <Group>
          Import/Export Data
          <Warning>(Warning: Importing will overwrite existing data)</Warning>
          <SettingButton onClick={onImportData}>Import ticket data</SettingButton>
          <SettingButton onClick={onExportData}>Export ticket data</SettingButton>
          <SettingButton danger onClick={onEraseData}>
            Erase all ticket data
          </SettingButton>
        </Group>
        <Stat>{tickets.length} total tickets</Stat>
        <Stat>{tickets.filter((t) => t.refreshing).length} refreshing tickets</Stat>
        <Group>
          Debug
          <SettingButton onClick={onRefreshAll}>Refresh All Tickets</SettingButton>
          <SettingButton onClick={onRefreshOpen}>Refresh Open Tickets</SettingButton>
          <SettingButton onClick={onClearRefreshing}>Clear All Refreshing Flags</SettingButton>
          <SettingButton onClick={onRecomputeAll}>Re-compute All Tickets</SettingButton>
        </Group>
      </Content>
    </SettingsViewDiv>
  );
}

export default SettingsView;
