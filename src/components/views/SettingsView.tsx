import React from "react";
import styled from "styled-components/macro";
import { computeTicketDetails, useTicketState } from "../../store/ticketStore";
import { useToastState } from "../../store/toastStore";
import { Button } from "../../styles/GlobalStyles";
import {
  localStorageGet,
  localStorageRemove,
  localStorageSet,
} from "../../LocalStorageManager";
import {
  isSettled,
  TicketDb,
  TicketDbVersion,
  TICKETS_DB_KEY,
} from "../../data/ticketTypes";
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
  /*
  const onImport = () => {
    const ticketNumbersStr = prompt("Enter comma-delimited ticket number list");
    if (!ticketNumbersStr) return;
    const ticketNumbers = ticketNumbersStr.split(",").map((tn) => tn.trim());
    const newTicketNumbers = ticketNumbers.filter((tn) => !tickets.find((t) => t.ticketNumber === tn));
    showToast(`Adding ${newTicketNumbers.length} new tickets`);
    newTicketNumbers.forEach((ticketNumber) => {
      const ticket: TicketDefinition = {
        ticketNumber,
        createdDate: new Date(),
        dataSource: TicketSource.DraftKingsV2,
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
    */

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
    showToast(
      `Imported ${db.tickets.length} tickets from v${dbVersion} data. Reloading...`
    );
    setTimeout(() => window.location.reload(), 2000);
  };

  const onExportData = () => {
    let ticketStorage = localStorageGet(TICKETS_DB_KEY);
    // console.log("got ticket data", ticketStorage);
    if (ticketStorage) {
      showToast(`Exporting ${tickets.length} tickets' data`);
      setTimeout(() => {
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(
          new Blob([ticketStorage!], { type: "application/json" })
        );
        a.download = `BetBookData-${new Date()
          .toISOString()
          .substring(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 1000);
    }
  };

  const onEraseData = () => {
    if (
      window.confirm(
        "Are you sure you want to wipe all local data?\rTHIS CANNOT BE UNDONE"
      )
    ) {
      localStorageRemove(TICKETS_DB_KEY);
      showToast(`Data wiped! Reloading...`);
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <SettingsViewDiv>
      <Content>
        <Group>
          Debug
          <SettingButton onClick={onRefreshAll}>
            Refresh All Tickets
          </SettingButton>
          <SettingButton onClick={onRefreshOpen}>
            Refresh Open Tickets
          </SettingButton>
          <SettingButton onClick={onClearRefreshing}>
            Clear All Refreshish Flags
          </SettingButton>
          <SettingButton onClick={onRecomputeAll}>
            Re-compute All Tickets
          </SettingButton>
        </Group>
        {/* <Group>
          Import/Export Numbers
          <SettingButton onClick={onImport}>Import ticket numbers</SettingButton>
          <SettingButton onClick={onExport}>Export ticket numbers</SettingButton>
        </Group> */}
        <Group>
          Import/Export Data
          <Warning>(Warning: Importing will overwrite existing data)</Warning>
          <SettingButton onClick={onImportData}>
            Import ticket data
          </SettingButton>
          <SettingButton onClick={onExportData}>
            Export ticket data
          </SettingButton>
          <SettingButton danger onClick={onEraseData}>
            Erase all ticket data
          </SettingButton>
        </Group>
        <Stat>{tickets.length} total tickets</Stat>
        <Stat>
          {tickets.filter((t) => t.refreshing).length} refreshing tickets
        </Stat>
      </Content>
    </SettingsViewDiv>
  );
}

// Down here because the type after styled breaks the syntax highlighting
interface SettingsButtonProps {
  danger?: boolean;
}

const SettingButton = styled(Button)<SettingsButtonProps>`
  padding: 10px 20px;
  align-self: center;
  color: ${(props) => (props.danger ? "red" : "unset")};
`;

export default SettingsView;
