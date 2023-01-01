import React from 'react';
import styled from 'styled-components/macro';
import { useUIState } from '../store/uiStore';
import Barcode from 'react-jsbarcode';

const BarcodePopupDiv = styled.div`
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

const BarcodeDiv = styled.div`
  position: absolute;
  background-color: var(--white);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
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


function BarcodePopup() {
  const viewingBarcode = useUIState(state => state.viewingBarcode);
  const setViewingBarcode = useUIState(state => state.setViewingBarcode);

  if (!viewingBarcode) return null;
  return (
    <BarcodePopupDiv onClick={() => setViewingBarcode(undefined)}>
      <BarcodeDiv>
        <SportsBook>{viewingBarcode.ticketResult?.BetShopName}</SportsBook>
        <BigBarcode value={viewingBarcode.ticketNumber} options={{ format: 'ean13', flat: true }} />
        <Flex />
        <CloseMessage>Tap anywhere to close</CloseMessage>
      </BarcodeDiv>
    </BarcodePopupDiv>
  );
}

export default BarcodePopup;
