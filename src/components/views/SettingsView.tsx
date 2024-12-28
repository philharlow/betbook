import React from "react";
import styled from "styled-components/macro";
import {
  computeTicketDetails,
  importTickets,
  LEGACY_TICKETS_ARRAY_KEY,
  sanitizeStrings,
  useTicketState,
} from "../../store/ticketStore";
import { useToastState } from "../../store/toastStore";
import { Button } from "../../styles/GlobalStyles";
import { localStorageGet, localStorageRemove } from "../../LocalStorageManager";
import { isSettled, TicketDb, TICKETS_DB_KEY } from "../../data/ticketTypes";
import { DraftKingsDataV1 } from "../../data/DraftKingsDataV1";
import { LogLevel, useConsoleLogState } from "../../store/consoleLogStore";

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

const SettingButton = styled(Button)<{ danger?: boolean; warning?: boolean }>`
  padding: 10px 20px;
  align-self: center;
  color: ${(props) => (props.danger ? "#e82d2d" : props.warning ? "#cdcd24" : "unset")};
`;

const Stat = styled.div``;

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const LogDiv = styled.div`
  background-color: #222;
  width: 100%;
  font-size: 24px;
  padding: 10px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: center;
  align-items: start;
  overflow-y: auto;
  height: 500px;
`;

const LogRow = styled.div`
  display: flex;
  gap: 5px;
  font-size: 12px;
  color: #777;
`;

const LogMessage = styled.div<{ level: LogLevel }>`
  color: ${(p) => (p.level === LogLevel.Error ? "#e82d2d" : p.level === LogLevel.Warn ? "yellow" : "white")};
  text-align: left;
`;

// Util to download file from data and mime type
const downloadFile = (data: string, type: string, filename: string) => {
  let a = window.document.createElement("a");
  a.href = window.URL.createObjectURL(new Blob([data], { type }));
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

function SettingsView() {
  const tickets = useTicketState((state) => state.tickets);
  const updateTicket = useTicketState((state) => state.updateTicket);
  const refreshTickets = useTicketState((state) => state.refreshTickets);
  const showToast = useToastState((state) => state.showToast);

  const logMessages = useConsoleLogState((state) => state.logMessages);
  const clearLogMessage = useConsoleLogState((state) => state.clearLogMessage);

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
    if (!window.confirm("Importing data will overwrite all local ticket data.\rAre you sure?")) return;
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
    let newTickets = db.tickets ?? [];
    let importedVersion = db.ticketsDbVersion;
    if (importedVersion === undefined) {
      // Legacy import
      importedVersion = "legacy";
      const v1Response = json as DraftKingsDataV1.TicketResponse[];
      newTickets = v1Response.map(DraftKingsDataV1.getTicketDefinition);
    }
    importTickets(newTickets, importedVersion);
  };

  const onExportData = () => {
    let ticketStorage = localStorageGet(TICKETS_DB_KEY);
    // console.log("got ticket data", ticketStorage);
    if (ticketStorage) {
      showToast(`Exporting ${tickets.length} tickets' data`);
      setTimeout(() => {
        downloadFile(
          ticketStorage!,
          "application/json",
          `BetBookData-${new Date().toISOString().substring(0, 10)}.json`
        );
      }, 1000);
    }
  };

  const onEraseData = () => {
    if (window.confirm("Are you sure you want to wipe all local data?\rTHIS CANNOT BE UNDONE")) {
      useTicketState.getState().setTickets([]);
      localStorageRemove(TICKETS_DB_KEY);
      showToast(`Data wiped!`);
    }
  };

  const onEraseLegacyData = () => {
    if (window.confirm("Are you sure you want to wipe all legacy data?\rTHIS CANNOT BE UNDONE")) {
      localStorage.removeItem(LEGACY_TICKETS_ARRAY_KEY);
      showToast(`Data wiped!`);
    }
  };

  const exportLogMessages = () => {
    showToast(`Exporting ${logMessages.length} log messages`);
    setTimeout(() => {
      let log = logMessages
        .map(
          (msg) => `${msg.timestamp.toLocaleTimeString().padStart(11, "0")} ${msg.level.padStart(5)}: ${msg.message}`
        )
        .join("\n");
      downloadFile(log, "text/plain", `BetBookLog-${new Date().toLocaleString()}.txt`);
    }, 1000);
  };

  return (
    <SettingsViewDiv>
      <Content>
        <Group>
          Import/Export Data
          <SettingButton onClick={onExportData}>Export ticket data</SettingButton>
          <SettingButton warning onClick={onImportData}>
            Import ticket data
          </SettingButton>
          <SettingButton danger onClick={onEraseData}>
            Erase all ticket data
          </SettingButton>
          <SettingButton danger onClick={onEraseLegacyData}>
            Erase legacy ticket data
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
          <Row>
            <SettingButton onClick={clearLogMessage}>Clear Log</SettingButton>
            <SettingButton onClick={exportLogMessages}>Export Log</SettingButton>
          </Row>
        </Group>
        <LogDiv>
          {logMessages.map((msg, i) => (
            <LogRow key={i}>
              {i}
              <LogMessage level={msg.level}>{msg.message}</LogMessage>
            </LogRow>
          ))}
        </LogDiv>
      </Content>
    </SettingsViewDiv>
  );
}

export default SettingsView;
