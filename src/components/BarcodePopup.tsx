import React from "react";
import styled from "styled-components/macro";
import { useUIState } from "../store/uiStore";
import Barcode from "react-jsbarcode";
import { ErrorBoundary } from "./ErrorBoundary";
import { Button } from "../styles/GlobalStyles";
import { useTicketState } from "../store/ticketStore";

const BarcodeDiv = styled.div`
  position: absolute;
  background-color: var(--white);
  color: black;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  z-index: 1000;
`;

const BigBarcode = styled(Barcode)`
  width: 80vw;
  height: 80vw;
  margin-top: -10vw;
`;

const SportsBook = styled.div`
  color: #333;
`;

const Flex = styled.div`
  flex: 1;
`;

const Error = styled.div`
  color: red;
  flex: 1;
  align-content: center;
`;

const ArchiveButton = styled(Button)`
  background: var(--blue);
  color: white;
  padding: 10px 20px;
  border: 2px solid var(--blue);
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 30px;
`;

function BarcodePopup() {
  const viewingBarcode = useUIState((state) => state.viewingBarcode);
  const setViewingBarcode = useUIState((state) => state.setViewingBarcode);
  const archiveTicket = useTicketState((state) => state.archiveTicket);

  const onArchiveTicket = () => {
    if (viewingBarcode) {
      console.log("Archiving ticket", viewingBarcode.ticketNumber);
      archiveTicket(viewingBarcode.ticketNumber);
    }
  };

  const close = () => {
    setViewingBarcode(undefined);
  };

  if (!viewingBarcode) return null;
  return (
    <BarcodeDiv onClick={close}>
      <SportsBook>{viewingBarcode.ticketDetails?.betshopName}</SportsBook>
      <ErrorBoundary errorDisplay={<Error>Barcode error</Error>}>
        <BigBarcode value={viewingBarcode.ticketNumber} options={{ format: "ean13", flat: true }} />
      </ErrorBoundary>
      <Flex />
      {viewingBarcode.archivedDate && <ArchiveButton onClick={close}>Tap anywhere to close</ArchiveButton>}
      {!viewingBarcode.archivedDate && <ArchiveButton onClick={onArchiveTicket}>Archive and Close</ArchiveButton>}
    </BarcodeDiv>
  );
}

export default BarcodePopup;
