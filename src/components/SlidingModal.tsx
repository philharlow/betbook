import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../styles/GlobalStyles';

const easeTime = 500;

const ViewTicketDiv = styled.div`
  position: absolute;
  background-color: var(--black);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  left: 100%;
  transition: left ${easeTime}ms ease;
  &.open {
    left: 0%;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  overflow-y: auto;
`;

const TopBar = styled.div`
  background-color: var(--grey);
  font-size: var(--topbar-font-size);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
`;

const CloseButton = styled(Button)``;

interface Props {
  title: string;
  children: JSX.Element | JSX.Element[];
}

function ViewTicketModal({ title, children } : Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const closeModal = () => {
    setOpen(false);
    setTimeout(() => {
      navigate("/");
    }, easeTime);
  };

  return (
    <ViewTicketDiv className={open ? "open" : ""}>
      <TopBar>
        {title}
        <CloseButton onClick={closeModal}>X</CloseButton>
      </TopBar>
      <Content>
        {children}
      </Content>
    </ViewTicketDiv>
  );
}

export default ViewTicketModal;
