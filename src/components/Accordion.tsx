import React, { useState } from 'react';
import styled from 'styled-components/macro';

const AccordionDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  background: #0a0a0a;
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
`;

const TitleLabel = styled.div`
  font-size: 12px;
  color: #666;
  align-self: start;
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
  transition: flex 0.3s ease;
  overflow: hidden;
  flex: 0;
  &.open {
    flex: 1;
  }
`;

interface Props {
  label: string,
  startOpen?: boolean,
  children?: JSX.Element | JSX.Element[];
  dontDrawIfNoChildren?: boolean;
}

function Accordion({ label, startOpen, children, dontDrawIfNoChildren } : Props) {
  const [isOpen, setIsOpen] = useState(startOpen ?? true);

  if (dontDrawIfNoChildren) {
    if (Array.isArray(children) && !children?.length) return null;
    if (!children) return null;
  }

  return (
    <AccordionDiv>
      <Title onClick={() => setIsOpen(!isOpen)}>
        <TitleLabel>{label}</TitleLabel>
        <Arrow className={isOpen ? "open" : ""}>&gt;</Arrow>
      </Title>
      <Content className={isOpen ? "open" : ""}>{children}</Content>
    </AccordionDiv>
  );
}

export default Accordion;
