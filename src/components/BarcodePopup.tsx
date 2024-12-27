import React from "react";
import styled from "styled-components/macro";
import { useUIState } from "../store/uiStore";
import Barcode from "react-jsbarcode";
import { ErrorBoundary } from "./ErrorBoundary";

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

const CloseMessage = styled.div`
  color: #333;
  padding-bottom: 10px;
`;

const Flex = styled.div`
  flex: 1;
`;

const Error = styled.div`
  color: red;
  flex: 1;
  align-content: center;
`;

function BarcodePopup() {
  const viewingBarcode = useUIState((state) => state.viewingBarcode);
  const setViewingBarcode = useUIState((state) => state.setViewingBarcode);

  if (!viewingBarcode) return null;
  return (
    <BarcodeDiv onClick={() => setViewingBarcode(undefined)}>
      <SportsBook>{viewingBarcode.ticketDetails?.betshopName}</SportsBook>
      <ErrorBoundary errorDisplay={<Error>Barcode error</Error>}>
        <BigBarcode value={viewingBarcode.ticketNumber} options={{ format: "ean13", flat: true }} />
      </ErrorBoundary>
      <Flex />
      <CloseMessage>Tap anywhere to close</CloseMessage>
    </BarcodeDiv>
  );
}

export default BarcodePopup;
