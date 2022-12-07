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
    align-items: center;
    justify-content: center;
`;

const BigBarcode = styled(Barcode)`
width: 80%;
height: 80%;
`;


function BarcodePopup() {
  const viewingBarcode = useUIState(state => state.viewingBarcode);
  const setViewingBarcode = useUIState(state => state.setViewingBarcode);

  if (!viewingBarcode) return null;
  return (
    <BarcodePopupDiv onClick={() => setViewingBarcode(undefined)}>
      <BarcodeDiv>
        <BigBarcode value={viewingBarcode} options={{ displayValue: false, format: 'ean13', flat: true }} />
      </BarcodeDiv>
    </BarcodePopupDiv>
  );
}

export default BarcodePopup;
