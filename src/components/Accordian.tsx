import React, { useState } from 'react';
import styled from 'styled-components';

const AccordianDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow: hidden;
`;

const Title = styled.div`
  background: #0a0a0a;
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
`;

const Arrow = styled.div`
  font-size: 14px;
  color: #777;
  transform: rotate(-90deg);
  transition: transform 0.2s linear;
  &.open {
    transform: rotate(90deg);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

interface Props {
  label: JSX.Element,
  startOpen?: boolean,
  children?: JSX.Element[];
  dontDrawIfNoChildren: boolean;
}

function Accordian({ label, startOpen, children, dontDrawIfNoChildren } : Props) {
  const [isOpen, setIsOpen] = useState(startOpen ?? true);

  if (dontDrawIfNoChildren && !children?.length) return null;

  return (
    <AccordianDiv>
      <Title onClick={() => setIsOpen(!isOpen)}>
        {label}
        <Arrow className={isOpen ? "open" : ""}>&gt;</Arrow>
      </Title>
      {isOpen && <Content>{children}</Content>}
    </AccordianDiv>
  );
}

export default Accordian;
