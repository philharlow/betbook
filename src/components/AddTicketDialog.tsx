import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  TicketRecord,
  TicketStatus,
  useTicketState,
} from '../store/ticketStore';
import QrScanner from 'qr-scanner';

const AddTicketDiv = styled.div`
  position: absolute;
  background-color: #555;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div``;

const CloseButton = styled.button``;
let listening = false;

function AddTicketDialog() {
  const cameraDialogOpen = useTicketState(state => state.cameraDialogOpen);
  const toggleCameraDialogOpen = useTicketState(
    state => state.toggleCameraDialogOpen,
  );
  const [qrScanner, setQrScanner] = useState<QrScanner>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const updateTicket = useTicketState(state => state.updateTicket);
  const [value, setValue] = useState('');

  const handleChange = (e: any) => {
    const val = e.target.value;
    setValue(val);
  };

  const addTicket = () => {
    if (value) {
      const ticket: TicketRecord = {
        ticketNumber: parseInt(value),
        status: TicketStatus.Stale,
      };
      updateTicket(ticket);
      setValue('');
      toggleCameraDialogOpen();
    }
  };

  useEffect(() => {
    if (!qrScanner && videoRef.current) {
      const handleResult = (url: string) => {
        const ticketNumber = url.split("ticket#")[1];
        if (ticketNumber && listening) {
          console.log('listening false', listening);
          listening = false;
          toggleCameraDialogOpen();
          setValue('');
          
          const ticket: TicketRecord = {
            ticketNumber: parseInt(ticketNumber),
            status: TicketStatus.Stale,
          };
          updateTicket(ticket);
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
      setQrScanner(scanner);
      console.log('scanner2', scanner);
      scanner.start();
      listening = true;
      console.log('listening true', listening);
    }
  }, [cameraDialogOpen, videoRef, qrScanner, toggleCameraDialogOpen, updateTicket]);

  useEffect(() => {
    if (qrScanner && !cameraDialogOpen) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(undefined);
      console.log('qrScanner.stop');
    }
  }, [cameraDialogOpen, videoRef, qrScanner]);

  if (!cameraDialogOpen) return null;

  return (
    <AddTicketDiv>
      <Title>
        Add ticket
        <CloseButton onClick={toggleCameraDialogOpen}>X</CloseButton>
      </Title>
      <div>
        Ticket number:
        <input value={value} onChange={handleChange} type='number' />
      </div>
      <div>
        <button onClick={() => addTicket()}>Add Ticket</button>
      </div>
      <video ref={videoRef} />
    </AddTicketDiv>
  );
}

export default AddTicketDialog;
