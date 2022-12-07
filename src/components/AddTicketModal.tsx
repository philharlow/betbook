import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import {
  fetchUpdatedTicket,
  TicketRecord,
  TicketStatus,
  useTicketState,
} from '../store/ticketStore';
import QrScanner from 'qr-scanner';
import { useUIState } from '../store/uiStore';
import { Button } from '../styles/GlobalStyles';
import { useToastState } from '../store/toastStore';

const AddTicketDiv = styled.div`
  position: absolute;
  background-color: var(--black);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
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

const VideoContainer = styled.div`
  max-width: 1280px;
  width: 100%;
  position: relative;
`;

const NotSecureWarning = styled.div`
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
  background: #dcdc5777;
  color: #000;
`;

const CameraLoading = styled.div`
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
  color: #fff;
  text-align: center;
`;

const VideoView = styled.video`
  width: 100%;
`;

const TicketEntry = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const CloseButton = styled(Button)`
  padding: 10px 14px;
`;

const AddTicketButton = styled(Button)`
  font-size: 20px;
`;

const NumberInput = styled.input`
  font-size: 20px;
  border-radius: 10px;
`;

let listening = false;
let qrScanner: QrScanner | undefined;

function AddTicketModal() {
  const addTicketModalOpen = useUIState(state => state.addTicketModalOpen);
  const tickets = useTicketState(state => state.tickets);
  const toggleAddTicketModalOpen = useUIState(state => state.toggleAddTicketModalOpen);
  const videoRef = useRef<HTMLVideoElement>(null);
  const updateTicket = useTicketState(state => state.updateTicket);
  const showToast = useToastState(state => state.showToast);
  const [value, setValue] = useState('');
  const [isSecure, setIsSecure] = useState(false);

  const handleChange = (e: any) => {
    const val = e.target.value;
    setValue(val);
  };

  const closeModal = useCallback(() => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      qrScanner = undefined;
      console.log('qrScanner.stop');
    }
    if (addTicketModalOpen) {
      setValue('');
      toggleAddTicketModalOpen();
    }
  }, [addTicketModalOpen, toggleAddTicketModalOpen]);

  const addTicket = useCallback((ticketNumber: string) => {
    const asNumber = parseInt(ticketNumber);
    if (asNumber && !isNaN(asNumber)) {
      setValue(ticketNumber);
      if (tickets.find((ticket) => ticket.ticketNumber === ticketNumber)) showToast("Ticket already added");
      else showToast("Ticket added!");

      const ticket: TicketRecord = {
        ticketNumber,
        sportsbook: "draftkings",
        status: TicketStatus.Unknown,
        refreshing: true,
      };
      updateTicket(ticket);

      fetchUpdatedTicket(ticket);
      
      closeModal();
    } else {
      showToast("Ticket number invalid");
    }
  }, [closeModal, updateTicket, tickets, showToast]);

  useEffect(() => {
    if (!qrScanner && videoRef.current) {
      const handleResult = (url: string) => {
        const ticketNumber = url.split("ticket#")[1];
        if (ticketNumber && listening) {
          console.log('listening false', listening);
          listening = false;
          // Show the qr code outline for a smidge
          setTimeout(() => addTicket(ticketNumber), 100);
        }
      }

      const scanner = new QrScanner(
        videoRef.current,
        result => handleResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );
      qrScanner = scanner;
      console.log('created scanner', scanner);
      scanner.start();
      listening = true;
    }
  }, [videoRef, addTicket]);

  useEffect(() => {
    const secure = window.location.protocol === "https:";
    setIsSecure(secure);
  }, []);

  if (!addTicketModalOpen) return null;

  return (
    <AddTicketDiv>
      <TopBar>
        Add Ticket
        <CloseButton onClick={closeModal}>X</CloseButton>
      </TopBar>
      <TicketEntry>
        <NumberInput value={value} placeholder="Enter ticket number" onChange={handleChange} type='text' />
        <AddTicketButton disabled={value.length === 0} onClick={() => addTicket(value)}>Add Ticket</AddTicketButton>
      </TicketEntry>
      or scan QR code
      <VideoContainer>
        <CameraLoading>Camera loading...</CameraLoading>
        <VideoView ref={videoRef} disablePictureInPicture playsInline />
        {!isSecure && <NotSecureWarning>QR code reading disabled on http!</NotSecureWarning>}
      </VideoContainer>
    </AddTicketDiv>
  );
}

export default AddTicketModal;
